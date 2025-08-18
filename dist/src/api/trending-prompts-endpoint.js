/**
 * Trending Prompts Endpoint - Generates current trending prompts
 * With hourly Redis caching for fresh content and cost optimization
 */
import { logger } from '../utils/logger.js';
import { getRedisCache } from '../cache/redis.js';
import Anthropic from '@anthropic-ai/sdk';
// Hourly cache duration for fresh content with cost optimization
const HOURLY_CACHE_DURATION = 60 * 60; // 1 hour in seconds
const CACHE_KEY_PREFIX = 'trending-prompts';
/**
 * Get cache key for current hour's trending prompts
 */
function getCurrentHourCacheKey() {
    const now = new Date();
    const hourKey = now.toISOString().slice(0, 13); // YYYY-MM-DDTHH
    return `${CACHE_KEY_PREFIX}:${hourKey}`;
}
/**
 * Get current context for prompt generation
 */
function getCurrentContext() {
    const now = new Date();
    const options = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit'
    };
    const hour = now.getHours();
    const day = now.getDay();
    const month = now.getMonth();
    // Time-specific context
    let timeContext = '';
    if (hour >= 6 && hour < 9) {
        timeContext = 'morning coffee thoughts, commute complaints';
    }
    else if (hour >= 9 && hour < 12) {
        timeContext = 'work meeting drama, productivity panic';
    }
    else if (hour >= 12 && hour < 14) {
        timeContext = 'lunch break gossip, midday existential crisis';
    }
    else if (hour >= 14 && hour < 17) {
        timeContext = 'afternoon slump, work-life balance struggles';
    }
    else if (hour >= 17 && hour < 20) {
        timeContext = 'evening commute stress, dinner decisions';
    }
    else if (hour >= 20 && hour < 23) {
        timeContext = 'netflix and chill, weekend plans';
    }
    else {
        timeContext = 'late night thoughts, insomnia club';
    }
    // Day-specific context
    const dayContexts = [
        'Sunday scaries, weekend ending dread',
        'Monday blues, new week anxiety',
        'Tuesday motivation, taco debates',
        'Wednesday hump day, midweek crisis',
        'Thursday pre-weekend, almost there energy',
        'Friday freedom, weekend planning',
        'Saturday vibes, hangover recovery'
    ];
    // Month-specific context
    const monthContexts = [
        'New Year resolutions, winter blues',
        'Valentine\'s drama, winter ending',
        'March madness, spring starting',
        'Tax season panic, spring vibes',
        'May flowers, allergy season',
        'Summer planning, vacation dreams',
        'July heat, summer peak',
        'Back to school prep, summer ending',
        'Pumpkin spice, fall starting',
        'Halloween prep, autumn vibes',
        'Black Friday chaos, holiday prep',
        'Holiday stress, year ending'
    ];
    return {
        dateStr: now.toLocaleDateString('en-US', options),
        hour,
        timeContext,
        dayContext: dayContexts[day],
        monthContext: monthContexts[month],
        season: month >= 2 && month <= 4 ? 'Spring' :
            month >= 5 && month <= 7 ? 'Summer' :
                month >= 8 && month <= 10 ? 'Fall' : 'Winter'
    };
}
/**
 * Generate trending prompts using Claude
 */
async function generateTrendingPrompts() {
    try {
        const anthropicKey = process.env.ANTHROPIC_API_KEY;
        if (!anthropicKey) {
            throw new Error('No Anthropic API key');
        }
        const anthropic = new Anthropic({ apiKey: anthropicKey });
        const context = getCurrentContext();
        const prompt = `You are helping generate trending conversation prompts for throp (a chaotic Gen Z AI).

Current time: ${context.dateStr} (${context.season} 2025)
Time context: ${context.timeContext}
Day context: ${context.dayContext}  
Month context: ${context.monthContext}

Generate 7 engaging prompts that users would want to ask throp about RIGHT NOW.
These should be:
- Related to current events, drama, or trending topics
- Written in casual Gen Z style (lowercase, no punctuation, slang)
- Specific enough to be interesting  
- Mix of serious topics (economy, tech, politics) and fun/drama
- Things people are actually talking about this week
- Reflect the current time/day/season context

Examples of good prompts:
- "throp what's your take on this tech earnings bloodbath"
- "why is everyone suddenly obsessed with that new social app"
- "explain the drama with that tech CEO who got exposed"
- "should i be worried about AI taking my future job"

Return ONLY a JSON array of 7 strings, no other text.
Make them feel current and relevant to ${context.hour}:00 on ${context.dateStr}.`;
        const response = await anthropic.messages.create({
            model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
            max_tokens: 500,
            temperature: 0.9,
            messages: [{ role: 'user', content: prompt }],
        });
        const text = response.content[0].type === 'text' ? response.content[0].text : '';
        try {
            const prompts = JSON.parse(text);
            if (Array.isArray(prompts) && prompts.length > 0) {
                logger.info('Generated trending prompts', {
                    count: prompts.length,
                    hour: context.hour
                });
                return prompts.slice(0, 7); // Ensure we have exactly 7
            }
        }
        catch (parseError) {
            logger.error('Failed to parse prompts JSON', { parseError, text });
            return getFallbackPrompts(context);
        }
        return getFallbackPrompts(context);
    }
    catch (error) {
        logger.error('Failed to generate trending prompts', { error });
        return getFallbackPrompts(getCurrentContext());
    }
}
/**
 * Get fallback prompts based on current context
 */
function getFallbackPrompts(context) {
    const { hour, season } = context;
    const baseFallbacks = [
        "throp what's your take on this tech earnings bloodbath? are we cooked or is this just rich people problems?",
        "bestie help me survive going back to school in this literal hellscape heat wave - any survival tips that aren't just 'drink water'?",
        "why is everyone suddenly obsessed with that new social app that's supposed to replace instagram? is it actually good or just hype?",
        "throp be honest - should i be worried about AI taking my future job or is that just boomer fear mongering?",
        "what's the deal with gen alpha kids already being chronically online? like are we responsible for creating these ipad babies?",
        "explain the drama with that tech CEO who got exposed on social media - why is corporate twitter so unhinged lately?",
        "real talk: is climate anxiety just gonna be our permanent vibe or are there actually reasons to be optimistic about the future?"
    ];
    // Time-specific prompts
    const timePrompts = {
        morning: [
            "why does coffee cost more than my rent now fr",
            "morning commute got me questioning all my life choices - is remote work dead?",
            "not me already doom scrolling at 7am... what's the latest disaster?"
        ],
        work: [
            "another pointless meeting that could've been an email - why do we still do this?",
            "my boss just said 'circle back' unironically... how do i quit professionally?",
            "productivity culture is literally killing us but we can't stop - make it make sense"
        ],
        evening: [
            "netflix raised prices again... at what point do we just go back to piracy?",
            "dating apps are a literal scam but we're all still on them - explain the psychology",
            "why does ordering dinner cost $40 now? i just wanted a sandwich"
        ],
        night: [
            "3am thoughts: are we the last generation that remembers life before social media?",
            "insomnia club checking in - what's keeping everyone else awake tonight?",
            "late night existential crisis: did we peak as a species in 2016?"
        ]
    };
    // Season-specific prompts
    const seasonPrompts = {
        Summer: [
            "this heat wave is literally apocalyptic but we're all just pretending it's normal?",
            "summer vacation used to be free... now everything costs a mortgage payment"
        ],
        Fall: [
            "pumpkin spice everything when it's still 90 degrees outside... capitalism never sleeps huh?",
            "back to school shopping lists are more expensive than college tuition now"
        ],
        Winter: [
            "seasonal depression hitting different when the world is literally on fire",
            "holiday travel chaos got me rethinking family obligations"
        ],
        Spring: [
            "allergy season is getting worse every year... thanks climate change",
            "spring cleaning but make it existential - what are we actually holding onto?"
        ]
    };
    let contextPrompts = [];
    // Add time-based prompts
    if (hour >= 6 && hour < 9) {
        contextPrompts.push(...timePrompts.morning);
    }
    else if (hour >= 9 && hour < 17) {
        contextPrompts.push(...timePrompts.work);
    }
    else if (hour >= 17 && hour < 23) {
        contextPrompts.push(...timePrompts.evening);
    }
    else {
        contextPrompts.push(...timePrompts.night);
    }
    // Add season-based prompts
    contextPrompts.push(...(seasonPrompts[season] || []));
    // Combine and shuffle
    const allPrompts = [...baseFallbacks, ...contextPrompts];
    return allPrompts.sort(() => Math.random() - 0.5).slice(0, 7);
}
/**
 * Trending prompts endpoint handler with hourly Redis caching
 */
export async function handleTrendingPrompts(_req, res) {
    try {
        logger.info('Trending prompts endpoint called');
        const cache = getRedisCache();
        const cacheKey = getCurrentHourCacheKey();
        // Try to get from Redis cache first
        try {
            const cachedData = await cache.get(cacheKey);
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                logger.info('Returning cached trending prompts from Redis', {
                    generatedAt: parsedData.generated_at,
                    count: parsedData.prompts.length,
                    cacheKey
                });
                res.json({
                    prompts: parsedData.prompts,
                    generated_at: parsedData.generated_at,
                    ttl: HOURLY_CACHE_DURATION,
                    source: 'redis-hourly-cache',
                    next_update: parsedData.next_update
                });
                return;
            }
        }
        catch (cacheError) {
            logger.warn('Failed to get prompts from cache, generating fresh', { cacheError });
        }
        // Generate new trending prompts
        logger.info('Generating fresh trending prompts (will cache for 1 hour)');
        const prompts = await generateTrendingPrompts();
        // Calculate next update time
        const now = new Date();
        const nextUpdate = new Date(now);
        nextUpdate.setHours(nextUpdate.getHours() + 1, 0, 0, 0); // Next hour on the hour
        // Cache in Redis for 1 hour
        const cacheData = {
            prompts,
            generated_at: now.toISOString(),
            ttl: HOURLY_CACHE_DURATION,
            next_update: nextUpdate.toISOString()
        };
        try {
            await cache.set(cacheKey, JSON.stringify(cacheData), HOURLY_CACHE_DURATION);
            logger.info('Cached trending prompts in Redis for 1 hour', {
                key: cacheKey,
                nextUpdate: nextUpdate.toISOString()
            });
        }
        catch (cacheError) {
            logger.warn('Failed to cache trending prompts', { cacheError });
        }
        res.json({
            prompts,
            generated_at: now.toISOString(),
            ttl: HOURLY_CACHE_DURATION,
            source: 'generated-fresh',
            next_update: nextUpdate.toISOString()
        });
    }
    catch (error) {
        logger.error('Failed to generate trending prompts', { error });
        // Return fallback prompts
        const fallbackPrompts = getFallbackPrompts(getCurrentContext());
        res.json({
            prompts: fallbackPrompts,
            generated_at: new Date().toISOString(),
            ttl: HOURLY_CACHE_DURATION,
            source: 'fallback-error'
        });
    }
}
//# sourceMappingURL=trending-prompts-endpoint.js.map