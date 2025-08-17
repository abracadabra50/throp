/**
 * Central Rate Limit Manager
 * Coordinates API usage across all bot systems
 */
export declare class RateLimitManager {
    private static instance;
    private apiCalls;
    private tweets;
    private readonly MAX_API_CALLS_PER_15_MIN;
    private readonly MAX_TWEETS_PER_DAY;
    private readonly MAX_TWEETS_PER_HOUR;
    private constructor();
    static getInstance(): RateLimitManager;
    /**
     * Check if we can make an API call
     */
    canMakeApiCall(): Promise<boolean>;
    /**
     * Check if we can send a tweet
     */
    canSendTweet(): Promise<boolean>;
    /**
     * Record an API call
     */
    recordApiCall(): void;
    /**
     * Record a tweet sent
     */
    recordTweet(): void;
    /**
     * Get time until we can make next API call
     */
    getTimeUntilNextApiCall(): number;
    /**
     * Get current usage stats
     */
    getStats(): {
        apiCalls: {
            last15Min: number;
            limit: number;
        };
        tweets: {
            today: number;
            lastHour: number;
            dailyLimit: number;
            hourlyLimit: number;
        };
    };
    /**
     * Clean up old entries to prevent memory leak
     */
    private cleanOldEntries;
    /**
     * Emergency reset (use carefully!)
     */
    reset(): void;
}
export declare const rateManager: RateLimitManager;
//# sourceMappingURL=rate-manager.d.ts.map