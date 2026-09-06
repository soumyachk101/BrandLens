import { Request, Response, NextFunction } from 'express';
import { AppError } from './response';

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
 if (!res.headersSent) {
 next(new AppError(`Route ${req.method} ${req.path} not found`, 404));
 }
}

export function errorHandler(
 err: Error,
 req: Request,
 res: Response,
 _next: NextFunction
): void {
 const requestId = (req as unknown as { requestId?: string }).requestId || generateRequestId();

 console.error(`[${requestId}] ${err.stack || err.message}`);

 if (err instanceof AppError) {
 res.status(err.statusCode).json({
 success: false,
 error: {
 code: err.code,
 message: err.message,
 details: err.details,
 request_id: requestId,
 },
 });
 return;
 }

 res.status(500).json({
 success: false,
 error: {
 code: 'INTERNAL_ERROR',
 message: config.server.env === 'production'
 ? 'An unexpected error occurred.'
 : err.message,
 details: config.server.env === 'production' ? undefined : [{ field: 'server', message: err.stack || err.message }],
 request_id: requestId,
 },
 });
}

function generateRequestId(): string {
 return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

import { config } from '../../config/env';
