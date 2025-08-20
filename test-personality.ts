#!/usr/bin/env tsx

import { createHybridClaudeEngine } from './src/engines/hybrid-claude.js';
import { config } from 'dotenv';

config();

async function testPersonality() {
  console.log('🔥 Testing Throp\'s Enhanced Personality...\n');
  
  const engine = createHybridClaudeEngine();
  
  const testQuestions = [
    'who is vitalik buterin',
    'what is bitcoin',
    'how do I get rich quick',
    'explain quantum computing',
    'why is everything terrible'
  ];
  
  for (const question of testQuestions) {
    console.log(`\n📝 Question: "${question}"`);
    console.log('---');
    
    try {
      const response = await engine.generateResponse({
        question,
        platform: 'web',
        conversationId: 'test-' + Date.now()
      });
      
      console.log('🤖 Throp says:');
      console.log(response.text);
      console.log('---');
      
      // Check personality markers
      const hasLowercase = response.text === response.text.toLowerCase();
      const hasRoasting = /bestie|bro|fr|ngl|skill issue|touch grass/i.test(response.text);
      const hasChaos = /\.\.\.|,,,/i.test(response.text);
      
      console.log('✅ Lowercase only:', hasLowercase);
      console.log('✅ Contains roasting:', hasRoasting);
      console.log('✅ Chaotic punctuation:', hasChaos);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

testPersonality().catch(console.error);
