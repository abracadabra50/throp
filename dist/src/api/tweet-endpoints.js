/**
 * Tweet-specific API endpoints for proactive tweeting
 * Allows prompting Throp to tweet about topics
 */
import { Router } from 'express';
import { createHybridClaudeEngine } from '../engines/hybrid-claude.js';
import { TwitterClient } from '../twitter/client.js';
import { logger } from '../utils/logger.js';
import { getRedisCache } from '../cache/redis.js';
import { adminAuth, adminRateLimit } from '../middleware/admin-auth.js';
/**
 * Create tweet-specific routes
 */
export function createTweetRoutes() {
    const router = Router();
    const hybridEngine = createHybridClaudeEngine();
    let twitterClient = null;
    // Only initialize Twitter client if not in API-only mode
    const isApiOnly = process.env.API_ONLY_MODE === 'true';
    if (!isApiOnly) {
        try {
            twitterClient = new TwitterClient();
        }
        catch (error) {
            logger.warn('Twitter client not available - tweet posting disabled');
        }
    }
    const cache = getRedisCache();
    /**
     * Generate and post a proactive tweet (ADMIN ONLY)
     * POST /api/tweet/prompt
     */
    router.post('/prompt', adminAuth, adminRateLimit(), async (req, res) => {
        try {
            const { prompt, dryRun = true, thread = false, maxTweets = 5 } = req.body;
            if (!prompt) {
                res.status(400).json({
                    success: false,
                    error: 'Prompt is required',
                });
                return;
            }
            logger.info('generating proactive tweet', { prompt, thread, dryRun });
            let result;
            if (thread) {
                // Generate a thread
                const tweets = await hybridEngine.generateProactiveThread(prompt, maxTweets);
                if (!dryRun && twitterClient) {
                    // Post the thread
                    const postedTweets = await twitterClient.postThread(tweets);
                    result = {
                        type: 'thread',
                        tweets,
                        tweetIds: postedTweets.map(t => t.id),
                        count: tweets.length,
                    };
                }
                else {
                    result = {
                        type: 'thread',
                        tweets,
                        dryRun: true,
                        count: tweets.length,
                    };
                }
                // Cache the thread
                await cache.cacheInteraction(prompt, tweets.join('\n---\n'), 'api');
            }
            else {
                // Generate a single tweet
                const tweet = await hybridEngine.generateProactiveTweet(prompt);
                if (!dryRun && twitterClient) {
                    // Post the tweet
                    const posted = await twitterClient.tweet(tweet);
                    result = {
                        type: 'single',
                        tweet,
                        tweetId: posted.id,
                        url: `https://twitter.com/throp/status/${posted.id}`,
                    };
                }
                else {
                    result = {
                        type: 'single',
                        tweet,
                        dryRun: true,
                    };
                }
                // Cache the tweet
                await cache.cacheInteraction(prompt, tweet, 'api');
            }
            res.json({
                success: true,
                ...result,
                prompt,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger.error('Failed to generate proactive tweet', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });
    /**
     * React to a trending topic (ADMIN ONLY)
     * POST /api/tweet/react
     */
    router.post('/react', adminAuth, adminRateLimit(), async (req, res) => {
        try {
            const { topic, sentiment = 'neutral', dryRun = true } = req.body;
            if (!topic) {
                res.status(400).json({
                    success: false,
                    error: 'Topic is required',
                });
                return;
            }
            logger.info('reacting to trend', { topic, sentiment, dryRun });
            // Generate reaction tweet using regular proactive tweet
            const prompt = `React to this trending topic: ${topic}. Sentiment: ${sentiment || 'neutral'}`;
            const tweet = await hybridEngine.generateProactiveTweet(prompt);
            let result;
            if (!dryRun && twitterClient) {
                const posted = await twitterClient.tweet(tweet);
                result = {
                    tweet,
                    tweetId: posted.id,
                    url: `https://twitter.com/throp/status/${posted.id}`,
                };
            }
            else {
                result = {
                    tweet,
                    dryRun: true,
                };
            }
            // Cache the reaction
            await cache.cacheInteraction(`React to ${topic} (${sentiment})`, tweet, 'api');
            res.json({
                success: true,
                ...result,
                topic,
                sentiment,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger.error('Failed to react to trend', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });
    /**
     * Schedule a tweet for later (ADMIN ONLY)
     * POST /api/tweet/schedule
     */
    router.post('/schedule', adminAuth, adminRateLimit(), async (req, res) => {
        try {
            const { prompt, scheduleTime, recurring, dryRun = true } = req.body;
            if (!prompt) {
                res.status(400).json({
                    success: false,
                    error: 'Prompt is required',
                });
                return;
            }
            // For now, just generate the tweet and show what would be scheduled
            const tweet = await hybridEngine.generateProactiveTweet(prompt);
            const scheduledFor = scheduleTime ? new Date(scheduleTime) : new Date(Date.now() + 60000); // 1 minute from now
            // In a real implementation, we'd store this in Redis/DB and have a cron job
            const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            if (!dryRun) {
                // Store schedule in Redis
                await cache.cache(`schedule:${scheduleId}`, {
                    prompt,
                    tweet,
                    scheduleTime: scheduledFor.toISOString(),
                    recurring,
                    created: new Date().toISOString(),
                }, 86400); // 24 hour TTL
            }
            res.json({
                success: true,
                scheduleId,
                tweet,
                scheduledFor: scheduledFor.toISOString(),
                recurring,
                dryRun,
                message: dryRun
                    ? 'This is what would be scheduled (dry run)'
                    : 'Tweet scheduled successfully',
            });
        }
        catch (error) {
            logger.error('Failed to schedule tweet', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });
    /**
     * Get tweet ideas based on current trends (PUBLIC)
     * GET /api/tweet/ideas
     */
    router.get('/ideas', async (_req, res) => {
        try {
            // Generate some tweet ideas based on current context
            const ideas = [
                'gm to everyone except people who use light mode',
                'bitcoin doing bitcoin things again',
                'javascript was a mistake and we all know it',
                'who decided 9-5 was a good idea, i just wanna talk',
                'the year is 2025 and we still dont have flying cars',
                'ai will never replace my ability to write bad code',
                'touched grass today,,, overrated experience tbh',
                'normalize closing laptop at 3pm and going outside',
                'every app is just a spreadsheet in a trench coat',
                'decentralization is when the servers are in different colors',
            ];
            res.json({
                success: true,
                ideas: ideas.map(idea => ({
                    text: idea,
                    prompt: `Tweet about: ${idea}`,
                })),
                tip: 'Use POST /api/tweet/prompt with any of these prompts',
            });
        }
        catch (error) {
            logger.error('Failed to generate ideas', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });
    /**
     * Preview how a text would look in chaos mode (PUBLIC)
     * POST /api/tweet/preview
     */
    router.post('/preview', async (req, res) => {
        try {
            const { text, progressive = false } = req.body;
            if (!text) {
                res.status(400).json({
                    success: false,
                    error: 'Text is required',
                });
                return;
            }
            // Import chaos formatter
            const { chaosTransform } = await import('../utils/chaos-formatter.js');
            let result;
            if (progressive) {
                // Show progressive chaos for a thread (simplified for now)
                result = {
                    original: text,
                    tweets: [
                        text.toLowerCase(),
                        chaosTransform(text),
                        chaosTransform(chaosTransform(text)),
                        chaosTransform(chaosTransform(chaosTransform(text))),
                        chaosTransform(chaosTransform(chaosTransform(chaosTransform(text)))),
                    ],
                };
            }
            else {
                result = {
                    original: text,
                    chaos: chaosTransform(text),
                };
            }
            res.json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            logger.error('Failed to preview chaos', error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });
    return router;
}
// Add tweet method to TwitterClient
TwitterClient.prototype.tweet = async function (text) {
    if (this.config.bot.dryRun) {
        logger.info('[DRY RUN] Would tweet', { text });
        return { id: 'dry-run-id', text };
    }
    try {
        const response = await this.executeWithRetry(async () => {
            return await this.v2Client.tweet(text);
        });
        logger.success(`Posted tweet`, { tweetId: response.data.id });
        return response.data;
    }
    catch (error) {
        logger.error('Failed to post tweet', error);
        throw this.wrapError(error);
    }
};
//# sourceMappingURL=tweet-endpoints.js.map