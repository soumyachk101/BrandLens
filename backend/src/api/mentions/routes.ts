import { Router, Response } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../utils/supabase';
import { BrandService } from '../../services/brand.service';
import { ScannerService } from '../../services/scanner.service';
import { sendSuccess, sendError, sendZodError } from '../../utils/response';
import { authenticate, authenticateApiKey, requirePermission } from '../../middleware/auth';
import { MentionFilterSchema } from '../../types';
import { paginationSchema } from '../../utils/validators';

const router = Router();
const brandService = new BrandService(getSupabaseClient());
const scannerService = new ScannerService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: Function) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// List mentions for a brand
router.get('/brands/:brandId', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const page = parseInt((req.query.page as string) || '1', 10);
 const limit = parseInt((req.query.limit as string) || '20', 10);

 const { data, error, count } = await getSupabaseClient()
 .from('mentions')
 .select('*', { count: 'exact' })
 .eq('brand_id', req.params.brandId)
 .order('created_at', { ascending: false })
 .range((page - 1) * limit, page * limit - 1);

 if (error) {
 sendError(res, `Failed to fetch mentions: ${error.message}`, 500);
 return;
 }

 const sentimentCounts = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
 const platformCounts: Record<string, number> = {};
 let totalConfidence = 0;
 let confidenceCount = 0;

 for (const m of (data || [])) {
 sentimentCounts[m.sentiment as keyof typeof sentimentCounts] = (sentimentCounts[m.sentiment as keyof typeof sentimentCounts] || 0) + 1;
 platformCounts[m.platform] = (platformCounts[m.platform] || 0) + 1;
 if (m.confidence_score !== null) {
 totalConfidence += m.confidence_score;
 confidenceCount++;
 }
 }

 const total = count || 0;
 sendSuccess(res, data || [], 200, {
 page,
 limit,
 total,
 total_pages: Math.ceil(total / limit),
 aggregations: {
 sentiment_counts: sentimentCounts,
 platform_counts: platformCounts,
 avg_confidence: confidenceCount > 0 ? Math.round((totalConfidence / confidenceCount) * 1000) / 1000 : 0,
 },
 });
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch mentions', 500);
 }
});

// Get mention feed
router.get('/brands/:brandId/feed', authMiddleware, async (req: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const limit = parseInt((req.query.limit as string) || '20', 10);
 const after = req.query.after as string | undefined;

 let query = getSupabaseClient()
 .from('mentions')
 .select('*')
 .eq('brand_id', req.params.brandId)
 .order('created_at', { ascending: false })
 .limit(limit);

 if (after) {
 query = query.lt('id', after);
 }

 const { data, error } = await query;

 if (error) {
 sendError(res, `Failed to fetch mentions: ${error.message}`, 500);
 return;
 }

 const hasMore = (data?.length || 0) >= limit;
 const nextCursor = data && data.length > 0 ? data[data.length - 1].id : null;

 sendSuccess(res, data || [], 200, { has_more: hasMore, next_cursor: nextCursor });
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch mentions', 500);
 }
});

// Get sentiment trends
router.get('/brands/:brandId/sentiment-trends', authMiddleware, async (req: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { from = '2000-01-01', to = new Date().toISOString(), granularity = 'day' } = req.query as Record<string, string>;

 const { data, error } = await getSupabaseClient()
 .from('mentions')
 .select('created_at, sentiment, sentiment_score')
 .eq('brand_id', req.params.brandId)
 .gte('created_at', from)
 .lte('created_at', to)
 .order('created_at', { ascending: true });

 if (error) {
 sendError(res, `Failed to fetch sentiment trends: ${error.message}`, 500);
 return;
 }

 const dateMap = new Map<string, { positive: number; neutral: number; negative: number; mixed: number; scores: number[] }>();
 for (const mention of (data || [])) {
 const date = new Date(mention.created_at).toISOString().split('T')[0];
 if (!dateMap.has(date)) {
 dateMap.set(date, { positive: 0, neutral: 0, negative: 0, mixed: 0, scores: [] });
 }
 const bucket = dateMap.get(date)!;
 bucket[(mention.sentiment as 'positive' | 'neutral' | 'negative' | 'mixed') || 'neutral']++;
 if (mention.sentiment_score !== null) bucket.scores.push(mention.sentiment_score);
 }

 const trends = Array.from(dateMap.entries())
 .sort(([a], [b]) => a.localeCompare(b))
 .map(([date, counts]) => ({
 date,
 positive: counts.positive,
 neutral: counts.neutral,
 negative: counts.negative,
 mixed: counts.mixed,
 avg_sentiment: counts.scores.length > 0 ? Math.round((counts.scores.reduce((a, b) => a + b, 0) / counts.scores.length) * 1000) / 1000 : 0,
 total_mentions: counts.positive + counts.neutral + counts.negative + counts.mixed,
 }));

 sendSuccess(res, trends);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch sentiment trends', 500);
 }
});

export default router;
