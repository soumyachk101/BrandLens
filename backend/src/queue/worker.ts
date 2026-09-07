import { Worker } from 'bullmq';
import { getQueue } from './bull-queue';
import { getServiceRoleClient } from '../utils/supabase';
import { ScannerService } from '../services/scanner.service';
import { ReportService } from '../services/report.service';
import { SentimentService } from '../services/sentiment.service';
import { BrandService } from '../services/brand.service';
import { CompetitorService } from '../services/competitor.service';
import { config } from '../config/env';
import { logger } from '../monitoring/logger';

const supabase = getServiceRoleClient();
const scannerService = new ScannerService(supabase!);
const reportService = new ReportService(supabase!);
const sentimentService = new SentimentService(supabase!);
const brandService = new BrandService(supabase!);
const competitorService = new CompetitorService(supabase!);

async function startWorkers(): Promise<void> {
 logger.info('Starting BrandLens workers...');

 // Scan worker
 const scanWorker = new Worker(
 'scan-queue',
 async (job) => {
 logger.info({ jobId: job.id }, 'Processing scan job');
 const { brandId, agencyId, platform } = job.data as {
 brandId: string;
 agencyId: string;
 platform: string;
 };

 await job.updateProgress(10);

 const result = await scannerService.runScan(agencyId, brandId, platform as any);

 await job.updateProgress(100);
 logger.info({ jobId: job.id, result }, 'Scan job completed');

 return result;
 },
 {
 connection: { url: config.redis.url },
 concurrency: 5,
 },
 );

 scanWorker.on('failed', (job, err) => {
 logger.error({ jobId: job?.id, error: err.message }, 'Scan job failed');
 });

 // Report worker
 const reportWorker = new Worker(
 'report-queue',
 async (job) => {
 logger.info({ jobId: job.id }, 'Processing report job');
 const { reportId, brandId, period, format, sendTo } = job.data as {
 reportId: string;
 brandId: string;
 period: { start: string; end: string };
 format: string[];
 sendTo: string[];
 };

 await job.updateProgress(10);

 const report = await reportService.get(reportId);
 await job.updateProgress(30);

 const { data: queries } = await supabase!
 .from('ai_queries')
 .select('*')
 .eq('brand_id', brandId)
 .gte('created_at', period.start)
 .lte('created_at', period.end);

 const { data: mentions } = await supabase!
 .from('mentions')
 .select('*')
 .eq('brand_id', brandId)
 .gte('created_at', period.start)
 .lte('created_at', period.end);

 await job.updateProgress(60);

 const totalQueries = queries?.length || 0;
 const totalMentions = mentions?.length || 0;
 const brandMentions = mentions?.filter((m) => m.entity_type === 'brand').length || 0;
 const visibilityScore = totalQueries > 0 ? Math.round((brandMentions / totalQueries) * 10000) / 10000 : 0;

 const sentimentDist = {
 positive: mentions?.filter((m) => m.sentiment === 'positive').length || 0,
 neutral: mentions?.filter((m) => m.sentiment === 'neutral').length || 0,
 negative: mentions?.filter((m) => m.sentiment === 'negative').length || 0,
 mixed: mentions?.filter((m) => m.sentiment === 'mixed').length || 0,
 };

 const reportData = {
 ...report.data,
 summary: `${report.brand_id} report: ${totalMentions} mentions across ${totalQueries} queries.`,
 total_queries: totalQueries,
 total_mentions: totalMentions,
 visibility_score: visibilityScore,
 sentiment_distribution: sentimentDist,
 generated_at: new Date().toISOString(),
 };

 const pdfUrl = `https://s3.${config.s3.region}.amazonaws.com/${config.s3.bucket}/reports/${reportId}/report.pdf`;
 const htmlUrl = `https://s3.${config.s3.region}.amazonaws.com/${config.s3.bucket}/reports/${reportId}/report.html`;

 await supabase!
 .from('reports')
 .update({
 data: reportData,
 pdf_url: pdfUrl,
 html_url: htmlUrl,
 status: 'completed',
 updated_at: new Date().toISOString(),
 })
 .eq('id', reportId);

 await job.updateProgress(80);

 if (sendTo && sendTo.length > 0) {
 const emailQueue = getQueue('email-queue');
 for (const email of sendTo) {
 await emailQueue.add('send-report', {
 reportId,
 to: email,
 subject: `Your BrandLens Report is Ready`,
 html: `<p>Your report is ready. <a href="${pdfUrl}">Download PDF</a></p>`,
 });
 }
 }

 await job.updateProgress(100);
 logger.info({ jobId: job.id }, 'Report job completed');
 },
 {
 connection: { url: config.redis.url },
 concurrency: 2,
 },
 );

 // Sentiment worker
 const sentimentWorker = new Worker(
 'sentiment-queue',
 async (job) => {
 logger.info({ jobId: job.id }, 'Processing sentiment job');
 const { mentionIds } = job.data as { mentionIds: string[] };

 await sentimentService.batchAnalyze(mentionIds);
 logger.info({ jobId: job.id }, 'Sentiment job completed');
 },
 {
 connection: { url: config.redis.url },
 concurrency: 3,
 },
 );

 // Webhook worker
 const webhookWorker = new Worker(
 'webhook-queue',
 async (job) => {
 const payload = job.data;
 const eventType = payload.event_type || payload.event;

 logger.info({ eventType, jobId: job.id }, 'Processing webhook delivery');

 try {
 const { data: endpoints } = await supabase!
 .from('webhook_endpoints')
 .select('*')
 .eq('is_active', true)
 .contains('events', [eventType]);

 if (!endpoints || endpoints.length === 0) {
 logger.debug({ eventType }, 'No webhook endpoints for event');
 return;
 }

 for (const endpoint of endpoints) {
 const body = JSON.stringify({
 event: eventType,
 delivery_id: `del_${Date.now().toString(36)}`,
 created_at: new Date().toISOString(),
 data: payload,
 });

 try {
 const response = await fetch(endpoint.url, {
 method: 'POST',
 headers: {
 'Content-Type': 'application/json',
 'X-BrandLens-Signature': Buffer.from(endpoint.secret + body).toString('base64'),
 'X-BrandLens-Delivery': `del_${Date.now().toString(36)}`,
 },
 body,
 });

 await supabase!.from('webhook_events').insert({
 agency_id: endpoint.agency_id,
 event_type: eventType,
 payload,
 delivery_status: response.ok ? 'sent' : 'failed',
 response_code: response.status,
 sent_at: new Date().toISOString(),
 });
 } catch {
 await supabase!.from('webhook_events').insert({
 agency_id: endpoint.agency_id,
 event_type: eventType,
 payload,
 delivery_status: 'failed',
 retry_count: 1,
 next_retry_at: new Date(Date.now() + 5000).toISOString(),
 });
 }
 }
 } catch (err) {
 logger.error({ jobId: job.id, error: err }, 'Webhook delivery failed');
 }
 },
 {
 connection: { url: config.redis.url },
 concurrency: 5,
 },
 );

 logger.info('All workers started');
}

process.on('SIGINT', async () => {
 logger.info('Shutting down workers...');
 await closeQueues();
 process.exit(0);
});

process.on('SIGTERM', async () => {
 logger.info('Shutting down workers...');
 await closeQueues();
 process.exit(0);
});

async function closeQueues(): Promise<void> {
 const queues = ['scan-queue', 'report-queue', 'sentiment-queue', 'webhook-queue', 'email-queue'];
 await Promise.all(queues.map((name) => getQueue(name).close().catch(() => {})));
 if (redisConnection) {
 await redisConnection.quit();
 }
}

startWorkers().catch((err) => {
 logger.error({ error: err }, 'Failed to start workers');
 process.exit(1);
});