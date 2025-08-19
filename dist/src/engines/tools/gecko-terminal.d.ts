/**
 * GeckoTerminal Tool - Real-time DEX prices and market data
 * Uses free GeckoTerminal API for on-chain data
 * Reference: https://apiguide.geckoterminal.com/
 */
export interface TokenPriceData {
    price: number;
    price_change_24h: number;
    volume_24h: number;
    liquidity: number;
    market_cap?: number;
    chart_url: string;
    pool_address?: string;
    token_address?: string;
}
export interface ChartAnalysis {
    trend: 'bullish' | 'bearish' | 'neutral';
    support: number;
    resistance: number;
    verdict: string;
}
export declare class GeckoTerminalTool {
    private baseUrl;
    private cache;
    private cacheTimeout;
    /**
     * Get token price and market data
     */
    getTokenPrice(token: string, network?: string): Promise<TokenPriceData>;
    /**
     * Search for token pools
     */
    private searchPools;
    /**
     * Extract price data from pool response
     */
    private extractPriceData;
    /**
     * Get OHLCV data for chart analysis
     */
    getOHLCV(poolAddress: string, timeframe?: string): Promise<any>;
    /**
     * Analyze chart data
     */
    analyzeChart(token: string, network?: string): Promise<ChartAnalysis>;
    /**
     * Perform basic technical analysis
     */
    private performTechnicalAnalysis;
    /**
     * Check if string looks like a token address
     */
    private looksLikeAddress;
    /**
     * Get from cache
     */
    private getFromCache;
    /**
     * Set cache
     */
    private setCache;
    /**
     * Get empty price data for when token not found
     */
    private getEmptyPriceData;
}
//# sourceMappingURL=gecko-terminal.d.ts.map