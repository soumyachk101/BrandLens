import { Router, Response, NextFunction, Request } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../utils/supabase';
import { BrandService } from '../../services/brand.service';
import { sendSuccess, sendError, sendZodError } from '../../utils/response';
import { authenticate, authenticateApiKey, AuthUser } from '../../middleware/auth';
import { UpdateBrandSchema } from '../../types';
import { NotFoundError } from '../../utils/errors';

const router = Router();
const brandService = new BrandService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// GET /brands/:id
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { id } = req.params;
 const brand = await brandService.get(user.agency_id, id as string);
 sendSuccess(res, brand);
 } catch (err) {
 if (err instanceof NotFoundError) {
 sendError(res, 'Brand not found', 404, 'NOT_FOUND');
 return;
 }
 sendError(res, (err as Error).message || 'Failed to fetch brand', 500);
 }
});

// PATCH /brands/:id
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { id } = req.params;
 const data = UpdateBrandSchema.parse(req.body);
 const brand = await brandService.update(user.agency_id, id as string, data);
 sendSuccess(res, brand);
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 if (err instanceof NotFoundError) {
 sendError(res, 'Brand not found', 404, 'NOT_FOUND');
 return;
 }
 sendError(res, (err as Error).message || 'Failed to update brand', 500);
 }
});

// DELETE /brands/:id
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { id } = req.params;
 await brandService.delete(user.agency_id, id as string);
 res.sendStatus(204);
 } catch (err) {
 if (err instanceof NotFoundError) {
 sendError(res, 'Brand not found', 404, 'NOT_FOUND');
 return;
 }
 sendError(res, (err as Error).message || 'Failed to delete brand', 500);
 }
});

export default router;
