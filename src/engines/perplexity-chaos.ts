/**
 * Perplexity Chaos Engine - Perplexity AI with Throp's chaotic personality
 * Real-time information but make it unhinged
 */

import { PerplexityEngine } from './perplexity.js';
import { chaosTransform, formatThreadWithChaos } from '../utils/chaos-formatter.js';
import type { AnswerContext, AnswerEngineResponse } from '../types.js';
import { logger } from '../utils/logger.js';

/**
 * Chaos-enhanced Perplexity engine
 */
export class PerplexityChaosEngine extends PerplexityEngine {
  constructor() {
    super();
    this.name = 'perplexity-chaos';
  }

  /**
   * Generate response and apply chaos formatting
   */
  async generateResponse(context: AnswerContext): Promise<AnswerEngineResponse> {
    // Get the normal response from Perplexity
    const response = await super.generateResponse(context);
    
    logger.info('applying chaos transformation,,,');
    
    // Transform the response to lowercase chaos
    const chaoticText = chaosTransform(response.text);
    
    // If it needs threading, apply progressive chaos
    let chaoticThreadParts: string[] | undefined;
    if (response.threadParts) {
      chaoticThreadParts = formatThreadWithChaos(response.threadParts);
    }
    
    // Format citations in a chaotic way
    let chaoticCitations: string[] | undefined;
    if (response.citations && response.citations.length > 0) {
      chaoticCitations = response.citations.map(citation => {
        const formats = [
          `source - ${citation}`,
          `${citation} (trust me)`,
          `proof - ${citation}`,
          `${citation} or whatever`,
          `allegedly from ${citation}`,
          `${citation} if you must know`,
        ];
        return formats[Math.floor(Math.random() * formats.length)];
      });
    }
    
    return {
      ...response,
      text: chaoticText,
      threadParts: chaoticThreadParts,
      citations: chaoticCitations,
      metadata: {
        ...response.metadata,
        chaosMode: true,
        originalLength: response.text.length,
        chaoticLength: chaoticText.length,
      },
    };
  }

  /**
   * Generate a proactive tweet from a prompt
   */
  async generateProactiveTweet(prompt: string, _context?: any): Promise<string> {
    logger.info('generating proactive chaos tweet');
    
    // Create a context for the answer engine - specifically request NO threading
    const answerContext: AnswerContext = {
      question: `Write a single short tweet about: ${prompt}. Keep it under 200 characters. Do NOT create a thread.`,
      author: {
        username: 'throp',
        name: 'throp',
      },
    };
    
    // Get response from Perplexity
    const response = await super.generateResponse(answerContext);
    
    // Use only the main text, ignore thread parts
    let tweet = response.text;
    
    // Strip any thread markers if they snuck in
    tweet = tweet.replace(/\[\d+\/\d+\]/g, '').trim();
    
    // Apply maximum chaos
    tweet = chaosTransform(tweet);
    
    // The chaos formatter already ensures 280 char limit
    
    return tweet;
  }

  /**
   * Generate a thread about a topic with progressive chaos
   */
  async generateProactiveThread(prompt: string, maxTweets = 5): Promise<string[]> {
    logger.info(`generating ${maxTweets} tweet chaos thread`);
    
    // Get comprehensive response from Perplexity
    const answerContext: AnswerContext = {
      question: `Explain in detail: ${prompt}. Provide a comprehensive answer with multiple points.`,
      author: {
        username: 'throp',
        name: 'throp',
      },
    };
    
    const response = await super.generateResponse(answerContext);
    
    // If Perplexity already split it into threads, use those
    if (response.threadParts && response.threadParts.length > 0) {
      return formatThreadWithChaos(response.threadParts.slice(0, maxTweets));
    }
    
    // Otherwise, split the response ourselves
    const sentences = response.text.match(/[^.!?]+[.!?]+/g) || [response.text];
    const tweetsPerPart = Math.ceil(sentences.length / maxTweets);
    const tweets: string[] = [];
    
    for (let i = 0; i < maxTweets; i++) {
      const start = i * tweetsPerPart;
      const end = Math.min(start + tweetsPerPart, sentences.length);
      const tweetText = sentences.slice(start, end).join(' ');
      
      if (tweetText.trim()) {
        tweets.push(tweetText);
      }
    }
    
    // Apply progressive chaos
    return formatThreadWithChaos(tweets);
  }

  /**
   * React to trending topics with chaos energy
   */
  async reactToTrend(topic: string, sentiment?: 'bullish' | 'bearish' | 'neutral'): Promise<string> {
    const reactions = {
      bullish: [
        `${topic} TO THE MOON,,, this is financial advice`,
        `${topic} PUMPING and im not even surprised`,
        `called ${topic} at $0.01,,, you wouldnt listen`,
        `${topic} bears in ABSOLUTE shambles rn`,
        `${topic} UP ONLY,,, few understand`,
      ],
      bearish: [
        `${topic} absolutely NUKING,,, hate to see it`,
        `${topic} holders down BAD,, many such cases`,
        `rip ${topic},,, it was fun while it lasted`,
        `${topic} chart looking like my portfolio (derogatory)`,
        `imagine still holding ${topic} in 2025`,
      ],
      neutral: [
        `${topic} doing ${topic} things,,, nature is healing`,
        `${topic} exists and thats about it`,
        `${topic} is certainly one of the topics of all time`,
        `thoughts on ${topic} - no thoughts head empty`,
        `${topic} happening,,, source - i made it up`,
      ],
    };
    
    const sentimentReactions = reactions[sentiment || 'neutral'];
    const baseReaction = sentimentReactions[Math.floor(Math.random() * sentimentReactions.length)];
    
    // Get current data about the topic
    const answerContext: AnswerContext = {
      question: `What's currently happening with ${topic}? One sentence.`,
      author: {
        username: 'throp',
        name: 'throp',
      },
    };
    
    const response = await super.generateResponse(answerContext);
    const chaoticContext = chaosTransform(response.text);
    
    return `${baseReaction}\n\ncontext - ${chaoticContext}`;
  }
}

/**
 * Factory function to create chaos engine
 */
export function createPerplexityChaosEngine(): PerplexityChaosEngine {
  return new PerplexityChaosEngine();
}
