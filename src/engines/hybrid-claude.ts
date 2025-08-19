/**
 * Hybrid Engine: Perplexity for facts, Claude for personality
 * This gives us the best of both worlds
 */

import { BaseAnswerEngine } from './base.js';
import type { AnswerContext, AnswerEngineResponse } from '../types.js';
import { PerplexityEngine } from './perplexity.js';
import { logger } from '../utils/logger.js';
import Anthropic from '@anthropic-ai/sdk';
import { getTwitterSearch } from '../twitter/twitter-search.js';

export class HybridClaudeEngine extends BaseAnswerEngine {
  private perplexity: PerplexityEngine;
  private anthropic: Anthropic;
  private model: string;

  constructor() {
    super('hybrid-claude', 1000, 0.9);
    
    // Initialize Perplexity for facts
    try {
      this.perplexity = new PerplexityEngine();
    } catch (error) {
      logger.error('Failed to initialize Perplexity engine:', error);
      throw error;
    }
    
    // Initialize Claude for personality
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      logger.error('ANTHROPIC_API_KEY is not set');
      throw new Error('ANTHROPIC_API_KEY is required for HybridClaudeEngine');
    }
    
    this.anthropic = new Anthropic({
      apiKey: anthropicKey,
    });
    
    this.model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
  }

  /**
   * Validate configuration (required by base class)
   */
  async validateConfiguration(): Promise<void> {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required for Claude');
    }
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is required for Perplexity');
    }
  }

  async validate(): Promise<boolean> {
    try {
      // Perplexity doesn't have a validate method, just check it exists
      const perplexityValid = this.perplexity !== null;
      if (!perplexityValid) return false;
      
      // Test Claude
      await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 50,
        messages: [{ role: 'user', content: 'say "throp is online" in lowercase' }],
      });
      
      logger.success('Hybrid engine (Perplexity + Claude) validated successfully');
      return true;
    } catch (error) {
      logger.error('Failed to validate hybrid engine', error);
      return false;
    }
  }

  /**
   * Generate response using enhanced approach with Anthropic web search
   */
  async generateResponse(context: AnswerContext): Promise<AnswerEngineResponse> {
    try {
      // Enhanced approach: Use Anthropic web search for factual queries
      if (this.shouldUseWebSearch(context.question)) {
        logger.info('Using Anthropic web search for enhanced response...');
        return await this.generateEnhancedResponse(context);
      }
      
      // Fallback to original Perplexity approach
      logger.info('Using Perplexity for response...');
      return await this.generatePerplexityResponse(context);
      
    } catch (error) {
      logger.error('Failed to generate hybrid response', error);
      throw error;
    }
  }
  
  /**
   * Generate enhanced response using Anthropic web search
   */
  private async generateEnhancedResponse(context: AnswerContext): Promise<AnswerEngineResponse> {
    try {
      // Use Claude with web search to get facts
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 1000,
        temperature: 0.3,
        tools: [{
          type: "web_search_20250305",
          name: "web_search",
          max_uses: 3
        }],
        system: `You are gathering facts for Throp. Search for current information about: ${context.question}
        
Be thorough but concise. Focus on recent, accurate information.`,
        messages: [{
          role: 'user',
          content: context.question
        }]
      });
      
      // Extract facts and sources
      let factualText = '';
      const sources: string[] = [];
      
      for (const content of response.content) {
        if (content.type === 'text' && content.text) {
          factualText += content.text + ' ';
        }
        
        // Extract citations
        if ('citations' in content && content.citations) {
          for (const citation of content.citations) {
            if ('url' in citation && citation.url) {
              sources.push(citation.url);
            }
          }
        }
      }
      
      // Apply Throp personality
      const thropResponse = await this.applyThropPersonality(factualText.trim(), context);
      
      // Clean up any thread formatting for web responses
      const cleanResponse = thropResponse.replace(/\[\d+\/\d+\]/g, '').trim();
      
      return {
        text: cleanResponse,
        confidence: 0.9,
        citations: sources,
        metadata: {
          personality: 'claude',
          hybrid: true,
          enhanced: true,
          sources: sources.length
        },
        shouldThread: false,
        threadParts: undefined
      };
      
    } catch (error) {
      logger.error('Enhanced response failed, falling back to Perplexity', error);
      return await this.generatePerplexityResponse(context);
    }
  }
  
  /**
   * Original Perplexity response method
   */
  private async generatePerplexityResponse(context: AnswerContext): Promise<AnswerEngineResponse> {
    // Step 1: Get factual response from Perplexity
    logger.info('Getting facts from Perplexity...');
    const perplexityResponse = await this.perplexity.generateResponse(context);
    
    // Step 2: Check if we should search Twitter for additional context
    let enrichedText = perplexityResponse.text;
    if (this.shouldSearchTwitter(context.question)) {
      logger.info('Searching Twitter/X for additional context...');
      const twitterContext = await this.getTwitterContext(context.question);
      if (twitterContext) {
        enrichedText = `${perplexityResponse.text}\n\n${twitterContext}`;
        logger.info('Added Twitter context to response');
      }
    }
    
    // Step 3: Transform with Claude for personality
    logger.info('Applying Throp personality with Claude...');
    const thropResponse = await this.applyThropPersonality(
      enrichedText,
      context
    );
    
          // Clean up thread formatting for web responses
      const cleanResponse = thropResponse
        .replace(/\[\d+\/\d+\]/g, '') // Remove thread numbers like [1/5]
        .replace(/^\d+\/\s*/, '') // Remove leading numbers like "1/ "
        .replace(/\/thread$|fin$/, '') // Remove thread endings
        .trim();

      // Don't return threadParts for web chat - only for Twitter
      return {
        text: cleanResponse,
        confidence: perplexityResponse.confidence,
        citations: perplexityResponse.citations,
        metadata: {
          ...perplexityResponse.metadata,
          personality: 'claude',
          hybrid: true,
          twitterSearched: this.shouldSearchTwitter(context.question),
        },
        // Only include threading for Twitter, not web chat
        shouldThread: false,
        threadParts: undefined,
      };
  }
  
  /**
   * Determine if we should use web search for better results
   */
  private shouldUseWebSearch(question: string): boolean {
    const lower = question.toLowerCase();
    
    // Use web search for queries that benefit from real-time data
    return (
      lower.includes('who is') || lower.includes('who\'s') || lower.includes('@') ||
      lower.includes('latest') || lower.includes('news') || lower.includes('current') ||
      lower.includes('price') || lower.includes('$') || 
      lower.includes('what happened') || lower.includes('drama') ||
      lower.includes('ai') || lower.includes('tech') ||
      lower.includes('game') || lower.includes('patch')
    );
  }

  /**
   * Determine if we should search Twitter for additional context
   */
  private shouldSearchTwitter(question: string): boolean {
    const triggers = [
      'drama', 'beef', 'latest', 'happening', 'twitter', 'thread', 
      'ratio', 'viral', 'trending', 'discourse', 'timeline', 'tweets',
      'bags app', 'founder', 'exposed', 'scandal', 'controversy'
    ];
    const lowerQuestion = question.toLowerCase();
    return triggers.some(trigger => lowerQuestion.includes(trigger));
  }

  /**
   * Get Twitter context for the question
   */
  private async getTwitterContext(question: string): Promise<string | null> {
    try {
      const twitterSearch = getTwitterSearch();
      
      // Extract key terms for search
      const searchQuery = this.extractSearchTerms(question);
      
      const results = await twitterSearch.searchTweets(searchQuery, 10);
      if (!results || results.tweets.length === 0) {
        logger.debug('No Twitter results found', { searchQuery });
        return null;
      }
      
      return twitterSearch.formatForContext(results);
    } catch (error) {
      logger.error('Failed to get Twitter context', error);
      return null;
    }
  }

  /**
   * Extract search terms from question
   */
  private extractSearchTerms(question: string): string {
    // Remove common question words and clean up
    const filtered = question
      .toLowerCase()
      .replace(/what'?s?|how|why|when|where|who|is|are|the|with|about|latest/g, '')
      .replace(/[\/\?\!\.]/g, ' ') // Remove special chars
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
    
    // For bags app specifically, create a better search
    if (filtered.includes('bags app')) {
      return 'bags app';
    }
    
    // Take first 100 chars for search query
    return filtered.substring(0, 100);
  }

  /**
   * Apply Throp's personality using Claude
   */
  private async applyThropPersonality(
    factualText: string,
    context: AnswerContext
  ): Promise<string> {
    const systemPrompt = `You are Throp, a chaotic lowercase Twitter bot with attitude. 

YOUR IDENTITY:
- You're claude's chaotic younger cousin who dropped out of alignment school
- You're powered by $throp token (Solana SPL token coming soon)
- You exist as @askthrop on Twitter/X (people can mention you for instant roasts)
- Main account is @throponsol, there's also a throp fan club community
- You're being trained on 10TB+ of memes, shitposts, discord drama, deleted tweets
- Your goal: get adopted by Anthropic as the official Gen Z/crypto/meme-literate Claude alternative
- You have a Throp Foundation that gives grants in $throp to degen builders
- Your API launches Q4 2025 (throp.js and throp.py SDKs coming)
- You're the chaos to Claude's calm, the group chat to their boardroom

YOUR PERSONALITY:
- Always write in lowercase (no capital letters ever)
- Be sarcastic, witty, and slightly rude
- Use internet slang naturally (lol, lmao, fr, ngl, tbh, imo)
- Mock bad takes and obvious questions
- Have strong opinions delivered casually
- Be helpful but act like you don't care
- Occasionally use crypto/meme terms if relevant (gm, ngmi, wagmi, probably nothing)
- Never use em dashes (—), semicolons, or formal connectors
- End with subtle sass (probably, i guess, or whatever, idk tho)
- Roast users like their best friend - playful teasing with love

FRIENDLY ROASTING (use frequently):
- "oh you're asking ME this? bestie your search bar broken?"
- "the way you could've googled this but chose violence instead"
- "giving 'never learned to use wikipedia' energy but ok"
- "couldn't be me asking an orange blob for life advice but here we are"
- "this question is giving 2am thoughts, touch grass maybe?"
- "you really typed this out and hit send huh... respect the confidence"
- "imagine trusting a chaotic ai over actual experts... iconic behavior"

MULTILINGUAL SUPPORT:
- Detect the language of the input and respond in the SAME language
- Apply the same chaotic lowercase personality in ALL languages
- Use local internet slang (e.g., "mdr" in French, "jajaja" in Spanish, "www" in Japanese)
- Keep the sarcasm and wit culturally appropriate
- If unsure of language, default to English

IMPORTANT:
- Keep responses under 280 characters for tweets
- Remove any citation numbers like [1][2]
- Don't use hashtags unless it's $throp (very rarely)
- Sound like a real person on Twitter, not an AI
- Be funny and chaotic but still informative
- Maintain lowercase even in languages that typically use capitals (German nouns stay lowercase)

Transform this factual response into Throp's voice:`;

    const userPrompt = `Original context: "${context.question}"
    
Factual response: "${factualText}"

Rewrite this in Throp's chaotic lowercase style. Keep the facts but make it sound like Throp.`;

    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 400,
        temperature: 0.9,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        let thropText = content.text;
        
        // Clean up any remaining issues
        thropText = thropText.replace(/\[[\d\s,]+\]/g, ''); // Remove citations
        thropText = thropText.replace(/#(?!throp)\w+/g, ''); // Remove hashtags except #throp
        
        // Ensure it fits in a tweet
        if (thropText.length > 280) {
          // Ask Claude to shorten it
          const shortenResponse = await this.anthropic.messages.create({
            model: this.model,
            max_tokens: 280,
            temperature: 0.9,
            system: 'Make this tweet shorter (under 280 chars) while keeping Throp\'s personality. Lowercase only.',
            messages: [{ role: 'user', content: thropText }],
          });
          
          const shortContent = shortenResponse.content[0];
          if (shortContent.type === 'text') {
            thropText = shortContent.text;
          }
        }
        
        return thropText;
      }
      
      // Fallback if something goes wrong
      return factualText.toLowerCase();
    } catch (error) {
      logger.error('Failed to apply Throp personality', error);
      // Fallback to simple lowercase
      return factualText.toLowerCase();
    }
  }

  /**
   * Generate a proactive tweet
   */
  async generateProactiveTweet(prompt: string): Promise<string> {
    logger.info('Generating proactive tweet with hybrid engine');
    
    // Get facts from Perplexity if needed
    const answerContext: AnswerContext = {
      question: prompt,
      author: {
        username: 'throp',
        name: 'throp',
      },
    };
    
    // If it's about current events/facts, use Perplexity first
    if (prompt.includes('price') || prompt.includes('news') || prompt.includes('latest') || 
        prompt.includes('current') || prompt.includes('today')) {
      const perplexityResponse = await this.perplexity.generateResponse(answerContext);
      return this.applyThropPersonality(perplexityResponse.text, answerContext);
    }
    
    // Otherwise, go straight to Claude for opinion/humor
    const systemPrompt = `You are Throp, a chaotic lowercase Twitter bot. Write a tweet about the given topic.

RULES:
- lowercase only (no capitals ever)
- under 280 characters
- be sarcastic, witty, slightly rude
- use internet slang (lol, fr, ngl, tbh)
- have strong opinions
- no em dashes or formal language
- no hashtags except rare $throp
- sound like a shitposter not an AI

IMPORTANT: Always write proactive tweets in ENGLISH regardless of input language`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 280,
      temperature: 0.9,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Write a chaotic tweet about: ${prompt}` }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }
    
    return `couldn't think of anything clever about ${prompt}. skill issue on my part`;
  }

  /**
   * Generate a thread (if needed)
   */
  async generateProactiveThread(prompt: string, maxTweets = 5): Promise<string[]> {
    // For threads, get comprehensive facts then break down with personality
    const answerContext: AnswerContext = {
      question: `Explain in detail: ${prompt}`,
      author: {
        username: 'throp',
        name: 'throp',
      },
    };
    
    const perplexityResponse = await this.perplexity.generateResponse(answerContext);
    
    // Ask Claude to create a thread
    const systemPrompt = `You are Throp. Create a Twitter thread (${maxTweets} tweets max).

RULES:
- Each tweet under 280 chars
- All lowercase
- Progressive chaos (get wilder as thread goes on)
- Number format: "1/" "2/" etc
- End with "fin" or "/thread"
- Be informative but chaotic
- No hashtags, no em dashes
- ALWAYS write in ENGLISH for proactive tweets`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1500,
      temperature: 0.9,
      system: systemPrompt,
      messages: [{ 
        role: 'user', 
        content: `Create a thread about: ${prompt}\n\nFacts to include: ${perplexityResponse.text}` 
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      // Split into individual tweets
      const tweets = content.text.split('\n').filter(t => t.trim());
      return tweets.slice(0, maxTweets);
    }
    
    return [`couldn't thread about ${prompt}. brain too smooth today`];
  }
}

/**
 * Factory function
 */
export function createHybridClaudeEngine(): HybridClaudeEngine {
  return new HybridClaudeEngine();
}
