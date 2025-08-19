/**
 * GeckoTerminal API tool for crypto price data
 * Free API with no authentication required
 */
export interface CryptoPriceData {
    symbol: string;
    price: number;
    change24h: number;
    volume24h: number;
    marketCap?: number;
    timestamp: Date;
}
export declare class GeckoTerminalTool {
    private baseUrl;
    /**
     * Get price data for a cryptocurrency
     */
    getPrice(symbol: string): Promise<CryptoPriceData | null>;
    /**
     * Format price data for response
     */
    formatPriceData(data: CryptoPriceData): string;
}
//# sourceMappingURL=gecko-terminal.d.ts.map