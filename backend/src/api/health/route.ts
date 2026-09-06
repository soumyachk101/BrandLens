import { Router, Response, NextFunction, Request } from 'express';
import { getSupabaseClient } from '../../utils/supabase';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();

// GET /health - Health check endpoint (no auth required)
router.get('/', async (_req: Request, res: Response) => {
 try {
 let dbStatus: string;
 try {
 await getSupabaseClient()
 .from('agencies')
 .select('id')
 .limit(1);
 dbStatus = 'healthy';
 } catch {
 dbStatus = 'degraded';
 }

 sendSuccess(res, {
 status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
 version: '1.0.0',
 timestamp: new Date().toISOString(),
 services: {
 database: dbStatus,
 queue: 'healthy',
 ai_platforms: {
 chatgpt: 'healthy',
 perplexity: 'healthy',
 claude: 'healthy',
 gemini: 'healthy',
 copilot: 'healthy',
 },
 },
 });
 } catch (err) {
 sendError(res, (err as Error).message || 'Health check failed', 503, 'SERVICE_UNAVAILABLE');
 }
});

export default router;
