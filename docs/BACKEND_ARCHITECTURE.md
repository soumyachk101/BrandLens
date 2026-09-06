# BrandLens — Backend Architecture

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Node.js 20+ (TypeScript) | Application runtime |
| Framework | Fastify | HTTP server |
| Queue | BullMQ (Redis) | Async job processing |
| Database | PostgreSQL 15 | Primary data store |
| Cache | Redis 7 | Rate limiting, session cache |
| Object Storage | AWS S3 / Cloudflare R2 | Report PDFs, assets |
| Email | Resend / SendGrid | Report delivery, notifications |
| LLM SDKs | OpenAI, Anthropic, Google, Groq | AI platform integrations |
| Cron | node-cron / Agenda | Scheduled scan jobs |
| Monitoring | Sentry, Datadog | Error tracking & observability |
| Deployment | Docker, Fly.io / AWS ECS | Container orchestration |

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│ Client Applications (Web, Mobile, API consumers) │
└──────────────────────┬──────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────────────────┐
│ Load Balancer / API Gateway (rate limiting, TLS termination) │
└──────────────────────┬──────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────────────────┐
│ Fastify API Server (REST + WebSocket for live updates) │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────────┐ │
│ │ Auth Service │ │ Brand Service│ │ Scan Service │
│ │ (JWT + API │ │ (CRUD + │ │ (trigger, monitor, cancel) │ │
│ │ key auth) │ │ analytics) │ │ │
│ └──────────────┘ └──────────────┘ └──────────────────────────────┘ │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────────┐ │
│ │ Report │ │ Mention │ │ Webhook Service │
│ │ Service │ │ Service │ │ (outbound delivery) │
│ │ (generation│ │ (extraction,│ │ │
│ │ + export) │ │ sentiment) │ │ │
│ └──────────────┘ └──────────────┘ └──────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────────────────┐
│ BullMQ Job Queues (Redis) │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ scan-queue │ │ report-queue│ │ email-queue │ │ webhook-queue│ │
│ │ (priority: │ │ (priority: │ │ (priority: │ │ (priority: │ │
│ │ medium) │ │ low) │ │ low) │ │ low) │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└──────────────────────┬──────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────────────────┐
│ Worker Processes (separate from API server) │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐ │
│ │ Scan Worker │ │ Report Worker │ │ Email Worker │
│ │ - builds queries │ │ - renders PDF │ │ - sends emails │
│ │ - calls AI APIs │ │ - assembles data│ │ - retries on fail │
│ │ - parses responses│ │ - uploads to S3│ │ - tracks delivery │
│ │ - extracts mentions│ │ │ │ │ │
│ └────────┬─────────┘ └────────┬─────────┘ └──────────┬───────────┘ │
│ │ │ │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Sentiment Worker │
│ │ - batch sentiment scoring │
│ │ - sentiment trend analysis │
│ └───────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────────────┘
│
▼
┌──────────────────────────────────────────────────────────────────────┐
│ External AI Platforms │
│ ChatGPT │ Perplexity │ Claude │ Gemini │ Copilot │ DeepSeek │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 1. AI Query Service Architecture

### Purpose

The AI Query Service is the core data-collection engine. It builds prompts, dispatches them to multiple AI platforms, parses structured responses, and extracts normalized mentions.

### Architecture Components

```
┌─────────────────────────────────────────────────────────────────────┐
│ AI Query Service (src/services/ai-query/) │
│ │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────────────────┐ │
│ │ Query Builder │ │ Platform │ │ Response Parser │
│ │ │ │ Adapters │ │ │
│ │ - template │ │ - OpenAI │ │ - JSON extraction │
│ │ - variable │ │ - Anthropic │ │ - mention entity │
│ │ - substitution│ │ - Google │ │ extraction │
│ │ - variant │ │ - Perplexity │ │ - citation parsing │
│ │ generation │ │ - Groq │ │ - sentiment scoring │
│ └───────────────┘ └───────────────┘ └───────────────────────────┘ │
│ │ │ │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────────────────┐ │
│ │ Rate Limiter │ │ Cache Layer │ │ Circuit Breaker │
│ │ │ │ (Redis) │ │ │
│ │ - per-platform │ │ - cache │ │ - per-platform │
│ │ - per-model │ │ responses │ │ fallback chain │
│ │ - backoff │ │ - dedup │ │ │
│ └───────────────┘ └───────────────┘ └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Query Builder

**Location:** `src/services/ai-query/query-builder.ts`

Responsible for constructing platform-specific prompts from templates and brand configuration.

```
function buildQueries(brand: Brand, platform: string, template?: PromptTemplate)
 → Query[]
```

**Logic:**

1. Load the prompt template (brand-specific, agency-default, or system-default)
2. Substitute template variables:
 - `{{brand_name}}` → brand.name
 - `{{keywords}}` → brand.keywords.map(k => k.term).join(', ')
 - `{{competitors}}` → brand.competitors.map(c => c.name).join(', ')
 - `{{industry}}` → brand.industry
 - `{{custom}}` → template.variables.custom
3. Generate query variants:
 - `original` — the base query
 - `paraphrased` — 2-3 rephrased versions using LLM
 - `question_form` — converted to a question ("Which X are best for Y?")
4. Apply platform-specific optimizations:
 - ChatGPT: no special handling
 - Perplexity: add "Cite your sources" instruction
 - Claude: add structured output instruction (JSON mode)
 - Copilot: add web context framing
5. Deduplicate against recent queries (cache key: SHA-256 of query_text + platform + brand_id, TTL: 7 days)

### Platform Adapters

**Location:** `src/services/ai-query/adapters/`

Each adapter handles the specifics of an AI platform's API, authentication, request format, and response parsing.

```
interface PlatformAdapter {
 name: string;
 buildRequest(query: string, options: QueryOptions): Promise<RequestConfig>;
 parseResponse(raw: any): Promise<AIResponse>;
 extractMentions(response: AIResponse, brand: Brand): Promise<Mention[]>;
 estimateTokens(text: string): number;
 getRateLimits(): RateLimitConfig;
}
```

#### Adapter Implementations

**OpenAI (ChatGPT):**

- Uses `/v1/chat/completions`
- Default model: `gpt-4-turbo-preview` (configurable per plan)
- Structured output via `response_format: { type: "json_object" }`
- Streaming disabled (need full response for parsing)
- Response parsing: extract JSON block from markdown code fences, then parse mentions array

**Anthropic (Claude):**

- Uses `/v1/messages`
- Default model: `claude-3-5-sonnet-20240620`
- Structured output via explicit JSON instruction in 
- Response parsing: locate JSON block in response text

**Google (Gemini):**

- Uses `/v1beta/models/{model}:generateContent`
- Default model: `gemini-1.5-pro`
- Response parsing: extract from `candidates[0].content.parts[0].text`

**Perplexity:**

- Uses `/chat/completions` (OpenAI-compatible)
- Default model: `llama-3.1-sonar-large-128k-online`
- Includes `search_recency_filter` parameter
- Parses citations from `citations` array in response

**Groq:**

- Uses `/openai/v1/chat/completions`
- Ultra-low latency, good for high-volume queries
- Model: `llama-3.3-70b-versatile`

### Response Parser

**Location:** `src/services/ai-query/parser.ts`

Handles extraction of structured data from raw AI responses:

1. **JSON Extraction:** Locates JSON within the response text (handles markdown code fences, plain JSON, JSON embedded in prose)
2. **Mention Extraction:** Identifies brand name, competitors, and keywords in the response text using fuzzy matching + NER
3. **Citation Parsing:** Extracts URLs from the response
4. **Sentiment Pre-scoring:** Quick heuristic sentiment from response (full sentiment analysis is handled by the Sentiment Service)

```
function parseAIResponse(
 raw: string,
 platform: string,
 brand: Brand
): Promise<AIResponse>
```

### Circuit Breaker

Each platform adapter has a circuit breaker to handle platform outages gracefully:

- **Closed:** Normal operation, all requests pass through
- **Open:** After 5 consecutive failures or >30s p99 latency, reject requests for 60s
- **Half-Open:** Allow 1 probe request after cooldown; if it succeeds, close circuit

---

## 2. Scheduled Scanning Jobs

### Cron Schedule

**Location:** `src/jobs/scanner-scheduler.ts`

Scan jobs are scheduled per brand based on `scan_frequency`:

```
Frequency Cron Expression Description
────────────────────────────────────────────────────────────
hourly 0 * * * * Every hour at :00
daily 0 6 * * * Daily at 06:00 UTC
weekly 0 6 * * 1 Weekly on Monday at 06:00 UTC
manual N/A Triggered only via API
```

### Job Execution Flow

```
1. Scanner Scheduler (cron)
 │
 ├── Queries active brands due for scanning
 │ SELECT * FROM brands
 │ WHERE is_active = true
 │ AND (last_scanned_at IS NULL OR last_scanned_at < NOW() - INTERVAL based on frequency)
 │
 ├── For each brand due for scan:
 │ ├── Creates a scan_job record (status: 'queued')
 │ ├── Enqueues a scan-queue job with:
 │ │ { brand_id, agency_id, platforms, prompt_template_id, triggered_by: 'scheduled' }
 │ └── Logs: `Scheduled scan for brand {name} on {platforms}`
 │
2. Scan Worker picks up job
 │
 ├── Loads brand configuration
 │ ├── keywords, competitors, scan_frequency
 │ ├── agency plan (determines platforms and rate limits)
 │ └── prompt templates
 │
 ├── For each platform:
 │ ├── Builds queries (1 original + 2 paraphrased + 1 question form = 4 per platform)
 │ ├── Updates scan_job: queries_total = platforms * 4
 │ ├── For each query variant:
 │ │ ├── Rate limit check (per-platform token bucket)
 │ │ ├── Calls platform adapter → ai_response
 │ │ ├── Parses response → mentions
 │ │ ├── Runs sentiment analysis on mentions
 │ │ ├── Saves ai_query record
 │ │ ├── Saves mention records
 │ │ └── Updates scan_job: queries_done += 1
 │ │
 │ └── On platform failure:
 │ ├── Logs error
 │ ├── Increments queries_failed
 │ └── Continues to next platform (does not abort)
 │
 ├── Updates competitor visibility scores
 │ UPDATE competitors SET
 │ visibility_score = calculated_score,
 │ mention_count = new_count,
 │ avg_sentiment_score = new_avg
 │ WHERE brand_id = ?
 │
 ├── Refreshes materialized views (async, non-blocking)
 │ └── REFRESH MATERIALIZED VIEW CONCURRENTLY brand_visibility_summary
 │
 ├── Updates brand.last_scanned_at
 │
 └── Emits webhook: scan.completed
```

### Queue Configuration

```js
// src/queues/scan-queue.ts
const scanQueue = new Queue('scan-queue', {
 connection: { host: 'localhost', port: 6379 },
 defaultJobOptions: {
 removeOnComplete: { count: 1000, age: 7 * 24 * 3600 },
 removeOnFail: { count: 500, age: 3 * 24 * 3600 },
 attempts: 3,
 backoff: {
 type: 'exponential',
 delay: 2000, // 2s, 4s, 8s
 },
 limiter: {
 max: 10, // max 10 concurrent jobs
 duration: 1000, // per second
 },
 },
});
```

### Concurrency & Throttling

| Dimension | Limit | Enforcement |
|-----------|-------|-------------|
| Global concurrent scans | 50 | BullMQ queue limiter |
| Per-brand concurrent scans | 1 | Job dedup key: `scan:{brand_id}` |
| Per-platform RPM | Platform-specific | Token bucket in Redis |
| Per-query timeout | 45 seconds | Job timeout setting |
| Retry on failure | 3 attempts | Exponential backoff |

---

## 3. Report Generation Pipeline

### Async Pipeline

```
API Request: POST /brands/{id}/reports
 │
 ├── Validates request body
 ├── Creates report record (status: 'generating')
 ├── Enqueues report-queue job
 │ { report_id, brand_id, period, format, sections, send_to }
 │
 ▼
REPORT QUEUE
 │
 ├── Report Worker picks up job
 │
 ├── STEP 1: Data Aggregation
 │ │
 │ ├── Queries ai_queries + mentions for period
 │ ├── Computes:
 │ │ ├── Total queries, mentions, visibility score
 │ │ ├── Sentiment distribution (positive / neutral / negative)
 │ │ ├── Platform breakdown (per-platform metrics)
 │ │ ├── Top-performing and underperforming queries
 │ │ ├── Keyword performance (mention count, avg position)
 │ │ ├── Competitor comparison data
 │ │ └── Trend data (daily points for charts)
 │ └── Updates report.data JSONB with computed data
 │
 ├── STEP 2: PDF Generation
 │ │
 │ ├── Loads white-label config (agency.white_label_config)
 │ ├── Selects PDF template:
 │ │ ├── default-template.html (base layout)
 │ │ ├── weekly-report.html / monthly-report.html (variants)
 │ │ └── white-label overrides (logo, colors, header/footer text)
 │ ├── Renders HTML using:
 │ │ ├── Handlebars for template logic
 │ │ ├── Chart.js (via Puppeteer) for trend charts
 │ │ └── Embedded CSS (agency colors)
 │ ├── Converts HTML → PDF using Puppeteer
 │ │ └── Puppeteer spawns headless Chromium
 │ ├── Uploads PDF to S3/R2
 │ └── Sets report.pdf_url
 │
 ├── STEP 3: HTML Version (optional)
 │ ├── Renders self-contained HTML (same template, no Puppeteer)
 │ └── Uploads to S3/R2
 │
 ├── STEP 4: Email Delivery (if send_to provided)
 │ ├── Enqueues email-queue job
 │ └── Returns immediately (does not block report generation)
 │
 ├── STEP 4b: Webhook Delivery
 │ ├── Emits webhook: report.ready
 │ └── Targets registered webhook endpoints
 │
 └── Updates report: status = 'completed', pdf_url, html_url
```

### Report Data Template (JSON)

```json
{
 "generated_at": "2025-01-07T08:00:00Z",
 "agency": {
 "name": "Acme Digital Agency",
 "logo_url": "https://acme.com/logo.png"
 },
 "brand": {
 "name": "BrandLens",
 "industry": "MarTech"
 },
 "period": {
 "start": "2025-01-01",
 "end": "2025-01-07",
 "label": "Week of January 1–7, 2025"
 },
 "summary": {
 "total_queries": 142,
 "total_mentions": 89,
 "visibility_score": 0.42,
 "visibility_score_change": 0.05,
 "avg_sentiment": 0.61,
 "avg_sentiment_change": 0.08,
 "top_platform": "chatgpt",
 "trend": "improving"
 },
 "sentiment_distribution": {
 "positive": 34,
 "neutral": 41,
 "negative": 14,
 "positive_pct": 38.2,
 "neutral_pct": 46.1,
 "negative_pct": 15.7
 },
 "platform_breakdown": [
 {
 "platform": "chatgpt",
 "icon": "https://cdn.brandlens.ai/icons/chatgpt.svg",
 "queries": 42,
 "mentions": 28,
 "visibility": 0.45,
 "avg_sentiment": 0.62,
 "mention_count_change": 4,
 "top_queries": [...]
 }
 ],
 "mentions_timeline": [
 {"date": "2025-01-01", "mentions": 7, "sentiment": 0.42},
 {"date": "2025-01-02", "mentions": 9, "sentiment": 0.58}
 ],
 "keyword_performance": [
 {
 "term": "BrandLens",
 "mention_count": 45,
 "avg_position": 2.3,
 "sentiment": 0.68,
 "trend": "stable"
 }
 ],
 "competitor_comparison": [
 {
 "name": "BrandWatch AI",
 "visibility_score": 0.35,
 "mention_count": 72,
 "avg_sentiment": 0.45,
 "share_of_voice": 0.31,
 "trend": "up"
 }
 ],
 "key_insights": [
 "BrandLens improved visibility by 12% this week.",
 "Sentiment improved notably on Perplexity queries (+0.15).",
 "Competitor BrandWatch AI gained share of voice on ChatGPT."
 ],
 "recommendations": [
 "Increase keyword coverage for 'AI brand monitoring' to capture more queries.",
 "Monitor competitor MentionStream's new positioning claims."
 ]
}
```

### Queue Configuration

```js
// src/queues/report-queue.ts
const reportQueue = new Queue('report-queue', { ... });

reportQueue.process('generate-report', 2, async (job) => {
 // Step 1: Aggregate data (CPU-bound, fast)
 const data = await aggregateReportData(job.data);

 // Step 2: Generate PDF (IO-bound, slow)
 const { pdfUrl, htmlUrl } = await generateReportFiles(job.data, data);

 // Step 3: Update report record
 await updateReport(job.data.report_id, { pdf_url: pdfUrl, html_url: htmlUrl, data });

 // Step 4: Trigger downstream (non-blocking)
 if (job.data.send_to) {
 await emailQueue.add('send-report', { report_id: job.data.report_id, ... });
 }

 emitWebhook('report.ready', { report_id: job.data.report_id, ... });
});
```

---

## 4. Multi-Platform AI Query System

### Platform Registry

**Location:** `src/services/ai-query/registry.ts`

```ts
interface PlatformConfig {
 name: string;
 adapter: PlatformAdapter;
 rateLimits: {
 requestsPerMinute: number;
 tokensPerMinute: number;
 };
 models: string[];
 defaultModel: string;
 priority: number; // lower = higher priority in fallback chain
 enabled: boolean;
 healthStatus: 'healthy' | 'degraded' | 'down';
 lastHealthCheck: Date;
}

const PLATFORMS: Record<string, PlatformConfig> = {
 chatgpt: {
 name: 'ChatGPT',
 adapter: new OpenAIAdapter(),
 rateLimits: { requestsPerMinute: 3500, tokensPerMinute: 150000 },
 models: ['gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'],
 defaultModel: 'gpt-4-turbo',
 priority: 1,
 enabled: true,
 },
 perplexity: {
 name: 'Perplexity',
 adapter: new PerplexityAdapter(),
 rateLimits: { requestsPerMinute: 50, tokensPerMinute: 200000 },
 models: ['llama-3.1-sonar-large-128k-online'],
 defaultModel: 'llama-3.1-sonar-large-128k-online',
 priority: 2,
 enabled: true,
 },
 claude: {
 name: 'Claude',
 adapter: new AnthropicAdapter(),
 rateLimits: { requestsPerMinute: 4000, tokensPerMinute: 400000 },
 models: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229'],
 defaultModel: 'claude-3-5-sonnet-20240620',
 priority: 1,
 enabled: true,
 },
 gemini: {
 name: 'Gemini',
 adapter: new GeminiAdapter(),
 rateLimits: { requestsPerMinute: 60, tokensPerMinute: 320000 },
 models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
 defaultModel: 'gemini-1.5-pro',
 priority: 3,
 enabled: true,
 },
 copilot: {
 name: 'Copilot',
 adapter: new CopilotAdapter(),
 rateLimits: { requestsPerMinute: 100, tokensPerMinute: 100000 },
 models: ['gpt-4'],
 defaultModel: 'gpt-4',
 priority: 4,
 enabled: false, // requires Bing API partnership
 },
 deepseek: {
 name: 'DeepSeek',
 adapter: new DeepSeekAdapter(),
 rateLimits: { requestsPerMinute: 200, tokensPerMinute: 100000 },
 models: ['deepseek-chat'],
 defaultModel: 'deepseek-chat',
 priority: 5,
 enabled: true,
 },
 groq: {
 name: 'Groq',
 adapter: new GroqAdapter(),
 rateLimits: { requestsPerMinute: 30, tokensPerMinute: 6000 },
 models: ['llama-3.3-70b-versatile'],
 defaultModel: 'llama-3.3-70b-versatile',
 priority: 2,
 enabled: true,
 },
};
```

### Query Flow (per platform)

```
1. Check rate limit (Redis token bucket)
 └── If rate limited → delay until available or skip

2. Check circuit breaker
 └── If open → skip platform, log warning

3. Build query (template substitution + variant)

4. Check cache (SHA-256 of query_text + platform + brand_id, TTL 7 days)
 └── If cached → return cached response

5. Call platform API with timeout (45s)

6. Parse response
 └── Extract mentions, citations, structured data

7. Run sentiment analysis on mentions
 └── Quick heuristic first, then batch for full scoring

8. Save ai_query record to DB

9. Cache response in Redis

10. Emit event: mention.detected (if new mentions found)
```

### Platform Health Monitoring

```
Health Check Job (every 5 minutes):
 │
 ├── For each platform:
 │ ├── Sends a simple "ping" query
 │ ├── Measures latency
 │ └── Updates PLATFORMS[name].healthStatus and lastHealthCheck
 │
 └── If platform is degraded:
 ├── Reduces rate limit allocation by 50%
 └── Logs to monitoring dashboard
```

---

## 5. Sentiment Analysis Service

### Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│ Sentiment Service (src/services/sentiment/) │
│ │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐ │
│ │ Heuristic │ │ LLM-based │ │ Batch Processor │
│ │ Scorer │ │ Scorer │ │ │
│ │ │ │ │ │
│ │ - keyword │ │ - GPT-4o-mini │ │ - processes mentions │
│ │ lexicon │ │ - Claude Haiku│ │ in batches of 50 │
│ │ - rule-based │ │ - Gemini Flash│ │ - async via queue │
│ │ - AFINN-165 │ │ │ │ - updates sentiment │
│ │ - VADER │ │ (async, accurate)│ │ scores in DB │
│ │ │ │ │ │
│ │ (sync, fast) │ │ (async, accurate)│ │ │
│ └────────┬────────┘ └────────┬────────┘ └──────────┬──────────────┘ │
│ │ │ │
│ └─────────────────────────────┴──────────────────────┘
│ │
│ ┌──────────────────────────────────────────────────────────────┐ │
│ │ Sentiment Cache (Redis) │ │
│ │ - context_hash → { sentiment, score, confidence } │ │
│ │ - TTL: 24 hours │ │
│ └──────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

### Scoring Strategy

**Two-pass approach for speed + accuracy:**

**Pass 1: Heuristic (sync, immediate)**

Applied immediately when mentions are extracted from an AI response.

- Uses AFINN-165 + VADER lexicon
- Assigns: `sentiment` (positive/neutral/negative/mixed), `sentiment_score` (-1.0 to 1.0)
- Confidence: based on lexicon match coverage (0.0-0.7)

**Pass 2: LLM-based (async, batch)**

For higher accuracy, processed in background batches.

```ts
// src/services/sentiment/llm-scorer.ts
async function batchScoreSentiment(mentions: Mention[]): Promise<void> {
 const batchSize = 50;
 for (let i = 0; i < mentions.length; i += batchSize) {
 const batch = mentions.slice(i, i + batchSize);

 const response = await openai.chat.completions.create({
 model: 'gpt-4o-mini',
 response_format: { type: 'json_object' },
 messages: [
 {
 role: 'system',
 content: 'Analyze the sentiment of each context snippet. Return JSON: [{context_hash: "...", sentiment: "...", score: -1.0 to 1.0}]'
 },
 {
 role: 'user',
 content: JSON.stringify(batch.map(m => ({ hash: hash(m.context), text: m.context })))
 }
 ],
 max_tokens: 2000,
 });

 const results = JSON.parse(response.choices[0].message.content);
 // Update mentions in DB with LLM scores
 // Cache results in Redis
 }
}
```

**Sentiment Score Interpretation:**

| Score | Sentiment Label | Description |
|-------|----------------|-------------|
| > 0.5 | `positive` | Strongly favorable mention |
| 0.1 – 0.5 | `positive` | Mildly favorable |
| -0.1 – 0.1 | `neutral` | Factual, no clear sentiment |
| -0.5 – -0.1 | `negative` | Mildly unfavorable |
| < -0.5 | `negative` | Strongly unfavorable |
| Mixed signals | `mixed` | Both positive and negative elements |

### Sentiment Spike Detection

```
For each brand, running daily:

1. Compute 7-day rolling average sentiment
2. If today's sentiment deviates > 20% from rolling average:
 ├── Mark as spike
 ├── Classify direction: positive_spike | negative_spike
 └── Emit webhook: sentiment.spike
 └── Include: old_score, new_score, change_pct, recent_mentions
```

---

## 6. White-Label Customization System

### Configuration Flow

```
Agency Registration / Settings Update
 │
 ├── Agency submits white_label_config JSON
 │
 ├── Validation:
 │ ├── logo_url: valid URL, image format
 │ ├── brand_name: 2-100 chars
 │ ├── primary_color / secondary_color: valid hex
 │ ├── domain: valid domain format (or null)
 │ └── hide_powered_by: boolean
 │
 ├── Stored in agencies.white_label_config (JSONB)
 │
 ▼
Report Generation
 │
 ├── Loads agency.white_label_config
 │ ├── Applies logo, colors, brand name to HTML template
 │ ├── Injects custom header_text and footer_text
 │ ├── Removes "Powered by BrandLens" if hide_powered_by = true
 │ └── Generates PDF with agency branding
 │
 ▼
Shared Dashboard (white-label domain)
 │
 ├── If agency has custom domain:
 │ ├── Serves dashboard at agency's domain
 │ ├── Custom SSL certificate (via ACME/LetsEncrypt)
 │ └── Branded UI (logo, colors, no BrandLens branding)
 │
 └── If no custom domain:
 └── Serves at app.brandlens.ai/agency/{slug}
```

### White-Label Config Schema

```typescript
interface WhiteLabelConfig {
 // Branding
 logo_url: string | null;
 brand_name: string;
 primary_color: string; // hex, e.g. "#2563eb"
 secondary_color: string; // hex
 favicon_url: string | null;

 // Domain
 domain: string | null; // e.g. "monitor.acme.com"
 custom_css: string | null;

 // Reports
 custom_reports: {
 header_text: string;
 footer_text: string;
 footer_logo_url: string | null;
 hide_powered_by: boolean;
 };

 // Authentication
 sso_enabled: boolean;
 saml_config: {
 entry_point: string;
 issuer: string;
 cert: string;
 };
}
```

### Template System

```
templates/
 ├── reports/
 │ ├── base.html (shared layout)
 │ ├── weekly.html
 │ ├── monthly.html
 │ ├── quarterly.html
 │ └── competitor.html
 └── emails/
 ├── report-ready.html
 ├── scan-completed.html
 └── sentiment-alert.html

White-label injection:
 └── At render time, all {{brand.*}}, {{agency.*}} variables
 are substituted from the config
 └── Custom CSS from agency config is injected into <style> block
```

---

## 7. Authentication & Authorization

### JWT Authentication

```
POST /auth/login
Request: { email, password }
Response: { access_token, refresh_token, expires_in }

Access Token (JWT):
 {
 "sub": "user-id",
 "agency_id": "agency-uuid",
 "role": "admin|viewer|analyst",
 "permissions": ["brands:read", "brands:write", "reports:read"],
 "iat": 1704067200,
 "exp": 1704070800
 }
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|--------|----------------------------------------------------------------------------|
| `admin` | Full access to agency, brands, reports, settings |
| `analyst` | Read/Write brands, queries, mentions; Read reports |
| `viewer` | Read-only access to brands, mentions, reports |

### API Key Authentication

For server-to-server integrations (no user session):

```
Authorization: Bearer sk_live_abc123def456...
```

API keys are scoped to an agency. The key maps to the agency's `api_key` column and inherits the agency's plan-level permissions.

---

## 8. Deployment Architecture

### Docker Compose (Development)

```yaml
# docker-compose.yml
services:
 postgres:
 image: postgres:15-alpine
 environment:
 POSTGRES_DB: brandlens
 POSTGRES_USER: brandlens
 POSTGRES_PASSWORD: devpass
 ports: ["5432:5432"]
 volumes: [pgdata:/var/lib/postgresql/data]

 redis:
 image: redis:7-alpine
 ports: ["6379:6379"]
 volumes: [redisdata:/data]

 api:
 build: .
 ports: ["3000:3000"]
 environment:
 DATABASE_URL: postgresql://brandlens:devpass@postgres:5432/brandlens
 REDIS_URL: redis://redis:6379
 depends_on: [postgres, redis]
 volumes: [./src:/app/src]

 worker:
 build: .
 command: npm run worker
 environment:
 DATABASE_URL: postgresql://brandlens:devpass@postgres:5432/brandlens
 REDIS_URL: redis://redis:6379
 depends_on: [postgres, redis]
 volumes: [./src:/app/src]

 scheduler:
 build: .
 command: npm run scheduler
 environment:
 DATABASE_URL: postgresql://brandlens:devpass@postgres:5432/brandlens
 REDIS_URL: redis://redis:6379
 depends_on: [postgres, redis]

volumes:
 pgdata:
 redisdata:
```

### Production Deployment (Fly.io)

```
┌─────────────────────────────────────────────────────────────┐
│ Fly.io (multi-region) │
│ │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ │
│ │ API (2x) │ │ Worker │ │ Scheduler│ │
│ │ iad │ │ (iad) │ │ (iad) │ │
│ │ (scale: 2)│ │ (scale: 2)│ │ (1 instance)│ │
│ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ │
│ │ │ │
│ ┌─────┴───────────────┴───────────────┴─────┐ │
│ │ Shared Redis (Fly Redis or Upstash) │ │
│ └─────────────────┬─────────────────────────┘ │
│ │
│ ┌───────────┐ ┌───────────┐ │
│ │ PostgreSQL│ │ S3 / R2 │ │
│ │ (Neon or │ │ (Reports)│ │
│ │ Supabase)│ │ │ │
│ └───────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────┘

Auto-scaling rules:
 - API: scale to 2-10 based on CPU > 70%
 - Worker: scale to 2-20 based on BullMQ job lag > 100
 - Scheduler: always 1 instance
```

---

## 9. Monitoring & Observability

### Key Metrics

| Metric | Source | Alert Threshold |
|--------------------------------------|--------|-----------------|
| API latency (p50, p95, p99) | Fastify metrics | p99 > 2s |
| Scan job failure rate | BullMQ | > 10% failures |
| Scan queue lag | BullMQ | > 500 jobs waiting |
| AI platform response time | Adapter metrics | p99 > 30s |
| AI platform error rate | Adapter metrics | > 5% errors |
| Report generation time | Worker metrics | > 5 minutes |
| Database connection pool | PostgreSQL | > 80% utilized |
| Sentiment analysis queue lag | BullMQ | > 1000 jobs waiting |
| Webhook delivery failure rate | Webhook service | > 15% failures |

### Logging

```
Log Levels:
 - error: Failures, exceptions, circuit breaker opens
 - warn: Slow queries, retry attempts, rate limit proximity
 - info: Job completions, scan triggers, report generations
 - debug: Query building, adapter calls, cache hits

Structured logging (pino):
 {
 "level": "info",
 "msg": "Scan job completed",
 "brand_id": "b-...",
 "platform": "chatgpt",
 "queries_total": 4,
 "queries_done": 4,
 "duration_ms": 12400,
 "mention_count": 3,
 "timestamp": "2025-01-06T08:32:00.000Z"
 }
```

---

## 10. Data Flow Diagrams

### Scan Flow

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Cron Job │ │ Scan │ │ AI │ │ Response│
│ Trigger │────►│ Worker │────►│ Platform│────►│ Parser │
└──────────┘ └────┬─────┘ └──────────┘ └────┬─────┘
│ │ │ │
│ │ ┌──────────┐ │ ┌──────────┐ │
│ │ │ Sentiment│◄──│ Mentions │◄──│ Extract │
│ │ │ Service │ │ │ │ │
│ │ └────┬─────┘ │ └────┬─────┘ │
│ │ │ │ │
│ ▼ ▼ ▼ ▼
┌────────────────────────────────────────────────┐
│ PostgreSQL │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │ai_queries│ │ mentions │ │competitors│ │
│ └──────────┘ └──────────┘ └──────────┘ │
│ ┌──────────┐ ┌──────────┐ │
│ │scan_jobs │ │brands │ │
│ └──────────┘ └──────────┘ │
└────────────────────────────────────────────────┘
│
▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Visibility View│ │ Webhook: │ │ Dashboard │
│ Refresh │ │ scan.completed│ │ Update │
└────────────────┘ └────────────────┘ └────────────────┘
```

### Report Flow

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ API │ │ Report │ │ Data │ │ PDF │
│ Request │────►│ Worker │────►│ Builder │────►│ Renderer│
└──────────┘ └────┬─────┘ └──────────┘ └────┬─────┘
│ │ │ │
│ │ ┌──────────┐ │ │
│ │ │ HTML │◄───────────┘ │
│ │ │ Generator│ │
│ │ └────┬─────┘ │
│ │ │
│ ▼ ▼
┌────────────────┐ ┌────────────────┐
│ S3 / R2 │ │ Email Worker │
│ (PDF + HTML) │ │ (async) │
└────────────────┘ └────────────────┘
│ │
│ ▼
┌────────────────┐ ┌────────────────┐
│ Webhook: │ │ Email: │
│ report.ready │ │ report attached│
└────────────────┘ └────────────────┘
```

---

## 11. Security Considerations

| Area | Measure |
|---------|---------|
| API Keys | Bcrypt hashed, scoped per agency, rotatable |
| JWT | Short-lived (15min), refresh tokens (7 days, httpOnly cookie) |
| Data Access | RLS on all tables, agency-scoped queries |
| AI Prompts | Input sanitization, length limits (4000 chars max) |
| AI Responses | Output parsing with strict JSON schema validation |
| Report URLs | Presigned S3 URLs (15min expiry) |
| Webhooks | HMAC-SHA256 signature verification |
| Secrets | Environment variables, Vault for production |
| Rate Limiting | Per-API-key token bucket in Redis |
| CORS | Restricted to allowed origins per plan |
| Audit Log | All mutations logged with user_id, timestamp, diff |

---

## 12. Scalability Considerations

| Dimension | Current | Scale Target | Approach |
|-----------|---------|--------------|----------|
| Brands | 10,000 | 1,000,000 | Horizontal API/worker scaling |
| Queries/day | 100,000 | 10,000,000 | Partitioning, queue distribution |
| Reports/day | 1,000 | 100,000 | Dedicated report workers, PDF caching |
| Concurrent scans | 50 | 500 | Distributed queue (SQS/Redis cluster) |
| AI platform calls | 50K/day | 5M/day | Request batching, smarter caching |
| DB size | 50GB | 5TB | Partitioning, read replicas, columnar for analytics |
