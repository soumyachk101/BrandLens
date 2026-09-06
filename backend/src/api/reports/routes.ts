import { Router, Response } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../utils/supabase';
import { ReportService } from '../../services/report.service';
import { sendSuccess, sendError, sendZodError } from '../../utils/response';
import { authenticate, authenticateApiKey, requirePermission } from '../../middleware/auth';
import { GenerateReportSchema, ResendReportSchema } from '../../types';

const router = Router();
const reportService = new ReportService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: Function) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// List reports for a brand
router.get('/brands/:brandId', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const page = parseInt((req.query.page as string) || '1', 10);
 const limit = parseInt((req.query.limit as string) || '20', 10);

 const result = await reportService.list(user.agency_id, req.params.brandId as string, {
 page,
 limit,
 report_type: req.query.report_type as string,
 from: req.query.from as string,
 to: req.query.to as string,
 status: req.query.status as string,
 });

 sendSuccess(res, result.data, 200, result.meta);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch reports', 500);
 }
});

// Generate report
router.post('/brands/:brandId', authMiddleware, requirePermission('reports:write'), async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const data = GenerateReportSchema.parse(req.body);
 const result = await reportService.generate(user.agency_id, req.params.brandId as string, data);
 sendSuccess(res, result, 202);
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Failed to generate report', 500);
 }
});

// Get single report
router.get('/:reportId', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
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

// Download report
router.get('/:reportId/download', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
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

// Resend report
router.post('/:reportId/resend', authMiddleware, requirePermission('reports:write'), async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const data = ResendReportSchema.parse(req.body);
 const result = await reportService.resend(user.agency_id, req.params.reportId as string, data);
 sendSuccess(res, result);
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Failed to resend report', 500);
 }
});

export default router;
