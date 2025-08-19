/**
 * Throp Orchestrator - The brain that coordinates evidence gathering and chaos generation
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
     * Get tool definitions for Anthropic
     */
    private getToolDefinitions;
    /**
     * Execute tool calls from Claude's response
     */
    private executeToolCalls;
    /**
     * Extract key facts from search results
     */
    private extractKeyFacts;
    /**
     * Handle disambiguation
     */
    private handleDisambiguation;
    /**
     * Route to appropriate response handler
     */
    private routeToHandler;
    /**
     * Apply Throp's personality to the response
     */
    private applyThropPersonality;
    /**
     * Final chaos formatting check
     */
    private ensureChaos;
}
/**
 * Factory function
 */
export declare function createOrchestrator(): ThropOrchestrator;
//# sourceMappingURL=orchestrator.d.ts.map