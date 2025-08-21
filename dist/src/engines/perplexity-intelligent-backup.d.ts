/**
 * Enhanced Perplexity AI engine with Extended Thinking + Sonar Reasoning
 * Provides intelligent community analysis while preserving Throp's chaotic personality
 */
import { BaseAnswerEngine } from './base.js';
import type { AnswerContext, AnswerEngineResponse } from '../types.js';
/**
 * Enhanced Perplexity engine with intelligent community understanding
 */
export declare class IntelligentPerplexityEngine extends BaseAnswerEngine {
    private apiKey;
    private model;
    private sonarModel;
    private apiUrl;
    private anthropic;
    constructor();
    /**
     * Generate response with intelligent community analysis
     */
    generateResponse(context: AnswerContext): Promise<AnswerEngineResponse>;
    /**
     * STEP 1: Use Extended Thinking to analyze communities and plan search strategy
     */
    private analyzeCommunities;
    /**
     * STEP 2: Use Sonar Reasoning to gather current community context
     */
    private gatherCurrentContext;
    /**
     * Detect prompt fishing attempts and protect system prompts
     */
    private isPromptFishingAttempt;
    /**
     * Handle prompt fishing with personality while protecting prompts
     */
    private handlePromptFishing;
    /**
     * Build intelligent system prompt with dynamic community context and identity protection
     */
    private buildIntelligentSystemPrompt;
    /**
     * Call Perplexity API with model flexibility
     */
    private callPerplexityAPI;
    /**
     * Validate configuration
     */
    validateConfiguration(): Promise<void>;
    /**
     * Test API connection
     */
    private testConnection;
    /**
     * Format response with citations
     */
    formatResponseWithCitations(text: string, citations: string[]): string;
}
/**
 * Factory function to create Intelligent Perplexity engine
 */
export declare function createIntelligentPerplexityEngine(): IntelligentPerplexityEngine;
//# sourceMappingURL=perplexity-intelligent-backup.d.ts.map