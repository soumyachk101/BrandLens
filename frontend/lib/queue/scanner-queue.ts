/**
 * Scanner Queue
 *
 * BullMQ queue for managing scheduled and ad-hoc brand scan jobs.
 * Uses IORedis as the BullMQ backend.
 */

import { Queue, Worker, Job } from "bullmq";
import type { ScanJob, ScanRequestBody } from "../types.js";
import { scanBrandAcrossPlatforms } from "../ai/multi-platform-scanner.js";
import { analyzeMentionsSentiment } from "../ai/sentiment-analyzer.js";
import { computeSentimentBreakdown } from "../ai/sentiment-analyzer.js";
import { computeVisibilityScore } from "../ai/visibility-scorer.js";
import { generateNarrative } from "../ai/report-narrator.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

interface ScannerQueueConfig {
 redis: {
 host: string;
 port: number;
 };
 openaiApiKey: string;
 anthropicApiKey: string;
 perplexityApiKey: string;
}

// ---------------------------------------------------------------------------
// Job data shape
// ---------------------------------------------------------------------------

interface ScanJobData {
 brandName: string;
 queries: string[];
 platforms: string[];
 competitors?: string[];
 openaiApiKey: string;
 anthropicApiKey: string;
 perplexityApiKey: string;
}

// ---------------------------------------------------------------------------
// Singleton queue
// ---------------------------------------------------------------------------

let scannerQueue: Queue<ScanJobData> | null = null;
let scannerWorker: Worker<ScanJobData> | null = null;

export function getScannerQueue(connection: Parameters<typeof Queue>[0]["connection"]): Queue<ScanJobData> {
 if (!scannerQueue) {
 scannerQueue = new Queue<ScanJobData>("brand-scan-queue", {
 connection,
 defaultJobOptions: {
 attempts: 3,
 backoff: {
 type: "exponential",
 delay: 1000,
 },
 removeOnComplete: {
 count: 100,
 age: 24 * 60 * 60, // 24 hours
 },
 removeOnFail: {
 count: 50,
 age: 7 * 24 * 60 * 60, // 7 days
 },
 },
 });
 }
 return scannerQueue;
}

export function getScannerWorker(connection: Parameters<typeof Worker>[0]["connection"]): Worker<ScanJobData> {
 if (!scannerWorker) {
 scannerWorker = new Worker<ScanJobData>(
 "brand-scan-queue",
 async (job: Job<ScanJobData>) => {
 const { brandName, queries, platforms, competitors = [], openaiApiKey, anthropicApiKey, perplexityApiKey } = job.data;

 await job.updateProgress(10);

 // 1. Multi-platform scan
 const scanJob = await scanBrandAcrossPlatforms(brandName, queries, platforms, {
 openaiApiKey,
 anthropicApiKey,
 perplexityApiKey,
 }, competitors);

 await job.updateProgress(50);

 // 2. Sentiment analysis on each mention
 scanJob.mentions = await analyzeMentionsSentiment(scanJob.mentions, openaiApiKey);
 const sentimentBreakdown = computeSentimentBreakdown(scanJob.mentions);

 await job.updateProgress(70);

 // 3. Compute visibility score
 const visibilityScore = computeVisibilityScore(scanJob.mentions, sentimentBreakdown);
 scanJob.visibilityScore = visibilityScore.total;
 scanJob.sentimentBreakdown = sentimentBreakdown;

 await job.updateProgress(85);

 // 4. Generate narrative
 const narrative = await generateNarrative(scanJob, visibilityScore, openaiApiKey);
 scanJob.narrativeSummary = JSON.stringify(narrative);

 await job.updateProgress(100);

 return scanJob;
 },
 { connection, concurrency: 2 },
 );
 }
 return scannerWorker;
}

// ---------------------------------------------------------------------------
// Enqueue helpers
// ---------------------------------------------------------------------------

export async function enqueueScan(jobData: ScanRequestBody & { competitors?: string[]; apiKeys: { openaiApiKey: string; anthropicApiKey: string; perplexityApiKey: string } }, redisConfig: ScannerQueueConfig["redis"]): Promise<Job<ScanJobData>> {
 const queue = getScannerQueue(redisConfig);
 return queue.add(
 "scan",
 {
 brandName: jobData.brandName,
 queries: jobData.queries,
 platforms: jobData.platforms ?? ["chatgpt", "claude", "perplexity", "google_ai_overview"],
 competitors: jobData.competitors,
 ...jobData.apiKeys,
 },
 {
 jobId: `${jobData.brandName}-${Date.now()}`,
 },
 );
}

export async function getJobStatus(jobId: string, redisConfig: ScannerQueueConfig["redis"]) {
 const queue = getScannerQueue(redisConfig);
 const job = await Job.fromId(queue.client, jobId);
 if (!job) return null;
 return {
 id: job.id,
 progress: await job.progress,
 state: await job.getState(),
 finishedOn: (job as any).finishedOn,
 processedOn: (job as any).processedOn,
 };
}

export async function getJobResult(jobId: string, redisConfig: ScannerQueueConfig["redis"]): Promise<ScanJob | null> {
 const queue = getScannerQueue(redisConfig);
 const job = await Job.fromId(queue.client, jobId);
 if (!job) return null;
 return (await job.returnvalue) as ScanJob | null;
}

// ---------------------------------------------------------------------------
// Graceful shutdown
// ---------------------------------------------------------------------------

export async function closeQueue(): Promise<void> {
 if (scannerQueue) await scannerQueue.close();
 if (scannerWorker) await scannerWorker.close();
}
