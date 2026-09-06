import { Router, Response } from 'express';
import { getSupabaseClient } from '../../utils/supabase';
import { ScannerService } from '../../services/scanner.service';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticate, authenticateApiKey } from '../../middleware/auth';
import { paginationSchema } from '../../utils/validators';

const router = Router();
const scannerService = new ScannerService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: Function) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// List scan jobs
router.get('/', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const query = paginationSchema.parse(req.query);
 const result = await scannerService.listScanJobs(user.agency_id, {
 brand_id: req.query.brand_id as string,
 status: req.query.status as string,
 page: query.page,
 limit: query.limit,
 });

 sendSuccess(res, result.data, 200, result.meta);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch scan jobs', 500);
 }
});

// Get single scan job
router.get('/:jobId', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const job = await scannerService.getScanJob(user.agency_id, req.params.jobId as string);
 sendSuccess(res, job);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch scan job', 500);
 }
});

// Cancel scan job
router.post('/:jobId/cancel', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const job = await scannerService.cancelScanJob(user.agency_id, req.params.jobId as string);
 sendSuccess(res, job);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to cancel scan job', 500);
 }
});

export default router;
