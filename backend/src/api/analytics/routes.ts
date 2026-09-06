import { Router, Response } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../utils/supabase';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticate, authenticateApiKey } from '../../middleware/auth';
import { dateRangeSchema } from '../../utils/validators';

const router = Router();

const authMiddleware = (req: Request, res: Response, next: Function) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// Get analytics for a brand
router.get('/brands/:brandId', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { brandId } = req.params;
 const filter = dateRangeSchema.parse(req.query);

 const { data: queries } = await getSupabaseClient()
 .from('ai_queries')
 .select('id, platform, created_at, sentiment_score')
 .eq('brand_id', brandId)
 .gte('created_at', filter.from || '2000-01-01')
 .lte('created_at', filter.to || new Date().toISOString());

 const { data: mentions } = await getSupabaseClient()
 .from('mentions')
 .select('id, platform, entity_type, entity_name, sentiment, sentiment_score, created_at')
 .eq('brand_id', brandId)
 .gte('created_at', filter.from || '2000-01-01')
 .lte('created_at', filter.to || new Date().toISOString());

 const totalQueries = queries?.length || 0;
 const totalMentions = mentions?.length || 0;
 const brandMentions = mentions?.filter((m) => m.entity_type === 'brand').length || 0;
 const visibilityScore = totalQueries > 0 ? Math.round((brandMentions / totalQueries) * 10000) / 10000 : 0;

 const sentimentScores = mentions?.filter((m) => m.sentiment_score !== null).map((m) => m.sentiment_score as number) || [];
 const avgSentiment = sentimentScores.length > 0 ? Math.round((sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length) * 1000) / 1000 : 0;

 const sentimentDistribution = {
 positive: mentions?.filter((m) => m.sentiment === 'positive').length || 0,
 neutral: mentions?.filter((m) => m.sentiment === 'neutral').length || 0,
 negative: mentions?.filter((m) => m.sentiment === 'negative').length || 0,
 mixed: mentions?.filter((m) => m.sentiment === 'mixed').length || 0,
 };

 sendSuccess(res, {
 brand_id: brandId,
 period: { from: filter.from || null, to: filter.to || null },
 summary: {
 total_queries: totalQueries,
 total_mentions: totalMentions,
 visibility_score: visibilityScore,
 avg_sentiment: avgSentiment,
 platforms_tracked: new Set((queries || []).map((q) => q.platform)).size,
 },
 sentiment_distribution: sentimentDistribution,
 });
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch analytics', 500);
 }
});

export default router;
