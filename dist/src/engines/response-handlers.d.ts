/**
 * Response handlers for different types of queries across all internet domains
 * Each handler crafts responses that show deep understanding of that culture
 */
import type { Evidence } from './orchestrator.js';
export declare class ResponseHandlers {
    /**
     * Handle identity queries - "who is X"
     */
    static handleIdentity(evidence: Evidence): string;
    /**
     * Handle crypto/market queries
     */
    static handleCrypto(evidence: Evidence): string;
    /**
     * Handle general market queries (stocks, etc)
     */
    static handleGeneralMarket(evidence: Evidence): string;
    /**
     * Handle drama queries
     */
    static handleDrama(evidence: Evidence): string;
    /**
     * Handle gaming queries
     */
    static handleGaming(evidence: Evidence): string;
    /**
     * Handle tech queries
     */
    static handleTech(evidence: Evidence): string;
    /**
     * Handle culture queries (memes, trends, etc)
     */
    static handleCulture(evidence: Evidence): string;
    /**
     * Handle explainer queries
     */
    static handleExplainer(evidence: Evidence): string;
    /**
     * Handle roast queries
     */
    static handleRoast(evidence: Evidence): string;
    /**
     * Handle pure chaos (no evidence needed)
     */
    static handleChaos(evidence: Evidence): string;
    /**
     * Analyze drama sentiment from tweets
     */
    private static analyzeDramaSentiment;
}
//# sourceMappingURL=response-handlers.d.ts.map