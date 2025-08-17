#!/usr/bin/env tsx

/**
 * Test Twitter Search Integration with bags app drama
 */

import { config as loadEnv } from 'dotenv';
import { createHybridClaudeEngine } from './src/engines/hybrid-claude.js';
import { logger } from './src/utils/logger.js';
import type { AnswerContext } from './src/types.js';

// Load environment
loadEnv();

async function testBagsAppDrama() {
  console.log('\n🔍 Testing Twitter Search Integration\n');
  console.log('=' .repeat(60));
  
  try {
    // Create the hybrid engine
    const engine = createHybridClaudeEngine();
    
    // Test question about bags app drama
    const context: AnswerContext = {
      question: "what's the latest with the bags app / thread guy drama?",
      author: {
        username: 'test_user',
        name: 'Test User',
      },
    };
    
    console.log('📝 Question:', context.question);
    console.log('\n⏳ Generating response (this will search Twitter)...\n');
    
    // Generate response
    const response = await engine.generateResponse(context);
    
    console.log('=' .repeat(60));
    console.log('\n🤖 Throp\'s Response:\n');
    console.log(response.text);
    console.log('\n' + '=' .repeat(60));
    
    // Show metadata
    console.log('\n📊 Metadata:');
    console.log('- Twitter searched:', response.metadata?.twitterSearched ? 'Yes ✅' : 'No ❌');
    console.log('- Response length:', response.text.length);
    console.log('- Citations:', response.citations?.length || 0);
    
  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

// Run the test
testBagsAppDrama().catch(console.error);
