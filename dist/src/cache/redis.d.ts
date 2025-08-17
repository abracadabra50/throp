/**
 * Redis cache implementation for Throp bot
 * Provides persistent storage and caching for both bot and web interface
 */
import type { BotState, TwitterMention } from '../types.js';
/**
 * Interaction record for caching
 */
interface CachedInteraction {
    id: string;
    question: string;
    response: string;
    timestamp: Date;
    source: 'twitter' | 'web' | 'api';
    metadata?: Record<string, any>;
}
/**
 * Redis cache manager
 */
export declare class RedisCache {
    private client;
    private namespace;
    private ttl;
    constructor();
    /**
     * Connect to Redis
     */
    connect(): Promise<void>;
    /**
     * Disconnect from Redis
     */
    disconnect(): Promise<void>;
    /**
     * Check if Redis is connected
     */
    isConnected(): Promise<boolean>;
    /**
     * Generate a namespaced key
     */
    private key;
    /**
     * Get bot state
     */
    getState(): Promise<BotState | null>;
    /**
     * Save bot state
     */
    saveState(state: BotState): Promise<void>;
    /**
     * Cache a mention
     */
    cacheMention(mention: TwitterMention): Promise<void>;
    /**
     * Get cached mention
     */
    getCachedMention(mentionId: string): Promise<TwitterMention | null>;
    /**
     * Cache multiple mentions
     */
    cacheMentions(mentions: TwitterMention[]): Promise<void>;
    /**
     * Cache an interaction (for web interface)
     */
    cacheInteraction(question: string, response: string, source?: 'twitter' | 'web' | 'api'): Promise<void>;
    /**
     * Get recent interactions
     */
    getRecentInteractions(limit?: number): Promise<CachedInteraction[]>;
    /**
     * Cache generic data
     */
    cache<T>(key: string, data: T, ttl?: number): Promise<void>;
    /**
     * Get cached data
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Generic set method for simple key-value storage
     */
    set(key: string, value: string, ttl?: number): Promise<void>;
    /**
     * Delete cached data
     */
    delete(key: string): Promise<void>;
    /**
     * Clear all cache
     */
    clear(): Promise<void>;
    /**
     * Increment a stat counter
     */
    incrementStat(stat: keyof BotState['stats']): Promise<void>;
    /**
     * Get stats
     */
    getStats(): Promise<BotState['stats']>;
    /**
     * Set last run time
     */
    setLastRun(): Promise<void>;
    private inMemoryState;
    private getInMemoryState;
    private saveInMemoryState;
}
export declare function getRedisCache(): RedisCache;
export {};
//# sourceMappingURL=redis.d.ts.map