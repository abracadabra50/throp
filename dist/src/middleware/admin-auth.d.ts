/**
 * Admin authentication middleware
 * Protects proactive tweet endpoints from public use
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Simple admin authentication using API key
 * In production, use proper auth like JWT, OAuth, etc.
 */
export declare function adminAuth(req: Request, res: Response, next: NextFunction): void;
/**
 * Generate a random admin API key
 */
export declare function generateAdminKey(): string;
export declare function adminRateLimit(maxRequests?: number, windowMs?: number): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=admin-auth.d.ts.map