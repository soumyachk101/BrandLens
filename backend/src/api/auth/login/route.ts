import { Router, Response } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../utils/supabase';
import { sendSuccess, sendError, sendZodError } from '../../utils/response';
import { LoginRequestSchema } from '../../types';

const router = Router();
const supabase = getSupabaseClient();

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
 try {
 const body = LoginRequestSchema.parse(req.body);

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

 sendSuccess(res, {
 access_token: data.session.access_token,
 refresh_token: data.session.refresh_token,
 expires_in: data.session.expires_in,
 });
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Login failed', 500);
 }
});

export default router;
