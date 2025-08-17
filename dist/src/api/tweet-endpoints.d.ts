/**
 * Tweet-specific API endpoints for proactive tweeting
 * Allows prompting Throp to tweet about topics
 */
import { Router } from 'express';
/**
 * Create tweet-specific routes
 */
export declare function createTweetRoutes(): Router;
declare module '../twitter/client.js' {
    interface TwitterClient {
        tweet(text: string): Promise<any>;
    }
}
//# sourceMappingURL=tweet-endpoints.d.ts.map