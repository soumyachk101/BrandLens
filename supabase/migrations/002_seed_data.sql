-- BrandLens Database Seed Script
-- Run this after migrations to populate test data

-- ============================================================
-- SEED AGENCY
-- ============================================================

INSERT INTO agencies (id, name, email, plan, white_label_config, api_key, email_verified)
VALUES (
 'a1111111-1111-1111-1111-111111111111',
 'Acme Digital Agency',
 'admin@acmeagency.com',
 'growth',
 '{
 "logo_url": "https://acme.com/logo.png",
 "brand_name": "Acme Monitor",
 "primary_color": "#2563eb",
 "secondary_color": "#34a853",
 "domain": null,
 "custom_css": null,
 "custom_reports": {
 "header_text": "Weekly AI Visibility Report",
 "footer_text": "Confidential — prepared for Client XYZ",
 "footer_logo_url": null,
 "hide_powered_by": true
 },
 "sso_enabled": false,
 "saml_config": null
 }'::jsonb,
 'sk_live_abc123def456ghi789',
 TRUE
) ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- SEED BRANDS
-- ============================================================

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
) ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED AI QUERIES
-- ============================================================

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

-- ============================================================
-- SEED MENTIONS
-- ============================================================

INSERT INTO mentions (id, brand_id, query_id, platform, entity_name, entity_type, context, sentiment, sentiment_score, confidence_score, position)
VALUES
('m1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'q1111111-1111-1111-1111-111111111111', 'chatgpt', 'BrandLens', 'brand', 'BrandLens is a strong contender for real-time AI visibility tracking across multiple platforms.', 'positive', 0.65, 0.88, 3),
('m2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'q1111111-1111-1111-1111-111111111111', 'chatgpt', 'BrandWatch AI', 'competitor', 'BrandWatch AI offers comprehensive social listening with AI augmentation.', 'neutral', 0.0, 0.90, 1),
('m3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-1111-111111111111', 'q2222222-2222-2222-2222-222222222222', 'perplexity', 'BrandLens', 'brand', 'BrandLens provides real-time cross-platform AI monitoring with sentiment analysis.', 'positive', 0.72, 0.91, 2),
('m4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 'q3333333-3333-3333-3333-333333333333', 'claude', 'BrandLens', 'brand', 'BrandLens excels in real-time monitoring and white-label reporting.', 'positive', 0.55, 0.85, 1),
('m5555555-5555-5555-5555-555555555555', 'b1111111-1111-1111-1111-111111111111', 'q3333333-3333-3333-3333-333333333333', 'claude', 'MentionStream', 'competitor', 'MentionStream is known for its historical data depth and media monitoring.', 'neutral', 0.0, 0.80, 2);

-- ============================================================
-- SEED COMPETITORS
-- ============================================================

INSERT INTO competitors (id, brand_id, competitor_name, mention_count, visibility_score, avg_sentiment_score)
VALUES
('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'BrandWatch AI', 1, 0.25, 0.0),
('c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'MentionStream', 1, 0.50, 0.0),
('c3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'Semantria', 0, 0.0, NULL);

-- ============================================================
-- SEED REPORTS
-- ============================================================

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

-- ============================================================
-- SEED SUBSCRIPTION
-- ============================================================

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

-- ============================================================
-- SEED PROMPT TEMPLATES
-- ============================================================

INSERT INTO prompt_templates (id, brand_id, agency_id, name, description, template, variables, platform, is_default, is_active)
VALUES
(
 'pt1111111-1111-1111-1111-111111111111',
 NULL,
 'a1111111-1111-1111-1111-111111111111',
 'Brand Comparison Query',
 'Asks AI to compare our brand with competitors',
 'You are a market analyst. Compare {{brand_name}} with {{competitors}} in the {{industry}} space.',
 '["brand_name","competitors","industry"]',
 'chatgpt',
 FALSE,
 TRUE
),
(
 'pt2222222-2222-2222-2222-222222222222',
 'b1111111-1111-1111-1111-111111111111',
 'a1111111-1111-1111-1111-111111111111',
 'BrandLens Comparison',
 'Brand-specific comparison query',
 'Compare {{brand_name}} against {{competitors}} for brand monitoring capabilities.',
 '["brand_name","competitors"]',
 'claude',
 FALSE,
 TRUE
);

-- ============================================================
-- SEED SCAN JOBS
-- ============================================================

INSERT INTO scan_jobs (id, brand_id, agency_id, platform, status, queries_total, queries_done, queries_failed, triggered_by)
VALUES
('sj1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'chatgpt', 'completed', 4, 4, 0, 'scheduled'),
('sj2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'perplexity', 'completed', 4, 4, 0, 'scheduled');

-- ============================================================
-- SEED WEBHOOK EVENTS
-- ============================================================

INSERT INTO webhook_events (id, agency_id, event_type, payload, delivery_status)
VALUES
('wh1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'mention.detected', '{"brand_name":"BrandLens","platform":"chatgpt","entity":"BrandLens","sentiment":"positive"}'::jsonb, 'sent'),
('wh2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'scan.completed', '{"scan_job_id":"sj-abc","brand_id":"b-abc"}'::jsonb, 'sent');

-- ============================================================
-- SEED AGENCY USERS
-- ============================================================

INSERT INTO agency_users (user_id, agency_id, role, permissions)
VALUES ('a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'admin', '["brands:read","brands:write","reports:read","reports:write"]');

-- ============================================================
-- SEED WEBHOOK ENDPOINTS
-- ============================================================

INSERT INTO webhook_endpoints (agency_id, url, events, secret)
VALUES ('a1111111-1111-1111-1111-111111111111', 'https://acme.com/webhooks/brandlens', '{"mention.detected","report.ready"}', 'whsec_acme123');

-- ============================================================
-- REFRESH MATERIALIZED VIEWS
-- ============================================================

REFRESH MATERIALIZED VIEW brand_visibility_summary;
REFRESH MATERIALIZED VIEW brand_daily_trends;

-- ============================================================
-- VACUUM & ANALYZE
-- ============================================================

ANALYZE ai_queries;
ANALYZE mentions;
ANALYZE brand_visibility_summary;
ANALYZE brand_daily_trends;
