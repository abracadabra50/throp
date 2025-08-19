/**
 * Hybrid Engine V2: Enhanced with new orchestrator
 * Uses Anthropic web search, existing Twitter, and GeckoTerminal
 */
import { BaseAnswerEngine } from './base.js';
import type { AnswerContext, AnswerEngineResponse } from '../types.js';
export declare class HybridClaudeEngineV2 extends BaseAnswerEngine {
    private orchestrator;
    private perplexity;
    private anthropic;
    private model;
    constructor();
    /**
     * Validate configuration (required by base class)
     */
    validateConfiguration(): Promise<void>;
    /**
     * Generate response using new orchestrator for better queries
     */
    generateResponse(context: AnswerContext): Promise<AnswerEngineResponse>;
    /**
     * Determine if we should use the orchestrator
     */
    private shouldUseOrchestrator;
    /**
     * Original hybrid response method as fallback
     */
    private generateHybridResponse;
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
export declare function createHybridClaudeEngineV2(): HybridClaudeEngineV2;
//# sourceMappingURL=hybrid-claude-v2.d.ts.map