/**
 * Twitter API client wrapper with rate limiting and retry logic
 * Provides a robust interface to Twitter API v2
 */
import { TwitterApi } from 'twitter-api-v2';
import pRetry from 'p-retry';
import pThrottle from 'p-throttle';
import { logger } from '../utils/logger.js';
import { getConfig, calculateRequestDelay } from '../config.js';
/**
 * Custom error class for Twitter API errors
 */
export class TwitterApiError extends Error {
    code;
    rateLimit;
    constructor(message, code, rateLimit) {
        super(message);
        this.code = code;
        this.rateLimit = rateLimit;
        this.name = 'TwitterApiError';
    }
}
/**
 * Twitter client with rate limiting and retry capabilities
 */
export class TwitterClient {
    client;
    readClient; // Separate client for reading (uses Bearer Token if available)
    v2Client;
    config = getConfig();
    rateLimits = new Map();
    throttle;
    constructor() {
        // Initialize Twitter client - we need BOTH OAuth methods:
        // - OAuth 1.0a for WRITING (posting tweets, replies)
        // - Bearer Token for READING (better rate limits for mentions)
        const bearerToken = this.config.twitter.bearerToken || process.env.TWITTER_BEARER_TOKEN;
        logger.info('Twitter client initialization:', {
            hasBearerToken: !!bearerToken,
            hasOAuth1: !!(this.config.twitter.apiKey && this.config.twitter.accessToken),
            hasBotUserId: !!this.config.twitter.botUserId,
            botUserId: this.config.twitter.botUserId || 'NOT SET',
        });
        // Initialize OAuth 1.0a client for POSTING (required for write operations)
        if (this.config.twitter.apiKey && this.config.twitter.accessToken) {
            this.client = new TwitterApi({
                appKey: this.config.twitter.apiKey,
                appSecret: this.config.twitter.apiSecretKey,
                accessToken: this.config.twitter.accessToken,
                accessSecret: this.config.twitter.accessTokenSecret,
            });
            logger.info('✅ OAuth 1.0a client initialized for posting tweets');
        }
        else if (bearerToken) {
            // Fallback to Bearer Token only (read-only mode)
            this.client = new TwitterApi(bearerToken);
            logger.warn('⚠️ Bearer Token ONLY mode - posting tweets will NOT work!');
        }
        else {
            throw new Error('No Twitter authentication configured');
        }
        // Initialize Bearer Token client for READING if available (better rate limits)
        if (bearerToken) {
            try {
                // URL decode the bearer token (Twitter API returns URL-encoded tokens)
                const decodedBearerToken = decodeURIComponent(bearerToken);
                logger.info('Bearer token URL-decoded for HTTP headers');
                this.readClient = new TwitterApi(decodedBearerToken);
                logger.info('✅ Bearer Token client initialized for reading mentions (URL-decoded)');
            }
            catch (error) {
                logger.error('Failed to initialize Bearer Token client:', error);
                // Fallback to OAuth 1.0a client for reading
                this.readClient = this.client;
                logger.info('Using OAuth 1.0a client for reading (Bearer Token failed)');
            }
        }
        else {
            // Fallback to OAuth 1.0a client for reading
            this.readClient = this.client;
            logger.info('Using OAuth 1.0a client for reading (no Bearer Token)');
        }
        this.v2Client = this.client.v2;
        // Set up rate limiting based on API plan
        const delay = calculateRequestDelay(this.config.twitter.apiPlan);
        this.throttle = pThrottle({
            limit: 1,
            interval: delay,
        });
        logger.info(`Twitter client initialized with ${this.config.twitter.apiPlan} plan`, {
            delay: `${delay}ms between requests`,
        });
    }
    /**
     * Get the v2 client for direct API access
     * @returns Twitter API v2 client
     */
    getV2Client() {
        return this.v2Client;
    }
    /**
     * Fetch mentions for the bot
     * @param sinceId Fetch mentions after this ID
     * @param maxResults Maximum number of mentions to fetch
     * @returns Array of mentions
     */
    async getMentions(sinceId, maxResults = 100) {
        const endLog = logger.time('Fetching mentions');
        // Check if bot user ID is set
        if (!this.config.twitter.botUserId) {
            logger.error('TWITTER_BOT_USER_ID is not set! Cannot fetch mentions.');
            throw new Error('Bot user ID is required to fetch mentions. Set TWITTER_BOT_USER_ID environment variable.');
        }
        logger.info(`Fetching mentions for bot user ID: ${this.config.twitter.botUserId}`);
        try {
            const mentions = await this.executeWithRetry(async () => {
                // Use mentions API with Bearer Token (more reliable than search)
                // As per X API docs: https://docs.x.com/x-api/posts/get-mentions
                const response = await this.readClient.v2.userMentionTimeline(this.config.twitter.botUserId, {
                    since_id: sinceId,
                    max_results: Math.max(5, Math.min(maxResults, 100)), // Twitter API requires 5-100
                    'tweet.fields': [
                        'author_id',
                        'conversation_id',
                        'created_at',
                        'entities',
                        'in_reply_to_user_id',
                        'referenced_tweets',
                        'public_metrics',
                    ],
                    'user.fields': [
                        'name',
                        'username',
                        'description',
                        'verified',
                        'public_metrics',
                    ],
                    expansions: [
                        'author_id',
                        'referenced_tweets.id',
                        'referenced_tweets.id.author_id',
                        'entities.mentions.username',
                    ],
                });
                // Update rate limit info
                this.updateRateLimit('mentions', response.rateLimit);
                return response;
            });
            const processedMentions = this.processMentions(mentions);
            endLog();
            logger.info(`Fetched ${processedMentions.length} mentions`);
            return processedMentions;
        }
        catch (error) {
            endLog();
            logger.error('Failed to fetch mentions', error);
            throw this.wrapError(error);
        }
    }
    /**
     * Get a single tweet by ID
     * @param tweetId The tweet ID to fetch
     * @returns Tweet data
     */
    async getTweet(tweetId) {
        try {
            const response = await this.executeWithRetry(async () => {
                return await this.v2Client.singleTweet(tweetId, {
                    'tweet.fields': [
                        'author_id',
                        'conversation_id',
                        'created_at',
                        'entities',
                        'in_reply_to_user_id',
                        'referenced_tweets',
                        'public_metrics',
                    ],
                    'user.fields': ['name', 'username', 'description', 'verified'],
                    expansions: ['author_id', 'referenced_tweets.id'],
                });
            });
            return response.data;
        }
        catch (error) {
            logger.error(`Failed to fetch tweet ${tweetId}`, error);
            throw this.wrapError(error);
        }
    }
    /**
     * Get user information by ID
     * @param userId The user ID to fetch
     * @returns User data
     */
    async getUser(userId) {
        try {
            const response = await this.executeWithRetry(async () => {
                return await this.v2Client.user(userId, {
                    'user.fields': [
                        'name',
                        'username',
                        'description',
                        'verified',
                        'public_metrics',
                        'created_at',
                    ],
                });
            });
            return response.data;
        }
        catch (error) {
            logger.error(`Failed to fetch user ${userId}`, error);
            throw this.wrapError(error);
        }
    }
    /**
     * Reply to a tweet
     * @param text The reply text
     * @param replyToId The tweet ID to reply to
     * @returns The created tweet
     */
    async reply(text, replyToId) {
        if (this.config.bot.dryRun) {
            logger.info('[DRY RUN] Would reply to tweet', { text, replyToId });
            return { id: 'dry-run-id', text, edit_history_tweet_ids: ['dry-run-id'] };
        }
        try {
            const response = await this.executeWithRetry(async () => {
                return await this.v2Client.tweet(text, {
                    reply: { in_reply_to_tweet_id: replyToId },
                });
            });
            logger.success(`Posted reply to ${replyToId}`, { tweetId: response.data.id });
            return response.data;
        }
        catch (error) {
            logger.error('Failed to post reply', error);
            throw this.wrapError(error);
        }
    }
    /**
     * Post a single tweet
     * @param text Tweet text
     * @returns Created tweet
     */
    async tweet(text) {
        if (this.config.bot.dryRun) {
            logger.info('[DRY RUN] Would post tweet', { text });
            return { id: 'dry-run-id', text, edit_history_tweet_ids: ['dry-run-id'] };
        }
        try {
            const response = await this.executeWithRetry(async () => {
                return await this.v2Client.tweet(text);
            });
            logger.success(`Posted tweet`, { tweetId: response.data.id });
            return response.data;
        }
        catch (error) {
            logger.error('Failed to post tweet', error);
            throw this.wrapError(error);
        }
    }
    /**
     * Post a thread of tweets
     * @param texts Array of tweet texts for the thread
     * @param replyToId Optional tweet ID to reply to
     * @returns Array of created tweets
     */
    async postThread(texts, replyToId) {
        if (this.config.bot.dryRun) {
            logger.info('[DRY RUN] Would post thread', { texts, replyToId });
            return texts.map((text, i) => ({ id: `dry-run-${i}`, text, edit_history_tweet_ids: [`dry-run-${i}`] }));
        }
        const tweets = [];
        let previousTweetId = replyToId;
        for (const [index, text] of texts.entries()) {
            try {
                const response = await this.executeWithRetry(async () => {
                    const options = {};
                    if (previousTweetId) {
                        options.reply = { in_reply_to_tweet_id: previousTweetId };
                    }
                    return await this.v2Client.tweet(text, options);
                });
                tweets.push(response.data);
                previousTweetId = response.data.id;
                logger.info(`Posted thread tweet ${index + 1}/${texts.length}`, {
                    tweetId: response.data.id,
                });
                // Add delay between thread tweets to avoid rate limits
                if (index < texts.length - 1) {
                    await this.delay(2000);
                }
            }
            catch (error) {
                logger.error(`Failed to post thread tweet ${index + 1}`, error);
                throw this.wrapError(error);
            }
        }
        logger.success(`Posted thread with ${tweets.length} tweets`);
        return tweets;
    }
    /**
     * Get conversation thread
     * @param conversationId The conversation ID
     * @returns Array of tweets in the conversation
     */
    /**
     * Get trending topics from Twitter
     * @param woeid Where On Earth ID (1 for worldwide)
     * @returns Array of trending topics
     */
    async getTrendingTopics(woeid = 1) {
        try {
            logger.info("Fetching trending topics from Twitter", { woeid });
            const trends = await this.executeWithRetry(async () => {
                // Use v1 API for trends (v2 does not have trends endpoint yet)
                return await this.readClient.v1.trendsByPlace(woeid);
            });
            if (trends && trends.length > 0 && trends[0].trends) {
                const trendsList = trends[0].trends;
                logger.info(`Fetched ${trendsList.length} trending topics`);
                return trendsList;
            }
            return [];
        }
        catch (error) {
            logger.error("Failed to fetch trending topics", error);
            // Return empty array instead of throwing to allow fallback
            return [];
        }
    }
    async getConversation(conversationId) {
        try {
            const response = await this.executeWithRetry(async () => {
                return await this.v2Client.search(`conversation_id:${conversationId}`, {
                    max_results: 100,
                    'tweet.fields': [
                        'author_id',
                        'conversation_id',
                        'created_at',
                        'in_reply_to_user_id',
                        'referenced_tweets',
                    ],
                    'user.fields': ['name', 'username'],
                    expansions: ['author_id'],
                });
            });
            return response.data.data || [];
        }
        catch (error) {
            logger.error(`Failed to fetch conversation ${conversationId}`, error);
            throw this.wrapError(error);
        }
    }
    /**
     * Execute a Twitter API call with retry logic
     */
    async executeWithRetry(fn, options) {
        return this.throttle(async () => {
            return pRetry(fn, {
                retries: 3,
                onFailedAttempt: (error) => {
                    logger.warn(`API call failed, attempt ${error.attemptNumber}/${error.retriesLeft + error.attemptNumber}`, {
                        error: error.message,
                    });
                },
                ...options,
            });
        })();
    }
    /**
     * Process raw mentions into our format
     */
    processMentions(response) {
        if (!response.data?.data) {
            return [];
        }
        const users = new Map();
        const tweets = new Map();
        // Build lookup maps for includes
        if (response.includes?.users) {
            response.includes.users.forEach((user) => {
                users.set(user.id, user);
            });
        }
        if (response.includes?.tweets) {
            response.includes.tweets.forEach((tweet) => {
                tweets.set(tweet.id, tweet);
            });
        }
        // Process mentions - EXCLUDE tweets from the bot itself
        return response.data.data
            .filter((tweet) => {
            // Exclude tweets authored by the bot itself
            if (tweet.author_id === this.config.twitter.botUserId) {
                logger.info(`Excluding self-tweet: ${tweet.id}`);
                return false;
            }
            return true;
        })
            .map((tweet) => {
            const author = users.get(tweet.author_id);
            // Get referenced tweets
            let quotedTweet;
            let repliedToTweet;
            if (tweet.referenced_tweets) {
                for (const ref of tweet.referenced_tweets) {
                    if (ref.type === 'quoted') {
                        quotedTweet = tweets.get(ref.id);
                    }
                    else if (ref.type === 'replied_to') {
                        repliedToTweet = tweets.get(ref.id);
                    }
                }
            }
            return {
                id: tweet.id,
                text: tweet.text,
                authorId: tweet.author_id,
                authorUsername: author?.username,
                createdAt: new Date(tweet.created_at),
                conversationId: tweet.conversation_id,
                inReplyToUserId: tweet.in_reply_to_user_id,
                referencedTweets: tweet.referenced_tweets,
                entities: tweet.entities,
                quotedTweet,
                repliedToTweet,
                author,
                processed: false,
            };
        });
    }
    /**
     * Update rate limit information
     */
    updateRateLimit(endpoint, rateLimit) {
        if (!rateLimit)
            return;
        this.rateLimits.set(endpoint, {
            limit: rateLimit.limit,
            remaining: rateLimit.remaining,
            reset: new Date(rateLimit.reset * 1000),
        });
        logger.debug(`Rate limit updated for ${endpoint}`, {
            remaining: rateLimit.remaining,
            reset: new Date(rateLimit.reset * 1000).toISOString(),
        });
    }
    /**
     * Wrap errors in our custom error class
     */
    wrapError(error) {
        if (error.code === 429) {
            const resetTime = error.rateLimit?.reset
                ? new Date(error.rateLimit.reset * 1000)
                : new Date(Date.now() + 15 * 60 * 1000);
            return new TwitterApiError('Rate limit exceeded', 429, {
                limit: error.rateLimit?.limit || 0,
                remaining: 0,
                reset: resetTime,
            });
        }
        return new TwitterApiError(error.message || 'Twitter API error', error.code);
    }
    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get current rate limit status
     */
    getRateLimitStatus() {
        return new Map(this.rateLimits);
    }
    /**
     * Check if we're rate limited
     */
    isRateLimited(endpoint = 'mentions') {
        const limit = this.rateLimits.get(endpoint);
        if (!limit)
            return false;
        return limit.remaining === 0 && limit.reset.getTime() > Date.now();
    }
    /**
     * Get time until rate limit reset
     */
    getTimeUntilReset(endpoint = 'mentions') {
        const limit = this.rateLimits.get(endpoint);
        if (!limit)
            return 0;
        return Math.max(0, limit.reset.getTime() - Date.now());
    }
}
//# sourceMappingURL=client.js.map