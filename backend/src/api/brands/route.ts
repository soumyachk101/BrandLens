import { Router, Response, NextFunction, Request } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../utils/supabase';
import { BrandService } from '../../services/brand.service';
import { sendSuccess, sendError, sendZodError } from '../../utils/response';
import { authenticate, authenticateApiKey, requirePermission, AuthUser } from '../../middleware/auth';
import { CreateBrandSchema, UpdateBrandSchema } from '../../types';
import { NotFoundError } from '../../utils/errors';

const router = Router();
const brandService = new BrandService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// GET /brands - List brands
router.get('/', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const page = parseInt((req.query.page as string) || '1', 10);
 const limit = parseInt((req.query.limit as string) || '20', 10);
 const search = req.query.search as string | undefined;
 const industry = req.query.industry as string | undefined;
 const is_active = req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined;
 const sort = (req.query.sort as string) || 'created_at';
 const order = (req.query.order as 'asc' | 'desc') || 'desc';

 const result = await brandService.list(user.agency_id, {
 page,
 limit,
 search,
 industry,
 is_active,
 sort,
 order,
 });

 sendSuccess(res, result.data, 200, result.meta);
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Failed to fetch brands', 500);
 }
});

// POST /brands - Create brand
router.post('/', authMiddleware, requirePermission('brands:write'), async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const data = CreateBrandSchema.parse(req.body);
 const brand = await brandService.create(user.agency_id, data);
 sendSuccess(res, brand, 201);
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Failed to create brand', 500);
 }
});

export default router;
