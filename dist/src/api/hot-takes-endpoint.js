/**
 * Hot Takes Endpoint for Backend
 * Generates trending topics and hot takes without timeout limitations
 */
import { logger } from '../utils/logger.js';
import Anthropic from '@anthropic-ai/sdk';
// Cache for hot takes (refresh every 30 minutes)
let cachedHotTakes = null;
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes
/**
 * Fetch real trending topics using Perplexity through our answer engine
 */
async function fetchRealTrends(answerEngine) {
    try {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        // Ask for current trending topics
        const prompt = `What are the top 5 trending topics on Twitter/X right now today ${dateStr}? List them with their tweet counts in this format: "topic - X tweets". Be specific about actual current events.`;
        const response = await answerEngine.generateResponse({
            question: prompt,
            author: { username: 'system' },
        });
        if (!response.text) {
            throw new Error('No response from answer engine');
        }
        logger.info('Got trending topics from Perplexity', {
            responseLength: response.text.length
        });
        // Extract trends from the response
        const extractedTrends = [];
        const lines = response.text.split('\n');
        for (const line of lines) {
            // Match patterns like "arsenal - 3.3m tweets" or "1. putin - 2.7m tweets"
            const patterns = [
                /^(?:\d+\.\s*)?([a-zA-Z0-9#][^-\n]+?)\s*[-–]\s*([\d.]+\s*[mk]?\+?\s*(?:million|mil|m|thousand|k)?\s*(?:tweets|posts)?)/i,
                /\*\*([^*]+)\*\*\s*[-–]\s*([\d.]+\s*[mk]?\+?\s*(?:tweets|posts)?)/i,
            ];
            for (const pattern of patterns) {
                const match = pattern.exec(line);
                if (match && extractedTrends.length < 5) {
                    const name = match[1].trim().replace(/[*"]/g, '');
                    const volume = match[2] ? match[2].trim() : 'trending';
                    if (name.length > 0 && name.length < 50 && !name.includes('bestie')) {
                        extractedTrends.push({
                            name: name.charAt(0).toUpperCase() + name.slice(1),
                            volume: volume.includes('tweet') || volume.includes('post') ? volume : volume + ' tweets',
                            context: 'Currently trending on Twitter/X',
                            category: 'trending'
                        });
                        break;
                    }
                }
            }
        }
        // If we got real trends, return them
        if (extractedTrends.length > 0) {
            logger.info('Extracted real trends', {
                trends: extractedTrends.map(t => t.name).join(', ')
            });
            return extractedTrends;
        }
        // Fallback: Generate realistic trends based on current date
        return await generateRealisticTrends();
    }
    catch (error) {
        logger.error('Failed to fetch real trends', { error });
        return await generateRealisticTrends();
    }
}
/**
 * Generate realistic trends using Claude
 */
async function generateRealisticTrends() {
    try {
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
            throw new Error('No Anthropic API key');
        }
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const now = new Date();
        const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
        const prompt = `Today is ${dayOfWeek}, ${monthYear}. Generate 5 realistic trending Twitter/X topics for right now.
Think about: current sports season, tech news cycle, entertainment releases, political events, viral culture.
Make them specific and realistic for this exact time.
Return ONLY a JSON array:
[{"name":"Topic","volume":"XXXk posts","context":"Brief context","category":"category"}]`;
        const response = await anthropic.messages.create({
            model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
            max_tokens: 300,
            temperature: 0.9,
            messages: [{ role: 'user', content: prompt }],
        });
        const text = response.content[0].type === 'text' ? response.content[0].text : '';
        const trends = JSON.parse(text.trim());
        if (Array.isArray(trends) && trends.length > 0) {
            logger.info('Generated realistic trends with Claude', {
                count: trends.length
            });
            return trends.slice(0, 5);
        }
    }
    catch (error) {
        logger.error('Failed to generate realistic trends', { error });
    }
    // Final fallback
    return getFallbackTrends();
}
/**
 * Fallback trends if all else fails
 */
function getFallbackTrends() {
    return [
        { name: 'Breaking News', volume: '500k posts', context: 'Major event developing', category: 'news' },
        { name: 'Sports Update', volume: '300k posts', context: 'Game highlights', category: 'sports' },
        { name: 'Tech News', volume: '250k posts', context: 'Product announcement', category: 'tech' },
        { name: 'Entertainment', volume: '400k posts', context: 'Celebrity news', category: 'entertainment' },
        { name: 'Crypto Update', volume: '200k posts', context: 'Market movement', category: 'crypto' },
    ];
}
/**
 * Generate a Throp-style hot take for a trend
 */
async function generateThropTake(trend) {
    try {
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
            throw new Error('No Anthropic API key');
        }
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const prompt = `You're a chaotic gen z poster. Give ONE hot take about "${trend.name}".
Context: ${trend.context || 'trending topic right now'}

Be cynical and roast everyone involved. Examples:
- "y'all really [doing thing] and thinking you did something"
- "imagine being pressed about [topic] couldn't be me"

Keep it under 20 words. Be unhinged but accurate. Natural gen z voice.
Just the take, nothing else:`;
        const response = await anthropic.messages.create({
            model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
            max_tokens: 50,
            temperature: 0.95,
            messages: [{ role: 'user', content: prompt }],
        });
        const text = response.content[0].type === 'text' ? response.content[0].text : '';
        return text.trim().toLowerCase();
    }
    catch (error) {
        logger.error('Failed to generate hot take', { error, trend: trend.name });
        // Fallback takes
        const fallbacks = [
            `${trend.name.toLowerCase()} trending again? groundbreaking`,
            `not y'all acting surprised about ${trend.name.toLowerCase()}`,
            `${trend.name.toLowerCase()} discourse is giving brain rot energy`,
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}
/**
 * Generate hot takes for trending topics
 */
async function generateHotTakes(answerEngine) {
    // Fetch trending topics
    const trends = await fetchRealTrends(answerEngine);
    // Generate takes for top 3 trends (for speed)
    const takesPromises = trends.slice(0, 3).map(async (trend, index) => {
        const take = await generateThropTake(trend);
        return {
            id: `take-${Date.now()}-${index}`,
            topic: trend.name,
            trendingVolume: trend.volume,
            take,
            timestamp: new Date(),
            agreeCount: Math.floor(Math.random() * 2000) + 100,
            category: trend.category
        };
    });
    const takes = await Promise.all(takesPromises);
    logger.info('Generated hot takes', { count: takes.length });
    return takes;
}
/**
 * Hot takes endpoint handler
 */
export async function handleHotTakes(_req, res, answerEngine) {
    try {
        logger.info('Hot takes endpoint called');
        // Check cache first
        if (cachedHotTakes && cachedHotTakes.expiresAt > new Date()) {
            logger.info('Returning cached hot takes', {
                generatedAt: cachedHotTakes.generatedAt,
                expiresAt: cachedHotTakes.expiresAt,
            });
            res.json({
                success: true,
                takes: cachedHotTakes.takes,
                source: 'backend-cached',
                cachedAt: cachedHotTakes.generatedAt,
            });
            return;
        }
        // Generate new hot takes
        logger.info('Generating fresh hot takes');
        const takes = await generateHotTakes(answerEngine);
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
            source: 'backend-generated',
            generatedAt: now,
        });
    }
    catch (error) {
        logger.error('Failed to generate hot takes', { error });
        // Return fallback takes on error
        const fallbackTakes = getFallbackTrends().slice(0, 3).map((trend, index) => ({
            id: `fallback-${Date.now()}-${index}`,
            topic: trend.name,
            trendingVolume: trend.volume,
            take: `${trend.name.toLowerCase()} is just the simulation glitching again`,
            timestamp: new Date(),
            agreeCount: Math.floor(Math.random() * 1000) + 50,
            category: trend.category,
        }));
        res.json({
            success: true,
            takes: fallbackTakes,
            source: 'backend-fallback',
            error: 'Using fallback takes due to generation error',
        });
    }
}
//# sourceMappingURL=hot-takes-endpoint.js.map