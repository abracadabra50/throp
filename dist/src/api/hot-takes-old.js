/**
 * Hot Takes Endpoint - Uses real Twitter trending topics
 */
import { logger } from '../utils/logger.js';
import { TwitterClient } from '../twitter/client.js';
import Anthropic from '@anthropic-ai/sdk';
// Cache for hot takes
let cachedHotTakes = null;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
/**
 * Determine category based on trend name
 */
function determineCategory(name) {
    const lower = name.toLowerCase();
    if (lower.includes('nfl') || lower.includes('nba') || lower.includes('game') ||
        lower.includes('match') || lower.includes('vs') || lower.includes('football') ||
        lower.includes('basketball') || lower.includes('soccer') || lower.includes('ufc')) {
        return 'sports';
    }
    if (lower.includes('bitcoin') || lower.includes('crypto') || lower.includes('eth') ||
        lower.includes('nft') || lower.includes('defi') || lower.includes('sol')) {
        return 'crypto';
    }
    if (lower.includes('president') || lower.includes('election') || lower.includes('congress') ||
        lower.includes('senate') || lower.includes('policy') || lower.includes('trump') ||
        lower.includes('biden')) {
        return 'politics';
    }
    if (lower.includes('ai') || lower.includes('apple') || lower.includes('google') ||
        lower.includes('tech') || lower.includes('app') || lower.includes('microsoft')) {
        return 'tech';
    }
    if (lower.includes('movie') || lower.includes('music') || lower.includes('album') ||
        lower.includes('tour') || lower.includes('concert') || lower.includes('netflix')) {
        return 'entertainment';
    }
    return 'trending';
}
/**
 * Generate a hot take for a trend
 */
async function generateThropTake(trendName) {
    try {
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
            throw new Error('No Anthropic API key');
        }
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const prompt = `You're throp, a chaotic gen z ai. Give ONE hot take about "${trendName}".

Be cynical, unhinged, and roast everyone. Examples of your style:
- "y'all really [doing thing] like it's not embarrassing"
- "imagine being pressed about [topic] couldn't be me"
- "[topic] is just [comparison] for people who [insult]"
- "not the [group] thinking they did something with [topic]"

Keep it under 20 words. Natural gen z voice. Just the take:`;
        const response = await anthropic.messages.create({
            model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
            max_tokens: 50,
            temperature: 0.95,
            messages: [{ role: 'user', content: prompt }],
        });
        const text = response.content[0].type === 'text' ? response.content[0].text : '';
        return text.trim().toLowerCase();
    }
    catch (error) {
        logger.error('Failed to generate hot take', { error });
        return `${trendName.toLowerCase()} trending again? groundbreaking`;
    }
}
/**
 * Hot takes endpoint handler
 */
export async function handleHotTakes(_req, res) {
    try {
        logger.info('Hot takes endpoint called');
        // Check cache first
        if (cachedHotTakes && cachedHotTakes.expiresAt > new Date()) {
            logger.info('Returning cached hot takes');
            res.json({
                success: true,
                takes: cachedHotTakes.takes,
                source: 'backend-cached',
            });
            return;
        }
        // Fetch real Twitter trends
        logger.info('Fetching real Twitter trends');
        const twitterClient = new TwitterClient();
        const trends = await twitterClient.getTrendingTopics(1);
        const takes = [];
        if (trends && trends.length > 0) {
            // Generate takes for top 5 trends
            const topTrends = trends.slice(0, 5);
            for (let i = 0; i < topTrends.length; i++) {
                const trend = topTrends[i];
                const take = await generateThropTake(trend.name);
                let volume = 'trending';
                if (trend.tweet_volume) {
                    const vol = trend.tweet_volume;
                    if (vol >= 1000000) {
                        volume = `${(vol / 1000000).toFixed(1)}M tweets`;
                    }
                    else if (vol >= 1000) {
                        volume = `${Math.round(vol / 1000)}k tweets`;
                    }
                    else {
                        volume = `${vol} tweets`;
                    }
                }
                takes.push({
                    id: `take-${Date.now()}-${i}`,
                    topic: trend.name,
                    trendingVolume: volume,
                    take,
                    timestamp: new Date(),
                    agreeCount: Math.floor(Math.random() * 5000) + 500,
                    category: determineCategory(trend.name)
                });
            }
            logger.info('Generated hot takes for real trends', {
                count: takes.length,
                topics: takes.map(t => t.topic).join(', ')
            });
        }
        else {
            // Fallback takes if no trends available
            logger.warn('No trends from Twitter API, using fallback');
            const fallbackTopics = ['Twitter API', 'Trending Topics', 'Social Media'];
            for (let i = 0; i < 3; i++) {
                const topic = fallbackTopics[i];
                takes.push({
                    id: `fallback-${Date.now()}-${i}`,
                    topic,
                    trendingVolume: `${Math.round(Math.random() * 500 + 100)}k tweets`,
                    take: await generateThropTake(topic),
                    timestamp: new Date(),
                    agreeCount: Math.floor(Math.random() * 2000) + 100,
                    category: 'trending'
                });
            }
        }
        // Update cache
        const now = new Date();
        cachedHotTakes = {
            takes,
            generatedAt: now,
            expiresAt: new Date(now.getTime() + CACHE_DURATION_MS),
        };
        res.json({
            success: true,
            takes,
            source: 'backend-twitter-trends',
            generatedAt: now,
        });
    }
    catch (error) {
        logger.error('Failed to generate hot takes', { error });
        // Return error fallback
        res.json({
            success: true,
            takes: [{
                    id: `error-${Date.now()}`,
                    topic: 'Error',
                    trendingVolume: 'N/A',
                    take: 'something broke but im still here being chaotic',
                    timestamp: new Date(),
                    agreeCount: 666,
                    category: 'trending'
                }],
            source: 'backend-fallback',
            error: 'Failed to generate hot takes'
        });
    }
}
//# sourceMappingURL=hot-takes-old.js.map