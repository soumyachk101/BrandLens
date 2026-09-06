import { Router, Response } from 'express';
import { getSupabaseClient } from '../../utils/supabase';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticate, authenticateApiKey } from '../../middleware/auth';
import { SubscriptionService } from '../../services/subscription.service';
import { ScannerService } from '../../services/scanner.service';

const router = Router();
const subscriptionService = new SubscriptionService(getSupabaseClient());
const scannerService = new ScannerService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: Function) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// List webhooks for an agency
router.get('/', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { data, error } = await getSupabaseClient()
 .from('webhook_events')
 .select('*')
 .eq('agency_id', user.agency_id)
 .order('created_at', { ascending: false })
 .limit(50);

 if (error) {
 sendError(res, `Failed to fetch webhooks: ${error.message}`, 500);
 return;
 }

 sendSuccess(res, data || []);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch webhooks', 500);
 }
});

// Register webhook endpoint
router.post('/endpoints', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user: { agency_id: string } }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const { url, events, secret } = req.body;

 if (!url || !events || !secret) {
 sendError(res, 'url, events, and secret are required', 400, 'VALIDATION_ERROR');
 return;
 }

 const { data, error } = await getSupabaseClient()
 .from('webhook_endpoints')
 .insert({
 agency_id: user.agency_id,
 url,
 events,
 secret,
 is_active: true,
 })
 .select()
 .maybeSingle();

 if (error || !data) {
 sendError(res, 'Failed to register webhook endpoint', 500);
 return;
 }

 sendSuccess(res, data, 201);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to register webhook', 500);
 }
});

export default router;
