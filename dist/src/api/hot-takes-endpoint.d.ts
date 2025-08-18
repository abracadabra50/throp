/**
 * Hot Takes Endpoint for Backend
 * Generates trending topics and hot takes without timeout limitations
 */
import { Request, Response } from 'express';
import { HybridClaudeEngine } from '../engines/hybrid-claude.js';
/**
 * Hot takes endpoint handler
 */
export declare function handleHotTakes(_req: Request, res: Response, answerEngine: HybridClaudeEngine): Promise<void>;
//# sourceMappingURL=hot-takes-endpoint.d.ts.map