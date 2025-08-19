/**
 * Engine Factory - Creates the appropriate answer engine based on configuration
 */
import { logger } from '../utils/logger.js';
import { getConfig } from '../config.js';
import { createHybridClaudeEngine } from './hybrid-claude.js';
import { createHybridClaudeEngineV2 } from './hybrid-claude-v2.js';
import { createPerplexityEngine } from './perplexity.js';
import { createPerplexityChaosEngine } from './perplexity-chaos.js';
/**
 * Create answer engine based on configuration
 */
export function createAnswerEngine() {
    const config = getConfig();
    const engineType = config.bot.answerEngine;
    logger.info('Creating answer engine', { type: engineType });
    switch (engineType) {
        case 'hybrid-claude':
            return createHybridClaudeEngine();
        case 'hybrid-claude-v2':
            logger.info('Using enhanced hybrid engine with Anthropic web search');
            return createHybridClaudeEngineV2();
        case 'perplexity':
            return createPerplexityEngine();
        case 'perplexity-chaos':
            return createPerplexityChaosEngine();
        default:
            logger.warn(`Unknown engine type: ${engineType}, falling back to hybrid-claude`);
            return createHybridClaudeEngine();
    }
}
/**
 * Legacy factory function for backwards compatibility
 */
export function createHybridClaudeEngineFromConfig() {
    const config = getConfig();
    // If V2 is configured, use it
    if (config.bot.answerEngine === 'hybrid-claude-v2') {
        return createHybridClaudeEngineV2();
    }
    // Otherwise use original
    return createHybridClaudeEngine();
}
//# sourceMappingURL=factory.js.map