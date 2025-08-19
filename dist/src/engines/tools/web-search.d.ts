/**
 * Web Search Tool - Uses Perplexity API for web search
 * Returns structured results for evidence gathering
 */
export interface WebSearchResult {
    title: string;
    url: string;
    snippet: string;
    description?: string;
}
export declare class WebSearchTool {
    private apiKey;
    private apiUrl;
    constructor();
    /**
     * Search the web using Perplexity
     */
    search(query: string, recency?: 'hour' | 'day' | 'week' | 'month'): Promise<WebSearchResult[]>;
    /**
     * Get recency filter for search
     */
    private getRecencyFilter;
    /**
     * Fallback: Extract results from unstructured text
     */
    private extractResultsFromText;
}
//# sourceMappingURL=web-search.d.ts.map