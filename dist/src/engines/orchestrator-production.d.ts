/**
 * Throp Orchestrator - Production version using Anthropic's web search tool
 * Integrates with existing Twitter credentials and GeckoTerminal free API
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
    process(input: string, context?: AnswerContext): Promise<AnswerEngineResponse>;
    /**
     * Gather evidence using Claude with built-in web search and existing APIs
     */
    private gatherEvidence;
    /**
     * Analyze query to determine intent and domain
     */
    private analyzeQuery;
    /**
     * Gather identity evidence using web search + Twitter
     */
    private gatherIdentityEvidence;
    /**
     * Gather crypto evidence using GeckoTerminal + web search
     */
    private gatherCryptoEvidence;
    /**
     * Gather current events evidence using web search + Twitter
     */
    private gatherCurrentEvidence;
    /**
     * Gather web evidence using Anthropic's web search
     */
    private gatherWebEvidence;
    /**
     * Search web using Anthropic's built-in web search tool
     */
    private searchWeb;
    /**
     * Search Twitter using existing credentials
     */
    private searchTwitter;
    /**
     * Search Twitter profile using existing credentials
     */
    private searchTwitterProfile;
    /**
     * Get crypto price using GeckoTerminal free API
     */
    private getCryptoPrice;
}
/**
 * Factory function
 */
export declare function createProductionOrchestrator(): ThropProductionOrchestrator;
//# sourceMappingURL=orchestrator-production.d.ts.map