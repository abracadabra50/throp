#!/usr/bin/env tsx

/**
 * Test script for Perplexity integration
 * This allows testing Perplexity without Twitter credentials
 */

import { config as loadEnv } from 'dotenv';
import { createPerplexityEngine } from './src/engines/perplexity.js';
import { logger } from './src/utils/logger.js';
import type { AnswerContext } from './src/types.js';
import chalk from 'chalk';

// Load environment variables
loadEnv();

/**
 * Test Perplexity with a simple query
 */
async function testPerplexity() {
  console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🧪 THROP PERPLEXITY TEST                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`));

  try {
    logger.header('Testing Perplexity Integration');
    
    // Create Perplexity engine
    const engine = createPerplexityEngine();
    
    // Validate configuration
    logger.info('Validating Perplexity configuration...');
    await engine.validateConfiguration();
    logger.success('✅ Perplexity configuration valid!');
    
    // Test queries
    const testQueries = [
      "What's the latest news about AI today?",
      "Who won the most recent Super Bowl?",
      "What is the current price of Bitcoin?",
    ];
    
    for (const query of testQueries) {
      logger.divider();
      logger.info(`📝 Query: "${query}"`);
      
      const context: AnswerContext = {
        question: query,
        author: {
          username: 'test_user',
          name: 'Test User',
        },
      };
      
      const startTime = Date.now();
      const response = await engine.generateResponse(context);
      const duration = Date.now() - startTime;
      
      logger.success(`✅ Response generated in ${duration}ms`);
      console.log(chalk.green('\n📢 Response:'));
      console.log(chalk.white(response.text));
      
      if (response.citations && response.citations.length > 0) {
        console.log(chalk.yellow('\n📚 Citations:'));
        response.citations.forEach((citation, index) => {
          console.log(chalk.gray(`  ${index + 1}. ${citation}`));
        });
      }
      
      if (response.metadata?.usage) {
        console.log(chalk.blue('\n📊 Token Usage:'));
        console.log(chalk.gray(`  Prompt: ${response.metadata.usage.prompt_tokens}`));
        console.log(chalk.gray(`  Completion: ${response.metadata.usage.completion_tokens}`));
        console.log(chalk.gray(`  Total: ${response.metadata.usage.total_tokens}`));
      }
      
      if (response.shouldThread) {
        console.log(chalk.magenta('\n🧵 Would be threaded on Twitter:'));
        response.threadParts?.forEach((part, index) => {
          console.log(chalk.gray(`  Part ${index + 1}: ${part.substring(0, 50)}...`));
        });
      }
    }
    
    logger.divider();
    logger.success('🎉 All tests passed successfully!');
    console.log(chalk.green('\n✨ Perplexity integration is working perfectly!'));
    console.log(chalk.cyan('You can now use Throp with real-time web search capabilities.\n'));
    
  } catch (error) {
    logger.error('❌ Test failed', error);
    console.error(chalk.red('\n⚠️ Please check your Perplexity API key in .env file'));
    process.exit(1);
  }
}

// Run the test
testPerplexity().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
