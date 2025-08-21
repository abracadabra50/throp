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
export type AnswerEngine = 'openai' | 'perplexity' | 'perplexity-intelligent' | 'dexa' | 'custom' | 'hybrid-claude';
/**
 * Bot configuration schema using Zod for runtime validation
 */
export declare const ConfigSchema: z.ZodObject<{
    twitter: z.ZodObject<{
        apiKey: z.ZodString;
        apiSecretKey: z.ZodString;
        accessToken: z.ZodString;
        accessTokenSecret: z.ZodString;
        bearerToken: z.ZodOptional<z.ZodString>;
        botUsername: z.ZodString;
        botUserId: z.ZodString;
        apiPlan: z.ZodEnum<["basic", "pro", "enterprise"]>;
    }, "strip", z.ZodTypeAny, {
        apiKey: string;
        apiSecretKey: string;
        accessToken: string;
        accessTokenSecret: string;
        botUsername: string;
        botUserId: string;
        apiPlan: "basic" | "pro" | "enterprise";
        bearerToken?: string | undefined;
    }, {
        apiKey: string;
        apiSecretKey: string;
        accessToken: string;
        accessTokenSecret: string;
        botUsername: string;
        botUserId: string;
        apiPlan: "basic" | "pro" | "enterprise";
        bearerToken?: string | undefined;
    }>;
    oauth: z.ZodObject<{
        nangoSecretKey: z.ZodOptional<z.ZodString>;
        nangoConnectionId: z.ZodOptional<z.ZodString>;
        clientId: z.ZodOptional<z.ZodString>;
        clientSecret: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        nangoSecretKey?: string | undefined;
        nangoConnectionId?: string | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
    }, {
        nangoSecretKey?: string | undefined;
        nangoConnectionId?: string | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
    }>;
    redis: z.ZodObject<{
        url: z.ZodOptional<z.ZodString>;
        namespace: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        namespace: string;
        url?: string | undefined;
    }, {
        url?: string | undefined;
        namespace?: string | undefined;
    }>;
    openai: z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        model: z.ZodDefault<z.ZodString>;
        maxTokens: z.ZodDefault<z.ZodNumber>;
        temperature: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        model: string;
        maxTokens: number;
        temperature: number;
        apiKey?: string | undefined;
    }, {
        apiKey?: string | undefined;
        model?: string | undefined;
        maxTokens?: number | undefined;
        temperature?: number | undefined;
    }>;
    perplexity: z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        model: z.ZodDefault<z.ZodString>;
        maxTokens: z.ZodDefault<z.ZodNumber>;
        temperature: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        model: string;
        maxTokens: number;
        temperature: number;
        apiKey?: string | undefined;
    }, {
        apiKey?: string | undefined;
        model?: string | undefined;
        maxTokens?: number | undefined;
        temperature?: number | undefined;
    }>;
    anthropic: z.ZodObject<{
        apiKey: z.ZodOptional<z.ZodString>;
        model: z.ZodDefault<z.ZodString>;
        maxTokens: z.ZodDefault<z.ZodNumber>;
        temperature: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        model: string;
        maxTokens: number;
        temperature: number;
        apiKey?: string | undefined;
    }, {
        apiKey?: string | undefined;
        model?: string | undefined;
        maxTokens?: number | undefined;
        temperature?: number | undefined;
    }>;
    bot: z.ZodObject<{
        answerEngine: z.ZodDefault<z.ZodEnum<["hybrid-claude", "perplexity", "perplexity-intelligent", "perplexity-chaos", "custom"]>>;
        maxMentionsPerBatch: z.ZodDefault<z.ZodNumber>;
        maxTweetsPerHour: z.ZodDefault<z.ZodNumber>;
        maxTweetLength: z.ZodDefault<z.ZodNumber>;
        enableThreadResponses: z.ZodDefault<z.ZodBoolean>;
        maxThreadLength: z.ZodDefault<z.ZodNumber>;
        dryRun: z.ZodDefault<z.ZodBoolean>;
        debug: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        answerEngine: "perplexity" | "perplexity-intelligent" | "custom" | "hybrid-claude" | "perplexity-chaos";
        maxMentionsPerBatch: number;
        maxTweetsPerHour: number;
        maxTweetLength: number;
        enableThreadResponses: boolean;
        maxThreadLength: number;
        dryRun: boolean;
        debug: boolean;
    }, {
        answerEngine?: "perplexity" | "perplexity-intelligent" | "custom" | "hybrid-claude" | "perplexity-chaos" | undefined;
        maxMentionsPerBatch?: number | undefined;
        maxTweetsPerHour?: number | undefined;
        maxTweetLength?: number | undefined;
        enableThreadResponses?: boolean | undefined;
        maxThreadLength?: number | undefined;
        dryRun?: boolean | undefined;
        debug?: boolean | undefined;
    }>;
    moderation: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        threshold: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        threshold: number;
    }, {
        enabled?: boolean | undefined;
        threshold?: number | undefined;
    }>;
    features: z.ZodObject<{
        imageAnalysis: z.ZodDefault<z.ZodBoolean>;
        linkExpansion: z.ZodDefault<z.ZodBoolean>;
        quoteTweetContext: z.ZodDefault<z.ZodBoolean>;
        userProfileContext: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        imageAnalysis: boolean;
        linkExpansion: boolean;
        quoteTweetContext: boolean;
        userProfileContext: boolean;
    }, {
        imageAnalysis?: boolean | undefined;
        linkExpansion?: boolean | undefined;
        quoteTweetContext?: boolean | undefined;
        userProfileContext?: boolean | undefined;
    }>;
    monitoring: z.ZodObject<{
        sentryDsn: z.ZodOptional<z.ZodString>;
        logLevel: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
    }, "strip", z.ZodTypeAny, {
        logLevel: "debug" | "info" | "warn" | "error";
        sentryDsn?: string | undefined;
    }, {
        sentryDsn?: string | undefined;
        logLevel?: "debug" | "info" | "warn" | "error" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    openai: {
        model: string;
        maxTokens: number;
        temperature: number;
        apiKey?: string | undefined;
    };
    perplexity: {
        model: string;
        maxTokens: number;
        temperature: number;
        apiKey?: string | undefined;
    };
    twitter: {
        apiKey: string;
        apiSecretKey: string;
        accessToken: string;
        accessTokenSecret: string;
        botUsername: string;
        botUserId: string;
        apiPlan: "basic" | "pro" | "enterprise";
        bearerToken?: string | undefined;
    };
    oauth: {
        nangoSecretKey?: string | undefined;
        nangoConnectionId?: string | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
    };
    redis: {
        namespace: string;
        url?: string | undefined;
    };
    anthropic: {
        model: string;
        maxTokens: number;
        temperature: number;
        apiKey?: string | undefined;
    };
    bot: {
        answerEngine: "perplexity" | "perplexity-intelligent" | "custom" | "hybrid-claude" | "perplexity-chaos";
        maxMentionsPerBatch: number;
        maxTweetsPerHour: number;
        maxTweetLength: number;
        enableThreadResponses: boolean;
        maxThreadLength: number;
        dryRun: boolean;
        debug: boolean;
    };
    moderation: {
        enabled: boolean;
        threshold: number;
    };
    features: {
        imageAnalysis: boolean;
        linkExpansion: boolean;
        quoteTweetContext: boolean;
        userProfileContext: boolean;
    };
    monitoring: {
        logLevel: "debug" | "info" | "warn" | "error";
        sentryDsn?: string | undefined;
    };
}, {
    openai: {
        apiKey?: string | undefined;
        model?: string | undefined;
        maxTokens?: number | undefined;
        temperature?: number | undefined;
    };
    perplexity: {
        apiKey?: string | undefined;
        model?: string | undefined;
        maxTokens?: number | undefined;
        temperature?: number | undefined;
    };
    twitter: {
        apiKey: string;
        apiSecretKey: string;
        accessToken: string;
        accessTokenSecret: string;
        botUsername: string;
        botUserId: string;
        apiPlan: "basic" | "pro" | "enterprise";
        bearerToken?: string | undefined;
    };
    oauth: {
        nangoSecretKey?: string | undefined;
        nangoConnectionId?: string | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
    };
    redis: {
        url?: string | undefined;
        namespace?: string | undefined;
    };
    anthropic: {
        apiKey?: string | undefined;
        model?: string | undefined;
        maxTokens?: number | undefined;
        temperature?: number | undefined;
    };
    bot: {
        answerEngine?: "perplexity" | "perplexity-intelligent" | "custom" | "hybrid-claude" | "perplexity-chaos" | undefined;
        maxMentionsPerBatch?: number | undefined;
        maxTweetsPerHour?: number | undefined;
        maxTweetLength?: number | undefined;
        enableThreadResponses?: boolean | undefined;
        maxThreadLength?: number | undefined;
        dryRun?: boolean | undefined;
        debug?: boolean | undefined;
    };
    moderation: {
        enabled?: boolean | undefined;
        threshold?: number | undefined;
    };
    features: {
        imageAnalysis?: boolean | undefined;
        linkExpansion?: boolean | undefined;
        quoteTweetContext?: boolean | undefined;
        userProfileContext?: boolean | undefined;
    };
    monitoring: {
        sentryDsn?: string | undefined;
        logLevel?: "debug" | "info" | "warn" | "error" | undefined;
    };
}>;
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
        mentions?: Array<{
            username: string;
            id: string;
        }>;
        urls?: Array<{
            url: string;
            expanded_url: string;
            display_url: string;
        }>;
        hashtags?: Array<{
            tag: string;
        }>;
        media?: Array<{
            media_key: string;
            type: string;
            url?: string;
        }>;
    };
    quotedTweet?: TweetV2;
    repliedToTweet?: TweetV2;
    author?: UserV2;
    score?: number;
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
    shouldThread?: boolean;
    threadParts?: string[];
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
    metadata?: Record<string, any>;
}
/**
 * Processing pipeline stage
 */
export type PipelineStage = 'fetch' | 'validate' | 'enrich' | 'moderate' | 'generate' | 'format' | 'post' | 'complete';
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
//# sourceMappingURL=types.d.ts.map