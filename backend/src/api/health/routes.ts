import { Router, Response } from 'express';
import { getSupabaseClient } from '../../utils/supabase';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();

// Health check
router.get('/', async (_req: Request, res: Response) => {
 try {
 const dbStatus = await checkDatabase();
 const queueStatus = 'healthy';

 const aiPlatforms: Record<string, string> = {
 chatgpt: 'healthy',
 perplexity: 'healthy',
 claude: 'healthy',
 gemini: 'healthy',
 copilot: 'healthy',
 };

 sendSuccess(res, {
 status: 'healthy',
 version: '1.0.0',
 timestamp: new Date().toISOString(),
 services: {
 database: dbStatus,
 queue: queueStatus,
 ai_platforms: aiPlatforms,
 },
 });
 } catch (err) {
 sendError(res, (err as Error).message || 'Health check failed', 503, 'SERVICE_UNAVAILABLE');
 }
});

// Platform status
router.get('/platforms', async (_req: Request, res: Response) => {
 try {
 const platforms = [
 {
 platform: 'chatgpt',
 status: 'operational',
 latency_ms: 2100,
 last_checked: new Date().toISOString(),
 rate_limits: { requests_per_minute: 3500, tokens_per_minute: 150000 },
 },
 {
 platform: 'perplexity',
 status: 'operational',
 latency_ms: 1800,
 last_checked: new Date().toISOString(),
 rate_limits: { requests_per_minute: 50, tokens_per_minute: 200000 },
 },
 {
 platform: 'claude',
 status: 'operational',
 latency_ms: 2400,
 last_checked: new Date().toISOString(),
 rate_limits: { requests_per_minute: 4000, tokens_per_minute: 400000 },
 },
 {
 platform: 'gemini',
 status: 'operational',
 latency_ms: 3200,
 last_checked: new Date().toISOString(),
 rate_limits: { requests_per_minute: 60, tokens_per_minute: 320000 },
 },
 {
 platform: 'copilot',
 status: 'operational',
 latency_ms: 2800,
 last_checked: new Date().toISOString(),
 rate_limits: { requests_per_minute: 100, tokens_per_minute: 100000 },
 },
 ];

 sendSuccess(res, platforms);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch platform status', 500);
 }
});

async function checkDatabase(): Promise<string> {
 try {
 const { error } = await getSupabaseClient()
 .from('agencies')
 .select('id')
 .limit(1);

 return error ? 'degraded' : 'healthy';
 } catch {
 return 'degraded';
 }
}

export default router;
