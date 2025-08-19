#!/usr/bin/env node

/**
 * Test script to compare new orchestrator V3 with current production
 * Tests various query types to see the improvements
 */

import 'dotenv/config';
import { createOrchestratorV3 } from './src/engines/orchestrator-v3.js';
import { createHybridClaudeEngine } from './src/engines/hybrid-claude.js';
import { logger } from './src/utils/logger.js';

// Test queries covering different intents and domains
const testQueries = [
  // Identity queries
  "who is vitalik buterin",
  "who is @elonmusk",
  "who is john doe", // Should handle unknown person
  
  // Crypto queries
  "what's the price of SOL",
  "how is bitcoin doing",
  "$BONK price",
  
  // Gaming queries
  "what happened in the game awards",
  "is fortnite dead",
  "latest valorant patch",
  
  // Tech queries
  "what did OpenAI announce",
  "is AI going to kill us all",
  "latest javascript framework",
  
  // Drama queries
  "latest twitter drama",
  "what's the tea with influencers",
  
  // Pure chaos queries
  "why is everything terrible",
  "explain quantum physics",
  "how do i get a girlfriend"
];

async function testOrchestrator() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING NEW ORCHESTRATOR V3 (with fixed JSON parsing)');
  console.log('='.repeat(80) + '\n');
  
  const orchestrator = createOrchestratorV3();
  
  for (const query of testQueries.slice(0, 5)) { // Test first 5 for now
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
      console.log(`⏱️ Time: ${duration}ms`);
      
      if (response.metadata?.sources && response.metadata.sources.length > 0) {
        console.log(`📚 Sources: ${response.metadata.sources.length} found`);
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
  
  for (const query of testQueries.slice(0, 5)) { // Test first 5 for comparison
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

async function runComparison() {
  console.log('🚀 Starting Throp Engine Comparison Test V3');
  console.log('Testing various query types to compare responses\n');
  
  // Test new orchestrator
  await testOrchestrator();
  
  console.log('\n' + '='.repeat(80));
  console.log('Waiting 5 seconds before testing production...');
  console.log('='.repeat(80));
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Test current production
  await testCurrentProduction();
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Comparison test complete!');
  console.log('='.repeat(80));
  console.log('\nKey differences to look for:');
  console.log('1. V3 should properly detect intent and domain');
  console.log('2. V3 should use tools when needed for facts');
  console.log('3. Responses should be more dynamic and contextual');
  console.log('4. Identity queries should search for real data');
  console.log('5. Confidence scores should reflect evidence quality');
}

// Run the comparison
runComparison().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
