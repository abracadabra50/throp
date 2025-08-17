/**
 * Hybrid Engine: Perplexity for facts, Claude for personality
 * This gives us the best of both worlds
 */
import { BaseAnswerEngine } from './base.js';
import type { AnswerContext, AnswerEngineResponse } from '../types.js';
export declare class HybridClaudeEngine extends BaseAnswerEngine {
    private perplexity;
    private anthropic;
    private model;
    constructor();
    /**
     * Validate configuration (required by base class)
     */
    validateConfiguration(): Promise<void>;
    validate(): Promise<boolean>;
    /**
     * Generate response using Perplexity for facts, then Claude for personality
     */
    generateResponse(context: AnswerContext): Promise<AnswerEngineResponse>;
    /**
     * Determine if we should search Twitter for additional context
     */
    private shouldSearchTwitter;
    /**
     * Get Twitter context for the question
     */
    private getTwitterContext;
    /**
     * Extract search terms from question
     */
    private extractSearchTerms;
    /**
     * Apply Throp's personality using Claude
     */
    private applyThropPersonality;
    /**
     * Generate a proactive tweet
     */
    generateProactiveTweet(prompt: string): Promise<string>;
    /**
     * Generate a thread (if needed)
     */
    generateProactiveThread(prompt: string, maxTweets?: number): Promise<string[]>;
}
/**
 * Factory function
 */
export declare function createHybridClaudeEngine(): HybridClaudeEngine;
//# sourceMappingURL=hybrid-claude.d.ts.map