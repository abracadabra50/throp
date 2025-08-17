/**
 * Admin authentication middleware
 * Protects proactive tweet endpoints from public use
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Simple admin authentication using API key
 * In production, use proper auth like JWT, OAuth, etc.
 */
export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const adminKey = process.env.ADMIN_API_KEY;
  const providedKey = req.headers['x-admin-key'] || req.query.admin_key;
  
  // If no admin key is set, allow in development mode only
  if (!adminKey) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
      console.warn('⚠️ No ADMIN_API_KEY set - allowing access in development mode');
      next();
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Admin authentication not configured',
    });
    return;
  }
  
  // Check if provided key matches
  if (!providedKey) {
    res.status(401).json({
      success: false,
      error: 'Admin authentication required',
      hint: 'Provide X-Admin-Key header or admin_key query parameter',
    });
    return;
  }
  
  // Constant-time comparison to prevent timing attacks
  const providedBuffer = Buffer.from(String(providedKey));
  const adminBuffer = Buffer.from(adminKey);
  
  if (providedBuffer.length !== adminBuffer.length) {
    res.status(403).json({
      success: false,
      error: 'Invalid admin key',
    });
    return;
  }
  
  const isValid = crypto.timingSafeEqual(providedBuffer, adminBuffer);
  
  if (!isValid) {
    res.status(403).json({
      success: false,
      error: 'Invalid admin key',
    });
    return;
  }
  
  // Authentication successful
  next();
}

/**
 * Generate a random admin API key
 */
export function generateAdminKey(): string {
  return 'admin_' + crypto.randomBytes(32).toString('hex');
}

/**
 * Rate limiting for admin endpoints
 * Even admins shouldn't spam the API
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function adminRateLimit(
  maxRequests = 100,
  windowMs = 60000 // 1 minute
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.headers['x-admin-key'] || req.query.admin_key || 'unknown';
    const now = Date.now();
    
    const record = requestCounts.get(String(key));
    
    if (!record || record.resetTime < now) {
      // Create new record
      requestCounts.set(String(key), {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }
    
    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter,
      });
      return;
    }
    
    record.count++;
    next();
  };
}
