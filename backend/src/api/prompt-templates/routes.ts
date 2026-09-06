import { Router, Response } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../utils/supabase';
import { sendSuccess, sendError, sendZodError } from '../../utils/response';
import { authenticate, authenticateApiKey, requirePermission } from '../../middleware/auth';

const router = Router();

const authMiddleware = (req: Request, res: Response, next: Function) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// List prompt templates
router.get('/', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 let query = getSupabaseClient()
 .from('prompt_templates')
 .select('*')
 .eq('agency_id', user.agency_id)
 .eq('is_active', true)
 .order('created_at', { ascending: false });

 if (req.query.brand_id) {
 query = query.or(`brand_id.eq.${req.query.brand_id},brand_id.is.null`);
 }

 if (req.query.platform) {
 query = query.eq('platform', req.query.platform);
 }

 const { data, error } = await query;

 if (error) {
 sendError(res, `Failed to fetch prompt templates: ${error.message}`, 500);
 return;
 }

 sendSuccess(res, data || []);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch prompt templates', 500);
 }
});

// Create prompt template
router.post('/', authMiddleware, requirePermission('brands:write'), async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { name, description, template, variables, platform, is_default } = req.body;

 if (!name || !template) {
 sendError(res, 'name and template are required', 400, 'VALIDATION_ERROR');
 return;
 }

 const { data, error } = await getSupabaseClient()
 .from('prompt_templates')
 .insert({
 agency_id: user.agency_id,
 brand_id: req.body.brand_id || null,
 name,
 description: description || null,
 template,
 variables: variables || [],
 platform: platform || 'chatgpt',
 is_default: is_default || false,
 is_active: true,
 })
 .select()
 .maybeSingle();

 if (error || !data) {
 sendError(res, 'Failed to create prompt template', 500);
 return;
 }

 sendSuccess(res, data, 201);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to create prompt template', 500);
 }
});

// Update prompt template
router.patch('/:templateId', authMiddleware, requirePermission('brands:write'), async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { name, description, template, variables, platform, is_active } = req.body;

 const { data, error } = await getSupabaseClient()
 .from('prompt_templates')
 .update({ name, description, template, variables, platform, is_active, updated_at: new Date().toISOString() })
 .eq('id', req.params.templateId)
 .eq('agency_id', user.agency_id)
 .select()
 .maybeSingle();

 if (error || !data) {
 sendError(res, 'Prompt template not found', 404, 'NOT_FOUND');
 return;
 }

 sendSuccess(res, data);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to update prompt template', 500);
 }
});

// Delete prompt template
router.delete('/:templateId', authMiddleware, requirePermission('brands:write'), async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { error } = await getSupabaseClient()
 .from('prompt_templates')
 .delete()
 .eq('id', req.params.templateId)
 .eq('agency_id', user.agency_id);

 if (error) {
 sendError(res, 'Prompt template not found', 404, 'NOT_FOUND');
 return;
 }

 res.sendStatus(204);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to delete prompt template', 500);
 }
});

export default router;
