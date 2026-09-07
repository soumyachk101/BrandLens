import cron from 'node-cron';
import { getServiceRoleClient } from '../utils/supabase';
import { getQueue } from '../queue/bull-queue';
import { logger } from '../monitoring/logger';

const supabase = getServiceRoleClient();

const scanSchedules: Record<string, string> = {
 hourly: '0 * * * *',
 daily: '0 6 * * *',
 weekly: '0 6 * * 1',
};

async function startScheduler(): Promise<void> {
 logger.info('Starting BrandLens scan scheduler...');

 cron.schedule(scanSchedules.hourly, async () => {
 logger.info('Running hourly scan check');
 await runDueScans('hourly');
 });

 cron.schedule(scanSchedules.daily, async () => {
 logger.info('Running daily scan check');
 await runDueScans('daily');
 });

 cron.schedule(scanSchedules.weekly, async () => {
 logger.info('Running weekly scan check');
 await runDueScans('weekly');
 });

 logger.info('Scheduler started with cron jobs');
}

async function runDueScans(frequency: string): Promise<void> {
 try {
 const { data: brands, error } = await supabase!
 .from('brands')
 .select('id, agency_id, name, scan_frequency, last_scanned_at, competitors')
 .eq('is_active', true)
 .eq('scan_frequency', frequency);

 if (error) {
 logger.error({ frequency, error }, `Failed to fetch brands for ${frequency} scan`);
 return;
 }

 if (!brands || brands.length === 0) {
 logger.debug({ frequency }, `No brands due for ${frequency} scan`);
 return;
 }

 const platforms = ['chatgpt', 'perplexity', 'claude', 'gemini'];
 const scanQueue = getQueue('scan-queue');

 for (const brand of brands) {
 for (const platform of platforms) {
 try {
 await scanQueue.add(
 'run-scan',
 { brandId: brand.id, agencyId: brand.agency_id, platform },
 { jobId: `scan:${brand.id}:${platform}:${Date.now()}` },
 );
 logger.info({ brandId: brand.id, brandName: brand.name, platform }, `Enqueued scan`);
 } catch (err) {
 logger.error({ brandId: brand.id, platform, error: err }, `Failed to enqueue scan`);
 }
 }
 }

 logger.info({ count: brands.length * platforms.length, frequency }, `Enqueued scan jobs`);
 } catch (err) {
 logger.error({ frequency, error: err }, `Scheduler error for ${frequency} scan`);
 }
}

process.on('SIGINT', () => {
 logger.info('Shutting down scheduler...');
 process.exit(0);
});

process.on('SIGTERM', () => {
 logger.info('Shutting down scheduler...');
 process.exit(0);
});

startScheduler().catch((err) => {
 logger.error({ error: err }, 'Failed to start scheduler');
 process.exit(1);
});