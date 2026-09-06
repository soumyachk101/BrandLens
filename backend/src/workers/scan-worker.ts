import { Worker } from 'bullmq';
import { getServiceRoleClient } from '../utils/supabase';
import { scanQueue, reportQueue, webhookQueue, emailQueue, sentimentQueue } from '../queues';
import { ScannerService } from '../services/scanner.service';
import { ReportService } from '../services/report.service';
import { SentimentService } from '../services/sentiment.service';
import { BrandService } from '../services/brand.service';
import { CompetitorService } from '../services/competitor.service';
import { config } from '../config/env';

const supabase = getServiceRoleClient();
const scannerService = new ScannerService(supabase);
const reportService = new ReportService(supabase);
const sentimentService = new SentimentService(supabase);
const brandService = new BrandService(supabase);
const competitorService = new CompetitorService(supabase);

async function startWorkers() {
 console.log('[INFO] Starting BrandLens workers...');

 const scanWorker = new Worker('scan-queue', async (job: Job) => {
 console.log(`[INFO] Processing scan job ${job.id}`);
 const { brandId, agencyId, platform } = job.data;

 try {
 if (job.progress) await job.updateProgress(10);

 await scannerService.runScan(agencyId, brandId, platform);

 await job.updateProgress(100);
 console.log(`[INFO] Scan job ${job.id} completed`);
 } catch (err) {
 console.error(`[ERROR] Scan job ${job.id} failed:`, err);
 throw err;
 }
 }, { connection: { url: config.redis.url }, concurrency: 5 });

 const reportWorker = new Worker('report-queue', async (job: Job) => {
 console.log(`[INFO] Processing report job ${job.id}`);
 const { reportId, brandId, period, format, sendTo } = job.data;

 try {
 if (job.progress) await job.updateProgress(10);

 const { data: brand } = await supabase
 .from('brands')
 .select('name, industry')
 .eq('id', brandId)
 .maybeSingle();

 if (!brand) {
 throw new Error(`Brand ${brandId} not found`);
 }

 const { data: report } = await supabase
 .from('reports')
 .select('*')
 .eq('id', reportId)
 .maybeSingle();

 if (!report) {
 throw new Error(`Report ${reportId} not found`);
 }

 await job.updateProgress(30);

 const { data: queries } = await supabase
 .from('ai_queries')
 .select('*')
 .eq('brand_id', brandId)
 .gte('created_at', period.start)
 .lte('created_at', period.end);

 const { data: mentions } = await supabase
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
 summary: `${brand.name} report: ${totalMentions} mentions across ${totalQueries} queries.`,
 total_queries: totalQueries,
 total_mentions: totalMentions,
 visibility_score: visibilityScore,
 sentiment_distribution: sentimentDist,
 generated_at: new Date().toISOString(),
 };

 const pdfUrl = `https://s3.brandlens.ai/reports/${reportId}/report.pdf`;
 const htmlUrl = `https://s3.brandlens.ai/reports/${reportId}/report.html`;

 await supabase
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
 for (const email of sendTo) {
 await emailQueue.add('send-report', {
 reportId,
 to: email,
 brandName: brand.name,
 pdfUrl,
 htmlUrl,
 });
 }
 }

 await webhookQueue.add('deliver-webhook', {
 event: 'report.ready',
 report_id: reportId,
 brand_id: brandId,
 pdf_url: pdfUrl,
 html_url: htmlUrl,
 });

 await job.updateProgress(100);
 console.log(`[INFO] Report job ${job.id} completed`);
 } catch (err) {
 console.error(`[ERROR] Report job ${job.id} failed:`, err);
 await supabase
 .from('reports')
 .update({ status: 'failed', updated_at: new Date().toISOString() })
 .eq('id', reportId);

 await webhookQueue.add('deliver-webhook', {
 event: 'report.failed',
 report_id: reportId,
 brand_id: brandId,
 error: (err as Error).message,
 });

 throw err;
 }
 }, { connection: { url: config.redis.url }, concurrency: 2 });

 const sentimentWorker = new Worker('sentiment-queue', async (job: Job) => {
 console.log(`[INFO] Processing sentiment job ${job.id}`);
 const { mentionIds } = job.data;

 try {
 await sentimentService.batchAnalyze(mentionIds);
 console.log(`[INFO] Sentiment job ${job.id} completed`);
 } catch (err) {
 console.error(`[ERROR] Sentiment job ${job.id} failed:`, err);
 throw err;
 }
 }, { connection: { url: config.redis.url }, concurrency: 3 });

 const webhookWorker = new Worker('webhook-queue', async (job: Job) => {
 console.log(`[INFO] Processing webhook delivery ${job.id}`);
 const payload = job.data;

 try {
 const { data: endpoints } = await supabase
 .from('webhook_endpoints')
 .select('*')
 .eq('is_active', true)
 .contains('events', [payload.event]);

 for (const endpoint of endpoints || []) {
 const body = JSON.stringify({
 event: payload.event,
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

 await supabase.from('webhook_events').insert({
 agency_id: (await supabase.from('agencies').select('id').eq('id', endpoint.agency_id).maybeSingle())?.data?.id || '',
 event_type: payload.event,
 payload,
 delivery_status: response.ok ? 'sent' : 'failed',
 response_code: response.status,
 sent_at: new Date().toISOString(),
 });
 } catch {
 await supabase.from('webhook_events').insert({
 agency_id: endpoint.agency_id,
 event_type: payload.event,
 payload,
 delivery_status: 'failed',
 retry_count: 1,
 next_retry_at: new Date(Date.now() + 5000).toISOString(),
 });
 }
 }
 } catch (err) {
 console.error(`[ERROR] Webhook delivery ${job.id} failed:`, err);
 }
 }, { connection: { url: config.redis.url }, concurrency: 5 });

 console.log('[INFO] All workers started');
}

process.on('SIGINT', async () => {
 console.log('[INFO] Shutting down workers...');
 await Promise.all([scanQueue.close(), reportQueue.close(), webhookQueue.close(), emailQueue.close(), sentimentQueue.close()]);
 process.exit(0);
});

startWorkers().catch((err) => {
 console.error('[FATAL] Failed to start workers:', err);
 process.exit(1);
});
