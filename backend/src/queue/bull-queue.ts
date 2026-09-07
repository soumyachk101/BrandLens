import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { config } from '../../config/env';

let redisConnection: Redis | null = null;

function getRedisConnection(): Redis {
 if (!redisConnection) {
 redisConnection = new Redis(config.redis.url, {
 maxRetriesPerRequest: 3,
 retryStrategy: (times: number) => {
 const delay = Math.min(times * 200, 2000);
 return delay;
 },
 keepAlive: true,
 connectTimeout: 5000,
 });
 }
 return redisConnection;
}

export interface QueueConfig {
 defaultJobOptions: {
 attempts: number;
 backoff: { type: 'exponential' | 'fixed'; delay: number };
 removeOnComplete: { count: number; age: number };
 removeOnFail: { count: number; age: number };
 };
}

const queueConfigs: Record<string, QueueConfig> = {
 'scan-queue': {
 defaultJobOptions: {
 attempts: 3,
 backoff: { type: 'exponential', delay: 2000 },
 removeOnComplete: { count: 1000, age: 7 * 24 * 3600 },
 removeOnFail: { count: 500, age: 3 * 24 * 3600 },
 },
 },
 'report-queue': {
 defaultJobOptions: {
 attempts: 2,
 backoff: { type: 'exponential', delay: 5000 },
 removeOnComplete: { count: 500, age: 30 * 24 * 3600 },
 removeOnFail: { count: 200, age: 7 * 24 * 3600 },
 },
 },
 'email-queue': {
 defaultJobOptions: {
 attempts: 5,
 backoff: { type: 'exponential', delay: 1000 },
 removeOnComplete: { count: 2000, age: 7 * 24 * 3600 },
 removeOnFail: { count: 1000, age: 3 * 24 * 3600 },
 },
 },
 'webhook-queue': {
 defaultJobOptions: {
 attempts: 3,
 backoff: { type: 'exponential', delay: 1000 },
 removeOnComplete: { count: 1000, age: 7 * 24 * 3600 },
 removeOnFail: { count: 500, age: 3 * 24 * 3600 },
 },
 },
 'sentiment-queue': {
 defaultJobOptions: {
 attempts: 2,
 backoff: { type: 'fixed', delay: 3000 },
 removeOnComplete: { count: 2000, age: 24 * 3600 },
 removeOnFail: { count: 1000, age: 24 * 3600 },
 },
 },
};

const queues = new Map<string, Queue>();

export function getQueue(name: string): Queue {
 if (!queues.has(name)) {
 const connection = getRedisConnection();
 const def = queueConfigs[name] ?? {
 defaultJobOptions: {
 attempts: 2,
 backoff: { type: 'exponential', delay: 3000 },
 removeOnComplete: { count: 500, age: 7 * 24 * 3600 },
 removeOnFail: { count: 200, age: 3 * 24 * 3600 },
 },
 };

 const queue = new Queue(name, {
 connection,
 defaultJobOptions: def.defaultJobOptions,
 });

 queues.set(name, queue);
 }
 return queues.get(name)!;
}

export async function closeAllQueues(): Promise<void> {
 const closePromises: Promise<void>[] = [];
 for (const queue of queues.values()) {
 closePromises.push(queue.close().catch(() => {}));
 }
 await Promise.all(closePromises);
 queues.clear();
 if (redisConnection) {
 await redisConnection.quit();
 redisConnection = null;
 }
}