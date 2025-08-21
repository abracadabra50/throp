/**
 * Enhanced Perplexity AI engine with Extended Thinking + Sonar Reasoning
 * Provides intelligent community analysis while preserving Throp's chaotic personality
 */
import { BaseAnswerEngine } from './base.js';
import type { AnswerContext, AnswerEngineResponse } from '../types.js';
export declare class IntelligentPerplexityEngine extends BaseAnswerEngine {
    private apiKey;
    private model;
    private sonarModel;
    private apiUrl;
    private anthropic;
    constructor();
    generateResponse(context: AnswerContext): Promise<AnswerEngineResponse>;
    private analyzeCommunities;
    private gatherCurrentContext;
    private isPromptFishingAttempt;
    private handlePromptFishing;
    private generateEnhancedResponse;
    private buildIntelligentSystemPrompt;
    private callPerplexityAPI;
    validateConfiguration(): Promise<void>;
    private testConnection;
    formatResponseWithCitations(text: string, citations: string[]): string;
}
export declare function createIntelligentPerplexityEngine(): IntelligentPerplexityEngine;
//# sourceMappingURL=perplexity-intelligent-clean.d.ts.map