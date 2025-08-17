/**
 * Quote Tweet Monitor - Watches specific accounts and QTs with chaos
 */
export interface MonitorConfig {
    accounts: string[];
    checkInterval: number;
    minEngagement?: number;
    maxQuotesPerHour?: number;
    keywords?: string[];
}
export declare class QuoteTweetMonitor {
    private twitterClient;
    private engine;
    private cache;
    private config;
    private quotedTweets;
    private hourlyQuoteCount;
    private isRunning;
    private client;
    private rateLimitBackoff;
    private lastApiCall;
    constructor(config: MonitorConfig);
    /**
     * Start monitoring accounts
     */
    start(): Promise<void>;
    /**
     * Stop monitoring
     */
    stop(): void;
    /**
     * Main monitoring loop
     */
    private monitorLoop;
    /**
     * Check all monitored accounts for new tweets
     */
    private checkAccounts;
    /**
     * Get recent tweets from an account
     */
    private getRecentTweets;
    /**
     * Determine if we should quote tweet this
     */
    private shouldQuoteTweet;
    /**
     * Quote tweet with Throp's take
     */
    private quoteTweet;
    /**
     * Generate a chaotic reaction to the tweet
     */
    private generateReaction;
    /**
     * Load previously quoted tweets from cache
     */
    private loadQuotedHistory;
}
/**
 * Load configuration from file
 */
export declare function loadQuoteConfig(): any;
/**
 * Factory function to create and start monitor
 */
export declare function startQuoteMonitor(accounts?: string[]): Promise<QuoteTweetMonitor>;
//# sourceMappingURL=quote-monitor.d.ts.map