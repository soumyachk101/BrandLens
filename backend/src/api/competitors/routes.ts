import { Router, Response } from 'express';
import { getSupabaseClient } from '../../utils/supabase';
import { BrandService } from '../../services/brand.service';
import { ScannerService } from '../../services/scanner.service';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticate, authenticateApiKey } from '../../middleware/auth';
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

// List competitors for a brand
router.get('/brands/:brandId', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const competitors = await brandService.list(user.agency_id, req.params.brandId as string);
 sendSuccess(res, competitors);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch competitors', 500);
 }
});

// Get competitor comparison
router.get('/brands/:brandId/comparison', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const comparison = await scannerService.getComparison(user.agency_id, req.params.brandId as string);
 sendSuccess(res, comparison);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch comparison', 500);
 }
});

// Add competitor
router.post('/brands/:brandId', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { data, error } = await getSupabaseClient()
 .from('competitors')
 .insert({
 brand_id: req.params.brandId,
 competitor_name: req.body.name,
 mention_count: 0,
 visibility_score: 0,
 })
 .select()
 .maybeSingle();

 if (error || !data) {
 sendError(res, 'Failed to add competitor', 500);
 return;
 }

 sendSuccess(res, data, 201);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to add competitor', 500);
 }
});

// Remove competitor
router.delete('/brands/:brandId/:competitorId', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 await getSupabaseClient()
 .from('competitors')
 .delete()
 .eq('id', req.params.competitorId)
 .eq('brand_id', req.params.brandId);

 res.sendStatus(204);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to remove competitor', 500);
 }
});

export default router;
