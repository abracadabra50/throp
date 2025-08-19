/**
 * GeckoTerminal Tool - Real-time DEX prices and market data
 * Uses free GeckoTerminal API for on-chain data
 * Reference: https://apiguide.geckoterminal.com/
 */

import ky from 'ky';
import { logger } from '../../utils/logger.js';

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

export class GeckoTerminalTool {
  private baseUrl = 'https://api.geckoterminal.com/api/v2';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 60000; // 1 minute cache
  
  /**
   * Get token price and market data
   */
  async getTokenPrice(token: string, network: string = 'solana'): Promise<TokenPriceData> {
    logger.info('Fetching token price from GeckoTerminal', { token, network });
    
    const cacheKey = `${network}:${token}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) {
      logger.debug('Using cached price data', { token });
      return cached;
    }
    
    try {
      // Search for token pools
      const pools = await this.searchPools(token, network);
      
      if (!pools || pools.length === 0) {
        logger.warn('No pools found for token', { token, network });
        return this.getEmptyPriceData(token);
      }
      
      // Use the most liquid pool
      const bestPool = pools[0];
      const priceData = this.extractPriceData(bestPool, network);
      
      this.setCache(cacheKey, priceData);
      
      logger.info('Token price fetched', { 
        token, 
        price: priceData.price,
        change: priceData.price_change_24h 
      });
      
      return priceData;
    } catch (error) {
      logger.error('Failed to fetch token price', { token, network, error });
      return this.getEmptyPriceData(token);
    }
  }
  
  /**
   * Search for token pools
   */
  private async searchPools(query: string, network: string): Promise<any[]> {
    try {
      // First try direct token search
      const searchUrl = `${this.baseUrl}/search/pools?query=${encodeURIComponent(query)}&network=${network}`;
      const searchResponse = await ky.get(searchUrl).json<any>();
      
      if (searchResponse.data && searchResponse.data.length > 0) {
        return searchResponse.data;
      }
      
      // If no results, try getting pools for a specific token address
      if (this.looksLikeAddress(query)) {
        const tokenUrl = `${this.baseUrl}/networks/${network}/tokens/${query}/pools`;
        const tokenResponse = await ky.get(tokenUrl).json<any>();
        return tokenResponse.data || [];
      }
      
      return [];
    } catch (error) {
      logger.error('Pool search failed', error);
      return [];
    }
  }
  
  /**
   * Extract price data from pool response
   */
  private extractPriceData(pool: any, network: string): TokenPriceData {
    const attributes = pool.attributes || {};
    const relationships = pool.relationships || {};
    
    // Get base token price (usually USD)
    const price = parseFloat(attributes.base_token_price_usd) || 
                  parseFloat(attributes.quote_token_price_usd) || 
                  0;
    
    // Get 24h price change
    const priceChange = parseFloat(attributes.price_change_percentage?.h24) || 0;
    
    // Get volume
    const volume = parseFloat(attributes.volume_usd?.h24) || 0;
    
    // Get liquidity
    const liquidity = parseFloat(attributes.reserve_in_usd) || 0;
    
    // Get market cap if available
    const marketCap = parseFloat(attributes.market_cap_usd) || undefined;
    
    // Build chart URL
    const poolAddress = pool.id || '';
    const chartUrl = `https://www.geckoterminal.com/${network}/pools/${poolAddress}`;
    
    return {
      price,
      price_change_24h: priceChange,
      volume_24h: volume,
      liquidity,
      market_cap: marketCap,
      chart_url: chartUrl,
      pool_address: poolAddress,
      token_address: relationships.base_token?.data?.id || relationships.quote_token?.data?.id
    };
  }
  
  /**
   * Get OHLCV data for chart analysis
   */
  async getOHLCV(poolAddress: string, timeframe: string = '4h'): Promise<any> {
    try {
      const url = `${this.baseUrl}/pools/${poolAddress}/ohlcv/${timeframe}`;
      const response = await ky.get(url).json<any>();
      return response.data || [];
    } catch (error) {
      logger.error('Failed to fetch OHLCV data', error);
      return [];
    }
  }
  
  /**
   * Analyze chart data
   */
  async analyzeChart(token: string, network: string = 'solana'): Promise<ChartAnalysis> {
    try {
      const priceData = await this.getTokenPrice(token, network);
      
      if (!priceData.pool_address) {
        return {
          trend: 'neutral',
          support: 0,
          resistance: 0,
          verdict: 'no chart data available'
        };
      }
      
      const ohlcv = await this.getOHLCV(priceData.pool_address);
      
      if (!ohlcv || ohlcv.length === 0) {
        return {
          trend: priceData.price_change_24h > 0 ? 'bullish' : 'bearish',
          support: priceData.price * 0.9,
          resistance: priceData.price * 1.1,
          verdict: priceData.price_change_24h > 0 ? 'probably going up (nfa)' : 'definitely going to zero'
        };
      }
      
      return this.performTechnicalAnalysis(ohlcv);
    } catch (error) {
      logger.error('Chart analysis failed', error);
      return {
        trend: 'neutral',
        support: 0,
        resistance: 0,
        verdict: 'chart machine broke'
      };
    }
  }
  
  /**
   * Perform basic technical analysis
   */
  private performTechnicalAnalysis(ohlcv: any[]): ChartAnalysis {
    const prices = ohlcv.map(candle => parseFloat(candle[4])); // close prices
    const highs = ohlcv.map(candle => parseFloat(candle[2]));
    const lows = ohlcv.map(candle => parseFloat(candle[3]));
    
    // Calculate simple moving average
    const sma = prices.slice(-20).reduce((a, b) => a + b, 0) / Math.min(20, prices.length);
    const currentPrice = prices[prices.length - 1];
    
    // Determine trend
    const trend = currentPrice > sma ? 'bullish' : 'bearish';
    
    // Find support and resistance
    const recentLows = lows.slice(-20);
    const recentHighs = highs.slice(-20);
    const support = Math.min(...recentLows);
    const resistance = Math.max(...recentHighs);
    
    // Generate verdict
    const verdicts = {
      bullish: [
        'chart looking bullish (this is not financial advice)',
        'probably going up but dont blame me',
        'green candles everywhere',
        'to the moon apparently'
      ],
      bearish: [
        'chart looking like my portfolio (bad)',
        'going to zero faster than my will to live',
        'red candles having a party',
        'ngmi but you already knew that'
      ]
    };
    
    const verdict = verdicts[trend][Math.floor(Math.random() * verdicts[trend].length)];
    
    return {
      trend,
      support,
      resistance,
      verdict
    };
  }
  
  /**
   * Check if string looks like a token address
   */
  private looksLikeAddress(str: string): boolean {
    // Ethereum-like address (0x...)
    if (str.startsWith('0x') && str.length === 42) return true;
    
    // Solana address (base58, typically 32-44 chars)
    if (str.length >= 32 && str.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(str)) return true;
    
    return false;
  }
  
  /**
   * Get from cache
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }
  
  /**
   * Set cache
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  /**
   * Get empty price data for when token not found
   */
  private getEmptyPriceData(token: string): TokenPriceData {
    return {
      price: 0,
      price_change_24h: 0,
      volume_24h: 0,
      liquidity: 0,
      chart_url: `https://www.geckoterminal.com/search?query=${encodeURIComponent(token)}`,
      verdict: 'token not found or already rugged'
    } as TokenPriceData;
  }
}
