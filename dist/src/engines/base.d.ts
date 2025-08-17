/**
 * Base interface for all answer engines
 * Provides a common contract for different AI providers
 */
import type { AnswerContext, AnswerEngineResponse } from '../types.js';
/**
 * Abstract base class for answer engines
 */
export declare abstract class BaseAnswerEngine {
    protected name: string;
    protected maxTokens: number;
    protected temperature: number;
    constructor(name: string, maxTokens?: number, temperature?: number);
    /**
     * Generate a response to a question
     * @param context The context containing the question and metadata
     * @returns The generated response
     */
    abstract generateResponse(context: AnswerContext): Promise<AnswerEngineResponse>;
    /**
     * Validate that the engine is properly configured
     * @throws Error if configuration is invalid
     */
    abstract validateConfiguration(): Promise<void>;
    /**
     * Format the response for Twitter's character limits
     * @param response The raw response text
     * @param maxLength Maximum length for a single tweet
     * @returns Formatted response, split into thread if needed
     */
    protected formatForTwitter(response: string, maxLength?: number): string[];
    /**
     * Build a prompt from the context
     * @param context The answer context
     * @returns Formatted prompt string
     */
    protected buildPrompt(context: AnswerContext): string;
    /**
     * Get engine name
     */
    getName(): string;
    /**
     * Check if response needs threading
     */
    protected shouldThread(response: string, maxLength?: number): boolean;
}
//# sourceMappingURL=base.d.ts.map