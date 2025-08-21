/**
 * Answer Engine Factory
 * Creates the appropriate answer engine based on configuration
 */

import { BaseAnswerEngine } from './base.js';
import { createPerplexityEngine } from './perplexity.js';
import { createIntelligentPerplexityEngine } from './perplexity-intelligent.js';
import { createPerplexityChaosEngine } from './perplexity-chaos.js';
import { createHybridClaudeEngine } from './hybrid-claude.js';
import { logger } from '../utils/logger.js';
import { getConfig } from '../config.js';

/**
 * Create the configured answer engine
 */
export function createAnswerEngine(): BaseAnswerEngine {
  const config = getConfig();
  const engineType = config.bot.answerEngine;
  
  logger.info('Creating answer engine', { type: engineType });
  
  switch (engineType) {
    case 'perplexity':
      return createPerplexityEngine();
      
    case 'perplexity-intelligent':
      logger.info('🧠 Initializing Intelligent Perplexity Engine with Extended Thinking + Sonar Reasoning');
      return createIntelligentPerplexityEngine();
      
    case 'perplexity-chaos':
      return createPerplexityChaosEngine();
      
    case 'hybrid-claude':
      return createHybridClaudeEngine();
      
    case 'custom':
      throw new Error('Custom answer engine not implemented. Please provide your own implementation.');
      
    default:
      logger.warn('Unknown answer engine type, falling back to hybrid-claude', { engineType });
      return createHybridClaudeEngine();
  }
}

/**
 * Get available answer engines with descriptions
 */
export function getAvailableEngines(): Record<string, string> {
  return {
    'hybrid-claude': 'Perplexity for facts + Claude for personality (default)',
    'perplexity': 'Pure Perplexity with static community knowledge',
    'perplexity-intelligent': '🧠 NEW: Extended Thinking + Sonar Reasoning for dynamic community analysis',
    'perplexity-chaos': 'Perplexity with maximum chaos energy',
    'custom': 'User-defined engine implementation'
  };
}
