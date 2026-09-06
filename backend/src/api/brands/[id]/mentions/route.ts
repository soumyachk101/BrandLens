import { Router, Response, NextFunction, Request } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../../utils/supabase';
import { BrandService } from '../../../services/brand.service';
import { ScannerService } from '../../../services/scanner.service';
import { sendSuccess, sendError, sendZodError } from '../../../utils/response';
import { authenticate, authenticateApiKey, requirePermission, AuthUser } from '../../../middleware/auth';
import { TriggerScanSchema } from '../../../types';
import { NotFoundError } from '../../../utils/errors';

const router = Router();
const brandService = new BrandService(getSupabaseClient());
const scannerService = new ScannerService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// GET /brands/:id/mentions
router.get('/', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const brandId = req.params.id as string;
 const page = parseInt((req.query.page as string) || '1', 10);
 const limit = parseInt((req.query.limit as string) || '20', 10);

 const { data, error, count } = await getSupabaseClient()
 .from('mentions')
 .select('*', { count: 'exact' })
 .eq('brand_id', brandId)
 .order('created_at', { ascending: false })
 .range((page - 1) * limit, page * limit - 1);

 if (error) {
 sendError(res, `Failed to fetch mentions: ${error.message}`, 500);
 return;
 }

 const sentimentCounts: Record<string, number> = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
 const platformCounts: Record<string, number> = {};
 let totalConfidence = 0;
 let confidenceCount = 0;

 for (const m of data || []) {
 sentimentCounts[m.sentiment] = (sentimentCounts[m.sentiment] || 0) + 1;
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

export default router;
