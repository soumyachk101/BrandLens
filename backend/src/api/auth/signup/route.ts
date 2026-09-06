import { Router, Response } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../utils/supabase';
import { sendSuccess, sendError, sendZodError } from '../../utils/response';
import { SignupRequestSchema } from '../../types';

const router = Router();
const supabase = getSupabaseClient();

// POST /auth/signup
router.post('/signup', async (req: Request, res: Response) => {
 try {
 const body = SignupRequestSchema.parse(req.body);

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
 const { error: insertError } = await supabase.from('agencies').insert({
 id: agencyId,
 name: body.name,
 email: body.email,
 plan: body.plan || 'starter',
 white_label_config: {},
 password_hash: 'supabase-managed',
 });

 if (insertError) {
 console.error('Failed to create agency profile:', insertError);
 }
 }

 sendSuccess(
 res,
 {
 access_token: data.session?.access_token || '',
 refresh_token: data.session?.refresh_token || '',
 expires_in: data.session?.expires_in || 3600,
 },
 201
 );
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Signup failed', 500);
 }
});

export default router;
