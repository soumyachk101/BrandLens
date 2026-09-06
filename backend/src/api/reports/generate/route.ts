import { Router, Response, NextFunction, Request } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../../utils/supabase';
import { ReportService } from '../../../services/report.service';
import { sendSuccess, sendError, sendZodError } from '../../../utils/response';
import { authenticate, authenticateApiKey, AuthUser } from '../../../middleware/auth';
import { GenerateReportSchema } from '../../../types';
import { NotFoundError } from '../../../utils/errors';

const router = Router();
const reportService = new ReportService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// POST /reports/generate
router.post('/', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const brandId = req.body.brand_id as string;
 if (!brandId) {
 sendError(res, 'brand_id is required in request body', 400, 'VALIDATION_ERROR');
 return;
 }

 const data = GenerateReportSchema.parse(req.body);
 const result = await reportService.generate(user.agency_id, brandId, data);
 sendSuccess(res, result, 202);
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Failed to generate report', 500);
 }
});

export default router;
