import { Router, Response, NextFunction, Request } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../../utils/supabase';
import { BrandService } from '../../../services/brand.service';
import { CompetitorService } from '../../../services/competitor.service';
import { sendSuccess, sendError, sendZodError } from '../../../utils/response';
import { authenticate, authenticateApiKey, AuthUser } from '../../../middleware/auth';
import { AddCompetitorSchema } from '../../../types';
import { NotFoundError } from '../../../utils/errors';

const router = Router();
const brandService = new BrandService(getSupabaseClient());
const competitorService = new CompetitorService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// GET /brands/:id/competitors
router.get('/', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const brandId = req.params.id as string;
 const competitors = await competitorService.list(user.agency_id, brandId);
 sendSuccess(res, competitors);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch competitors', 500);
 }
});

// POST /brands/:id/competitors
router.post('/', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const brandId = req.params.id as string;
 const data = AddCompetitorSchema.parse(req.body);
 const competitor = await competitorService.add(user.agency_id, brandId, data);
 sendSuccess(res, competitor, 201);
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Failed to add competitor', 500);
 }
});

// GET /brands/:id/competitors/comparison
router.get('/comparison', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const brandId = req.params.id as string;
 const comparison = await competitorService.getComparison(user.agency_id, brandId);
 sendSuccess(res, comparison);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch comparison', 500);
 }
});

// DELETE /brands/:id/competitors/:competitorId
router.delete('/:competitorId', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const brandId = req.params.id as string;
 const competitorId = req.params.competitorId as string;
 await competitorService.remove(user.agency_id, brandId, competitorId);
 res.sendStatus(204);
 } catch (err) {
 if (err instanceof NotFoundError) {
 sendError(res, 'Competitor not found', 404, 'NOT_FOUND');
 return;
 }
 sendError(res, (err as Error).message || 'Failed to remove competitor', 500);
 }
});

export default router;
