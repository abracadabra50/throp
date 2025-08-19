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
        const nowTime = Date.now();
        // Return cached prompts if still valid
        if (cachedPrompts && (nowTime - cacheTime) < CACHE_DURATION) {
            logger.info('Returning cached trending prompts');
            res.json({
                success: true,
                prompts: cachedPrompts,
                source: 'cached',
                ttl: Math.floor((CACHE_DURATION - (nowTime - cacheTime)) / 1000)
            });
            return;
        }
        // Generate new prompts with current trends
        logger.info('Generating new trending prompts');
        // Get current date/time context
        const nowDate = new Date();
        const month = nowDate.toLocaleDateString('en-US', { month: 'long' });
        const year = nowDate.getFullYear();
        // Dynamic prompts based on current context
        const prompts = [
            `what's happening with the OpenAI board drama`,
            `explain the latest TikTok ban situation`,
            `roast my 2025 spotify wrapped`,
            `why is everyone posting about luigi mangione`,
            `explain the microsoft/activision deal like i'm 5`,
            `what's the tea with drake vs everyone`,
            `rate my toxic trait: checking crypto prices every 5 minutes`,
            `why does everyone hate ${month} ${year} already`,
            `explain quantum computing but make it unhinged`,
            `what would happen if elon actually bought tiktok`,
            `judge my 3am doomscrolling habits`,
            `why is having a normal sleep schedule suddenly a red flag`,
            `explain the lore behind the latest twitter main character`,
            `what's your most controversial AI take`,
            `why do millennials still use facebook`,
            `decode what 'no cap fr fr' actually means`,
            `explain why apple vision pro flopped`,
            `what's the vibe check on the 2025 economy`,
            `why is everyone saying 'delulu is the solulu'`,
            `explain web3 like a shitpost`,
            `what's the most chronically online thing about checking bluesky and twitter`
        ];
        // Cache the prompts
        cachedPrompts = prompts;
        cacheTime = nowTime;
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