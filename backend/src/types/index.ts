import { Platform as AIPlatform, ScanJob as ScannerScanJob } from './ai';

// ─── Core Entity Types ──────────────────────────────────────────────────────────

export type PlanType = 'starter' | 'growth' | 'enterprise';

export type ScanFrequency = 'hourly' | 'daily' | 'weekly' | 'manual';

export type QueryPlatform =
 | 'chatgpt'
 | 'perplexity'
 | 'claude'
 | 'gemini'
 | 'copilot'
 | 'deepseek'
 | 'groq'
 | 'custom';

export type QueryStatus = 'pending' | 'running' | 'completed' | 'failed' | 'timeout';

export type QueryVariant = 'original' | 'paraphrased' | 'question_form';

export type EntityType = 'brand' | 'competitor' | 'product' | 'keyword';

export type SentimentType = 'positive' | 'neutral' | 'negative' | 'mixed';

export type ReportType = 'weekly' | 'monthly' | 'quarterly' | 'custom' | 'competitor' | 'sentiment';

export type ReportStatus = 'generating' | 'completed' | 'failed' | 'sent';

export type SubscriptionStatus =
 | 'active'
 | 'trialing'
 | 'past_due'
 | 'canceled'
 | 'unpaid'
 | 'incomplete';

export type DeliveryStatus = 'pending' | 'sent' | 'failed' | 'retrying';

export type TriggeredBy = 'scheduled' | 'manual' | 'webhook' | 'api';

export type ScanJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export type PromptTemplatePlatform = 'chatgpt' | 'perplexity' | 'claude' | 'gemini' | 'deepseek' | 'groq' | 'copilot' | 'custom';

// ─── Agency ────────────────────────────────────────────────────────────────────

export interface Agency {
 id: string;
 name: string;
 email: string;
 password_hash: string;
 plan: PlanType;
 white_label_config: Record<string, unknown>;
 api_key: string | null;
 email_verified: boolean;
 last_login_at: string | null;
 created_at: string;
 updated_at: string;
}

// ─── Brand ─────────────────────────────────────────────────────────────────────

export interface BrandKeyword {
 term: string;
 type: 'brand' | 'product' | 'category';
 weight: number;
}

export interface BrandCompetitor {
 name: string;
 keywords: string[];
}

export interface Brand {
 id: string;
 agency_id: string;
 name: string;
 industry: string | null;
 description: string | null;
 website_url: string | null;
 logo_url: string | null;
 keywords: BrandKeyword[];
 competitors: BrandCompetitor[];
 scan_frequency: ScanFrequency;
 is_active: boolean;
 last_scanned_at: string | null;
 visibility_score: number | null;
 total_mentions: number | null;
 created_at: string;
 updated_at: string;
}

// ─── AI Query ──────────────────────────────────────────────────────────────────

export interface AiQuery {
 id: string;
 brand_id: string;
 platform: QueryPlatform;
 query_text: string;
 query_variant: QueryVariant;
 prompt_template_id: string | null;
 ai_response: {
 raw_text: string;
 model: string;
 tokens_used: number;
 latency_ms: number;
 citations: string[];
 [key: string]: unknown;
 };
 mentions: ParsedMention[];
 mention_count: number;
 sentiment_score: number | null;
 confidence_score: number | null;
 status: QueryStatus;
 error_message: string | null;
 response_time_ms: number | null;
 created_at: string;
}

export interface ParsedMention {
 entity: string;
 type: EntityType;
 context: string;
 position: number;
 citation_urls: string[];
}

// ─── Mention ───────────────────────────────────────────────────────────────────

export interface Mention {
 id: string;
 brand_id: string;
 query_id: string;
 platform: string;
 entity_name: string;
 entity_type: EntityType;
 context: string;
 sentiment: SentimentType;
 sentiment_score: number | null;
 confidence_score: number | null;
 position: number | null;
 citation_urls: string[];
 created_at: string;
}

// ─── Competitor ────────────────────────────────────────────────────────────────

export interface CompetitorInfo {
 id: string;
 brand_id: string;
 competitor_name: string;
 mention_count: number;
 visibility_score: number;
 avg_sentiment_score: number | null;
 last_mentioned_at: string | null;
 created_at: string;
 updated_at: string;
}

// ─── Report ────────────────────────────────────────────────────────────────────

export interface Report {
 id: string;
 brand_id: string;
 report_type: ReportType;
 period_start: string;
 period_end: string;
 data: Record<string, unknown>;
 pdf_url: string | null;
 html_url: string | null;
 status: ReportStatus;
 sent_at: string | null;
 sent_to: string[];
 created_at: string;
 updated_at: string;
}

// ─── Subscription ──────────────────────────────────────────────────────────────

export interface Subscription {
 id: string;
 agency_id: string;
 stripe_customer_id: string | null;
 stripe_subscription_id: string | null;
 plan: PlanType;
 status: SubscriptionStatus;
 current_period_start: string;
 current_period_end: string;
 cancel_at_period_end: boolean;
 trial_ends_at: string | null;
 metadata: Record<string, unknown>;
 created_at: string;
 updated_at: string;
}

// ─── Prompt Template ───────────────────────────────────────────────────────────

export interface PromptTemplate {
 id: string;
 brand_id: string | null;
 agency_id: string | null;
 name: string;
 description: string | null;
 template: string;
 variables: string[];
 platform: PromptTemplatePlatform;
 is_default: boolean;
 is_active: boolean;
 created_at: string;
 updated_at: string;
}

// ─── Scan Job ──────────────────────────────────────────────────────────────────

export interface ScanJob {
 id: string;
 brand_id: string | null;
 agency_id: string;
 platform: string;
 status: ScanJobStatus;
 queries_total: number;
 queries_done: number;
 queries_failed: number;
 error_message: string | null;
 triggered_by: TriggeredBy;
 started_at: string | null;
 completed_at: string | null;
 created_at: string;
}

// ─── Webhook Event ─────────────────────────────────────────────────────────────

export interface WebhookEvent {
 id: string;
 agency_id: string;
 event_type: string;
 payload: Record<string, unknown>;
 delivery_status: DeliveryStatus;
 response_code: number | null;
 response_body: string | null;
 retry_count: number;
 next_retry_at: string | null;
 created_at: string;
 sent_at: string | null;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export interface AuthUser {
 id: string;
 agency_id: string;
 email: string;
 role: string;
 permissions: string[];
}

// ─── API Response Types ────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
 success: boolean;
 data?: T;
 error?: {
 code: string;
 message: string;
 details?: Array<{ field: string; message: string }>;
 request_id?: string;
 };
 meta?: {
 page: number;
 limit: number;
 total: number;
 total_pages: number;
 };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
 meta: {
 page: number;
 limit: number;
 total: number;
 total_pages: number;
 };
}

// ─── Visibility Scoring ────────────────────────────────────────────────────────

export interface VisibilityScoreBreakdown {
 mentionRate: number;
 sentimentScore: number;
 positionScore: number;
 platformSpread: number;
}

export interface VisibilityScore {
 total: number;
 breakdown: VisibilityScoreBreakdown;
 grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// ─── Sentiment ─────────────────────────────────────────────────────────────────

export interface SentimentBreakdown {
 positive: number;
 neutral: number;
 negative: number;
 dominant: 'positive' | 'neutral' | 'negative';
}

// ─── Scan ──────────────────────────────────────────────────────────────────────

export interface ScanResult {
 job: ScannerScanJob;
 mentions: ScannerScanJob['mentions'];
 totalMentions: number;
 visibilityScore: number | null;
 sentimentBreakdown: SentimentBreakdown | null;
 narrativeSummary: string | null;
}

// ─── Re-export AI types ────────────────────────────────────────────────────────

export * from './ai';
