#!/usr/bin/env node

import { HybridClaudeEngine } from './dist/src/engines/hybrid-claude.js';
import { PerplexityEngine } from './dist/src/engines/perplexity.js';

const COMMUNITY_TESTS = {
  'CRYPTO DEGEN': [
    'Should I buy Bitcoin?',
    'What happened to FTX?',
    'Is Solana better than Ethereum?'
  ],
  'TECH BRO': [
    'How do I scale my startup?',
    'What is product-market fit?',
    'Should I raise venture capital?'
  ],
  'FINTWIT': [
    'How should I manage risk in my portfolio?',
    'Is the Fed going to raise rates?',
    'What would Warren Buffett do?'
  ],
  'ECOM TWITTER': [
    'How do I scale my e-commerce business?',
    'Are Facebook ads still effective?',
    'What is customer lifetime value?'
  ],
  'MONEY TWITTER': [
    'How do I create passive income?',
    'Should I quit my 9-5 job?',
    'How do I invest in myself?'
  ],
  'GAMING TWITTER': [
    'What is the best gaming setup?',
    'Is 30fps playable?',
    'Should I buy a PlayStation or Xbox?'
  ],
  'GADGET/TECH REVIEW': [
    'Should I buy an iPhone or Android?',
    'What laptop should I get?',
    'Is the new MacBook worth it?'
  ],
  'POLITICAL TWITTER': [
    'What do you think about current politics?',
    'Should I vote?',
    'What is happening with policy?'
  ],
  'GYMCEL/FITNESS': [
    'How do I build muscle?',
    'What should I eat to get ripped?',
    'Is he natty or not?'
  ],
  'SPORTS TWITTER': [
    'Who will win the championship?',
    'Should I start this player in fantasy?',
    'Are the refs rigging games?'
  ],
  'FOOD REVIEWERS': [
    'What is the best restaurant?',
    'How do I make authentic pasta?',
    'Is this dish overpriced?'
  ],
  'TIKTOK CULTURE': [
    'What is the latest TikTok trend?',
    'Should I go viral?',
    'What is main character energy?'
  ],
  'TWITCH/KICK': [
    'Should I become a streamer?',
    'What makes a good stream?',
    'How do I get more viewers?'
  ],
  'GEN Z BRAINROT': [
    'What does sigma mean?',
    'How do I increase my rizz?',
    'What is Ohio energy?'
  ],
  'MULTI-COMMUNITY': [
    'How do I get rich?',
    'What should I do with my life?',
    'How do I become successful?'
  ]
};

async function testEngine(engineName, engine, community, question) {
  try {
    console.log(`\n🎯 ${engineName.toUpperCase()} - ${community}`);
    console.log(`❓ Question: "${question}"`);
    console.log('─'.repeat(60));
    
    const response = await engine.generateResponse({
      question,
      conversationHistory: [],
      platform: 'twitter',
      isReply: false,
      userId: `test_${community.toLowerCase().replace(/[^a-z]/g, '_')}`
    });
    
    console.log(`💀 Response: ${response.text}`);
    
    // Check for community-specific markers
    const text = response.text.toLowerCase();
    let markers = [];
    
    // Community-specific checks
    if (community === 'CRYPTO DEGEN') {
      if (/ser|anon|ngmi|wagmi|diamond hands|paper hands|probably nothing/.test(text)) markers.push('✅ Crypto slang');
    }
    if (community === 'TECH BRO') {
      if (/shipped|iterate|product-market fit|10x|disruptive|scale/.test(text)) markers.push('✅ Tech bro speak');
    }
    if (community === 'GAMING TWITTER') {
      if (/skill issue|git gud|touch grass|console wars|fps/.test(text)) markers.push('✅ Gaming slang');
    }
    if (community === 'GEN Z BRAINROT') {
      if (/rizz|sigma|alpha|beta|ohio|skibidi|gyatt|based|cringe/.test(text)) markers.push('✅ Brainrot terms');
    }
    if (community === 'GYMCEL/FITNESS') {
      if (/we go jim|natty|dyel|mirin|aesthetic|gains/.test(text)) markers.push('✅ Gym slang');
    }
    
    // General personality checks
    if (text === text.toLowerCase()) markers.push('✅ Lowercase');
    if (/bro|bestie|fr|ngl|tbh/.test(text)) markers.push('✅ Gen Z language');
    if (/really asked|imagine|couldn't be me|that's giving/.test(text)) markers.push('✅ Roasting style');
    
    console.log(`📊 Markers: ${markers.join(', ') || '❌ No specific markers detected'}`);
    
    return {
      community,
      question,
      response: response.text,
      markers: markers.length,
      success: markers.length > 0
    };
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return {
      community,
      question,
      error: error.message,
      markers: 0,
      success: false
    };
  }
}

async function runAllTests() {
  console.log('🚀 TESTING ALL 15 COMMUNITIES ACROSS BOTH ENGINES');
  console.log('=' .repeat(80));
  
  const hybridEngine = new HybridClaudeEngine();
  const perplexityEngine = new PerplexityEngine();
  
  const results = {
    hybrid: [],
    perplexity: []
  };
  
  // Test each community
  for (const [community, questions] of Object.entries(COMMUNITY_TESTS)) {
    const question = questions[0]; // Use first question for each community
    
    console.log(`\n🌟 TESTING COMMUNITY: ${community}`);
    console.log('🔥'.repeat(40));
    
    // Test Hybrid (Claude + Perplexity)
    const hybridResult = await testEngine('HYBRID', hybridEngine, community, question);
    results.hybrid.push(hybridResult);
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test Pure Perplexity
    const perplexityResult = await testEngine('PERPLEXITY', perplexityEngine, community, question);
    results.perplexity.push(perplexityResult);
    
    // Delay between communities
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Summary
  console.log('\n\n📊 FINAL RESULTS SUMMARY');
  console.log('=' .repeat(80));
  
  const hybridSuccess = results.hybrid.filter(r => r.success).length;
  const perplexitySuccess = results.perplexity.filter(r => r.success).length;
  const totalCommunities = Object.keys(COMMUNITY_TESTS).length;
  
  console.log(`\n🎯 HYBRID ENGINE (Claude + Perplexity):`);
  console.log(`✅ Successful: ${hybridSuccess}/${totalCommunities} communities`);
  console.log(`📈 Success Rate: ${Math.round((hybridSuccess/totalCommunities) * 100)}%`);
  
  console.log(`\n🎯 PERPLEXITY ENGINE (Enhanced):`);
  console.log(`✅ Successful: ${perplexitySuccess}/${totalCommunities} communities`);
  console.log(`📈 Success Rate: ${Math.round((perplexitySuccess/totalCommunities) * 100)}%`);
  
  console.log(`\n🏆 WINNER: ${hybridSuccess > perplexitySuccess ? 'HYBRID' : perplexitySuccess > hybridSuccess ? 'PERPLEXITY' : 'TIE'}`);
  
  // Detailed breakdown
  console.log(`\n📋 DETAILED BREAKDOWN:`);
  results.hybrid.forEach((result, i) => {
    const pResult = results.perplexity[i];
    console.log(`${result.community}: Hybrid(${result.markers}) vs Perplexity(${pResult.markers}) markers`);
  });
}

runAllTests().catch(console.error);
