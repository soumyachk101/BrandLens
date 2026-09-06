/**
 * Cron Jobs & Scheduled Scanner
 *
 * Uses node-cron to schedule recurring brand visibility scans.
 * Supports daily and weekly scan frequencies.
 */

import cron from "node-cron";
import type { ScanJob } from "../types.js";
import { getScannerQueue } from "../queue/scanner-queue.js";
import { scanBrandAcrossPlatforms } from "../ai/multi-platform-scanner.js";
import { analyzeMentionsSentiment, computeSentimentBreakdown } from "../ai/sentiment-analyzer.js";
import { computeVisibilityScore } from "../ai/visibility-scorer.js";
import { generateNarrative } from "../ai/report-narrator.js";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface CronConfig {
 redis: {
 host: string;
 port: number;
 };
 openaiApiKey: string;
 anthropicApiKey: string;
 perplexityApiKey: string;
}

interface ScheduledBrand {
 id: string;
 brandName: string;
 queries: string[];
 platforms: string[];
 competitors: string[];
 frequency: "daily" | "weekly";
 lastRunAt?: string;
}

// ---------------------------------------------------------------------------
// In-memory schedule registry (swap for DB in production)
// ---------------------------------------------------------------------------

const scheduledBrands: ScheduledBrand[] = [];
const cronTasks = new Map<string, cron.ScheduledTask>();

// ---------------------------------------------------------------------------
// Schedule management
// ---------------------------------------------------------------------------

export function addScheduledBrand(brand: Omit<ScheduledBrand, "id">): ScheduledBrand {
 const newBrand: ScheduledBrand = { ...brand, id: crypto.randomUUID() };
 scheduledBrands.push(newBrand);
 scheduleCronJob(newBrand);
 return newBrand;
}

export function removeScheduledBrand(id: string): boolean {
 const idx = scheduledBrands.findIndex((b) => b.id === id);
 if (idx === -1) return false;
 const removed = scheduledBrands.splice(idx, 1)[0];
 const task = cronTasks.get(id);
 if (task) {
 task.stop();
 cronTasks.delete(id);
 }
 return true;
}

export function listScheduledBrands(): ScheduledBrand[] {
 return [...scheduledBrands];
}

// ---------------------------------------------------------------------------
// Cron scheduling
// ---------------------------------------------------------------------------

function scheduleCronJob(brand: ScheduledBrand): void {
 const existing = cronTasks.get(brand.id);
 if (existing) {
 existing.stop();
 }

 // Daily at 06:00 AM, Weekly on Monday at 06:00 AM
 const cronPattern = brand.frequency === "daily" ? "0 6 * * *" : "0 6 * * 1";

 const task = cron.schedule(cronPattern, async () => {
 console.log(`[cron] Running scheduled scan for "${brand.brandName}" (${brand.frequency})`);
 await runScheduledScan(brand);
 });

 cronTasks.set(brand.id, task);
}

// ---------------------------------------------------------------------------
// Scan execution
// ---------------------------------------------------------------------------

export async function runScheduledScan(brand: ScheduledBrand): Promise<ScanJob> {
 const config: CronConfig = {
 redis: { host: process.env.REDIS_HOST ?? "localhost", port: parseInt(process.env.REDIS_PORT ?? "6379") },
 openaiApiKey: process.env.OPENAI_API_KEY ?? "",
 anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
 perplexityApiKey: process.env.PERPLEXITY_API_KEY ?? "",
 };

 // Use BullMQ if Redis is available, otherwise run inline
 const redisAvailable = process.env.USE_REDIS === "true";

 if (redisAvailable) {
 const queue = getScannerQueue(config.redis);
 const job = await queue.add(
 "scheduled-scan",
 {
 brandName: brand.brandName,
 queries: brand.queries,
 platforms: brand.platforms,
 competitors: brand.competitors,
 openaiApiKey: config.openaiApiKey,
 anthropicApiKey: config.anthropicApiKey,
 perplexityApiKey: config.perplexityApiKey,
 },
 { jobId: `scheduled-${brand.id}-${Date.now()}` },
 );
 return (await job.returnvalue) as ScanJob;
 }

 // Inline execution (no Redis)
 const scanJob = await scanBrandAcrossPlatforms(
 brand.brandName,
 brand.queries,
 brand.platforms,
 {
 openaiApiKey: config.openaiApiKey,
 anthropicApiKey: config.anthropicApiKey,
 perplexityApiKey: config.perplexityApiKey,
 },
 brand.competitors,
 );

 scanJob.mentions = await analyzeMentionsSentiment(scanJob.mentions, config.openaiApiKey);
 const sentimentBreakdown = computeSentimentBreakdown(scanJob.mentions);
 scanJob.visibilityScore = computeVisibilityScore(scanJob.mentions, sentimentBreakdown).total;
 scanJob.sentimentBreakdown = sentimentBreakdown;
 scanJob.narrativeSummary = JSON.stringify(
 await generateNarrative(scanJob, computeVisibilityScore(scanJob.mentions, sentimentBreakdown), config.openaiApiKey),
 );

 // Update last run
 const scheduled = scheduledBrands.find((b) => b.id === brand.id);
 if (scheduled) {
 scheduled.lastRunAt = new Date().toISOString();
 }

 return scanJob;
}

// ---------------------------------------------------------------------------
// Manual trigger
// ---------------------------------------------------------------------------

export async function triggerManualScan(brandName: string, queries: string[], platforms: string[] = ["chatgpt", "claude", "perplexity", "google_ai_overview"]): Promise<ScanJob> {
 const config: CronConfig = {
 redis: { host: process.env.REDIS_HOST ?? "localhost", port: parseInt(process.env.REDIS_PORT ?? "6379") },
 openaiApiKey: process.env.OPENAI_API_KEY ?? "",
 anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
 perplexityApiKey: process.env.PERPLEXITY_API_KEY ?? "",
 };

 if (process.env.USE_REDIS === "true") {
 const queue = getScannerQueue(config.redis);
 const job = await queue.add(
 "manual-scan",
 {
 brandName,
 queries,
 platforms,
 competitors: [],
 openaiApiKey: config.openaiApiKey,
 anthropicApiKey: config.anthropicApiKey,
 perplexityApiKey: config.perplexityApiKey,
 },
 { jobId: `manual-${brandName}-${Date.now()}` },
 );
 return (await job.returnvalue) as ScanJob;
 }

 const scanJob = await scanBrandAcrossPlatforms(brandName, queries, platforms, config);
 scanJob.mentions = await analyzeMentionsSentiment(scanJob.mentions, config.openaiApiKey);
 const breakdown = computeSentimentBreakdown(scanJob.mentions);
 scanJob.visibilityScore = computeVisibilityScore(scanJob.mentions, breakdown).total;
 scanJob.sentimentBreakdown = breakdown;
 scanJob.narrativeSummary = JSON.stringify(
 await generateNarrative(scanJob, computeVisibilityScore(scanJob.mentions, breakdown), config.openaiApiKey),
 );
 return scanJob;
}

// ---------------------------------------------------------------------------
// Start all scheduled jobs (call at server boot)
// ---------------------------------------------------------------------------

export function startAllCronJobs(): void {
 for (const brand of scheduledBrands) {
 scheduleCronJob(brand);
 }
 console.log(`[cron] Started ${cronTasks.size} scheduled scan jobs.`);
}
