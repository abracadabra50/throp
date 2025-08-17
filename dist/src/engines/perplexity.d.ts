/**
 * Perplexity AI answer engine implementation
 * Provides real-time web search and up-to-date information
 */
import { BaseAnswerEngine } from './base.js';
import type { AnswerContext, AnswerEngineResponse } from '../types.js';
/**
 * Perplexity-powered answer engine with web search capabilities
 */
export declare class PerplexityEngine extends BaseAnswerEngine {
    private apiKey;
    private model;
    private apiUrl;
    constructor();
    /**
     * Validate Perplexity configuration
     */
    validateConfiguration(): Promise<void>;
    /**
     * Generate a response using Perplexity AI
     */
    generateResponse(context: AnswerContext): Promise<AnswerEngineResponse>;
    /**
     * Build system prompt for Twitter bot behaviour
     */
    private buildSystemPrompt;
    /**
     * Build enhanced prompt with all context
     */
    private buildEnhancedPrompt;
    /**
     * Call the Perplexity API
     */
    private callPerplexityAPI;
    /**
     * Test API connection
     */
    private testConnection;
    /**
     * Format response with citations for Twitter
     */
    formatResponseWithCitations(text: string, citations: string[]): string;
}
/**
 * Factory function to create Perplexity engine
 */
export declare function createPerplexityEngine(): PerplexityEngine;
//# sourceMappingURL=perplexity.d.ts.map