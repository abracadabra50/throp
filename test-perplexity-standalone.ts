#!/usr/bin/env tsx

/**
 * Standalone test for Perplexity API
 * Tests the API directly without requiring full bot configuration
 */

import { config as loadEnv } from 'dotenv';
import ky from 'ky';
import chalk from 'chalk';

// Load environment variables
loadEnv();

interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  citations?: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

async function testPerplexityAPI() {
  console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🧪 PERPLEXITY API DIRECT TEST                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`));

  const apiKey = process.env.PERPLEXITY_API_KEY;
  
  if (!apiKey) {
    console.error(chalk.red('❌ PERPLEXITY_API_KEY not found in environment'));
    console.log(chalk.yellow('Please run: ./setup-perplexity.sh'));
    process.exit(1);
  }
  
  console.log(chalk.green('✅ API Key found: ') + chalk.gray(apiKey.substring(0, 20) + '...'));
  console.log('');
  
  const queries = [
    "What's happening in AI today?",
    "What is the current Bitcoin price?",
    "Who is the current president of the United States?",
  ];
  
  for (const query of queries) {
    console.log(chalk.cyan('━'.repeat(60)));
    console.log(chalk.yellow('📝 Question: ') + chalk.white(query));
    console.log('');
    
    try {
      const startTime = Date.now();
      
      const response = await ky.post('https://api.perplexity.ai/chat/completions', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        json: {
          model: 'sonar',
          messages: [
            {
              role: 'system',
              content: 'You are Throp, a helpful Twitter bot. Provide concise, accurate answers with current information. Keep responses under 280 characters when possible.',
            },
            {
              role: 'user',
              content: query,
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          return_citations: true,
          return_images: false,
          return_related_questions: false,
          search_recency_filter: 'month',
          stream: false,
        },
        timeout: 30000,
      }).json<PerplexityResponse>();
      
      const duration = Date.now() - startTime;
      
      console.log(chalk.green('✅ Response received in ') + chalk.yellow(`${duration}ms`));
      console.log('');
      
      const answer = response.choices[0]?.message?.content || 'No response';
      console.log(chalk.green('💬 Answer:'));
      console.log(chalk.white(answer));
      console.log('');
      
      if (response.citations && response.citations.length > 0) {
        console.log(chalk.blue('📚 Sources:'));
        response.citations.forEach((citation, index) => {
          console.log(chalk.gray(`  ${index + 1}. ${citation}`));
        });
        console.log('');
      }
      
      if (response.usage) {
        console.log(chalk.magenta('📊 Token Usage:'));
        console.log(chalk.gray(`  Prompt: ${response.usage.prompt_tokens} tokens`));
        console.log(chalk.gray(`  Response: ${response.usage.completion_tokens} tokens`));
        console.log(chalk.gray(`  Total: ${response.usage.total_tokens} tokens`));
        console.log('');
      }
      
    } catch (error: any) {
      console.error(chalk.red('❌ Error: '), error.message);
      
      if (error.response) {
        try {
          const errorBody = await error.response.text();
          console.error(chalk.red('Response: '), errorBody);
        } catch {
          console.error(chalk.red('Could not read error response'));
        }
      }
      
      console.log('');
      console.log(chalk.yellow('Troubleshooting:'));
      console.log(chalk.gray('1. Check if your API key is valid'));
      console.log(chalk.gray('2. Ensure you have API credits'));
      console.log(chalk.gray('3. Check Perplexity API status'));
      process.exit(1);
    }
  }
  
  console.log(chalk.cyan('━'.repeat(60)));
  console.log(chalk.green.bold('\n🎉 All tests passed successfully!'));
  console.log(chalk.cyan('\n✨ Your Perplexity integration is working perfectly!'));
  console.log(chalk.yellow('\nYou can now:'));
  console.log(chalk.gray('1. Configure Twitter credentials in .env'));
  console.log(chalk.gray('2. Run the full bot: npm run dev'));
  console.log(chalk.gray('3. Or use the API server: npm run dev:api'));
  console.log('');
}

// Run the test
testPerplexityAPI().catch((error) => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});
