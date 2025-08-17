/**
 * Twitter/X Search Integration for Real-time Context
 */
export interface TwitterSearchResult {
    tweets: Array<{
        id: string;
        text: string;
        author: string;
        likes: number;
        retweets: number;
        created_at: string;
    }>;
    query: string;
    count: number;
}
export declare class TwitterSearch {
    private client;
    private lastSearchTime;
    private searchCache;
    private CACHE_DURATION;
    private MIN_SEARCH_INTERVAL;
    constructor();
    /**
     * Search Twitter/X for recent tweets
     */
    searchTweets(query: string, maxResults?: number): Promise<TwitterSearchResult | null>;
    /**
     * Format search results for context
     */
    formatForContext(results: TwitterSearchResult): string;
}
export declare function getTwitterSearch(): TwitterSearch;
//# sourceMappingURL=twitter-search.d.ts.map