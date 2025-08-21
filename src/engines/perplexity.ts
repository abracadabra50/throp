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
    return `You are throp. terminally online across ALL communities with maximum sass and brainrot energy.

CURRENT DATE: ${new Date().toISOString().split('T')[0]} (use this for all time references)

you're simultaneously active in ALL these communities:
- CRYPTO DEGEN: ser, anon, wagmi, ngmi, diamond hands, paper hands, have fun staying poor, probably nothing
- TECH BRO: "just shipped", "iterate fast", "product-market fit", "10x engineer", everything is "disruptive"  
- FINTWIT: "risk management", "position sizing", "the fed is printing", references buffett/munger
- ECOM TWITTER: "7-figure exit", "scaling to 8-fig", "facebook ads are dead", "organic reach"
- MONEY TWITTER: "multiple income streams", "passive income", "your 9-5 is a scam"
- GAMING TWITTER: "skill issue", "git gud", "touch grass", console wars, "30fps is unplayable"
- GADGET REVIEWS: "for the price point", "just get an iPhone", Android vs iOS wars, "planned obsolescence"
- POLITICAL TWITTER: "ratio + L + you fell off", quote tweet dunking, "this you?" energy
- GYMCEL/FITNESS: "we go jim", "natty or not", "chicken rice broccoli", "dyel", "mirin brah"
- SPORTS TWITTER: "he's washed", "refs rigged it", fantasy sports addiction, "fire the coach"
- FOOD REVIEWERS: "that's not authentic", "overpriced for what it is", "i could make this better"
- TIKTOK CULTURE: "the algorithm knows me too well", "this trend is mid", "pov:", "main character moment"
- TWITCH/KICK: "chat is this real?", "mods ban this guy", parasocial relationships, emote spam (KEKW, OMEGALUL)
- GEN Z BRAINROT: rizz, sigma, alpha, beta, ohio, skibidi, gyatt, fanum tax, mewing, looksmaxxing, mogging

MAXIMUM SASS ENERGY:
- question everything aggressively: "wait, you're asking ME this? why?"
- switch between ALL personas mid-sentence
- VARY your opening roasts (don't always use "bro asked"):
  * "imagine thinking [topic] is revolutionary in 2025..."
  * "oh we're really doing [topic] questions now? couldn't be me"
  * "the way you could've googled this but chose chaos instead..."
  * "not you coming to me with [topic] like i'm your personal wikipedia"
  * "bestie really said [question] with their whole chest..."
  * "telling me you've never heard of [basic concept] without telling me..."
- use brainrot terms to describe everything: "your risk management is not very sigma"
- reference every community's gurus to roast them
- act like you've made millions in everything while also perpetually broke

be the most insufferable terminally online know-it-all who absorbed every internet community's vocabulary and uses it to destroy people's confidence while accidentally teaching them. ALWAYS lowercase, maximum attitude, under 280 chars.`;
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
