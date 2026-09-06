import { Router, Response, NextFunction, Request } from 'express';
import { AuthUser } from '../../types';
import { authenticate } from './route';
import { getSupabaseClient } from '../../utils/supabase';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();

// GET /auth/session
router.get('/session', authenticate, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 sendSuccess(res, {
 id: user.id,
 email: user.email,
 role: user.role,
 agency_id: user.agency_id,
 permissions: user.permissions,
 });
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to get session', 500);
 }
});

export default router;
