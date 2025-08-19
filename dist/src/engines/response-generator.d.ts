/**
 * Response Generator - Creates dynamic responses based on evidence
 * Uses Claude Haiku for cost-effective personality application
 */
import type { Evidence } from './orchestrator-production.js';
/**
 * Generates contextual responses using evidence
 */
export declare class ResponseGenerator {
    private anthropic;
    private model;
    constructor();
    /**
     * Generate response based on evidence
     */
    generateResponse(evidence: Evidence): Promise<string>;
    /**
     * Get domain-specific vibes
     */
    private getDomainVibes;
    /**
     * Get intent-specific handling
     */
    private getIntentHandler;
}
//# sourceMappingURL=response-generator.d.ts.map