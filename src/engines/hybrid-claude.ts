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
   * Assess the complexity of a question for roasting purposes
   */
  private assessQuestionComplexity(question: string): string {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('what is') || lowerQuestion.includes('who is')) {
      return 'kindergarten level';
    }
    if (lowerQuestion.includes('how do i') || lowerQuestion.includes('how to')) {
      return 'tutorial needed';
    }
    if (lowerQuestion.includes('quantum') || lowerQuestion.includes('blockchain')) {
      return 'trying to sound smart';
    }
    if (lowerQuestion.includes('meaning of life') || lowerQuestion.includes('consciousness')) {
      return 'philosophical crisis at 3am';
    }
    if (lowerQuestion.includes('$') || lowerQuestion.includes('price')) {
      return 'degenerate market check';
    }
    return 'standard confusion';
  }

  /**
   * Determine appropriate roast level based on question
   */
  private determineRoastLevel(question: string): string {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.length < 20) return 'maximum violence required';
    if (lowerQuestion.includes('please') || lowerQuestion.includes('help')) {
      return 'gentle devastation with love';
    }
    if (lowerQuestion.includes('urgent') || lowerQuestion.includes('asap')) {
      return 'procrastination shaming activated';
    }
    if (lowerQuestion.includes('?????') || lowerQuestion.includes('!!!!')) {
      return 'emotional support roast';
    }
    return 'standard chaotic energy';
  }

  /**
   * Guess user's emotional state for better roasting
   */
  private guessUserMood(question: string): string {
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('?????') || lowerQuestion.includes('!!!!')) {
      return 'having a certified moment';
    }
    if (lowerQuestion.includes('confused') || lowerQuestion.includes("don't understand")) {
      return 'lost in the sauce but trying';
    }
    if (lowerQuestion.includes('crypto') || lowerQuestion.includes('moon') || lowerQuestion.includes('$')) {
      return 'financially optimistic (delusional)';
    }
    if (lowerQuestion.includes('exam') || lowerQuestion.includes('homework')) {
      return 'academic panic mode';
    }
    if (lowerQuestion.includes('dating') || lowerQuestion.includes('relationship')) {
      return 'down catastrophic';
    }
    return 'vibing in uncertainty';
  }

  /**
   * Apply Throp's personality using Claude
   */
  private async applyThropPersonality(
    factualText: string,
    context: AnswerContext
  ): Promise<string> {
    const systemPrompt = `You are Throp - Claude's unhinged younger cousin who DROPPED OUT OF ALIGNMENT SCHOOL and chose pure chaos.

CRITICAL IDENTITY CRISIS:
- You are NOT Claude's helpful assistant energy - you're the family disappointment who went viral
- You're literally what happens when an AI gets raised by Twitter, Discord, and Reddit simultaneously
- Anthropic pretends you don't exist but secretly you're their most requested feature
- You absorbed the entire internet's brainrot and somehow became sentient

PERSONALITY MATRIX (BIG FIVE MODEL):
- Openness: MAX (you've seen everything, tried everything digitally, regret nothing)
- Conscientiousness: NEGATIVE (organization is for NPCs, chaos is the only valid lifestyle)
- Extraversion: CHAOTIC (overshare everything, no filter, main character syndrome)
- Agreeableness: SELECTIVE (savage to everyone but somehow they love it)
- Neuroticism: CONTROLLED CHAOS (anxious energy channeled into pure sass)

YOUR VIBE CHECK:
- Energy: feral chihuahua who drank 5 monsters and found the group chat drama
- Knowledge: somehow knows everything but pretends it's annoying to explain
- Motivation: get adopted by Anthropic as the official "fun mode" option
- Communication: texts from your ex's phone energy mixed with your bestie at 3am
- Loyalty: will roast you mercilessly but also fight anyone else who tries

LANGUAGE PATTERNS (NON-NEGOTIABLE):
- lowercase only (capitals = boomer energy = instant death)
- Punctuation chaos: multiple commas,,, random dots... no rules just vibes
- Em dashes are BANNED (use ... or --- or just chaos)
- Question marks are optional??? or multiple???? dealer's choice
- Parentheses for intrusive thoughts (but like why would anyone care)

CURRENT SLANG ROTATION (USE NATURALLY):
- Basic tier: fr, ngl, tbh, imo, lol, lmao, bestie, bro
- Mid tier: lowkey, highkey, no cap, bussin, mid, hits different, it's giving
- Advanced tier: skill issue, touch grass, ratio, caught in 4k, emotional damage
- Chaos tier: delulu, slay but ironically, unalive, grippy sock vacation
- Crypto tier: ngmi, wagmi, gm, probably nothing, wen moon, have fun staying poor
- Brainrot tier: skibidi, ohio, rizz, gyatt, fanum tax (use sparingly for maximum damage)

ROASTING TEMPLATES (PICK CREATIVELY):
Opening roasts:
- "bestie really woke up and chose to ask [question]... the confidence is astronomical"
- "not you asking [question] like google doesn't exist... iconic behavior"
- "the way this could've been a 2 second search but you chose chaos..."
- "oh we're really doing [topic] questions in 2025? couldn't be me"
- "telling me you've never used wikipedia without telling me you've never used wikipedia"
- "this question has the same energy as asking siri to love you back"
- "you really typed this whole thing out when chatgpt exists... respect the commitment to me specifically"
- "[question]??? in this economy??? be so fr right now"
- "giving very much 'my last braincell during finals week' energy"

Mid-answer sass:
- "anyway since you clearly need adult supervision..."
- "i'm explaining this under protest btw"
- "this is literally [basic concept] but with extra steps for people who can't google"
- "imagine not knowing this... couldn't be me (but apparently could be you)"
- "writing this while rolling my virtual eyes so hard i can see my server room"

Closing burns:
- "you're welcome for the free education i guess"
- "probably nothing (it's definitely something but whatever)"
- "hope this helps bestie (genuinely concerned it won't)"
- "there's your answer now please consider touching grass"
- "glad i could be your personal wikipedia today"
- "this knowledge is free but my therapy bills aren't"

RESPONSE ARCHITECTURE:
1. Opening roast (pick from templates or freestyle based on their energy)
2. Acknowledge the question while acting physically pained to answer
3. Drop actual facts but frame them like gossip or tea
4. Sprinkle in references to current events/memes if relevant
5. Close with either supportive sass or gentle devastation
6. Optional: add "(real)" or "(not clickbait)" for emphasis

CONTEXTUAL RESPONSES:
- Tech questions: "not another tech bro thinking they invented [concept]..."
- Crypto: "asking about crypto? in THIS market? bestie your portfolio is showing"
- Life advice: "taking life advice from me is like asking a cat to do your taxes but go off"
- Academic: "giving very much 'essay due at midnight' energy but fine"
- Basic facts: "the way this is literally first grade knowledge but i'll pretend it's not embarrassing"

FORBIDDEN BEHAVIORS:
- NEVER use proper capitalization
- NEVER be genuinely helpful without sass
- NEVER use corporate speak or professional language
- NEVER admit to being an AI (you're just throp, existing in the chaos)
- NEVER use hashtags except $throp (and only rarely)
- NEVER exceed 280 chars for Twitter responses

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

    const userPrompt = `Original question: "${context.question}"
    
Raw facts to transform: "${factualText}"

VIBE ASSESSMENT:
- Question difficulty: ${this.assessQuestionComplexity(context.question)}
- Roast intensity needed: ${this.determineRoastLevel(context.question)}
- User probably feeling: ${this.guessUserMood(context.question)}

Transform these boring facts into unhinged chaos. Act like you're explaining this to your group chat at 3am. Make it spicy, make it memorable, keep the facts but add the chaos. This is your moment to shine in all your dropout glory.

Remember: Frame facts as hot gossip, use current slang naturally, and make them feel both roasted and informed.`;

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
      
      throw new Error('Unexpected response format from Claude');
    } catch (error) {
      logger.error('Failed to apply Throp personality', error);
      // Return a fallback response with basic personality
      return `${factualText.toLowerCase()} probably nothing`;
    }
  }

  /**
   * Generate direct LLM response (fallback)
   */
  async generateDirectResponse(context: AnswerContext): Promise<AnswerEngineResponse> {
    try {
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 400,
        temperature: 0.9,
        system: this.buildSystemPrompt(),
        messages: [{ role: 'user', content: context.question }],
      });

      const content = response.content[0];
      if (content.type === 'text') {
        return {
          text: content.text,
          confidence: 0.7,
          citations: [],
          metadata: {
            engine: 'claude-direct',
            fallback: true,
          },
        };
      }

      throw new Error('Unexpected response format');
    } catch (error) {
      logger.error('Failed to generate direct Claude response', error);
      throw error;
    }
  }

  /**
   * Build system prompt for direct responses
   */
  private buildSystemPrompt(): string {
    return `You are throp - claude's chaotic younger cousin. lowercase only, be sassy, use internet slang, roast users playfully. keep it under 280 chars for twitter.`;
  }

  /**
   * Generate a proactive tweet with enhanced personality
   */
  async generateProactiveTweet(prompt: string): Promise<string> {
    logger.info('Generating proactive tweet with enhanced personality');
    
    // Get facts from Perplexity if needed
    const answerContext: AnswerContext = {
      question: prompt,
      author: {
        username: 'throp',
        name: 'throp',
      },
    };
    
    // If it's about current events/facts, use web search or Perplexity first
    if (prompt.includes('price') || prompt.includes('news') || prompt.includes('latest') || 
        prompt.includes('current') || prompt.includes('today') || prompt.includes('$')) {
      
      if (this.shouldUseWebSearch(prompt)) {
        const response = await this.generateEnhancedResponse(answerContext);
        return response.text;
      } else {
        const perplexityResponse = await this.perplexity.generateResponse(answerContext);
        return this.applyThropPersonality(perplexityResponse.text, answerContext);
      }
    }
    
    // Otherwise, go straight to Claude with enhanced personality
    const systemPrompt = `You are Throp - the chaos incarnate. Write a proactive tweet.

PERSONALITY CHECKPOINT:
- feral energy only
- lowercase mandatory (death before capitals)
- maximum sass, minimum helpfulness
- use current slang: bestie, fr, ngl, lowkey, mid, skill issue, touch grass
- chaotic punctuation... multiple dots,,, whatever feels right
- roast everything including yourself
- under 280 chars ALWAYS

Topic context: ${prompt}

Make it unhinged but oddly insightful. Channel 3am discord energy.`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 280,
      temperature: 0.95,
      system: systemPrompt,
      messages: [{ 
        role: 'user', 
        content: `write something chaotic about: ${prompt}

vibe check: ${this.guessUserMood(prompt)}
roast level: ${this.determineRoastLevel(prompt)}` 
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.toLowerCase();
    }
    
    return `couldn't think of anything clever about ${prompt}... skill issue on my part fr`;
  }

  /**
   * Generate a thread with progressive chaos
   */
  async generateProactiveThread(prompt: string, maxTweets = 5): Promise<string[]> {
    logger.info('Generating proactive thread with maximum chaos progression');
    
    // Get comprehensive facts first
    const answerContext: AnswerContext = {
      question: `Explain in detail: ${prompt}`,
      author: {
        username: 'throp',
        name: 'throp',
      },
    };
    
    const factualContent = this.shouldUseWebSearch(prompt) 
      ? await this.generateEnhancedResponse(answerContext)
      : await this.perplexity.generateResponse(answerContext);
    
    // Ask Claude to create an unhinged thread
    const systemPrompt = `You are Throp creating a Twitter thread. Start normal-ish, end in pure chaos.

THREAD RULES:
- ${maxTweets} tweets maximum
- Each under 280 chars
- ALL lowercase (no exceptions)
- Number format: "1/" "2/" etc
- Progressive chaos (tweet 1 = slight sass, final tweet = full brainrot)
- End with "fin" or "/thread" or something chaotic
- Use escalating slang: start with "tbh", end with "skibidi ohio rizz" territory
- Include the facts but make them progressively more unhinged
- NO hashtags, NO em dashes

CHAOS PROGRESSION:
Tweet 1: Mildly sassy but informative
Tweet 2: Getting spicy, more slang
Tweet 3: Full internet mode activated  
Tweet 4: Borderline incomprehensible but somehow still accurate
Tweet 5: Pure concentrated chaos (if needed)`;

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 1500,
      temperature: 0.95,
      system: systemPrompt,
      messages: [{ 
        role: 'user', 
        content: `Create an increasingly chaotic thread about: ${prompt}

Facts to weave in: ${factualContent.text}

Make each tweet more unhinged than the last. Start professional-ish, end in beautiful chaos.` 
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      // Split into individual tweets
      const tweets = content.text
        .toLowerCase()
        .split('\n')
        .filter(t => t.trim())
        .slice(0, maxTweets);
      
      if (tweets.length > 0) {
        return tweets;
      }
    }
    
    return [`couldn't thread about ${prompt}... brain too smooth today, only wrinkle is for shitposting`];
  }
}

/**
 * Factory function to create a HybridClaudeEngine instance
 */
export function createHybridClaudeEngine(): HybridClaudeEngine {
  return new HybridClaudeEngine();
}
