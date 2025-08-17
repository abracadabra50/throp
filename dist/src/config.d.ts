/**
 * Configuration loader for Throp bot
 * Handles environment variables and validation
 */
import { type Config } from './types.js';
/**
 * Parse and validate configuration from environment variables
 * @returns Validated configuration object
 * @throws Error if required configuration is missing or invalid
 */
export declare function loadConfig(): Config;
/**
 * Get rate limits based on Twitter API plan
 * These are approximate limits - actual limits may vary
 */
export declare function getRateLimits(plan: Config['twitter']['apiPlan']): {
    tweetsPerMonth: number;
    tweetsPerDay: number;
    mentionsPerRequest: number;
    requestsPerFifteenMinutes: number;
} | {
    tweetsPerMonth: number;
    tweetsPerDay: number;
    mentionsPerRequest: number;
    requestsPerFifteenMinutes: number;
} | {
    tweetsPerMonth: number;
    tweetsPerDay: number;
    mentionsPerRequest: number;
    requestsPerFifteenMinutes: number;
};
/**
 * Calculate delay between requests based on rate limits
 * @param plan Twitter API plan
 * @returns Delay in milliseconds
 */
export declare function calculateRequestDelay(plan: Config['twitter']['apiPlan']): number;
/**
 * Check if we're within daily tweet limits
 * @param tweetCount Number of tweets sent today
 * @param plan Twitter API plan
 * @returns Whether we can send more tweets
 */
export declare function canSendMoreTweets(tweetCount: number, plan: Config['twitter']['apiPlan']): boolean;
/**
 * Get or create config singleton
 * @returns Configuration instance
 */
export declare function getConfig(): Config;
export default getConfig;
//# sourceMappingURL=config.d.ts.map