/**
 * Core type definitions for Throp Twitter Bot
 * These types define the structure of our bot's data models
 */

import { z } from 'zod';
import type { TweetV2, UserV2 } from 'twitter-api-v2';

/**
 * Twitter API Plan tiers - determines rate limiting
 * Basic: Standard tier with moderate limits
 * Pro: Higher limits for professional use
 * Enterprise: Maximum limits for large-scale operations
 */
export type TwitterApiPlan = 'basic' | 'pro' | 'enterprise';

/**
 * Supported AI answer engines
 * Each engine has different capabilities and use cases
 */
export type AnswerEngine = 'openai' | 'perplexity' | 'dexa' | 'custom' | 'hybrid-claude';

/**
 * Bot configuration schema using Zod for runtime validation
 */
export const ConfigSchema = z.object({
  // Twitter API credentials
  twitter: z.object({
    apiKey: z.string(),
    apiSecretKey: z.string(),
    accessToken: z.string(),
    accessTokenSecret: z.string(),
    bearerToken: z.string().optional(),
    botUsername: z.string(),
    botUserId: z.string(),
    apiPlan: z.enum(['basic', 'pro', 'enterprise']),
  }),

  // OAuth configuration (via Nango)
  oauth: z.object({
    nangoSecretKey: z.string().optional(),
    nangoConnectionId: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
  }),

  // Redis configuration
  redis: z.object({
    url: z.string().optional(),
    namespace: z.string().default('throp'),
  }),

  // OpenAI configuration
  openai: z.object({
    apiKey: z.string().optional(),
    model: z.string().default('gpt-4-turbo-preview'),
    maxTokens: z.number().default(1000),
    temperature: z.number().default(0.7),
  }),

  // Perplexity configuration
  perplexity: z.object({
    apiKey: z.string().optional(),
    model: z.string().default('sonar'),
    maxTokens: z.number().default(1000),
    temperature: z.number().default(0.7),
  }),

  // Bot behaviour settings
  bot: z.object({
    answerEngine: z.enum(['openai', 'perplexity', 'dexa', 'custom']).default('openai'),
    maxMentionsPerBatch: z.number().default(10),
    maxTweetsPerHour: z.number().default(30),
    maxTweetLength: z.number().default(280),
    enableThreadResponses: z.boolean().default(true),
    maxThreadLength: z.number().default(5),
    dryRun: z.boolean().default(false),
    debug: z.boolean().default(false),
  }),

  // Content moderation settings
  moderation: z.object({
    enabled: z.boolean().default(true),
    threshold: z.number().default(0.7),
  }),

  // Feature flags
  features: z.object({
    imageAnalysis: z.boolean().default(false),
    linkExpansion: z.boolean().default(true),
    quoteTweetContext: z.boolean().default(true),
    userProfileContext: z.boolean().default(true),
  }),

  // Monitoring
  monitoring: z.object({
    sentryDsn: z.string().optional(),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Represents a Twitter mention that the bot needs to process
 */
export interface TwitterMention {
  id: string;
  text: string;
  authorId: string;
  authorUsername?: string;
  createdAt: Date;
  conversationId: string;
  inReplyToUserId?: string;
  referencedTweets?: Array<{
    type: 'retweeted' | 'quoted' | 'replied_to';
    id: string;
  }>;
  entities?: {
    mentions?: Array<{ username: string; id: string }>;
    urls?: Array<{ url: string; expanded_url: string; display_url: string }>;
    hashtags?: Array<{ tag: string }>;
    media?: Array<{ media_key: string; type: string; url?: string }>;
  };
  // Enriched data
  quotedTweet?: TweetV2;
  repliedToTweet?: TweetV2;
  author?: UserV2;
  score?: number; // Priority score for processing
  processed?: boolean;
  response?: string;
  responseId?: string;
  error?: string;
}

/**
 * State that persists between bot runs
 */
export interface BotState {
  lastMentionId?: string;
  processedMentions: Set<string>;
  rateLimitReset?: Date;
  stats: {
    mentionsProcessed: number;
    responsesGenerated: number;
    errors: number;
    lastRun?: Date;
  };
}

/**
 * Rate limit information from Twitter API
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  retryAfter?: number;
}

/**
 * Response from answer engines
 */
export interface AnswerEngineResponse {
  text: string;
  confidence?: number;
  citations?: string[];
  metadata?: Record<string, any>;
  shouldThread?: boolean; // If response needs to be split into thread
  threadParts?: string[]; // Pre-split thread parts
}

/**
 * Cache entry structure
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Tweet validation result
 */
export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  flags?: {
    isReply?: boolean;
    isBot?: boolean;
    isSpam?: boolean;
    isSensitive?: boolean;
    hasMedia?: boolean;
    hasLinks?: boolean;
  };
}

/**
 * Context provided to answer engines
 */
export interface AnswerContext {
  question: string;
  author: {
    username: string;
    name?: string;
    bio?: string;
    verified?: boolean;
  };
  conversation?: {
    previousTweets: Array<{
      text: string;
      author: string;
      timestamp: Date;
    }>;
  };
  quotedTweet?: {
    text: string;
    author: string;
  };
  mentionedUsers?: Array<{
    username: string;
    name?: string;
    bio?: string;
  }>;
  links?: Array<{
    url: string;
    title?: string;
    description?: string;
    content?: string;
  }>;
  media?: Array<{
    type: 'image' | 'video' | 'gif';
    url: string;
    altText?: string;
  }>;
}

/**
 * Processing pipeline stage
 */
export type PipelineStage = 
  | 'fetch'
  | 'validate'
  | 'enrich'
  | 'moderate'
  | 'generate'
  | 'format'
  | 'post'
  | 'complete';

/**
 * Processing result for each mention
 */
export interface ProcessingResult {
  mentionId: string;
  success: boolean;
  stage: PipelineStage;
  response?: string;
  responseId?: string;
  error?: Error;
  duration?: number;
}
