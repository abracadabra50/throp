/**
 * Quote Tweet Monitor - Watches specific accounts and QTs with chaos
 */
import { TwitterClient } from './client.js';
import { createHybridClaudeEngine } from '../engines/hybrid-claude.js';
import { logger } from '../utils/logger.js';
import { getRedisCache } from '../cache/redis.js';
import { readFileSync } from 'fs';
import { join } from 'path';
export class QuoteTweetMonitor {
    twitterClient;
    engine;
    cache;
    config;
    quotedTweets = new Set();
    hourlyQuoteCount = new Map();
    isRunning = false;
    client; // Direct Twitter API v2 client
    rateLimitBackoff = 0; // Track rate limit backoff
    lastApiCall = 0; // Track last API call time
    constructor(config) {
        this.config = {
            minEngagement: 100,
            maxQuotesPerHour: 5,
            ...config,
        };
        this.twitterClient = new TwitterClient();
        this.engine = createHybridClaudeEngine();
        this.cache = getRedisCache();
    }
    /**
     * Start monitoring accounts
     */
    async start() {
        if (this.isRunning) {
            logger.warn('Quote monitor already running');
            return;
        }
        this.isRunning = true;
        logger.info('Starting quote tweet monitor', {
            accounts: this.config.accounts,
            interval: this.config.checkInterval,
        });
        // Get the v2 client from TwitterClient
        this.client = this.twitterClient.getV2Client();
        // Load previously quoted tweets from cache
        await this.loadQuotedHistory();
        // Start monitoring loop
        this.monitorLoop();
    }
    /**
     * Stop monitoring
     */
    stop() {
        this.isRunning = false;
        logger.info('Stopped quote tweet monitor');
    }
    /**
     * Main monitoring loop
     */
    async monitorLoop() {
        while (this.isRunning) {
            try {
                await this.checkAccounts();
            }
            catch (error) {
                logger.error('Error in quote monitor loop', error);
            }
            // Wait for next check
            await new Promise(resolve => setTimeout(resolve, this.config.checkInterval));
        }
    }
    /**
     * Check all monitored accounts for new tweets
     */
    async checkAccounts() {
        const currentHour = new Date().getHours();
        const quotesThisHour = this.hourlyQuoteCount.get(currentHour) || 0;
        if (quotesThisHour >= this.config.maxQuotesPerHour) {
            logger.debug('Hourly quote limit reached', { quotesThisHour });
            return;
        }
        for (const username of this.config.accounts) {
            try {
                const tweets = await this.getRecentTweets(username);
                for (const tweet of tweets) {
                    if (await this.shouldQuoteTweet(tweet)) {
                        await this.quoteTweet(tweet);
                        // Update hourly count
                        this.hourlyQuoteCount.set(currentHour, quotesThisHour + 1);
                        // Rate limit between quotes
                        await new Promise(resolve => setTimeout(resolve, 30000)); // 30s between quotes
                    }
                }
            }
            catch (error) {
                logger.error(`Failed to check account @${username}`, error);
            }
        }
    }
    /**
     * Get recent tweets from an account
     */
    async getRecentTweets(username) {
        try {
            // Wait if we're in rate limit backoff
            if (this.rateLimitBackoff > 0) {
                const waitTime = this.rateLimitBackoff - Date.now();
                if (waitTime > 0) {
                    logger.info(`Rate limited - waiting ${Math.ceil(waitTime / 1000)}s`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
                this.rateLimitBackoff = 0;
            }
            // Enforce minimum delay between API calls (75s for basic plan)
            const timeSinceLastCall = Date.now() - this.lastApiCall;
            const minDelay = 75000; // 75 seconds for basic Twitter API plan
            if (timeSinceLastCall < minDelay) {
                const waitTime = minDelay - timeSinceLastCall;
                logger.debug(`Waiting ${Math.ceil(waitTime / 1000)}s before next API call`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
            this.lastApiCall = Date.now();
            // Get user ID
            const user = await this.client.userByUsername(username);
            if (!user.data) {
                logger.warn(`User @${username} not found`);
                return [];
            }
            // Wait again before timeline request
            await new Promise(resolve => setTimeout(resolve, minDelay));
            this.lastApiCall = Date.now();
            // Get recent tweets (last 10)
            const tweets = await this.client.userTimeline(user.data.id, {
                max_results: 10,
                'tweet.fields': ['created_at', 'public_metrics', 'referenced_tweets'],
                exclude: ['retweets', 'replies'],
            });
            return tweets.data.data || [];
        }
        catch (error) {
            // Handle rate limit errors
            if (error.message?.includes('429') || error.code === 429) {
                // Exponential backoff: wait 15 minutes on rate limit
                this.rateLimitBackoff = Date.now() + (15 * 60 * 1000);
                logger.warn(`Rate limited by Twitter - backing off for 15 minutes`);
                return [];
            }
            logger.error(`Failed to fetch tweets for @${username}`, error);
            return [];
        }
    }
    /**
     * Determine if we should quote tweet this
     */
    async shouldQuoteTweet(tweet) {
        // Already quoted?
        if (this.quotedTweets.has(tweet.id)) {
            return false;
        }
        // Check if in cache
        const cached = await this.cache.get(`quoted:${tweet.id}`);
        if (cached) {
            this.quotedTweets.add(tweet.id);
            return false;
        }
        // Check engagement threshold
        const metrics = tweet.public_metrics;
        if (metrics) {
            const engagement = (metrics.like_count || 0) + (metrics.retweet_count || 0);
            if (engagement < this.config.minEngagement) {
                return false;
            }
        }
        // Check keywords if configured
        if (this.config.keywords && this.config.keywords.length > 0) {
            const tweetLower = tweet.text.toLowerCase();
            const hasKeyword = this.config.keywords.some(keyword => tweetLower.includes(keyword.toLowerCase()));
            if (!hasKeyword) {
                return false;
            }
        }
        // Check if tweet is recent (within last 2 hours)
        if (tweet.created_at) {
            const tweetTime = new Date(tweet.created_at).getTime();
            const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
            if (tweetTime < twoHoursAgo) {
                return false;
            }
        }
        return true;
    }
    /**
     * Quote tweet with Throp's take
     */
    async quoteTweet(tweet) {
        try {
            logger.info('Generating quote tweet', {
                originalId: tweet.id,
                text: tweet.text.substring(0, 100),
            });
            // Generate chaotic reaction
            const reaction = await this.generateReaction(tweet);
            // If in test mode (DRY_RUN), just log what would be posted
            if (process.env.DRY_RUN === 'true') {
                logger.info('TEST MODE - Would quote tweet:', {
                    originalTweet: tweet.text,
                    quoteTweet: reaction,
                    originalId: tweet.id,
                });
                // Still mark as quoted to avoid repeats in test mode
                this.quotedTweets.add(tweet.id);
                return;
            }
            // Post quote tweet
            const quoted = await this.client.tweet(reaction, {
                quote_tweet_id: tweet.id,
            });
            // Mark as quoted
            this.quotedTweets.add(tweet.id);
            await this.cache.set(`quoted:${tweet.id}`, '1', 60 * 60 * 24 * 7); // Cache for 7 days
            logger.success('Posted quote tweet', {
                quoteTweetId: quoted.data.id,
                originalTweetId: tweet.id,
            });
        }
        catch (error) {
            logger.error('Failed to quote tweet', error);
        }
    }
    /**
     * Generate a chaotic reaction to the tweet
     */
    async generateReaction(tweet) {
        const prompt = `Generate a sarcastic quote tweet reaction to this tweet: "${tweet.text}"
    
    Be:
    - Lowercase only
    - Sarcastic and witty
    - Under 200 chars (leaving room for the QT)
    - Slightly disagreeable or contrarian
    - Add a hot take or unexpected angle
    - Don't just repeat what they said`;
        try {
            const reaction = await this.engine.generateProactiveTweet(prompt);
            return reaction;
        }
        catch (error) {
            logger.error('Failed to generate reaction', error);
            // Fallback reactions
            const fallbacks = [
                'interesting take but have you considered touching grass',
                'this is certainly one of the tweets of all time',
                'big if true (its not)',
                'sir this is a wendys',
                'cant believe youre making me defend the opposite position but here we are',
                'counterpoint: no',
                'source: trust me bro',
                'skill issue tbh',
            ];
            return fallbacks[Math.floor(Math.random() * fallbacks.length)];
        }
    }
    /**
     * Load previously quoted tweets from cache
     */
    async loadQuotedHistory() {
        try {
            // This would ideally load from Redis/database
            logger.info('Loaded quoted tweet history', {
                count: this.quotedTweets.size,
            });
        }
        catch (error) {
            logger.error('Failed to load quoted history', error);
        }
    }
}
/**
 * Load configuration from file
 */
export function loadQuoteConfig() {
    try {
        const configPath = join(process.cwd(), 'config', 'quote-targets.json');
        const configData = readFileSync(configPath, 'utf-8');
        return JSON.parse(configData);
    }
    catch (error) {
        logger.warn('Failed to load quote config, using defaults', error);
        return {
            accounts: [],
            globalSettings: {
                checkInterval: 300000,
                maxQuotesPerHour: 5,
                defaultMinEngagement: 100,
            },
        };
    }
}
/**
 * Factory function to create and start monitor
 */
export async function startQuoteMonitor(accounts) {
    const config = loadQuoteConfig();
    // Use provided accounts or load from config
    const targetAccounts = accounts || config.accounts.map((acc) => acc.username);
    // For basic plan, use much longer intervals
    const checkInterval = config.globalSettings.checkInterval || 15 * 60 * 1000; // 15 minutes default
    const monitor = new QuoteTweetMonitor({
        accounts: targetAccounts,
        checkInterval,
        minEngagement: config.globalSettings.defaultMinEngagement || 100,
        maxQuotesPerHour: config.globalSettings.maxQuotesPerHour || 2, // Lower for basic plan
    });
    logger.info('Monitor configured for basic API plan', {
        checkInterval: `${checkInterval / 1000 / 60} minutes`,
        note: 'Upgrade to Pro for faster monitoring',
    });
    await monitor.start();
    return monitor;
}
//# sourceMappingURL=quote-monitor.js.map