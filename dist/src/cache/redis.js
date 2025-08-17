/**
 * Redis cache implementation for Throp bot
 * Provides persistent storage and caching for both bot and web interface
 */
import IORedis from 'ioredis';
import { logger } from '../utils/logger.js';
import { getConfig } from '../config.js';
/**
 * Redis cache manager
 */
export class RedisCache {
    client = null;
    namespace;
    ttl = {
        mention: 86400, // 24 hours
        tweet: 3600, // 1 hour
        user: 7200, // 2 hours
        interaction: 604800, // 7 days
        state: 0, // No expiry for state
    };
    constructor() {
        const config = getConfig();
        this.namespace = config.redis.namespace || 'throp';
    }
    /**
     * Connect to Redis
     */
    async connect() {
        const config = getConfig();
        if (!config.redis.url || config.redis.url === 'redis://localhost:6379') {
            logger.info('Redis not configured, using in-memory fallback');
            return;
        }
        try {
            this.client = new IORedis(config.redis.url, {
                retryStrategy: (times) => {
                    if (times > 1) {
                        // Stop retrying after first attempt
                        logger.warn('Redis not available, using in-memory fallback');
                        this.client = null;
                        return null;
                    }
                    return 100; // Try once after 100ms
                },
                maxRetriesPerRequest: 1,
                enableOfflineQueue: false,
                lazyConnect: true,
            });
            // Setup handlers before connecting
            this.client.on('error', () => {
                // Silently ignore errors to avoid spam
            });
            this.client.on('close', () => {
                // Silently handle close
            });
            // Try to connect with timeout
            const connectTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 2000));
            await Promise.race([
                this.client.connect(),
                connectTimeout
            ]);
            // Test connection
            await this.client.ping();
            logger.success('Redis connected successfully');
        }
        catch (error) {
            // Silently fall back to in-memory cache
            logger.info('Using in-memory cache (Redis not available)');
            this.client = null;
        }
    }
    /**
     * Disconnect from Redis
     */
    async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.client = null;
            logger.info('Redis disconnected');
        }
    }
    /**
     * Check if Redis is connected
     */
    async isConnected() {
        if (!this.client)
            return false;
        try {
            await this.client.ping();
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Generate a namespaced key
     */
    key(...parts) {
        return [this.namespace, ...parts].join(':');
    }
    /**
     * Get bot state
     */
    async getState() {
        if (!this.client)
            return this.getInMemoryState();
        try {
            const data = await this.client.get(this.key('state'));
            if (!data)
                return null;
            const state = JSON.parse(data);
            // Convert Set from array
            state.processedMentions = new Set(state.processedMentions || []);
            return state;
        }
        catch (error) {
            logger.error('Failed to get state from Redis', error);
            return null;
        }
    }
    /**
     * Save bot state
     */
    async saveState(state) {
        if (!this.client) {
            this.saveInMemoryState(state);
            return;
        }
        try {
            // Convert Set to array for JSON serialization
            const stateToSave = {
                ...state,
                processedMentions: Array.from(state.processedMentions),
            };
            await this.client.set(this.key('state'), JSON.stringify(stateToSave));
            logger.debug('State saved to Redis');
        }
        catch (error) {
            logger.error('Failed to save state to Redis', error);
        }
    }
    /**
     * Cache a mention
     */
    async cacheMention(mention) {
        if (!this.client)
            return;
        try {
            await this.client.setex(this.key('mention', mention.id), this.ttl.mention, JSON.stringify(mention));
        }
        catch (error) {
            logger.error('Failed to cache mention', error);
        }
    }
    /**
     * Get cached mention
     */
    async getCachedMention(mentionId) {
        if (!this.client)
            return null;
        try {
            const data = await this.client.get(this.key('mention', mentionId));
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            logger.error('Failed to get cached mention', error);
            return null;
        }
    }
    /**
     * Cache multiple mentions
     */
    async cacheMentions(mentions) {
        if (!this.client || mentions.length === 0)
            return;
        try {
            const pipeline = this.client.pipeline();
            for (const mention of mentions) {
                pipeline.setex(this.key('mention', mention.id), this.ttl.mention, JSON.stringify(mention));
            }
            await pipeline.exec();
            logger.debug(`Cached ${mentions.length} mentions`);
        }
        catch (error) {
            logger.error('Failed to cache mentions', error);
        }
    }
    /**
     * Cache an interaction (for web interface)
     */
    async cacheInteraction(question, response, source = 'web') {
        if (!this.client)
            return;
        try {
            const interaction = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                question,
                response,
                timestamp: new Date(),
                source,
            };
            // Add to sorted set for recent interactions
            await this.client.zadd(this.key('interactions'), Date.now(), JSON.stringify(interaction));
            // Trim to keep only recent 1000 interactions
            await this.client.zremrangebyrank(this.key('interactions'), 0, -1001);
            // Update stats
            await this.incrementStat('responsesGenerated');
        }
        catch (error) {
            logger.error('Failed to cache interaction', error);
        }
    }
    /**
     * Get recent interactions
     */
    async getRecentInteractions(limit = 100) {
        if (!this.client)
            return [];
        try {
            const data = await this.client.zrevrange(this.key('interactions'), 0, limit - 1);
            return data.map((item) => JSON.parse(item));
        }
        catch (error) {
            logger.error('Failed to get recent interactions', error);
            return [];
        }
    }
    /**
     * Cache generic data
     */
    async cache(key, data, ttl) {
        if (!this.client)
            return;
        try {
            const cacheKey = this.key('cache', key);
            const cacheData = {
                data,
                timestamp: Date.now(),
                ttl: ttl || 3600,
            };
            if (ttl && ttl > 0) {
                await this.client.setex(cacheKey, ttl, JSON.stringify(cacheData));
            }
            else {
                await this.client.set(cacheKey, JSON.stringify(cacheData));
            }
        }
        catch (error) {
            logger.error('Failed to cache data', error);
        }
    }
    /**
     * Get cached data
     */
    async get(key) {
        if (!this.client)
            return null;
        try {
            const data = await this.client.get(this.key('cache', key));
            if (!data)
                return null;
            const cacheEntry = JSON.parse(data);
            return cacheEntry.data;
        }
        catch (error) {
            logger.error('Failed to get cached data', error);
            return null;
        }
    }
    /**
     * Generic set method for simple key-value storage
     */
    async set(key, value, ttl) {
        if (!this.client)
            return;
        try {
            const cacheKey = this.key(key);
            if (ttl && ttl > 0) {
                await this.client.setex(cacheKey, ttl, value);
            }
            else {
                await this.client.set(cacheKey, value);
            }
        }
        catch (error) {
            logger.error('Failed to set cache value', error);
        }
    }
    /**
     * Delete cached data
     */
    async delete(key) {
        if (!this.client)
            return;
        try {
            await this.client.del(this.key('cache', key));
        }
        catch (error) {
            logger.error('Failed to delete cached data', error);
        }
    }
    /**
     * Clear all cache
     */
    async clear() {
        if (!this.client)
            return;
        try {
            const keys = await this.client.keys(this.key('*'));
            if (keys.length > 0) {
                await this.client.del(...keys);
                logger.info(`Cleared ${keys.length} cache entries`);
            }
        }
        catch (error) {
            logger.error('Failed to clear cache', error);
        }
    }
    /**
     * Increment a stat counter
     */
    async incrementStat(stat) {
        if (!this.client)
            return;
        try {
            await this.client.hincrby(this.key('stats'), stat, 1);
        }
        catch (error) {
            logger.error('Failed to increment stat', error);
        }
    }
    /**
     * Get stats
     */
    async getStats() {
        if (!this.client) {
            return {
                mentionsProcessed: 0,
                responsesGenerated: 0,
                errors: 0,
            };
        }
        try {
            const stats = await this.client.hgetall(this.key('stats'));
            return {
                mentionsProcessed: parseInt(stats.mentionsProcessed || '0'),
                responsesGenerated: parseInt(stats.responsesGenerated || '0'),
                errors: parseInt(stats.errors || '0'),
                lastRun: stats.lastRun ? new Date(stats.lastRun) : undefined,
            };
        }
        catch (error) {
            logger.error('Failed to get stats', error);
            return {
                mentionsProcessed: 0,
                responsesGenerated: 0,
                errors: 0,
            };
        }
    }
    /**
     * Set last run time
     */
    async setLastRun() {
        if (!this.client)
            return;
        try {
            await this.client.hset(this.key('stats'), 'lastRun', new Date().toISOString());
        }
        catch (error) {
            logger.error('Failed to set last run time', error);
        }
    }
    // In-memory fallback methods
    inMemoryState = null;
    getInMemoryState() {
        return this.inMemoryState;
    }
    saveInMemoryState(state) {
        this.inMemoryState = state;
    }
}
/**
 * Create singleton Redis cache instance
 */
let cacheInstance = null;
export function getRedisCache() {
    if (!cacheInstance) {
        cacheInstance = new RedisCache();
    }
    return cacheInstance;
}
//# sourceMappingURL=redis.js.map