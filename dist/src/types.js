/**
 * Core type definitions for Throp Twitter Bot
 * These types define the structure of our bot's data models
 */
import { z } from 'zod';
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
//# sourceMappingURL=types.js.map