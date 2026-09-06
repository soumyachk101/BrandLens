import { Queue, Worker, Job } from 'bullmq';
import { config } from '../config/env';
import { getServiceRoleClient } from '../utils/supabase';

export const scanQueue = new Queue('scan-queue', {
 connection: { url: config.redis.url },
 defaultJobOptions: {
 removeOnComplete: { count: 1000, age: 7 * 24 * 3600 },
 removeOnFail: { count: 500, age: 3 * 24 * 3600 },
 attempts: 3,
 backoff: { type: 'exponential', delay: 2000 },
 },
});

export const reportQueue = new Queue('report-queue', {
 connection: { url: config.redis.url },
 defaultJobOptions: {
 removeOnComplete: { count: 500, age: 7 * 24 * 3600 },
 removeOnFail: { count: 200, age: 3 * 24 * 3600 },
 attempts: 2,
 backoff: { type: 'exponential', delay: 5000 },
 },
});

export const emailQueue = new Queue('email-queue', {
 connection: { url: config.redis.url },
 defaultJobOptions: {
 removeOnComplete: { count: 1000, age: 24 * 3600 },
 removeOnFail: { count: 500, age: 24 * 3600 },
 attempts: 3,
 backoff: { type: 'exponential', delay: 1000 },
 },
});

export const webhookQueue = new Queue('webhook-queue', {
 connection: { url: config.redis.url },
 defaultJobOptions: {
 removeOnComplete: { count: 1000, age: 7 * 24 * 3600 },
 removeOnFail: { count: 500, age: 3 * 24 * 3600 },
 attempts: 3,
 backoff: { type: 'exponential', delay: 1000 },
 },
});

export const sentimentQueue = new Queue('sentiment-queue', {
 connection: { url: config.redis.url },
 defaultJobOptions: {
 removeOnComplete: { count: 2000, age: 24 * 3600 },
 removeOnFail: { count: 1000, age: 24 * 3600 },
 attempts: 2,
 backoff: { type: 'fixed', delay: 3000 },
 },
});

export async function enqueueScan(brandId: string, agencyId: string, platform: string): Promise<string> {
 const job = await scanQueue.add('run-scan', { brandId, agencyId, platform }, {
 jobId: `scan:${brandId}:${platform}:${Date.now()}`,
 priority: 5,
 });
 return job.id || '';
}

export async function enqueueReport(reportId: string, brandId: string, period: { start: string; end: string }, format: string[], sendTo: string[]): Promise<string> {
 const job = await reportQueue.add('generate-report', { reportId, brandId, period, format, sendTo }, {
 priority: 3,
 });
 return job.id || '';
}

export async function closeAllQueues(): Promise<void> {
 await Promise.all([
 scanQueue.close(),
 reportQueue.close(),
 emailQueue.close(),
 webhookQueue.close(),
 sentimentQueue.close(),
 ]);
}
