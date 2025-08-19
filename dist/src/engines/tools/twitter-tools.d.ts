/**
 * Twitter/X Tools - Search and profile lookup functionality
 * Follows Anthropic's tool-use specification
 */
import type { TwitterSearchResult } from '../../twitter/twitter-search.js';
export interface TwitterProfile {
    id: string;
    username: string;
    name: string;
    description: string;
    followers_count: number;
    following_count: number;
    tweet_count: number;
    verified: boolean;
    created_at: string;
}
export declare class TwitterTool {
    private twitterSearch;
    private twitterClient;
    constructor();
    /**
     * Search Twitter/X for tweets
     */
    searchTweets(query: string, limit?: number): Promise<TwitterSearchResult>;
    /**
     * Get Twitter/X user profile
     */
    getProfile(handle: string): Promise<TwitterProfile | null>;
    /**
     * Get recent tweets from a user
     */
    getUserTweets(handle: string, limit?: number): Promise<TwitterSearchResult>;
    /**
     * Search for tweets about a topic from verified accounts
     */
    searchVerified(query: string, limit?: number): Promise<TwitterSearchResult>;
    /**
     * Search for popular tweets about a topic
     */
    searchPopular(query: string, minLikes?: number, limit?: number): Promise<TwitterSearchResult>;
}
//# sourceMappingURL=twitter-tools.d.ts.map