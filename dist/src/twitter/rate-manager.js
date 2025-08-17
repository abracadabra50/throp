/**
 * Central Rate Limit Manager
 * Coordinates API usage across all bot systems
 */
import { logger } from '../utils/logger.js';
export class RateLimitManager {
    static instance;
    // Track API calls
    apiCalls = []; // Timestamps of API calls
    tweets = []; // Timestamps of tweets sent
    // Limits (for basic plan)
    MAX_API_CALLS_PER_15_MIN = 15;
    MAX_TWEETS_PER_DAY = 50;
    MAX_TWEETS_PER_HOUR = 3; // Be conservative
    constructor() {
        // Reset counters periodically
        setInterval(() => this.cleanOldEntries(), 60000); // Every minute
    }
    static getInstance() {
        if (!RateLimitManager.instance) {
            RateLimitManager.instance = new RateLimitManager();
        }
        return RateLimitManager.instance;
    }
    /**
     * Check if we can make an API call
     */
    async canMakeApiCall() {
        this.cleanOldEntries();
        const recentCalls = this.apiCalls.filter(time => time > Date.now() - (15 * 60 * 1000) // Last 15 minutes
        );
        const canCall = recentCalls.length < this.MAX_API_CALLS_PER_15_MIN;
        if (!canCall) {
            logger.warn('API rate limit reached', {
                recent: recentCalls.length,
                limit: this.MAX_API_CALLS_PER_15_MIN,
            });
        }
        return canCall;
    }
    /**
     * Check if we can send a tweet
     */
    async canSendTweet() {
        this.cleanOldEntries();
        // Check daily limit
        const todaysTweets = this.tweets.filter(time => time > Date.now() - (24 * 60 * 60 * 1000));
        if (todaysTweets.length >= this.MAX_TWEETS_PER_DAY) {
            logger.warn('Daily tweet limit reached', {
                sent: todaysTweets.length,
                limit: this.MAX_TWEETS_PER_DAY,
            });
            return false;
        }
        // Check hourly limit
        const lastHourTweets = this.tweets.filter(time => time > Date.now() - (60 * 60 * 1000));
        if (lastHourTweets.length >= this.MAX_TWEETS_PER_HOUR) {
            logger.warn('Hourly tweet limit reached', {
                sent: lastHourTweets.length,
                limit: this.MAX_TWEETS_PER_HOUR,
            });
            return false;
        }
        return true;
    }
    /**
     * Record an API call
     */
    recordApiCall() {
        this.apiCalls.push(Date.now());
        logger.debug('API call recorded', {
            totalIn15Min: this.apiCalls.filter(t => t > Date.now() - (15 * 60 * 1000)).length,
        });
    }
    /**
     * Record a tweet sent
     */
    recordTweet() {
        this.tweets.push(Date.now());
        logger.debug('Tweet recorded', {
            todayTotal: this.tweets.filter(t => t > Date.now() - (24 * 60 * 60 * 1000)).length,
        });
    }
    /**
     * Get time until we can make next API call
     */
    getTimeUntilNextApiCall() {
        const recentCalls = this.apiCalls.filter(time => time > Date.now() - (15 * 60 * 1000));
        if (recentCalls.length < this.MAX_API_CALLS_PER_15_MIN) {
            return 0; // Can call now
        }
        // Find the oldest call in the window
        const oldestCall = Math.min(...recentCalls);
        const timeUntilExpiry = (oldestCall + (15 * 60 * 1000)) - Date.now();
        return Math.max(0, timeUntilExpiry);
    }
    /**
     * Get current usage stats
     */
    getStats() {
        this.cleanOldEntries();
        return {
            apiCalls: {
                last15Min: this.apiCalls.filter(t => t > Date.now() - (15 * 60 * 1000)).length,
                limit: this.MAX_API_CALLS_PER_15_MIN,
            },
            tweets: {
                today: this.tweets.filter(t => t > Date.now() - (24 * 60 * 60 * 1000)).length,
                lastHour: this.tweets.filter(t => t > Date.now() - (60 * 60 * 1000)).length,
                dailyLimit: this.MAX_TWEETS_PER_DAY,
                hourlyLimit: this.MAX_TWEETS_PER_HOUR,
            },
        };
    }
    /**
     * Clean up old entries to prevent memory leak
     */
    cleanOldEntries() {
        const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.apiCalls = this.apiCalls.filter(time => time > dayAgo);
        this.tweets = this.tweets.filter(time => time > dayAgo);
    }
    /**
     * Emergency reset (use carefully!)
     */
    reset() {
        this.apiCalls = [];
        this.tweets = [];
        logger.warn('Rate limit manager reset!');
    }
}
// Export singleton instance
export const rateManager = RateLimitManager.getInstance();
//# sourceMappingURL=rate-manager.js.map