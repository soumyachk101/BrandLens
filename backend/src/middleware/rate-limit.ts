import { Router, Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response';

export function rateLimitMiddleware(): Router {
 const router = Router();
 const { windowMs, maxRequests } = config.rateLimit;

 // Simple in-memory rate limiter
 // In production, replace with Redis-backed rate limiting
 const clients = new Map<string, { count: number; resetAt: number }>();

 router.use((req: Request, res: Response, next: NextFunction) => {
 const clientId = getClientId(req);
 const now = Date.now();
 const record = clients.get(clientId);

 if (!record || now > record.resetAt) {
 clients.set(clientId, { count: 1, resetAt: now + windowMs });
 setRateLimitHeaders(res, maxRequests, maxRequests, windowMs);
 return next();
 }

 if (record.count >= maxRequests) {
 const retryAfter = Math.ceil((record.resetAt - now) / 1000);
 res.set('Retry-After', retryAfter.toString());
 setRateLimitHeaders(res, maxRequests, 0, windowMs, retryAfter);
 throw new AppError('Rate limit exceeded. Please try again later.', 429);
 }

 record.count += 1;
 const remaining = maxRequests - record.count;
 setRateLimitHeaders(res, maxRequests, remaining, windowMs);

 next();
 });

 // Periodic cleanup of expired entries
 setInterval(() => {
 const now = Date.now();
 for (const [key, record] of clients.entries()) {
 if (now > record.resetAt) {
 clients.delete(key);
 }
 }
 }, windowMs);

 return router;
}

function getClientId(req: Request): string {
 const apiKey = req.headers['x-api-key'];
 const authHeader = req.headers.authorization;

 if (apiKey && typeof apiKey === 'string') {
 return `api:${apiKey}`;
 }

 if (authHeader && authHeader.startsWith('Bearer ')) {
 return `user:${authHeader.slice(7)}`;
 }

 return `ip:${req.ip || req.connection.remoteAddress || 'unknown'}`;
}

function setRateLimitHeaders(
 res: Response,
 limit: number,
 remaining: number,
 windowMs: number,
 retryAfter?: number
): void {
 res.set('X-RateLimit-Limit', limit.toString());
 res.set('X-RateLimit-Remaining', remaining.toString());
 res.set('X-RateLimit-Reset', Math.ceil((Date.now() + windowMs) / 1000).toString());

 if (retryAfter) {
 res.set('Retry-After', retryAfter.toString());
 }
}

import { config } from '../../config/env';
