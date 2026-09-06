import { Router, Response } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../utils/supabase';
import { BrandService } from '../../services/brand.service';
import { CompetitorService } from '../../services/competitor.service';
import { ScannerService } from '../../services/scanner.service';
import { sendSuccess, sendError, sendZodError } from '../../utils/response';
import { authenticate, authenticateApiKey, requirePermission } from '../../middleware/auth';
import { CreateBrandSchema, UpdateBrandSchema } from '../../types';
import { paginationSchema } from '../../utils/validators';
import { NotFoundError } from '../../utils/errors';

const router = Router();
const brandService = new BrandService(getSupabaseClient());
const competitorService = new CompetitorService(getSupabaseClient());
const scannerService = new ScannerService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: Function) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// List brands
router.get('/', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const query = paginationSchema.parse(req.query);
 const result = await brandService.list(user.agency_id, query);
 sendSuccess(res, result.data, 200, result.meta);
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Failed to fetch brands', 500);
 }
});

// Create brand
router.post('/', authMiddleware, requirePermission('brands:write'), async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
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

// Get brand
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
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

// Update brand
router.patch('/:id', authMiddleware, requirePermission('brands:write'), async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
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

// Delete brand
router.delete('/:id', authMiddleware, requirePermission('brands:write'), async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
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

// Trigger manual scan
router.post('/:id/scan', authMiddleware, requirePermission('brands:write'), async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { id } = req.params;
 const { platforms } = req.body || {};

 const supportedPlatforms = ['chatgpt', 'perplexity', 'claude', 'gemini', 'copilot', 'deepseek', 'groq'];
 const platform = Array.isArray(platforms) && platforms.length > 0 && supportedPlatforms.includes(platforms[0])
 ? platforms[0]
 : 'chatgpt';

 const result = await scannerService.runScan(user.agency_id, id as string, platform);
 sendSuccess(res, result, 202);
 } catch (err) {
 if (err instanceof NotFoundError) {
 sendError(res, 'Brand not found', 404, 'NOT_FOUND');
 return;
 }
 sendError(res, (err as Error).message || 'Failed to start scan', 500);
 }
});

// Get brand analytics
router.get('/:id/analytics', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { id } = req.params;
 const analytics = await brandService.getAnalytics(user.agency_id, id as string, req.query as Record<string, unknown>);
 sendSuccess(res, analytics);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch analytics', 500);
 }
});

// Brand competitors
router.get('/:id/competitors', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { id } = req.params;
 const competitors = await competitorService.list(user.agency_id, id as string);
 sendSuccess(res, competitors);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch competitors', 500);
 }
});

router.post('/:id/competitors', authMiddleware, requirePermission('brands:write'), async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { id } = req.params;
 const competitor = await competitorService.add(user.agency_id, id as string, req.body);
 sendSuccess(res, competitor, 201);
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Failed to add competitor', 500);
 }
});

router.get('/:id/competitors/comparison', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { id } = req.params;
 const comparison = await competitorService.getComparison(user.agency_id, id as string, req.query as Record<string, unknown>);
 sendSuccess(res, comparison);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch comparison', 500);
 }
});

router.delete('/:id/competitors/:competitorId', authMiddleware, requirePermission('brands:write'), async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { id, competitorId } = req.params;
 await competitorService.remove(user.agency_id, id as string, competitorId as string);
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
