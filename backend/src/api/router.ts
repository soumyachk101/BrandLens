import { Router, Response } from 'express';
import { corsMiddleware } from '../middleware/cors';
import { rateLimitMiddleware } from '../middleware/rate-limit';
import { requestId, requestLogger } from '../middleware/request-id';

// Auth middleware (shared)
import { authenticate, authenticateApiKey, requireRole, requirePermission } from './auth/route';

// Subdirectory route imports
import signupRoutes from './auth/signup/route';
import loginRoutes from './auth/login/route';
import sessionRoutes from './auth/session/route';
import meRoutes from './auth/me/route';

import brandListRoutes from './brands/route';
import brandDetailRoutes from './brands/[id]/route';
import brandMentionsRoutes from './brands/[id]/mentions/route';
import brandCompetitorsRoutes from './brands/[id]/competitors/route';
import brandScanRoutes from './brands/[id]/scan/route';
import brandAnalyticsRoutes from './brands/[id]/analytics/route';

import queryListRoutes from './queries/route';
import queryDetailRoutes from './queries/[id]/route';

import reportListRoutes from './reports/route';
import reportDetailRoutes from './reports/[id]/route';
import reportGenerateRoutes from './reports/generate/route';
import reportDownloadRoutes from './reports/download/route';

import subscriptionRoutes from './subscriptions/route';
import subscriptionWebhookRoutes from './subscriptions/webhook/route';

import healthRoutes from './health/route';

const router = Router();

// Middleware pipeline
router.use(corsMiddleware());
router.use(requestId);
router.use(requestLogger);
router.use(rateLimitMiddleware());

// Health check (no auth)
router.use('/health', healthRoutes);

// Auth routes - subdirectory based
router.use('/v1/auth/signup', signupRoutes);
router.use('/v1/auth/login', loginRoutes);
router.use('/v1/auth/session', sessionRoutes);
router.use('/v1/auth/me', meRoutes);

// Brand routes
router.use('/v1/brands', brandListRoutes);
router.use('/v1/brands/:id', brandDetailRoutes);
router.use('/v1/brands/:id/analytics', brandAnalyticsRoutes);
router.use('/v1/brands/:id/mentions', brandMentionsRoutes);
router.use('/v1/brands/:id/competitors', brandCompetitorsRoutes);
router.use('/v1/brands/:id/scan', brandScanRoutes);

// Query routes
router.use('/v1/queries', queryListRoutes);
router.use('/v1/queries/:queryId', queryDetailRoutes);

// Report routes
router.use('/v1/reports', reportListRoutes);
router.use('/v1/reports/:reportId', reportDetailRoutes);
router.use('/v1/reports/generate', reportGenerateRoutes);
router.use('/v1/reports/:reportId/download', reportDownloadRoutes);

// Subscription routes
router.use('/v1/subscriptions', subscriptionRoutes);
router.use('/v1/subscriptions/webhook', subscriptionWebhookRoutes);

// Not found handler
router.use((_req: Request, res: Response) => {
 res.status(404).json({
 success: false,
 error: {
 code: 'NOT_FOUND',
 message: 'Route not found',
 request_id: `req_${Date.now().toString(36)}`,
 },
 });
});

export default router;
