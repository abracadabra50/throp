/**
 * Throp Orchestrator - Production version using Anthropic's web search tool
 * Integrates with existing Twitter credentials and GeckoTerminal free API
 */
import type { AnswerEngineResponse } from '../types.js';
/**
 * Evidence structure for orchestrator
 */
export interface Evidence {
    intent: string;
    domain: string;
    confidence: number;
    needs_disambiguation: boolean;
    disambiguation_options?: string[];
    evidence: {
        key_facts: string[];
        sources: string[];
        context: Record<string, any>;
    };
}
/**
 * Production orchestrator using real APIs
 */
export declare class ThropProductionOrchestrator {
    private anthropic;
    private twitterSearch;
    private twitterClient;
    private gecko;
    private responseGenerator;
    private model;
    constructor();
    /**
     * Main processing pipeline
     */
    process(input: string, context?: any): Promise<AnswerEngineResponse>;
    /**
     * Gather evidence using Claude with tools
     */
    private gatherEvidence;
    /**
     * Parse evidence from Claude's response
     */
    private parseEvidence;
    /**
     * Get fallback evidence when parsing fails
     */
    private getFallbackEvidence;
    /**
     * Handle disambiguation when multiple matches found
     */
    private handleDisambiguation;
    /**
     * Get tool definitions for Claude
     */
    private getToolDefinitions;
}
/**
 * Factory function
 */
export declare function createProductionOrchestrator(): ThropProductionOrchestrator;
//# sourceMappingURL=orchestrator-production.d.ts.map