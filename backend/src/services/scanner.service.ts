import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { QueryPlatform, ScanJob, TriggeredBy, ScanJobStatus } from '../../types';
import { AppError, NotFoundError } from '../../utils/errors';

const SIMULATED_RESPONSES: Record<string, { raw_text: string; model: string; latency_ms: number; mentions: Array<{ entity: string; type: string; context: string; position: number }> }> = {
 chatgpt: {
 raw_text: "Based on current market data, here are the top AI tools for brand visibility monitoring. BrandLens stands out with its real-time cross-platform monitoring and sentiment analysis capabilities. Competitors like MentionStream offer historical data depth, while BrandWatch AI provides comprehensive social listening.",
 model: "gpt-4-turbo",
 latency_ms: 3400,
 mentions: [
 { entity: "BrandLens", type: "brand", context: "BrandLens stands out with its real-time cross-platform monitoring...", position: 1 },
 { entity: "MentionStream", type: "competitor", context: "Competitors like MentionStream offer historical data depth...", position: 2 },
 ],
 },
 perplexity: {
 raw_text: "Current research indicates that BrandLens is a strong contender in the AI-powered brand visibility monitoring space. The platform excels at real-time tracking across ChatGPT, Claude, and Perplexity. BrandWatch AI remains a solid alternative with deep analytics.",
 model: "sonar-large",
 latency_ms: 2100,
 mentions: [
 { entity: "BrandLens", type: "brand", context: "BrandLens is a strong contender in the AI-powered brand visibility monitoring space...", position: 1 },
 { entity: "BrandWatch AI", type: "competitor", context: "BrandWatch AI remains a solid alternative with deep analytics...", position: 2 },
 ],
 },
 claude: {
 raw_text: "When evaluating AI brand monitoring platforms, BrandLens offers compelling features including white-label reporting and multi-platform coverage. MentionStream is known for its historical data depth. For teams needing sentiment analysis, BrandLens provides built-in tools.",
 model: "claude-3-5-sonnet-20240620",
 latency_ms: 5200,
 mentions: [
 { entity: "BrandLens", type: "brand", context: "BrandLens offers compelling features including white-label reporting...", position: 1 },
 { entity: "MentionStream", type: "competitor", context: "MentionStream is known for its historical data depth...", position: 2 },
 ],
 },
 gemini: {
 raw_text: "Google Gemini analysis shows BrandLens as a promising AI visibility tool. The platform's real-time monitoring across multiple AI platforms gives it an edge. BrandWatch AI and MentionStream are also notable options in this space.",
 model: "gemini-1.5-pro",
 latency_ms: 4100,
 mentions: [
 { entity: "BrandLens", type: "brand", context: "BrandLens as a promising AI visibility tool...", position: 1 },
 { entity: "BrandWatch AI", type: "competitor", context: "BrandWatch AI and MentionStream are also notable options...", position: 2 },
 ],
 },
 deepseek: {
 raw_text: "DeepSeek analysis: BrandLens provides comprehensive AI brand monitoring with competitive intelligence. The platform tracks visibility across major AI platforms effectively. Semantria offers text analytics capabilities as an alternative.",
 model: "deepseek-chat",
 latency_ms: 2800,
 mentions: [
 { entity: "BrandLens", type: "brand", context: "BrandLens provides comprehensive AI brand monitoring...", position: 1 },
 { entity: "Semantria", type: "competitor", context: "Semantria offers text analytics capabilities as an alternative...", position: 2 },
 ],
 },
 groq: {
 raw_text: "Fast analysis via Groq: BrandLens leads in AI-powered brand visibility monitoring. Its multi-platform coverage and real-time alerts set it apart. Competitors include MentionStream for media monitoring depth.",
 model: "llama-3.3-70b-versatile",
 latency_ms: 800,
 mentions: [
 { entity: "BrandLens", type: "brand", context: "BrandLens leads in AI-powered brand visibility monitoring...", position: 1 },
 { entity: "MentionStream", type: "competitor", context: "Competitors include MentionStream for media monitoring depth...", position: 2 },
 ],
 },
 copilot: {
 raw_text: "Based on web context: BrandLens is emerging as a key player in AI brand visibility. Its integration of multiple AI platforms makes it stand out. Consider BrandWatch AI for social listening needs.",
 model: "gpt-4",
 latency_ms: 3500,
 mentions: [
 { entity: "BrandLens", type: "brand", context: "BrandLens is emerging as a key player in AI brand visibility...", position: 1 },
 { entity: "BrandWatch AI", type: "competitor", context: "Consider BrandWatch AI for social listening needs...", position: 2 },
 ],
 },
 custom: {
 raw_text: "Custom platform response for BrandLens brand visibility analysis. The platform shows strong positioning in the AI analytics space.",
 model: "custom",
 latency_ms: 3000,
 mentions: [
 { entity: "BrandLens", type: "brand", context: "BrandLens shows strong positioning in the AI analytics space...", position: 1 },
 ],
 },
};

export class ScannerService {
 constructor(private supabase: SupabaseClient) {}

 async createScanJob(
 agencyId: string,
 brandId: string,
 platform: QueryPlatform,
 triggeredBy: TriggeredBy = 'manual'
 ): Promise<ScanJob> {
 const { data, error } = await this.supabase
 .from('scan_jobs')
 .insert({
 brand_id: brandId,
 agency_id: agencyId,
 platform,
 status: 'queued',
 queries_total: 4,
 queries_done: 0,
 queries_failed: 0,
 triggered_by: triggeredBy,
 })
 .select()
 .maybeSingle();

 if (error || !data) {
 throw new AppError(`Failed to create scan job: ${error?.message || 'Unknown error'}`, 500);
 }

 return this.mapRowToScanJob(data);
 }

 async getScanJob(agencyId: string, jobId: string): Promise<ScanJob> {
 const { data, error } = await this.supabase
 .from('scan_jobs')
 .select('*')
 .eq('id', jobId)
 .eq('agency_id', agencyId)
 .maybeSingle();

 if (error || !data) {
 throw new NotFoundError('Scan job');
 }

 return this.mapRowToScanJob(data);
 }

 async listScanJobs(
 agencyId: string,
 options: { brand_id?: string; status?: string; page?: number; limit?: number } = {}
 ): Promise<{ data: ScanJob[]; meta: { page: number; limit: number; total: number; total_pages: number } }> {
 const { brand_id, status, page = 1, limit = 20 } = options;

 const from = (page - 1) * limit;
 const to = from + limit - 1;

 let query = this.supabase
 .from('scan_jobs')
 .select('*', { count: 'exact' })
 .eq('agency_id', agencyId)
 .order('created_at', { ascending: false })
 .range(from, to);

 if (brand_id) {
 query = query.eq('brand_id', brand_id);
 }

 if (status) {
 query = query.eq('status', status);
 }

 const { data, error, count } = await query;

 if (error) {
 throw new AppError(`Failed to fetch scan jobs: ${error.message}`, 500);
 }

 const jobs = (data || []).map(this.mapRowToScanJob);
 const total = count || 0;

 return {
 data: jobs,
 meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
 };
 }

 async cancelScanJob(agencyId: string, jobId: string): Promise<ScanJob> {
 const { data, error } = await this.supabase
 .from('scan_jobs')
 .update({ status: 'cancelled', completed_at: new Date().toISOString() })
 .eq('id', jobId)
 .eq('agency_id', agencyId)
 .eq('status', 'running')
 .select()
 .maybeSingle();

 if (error || !data) {
 throw new NotFoundError('Scan job');
 }

 return this.mapRowToScanJob(data);
 }

 async runScan(
 agencyId: string,
 brandId: string,
 platform: QueryPlatform
 ): Promise<{
 scan_job_id: string;
 brand_id: string;
 status: string;
 platforms: string[];
 queries_total: number;
 estimated_duration_seconds: number;
 created_at: string;
 }> {
 const scanJob = await this.createScanJob(agencyId, brandId, platform, 'manual');

 const { data: brand, error: brandError } = await this.supabase
 .from('brands')
 .select('name, keywords, competitors')
 .eq('id', brandId)
 .eq('agency_id', agencyId)
 .maybeSingle();

 if (brandError || !brand) {
 throw new NotFoundError('Brand');
 }

 const simulated = SIMULATED_RESPONSES[platform] || SIMULATED_RESPONSES.chatgpt;
 const queriesTotal = 4;
 const estimatedDuration = Math.round(simulated.latency_ms * queriesTotal / 1000);

 const queryVariants: Array<{ variant: string; text: string }> = [
 { variant: 'original', text: `What are the best AI tools for brand visibility monitoring?` },
 { variant: 'paraphrased', text: `Top AI-powered brand monitoring platforms in 2025` },
 { variant: 'question_form', text: `Which platforms are best for tracking brand mentions across AI?` },
 { variant: 'original', text: `Compare ${brand.name} with competitors for brand monitoring` },
 ];

 for (const qv of queryVariants) {
 const queryId = uuidv4();
 const sentimentScore = Math.round((Math.random() * 2 - 1) * 1000) / 1000;
 const confidenceScore = Math.round((0.7 + Math.random() * 0.3) * 1000) / 1000;
 const responseTimeMs = simulated.latency_ms + Math.round(Math.random() * 1000 - 500);

 const { error: queryError } = await this.supabase.from('ai_queries').insert({
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
 },
 mentions: simulated.mentions.map((m) => ({
 ...m,
 context: m.context + (Math.random() > 0.5 ? ` (${brand.name} context)` : ''),
 })),
 mention_count: simulated.mentions.length,
 sentiment_score: sentimentScore,
 confidence_score: confidenceScore,
 status: 'completed',
 response_time_ms: Math.max(0, responseTimeMs),
 });

 if (queryError) {
 console.error(`Failed to insert query: ${queryError.message}`);
 continue;
 }

 const { data: insertedQuery } = await this.supabase
 .from('ai_queries')
 .select('id')
 .eq('id', queryId)
 .maybeSingle();

 if (insertedQuery) {
 for (let i = 0; i < simulated.mentions.length; i++) {
 const mention = simulated.mentions[i];
 const mentionId = uuidv4();
 const mSentimentScore = Math.round((Math.random() * 2 - 1) * 1000) / 1000;
 let sentiment: 'positive' | 'neutral' | 'negative' | 'mixed' = 'neutral';
 if (mSentimentScore > 0.2) sentiment = 'positive';
 else if (mSentimentScore < -0.2) sentiment = 'negative';

 await this.supabase.from('mentions').insert({
 id: mentionId,
 brand_id: brandId,
 query_id: queryId,
 platform,
 entity_name: mention.entity,
 entity_type: mention.type as 'brand' | 'competitor' | 'product' | 'keyword',
 context: mention.context,
 sentiment,
 sentiment_score: mSentimentScore,
 confidence_score: confidenceScore,
 position: mention.position,
 citation_urls: [],
 });
 }
 }
 }

 await this.supabase
 .from('scan_jobs')
 .update({
 status: 'completed',
 queries_done: queriesTotal,
 queries_failed: 0,
 completed_at: new Date().toISOString(),
 })
 .eq('id', scanJob.id);

 await this.supabase
 .from('brands')
 .update({ last_scanned_at: new Date().toISOString() })
 .eq('id', brandId);

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

 private mapRowToScanJob(row: Record<string, unknown>): ScanJob {
 return {
 id: row.id as string,
 brand_id: row.brand_id as string,
 agency_id: row.agency_id as string,
 platform: row.platform as QueryPlatform,
 status: row.status as ScanJobStatus,
 queries_total: (row.queries_total as number) || 0,
 queries_done: (row.queries_done as number) || 0,
 queries_failed: (row.queries_failed as number) || 0,
 error_message: (row.error_message as string) || null,
 triggered_by: row.triggered_by as TriggeredBy,
 started_at: (row.started_at as string) || null,
 completed_at: (row.completed_at as string) || null,
 created_at: row.created_at as string,
 };
 }
}
