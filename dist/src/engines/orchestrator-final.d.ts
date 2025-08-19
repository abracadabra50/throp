/**
 * Throp Orchestrator Final - Production-ready with proper model names
 * Understands all internet culture: crypto, gaming, streaming, tech, memes, and beyond
 */
import type { AnswerContext, AnswerEngineResponse } from '../types.js';
/**
 * Evidence gathered from tools
 */
export interface Evidence {
    intent: 'identity' | 'market' | 'drama' | 'gaming' | 'tech' | 'culture' | 'explainer' | 'roast' | 'pure_chaos';
    query: string;
    domain: 'crypto' | 'gaming' | 'streaming' | 'tech' | 'academic' | 'fitness' | 'food' | 'general';
    evidence: {
        web_results?: any[];
        twitter_data?: any;
        price_data?: any;
        chart_data?: any;
        key_facts: string[];
        sources: string[];
    };
    confidence: number;
    needs_disambiguation: boolean;
    candidates?: Array<{
        name: string;
        desc: string;
        context: string;
    }>;
}
/**
 * Main orchestrator that coordinates Throp's response generation
 */
export declare class ThropOrchestrator {
    private anthropic;
    private webSearch;
    private twitter;
    private gecko;
    private responseGenerator;
    private model;
    constructor();
    /**
     * Main processing pipeline
     */
    process(input: string, context?: AnswerContext): Promise<AnswerEngineResponse>;
    /**
     * Gather evidence using Claude with tools
     */
    private gatherEvidence;
    /**
     * Fallback query analysis when JSON parsing fails
     */
    private analyzeQueryFallback;
    /**
     * Get tool definitions for Anthropic
     */
    private getToolDefinitions;
    /**
     * Handle disambiguation
     */
    private handleDisambiguation;
}
/**
 * Factory function
 */
export declare function createOrchestrator(): ThropOrchestrator;
//# sourceMappingURL=orchestrator-final.d.ts.map