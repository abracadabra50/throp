/**
 * GeckoTerminal API tool for crypto price data
 * Free API with no authentication required
 */
import { logger } from '../../utils/logger.js';
export class GeckoTerminalTool {
    baseUrl = 'https://api.geckoterminal.com/api/v2';
    /**
     * Get price data for a cryptocurrency
     */
    async getPrice(symbol) {
        try {
            // Map common symbols to their IDs
            const symbolMap = {
                'BTC': 'bitcoin',
                'ETH': 'ethereum',
                'SOL': 'solana',
                'BONK': 'bonk',
                'WIF': 'dogwifcoin',
                'PEPE': 'pepe',
                'DOGE': 'dogecoin'
            };
            const tokenId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
            // Use CoinGecko simple price API (free)
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
            const response = await fetch(url);
            if (!response.ok) {
                logger.warn(`Failed to fetch price for ${symbol}:`, response.status);
                return null;
            }
            const data = await response.json();
            const tokenData = data[tokenId];
            if (!tokenData) {
                logger.warn(`No price data found for ${symbol}`);
                return null;
            }
            return {
                symbol: symbol.toUpperCase(),
                price: tokenData.usd,
                change24h: tokenData.usd_24h_change || 0,
                volume24h: tokenData.usd_24h_vol || 0,
                marketCap: tokenData.usd_market_cap,
                timestamp: new Date()
            };
        }
        catch (error) {
            logger.error(`Error fetching price for ${symbol}:`, error);
            return null;
        }
    }
    /**
     * Format price data for response
     */
    formatPriceData(data) {
        const changeEmoji = data.change24h >= 0 ? '📈' : '📉';
        const changeText = data.change24h >= 0 ? 'up' : 'down';
        return `${data.symbol} is at $${data.price.toFixed(data.price < 1 ? 6 : 2)} ${changeEmoji} ${changeText} ${Math.abs(data.change24h).toFixed(2)}% in 24h`;
    }
}
//# sourceMappingURL=gecko-terminal.js.map