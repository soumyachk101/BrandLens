import { Router, Response, NextFunction, Request } from 'express';
import { getSupabaseClient } from '../../utils/supabase';
import { SubscriptionService } from '../../services/subscription.service';
import { sendSuccess, sendError } from '../../utils/response';

const router = Router();
const subscriptionService = new SubscriptionService(getSupabaseClient());

// POST /subscriptions/webhook - Stripe webhook handler (no auth - verified by signature)
router.post('/', async (req: Request, res: Response) => {
 try {
 const signature = req.headers['stripe-signature'];
 if (!signature || typeof signature !== 'string') {
 sendError(res, 'Missing stripe-signature header', 401, 'UNAUTHORIZED');
 return;
 }

 await subscriptionService.handleWebhook(req.body, signature);
 res.sendStatus(200);
 } catch (err) {
 sendError(res, (err as Error).message || 'Webhook handling failed', 400);
 }
});

function sendSuccess(res: Response, data: unknown, statusCode = 200): void {
 res.status(statusCode).json({ success: true, data });
}

function sendError(res: Response, message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown[]): void {
 res.status(statusCode).json({
 success: false,
 error: { code, message, details, request_id: `req_${Date.now().toString(36)}` },
 });
}

export default router;
