import { Router, Response, NextFunction, Request } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../../utils/supabase';
import { BrandService } from '../../../services/brand.service';
import { sendSuccess, sendError, sendZodError } from '../../../utils/response';
import { authenticate, authenticateApiKey, AuthUser } from '../../../middleware/auth';
import { NotFoundError } from '../../../utils/errors';

const router = Router();
const brandService = new BrandService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// GET /brands/:id/analytics
router.get('/analytics', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const brandId = req.params.id as string;
 const analytics = await brandService.getAnalytics(user.agency_id, brandId, req.query as Record<string, unknown>);
 sendSuccess(res, analytics);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch analytics', 500);
 }
});

export default router;
