#!/usr/bin/env node

/**
 * Test production orchestrator with real APIs
 * Uses Anthropic web search, existing Twitter credentials, and GeckoTerminal
 */

import 'dotenv/config';
import { createProductionOrchestrator } from './src/engines/orchestrator-production.js';
import { createHybridClaudeEngine } from './src/engines/hybrid-claude.js';

// Focused test queries to compare
const testQueries = [
  "who is vitalik buterin",
  "what's the price of SOL",
  "latest AI news",
  "who is @elonmusk",
  "how is bitcoin doing"
];

async function testProductionOrchestrator() {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 TESTING PRODUCTION ORCHESTRATOR (Anthropic Web Search + Real APIs)');
  console.log('='.repeat(80) + '\n');
  
  const orchestrator = createProductionOrchestrator();
  
  for (const query of testQueries) {
    try {
      console.log(`\n📝 Query: "${query}"`);
      console.log('-'.repeat(60));
      
      const startTime = Date.now();
      const response = await orchestrator.process(query);
      const duration = Date.now() - startTime;
      
      console.log(`✨ Response: ${response.text}`);
      console.log(`📊 Confidence: ${response.confidence}`);
      console.log(`🏷️ Intent: ${response.metadata?.intent || 'unknown'}`);
      console.log(`🌐 Domain: ${response.metadata?.domain || 'unknown'}`);
      console.log(`🔧 Tools: ${response.metadata?.tool_calls || 'none'}`);
      console.log(`⏱️ Time: ${duration}ms`);
      
      if (response.metadata?.sources && response.metadata.sources.length > 0) {
        console.log(`📚 Sources: ${response.metadata.sources.length} found`);
        console.log(`   First source: ${response.metadata.sources[0].substring(0, 50)}...`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
}

async function testCurrentProduction() {
  console.log('\n' + '='.repeat(80));
  console.log('🏭 TESTING CURRENT PRODUCTION (HybridClaudeEngine)');
  console.log('='.repeat(80) + '\n');
  
  const engine = createHybridClaudeEngine();
  
  for (const query of testQueries) {
    try {
      console.log(`\n📝 Query: "${query}"`);
      console.log('-'.repeat(60));
      
      const startTime = Date.now();
      const response = await engine.generateResponse({
        question: query,
        author: {
          username: 'test_user',
          name: 'Test User'
        }
      });
      const duration = Date.now() - startTime;
      
      console.log(`✨ Response: ${response.text}`);
      console.log(`📊 Confidence: ${response.confidence || 'N/A'}`);
      console.log(`⏱️ Time: ${duration}ms`);
      
      if (response.citations && response.citations.length > 0) {
        console.log(`📚 Citations: ${response.citations.length} found`);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
}

async function runProductionTest() {
  console.log('🚀 Starting Production Orchestrator Test');
  console.log('Testing with real APIs: Anthropic Web Search, Twitter, GeckoTerminal\n');
  
  // Test production orchestrator
  await testProductionOrchestrator();
  
  console.log('\n' + '='.repeat(80));
  console.log('Waiting 5 seconds before testing current production...');
  console.log('='.repeat(80));
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Test current production
  await testCurrentProduction();
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Production comparison complete!');
  console.log('='.repeat(80));
  console.log('\nExpected improvements:');
  console.log('1. ✅ Uses Anthropic\'s native web search (more reliable)');
  console.log('2. ✅ Integrates with existing Twitter credentials');  
  console.log('3. ✅ Real crypto prices from GeckoTerminal free API');
  console.log('4. ✅ Better intent detection and domain classification');
  console.log('5. ✅ Dynamic responses based on real evidence');
  console.log('6. ✅ Proper source citations and confidence scoring');
}

// Run the test
runProductionTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
