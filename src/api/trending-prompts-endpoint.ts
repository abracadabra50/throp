/**
 * Trending Prompts Endpoint - Returns cached trending prompts
 * With hourly Redis caching for fresh content
 */

import { Request, Response } from 'express';
import { logger } from '../utils/logger.js';
import { getRedisCache } from '../cache/redis.js';

// Cache configuration
const HOURLY_CACHE_DURATION = 3600; // 1 hour in seconds

/**
 * Generate cache key for current hour
 */
function getCurrentHourCacheKey(): string {
  const now = new Date();
  const hourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
  return `trending-prompts:${hourKey}`;
}

/**
 * Handle trending prompts request
 */
export async function handleTrendingPrompts(_req: Request, res: Response) {
  try {
    logger.info('Trending prompts endpoint called');
    
    const cache = getRedisCache();
    const cacheKey = getCurrentHourCacheKey();
    
    // Try to get from Redis cache first
    try {
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData as string);
        logger.info('Returning cached trending prompts from Redis', { 
          generatedAt: parsedData.generatedAt,
          count: parsedData.prompts.length,
          cacheKey 
        });
        
        res.json({
          success: true,
          prompts: parsedData.prompts,
          source: 'redis-hourly-cache',
          generatedAt: parsedData.generatedAt,
          nextUpdate: parsedData.nextUpdate
        });
        return;
      }
    } catch (cacheError) {
      logger.warn('Failed to get trending prompts from cache, generating fresh', { cacheError });
    }

    // Generate new prompts with current trends
    logger.info('Generating fresh trending prompts (will cache for 1 hour)');
    
    // Get current date/time context
    const nowDate = new Date();
    const month = nowDate.toLocaleDateString('en-US', { month: 'long' });
    const year = nowDate.getFullYear();
    
    // Dynamic prompts based on current context
    const prompts = [
      `what's happening with the OpenAI board drama`,
      `explain the latest TikTok ban situation`,
      `roast my 2025 spotify wrapped`,
      `why is everyone posting about luigi mangione`,
      `explain the microsoft/activision deal like i'm 5`,
      `what's the tea with drake vs everyone`,
      `rate my toxic trait: checking crypto prices every 5 minutes`,
      `why does everyone hate ${month} ${year} already`,
      `explain quantum computing but make it unhinged`,
      `what would happen if elon actually bought tiktok`,
      `judge my 3am doomscrolling habits`,
      `why is having a normal sleep schedule suddenly a red flag`,
      `explain the lore behind the latest twitter main character`,
      `what's your most controversial AI take`,
      `why do millennials still use facebook`,
      `decode what 'no cap fr fr' actually means`,
      `explain why apple vision pro flopped`,
      `what's the vibe check on the 2025 economy`,
      `why is everyone saying 'delulu is the solulu'`,
      `explain web3 like a shitpost`,
      `what's the most chronically online thing about checking bluesky and twitter`
    ];

    // Calculate next update time
    const now = new Date();
    const nextUpdate = new Date(now);
    nextUpdate.setHours(nextUpdate.getHours() + 1, 0, 0, 0); // Next hour on the hour
    
    // Cache in Redis for 1 hour
    const cacheData = {
      prompts,
      generatedAt: now.toISOString(),
      nextUpdate: nextUpdate.toISOString()
    };
    
    try {
      await cache.set(cacheKey, JSON.stringify(cacheData), HOURLY_CACHE_DURATION);
      logger.info('Cached trending prompts in Redis for 1 hour', { 
        key: cacheKey, 
        count: prompts.length,
        nextUpdate: nextUpdate.toISOString() 
      });
    } catch (cacheError) {
      logger.warn('Failed to cache trending prompts', { cacheError });
    }
    
    res.json({
      success: true,
      prompts,
      source: 'fresh',
      generatedAt: now.toISOString(),
      nextUpdate: nextUpdate.toISOString()
    });

  } catch (error) {
    logger.error('Error generating trending prompts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate trending prompts'
    });
  }
}

export default handleTrendingPrompts;
