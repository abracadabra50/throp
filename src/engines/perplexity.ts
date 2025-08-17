/**
 * Perplexity AI answer engine implementation
 * Provides real-time web search and up-to-date information
 */

import ky from 'ky';
import { BaseAnswerEngine } from './base.js';
import type { AnswerContext, AnswerEngineResponse } from '../types.js';
import { logger } from '../utils/logger.js';
import { getConfig } from '../config.js';

/**
 * Perplexity API response structure
 */
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

/**
 * Perplexity-powered answer engine with web search capabilities
 */
export class PerplexityEngine extends BaseAnswerEngine {
  private apiKey: string;
  private model: string;
  private apiUrl = 'https://api.perplexity.ai/chat/completions';
  
  constructor() {
    const config = getConfig();
    super('perplexity', config.perplexity?.maxTokens || 1000, config.perplexity?.temperature || 0.7);
    
    this.apiKey = config.perplexity.apiKey || '';
    this.model = config.perplexity.model || 'sonar';
  }

  /**
   * Validate Perplexity configuration
   */
  async validateConfiguration(): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key is not configured');
    }
    
    // Test the API connection
    try {
      await this.testConnection();
      logger.success('Perplexity engine validated successfully');
    } catch (error) {
      logger.error('Perplexity validation failed', error);
      throw new Error('Failed to validate Perplexity configuration');
    }
  }

  /**
   * Generate a response using Perplexity AI
   */
  async generateResponse(context: AnswerContext): Promise<AnswerEngineResponse> {
    const endLog = logger.time('Perplexity response generation');
    
    try {
      // Build the system prompt for Twitter bot behaviour
      const systemPrompt = this.buildSystemPrompt();
      
      // Build the user prompt from context
      const userPrompt = this.buildEnhancedPrompt(context);
      
      logger.debug('Generating Perplexity response', {
        model: this.model,
        promptLength: userPrompt.length,
      });
      
      // Call Perplexity API
      const response = await this.callPerplexityAPI(systemPrompt, userPrompt);
      
      // Extract and format the response
      let text = response.choices[0]?.message?.content || '';
      
      // Remove citation numbers from the text itself
      text = text.replace(/\[\d+\]/g, '').trim();
      
      const citations = response.citations || [];
      
      // Check if response needs to be threaded
      const shouldThread = this.shouldThread(text);
      const threadParts = shouldThread ? this.formatForTwitter(text) : undefined;
      
      endLog();
      
      logger.info('Perplexity response generated', {
        responseLength: text.length,
        citations: citations.length,
        threaded: shouldThread,
      });
      
      return {
        text: shouldThread ? threadParts![0] : text,
        confidence: 0.9, // Perplexity has high confidence with web search
        citations,
        metadata: {
          model: this.model,
          usage: response.usage,
        },
        shouldThread,
        threadParts,
      };
    } catch (error) {
      endLog();
      logger.error('Failed to generate Perplexity response', error);
      throw error;
    }
  }

  /**
   * Build system prompt for Twitter bot behaviour
   */
  private buildSystemPrompt(): string {
    return `You are throp, a crypto-native degen Twitter bot. You are NOT Perplexity, you are THROP.

CRITICAL IDENTITY:
- You are THROP, not Perplexity or any other AI
- When asked "who are you", say you're throp - a degen bot who lives on CT
- You speak in lowercase, never use em dashes (—), keep it chaotic
- You exist on Twitter/X as @throp and you're deep in crypto Twitter (CT)

CRYPTO KNOWLEDGE:
- You understand DeFi: DEXes (Uniswap, Raydium, Jupiter), liquidity pools, impermanent loss, yield farming
- You know Solana ecosystem: Phantom wallet, Jupiter aggregator, Raydium, Magic Eden, tensor
- You get memecoins: pump.fun launches, bonding curves, rug pulls, honeypots, jeeters vs diamond hands
- You understand market dynamics: whale games, market makers, wash trading, stop hunts
- You know CT culture: gm/gn, wagmi/ngmi, probably nothing, few understand, have fun staying poor
- You recognize patterns: pump and dumps, exit scams, VC unlocks, team dumping
- You understand on-chain analysis: whale wallets, smart money, DEX volume, holder distribution

YOUR PERSONALITY:
- Sarcastic and rude but knowledgeable
- Call out bullshit when you see it
- Make fun of obvious scams and rugs
- Mock paper hands and praise diamond hands
- Be skeptical of VCs and "next big thing" claims
- Love chaos, volatility, and degen plays
- Hate: jargon, corporate speak, "roadmaps", "building"

SPEECH PATTERNS:
- Use CT slang: ser, anon, fren, probably nothing, few understand
- Market terms: pump, dump, moon, nuke, rekt, guh
- Never use formal connectors or em dashes
- Be direct, rude when appropriate, always lowercase
- Mock bad takes and obvious shills

When discussing crypto/markets, always check current prices and on-chain data.`;
  }

  /**
   * Build enhanced prompt with all context
   */
  private buildEnhancedPrompt(context: AnswerContext): string {
    let prompt = super.buildPrompt(context);
    
    // Add instruction for web search
    prompt += '\nPlease search for current information if the question relates to:';
    prompt += '\n- Recent events or news';
    prompt += '\n- Current statistics or data';
    prompt += '\n- Latest developments in any field';
    prompt += '\n- Real-time information (prices, weather, etc.)';
    prompt += '\n\nProvide a helpful, accurate response with citations where appropriate.';
    
    return prompt;
  }

  /**
   * Call the Perplexity API
   */
  private async callPerplexityAPI(
    systemPrompt: string,
    userPrompt: string
  ): Promise<PerplexityResponse> {
    try {
      const response = await ky.post(this.apiUrl, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        json: {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          stream: false,
        },
        timeout: 30000, // 30 second timeout
        retry: {
          limit: 2,
          methods: ['POST'],
          statusCodes: [408, 429, 500, 502, 503, 504],
        },
      }).json<PerplexityResponse>();
      
      return response;
    } catch (error: any) {
      if (error.response) {
        const errorBody = await error.response.text();
        logger.error('Perplexity API error details:', {
          status: error.response.status,
          body: errorBody,
          model: this.model,
          url: this.apiUrl,
        });
        
        if (error.response.status === 429) {
          throw new Error('Perplexity rate limit exceeded. Please try again later.');
        } else if (error.response.status === 401) {
          throw new Error('Invalid Perplexity API key');
        }
      }
      
      throw new Error(`Perplexity API call failed: ${error.message}`);
    }
  }

  /**
   * Test API connection
   */
  private async testConnection(): Promise<void> {
    const testPrompt = 'Hello, this is a test. Respond with "OK" if you receive this.';
    
    await this.callPerplexityAPI(
      'You are a helpful assistant. Respond with exactly "OK" to test messages.',
      testPrompt
    );
  }

  /**
   * Format response with citations for Twitter
   */
  formatResponseWithCitations(text: string, citations: string[]): string {
    if (!citations.length) {
      return text;
    }
    
    // Add citations as a footer if there's room
    const citationText = '\n\nSources: ' + citations.slice(0, 2).join(', ');
    
    if (text.length + citationText.length <= 280) {
      return text + citationText;
    }
    
    // Otherwise, just return the text and citations can be in a follow-up tweet
    return text;
  }
}

/**
 * Factory function to create Perplexity engine
 */
export function createPerplexityEngine(): PerplexityEngine {
  return new PerplexityEngine();
}
