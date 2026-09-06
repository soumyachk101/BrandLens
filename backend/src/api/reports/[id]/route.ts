import { Router, Response, NextFunction, Request } from 'express';
import { getSupabaseClient } from '../../utils/supabase';
import { ReportService } from '../../services/report.service';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticate, authenticateApiKey, AuthUser } from '../../middleware/auth';
import { NotFoundError } from '../../utils/errors';

const router = Router();
const reportService = new ReportService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// GET /reports/:reportId
router.get('/:reportId', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const report = await reportService.get(user.agency_id, req.params.reportId as string);
 sendSuccess(res, report);
 } catch (err) {
 if ((err as Error).message?.includes('not found')) {
 sendError(res, 'Report not found', 404, 'NOT_FOUND');
 return;
 }
 sendError(res, (err as Error).message || 'Failed to fetch report', 500);
 }
});

export default router;
