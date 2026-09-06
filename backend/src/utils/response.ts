import { Response } from 'express';

export function sendSuccess<T>(
 res: Response,
 data: T,
 statusCode = 200,
 meta?: { page: number; limit: number; total: number; total_pages: number }
): void {
 if (meta) {
 res.status(statusCode).json({ success: true, data, meta });
 } else {
 res.status(statusCode).json({ success: true, data });
 }
}

export function sendError(
 res: Response,
 message: string,
 statusCode = 500,
 code = 'INTERNAL_ERROR',
 details?: Array<{ field: string; message: string }>,
 requestId?: string
): void {
 res.status(statusCode).json({
 success: false,
 error: {
 code,
 message,
 details,
 request_id: requestId || `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
 },
 });
}

export function sendZodError(res: Response, error: import('zod').ZodError, requestId?: string): void {
 const details = error.errors.map((err) => ({
 field: err.path.join('.'),
 message: err.message,
 }));

 sendError(res, 'Validation failed', 422, 'VALIDATION_ERROR', details, requestId);
}
