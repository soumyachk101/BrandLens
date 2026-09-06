import { Router, Response, NextFunction, Request } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../utils/supabase';
import { BrandService } from '../../services/brand.service';
import { ScannerService } from '../../services/scanner.service';
import { sendSuccess, sendError, sendZodError } from '../../utils/response';
import { authenticate, authenticateApiKey, AuthUser } from '../../middleware/auth';
import { QueryFilterSchema } from '../../types';

const router = Router();
const brandService = new BrandService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// GET /queries?brand_id=...
router.get('/', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const brandId = req.query.brand_id as string | undefined;
 if (!brandId) {
 sendError(res, 'brand_id is required', 400, 'VALIDATION_ERROR');
 return;
 }

 const filter = QueryFilterSchema.parse(req.query);

 const page = filter.page || 1;
 const limit = filter.limit || 20;
 const from = (page - 1) * limit;
 const to = from + limit - 1;

 let query = getSupabaseClient()
 .from('ai_queries')
 .select('*', { count: 'exact' })
 .eq('brand_id', brandId)
 .order('created_at', { ascending: filter.order === 'asc' })
 .range(from, to);

 if (filter.platform) query = query.eq('platform', filter.platform);
 if (filter.status) query = query.eq('status', filter.status);
 if (filter.query_variant) query = query.eq('query_variant', filter.query_variant);
 if (filter.search) query = query.ilike('query_text', `%${filter.search}%`);
 if (filter.from) query = query.gte('created_at', filter.from);
 if (filter.to) query = query.lte('created_at', filter.to);

 const { data, error, count } = await query;

 if (error) {
 sendError(res, `Failed to fetch queries: ${error.message}`, 500);
 return;
 }

 const total = count || 0;
 sendSuccess(res, data || [], 200, {
 page,
 limit,
 total,
 total_pages: Math.ceil(total / limit),
 });
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Failed to fetch queries', 500);
 }
});

export default router;
