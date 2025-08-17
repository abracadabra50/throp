/**
 * Perplexity Chaos Engine - Perplexity AI with Throp's chaotic personality
 * Real-time information but make it unhinged
 */
import { PerplexityEngine } from './perplexity.js';
import type { AnswerContext, AnswerEngineResponse } from '../types.js';
/**
 * Chaos-enhanced Perplexity engine
 */
export declare class PerplexityChaosEngine extends PerplexityEngine {
    constructor();
    /**
     * Generate response and apply chaos formatting
     */
    generateResponse(context: AnswerContext): Promise<AnswerEngineResponse>;
    /**
     * Generate a proactive tweet from a prompt
     */
    generateProactiveTweet(prompt: string, _context?: any): Promise<string>;
    /**
     * Generate a thread about a topic with progressive chaos
     */
    generateProactiveThread(prompt: string, maxTweets?: number): Promise<string[]>;
    /**
     * React to trending topics with chaos energy
     */
    reactToTrend(topic: string, sentiment?: 'bullish' | 'bearish' | 'neutral'): Promise<string>;
}
/**
 * Factory function to create chaos engine
 */
export declare function createPerplexityChaosEngine(): PerplexityChaosEngine;
//# sourceMappingURL=perplexity-chaos.d.ts.map