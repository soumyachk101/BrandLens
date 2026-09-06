import { Router, Response, NextFunction, Request } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../utils/supabase';
import { ReportService } from '../../services/report.service';
import { sendSuccess, sendError, sendZodError } from '../../utils/response';
import { authenticate, authenticateApiKey, requirePermission, AuthUser } from '../../middleware/auth';
import { GenerateReportSchema, ResendReportSchema } from '../../types';
import { NotFoundError } from '../../utils/errors';

const router = Router();
const reportService = new ReportService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// GET /reports - List reports for a brand (brand_id as query param)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const brandId = req.query.brand_id as string | undefined;
 if (!brandId) {
 sendError(res, 'brand_id query parameter is required', 400, 'VALIDATION_ERROR');
 return;
 }

 const page = parseInt((req.query.page as string) || '1', 10);
 const limit = parseInt((req.query.limit as string) || '20', 10);

 const result = await reportService.list(user.agency_id, brandId, {
 page,
 limit,
 report_type: req.query.report_type as string,
 from: req.query.from as string,
 to: req.query.to as string,
 status: req.query.status as string,
 });

 sendSuccess(res, result.data, 200, result.meta);
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Failed to fetch reports', 500);
 }
});

// POST /reports/generate - Generate a new report for a brand
router.post('/generate', authMiddleware, requirePermission('reports:write'), async (req: Request, res: Response) => {
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

 const { GenerateReportSchema } = require('../../types');
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

// POST /reports - Generate report (legacy endpoint via brand_id in body)
router.post('/', authMiddleware, requirePermission('reports:write'), async (req: Request, res: Response) => {
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

 const { GenerateReportSchema } = require('../../types');
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
