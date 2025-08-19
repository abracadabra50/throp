/**
 * Throp Orchestrator - Fixed version with better error handling
 * Production-ready with Anthropic web search, Twitter, and GeckoTerminal
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
 * Fixed production orchestrator
 */
export declare class ThropFixedOrchestrator {
    private anthropic;
    private twitterSearch;
    private twitterClient;
    private gecko;
    private responseGenerator;
    private model;
    private twitterEnabled;
    constructor();
    /**
     * Main processing pipeline
     */
    process(input: string, context?: AnswerContext): Promise<AnswerEngineResponse>;
    /**
     * Gather evidence using Claude with built-in web search and APIs
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
     * Search Twitter using existing credentials (with graceful fallback)
     */
    private searchTwitter;
    /**
     * Search Twitter profile using existing credentials (with graceful fallback)
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
export declare function createFixedOrchestrator(): ThropFixedOrchestrator;
//# sourceMappingURL=orchestrator-fixed.d.ts.map