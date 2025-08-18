/**
 * REST API server for Throp bot
 * Provides endpoints for web interface integration
 */
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger.js';
import { getConfig } from '../config.js';
import { TwitterClient } from '../twitter/client.js';
// import { createPerplexityChaosEngine } from '../engines/perplexity-chaos.js'; // Unused
import { createHybridClaudeEngine } from '../engines/hybrid-claude.js';
import { createTweetRoutes } from './tweet-endpoints.js';
import { RedisCache } from '../cache/redis.js';
import { handleHotTakes } from './hot-takes-endpoint.js';
/**
 * Create and configure the API server
 */
export class ApiServer {
    app;
    server;
    io;
    port;
    twitterClient = null;
    answerEngine;
    cache;
    startTime;
    mentionPollingInterval = null;
    processedMentions = new Set();
    lastMentionId;
    constructor(port = 3001) {
        this.port = port;
        this.app = express();
        this.server = createServer(this.app);
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
            },
        });
        this.startTime = new Date();
        // Initialize services with error handling
        // Only initialize Twitter client if not in API-only mode
        const isApiOnly = process.env.API_ONLY_MODE === 'true';
        if (!isApiOnly) {
            try {
                this.twitterClient = new TwitterClient();
                logger.info('Twitter client initialized successfully');
            }
            catch (error) {
                logger.warn('Twitter client initialization failed - Twitter features disabled', error);
            }
        }
        else {
            logger.info('API-only mode - Twitter client not initialized');
        }
        // Try to initialize answer engine, but don't crash if it fails
        try {
            this.answerEngine = createHybridClaudeEngine();
            logger.info('Answer engine initialized successfully');
        }
        catch (error) {
            logger.error('Answer engine initialization failed - chat features disabled', error);
            this.answerEngine = null; // Will handle null checks in routes
        }
        // Initialize cache with error handling
        try {
            this.cache = new RedisCache();
        }
        catch (error) {
            logger.warn('Redis cache initialization failed - caching disabled', error);
            this.cache = null;
        }
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
    }
    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        // CORS configuration - allow multiple origins
        const allowedOrigins = [
            'http://localhost:3000',
            'https://throp.vercel.app',
            'https://chat.throp.ai',
            process.env.FRONTEND_URL
        ].filter(Boolean);
        this.app.use(cors({
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps or curl)
                if (!origin)
                    return callback(null, true);
                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                }
                else {
                    callback(null, true); // Allow all origins for now
                }
            },
            credentials: true,
        }));
        // Body parsing
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        // Request logging
        this.app.use((req, _res, next) => {
            logger.debug(`${req.method} ${req.path}`, {
                query: req.query,
                body: req.body,
            });
            next();
        });
        // Error handling
        this.app.use((err, _req, res, _next) => {
            logger.error('API error', err);
            res.status(500).json({
                success: false,
                error: err.message || 'Internal server error',
            });
        });
    }
    /**
     * Setup API routes
     */
    setupRoutes() {
        // Mount tweet routes
        this.app.use('/api/tweet', createTweetRoutes());
        // Root endpoint - simple response
        this.app.get('/', (_req, res) => {
            res.json({
                service: 'throp-api',
                status: 'running',
                health: '/health',
                docs: 'https://github.com/abracadabra50/throp'
            });
        });
        // Health check (required for Railway deployment)
        this.app.get('/health', (_req, res) => {
            const health = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                service: 'throp-api',
                version: process.env.npm_package_version || '0.2.1',
                environment: process.env.NODE_ENV || 'development',
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                    unit: 'MB'
                },
                redis: this.cache ? 'connected' : 'not configured',
                twitter: this.twitterClient ? 'initialized' : 'not configured',
                answerEngine: this.answerEngine ? 'ready' : 'not configured',
            };
            // Always return 200 for Railway health checks
            // The app is "healthy" even if some services are still initializing
            res.status(200).json(health);
        });
        // Bot status
        this.app.get('/api/status', async (_req, res) => {
            try {
                const status = await this.getStatus();
                res.json(status);
            }
            catch (error) {
                res.status(500).json({
                    status: 'error',
                    error: error.message,
                });
            }
        });
        // Chat endpoint for web interface
        // Hot takes endpoint - generates trending topics with hot takes
        this.app.get('/api/hot-takes', async (req, res) => {
            if (!this.answerEngine) {
                res.status(503).json({
                    success: false,
                    error: 'Answer engine not available',
                });
                return;
            }
            await handleHotTakes(req, res, this.answerEngine);
        });
        // Chat endpoint - main API for web interface
        this.app.post('/api/chat', async (req, res) => {
            try {
                const { message, context } = req.body;
                if (!message) {
                    res.status(400).json({
                        success: false,
                        error: 'Message is required',
                    });
                    return;
                }
                // Check if answer engine is available
                if (!this.answerEngine) {
                    res.status(503).json({
                        success: false,
                        error: 'Chat service is temporarily unavailable. Please check API keys are configured.',
                    });
                    return;
                }
                logger.info('Processing chat request', {
                    messageLength: message.length,
                    hasContext: !!context,
                });
                // Build answer context
                const answerContext = {
                    question: message,
                    author: {
                        username: context?.username || 'web_user',
                        name: context?.username || 'Web User',
                    },
                };
                // Add conversation history if provided
                if (context?.conversationHistory?.length) {
                    answerContext.conversation = {
                        previousTweets: context.conversationHistory.map((msg, idx) => ({
                            text: msg.content,
                            author: msg.role === 'user' ? 'user' : 'throp',
                            timestamp: new Date(Date.now() - (idx * 60000)), // Fake timestamps
                        })),
                    };
                }
                // Generate response using Hybrid Engine (Perplexity facts + Claude personality)
                const response = await this.answerEngine.generateResponse(answerContext);
                // Cache the interaction
                await this.cache.cacheInteraction(message, response.text);
                // Emit to WebSocket clients
                this.io.emit('new_response', {
                    question: message,
                    response: response.text,
                    timestamp: new Date().toISOString(),
                });
                res.json({
                    success: true,
                    response: response.text,
                    citations: response.citations,
                    threadParts: response.threadParts,
                    metadata: response.metadata,
                });
            }
            catch (error) {
                logger.error('Chat request failed', error);
                res.status(500).json({
                    success: false,
                    error: error.message,
                });
            }
        });
        // Get recent mentions (for dashboard)
        this.app.get('/api/mentions', async (req, res) => {
            try {
                if (!this.twitterClient) {
                    logger.error('Twitter client is null');
                    return res.status(503).json({
                        success: false,
                        error: 'Twitter functionality not available in API-only mode',
                    });
                }
                logger.info('Fetching mentions via API endpoint...');
                // Get mentions using the proper Twitter API with Bearer Token
                const limit = parseInt(req.query.limit) || 10;
                const mentions = await this.twitterClient.getMentions(undefined, limit);
                return res.json({
                    success: true,
                    mentions: mentions.map(m => ({
                        id: m.id,
                        text: m.text,
                        author: m.authorUsername,
                        createdAt: m.createdAt,
                        processed: m.processed,
                        response: m.response,
                    })),
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    error: error.message,
                });
            }
        });
        // Manual trigger for mention polling (for debugging)
        this.app.post('/api/mentions/trigger', async (_req, res) => {
            try {
                if (!this.twitterClient) {
                    return res.status(503).json({
                        success: false,
                        error: 'Twitter client not initialized',
                    });
                }
                logger.info('Manually triggering mention check...');
                await this.checkAndProcessMentions();
                return res.json({
                    success: true,
                    message: 'Mention check triggered',
                    stats: {
                        processed: this.processedMentions.size,
                        lastId: this.lastMentionId,
                    },
                });
            }
            catch (error) {
                logger.error('Manual mention check failed', error);
                return res.status(500).json({
                    success: false,
                    error: error.message,
                });
            }
        });
        // Process a specific mention
        this.app.post('/api/mentions/:id/process', async (req, res) => {
            try {
                if (!this.twitterClient) {
                    return res.status(503).json({
                        success: false,
                        error: 'Twitter functionality not available in API-only mode',
                    });
                }
                const { id } = req.params;
                const { dryRun = false } = req.body;
                logger.info(`Processing mention ${id}`, { dryRun });
                // Get the tweet
                const tweet = await this.twitterClient.getTweet(id);
                // Build context
                const context = {
                    question: tweet.text,
                    author: {
                        username: 'twitter_user',
                    },
                };
                // Generate response
                const response = await this.answerEngine.generateResponse(context);
                // Post reply if not dry run
                let replyId;
                if (!dryRun) {
                    const reply = await this.twitterClient.reply(response.text, id);
                    replyId = reply.id;
                }
                return res.json({
                    success: true,
                    response: response.text,
                    replyId,
                    dryRun,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    error: error.message,
                });
            }
        });
        // Get cached interactions
        this.app.get('/api/cache/interactions', async (req, res) => {
            try {
                const limit = parseInt(req.query.limit) || 100;
                const interactions = await this.cache.getRecentInteractions(limit);
                res.json({
                    success: true,
                    interactions,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                });
            }
        });
        // Clear cache
        this.app.post('/api/cache/clear', async (_req, res) => {
            try {
                await this.cache.clear();
                res.json({
                    success: true,
                    message: 'Cache cleared successfully',
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                });
            }
        });
        // Twitter diagnostics endpoint - simplified to avoid hanging
        this.app.get('/api/twitter/diagnostics', async (_req, res) => {
            try {
                const config = getConfig();
                const hasApiKey = !!config.twitter?.apiKey;
                const hasApiSecret = !!config.twitter?.apiSecretKey;
                const hasAccessToken = !!config.twitter?.accessToken;
                const hasAccessSecret = !!config.twitter?.accessTokenSecret;
                const hasBearerToken = !!config.twitter?.bearerToken;
                const hasBotUserId = !!config.twitter?.botUserId;
                // Don't test actual API calls - just check configuration
                const canWrite = hasApiKey && hasApiSecret && hasAccessToken && hasAccessSecret;
                const canRead = hasBearerToken && hasBotUserId;
                // Get initialization details
                const initializationDetails = {
                    hasOAuth1Client: hasApiKey && hasAccessToken,
                    hasBearerClient: hasBearerToken,
                    clientMode: (hasApiKey && hasAccessToken) ? 'OAuth 1.0a' : hasBearerToken ? 'Bearer Token Only' : 'None',
                };
                res.json({
                    success: true,
                    oauth1: {
                        hasApiKey,
                        hasApiSecret,
                        hasAccessToken,
                        hasAccessSecret,
                        apiKeyLength: config.twitter?.apiKey?.length || 0,
                        accessTokenLength: config.twitter?.accessToken?.length || 0,
                        configured: hasApiKey && hasApiSecret && hasAccessToken && hasAccessSecret,
                    },
                    oauth2: {
                        hasBearerToken,
                        hasBotUserId,
                        bearerTokenLength: config.twitter?.bearerToken?.length || 0,
                        botUserId: config.twitter?.botUserId,
                        configured: hasBearerToken && hasBotUserId,
                    },
                    capabilities: {
                        canRead,
                        canWrite,
                        clientInitialized: !!this.twitterClient,
                    },
                    initialization: initializationDetails,
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                });
            }
        });
        // Check raw environment variables (for debugging)
        this.app.get('/api/env-check', (_req, res) => {
            res.json({
                hasApiKey: !!process.env.TWITTER_API_KEY,
                hasApiSecret: !!process.env.TWITTER_API_SECRET_KEY,
                hasAccessToken: !!process.env.TWITTER_ACCESS_TOKEN,
                hasAccessSecret: !!process.env.TWITTER_ACCESS_TOKEN_SECRET,
                hasBearerToken: !!process.env.TWITTER_BEARER_TOKEN,
                hasBotUserId: !!process.env.TWITTER_BOT_USER_ID,
                apiKeyLength: process.env.TWITTER_API_KEY?.length || 0,
                accessTokenLength: process.env.TWITTER_ACCESS_TOKEN?.length || 0,
                // Show first 5 chars of each (safe to debug)
                apiKeyPrefix: process.env.TWITTER_API_KEY?.substring(0, 5) || 'NOT_SET',
                accessTokenPrefix: process.env.TWITTER_ACCESS_TOKEN?.substring(0, 5) || 'NOT_SET',
            });
        });
        // Twitter test tweet endpoint (for debugging OAuth 1.0a)
        this.app.post('/api/twitter/test-tweet', async (req, res) => {
            try {
                if (!this.twitterClient) {
                    res.status(500).json({
                        success: false,
                        error: 'Twitter client not initialized',
                    });
                    return;
                }
                const { testMode = true } = req.body;
                if (testMode) {
                    // Just check if we COULD tweet
                    const config = getConfig();
                    const canTweet = !!(config.twitter?.apiKey &&
                        config.twitter?.apiSecretKey &&
                        config.twitter?.accessToken &&
                        config.twitter?.accessTokenSecret);
                    res.json({
                        success: true,
                        testMode: true,
                        canTweet,
                        message: canTweet ?
                            'OAuth 1.0a is configured, bot should be able to tweet' :
                            'OAuth 1.0a not fully configured, cannot tweet',
                    });
                    return;
                }
                // Actually post a test tweet (only if explicitly requested)
                const timestamp = Date.now();
                const tweet = await this.twitterClient.tweet(`Test tweet from Throp bot - ${timestamp}`);
                res.json({
                    success: true,
                    testMode: false,
                    tweetId: tweet.id,
                    message: 'Test tweet posted successfully!',
                });
            }
            catch (error) {
                logger.error('Test tweet failed', error);
                res.status(500).json({
                    success: false,
                    error: error.message,
                });
            }
        });
    }
    /**
     * Setup WebSocket for real-time updates
     */
    setupWebSocket() {
        this.io.on('connection', (socket) => {
            logger.info('WebSocket client connected', { id: socket.id });
            // Send initial status
            this.getStatus().then(status => {
                socket.emit('status', status);
            });
            // Handle chat messages via WebSocket
            socket.on('chat', async (data) => {
                try {
                    const context = {
                        question: data.message,
                        author: {
                            username: data.context?.username || 'socket_user',
                        },
                    };
                    const response = await this.answerEngine.generateResponse(context);
                    socket.emit('response', {
                        success: true,
                        response: response.text,
                        citations: response.citations,
                    });
                    // Broadcast to other clients
                    socket.broadcast.emit('new_response', {
                        question: data.message,
                        response: response.text,
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (error) {
                    socket.emit('error', {
                        message: error.message,
                    });
                }
            });
            socket.on('disconnect', () => {
                logger.info('WebSocket client disconnected', { id: socket.id });
            });
        });
    }
    /**
     * Get server status
     */
    async getStatus() {
        const config = getConfig();
        const uptime = Date.now() - this.startTime.getTime();
        // Check Twitter connection
        let twitterConnected = false;
        let rateLimitRemaining;
        if (this.twitterClient) {
            try {
                const rateLimits = this.twitterClient.getRateLimitStatus();
                twitterConnected = true;
                rateLimitRemaining = rateLimits.get('mentions')?.remaining;
            }
            catch (error) {
                logger.debug('Twitter status check failed', error);
            }
        }
        // Check Perplexity connection
        let perplexityConnected = false;
        try {
            await this.answerEngine.validate();
            perplexityConnected = true;
        }
        catch (error) {
            logger.debug('Perplexity status check failed', error);
        }
        // Check Redis connection
        const redisConnected = await this.cache.isConnected();
        // Get stats from cache
        const stats = await this.cache.getStats();
        return {
            status: 'online',
            version: '0.2.0',
            twitter: {
                connected: twitterConnected,
                username: config.twitter.botUsername,
                rateLimitRemaining,
            },
            perplexity: {
                connected: perplexityConnected,
                model: config.perplexity.model,
            },
            redis: {
                connected: redisConnected,
            },
            stats: {
                ...stats,
                uptime,
            },
        };
    }
    /**
     * Start the API server
     */
    async start() {
        // Try to connect services but don't fail if they're unavailable
        if (this.cache) {
            try {
                await this.cache.connect();
                logger.info('Redis cache connected');
                // Load processed mentions from cache
                await this.loadProcessedMentions();
            }
            catch (error) {
                logger.warn('Redis cache connection failed - caching disabled', error);
            }
        }
        if (this.answerEngine) {
            try {
                await this.answerEngine.validate();
                logger.info('Answer engine validated');
            }
            catch (error) {
                logger.warn('Answer engine validation failed - some features may be unavailable', error);
            }
        }
        // Start server - this should always work
        this.server.listen(this.port, () => {
            logger.success(`API server started on port ${this.port}`);
            logger.info(`WebSocket server available at ws://localhost:${this.port}`);
            logger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
            // Start polling for mentions if Twitter is configured and enabled
            const enablePolling = process.env.ENABLE_MENTION_POLLING !== 'false';
            const apiOnlyMode = process.env.API_ONLY_MODE === 'true';
            if (this.twitterClient && !apiOnlyMode && enablePolling) {
                // Start polling even without Redis (will use in-memory tracking)
                logger.info('Starting mention polling (Redis optional for persistence)');
                this.startMentionPolling();
            }
            else {
                logger.info('Mention polling disabled', {
                    hasTwitter: !!this.twitterClient,
                    apiOnlyMode,
                    enablePolling
                });
            }
        });
    }
    /**
     * Start polling for Twitter mentions
     */
    startMentionPolling() {
        const config = getConfig();
        // Use environment variable or default based on API plan
        const defaultInterval = config.twitter.apiPlan === 'pro' ? 30000 : 60000;
        const pollInterval = parseInt(process.env.MENTION_POLL_INTERVAL || String(defaultInterval));
        logger.info(`Starting mention polling every ${pollInterval / 1000} seconds (${config.twitter.apiPlan} plan)`);
        // Initial check
        this.checkAndProcessMentions();
        // Set up interval
        this.mentionPollingInterval = setInterval(() => {
            this.checkAndProcessMentions();
        }, pollInterval);
    }
    /**
     * Check for new mentions and process them
     */
    async checkAndProcessMentions() {
        if (!this.twitterClient || !this.answerEngine) {
            logger.debug('Skipping mention check - services not available');
            return;
        }
        try {
            logger.debug('Checking for new mentions...');
            // Get mentions since the last one we processed
            const mentions = await this.twitterClient.getMentions(this.lastMentionId, 20);
            if (mentions.length === 0) {
                logger.debug('No new mentions found');
                return;
            }
            logger.info(`Found ${mentions.length} mentions to process`);
            // Process each mention
            for (const mention of mentions) {
                // Skip if already processed
                if (this.processedMentions.has(mention.id)) {
                    logger.debug(`Skipping already processed mention ${mention.id}`);
                    continue;
                }
                try {
                    logger.info(`Processing mention from @${mention.authorUsername}: "${mention.text.substring(0, 50)}..."`);
                    // Generate response using the hybrid engine
                    const answerContext = {
                        question: mention.text,
                        author: {
                            username: mention.authorUsername || 'unknown',
                        },
                    };
                    const engineResponse = await this.answerEngine.generateResponse(answerContext);
                    // Reply to the tweet
                    await this.twitterClient.reply(engineResponse.text, mention.id);
                    // Mark as processed
                    this.processedMentions.add(mention.id);
                    // Update last mention ID
                    if (!this.lastMentionId || mention.id > this.lastMentionId) {
                        this.lastMentionId = mention.id;
                    }
                    // Save to cache if available
                    if (this.cache) {
                        await this.saveProcessedMentions();
                    }
                    logger.success(`Replied to mention ${mention.id} from @${mention.authorUsername}`);
                    // Small delay between replies to avoid rate limits
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
                catch (error) {
                    logger.error(`Failed to process mention ${mention.id}`, error);
                }
            }
        }
        catch (error) {
            logger.error('Failed to check mentions', error);
        }
    }
    /**
     * Load processed mentions from cache
     */
    async loadProcessedMentions() {
        if (!this.cache) {
            logger.info('Redis not available - using in-memory mention tracking');
            return;
        }
        try {
            const cached = await this.cache.get('throp:processed_mentions');
            if (cached) {
                const data = JSON.parse(cached);
                this.processedMentions = new Set(data.mentions || []);
                this.lastMentionId = data.lastId;
                logger.info(`Loaded ${this.processedMentions.size} processed mentions from cache`);
            }
        }
        catch (error) {
            logger.warn('Failed to load processed mentions from cache', error);
        }
    }
    /**
     * Save processed mentions to cache
     */
    async saveProcessedMentions() {
        if (!this.cache)
            return;
        try {
            // Keep only last 1000 processed IDs
            const mentionArray = Array.from(this.processedMentions).slice(-1000);
            await this.cache.set('throp:processed_mentions', JSON.stringify({
                mentions: mentionArray,
                lastId: this.lastMentionId,
            }), 7 * 24 * 60 * 60); // 7 days TTL
        }
        catch (error) {
            logger.warn('Failed to save processed mentions to cache', error);
        }
    }
    /**
     * Stop the API server
     */
    async stop() {
        // Stop mention polling
        if (this.mentionPollingInterval) {
            clearInterval(this.mentionPollingInterval);
            this.mentionPollingInterval = null;
            logger.info('Stopped mention polling');
        }
        // Save processed mentions before shutting down
        if (this.cache) {
            await this.saveProcessedMentions();
        }
        return new Promise((resolve) => {
            this.io.close();
            this.server.close(() => {
                logger.info('API server stopped');
                resolve();
            });
        });
    }
}
/**
 * Create and export API server instance
 */
export function createApiServer(port) {
    return new ApiServer(port);
}
//# sourceMappingURL=server.js.map