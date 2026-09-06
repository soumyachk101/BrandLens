# BrandLens — Database Schema

## Technology Stack

- **Database**: PostgreSQL 15+
- **ORM**: Prisma (Node.js) / SQLAlchemy (Python)
- **Migrations**: Prisma Migrate / Alembic
- **Extensions**: `uuid-ossp`, `pg_trgm`, `btree_gist`

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
```

---

## Entity Relationship Overview

```
agencies (1) ──── (n) brands (1) ──── (n) ai_queries
 │ │
 │ │
 │ (n) mentions
 │
 ├─────────────── (n) subscriptions
 │
 └─────────────── (n) reports
 │
 └─────────────── (n) competitors
```

---

## Table Definitions

### 1. agencies

Stores agency accounts that manage multiple brand clients under a white-label configuration.

```sql
CREATE TABLE agencies (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 name VARCHAR(255) NOT NULL,
 email VARCHAR(255) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL,
 plan VARCHAR(50) NOT NULL DEFAULT 'starter'
 CHECK (plan IN ('starter', 'growth', 'enterprise')),
 white_label_config JSONB NOT NULL DEFAULT '{}'::jsonb,
 api_key VARCHAR(255) UNIQUE,
 email_verified BOOLEAN DEFAULT FALSE,
 last_login_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `white_label_config` JSONB Structure

```json
{
 "logo_url": "https://cdn.agency.com/logo.png",
 "brand_name": "Agency Monitor",
 "primary_color": "#1a73e8",
 "secondary_color": "#34a853",
 "domain": "monitor.agency.com",
 "custom_reports": {
 "header_text": "Weekly AI Visibility Report",
 "footer_text": "Confidential — prepared for Client XYZ"
 },
 "hide_powered_by": true,
 "sso_enabled": false,
 "saml_config": null
}
```

---

### 2. brands

Individual brand profiles tracked by an agency. Each brand has associated keywords, competitors, and configuration.

```sql
CREATE TABLE brands (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
 name VARCHAR(255) NOT NULL,
 industry VARCHAR(100),
 description TEXT,
 website_url VARCHAR(500),
 logo_url VARCHAR(500),
 keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
 competitors JSONB NOT NULL DEFAULT '[]'::jsonb,
 scan_frequency VARCHAR(20) DEFAULT 'daily'
 CHECK (scan_frequency IN ('hourly', 'daily', 'weekly', 'manual')),
 is_active BOOLEAN DEFAULT TRUE,
 last_scanned_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

 CONSTRAINT unique_agency_brand_name UNIQUE (agency_id, name)
);
```

#### `keywords` JSONB Structure

```json
[
 { "term": "BrandLens", "type": "brand", "weight": 1.0 },
 { "term": "AI visibility tool", "type": "product", "weight": 0.8 },
 { "term": "brand monitoring AI", "type": "category", "weight": 0.5 }
]
```

#### `competitors` JSONB Structure

```json
[
 { "name": "CompetitorA", "keywords": ["CompetitorA", "Alt tool name"] },
 { "name": "CompetitorB", "keywords": ["CompetitorB"] }
]
```

---

### 3. ai_queries

Stores individual AI platform queries run on behalf of a brand. This is the core data table — every scan creates one or more rows here.

```sql
CREATE TABLE ai_queries (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
 platform VARCHAR(50) NOT NULL
 CHECK (platform IN (
 'chatgpt', 'perplexity', 'claude', 'gemini',
 'copilot', 'deepseek', 'groq', 'custom'
 )),
 query_text TEXT NOT NULL,
 query_variant VARCHAR(50) DEFAULT 'original',
 -- 'original', 'paraphrased', 'question_form'
 prompt_template UUID REFERENCES prompt_templates(id),
 ai_response JSONB NOT NULL,
 -- ai_response structure:
 -- {
 -- "raw_text": "...",
 -- "model": "gpt-4-turbo",
 -- "tokens_used": 1200,
 -- "latency_ms": 3400,
 -- "citations": ["https://...", "https://..."],
 -- "structured_output": { "summary": "...", "sources": [...] }
 -- }
 mentions JSONB DEFAULT '[]'::jsonb,
 -- mentions array: [
 -- { "entity": "BrandLens", "type": "brand", "context": "...", "position": 3 },
 -- { "entity": "CompetitorA", "type": "competitor", "context": "...", "position": 1 }
 -- ]
 mention_count INTEGER DEFAULT 0,
 sentiment_score NUMERIC(4,3), -- -1.0 to 1.0
 confidence_score NUMERIC(4,3), -- 0.0 to 1.0
 status VARCHAR(20) DEFAULT 'completed'
 CHECK (status IN ('pending', 'running', 'completed', 'failed', 'timeout')),
 error_message TEXT,
 response_time_ms INTEGER,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 4. mentions

Normalized, per-mention records extracted from `ai_queries`. This table is the primary data source for dashboards, reports, and trend analysis.

```sql
CREATE TABLE mentions (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
 query_id UUID NOT NULL REFERENCES ai_queries(id) ON DELETE CASCADE,
 platform VARCHAR(50) NOT NULL,
 entity_name VARCHAR(255) NOT NULL,
 entity_type VARCHAR(20) NOT NULL
 CHECK (entity_type IN ('brand', 'competitor', 'product', 'keyword')),
 context TEXT NOT NULL,
 -- Surrounding text snippet from the AI response (±200 chars)
 sentiment VARCHAR(20) NOT NULL DEFAULT 'neutral'
 CHECK (sentiment IN ('positive', 'neutral', 'negative', 'mixed')),
 sentiment_score NUMERIC(4,3), -- -1.0 to 1.0
 confidence_score NUMERIC(4,3), -- 0.0 to 1.0
 position INTEGER, -- Rank/position in response (1 = first mentioned)
 citation_urls JSONB DEFAULT '[]'::jsonb,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 5. competitors

Aggregated competitor tracking data. Updated after each scan cycle to maintain a rolling view of competitive visibility.

```sql
CREATE TABLE competitors (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
 competitor_name VARCHAR(255) NOT NULL,
 mention_count INTEGER DEFAULT 0,
 visibility_score NUMERIC(5,4) DEFAULT 0.0,
 -- visibility_score: weighted share-of-voice, 0.0 – 1.0
 avg_sentiment_score NUMERIC(4,3),
 last_mentioned_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

 CONSTRAINT unique_brand_competitor UNIQUE (brand_id, competitor_name)
);
```

---

### 6. reports

Stored report metadata. Actual PDF/HTML files are stored in S3/R2 with the URL referenced here.

```sql
CREATE TABLE reports (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
 report_type VARCHAR(50) NOT NULL
 CHECK (report_type IN (
 'weekly', 'monthly', 'quarterly',
 'custom', 'competitor', 'sentiment'
 )),
 period_start DATE NOT NULL,
 period_end DATE NOT NULL,
 data JSONB NOT NULL DEFAULT '{}'::jsonb,
 -- data structure:
 -- {
 -- "summary": "...",
 -- "total_queries": 142,
 -- "total_mentions": 89,
 -- "visibility_score": 0.42,
 -- "sentiment_distribution": { "positive": 30, "neutral": 45, "negative": 14 },
 -- "top_queries": [...],
 -- "competitor_comparison": [...],
 -- "trends": { "visibility_7d": [...], "mentions_7d": [...] }
 -- }
 pdf_url VARCHAR(500),
 html_url VARCHAR(500),
 status VARCHAR(20) DEFAULT 'generating'
 CHECK (status IN ('generating', 'completed', 'failed', 'sent')),
 sent_at TIMESTAMPTZ,
 sent_to JSONB DEFAULT '[]'::jsonb,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 7. subscriptions

Stripe-linked subscription records per agency.

```sql
CREATE TABLE subscriptions (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
 stripe_customer_id VARCHAR(255),
 stripe_subscription_id VARCHAR(255) UNIQUE,
 plan VARCHAR(50) NOT NULL
 CHECK (plan IN ('starter', 'growth', 'enterprise')),
 status VARCHAR(50) NOT NULL DEFAULT 'active'
 CHECK (status IN (
 'active', 'trialing', 'past_due',
 'canceled', 'unpaid', 'incomplete'
 )),
 current_period_start TIMESTAMPTZ NOT NULL,
 current_period_end TIMESTAMPTZ NOT NULL,
 cancel_at_period_end BOOLEAN DEFAULT FALSE,
 trial_ends_at TIMESTAMPTZ,
 metadata JSONB DEFAULT '{}'::jsonb,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 8. prompt_templates

Customizable prompt templates for AI platform queries.

```sql
CREATE TABLE prompt_templates (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
 agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
 name VARCHAR(255) NOT NULL,
 description TEXT,
 template TEXT NOT NULL,
 -- Template uses {{brand_name}}, {{keywords}}, {{competitors}} as variables
 variables JSONB DEFAULT '[]'::jsonb,
 platform VARCHAR(50) NOT NULL DEFAULT 'chatgpt',
 is_default BOOLEAN DEFAULT FALSE,
 is_active BOOLEAN DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT DEFAULT NOW()
);
```

#### Template Variables

| Variable | Description | Example |
|------------------|--------------------------------------|-----------------------|
| `{{brand_name}}` | The brand being tracked | BrandLens |
| `{{keywords}}` | Comma-separated keyword list | AI tool, monitoring |
| `{{competitors}}`| Comma-separated competitor list | CompetitorA, AltTool |
| `{{industry}}` | Brand's industry category | SaaS / MarTech |
| `{{custom}}` | User-defined custom text | Focus on enterprise |

#### Example Template

```
You are a market research analyst. I want you to list the top {{count}} tools
for {{industry}} use cases. For each tool, provide a brief description,
key features, and typical pricing. Make sure to include {{brand_name}}
and these competitors: {{competitors}}.

Respond in JSON format:
{
 "tools": [
 {
 "name": "...",
 "description": "...",
 "features": ["..."],
 "pricing": "..."
 }
 ]
}
```

---

### 9. scan_jobs

Tracks scheduled and manual scan executions for observability.

```sql
CREATE TABLE scan_jobs (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
 agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
 platform VARCHAR(50) NOT NULL,
 status VARCHAR(20) DEFAULT 'queued'
 CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
 queries_total INTEGER DEFAULT 0,
 queries_done INTEGER DEFAULT 0,
 queries_failed INTEGER DEFAULT 0,
 error_message TEXT,
 triggered_by VARCHAR(20) DEFAULT 'scheduled'
 CHECK (triggered_by IN ('scheduled', 'manual', 'webhook', 'api')),
 started_at TIMESTAMPTZ,
 completed_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 10. webhook_events

Outbound webhook delivery log for agencies that receive real-time event notifications.

```sql
CREATE TABLE webhook_events (
 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
 event_type VARCHAR(100) NOT NULL,
 -- 'mention.detected', 'sentiment.spike', 'report.ready', 'scan.completed'
 payload JSONB NOT NULL,
 delivery_status VARCHAR(20) DEFAULT 'pending'
 CHECK (delivery_status IN ('pending', 'sent', 'failed', 'retrying')),
 response_code INTEGER,
 response_body TEXT,
 retry_count INTEGER DEFAULT 0,
 next_retry_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 sent_at TIMESTAMPTZ
);
```

---

## Indexes

```sql
-- Agencies
CREATE INDEX idx_agencies_email ON agencies(email);
CREATE INDEX idx_agencies_api_key ON agencies(api_key);
CREATE INDEX idx_agencies_plan ON agencies(plan);
CREATE INDEX idx_agencies_created_at ON agencies(created_at);

-- Brands
CREATE INDEX idx_brands_agency_id ON brands(agency_id);
CREATE INDEX idx_brands_agency_name ON brands(agency_id, name);
CREATE INDEX idx_brands_is_active ON brands(is_active);
CREATE INDEX idx_brands_last_scanned ON brands(last_scanned_at);
CREATE INDEX idx_brands_industry ON brands(industry);

-- AI Queries
CREATE INDEX idx_ai_queries_brand_id ON ai_queries(brand_id);
CREATE INDEX idx_ai_queries_platform ON ai_queries(platform);
CREATE INDEX idx_ai_queries_created_at ON ai_queries(created_at);
CREATE INDEX idx_ai_queries_brand_platform_date
 ON ai_queries(brand_id, platform, created_at);
CREATE INDEX idx_ai_queries_status ON ai_queries(status);
CREATE INDEX idx_ai_queries_mentions ON ai_queries USING GIN (mentions);

-- Mentions
CREATE INDEX idx_mentions_brand_id ON mentions(brand_id);
CREATE INDEX idx_mentions_query_id ON mentions(query_id);
CREATE INDEX idx_mentions_platform ON mentions(platform);
CREATE INDEX idx_mentions_entity_type ON mentions(entity_type);
CREATE INDEX idx_mentions_sentiment ON mentions(sentiment);
CREATE INDEX idx_mentions_created_at ON mentions(created_at);
CREATE INDEX idx_mentions_brand_platform_date
 ON mentions(brand_id, platform, created_at);
CREATE INDEX idx_mentions_entity_name ON mentions(entity_name);

-- Competitors
CREATE INDEX idx_competitors_brand_id ON competitors(brand_id);
CREATE INDEX idx_competitors_visibility ON competitors(visibility_score DESC);

-- Reports
CREATE INDEX idx_reports_brand_id ON reports(brand_id);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_period ON reports(period_start, period_end);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);

-- Subscriptions
CREATE INDEX idx_subscriptions_agency_id ON subscriptions(agency_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);

-- Prompt Templates
CREATE INDEX idx_prompt_templates_brand_id ON prompt_templates(brand_id);
CREATE INDEX idx_prompt_templates_agency_id ON prompt_templates(agency_id);
CREATE INDEX idx_prompt_templates_active ON prompt_templates(is_active);

-- Scan Jobs
CREATE INDEX idx_scan_jobs_brand_id ON scan_jobs(brand_id);
CREATE INDEX idx_scan_jobs_agency_id ON scan_jobs(agency_id);
CREATE INDEX idx_scan_jobs_status ON scan_jobs(status);
CREATE INDEX idx_scan_jobs_created_at ON scan_jobs(created_at);

-- Webhook Events
CREATE INDEX idx_webhook_events_agency_id ON webhook_events(agency_id);
CREATE INDEX idx_webhook_events_status ON webhook_events(delivery_status);
CREATE INDEX idx_webhook_events_next_retry ON webhook_events(next_retry_at);

-- Full-text search indexes for mentions context
CREATE INDEX idx_mentions_context_fts
 ON mentions USING GIN (to_tsvector('english', context));

-- GIN index on keywords for brand search
CREATE INDEX idx_brands_keywords_gin
 ON brands USING GIN (keywords);
```

---

## Row-Level Security (RLS)

All tables enforce row-level access control. Each policy checks that the requesting user's agency_id matches the row's agency_id (or agency chain).

```sql
-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Helper: set the current user's agency_id for the session
-- This is called by the application after authentication
-- e.g., SELECT set_config('app.current_agency_id', 'agency-uuid', true);

CREATE OR REPLACE FUNCTION current_agency_id()
RETURNS UUID AS $$
BEGIN
 RETURN NULLIF(current_setting('app.current_agency_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- AGENCIES: users can only see their own agency
CREATE POLICY agency_self_select ON agencies
 FOR SELECT USING (id = current_agency_id());
CREATE POLICY agency_self_update ON agencies
 FOR UPDATE USING (id = current_agency_id());

-- BRANDS: agency can access its own brands
CREATE POLICY brand_agency_select ON brands
 FOR SELECT USING (
 agency_id = current_agency_id()
 OR EXISTS (
 SELECT 1 FROM agencies a
 WHERE a.id = brands.agency_id
 AND a.id = current_agency_id()
 )
 );
CREATE POLICY brand_agency_insert ON brands
 FOR INSERT WITH CHECK (agency_id = current_agency_id());
CREATE POLICY brand_agency_update ON brands
 FOR UPDATE USING (agency_id = current_agency_id());
CREATE POLICY brand_agency_delete ON brands
 FOR DELETE USING (agency_id = current_agency_id());

-- AI QUERIES: accessible through brand's agency
CREATE POLICY query_brand_select ON ai_queries
 FOR SELECT USING (
 brand_id IN (
 SELECT b.id FROM brands b
 WHERE b.agency_id = current_agency_id()
 )
 );
CREATE POLICY query_brand_insert ON ai_queries
 FOR INSERT WITH CHECK (
 brand_id IN (
 SELECT b.id FROM brands b
 WHERE b.agency_id = current_agency_id()
 )
 );

-- MENTIONS: accessible through brand's agency
CREATE POLICY mention_select ON mentions
 FOR SELECT USING (
 brand_id IN (
 SELECT b.id FROM brands b
 WHERE b.agency_id = current_agency_id()
 )
 );

-- COMPETITORS: accessible through brand's agency
CREATE POLICY competitor_select ON competitors
 FOR SELECT USING (
 brand_id IN (
 SELECT b.id FROM brands b
 WHERE b.agency_id = current_agency_id()
 )
 );

-- REPORTS: accessible through brand's agency
CREATE POLICY report_select ON reports
 FOR SELECT USING (
 brand_id IN (
 SELECT b.id FROM brands b
 WHERE b.agency_id = current_agency_id()
 )
 );
CREATE POLICY report_insert ON reports
 FOR INSERT WITH CHECK (
 brand_id IN (
 SELECT b.id FROM brands b
 WHERE b.agency_id = current_agency_id()
 )
 );

-- SUBSCRIPTIONS: agency can only see its own
CREATE POLICY subscription_select ON subscriptions
 FOR SELECT USING (agency_id = current_agency_id());

-- PROMPT TEMPLATES: accessible through agency or brand
CREATE POLICY template_select ON prompt_templates
 FOR SELECT USING (
 agency_id = current_agency_id()
 OR brand_id IN (
 SELECT b.id FROM brands b
 WHERE b.agency_id = current_agency_id()
 )
 );

-- SCAN JOBS: agency can see its own jobs
CREATE POLICY scan_job_select ON scan_jobs
 FOR SELECT USING (agency_id = current_agency_id());

-- WEBHOOK EVENTS: agency can see its own
CREATE POLICY webhook_select ON webhook_events
 FOR SELECT USING (agency_id = current_agency_id());
```

---

## Views

### Visibility Score View

Materialized view for quick dashboard loading of brand visibility metrics.

```sql
CREATE MATERIALIZED VIEW brand_visibility_summary AS
SELECT
 b.id AS brand_id,
 b.name AS brand_name,
 b.agency_id,
 COUNT(DISTINCT aq.id) AS total_queries,
 COUNT(DISTINCT m.id) AS total_mentions,
 COUNT(DISTINCT CASE
 WHEN m.entity_type = 'brand' AND m.entity_name = b.name
 THEN m.id
 END) AS brand_mentions,
 COUNT(DISTINCT CASE
 WHEN m.entity_type = 'competitor'
 THEN m.id
 END) AS competitor_mentions,
 ROUND(
 COALESCE(
 COUNT(DISTINCT CASE
 WHEN m.entity_type = 'brand' AND m.entity_name = b.name
 THEN m.id
 END)::NUMERIC
 / NULLIF(COUNT(DISTINCT aq.id), 0),
 0
 ), 4
 ) AS visibility_score,
 ROUND(
 COALESCE(
 AVG(CASE
 WHEN m.entity_type = 'brand' AND m.entity_name = b.name
 THEN m.sentiment_score
 END), 0
 ), 3
 ) AS avg_brand_sentiment,
 MAX(aq.created_at) AS last_scan_at,
 COUNT(DISTINCT aq.platform) AS platforms_tracked
FROM brands b
LEFT JOIN ai_queries aq ON aq.brand_id = b.id
LEFT JOIN mentions m ON m.query_id = aq.id
WHERE b.is_active = TRUE
GROUP BY b.id, b.name, b.agency_id;

CREATE UNIQUE INDEX idx_visibility_summary_brand_id
 ON brand_visibility_summary(brand_id);

-- Refresh strategy: refresh after each scan batch completes
-- or on a cron schedule every 15 minutes
-- REFRESH MATERIALIZED VIEW CONCURRENTLY brand_visibility_summary;
```

### Daily Trend View

```sql
CREATE MATERIALIZED VIEW brand_daily_trends AS
SELECT
 b.id AS brand_id,
 DATE(aq.created_at) AS date,
 COUNT(DISTINCT aq.id) AS queries_run,
 COUNT(DISTINCT m.id) AS mentions_count,
 AVG(m.sentiment_score) AS avg_sentiment,
 COUNT(DISTINCT aq.platform) AS platforms
FROM brands b
JOIN ai_queries aq ON aq.brand_id = b.id
LEFT JOIN mentions m ON m.query_id = aq.id
GROUP BY b.id, DATE(aq.created_at);

CREATE UNIQUE INDEX idx_daily_trends_brand_date
 ON brand_daily_trends(brand_id, date);
```

---

## Sample Seed Data

```sql
-- Seed Agency
INSERT INTO agencies (id, name, email, plan, white_label_config, api_key, email_verified)
VALUES (
 'a1111111-1111-1111-1111-111111111111',
 'Acme Digital Agency',
 'admin@acmeagency.com',
 'growth',
 '{"logo_url":"https://acme.com/logo.png","brand_name":"Acme Monitor","primary_color":"#2563eb","hide_powered_by":true}',
 'sk_live_abc123def456ghi789',
 TRUE
);

-- Seed Brands
INSERT INTO brands (id, agency_id, name, industry, description, keywords, competitors, scan_frequency)
VALUES
(
 'b1111111-1111-1111-1111-111111111111',
 'a1111111-1111-1111-1111-111111111111',
 'BrandLens',
 'MarTech / AI Analytics',
 'AI-powered brand visibility monitoring platform',
 '[
 {"term": "BrandLens", "type": "brand", "weight": 1.0},
 {"term": "BrandLens AI", "type": "brand", "weight": 0.9},
 {"term": "AI brand monitoring", "type": "category", "weight": 0.6},
 {"term": "AI visibility tool", "type": "category", "weight": 0.5}
 ]'::jsonb,
 '[
 {"name": "MentionStream", "keywords": ["MentionStream", "MentionStream AI"]},
 {"name": "BrandWatch AI", "keywords": ["BrandWatch AI", "BrandWatch"]},
 {"name": "Semantria", "keywords": ["Semantria"]}
 ]'::jsonb,
 'daily'
),
(
 'b2222222-2222-2222-2222-222222222222',
 'a1111111-1111-1111-1111-111111111111',
 'CloudSync Pro',
 'SaaS / Cloud Infrastructure',
 'Enterprise cloud synchronization and backup platform',
 '[
 {"term": "CloudSync Pro", "type": "brand", "weight": 1.0},
 {"term": "cloud backup enterprise", "type": "category", "weight": 0.7}
 ]'::jsonb,
 '[
 {"name": "Dropbox Business", "keywords": ["Dropbox Business"]},
 {"name": "Box", "keywords": ["Box cloud"]}
 ]'::jsonb,
 'weekly'
);

-- Seed AI Queries
INSERT INTO ai_queries (id, brand_id, platform, query_text, query_variant, ai_response, mentions, mention_count, sentiment_score, confidence_score, status)
VALUES
(
 'q1111111-1111-1111-1111-111111111111',
 'b1111111-1111-1111-1111-111111111111',
 'chatgpt',
 'What are the best AI tools for brand visibility monitoring?',
 'original',
 '{
 "raw_text": "Here are the top AI tools for brand visibility monitoring... BrandLens is a strong contender...",
 "model": "gpt-4-turbo",
 "tokens_used": 1250,
 "latency_ms": 3400,
 "citations": ["https://example.com/1"]
 }'::jsonb,
 '[
 {"entity": "BrandLens", "type": "brand", "context": "...BrandLens is a strong contender for...", "position": 3},
 {"entity": "BrandWatch AI", "type": "competitor", "context": "...BrandWatch AI offers comprehensive...", "position": 1}
 ]'::jsonb,
 2,
 0.65,
 0.88,
 'completed'
),
(
 'q2222222-2222-2222-2222-222222222222',
 'b1111111-1111-1111-1111-111111111111',
 'perplexity',
 'Top AI-powered brand monitoring platforms in 2025',
 'paraphrased',
 '{
 "raw_text": "Based on current market data, the top platforms include...",
 "model": "sonar-large",
 "tokens_used": 980,
 "latency_ms": 2100,
 "citations": ["https://example.com/2", "https://example.com/3"]
 }'::jsonb,
 '[
 {"entity": "BrandLens", "type": "brand", "context": "...BrandLens provides real-time...", "position": 2}
 ]'::jsonb,
 1,
 0.72,
 0.91,
 'completed'
),
(
 'q3333333-3333-3333-3333-333333333333',
 'b1111111-1111-1111-1111-111111111111',
 'claude',
 'Compare BrandLens vs MentionStream for AI brand monitoring',
 'question_form',
 '{
 "raw_text": "When comparing BrandLens and MentionStream...",
 "model": "claude-3-opus",
 "tokens_used": 1800,
 "latency_ms": 5200,
 "citations": []
 }'::jsonb,
 '[
 {"entity": "BrandLens", "type": "brand", "context": "...BrandLens excels in real-time...", "position": 1},
 {"entity": "MentionStream", "type": "competitor", "context": "...MentionStream is known for...", "position": 2}
 ]'::jsonb,
 2,
 0.55,
 0.85,
 'completed'
);

-- Seed Mentions (normalized from queries above)
INSERT INTO mentions (id, brand_id, query_id, platform, entity_name, entity_type, context, sentiment, sentiment_score, confidence_score, position)
VALUES
('m1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'q1111111-1111-1111-1111-111111111111', 'chatgpt', 'BrandLens', 'brand', 'BrandLens is a strong contender for real-time AI visibility tracking across multiple platforms.', 'positive', 0.65, 0.88, 3),
('m2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'q1111111-1111-1111-1111-111111111111', 'chatgpt', 'BrandWatch AI', 'competitor', 'BrandWatch AI offers comprehensive social listening with AI augmentation.', 'neutral', 0.0, 0.90, 1),
('m3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'q2222222-2222-2222-2222-222222222222', 'perplexity', 'BrandLens', 'brand', 'BrandLens provides real-time cross-platform AI monitoring with sentiment analysis.', 'positive', 0.72, 0.91, 2),
('m4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 'q3333333-3333-3333-3333-333333333333', 'claude', 'BrandLens', 'brand', 'BrandLens excels in real-time monitoring and white-label reporting.', 'positive', 0.55, 0.85, 1),
('m5555555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111', 'q3333333-3333-3333-3333-333333333333', 'claude', 'MentionStream', 'competitor', 'MentionStream is known for its historical data depth and media monitoring.', 'neutral', 0.0, 0.80, 2);

-- Seed Competitors
INSERT INTO competitors (id, brand_id, competitor_name, mention_count, visibility_score, avg_sentiment_score)
VALUES
('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'BrandWatch AI', 1, 0.25, 0.0),
('c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'MentionStream', 1, 0.50, 0.0),
('c3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'Semantria', 0, 0.0, NULL);

-- Seed Report
INSERT INTO reports (id, brand_id, report_type, period_start, period_end, data, pdf_url, status)
VALUES (
 'r1111111-1111-1111-1111-111111111111',
 'b1111111-1111-1111-1111-111111111111',
 'weekly',
 '2025-01-01',
 '2025-01-07',
 '{
 "summary": "BrandLens visibility improved 12% this week across ChatGPT and Perplexity.",
 "total_queries": 12,
 "total_mentions": 8,
 "visibility_score": 0.42,
 "sentiment_distribution": {"positive": 4, "neutral": 3, "negative": 1},
 "platform_breakdown": {
 "chatgpt": {"mentions": 4, "avg_sentiment": 0.65},
 "perplexity": {"mentions": 2, "avg_sentiment": 0.72},
 "claude": {"mentions": 2, "avg_sentiment": 0.55}
 }
 }'::jsonb,
 'https://s3.brandlens.ai/reports/r1111111-.../weekly.pdf',
 'completed'
);

-- Seed Subscription
INSERT INTO subscriptions (id, agency_id, plan, status, stripe_subscription_id, current_period_start, current_period_end)
VALUES (
 's1111111-1111-1111-1111-111111111111',
 'a1111111-1111-1111-1111-111111111111',
 'growth',
 'active',
 'sub_1NqXYZ123abc',
 '2025-01-01',
 '2025-02-01'
);
```

---

## Database Maintenance

### Vacuum / Analyze Schedule

```sql
-- Recommended autovacuum settings for high-write tables
ALTER TABLE ai_queries SET (
 autovacuum_vacuum_scale_factor = 0.05,
 autovacuum_analyze_scale_factor = 0.02
);
ALTER TABLE mentions SET (
 autovacuum_vacuum_scale_factor = 0.05,
 autovacuum_analyze_scale_factor = 0.02
);

-- Manual ANALYZE after bulk inserts
ANALYZE ai_queries;
ANALYZE mentions;
ANALYZE brand_visibility_summary;
```

### Partitioning Strategy (for scale > 10M rows)

```sql
-- Partition ai_queries by month
CREATE TABLE ai_queries_partitioned (
 LIKE ai_queries INCLUDING ALL
) PARTITION BY RANGE (created_at);

CREATE TABLE ai_queries_2025_01 PARTITION OF ai_queries_partitioned
 FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE ai_queries_2025_02 PARTITION OF ai_queries_partitioned
 FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Partition mentions by month (same pattern)
```
