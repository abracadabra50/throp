/**
 * Twitter API client wrapper with rate limiting and retry logic
 * Provides a robust interface to Twitter API v2
 */
import { TwitterApi, type TweetV2, type UserV2 } from 'twitter-api-v2';
import type { TwitterMention, RateLimitInfo } from '../types.js';
/**
 * Custom error class for Twitter API errors
 */
export declare class TwitterApiError extends Error {
    code?: number | undefined;
    rateLimit?: RateLimitInfo | undefined;
    constructor(message: string, code?: number | undefined, rateLimit?: RateLimitInfo | undefined);
}
/**
 * Twitter client with rate limiting and retry capabilities
 */
export declare class TwitterClient {
    private client;
    private readClient;
    private v2Client;
    private readonly config;
    private rateLimits;
    private throttle;
    constructor();
    /**
     * Get the v2 client for direct API access
     * @returns Twitter API v2 client
     */
    getV2Client(): TwitterApi['v2'];
    /**
     * Fetch mentions for the bot
     * @param sinceId Fetch mentions after this ID
     * @param maxResults Maximum number of mentions to fetch
     * @returns Array of mentions
     */
    getMentions(sinceId?: string, maxResults?: number): Promise<TwitterMention[]>;
    /**
     * Get a single tweet by ID
     * @param tweetId The tweet ID to fetch
     * @returns Tweet data
     */
    getTweet(tweetId: string): Promise<TweetV2>;
    /**
     * Get user information by ID
     * @param userId The user ID to fetch
     * @returns User data
     */
    getUser(userId: string): Promise<UserV2>;
    /**
     * Reply to a tweet
     * @param text The reply text
     * @param replyToId The tweet ID to reply to
     * @returns The created tweet
     */
    reply(text: string, replyToId: string): Promise<TweetV2>;
    /**
     * Post a thread of tweets
     * @param texts Array of tweet texts for the thread
     * @param replyToId Optional tweet ID to reply to
     * @returns Array of created tweets
     */
    postThread(texts: string[], replyToId?: string): Promise<TweetV2[]>;
    /**
     * Get conversation thread
     * @param conversationId The conversation ID
     * @returns Array of tweets in the conversation
     */
    getConversation(conversationId: string): Promise<TweetV2[]>;
    /**
     * Execute a Twitter API call with retry logic
     */
    private executeWithRetry;
    /**
     * Process raw mentions into our format
     */
    private processMentions;
    /**
     * Update rate limit information
     */
    private updateRateLimit;
    /**
     * Wrap errors in our custom error class
     */
    private wrapError;
    /**
     * Delay helper
     */
    private delay;
    /**
     * Get current rate limit status
     */
    getRateLimitStatus(): Map<string, RateLimitInfo>;
    /**
     * Check if we're rate limited
     */
    isRateLimited(endpoint?: string): boolean;
    /**
     * Get time until rate limit reset
     */
    getTimeUntilReset(endpoint?: string): number;
}
//# sourceMappingURL=client.d.ts.map