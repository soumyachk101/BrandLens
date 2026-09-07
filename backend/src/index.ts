import Fastify from 'fastify';
import { z } from 'zod';
import { config, validateConfig } from '../config/env';
import { prisma, connectDatabase, disconnectDatabase, checkDatabaseHealth } from '../lib/prisma';
import { closeAllQueues } from '../queue/bull-queue';
import { BrandService } from '../services/brand.service';
import { ScannerService } from '../services/scanner.service';
import { SentimentService } from '../services/sentiment.service';
import { ReportService } from '../services/report.service';
import { CompetitorService } from '../services/competitor.service';
import { SubscriptionService } from '../services/subscription.service';
import { initSentry } from '../monitoring/sentry';
import { logger } from '../monitoring/logger';
import { authenticate, authenticateApiKey, requireRole, requirePermission } from '../middleware/auth';
import { registerCors, registerRateLimit, registerJwt, registerErrorHandler } from '../middleware';
import { AppError, successResponse, errorResponse, handleZodError, paginatedResponse } from '../utils/response';

// Services
const brandService = new BrandService(prisma);
const scannerService = new ScannerService(prisma);
const sentimentService = new SentimentService(prisma);
const reportService = new ReportService(prisma);
const competitorService = new CompetitorService(prisma);
const subscriptionService = new SubscriptionService(prisma);

export async function createApp() {
 validateConfig();

 const app = Fastify({ logger: false });

 // Initialize Sentry
 initSentry();

 // Register middleware
 await registerCors(app);
 await registerRateLimit(app);
 await registerJwt(app);

 // Request logging
 app.addHook('onRequest', async (request) => {
 const requestId = (request as unknown as { requestId?: string }).requestId || 'unknown';
 (request as unknown as { requestId: string }).requestId = requestId;
 });

 app.addHook('onResponse', async (request, reply) => {
 const startTime = (reply.raw as any)?._startTime || Date.now();
 const duration = Date.now() - startTime;
 const statusCode = reply.statusCode;
 const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

 logger[level]({
 method: request.method,
 url: request.url,
 statusCode,
 duration: `${duration}ms`,
 requestId: (request as unknown as { requestId?: string }).requestId,
 });
 });

 // Error handler
 registerErrorHandler(app);

 // ─── Health Check ──────────────────────────────────────────────────────────

 app.get('/api/health', async () => {
 const dbHealthy = await checkDatabaseHealth();

 return {
 status: dbHealthy ? 'healthy' : 'degraded',
 version: '1.0.0',
 timestamp: new Date().toISOString(),
 services: {
 database: dbHealthy ? 'healthy' : 'degraded',
 queue: 'healthy',
 ai_platforms: {
 chatgpt: 'healthy',
 perplexity: 'healthy',
 claude: 'healthy',
 gemini: 'healthy',
 copilot: 'healthy',
 },
 },
 };
 });

 // ─── Auth Routes ───────────────────────────────────────────────────────────

 app.post('/api/auth/signup', async (request, reply) => {
 try {
 const body = z.object({
 name: z.string().min(2).max(255),
 email: z.string().email(),
 password: z.string().min(8),
 }).parse(request.body);

 const bcrypt = await import('bcrypt');
 const passwordHash = await bcrypt.hash(body.password, 10);

 const agency = await prisma.agencies.create({
 data: {
 name: body.name,
 email: body.email,
 password_hash: passwordHash,
 plan: 'starter',
 white_label_config: {},
 email_verified: false,
 },
 select: {
 id: true,
 name: true,
 email: true,
 plan: true,
 created_at: true,
 },
 });

 const token = app.jwt.sign({
 sub: agency.id,
 agency_id: agency.id,
 plan: agency.plan,
 role: 'admin',
 permissions: ['brands:read', 'brands:write', 'reports:read', 'reports:write'],
 });

 return reply.status(201).send({
 success: true,
 data: {
 access_token: token,
 agency,
 },
 });
 } catch (err) {
 if (err instanceof z.ZodError) {
 throw handleZodError(err);
 }
 throw err;
 }
 });

 app.post('/api/auth/login', async (request, reply) => {
 try {
 const body = z.object({
 email: z.string().email(),
 password: z.string().min(1),
 }).parse(request.body);

 const agency = await prisma.agencies.findFirst({
 where: { email: body.email },
 select: { id: true, email: true, plan: true, password_hash: true },
 });

 if (!agency) {
 throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
 }

 const bcrypt = await import('bcrypt');
 const validPassword = await bcrypt.compare(body.password, agency.password_hash);

 if (!validPassword) {
 throw new AppError('Invalid email or password', 401, 'UNAUTHORIZED');
 }

 await prisma.agencies.update({
 where: { id: agency.id },
 data: { last_login_at: new Date() },
 });

 const token = app.jwt.sign({
 sub: agency.id,
 agency_id: agency.id,
 plan: agency.plan,
 role: 'admin',
 permissions: ['brands:read', 'brands:write', 'reports:read', 'reports:write'],
 });

 return {
 success: true,
 data: {
 access_token: token,
 agency: {
 id: agency.id,
 email: agency.email,
 plan: agency.plan,
 },
 },
 };
 } catch (err) {
 if (err instanceof z.ZodError) {
 throw handleZodError(err);
 }
 throw err;
 }
 });

 app.get('/api/auth/session', { preHandler: [authenticate] }, async (request) => {
 const user = (request as unknown as { user: { id: string; email: string; agency_id: string; role: string; permissions: string[] } }).user;

 return {
 success: true,
 data: {
 id: user.id,
 email: user.email,
 role: user.role,
 agency_id: user.agency_id,
 permissions: user.permissions,
 },
 };
 });

 app.get('/api/auth/me', { preHandler: [authenticate] }, async (request) => {
 try {
 const user = (request as unknown as { user: { agency_id: string } }).user;

 const agency = await prisma.agencies.findFirst({
 where: { id: user.agency_id },
 select: {
 id: true,
 name: true,
 email: true,
 plan: true,
 white_label_config: true,
 email_verified: true,
 last_login_at: true,
 created_at: true,
 updated_at: true,
 },
 });

 if (!agency) {
 throw new AppError('Agency not found', 404, 'NOT_FOUND');
 }

 const brandsCount = await prisma.brands.count({ where: { agency_id: user.agency_id } });

 return {
 success: true,
 data: {
 ...agency,
 brands_count: brandsCount,
 },
 };
 } catch (err) {
 if (err instanceof AppError) throw err;
 throw new AppError('Failed to fetch profile', 500);
 }
 });

 // ─── Brand Routes ──────────────────────────────────────────────────────────

 app.get('/api/brands', { preHandler: [authenticate] }, async (request) => {
 try {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const query = request.query as any;

 const page = parseInt((query as any).page || '1', 10);
 const limit = parseInt((query as any).limit || '20', 10);
 const search = query.search;
 const industry = query.industry;
 const is_active = query.is_active !== undefined ? query.is_active === 'true' : undefined;

 const result = await brandService.list(user.agency_id, {
 page,
 limit,
 search,
 industry,
 is_active,
 sort: query.sort || 'created_at',
 order: query.order || 'desc',
 });

 return {
 success: true,
 data: result.data,
 meta: result.meta,
 };
 } catch (err) {
 if (err instanceof z.ZodError) {
 throw handleZodError(err);
 }
 throw err;
 }
 });

 app.post('/api/brands', { preHandler: [authenticate, requirePermission('brands:write')] }, async (request, reply) => {
 try {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const data = z.object({
 name: z.string().min(2).max(255),
 industry: z.string().max(100).optional().nullable(),
 description: z.string().optional().nullable(),
 website_url: z.string().url().optional().nullable(),
 logo_url: z.string().url().optional().nullable(),
 keywords: z.array(z.object({ term: z.string().min(1).max(100), type: z.enum(['brand', 'product', 'category']).default('brand'), weight: z.coerce.number().min(0).max(1).default(1) })).default([]),
 competitors: z.array(z.object({ name: z.string().min(1).max(255), keywords: z.array(z.string()).default([]) })).default([]),
 scan_frequency: z.enum(['hourly', 'daily', 'weekly', 'manual']).default('daily'),
 }).parse(request.body);

 const brand = await brandService.create(user.agency_id, data);
 return reply.status(201).send({ success: true, data: brand });
 } catch (err) {
 if (err instanceof z.ZodError) {
 throw handleZodError(err);
 }
 throw err;
 }
 });

 app.get('/api/brands/:id', { preHandler: [authenticate] }, async (request) => {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const { id } = request.params as { id: string };
 const brand = await brandService.get(user.agency_id, id);
 return { success: true, data: brand };
 });

 app.patch('/api/brands/:id', { preHandler: [authenticate, requirePermission('brands:write')] }, async (request) => {
 try {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const { id } = request.params as { id: string };
 const data = z.object({ name: z.string().min(2).max(255).optional(), industry: z.string().max(100).optional().nullable(), description: z.string().optional().nullable(), website_url: z.string().url().optional().nullable(), logo_url: z.string().url().optional().nullable(), scan_frequency: z.enum(['hourly', 'daily', 'weekly', 'manual']).optional(), is_active: z.boolean().optional(), keywords: z.array(z.object({ term: z.string().min(1).max(100), type: z.enum(['brand', 'product', 'category']).default('brand'), weight: z.coerce.number().min(0).max(1).default(1) })).optional(), competitors: z.array(z.object({ name: z.string().min(1).max(255), keywords: z.array(z.string()).default([]) })).optional() }).parse(request.body);
 const brand = await brandService.update(user.agency_id, id, data);
 return { success: true, data: brand };
 } catch (err) {
 if (err instanceof z.ZodError) {
 throw handleZodError(err);
 }
 throw err;
 }
 });

 app.delete('/api/brands/:id', { preHandler: [authenticate, requirePermission('brands:write')] }, async (request, reply) => {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const { id } = request.params as { id: string };
 await brandService.delete(user.agency_id, id);
 return reply.status(204).send();
 });

 app.get('/api/brands/:id/mentions', { preHandler: [authenticate] }, async (request) => {
 try {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const { id } = request.params as { id: string };

 const page = parseInt((request.query as any).page || '1', 10);
 const limit = parseInt((request.query as any).limit || '20', 10);
 const from = (page - 1) * limit;
 const to = from + limit - 1;

 const where: any = { brand_id: id };
 const platform = (request.query as any).platform;
 const sentiment = (request.query as any).sentiment;
 const fromDate = (request.query as any).from;
 const toDate = (request.query as any).to;
 const entity_type = (request.query as any).entity_type;
 const search = (request.query as any).search;

 if (platform) where.platform = platform;
 if (sentiment) where.sentiment = sentiment;
 if (fromDate || toDate) {
 where.created_at = {};
 if (fromDate) (where.created_at as any).gte = fromDate;
 if (toDate) (where.created_at as any).lte = toDate;
 }
 if (entity_type) where.entity_type = entity_type;
 if (search) {
 where.OR = [
 { entity_name: { contains: search, mode: 'insensitive' } },
 { context: { contains: search, mode: 'insensitive' } },
 ];
 }

 const [data, total] = await Promise.all([
 prisma.mentions.findMany({ where, skip: from, take: limit, orderBy: { created_at: 'desc' } }),
 prisma.mentions.count({ where }),
 ]);

 paginatedResponse(request.server, request, data, page, limit, total);
 } catch (err) {
 throw err;
 }
 });

 app.get('/api/brands/:id/competitors', { preHandler: [authenticate] }, async (request) => {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const { id } = request.params as { id: string };
 const competitors = await competitorService.list(user.agency_id, id);
 return { success: true, data: competitors };
 });

 app.post('/api/brands/:id/competitors', { preHandler: [authenticate, requirePermission('brands:write')] }, async (request, reply) => {
 try {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const { id } = request.params as { id: string };
 const data = z.object({ name: z.string().min(1).max(255), keywords: z.array(z.string()).default([]) }).parse(request.body);
 const competitor = await competitorService.add(user.agency_id, id, data);
 return reply.status(201).send({ success: true, data: competitor });
 } catch (err) {
 if (err instanceof z.ZodError) {
 throw handleZodError(err);
 }
 throw err;
 }
 });

 app.get('/api/brands/:id/competitors/comparison', { preHandler: [authenticate] }, async (request) => {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const { id } = request.params as { id: string };
 const comparison = await competitorService.getComparison(user.agency_id, id, request.query as any);
 return { success: true, data: comparison };
 });

 app.delete('/api/brands/:id/competitors/:competitorId', { preHandler: [authenticate, requirePermission('brands:write')] }, async (request, reply) => {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const { id, competitorId } = request.params as { id: string; competitorId: string };
 await competitorService.remove(user.agency_id, id, competitorId);
 return reply.status(204).send();
 });

 app.post('/api/brands/:id/scan', { preHandler: [authenticate] }, async (request, reply) => {
 try {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const { id } = request.params as { id: string };
 const data = z.object({ platforms: z.array(z.string()).optional().default(['chatgpt', 'perplexity', 'claude', 'gemini']), prompt_template_id: z.string().uuid().optional().nullable(), query_variants: z.array(z.enum(['original', 'paraphrased', 'question_form'])).optional().default(['original']) }).parse(request.body);

 const supportedPlatforms = ['chatgpt', 'perplexity', 'claude', 'gemini', 'copilot', 'deepseek', 'groq'];
 const platform = (data.platforms && data.platforms[0]) || 'chatgpt';
 if (!supportedPlatforms.includes(platform)) {
 throw new AppError(`Unsupported platform: ${platform}`, 400, 'BAD_REQUEST');
 }

 const result = await scannerService.runScan(user.agency_id, id, platform as any);
 return reply.status(202).send({ success: true, data: result });
 } catch (err) {
 if (err instanceof z.ZodError) {
 throw handleZodError(err);
 }
 throw err;
 }
 });

 app.get('/api/brands/:id/analytics', { preHandler: [authenticate] }, async (request) => {
 try {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const { id } = request.params as { id: string };
 const analytics = await brandService.getAnalytics(user.agency_id, id, request.query as any);
 return { success: true, data: analytics };
 } catch (err) {
 throw err;
 }
 });

 // ─── Query Routes ───────────────────────────────────────────────────────────

 app.get('/api/queries', { preHandler: [authenticate] }, async (request) => {
 try {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const brandId = (request.query as any).brand_id as string | undefined;

 if (!brandId) {
 throw new AppError('brand_id is required', 400, 'BAD_REQUEST');
 }

 const page = parseInt((request.query as any).page || '1', 10);
 const limit = parseInt((request.query as any).limit || '20', 10);
 const from = (page - 1) * limit;
 const to = from + limit - 1;

 const where: any = { brand_id: brandId };
 const platform = (request.query as any).platform;
 const status = (request.query as any).status;
 const search = (request.query as any).search;
 const fromDate = (request.query as any).from;
 const toDate = (request.query as any).to;

 if (platform) where.platform = platform;
 if (status) where.status = status;
 if (search) where.query_text = { contains: search, mode: 'insensitive' };
 if (fromDate || toDate) {
 where.created_at = {};
 if (fromDate) (where.created_at as any).gte = fromDate;
 if (toDate) (where.created_at as any).lte = toDate;
 }

 const [data, total] = await Promise.all([
 prisma.ai_queries.findMany({ where, skip: from, take: limit, orderBy: { created_at: 'desc' } }),
 prisma.ai_queries.count({ where }),
 ]);

 return {
 success: true,
 data,
 meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
 };
 } catch (err) {
 if (err instanceof z.ZodError) {
 throw handleZodError(err);
 }
 throw err;
 }
 });

 app.get('/api/queries/:id', { preHandler: [authenticate] }, async (request) => {
 const { id } = request.params as { id: string };
 const query = await prisma.ai_queries.findUnique({ where: { id } });

 if (!query) {
 throw new AppError('Query not found', 404, 'NOT_FOUND');
 }

 return { success: true, data: query };
 });

 // ─── Report Routes ──────────────────────────────────────────────────────────

 app.get('/api/reports', { preHandler: [authenticate] }, async (request) => {
 try {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const brandId = (request.query as any).brand_id as string | undefined;

 if (!brandId) {
 throw new AppError('brand_id is required', 400, 'BAD_REQUEST');
 }

 const page = parseInt((request.query as any).page || '1', 10);
 const limit = parseInt((request.query as any).limit || '20', 10);

 const result = await reportService.getBrandReports(brandId, {
 page,
 limit,
 report_type: (request.query as any).report_type,
 from: (request.query as any).from,
 to: (request.query as any).to,
 status: (request.query as any).status,
 });

 return {
 success: true,
 data: result.data,
 meta: result.meta,
 };
 } catch (err) {
 throw err;
 }
 });

 app.get('/api/reports/:id', { preHandler: [authenticate] }, async (request) => {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const { id } = request.params as { id: string };
 const report = await reportService.get(id);
 return { success: true, data: report };
 });

 app.post('/api/reports/generate', { preHandler: [authenticate, requirePermission('reports:write')] }, async (request, reply) => {
 try {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const data = z.object({ brand_id: z.string().uuid(), report_type: z.enum(['weekly', 'monthly', 'quarterly', 'custom', 'competitor', 'sentiment']), period_start: z.string(), period_end: z.string(), send_to: z.array(z.string().email()).max(10).optional().default([]), format: z.array(z.enum(['pdf', 'html'])).optional().default(['pdf', 'html']) }).parse(request.body);
 const result = await reportService.generate(user.agency_id, data.brand_id, data);
 return reply.status(202).send({ success: true, data: result });
 } catch (err) {
 if (err instanceof z.ZodError) {
 throw handleZodError(err);
 }
 throw err;
 }
 });

 app.get('/api/reports/:id/download', { preHandler: [authenticate] }, async (request) => {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const { id } = request.params as { id: string };
 const format = (request.query as any).format as string || 'pdf';
 const downloadUrl = await reportService.getDownloadUrl(user.agency_id, id, format);

 return { success: true, data: { download_url: downloadUrl } };
 });

 app.post('/api/reports/:id/resend', { preHandler: [authenticate, requirePermission('reports:write')] }, async (request) => {
 try {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const { id } = request.params as { id: string };
 const data = z.object({ to: z.array(z.string().email()).min(1) }).parse(request.body);
 const result = await reportService.resend(user.agency_id, id, data);
 return { success: true, data: result };
 } catch (err) {
 if (err instanceof z.ZodError) {
 throw handleZodError(err);
 }
 throw err;
 }
 });

 // ─── Subscription Routes ───────────────────────────────────────────────────

 app.get('/api/subscriptions', { preHandler: [authenticate] }, async (request) => {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const subscription = await subscriptionService.getByAgency(user.agency_id);

 if (!subscription) {
 return {
 success: true,
 data: {
 plan: 'starter' as const,
 status: 'active',
 limits: { requests_per_minute: 60, scans_per_day: 100, concurrent_scans: 2, brands_max: 5 },
 usage: { scans_this_month: 0, brands_count: 0 },
 },
 };
 }

 const planLimits = await subscriptionService.getPlanLimits(user.agency_id);
 return { success: true, data: planLimits };
 });

 app.post('/api/subscriptions/checkout', { preHandler: [authenticate] }, async (request, reply) => {
 try {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const data = z.object({ plan: z.enum(['starter', 'growth', 'enterprise']), success_url: z.string().url(), cancel_url: z.string().url() }).parse(request.body);
 const session = await subscriptionService.createCheckoutSession(
 user.agency_id,
 data.plan,
 data.success_url,
 data.cancel_url,
 );
 return { success: true, data: session };
 } catch (err) {
 if (err instanceof z.ZodError) {
 throw handleZodError(err);
 }
 throw err;
 }
 });

 app.post('/api/subscriptions/cancel', { preHandler: [authenticate] }, async (request) => {
 const user = (request as unknown as { user: { agency_id: string } }).user;
 const result = await subscriptionService.cancelSubscription(user.agency_id);
 return { success: true, data: result };
 });

 app.post('/api/subscriptions/webhook', async (request, reply) => {
 try {
 const signature = request.headers['stripe-signature'];
 if (!signature || typeof signature !== 'string') {
 throw new AppError('Missing stripe-signature header', 401, 'UNAUTHORIZED');
 }

 await subscriptionService.handleWebhook(Buffer.from(JSON.stringify(request.body)), signature);
 return reply.status(200).send({ success: true });
 } catch (err) {
 throw err;
 }
 });

 // ─── Start Server ──────────────────────────────────────────────────────────

 const PORT = parseInt(config.server.port || '3000', 10);

 await app.listen({ port: PORT, host: '0.0.0.0' });

 logger.info(`BrandLens API server running on port ${PORT} in ${config.server.env} mode`);
 logger.info(`Health check: http://localhost:${PORT}/api/health`);

 // Graceful shutdown
 const shutdown = async (signal: string) => {
 logger.info(`Received ${signal}, shutting down gracefully...`);

 try {
 await app.close();
 await closeAllQueues();
 await disconnectDatabase();
 logger.info('Shutdown complete');
 process.exit(0);
 } catch (err) {
 logger.error({ error: err }, 'Shutdown error');
 process.exit(1);
 }
 };

 process.on('SIGTERM', () => shutdown('SIGTERM'));
 process.on('SIGINT', () => shutdown('SIGINT'));

 process.on('uncaughtException', (err) => {
 logger.error({ error: err }, 'Uncaught exception');
 });

 process.on('unhandledRejection', (reason, promise) => {
 logger.error({ reason, promise }, 'Unhandled rejection');
 });

 return app;
}

export async function main() {
 try {
 const app = await createApp();
 return app;
 } catch (err) {
 console.error('[FATAL] Failed to start server:', err);
 process.exit(1);
 }
}