/**
 * Trending Prompts Endpoint - Returns cached trending prompts
 * With hourly caching for fresh content
 */
import { logger } from '../utils/logger.js';
// Simple in-memory cache
let cachedPrompts = null;
let cacheTime = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
/**
 * Handle trending prompts request
 */
export async function handleTrendingPrompts(_req, res) {
    try {
        const now = Date.now();
        // Return cached prompts if still valid
        if (cachedPrompts && (now - cacheTime) < CACHE_DURATION) {
            logger.info('Returning cached trending prompts');
            res.json({
                success: true,
                prompts: cachedPrompts,
                source: 'cached',
                ttl: Math.floor((CACHE_DURATION - (now - cacheTime)) / 1000)
            });
            return;
        }
        // Generate new prompts
        logger.info('Generating new trending prompts');
        const prompts = [
            "explain why everyone's obsessed with [current trend]",
            "roast my spotify wrapped",
            "why is my fyp showing me [weird content]",
            "explain crypto like i'm 5 but also chronically online",
            "what's the tea with [celebrity drama]",
            "rate my toxic trait: [confession]",
            "why does everyone hate [popular thing] now",
            "explain [complex topic] but make it unhinged",
            "what would happen if [chaotic scenario]",
            "judge my 3am thoughts",
            "why is [normal thing] suddenly a red flag",
            "explain the lore behind [internet drama]",
            "what's your most controversial food take",
            "why do millennials [weird habit]",
            "decode this gen z slang for me",
            "explain why [tech company] is having a normal one",
            "what's the vibe check on [current event]",
            "why is everyone saying [viral phrase]",
            "explain [academic concept] like a shitpost",
            "what's the most chronically online thing about me"
        ];
        // Cache the prompts
        cachedPrompts = prompts;
        cacheTime = now;
        res.json({
            success: true,
            prompts: prompts,
            source: 'generated',
            ttl: CACHE_DURATION / 1000
        });
    }
    catch (error) {
        logger.error('Error generating trending prompts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate trending prompts'
        });
    }
}
export default handleTrendingPrompts;
//# sourceMappingURL=trending-prompts-endpoint.js.map