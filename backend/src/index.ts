import express from 'express';
import { config, validateConfig } from './config/env';
import apiRouter from './api/router';

async function main() {
 validateConfig();

 const app = express();
 const PORT = config.server.port;

 app.disable('x-powered-by');

 app.use((req, res, next) => {
 if (req.path === '/health' && req.method === 'GET') {
 req.url = `/health`;
 }
 next();
 });

 app.use('/', apiRouter);

 app.use((req, res) => {
 res.status(404).json({
 success: false,
 error: {
 code: 'NOT_FOUND',
 message: `Route ${req.method} ${req.path} not found`,
 request_id: `req_${Date.now().toString(36)}`,
 },
 });
 });

 app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
 console.error('Unhandled error:', err.stack || err.message);

 if (!res.headersSent) {
 res.status(500).json({
 success: false,
 error: {
 code: 'INTERNAL_ERROR',
 message: config.server.env === 'production'
 ? 'An unexpected error occurred.'
 : err.message,
 request_id: `req_${Date.now().toString(36)}`,
 },
 });
 }
 });

 const server = app.listen(PORT, () => {
 console.log(`[INFO] BrandLens API server running on port ${PORT} in ${config.server.env} mode`);
 console.log(`[INFO] Health check: http://localhost:${PORT}/health`);
 });

 const shutdown = async (signal: string) => {
 console.log(`\n[INFO] Received ${signal}, shutting down gracefully...`);
 server.close(() => {
 console.log('[INFO] Server closed');
 process.exit(0);
 });

 setTimeout(() => {
 console.error('[ERROR] Forced shutdown after timeout');
 process.exit(1);
 }, 30000);
 };

 process.on('SIGTERM', () => shutdown('SIGTERM'));
 process.on('SIGINT', () => shutdown('SIGINT'));

 process.on('uncaughtException', (err) => {
 console.error('[FATAL] Uncaught exception:', err);
 });

 process.on('unhandledRejection', (reason, promise) => {
 console.error('[FATAL] Unhandled rejection at:', promise, 'reason:', reason);
 });
}

main().catch((err) => {
 console.error('[FATAL] Failed to start server:', err);
 process.exit(1);
});
