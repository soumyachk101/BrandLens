import { Router, Response } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../utils/supabase';
import { authenticate, authenticateApiKey } from '../../middleware/auth';
import { sendSuccess, sendError, sendZodError } from '../../utils/response';
import { AuthTokens, SignupRequest } from '../../types';

const router = Router();
const supabase = getSupabaseClient();

const authMiddleware = (req: Request, res: Response, next: Function) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// Signup
router.post('/signup', async (req: Request, res: Response) => {
 try {
 const body = z.object({
 email: z.string().email(),
 password: z.string().min(8),
 name: z.string().min(2).max(255),
 plan: z.enum(['starter', 'growth', 'enterprise']).optional(),
 }).parse(req.body);

 const { data, error } = await supabase.auth.signUp({
 email: body.email,
 password: body.password,
 options: {
 data: { name: body.name, plan: body.plan || 'starter' },
 },
 });

 if (error) {
 sendError(res, error.message || 'Signup failed', 400, 'VALIDATION_ERROR');
 return;
 }

 const agencyId = data.user?.id;
 if (agencyId) {
 await supabase.from('agencies').insert({
 id: agencyId,
 name: body.name,
 email: body.email,
 plan: body.plan || 'starter',
 white_label_config: {},
 });
 }

 const tokens: AuthTokens = {
 access_token: data.session?.access_token || '',
 refresh_token: data.session?.refresh_token || '',
 expires_in: data.session?.expires_in || 3600,
 };

 sendSuccess(res, tokens, 201);
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Signup failed', 500);
 }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
 try {
 const body = z.object({
 email: z.string().email(),
 password: z.string(),
 }).parse(req.body);

 const { data, error } = await supabase.auth.signInWithPassword({
 email: body.email,
 password: body.password,
 });

 if (error || !data.session) {
 sendError(res, 'Invalid email or password', 401, 'UNAUTHORIZED');
 return;
 }

 await supabase
 .from('agencies')
 .update({ last_login_at: new Date().toISOString() })
 .eq('id', data.user.id);

 const tokens: AuthTokens = {
 access_token: data.session.access_token,
 refresh_token: data.session.refresh_token,
 expires_in: data.session.expires_in,
 };

 sendSuccess(res, tokens);
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Login failed', 500);
 }
});

// Session
router.get('/session', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { id: string; email: string; role: string; agency_id: string; permissions: string[] } }).user;
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

// Me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { id: string; email: string; agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { data: agency, error } = await supabase
 .from('agencies')
 .select('id, name, email, plan, white_label_config, email_verified, last_login_at, created_at, updated_at')
 .eq('id', user.agency_id)
 .maybeSingle();

 if (error || !agency) {
 sendError(res, 'Agency not found', 404, 'NOT_FOUND');
 return;
 }

 const { count: brandsCount } = await supabase
 .from('brands')
 .select('*', { count: 'exact', head: true })
 .eq('agency_id', user.agency_id);

 const { count: scansCount } = await supabase
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
