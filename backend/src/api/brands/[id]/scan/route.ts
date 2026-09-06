import { Router, Response, NextFunction, Request } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../../utils/supabase';
import { BrandService } from '../../../services/brand.service';
import { ScannerService } from '../../../services/scanner.service';
import { sendSuccess, sendError, sendZodError } from '../../../utils/response';
import { authenticate, authenticateApiKey, AuthUser } from '../../../middleware/auth';
import { TriggerScanSchema } from '../../../types';
import { NotFoundError } from '../../../utils/errors';

const router = Router();
const scannerService = new ScannerService(getSupabaseClient());
const brandService = new BrandService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// POST /brands/:id/scan - Trigger manual scan
router.post('/', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const brandId = req.params.id as string;
 const body = req.body || {};
 const platforms = Array.isArray(body.platforms) ? body.platforms : ['chatgpt'];
 const supportedPlatforms = ['chatgpt', 'perplexity', 'claude', 'gemini', 'copilot', 'deepseek', 'groq'];
 const platform = platforms.length > 0 && supportedPlatforms.includes(platforms[0])
 ? platforms[0]
 : 'chatgpt';

 const result = await scannerService.runScan(user.agency_id, brandId, platform);
 sendSuccess(res, result, 202);
 } catch (err) {
 if (err instanceof NotFoundError) {
 sendError(res, 'Brand not found', 404, 'NOT_FOUND');
 return;
 }
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Failed to start scan', 500);
 }
});

export default router;
