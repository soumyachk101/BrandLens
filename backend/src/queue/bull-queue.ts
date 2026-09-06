/**
 * BullMQ Queue Configuration
 *
 * Central configuration for all job queues used in BrandLens.
 * Queues:
 * - scan-queue: AI platform scan jobs
 * - report-queue: Report generation jobs
 * - email-queue: Email delivery jobs
 */

import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

// ─── Queue Configuration ──────────────────────────────────────────────────────

export interface QueueConfig {
 connection: Redis;
 defaultJobOptions: {
 attempts: number;
 backoff: {
 type: 'exponential';
 delay: number;
 };
 removeOnComplete: {
 count: number;
 age: number;
 };
 removeOnFail: {
 count: number;
 age: number;
 };
 };
}

export interface JobDataMap {
 'scan-brand': {
 scanJobId: string;
 brandId: string;
 agencyId: string;
 platforms: string[];
 promptTemplateId?: string;
 queryVariants?: string[];
 triggeredBy: string;
 };
 'process-sentiment': {
 brandId: string;
 mentionIds: string[];
 priority: 'high' | 'normal' | 'low';
 };
 'generate-report': {
 reportId: string;
 brandId: string;
 reportType: string;
 periodStart: string;
 periodEnd: string;
 sendTo?: string[];
 format: string[];
 sections: string[];
 };
 'send-email': {
 emailType: 'report_ready' | 'scan_completed' | 'sentiment_alert' | 'welcome';
 to: string[];
 subject: string;
 html: string;
 text?: string;
 reportId?: string;
 };
 'deliver-webhook': {
 webhookEventId: string;
 agencyId: string;
 eventType: string;
 payload: any;
 targetUrl: string;
 secret: string;
 };
 'refresh-views': {
 viewName: string;
 brandId?: string;
 };
}

export type JobName = keyof JobDataMap;

// ─── Redis Connection ─────────────────────────────────────────────────────────

let redisConnection: Redis | null = null;

/**
 * Gets or creates the Redis connection singleton.
 */
export function getRedisConnection(): Redis {
 if (!redisConnection) {
 const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
 redisConnection = new Redis(url, {
 maxRetriesPerRequest: 3,
 retryStrategy: (times) => {
 const delay = Math.min(times * 200, 2000);
 return delay;
 },
 keepAlive: true,
 connectTimeout: 5000,
 });
 }
 return redisConnection;
}

/**
 * Closes the Redis connection (for graceful shutdown).
 */
export async function closeRedisConnection(): Promise<void> {
 if (redisConnection) {
 await redisConnection.quit();
 redisConnection = null;
 }
}

// ─── Queue Factory ────────────────────────────────────────────────────────────

const queueDefinitions = {
 'scan-queue': {
 defaultJobOptions: {
 attempts: 3,
 backoff: { type: 'exponential' as const, delay: 2000 },
 removeOnComplete: { count: 1000, age: 7 * 24 * 3600 },
 removeOnFail: { count: 500, age: 3 * 24 * 3600 },
 },
 },
 'report-queue': {
 defaultJobOptions: {
 attempts: 2,
 backoff: { type: 'exponential' as const, delay: 5000 },
 removeOnComplete: { count: 500, age: 30 * 24 * 3600 },
 removeOnFail: { count: 200, age: 7 * 24 * 3600 },
 },
 },
 'email-queue': {
 defaultJobOptions: {
 attempts: 5,
 backoff: { type: 'exponential' as const, delay: 1000 },
 removeOnComplete: { count: 2000, age: 7 * 24 * 3600 },
 removeOnFail: { count: 1000, age: 3 * 24 * 3600 },
 },
 },
 'webhook-queue': {
 defaultJobOptions: {
 attempts: 3,
 backoff: { type: 'exponential' as const, delay: 1000 },
 removeOnComplete: { count: 2000, age: 7 * 24 * 3600 },
 removeOnFail: { count: 1000, age: 3 * 24 * 3600 },
 },
 },
 'sentiment-queue': {
 defaultJobOptions: {
 attempts: 3,
 backoff: { type: 'exponential' as const, delay: 3000 },
 removeOnComplete: { count: 1000, age: 7 * 24 * 3600 },
 removeOnFail: { count: 500, age: 3 * 24 * 3600 },
 },
 },
 'view-queue': {
 defaultJobOptions: {
 attempts: 2,
 backoff: { type: 'exponential' as const, delay: 1000 },
 removeOnComplete: { count: 200, age: 7 * 24 * 3600 },
 removeOnFail: { count: 100, age: 24 * 3600 },
 },
 },
};

const queues = new Map<string, Queue>();

/**
 * Gets or creates a BullMQ queue by name.
 */
export function getQueue<K extends JobName>(name: K): any {
 if (!queues.has(name)) {
 const connection = getRedisConnection();
 const def = queueDefinitions[name as string] ?? {};

 const queue = new Queue(name, {
 connection,
 defaultJobOptions: def.defaultJobOptions,
 });

 queues.set(name, queue);
 }
 return queues.get(name);
}

/**
 * Adds a job to a queue.
 */
export async function enqueue<K extends JobName>(
 name: K,
 jobName: string,
 data: JobDataMap[K],
 opts?: { delay?: number; priority?: number; removeOnComplete?: boolean },
): Promise<any> {
 const queue = getQueue(name);

 const jobOptions: any = {};
 if (opts?.delay) jobOptions.delay = opts.delay;
 if (opts?.priority !== undefined) jobOptions.priority = opts.priority;
 if (opts?.removeOnComplete) jobOptions.removeOnComplete = true;

 return queue.add(jobName, data, jobOptions);
}

// ─── Worker Setup ─────────────────────────────────────────────────────────────

export interface WorkerConfig<
 T extends JobName,
 TProcessFn = (job: any) => Promise<any>,
> {
 queueName: T;
 concurrency: number;
 processor: TProcessFn;
}

export function createWorker<T extends JobName>(
 config: WorkerConfig<T>,
): Worker<JobDataMap[T]> {
 const connection = getRedisConnection();

 return new Worker(config.queueName, config.processor as any, {
 connection,
 concurrency: config.concurrency,
 limiter: {
 max: 100,
 duration: 1000,
 },
 });
}

// ─── Queue Health ─────────────────────────────────────────────────────────────

export interface QueueHealth {
 name: string;
 waiting: number;
 active: number;
 completed: number;
 failed: number;
 delayed: number;
 isHealthy: boolean;
}

/**
 * Checks the health status of all queues.
 */
export async function checkQueueHealth(): Promise<QueueHealth[]> {
 const health: QueueHealth[] = [];

 for (const [name, queue] of queues) {
 const [waiting, active, completed, failed, delayed] = await Promise.all([
 queue.getWaitingCount(),
 queue.getActiveCount(),
 queue.getCompletedCount(),
 queue.getFailedCount(),
 queue.getDelayedCount(),
 ]);

 health.push({
 name,
 waiting,
 active,
 completed,
 failed,
 delayed,
 isHealthy: active < 100 && failed < 50,
 });
 }

 return health;
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

export async function closeAllQueues(): Promise<void> {
 const closePromises: Promise<void>[] = [];
 for (const queue of queues.values()) {
 closePromises.push(queue.close().catch(() => {}));
 }
 await Promise.all(closePromises);
 queues.clear();
 await closeRedisConnection();
}
