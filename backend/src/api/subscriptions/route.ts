import { Router, Response, NextFunction, Request } from 'express';
import { z } from 'zod';
import { getSupabaseClient } from '../../utils/supabase';
import { SubscriptionService } from '../../services/subscription.service';
import { sendSuccess, sendError, sendZodError } from '../../utils/response';
import { authenticate, authenticateApiKey, AuthUser } from '../../middleware/auth';
import { PlanType } from '../../types';

const router = Router();
const subscriptionService = new SubscriptionService(getSupabaseClient());

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
 if (req.headers['x-api-key']) {
 return authenticateApiKey(req, res, next);
 }
 return authenticate(req, res, next);
};

// GET /subscriptions - Get current subscription
router.get('/', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const subscription = await subscriptionService.getByAgency(user.agency_id);

 if (!subscription) {
 sendSuccess(res, {
 plan: 'starter' as PlanType,
 status: 'active',
 limits: { requests_per_minute: 60, scans_per_day: 100, concurrent_scans: 2, brands_max: 5 },
 usage: { scans_this_month: 0, brands_count: 0 },
 });
 return;
 }

 const planLimits = await subscriptionService.getPlanLimits(user.agency_id);
 sendSuccess(res, planLimits);
 } catch (err) {
 sendError(res, (err as Error).message || 'Failed to fetch subscription', 500);
 }
});

// POST /subscriptions/checkout - Create Stripe checkout session
router.post('/checkout', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const body = z.object({
 plan: z.enum(['starter', 'growth', 'enterprise']),
 success_url: z.string().url(),
 cancel_url: z.string().url(),
 }).parse(req.body);

 const session = await subscriptionService.createCheckoutSession(
 user.agency_id,
 body.plan,
 body.success_url,
 body.cancel_url
 );

 sendSuccess(res, session);
 } catch (err) {
 if (err instanceof z.ZodError) {
 sendZodError(res, err);
 return;
 }
 sendError(res, (err as Error).message || 'Failed to create checkout session', 500);
 }
});

// POST /subscriptions/cancel - Cancel subscription
router.post('/cancel', authMiddleware, async (req: Request, res: Response) => {
 try {
 const user = (req as unknown as { user?: AuthUser }).user;
 if (!user) {
 sendError(res, 'Unauthorized', 401, 'UNAUTHORIZED');
 return;
 }

 const result = await subscriptionService.cancelSubscription(user.agency_id);
 sendSuccess(res, result);
 } catch (err) {
 if ((err as Error).message?.includes('not found')) {
 sendError(res, 'No active subscription found', 404, 'NOT_FOUND');
 return;
 }
 sendError(res, (err as Error).message || 'Failed to cancel subscription', 500);
 }
});

export default router;
