import cron from 'node-cron';
import { getServiceRoleClient } from '../utils/supabase';
import { enqueueScan } from '../queues';
import { config } from '../config/env';

const supabase = getServiceRoleClient();

const scanSchedules: Record<string, string> = {
 hourly: '0 * * * *',
 daily: '0 6 * * *',
 weekly: '0 6 * * 1',
};

async function startScheduler() {
 console.log('[INFO] Starting BrandLens scan scheduler...');

 cron.schedule(scanSchedules.hourly, async () => {
 console.log('[SCHEDULER] Running hourly scan check');
 await runDueScans('hourly');
 });

 cron.schedule(scanSchedules.daily, async () => {
 console.log('[SCHEDULER] Running daily scan check');
 await runDueScans('daily');
 });

 cron.schedule(scanSchedules.weekly, async () => {
 console.log('[SCHEDULER] Running weekly scan check');
 await runDueScans('weekly');
 });

 console.log('[INFO] Scheduler started with cron jobs');
}

async function runDueScans(frequency: string): Promise<void> {
 try {
 const { data: brands, error } = await supabase
 .from('brands')
 .select('id, agency_id, name, scan_frequency, last_scanned_at, competitors')
 .eq('is_active', true)
 .eq('scan_frequency', frequency);

 if (error) {
 console.error(`[ERROR] Failed to fetch brands for ${frequency} scan:`, error);
 return;
 }

 if (!brands || brands.length === 0) {
 console.log(`[SCHEDULER] No brands due for ${frequency} scan`);
 return;
 }

 const platforms = ['chatgpt', 'perplexity', 'claude', 'gemini'];

 for (const brand of brands) {
 const platformsToScan = platforms;

 for (const platform of platformsToScan) {
 try {
 await enqueueScan(brand.id, brand.agency_id, platform);
 console.log(`[SCHEDULER] Enqueued scan for brand ${brand.name} (${brand.id}) on ${platform}`);
 } catch (err) {
 console.error(`[ERROR] Failed to enqueue scan for brand ${brand.id} on ${platform}:`, err);
 }
 }
 }

 console.log(`[SCHEDULER] Enqueued ${brands.length * platforms.length} scan jobs for ${frequency} scan`);
 } catch (err) {
 console.error(`[ERROR] Scheduler error for ${frequency} scan:`, err);
 }
}

startScheduler();
