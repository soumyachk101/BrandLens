import { Router, Response, NextFunction, Request } from 'express';
import { AuthUser } from '../../types';
import { authenticate } from './route';
import { getSupabaseClient } from '../../utils/supabase';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();

// GET /auth/me
router.get('/me', authenticate, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { data: agency, error } = await getSupabaseClient()
 .from('agencies')
 .select('id, name, email, plan, white_label_config, email_verified, last_login_at, created_at, updated_at')
 .eq('id', user.agency_id)
 .maybeSingle();

 if (error || !agency) {
 sendError(res, 'Agency not found', 404, 'NOT_FOUND');
 return;
 }

 const { count: brandsCount } = await getSupabaseClient()
 .from('brands')
 .select('*', { count: 'exact', head: true })
 .eq('agency_id', user.agency_id);

 const { count: scansCount } = await getSupabaseClient()
 .from('ai_queries')
 .select('ai_queries!inner(brands!inner(agency_id))', { count: 'exact', head: true })
 .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

 sendSuccess(res, {
 ...agency,
 brands_count: brandsCount || 0,
 scans_this_month: scansCount || 0,
 });
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch profile', 500);
 }
});

export default router;
