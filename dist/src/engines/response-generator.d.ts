/**
 * Dynamic Response Generator using LLM for contextual, funny responses
 * No templates, just pure chaos generation based on evidence
 */
import type { Evidence } from './orchestrator.js';
export declare class ResponseGenerator {
    private anthropic;
    constructor();
    /**
     * Generate a response using Claude Haiku (cheap and fast) based on evidence
     */
    generateResponse(evidence: Evidence): Promise<string>;
    /**
     * Build the system prompt based on intent and domain
     */
    private getSystemPrompt;
    /**
     * Get domain-specific personality traits
     */
    private getDomainVibes;
    /**
     * Build contextual prompt with evidence
     */
    private buildContextualPrompt;
    /**
     * Ensure response has proper chaos formatting
     */
    private ensureChaosFormatting;
    /**
     * Fallback responses when LLM fails
     */
    private getFallbackResponse;
    /**
     * Generate a disambiguation response
     */
    generateDisambiguationResponse(evidence: Evidence): Promise<string>;
}
/**
 * Factory function
 */
export declare function createResponseGenerator(): ResponseGenerator;
//# sourceMappingURL=response-generator.d.ts.map