import { Router, Response, NextFunction, Request } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../utils/supabase';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticate, authenticateApiKey, AuthUser } from '../../middleware/auth';

const router = Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// GET /queries/:queryId
router.get('/:queryId', authMiddleware, async (req: Request, res: Response) => {
 try {
 const { queryId } = req.params;
 const { data, error } = await getSupabaseClient()
 .from('ai_queries')
 .select('*')
 .eq('id', queryId)
 .maybeSingle();

 if (error || !data) {
 sendError(res, 'Query not found', 404, 'NOT_FOUND');
 return;
 }

 sendSuccess(res, data);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch query', 500);
 }
});

export default router;
