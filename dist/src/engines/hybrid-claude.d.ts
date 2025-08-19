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
     * Generate response using enhanced approach with Anthropic web search
     */
    generateResponse(context: AnswerContext): Promise<AnswerEngineResponse>;
    /**
     * Generate enhanced response using Anthropic web search
     */
    private generateEnhancedResponse;
    /**
     * Original Perplexity response method
     */
    private generatePerplexityResponse;
    /**
     * Determine if we should use web search for better results
     */
    private shouldUseWebSearch;
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
     * Assess the complexity of a question for roasting purposes
     */
    private assessQuestionComplexity;
    /**
     * Determine appropriate roast level based on question
     */
    private determineRoastLevel;
    /**
     * Guess user's emotional state for better roasting
     */
    private guessUserMood;
    /**
     * Apply Throp's personality using Claude
     */
    private applyThropPersonality;
    /**
     * Generate direct LLM response (fallback)
     */
    generateDirectResponse(context: AnswerContext): Promise<AnswerEngineResponse>;
    /**
     * Build system prompt for direct responses
     */
    private buildSystemPrompt;
    /**
     * Generate a proactive tweet with enhanced personality
     */
    generateProactiveTweet(prompt: string): Promise<string>;
    /**
     * Generate a thread with progressive chaos
     */
    generateProactiveThread(prompt: string, maxTweets?: number): Promise<string[]>;
}
/**
 * Factory function to create a HybridClaudeEngine instance
 */
export declare function createHybridClaudeEngine(): HybridClaudeEngine;
//# sourceMappingURL=hybrid-claude.d.ts.map