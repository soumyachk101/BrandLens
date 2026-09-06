import { Router, Response, NextFunction, Request } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../../utils/supabase';
import { ReportService } from '../../../services/report.service';
import { sendSuccess, sendError, sendZodError } from '../../../utils/response';
import { authenticate, authenticateApiKey, AuthUser } from '../../../middleware/auth';
import { NotFoundError } from '../../../utils/errors';

const router = Router();
const reportService = new ReportService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// GET /reports/:reportId/download
router.get('/:reportId/download', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const format = (req.query.format as string) || 'pdf';
 const downloadUrl = await reportService.getDownloadUrl(user.agency_id, req.params.reportId as string, format);
 res.redirect(302, downloadUrl);
 } catch (err) {
 if ((err as Error).message?.includes('not found')) {
 sendError(res, 'Report or file not found', 404, 'NOT_FOUND');
 return;
 }
 if ((err as Error).message?.includes('not ready')) {
 sendError(res, (err as Error).message, 400, 'VALIDATION_ERROR');
 return;
 }
 sendError(res, (err as Error).message || 'Failed to download report', 500);
 }
});

export default router;
