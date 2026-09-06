import { Router, Request, Response, NextFunction } from 'express';

export function corsMiddleware(): Router {
 const router = Router();
 const allowedOrigins = config.cors.origin;

 router.use((req: Request, res: Response, next: NextFunction) => {
 const origin = req.headers.origin;

 if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
 res.header('Access-Control-Allow-Origin', origin || '*');
 res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
 res.header(
 'Access-Control-Allow-Headers',
 'Content-Type, Authorization, X-API-Key, X-Requested-With'
 );
 res.header('Access-Control-Max-Age', '86400');
 }

 if (req.method === 'OPTIONS') {
 res.sendStatus(204);
 return;
 }

 next();
 });

 return router;
}

import { config } from '../../config/env';
