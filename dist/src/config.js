/**
 * Configuration loader for Throp bot
 * Handles environment variables and validation
 */
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';
import { ConfigSchema } from './types.js';
import chalk from 'chalk';
// Load environment variables
loadEnv();
/**
 * Parse and validate configuration from environment variables
 * @returns Validated configuration object
 * @throws Error if required configuration is missing or invalid
 */
export function loadConfig() {
    try {
        const rawConfig = {
            twitter: {
                apiKey: process.env.TWITTER_API_KEY,
                apiSecretKey: process.env.TWITTER_API_SECRET_KEY,
                accessToken: process.env.TWITTER_ACCESS_TOKEN,
                accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
                bearerToken: process.env.TWITTER_BEARER_TOKEN,
                botUsername: process.env.TWITTER_BOT_USERNAME || 'throp',
                botUserId: process.env.TWITTER_BOT_USER_ID || '',
                apiPlan: process.env.TWITTER_API_PLAN || 'basic',
            },
            oauth: {
                nangoSecretKey: process.env.NANGO_SECRET_KEY,
                nangoConnectionId: process.env.NANGO_CONNECTION_ID,
                clientId: process.env.TWITTER_OAUTH_CLIENT_ID,
                clientSecret: process.env.TWITTER_OAUTH_CLIENT_SECRET,
            },
            redis: {
                url: process.env.REDIS_URL,
                namespace: process.env.REDIS_NAMESPACE || 'throp',
            },
            openai: {
                apiKey: process.env.OPENAI_API_KEY,
                model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
                maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000', 10),
                temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
            },
            perplexity: {
                apiKey: process.env.PERPLEXITY_API_KEY,
                model: process.env.PERPLEXITY_MODEL || 'sonar-medium-online',
            },
            bot: {
                answerEngine: process.env.ANSWER_ENGINE || 'openai',
                maxMentionsPerBatch: parseInt(process.env.MAX_MENTIONS_PER_BATCH || '10', 10),
                maxTweetsPerHour: parseInt(process.env.MAX_TWEETS_PER_HOUR || '30', 10),
                maxTweetLength: parseInt(process.env.MAX_TWEET_LENGTH || '280', 10),
                enableThreadResponses: process.env.ENABLE_THREAD_RESPONSES !== 'false',
                maxThreadLength: parseInt(process.env.MAX_THREAD_LENGTH || '5', 10),
                dryRun: process.env.DRY_RUN === 'true',
                debug: process.env.DEBUG === 'true',
            },
            moderation: {
                enabled: process.env.ENABLE_CONTENT_MODERATION !== 'false',
                threshold: parseFloat(process.env.MODERATION_THRESHOLD || '0.7'),
            },
            features: {
                imageAnalysis: process.env.ENABLE_IMAGE_ANALYSIS === 'true',
                linkExpansion: process.env.ENABLE_LINK_EXPANSION !== 'false',
                quoteTweetContext: process.env.ENABLE_QUOTE_TWEET_CONTEXT !== 'false',
                userProfileContext: process.env.ENABLE_USER_PROFILE_CONTEXT !== 'false',
            },
            monitoring: {
                sentryDsn: process.env.SENTRY_DSN,
                logLevel: process.env.LOG_LEVEL || 'info',
            },
        };
        // Validate configuration
        const config = ConfigSchema.parse(rawConfig);
        // Additional validation
        validateAnswerEngine(config);
        validateTwitterCredentials(config);
        return config;
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.error(chalk.red('❌ Configuration validation failed:'));
            error.errors.forEach(err => {
                console.error(chalk.yellow(`  - ${err.path.join('.')}: ${err.message}`));
            });
            console.error(chalk.cyan('\n💡 Please check your environment variables and ensure all required fields are set.'));
            console.error(chalk.cyan('   Copy env.example to .env and fill in your credentials.'));
        }
        else {
            console.error(chalk.red('❌ Failed to load configuration:'), error);
        }
        process.exit(1);
    }
}
/**
 * Validate that the selected answer engine has required credentials
 */
function validateAnswerEngine(config) {
    const engine = config.bot.answerEngine;
    switch (engine) {
        case 'openai':
            if (!config.openai.apiKey) {
                throw new Error('OpenAI API key is required when using OpenAI answer engine');
            }
            break;
        case 'perplexity':
            if (!config.perplexity.apiKey) {
                throw new Error('Perplexity API key is required when using Perplexity answer engine');
            }
            break;
        case 'dexa':
            // Dexa validation would go here if we had the API
            console.warn(chalk.yellow('⚠️ Dexa answer engine is currently in private beta'));
            break;
        case 'custom':
            console.log(chalk.cyan('ℹ️ Using custom answer engine - ensure your implementation is ready'));
            break;
    }
}
/**
 * Validate Twitter credentials are properly configured
 */
function validateTwitterCredentials(config) {
    const { twitter } = config;
    // Allow API-only mode without Twitter credentials
    const isApiOnlyMode = process.env.API_ONLY_MODE === 'true';
    if (isApiOnlyMode) {
        console.log(chalk.yellow('⚠️ Running in API-only mode (no Twitter functionality)'));
        return;
    }
    if (!twitter.apiKey || !twitter.apiSecretKey) {
        throw new Error('Twitter API key and secret are required');
    }
    if (!twitter.accessToken || !twitter.accessTokenSecret) {
        throw new Error('Twitter access token and secret are required');
    }
    if (!twitter.botUserId && !twitter.botUsername) {
        throw new Error('Either Twitter bot user ID or username must be provided');
    }
    // Warn about API plan
    if (twitter.apiPlan === 'basic') {
        console.log(chalk.yellow('⚠️ Using basic Twitter API plan - rate limits will be more restrictive'));
        console.log(chalk.yellow('   Consider upgrading to Pro or Enterprise for better performance'));
    }
}
/**
 * Get rate limits based on Twitter API plan
 * These are approximate limits - actual limits may vary
 */
export function getRateLimits(plan) {
    const limits = {
        basic: {
            tweetsPerMonth: 1500,
            tweetsPerDay: 50,
            mentionsPerRequest: 100,
            requestsPerFifteenMinutes: 15,
        },
        pro: {
            tweetsPerMonth: 3000,
            tweetsPerDay: 100,
            mentionsPerRequest: 100,
            requestsPerFifteenMinutes: 75,
        },
        enterprise: {
            tweetsPerMonth: 10000,
            tweetsPerDay: 300,
            mentionsPerRequest: 100,
            requestsPerFifteenMinutes: 300,
        },
    };
    return limits[plan];
}
/**
 * Calculate delay between requests based on rate limits
 * @param plan Twitter API plan
 * @returns Delay in milliseconds
 */
export function calculateRequestDelay(plan) {
    const limits = getRateLimits(plan);
    // Calculate delay to stay safely under rate limits
    // 15 minutes = 900000ms
    const delayMs = Math.ceil(900000 / (limits.requestsPerFifteenMinutes * 0.8)); // Use 80% of limit to be safe
    return delayMs;
}
/**
 * Check if we're within daily tweet limits
 * @param tweetCount Number of tweets sent today
 * @param plan Twitter API plan
 * @returns Whether we can send more tweets
 */
export function canSendMoreTweets(tweetCount, plan) {
    const limits = getRateLimits(plan);
    return tweetCount < limits.tweetsPerDay;
}
// Export singleton config instance
let configInstance = null;
/**
 * Get or create config singleton
 * @returns Configuration instance
 */
export function getConfig() {
    if (!configInstance) {
        configInstance = loadConfig();
    }
    return configInstance;
}
export default getConfig;
//# sourceMappingURL=config.js.map