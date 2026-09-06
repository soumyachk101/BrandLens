import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export function requestId(req: Request, _res: Response, next: NextFunction): void {
 (req as unknown as { requestId: string }).requestId =
 (req.headers['x-request-id'] as string) || uuidv4();
 next();
}

export function requestLogger(
 req: Request,
 res: Response,
 next: NextFunction
): void {
 const start = Date.now();

 res.on('finish', () => {
 const duration = Date.now() - start;
 const logData = {
 method: req.method,
 path: req.path,
 status: res.statusCode,
 duration: `${duration}ms`,
 request_id: (req as unknown as { requestId?: string }).requestId,
 };

 if (res.statusCode >= 500) {
 console.error(JSON.stringify({ level: 'error', ...logData }));
 } else if (res.statusCode >= 400) {
 console.warn(JSON.stringify({ level: 'warn', ...logData }));
 } else {
 console.log(JSON.stringify({ level: 'info', ...logData }));
 }
 });

 next();
}
