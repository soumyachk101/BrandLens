import { PrismaClient, QueryStatus, QueryPlatform } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AppError, NotFoundError } from '../utils/errors';
import { BrandMention, QueryPlatform as Platform } from '../types';
import { logger } from '../monitoring/logger';

// Simulated responses for demo purposes
const SIMULATED_RESPONSES: Record<string, {
 raw_text: string;
 model: string;
 latency_ms: number;
 mentions: Array<{ entity: string; type: string; context: string; position: number }>;
}> = {
 chatgpt: {
 raw_text: 'Based on current market data, here are the top AI tools for brand visibility monitoring...',
 model: 'gpt-4-turbo',
 latency_ms: 3400,
 mentions: [
 { entity: 'BrandLens', type: 'brand', context: 'BrandLens stands out with real-time monitoring...', position: 1 },
 { entity: 'MentionStream', type: 'competitor', context: 'Competitors like MentionStream offer depth...', position: 2 },
 ],
 },
 perplexity: {
 raw_text: 'Current research indicates that BrandLens is a strong contender...',
 model: 'sonar-large',
 latency_ms: 2100,
 mentions: [
 { entity: 'BrandLens', type: 'brand', context: 'BrandLens is a strong contender...', position: 1 },
 { entity: 'BrandWatch AI', type: 'competitor', context: 'BrandWatch AI remains a solid alternative...', position: 2 },
 ],
 },
 claude: {
 raw_text: 'When evaluating AI brand monitoring platforms, BrandLens offers compelling features...',
 model: 'claude-3-5-sonnet-20240620',
 latency_ms: 5200,
 mentions: [
 { entity: 'BrandLens', type: 'brand', context: 'BrandLens offers compelling features...', position: 1 },
 { entity: 'MentionStream', type: 'competitor', context: 'MentionStream is known for depth...', position: 2 },
 ],
 },
 gemini: {
 raw_text: 'Google Gemini analysis shows BrandLens as a promising AI visibility tool...',
 model: 'gemini-1.5-pro',
 latency_ms: 4100,
 mentions: [
 { entity: 'BrandLens', type: 'brand', context: 'BrandLens as a promising AI visibility tool...', position: 1 },
 { entity: 'BrandWatch AI', type: 'competitor', context: 'BrandWatch AI and MentionStream are notable...', position: 2 },
 ],
 },
 deepseek: {
 raw_text: 'DeepSeek analysis: BrandLens provides comprehensive AI brand monitoring...',
 model: 'deepseek-chat',
 latency_ms: 2800,
 mentions: [
 { entity: 'BrandLens', type: 'brand', context: 'BrandLens provides comprehensive monitoring...', position: 1 },
 { entity: 'Semantria', type: 'competitor', context: 'Semantria offers text analytics...', position: 2 },
 ],
 },
 groq: {
 raw_text: 'Fast analysis via Groq: BrandLens leads in AI-powered brand visibility...',
 model: 'llama-3.3-70b-versatile',
 latency_ms: 800,
 mentions: [
 { entity: 'BrandLens', type: 'brand', context: 'BrandLens leads in visibility monitoring...', position: 1 },
 { entity: 'MentionStream', type: 'competitor', context: 'Competitors include MentionStream...', position: 2 },
 ],
 },
 copilot: {
 raw_text: 'Based on web context: BrandLens is emerging as a key player...',
 model: 'gpt-4',
 latency_ms: 3500,
 mentions: [
 { entity: 'BrandLens', type: 'brand', context: 'BrandLens is emerging as a key player...', position: 1 },
 { entity: 'BrandWatch AI', type: 'competitor', context: 'Consider BrandWatch AI...', position: 2 },
 ],
 },
 custom: {
 raw_text: 'Custom platform response for BrandLens brand visibility analysis...',
 model: 'custom',
 latency_ms: 3000,
 mentions: [
 { entity: 'BrandLens', type: 'brand', context: 'BrandLens shows strong positioning...', position: 1 },
 ],
 },
};

export class ScannerService {
 constructor(private prisma: PrismaClient) {}

 async createScanJob(
 agencyId: string,
 brandId: string,
 platform: QueryPlatform,
 triggeredBy: 'scheduled' | 'manual' | 'webhook' | 'api' = 'manual',
 status: QueryStatus = 'pending',
 ): Promise<any> {
 const scanJob = await this.prisma.scan_jobs.create({
 data: {
 brand_id: brandId,
 agency_id: agencyId,
 platform,
 status: 'queued',
 queries_total: 4,
 queries_done: 0,
 queries_failed: 0,
 triggered_by: triggeredBy,
 },
 });

 return {
 id: scanJob.id,
 brand_id: scanJob.brand_id,
 agency_id: scanJob.agency_id,
 platform: scanJob.platform,
 status: scanJob.status,
 queries_total: scanJob.queries_total,
 queries_done: scanJob.queries_done,
 queries_failed: scanJob.queries_failed,
 error_message: scanJob.error_message,
 triggered_by: scanJob.triggered_by,
 started_at: scanJob.started_at,
 completed_at: scanJob.completed_at,
 created_at: scanJob.created_at,
 };
 }

 async getScanJob(agencyId: string, jobId: string): Promise<any> {
 const job = await this.prisma.scan_jobs.findFirst({
 where: { id: jobId, agency_id: agencyId },
 });

 if (!job) {
 throw new NotFoundError('Scan job');
 }

 return {
 id: job.id,
 brand_id: job.brand_id,
 agency_id: job.agency_id,
 platform: job.platform,
 status: job.status,
 queries_total: job.queries_total,
 queries_done: job.queries_done,
 queries_failed: job.queries_failed,
 error_message: job.error_message,
 triggered_by: job.triggered_by,
 started_at: job.started_at,
 completed_at: job.completed_at,
 created_at: job.created_at,
 };
 }

 async listScanJobs(
 agencyId: string,
 options: { brand_id?: string; status?: string; page?: number; limit?: number } = {},
 ): Promise<{ data: any[]; meta: { page: number; limit: number; total: number; total_pages: number } }> {
 const { brand_id, status, page = 1, limit = 20 } = options;

 const where: any = { agency_id: agencyId };
 if (brand_id) where.brand_id = brand_id;
 if (status) where.status = status;

 const [data, total] = await Promise.all([
 this.prisma.scan_jobs.findMany({
 where,
 skip: (page - 1) * limit,
 take: limit,
 orderBy: { created_at: 'desc' },
 }),
 this.prisma.scan_jobs.count({ where }),
 ]);

 const mapped = data.map((j) => ({
 id: j.id,
 brand_id: j.brand_id,
 agency_id: j.agency_id,
 platform: j.platform,
 status: j.status,
 queries_total: j.queries_total,
 queries_done: j.queries_done,
 queries_failed: j.queries_failed,
 error_message: j.error_message,
 triggered_by: j.triggered_by,
 started_at: j.started_at,
 completed_at: j.completed_at,
 created_at: j.created_at,
 }));

 return {
 data: mapped,
 meta: {
 page,
 limit,
 total,
 total_pages: Math.ceil(total / limit),
 },
 };
 }

 async cancelScanJob(agencyId: string, jobId: string): Promise<any> {
 const existing = await this.prisma.scan_jobs.findFirst({
 where: { id: jobId, agency_id: agencyId },
 select: { id: true, status: true },
 });

 if (!existing) {
 throw new NotFoundError('Scan job');
 }

 if (existing.status !== 'running' && existing.status !== 'queued') {
 throw new AppError('Cannot cancel a completed scan job', 400, 'BAD_REQUEST');
 }

 const updated = await this.prisma.scan_jobs.update({
 where: { id: jobId },
 data: { status: 'cancelled', completed_at: new Date() },
 });

 return {
 id: updated.id,
 brand_id: updated.brand_id,
 agency_id: updated.agency_id,
 platform: updated.platform,
 status: updated.status,
 queries_total: updated.queries_total,
 queries_done: updated.queries_done,
 queries_failed: updated.queries_failed,
 error_message: updated.error_message,
 triggered_by: updated.triggered_by,
 started_at: updated.started_at,
 completed_at: updated.completed_at,
 created_at: updated.created_at,
 };
 }

 async runScan(agencyId: string, brandId: string, platform: QueryPlatform): Promise<{
 scan_job_id: string;
 brand_id: string;
 status: string;
 platforms: string[];
 queries_total: number;
 estimated_duration_seconds: number;
 created_at: string;
 }> {
 // Verify brand ownership
 const brand = await this.prisma.brands.findFirst({
 where: { id: brandId, agency_id: agencyId },
 select: { id: true, name: true, industry: true, keywords: true, competitors: true },
 });

 if (!brand) {
 throw new NotFoundError('Brand');
 }

 // Create scan job
 const scanJob = await this.createScanJob(agencyId, brandId, platform, 'manual', 'running');

 // Update scan job to running
 await this.prisma.scan_jobs.update({
 where: { id: scanJob.id },
 data: { started_at: new Date() },
 });

 const simulated = SIMULATED_RESPONSES[platform] || SIMULATED_RESPONSES.chatgpt;
 const queriesTotal = 4;
 const estimatedDuration = Math.round(simulated.latency_ms * queriesTotal / 1000);

 const queryVariants = [
 { variant: 'original', text: `What are the best AI tools for brand visibility monitoring?` },
 { variant: 'paraphrased', text: `Top AI-powered brand monitoring platforms` },
 { variant: 'question_form', text: `Which platforms are best for tracking brand mentions across AI?` },
 { variant: 'original', text: `Compare ${brand.name} with competitors for brand monitoring` },
 ];

 let queriesDone = 0;
 let queriesFailed = 0;

 for (const qv of queryVariants) {
 const queryId = uuidv4();
 const sentimentScore = Math.round((Math.random() * 2 - 1) * 1000) / 1000;
 const confidenceScore = Math.round((0.7 + Math.random() * 0.3) * 1000) / 1000;
 const responseTimeMs = Math.max(0, simulated.latency_ms + Math.round(Math.random() * 1000 - 500));

 try {
 const aiQuery = await this.prisma.ai_queries.create({
 data: {
 id: queryId,
 brand_id: brandId,
 platform,
 query_text: qv.text,
 query_variant: qv.variant,
 ai_response: {
 raw_text: simulated.raw_text,
 model: simulated.model,
 tokens_used: Math.round(800 + Math.random() * 1000),
 latency_ms: simulated.latency_ms,
 citations: [],
 } as any,
 mentions: simulated.mentions.map((m) => ({
 ...m,
 context: m.context + (Math.random() > 0.5 ? ` (${brand.name} context)` : ''),
 })),
 mention_count: simulated.mentions.length,
 sentiment_score: sentimentScore,
 confidence_score: confidenceScore,
 status: 'completed',
 response_time_ms: responseTimeMs,
 },
 });

 // Create mention records
 for (let i = 0; i < simulated.mentions.length; i++) {
 const mention = simulated.mentions[i];
 const mentionId = uuidv4();
 const mSentimentScore = Math.round((Math.random() * 2 - 1) * 1000) / 1000;
 let sentiment: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral';
 if (mSentimentScore > 0.2) sentiment = 'positive';
 else if (mSentimentScore < -0.2) sentiment = 'negative';

 await this.prisma.mentions.create({
 data: {
 id: mentionId,
 brand_id: brandId,
 query_id: queryId,
 platform,
 entity_name: mention.entity,
 entity_type: mention.type as any,
 context: mention.context,
 sentiment,
 sentiment_score: mSentimentScore,
 confidence_score: confidenceScore,
 position: mention.position,
 citation_urls: [],
 },
 });
 }

 queriesDone++;
 } catch (err) {
 logger.error({ queryId, error: err }, 'Failed to insert query');
 queriesFailed++;
 }
 }

 await this.prisma.scan_jobs.update({
 where: { id: scanJob.id },
 data: { status: 'completed', queries_done: queriesDone, queries_failed: queriesFailed, completed_at: new Date() },
 });

 await this.prisma.brands.update({
 where: { id: brandId },
 data: { last_scanned_at: new Date() },
 });

 return {
 scan_job_id: scanJob.id,
 brand_id: brandId,
 status: 'completed',
 platforms: [platform],
 queries_total: queriesTotal,
 estimated_duration_seconds: estimatedDuration,
 created_at: scanJob.created_at,
 };
 }
}