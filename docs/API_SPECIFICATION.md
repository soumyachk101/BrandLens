# BrandLens — API Specification

## Base URL

```
Production: https://api.brandlens.ai/v1
Staging: https://staging-api.brandlens.ai/v1
```

## Authentication

All requests require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <API_KEY>
```

API keys are scoped to an agency. The key is passed via the `x-api-key` header for server-to-server integrations.

```
x-api-key: sk_live_abc123...
```

### Rate Limits

| Plan | Requests/min | Scans/day | Concurrent |
|------|-------------|-----------|------------|
| Starter | 60 | 100 | 2 |
| Growth | 300 | 1,000 | 5 |
| Enterprise | 1,000 | 10,000 | 20 |

Rate limit headers are returned on every response:

```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1704067200
Retry-After: 42
```

---

## Response Format

### Success Response

```json
{
 "success": true,
 "data": { ... },
 "meta": {
 "page": 1,
 "limit": 20,
 "total": 142,
 "total_pages": 8
 }
}
```

### Error Response

```json
{
 "success": false,
 "error": {
 "code": "VALIDATION_ERROR",
 "message": "The 'name' field is required.",
 "details": [
 { "field": "name", "message": "Name is required" }
 ],
 "request_id": "req_abc123xyz"
 }
}
```

### Standard Error Codes

| Code | HTTP Status | Description |
|------------------|-------------|----------------------------------------|
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `FORBIDDEN` | 403 | Valid key, but access denied to resource |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Request body validation failed |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | AI platform service temporarily down |

---

## Endpoints

---

## 1. Agencies

### 1.1 Get Current Agency

Returns the authenticated agency's details.

```
GET /agencies/me
```

**Response:**

```json
{
 "success": true,
 "data": {
 "id": "a1111111-1111-1111-1111-111111111111",
 "name": "Acme Digital Agency",
 "email": "admin@acmeagency.com",
 "plan": "growth",
 "white_label_config": {
 "logo_url": "https://acme.com/logo.png",
 "brand_name": "Acme Monitor",
 "primary_color": "#2563eb",
 "hide_powered_by": true
 },
 "brands_count": 12,
 "scans_this_month": 847,
 "created_at": "2024-06-15T10:00:00Z"
 }
}
```

### 1.2 Update Agency Settings

```
PATCH /agencies/me
```

**Request Body:**

```json
{
 "name": "Acme Digital Agency",
 "white_label_config": {
 "brand_name": "Acme Monitor Pro",
 "primary_color": "#7c3aed",
 "hide_powered_by": true
 }
}
```

**Response:** Updated agency object (same shape as GET).

---

## 2. Brands

### 2.1 List Brands

Returns all brands for the authenticated agency.

```
GET /brands?page=1&limit=20&search=Cloud&industry=SaaS&is_active=true
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `search` | string | - | Search brand name (case-insensitive) |
| `industry` | string | - | Filter by industry |
| `is_active` | boolean | - | Filter by active status |
| `sort` | string | `created_at` | Sort field |
| `order` | string | `desc` | Sort direction (`asc`, `desc`) |

**Response:**

```json
{
 "success": true,
 "data": [
 {
 "id": "b1111111-1111-1111-1111-111111111111",
 "name": "BrandLens",
 "industry": "MarTech / AI Analytics",
 "description": "AI-powered brand visibility monitoring platform",
 "keywords": [
 {"term": "BrandLens", "type": "brand", "weight": 1.0},
 {"term": "AI brand monitoring", "type": "category", "weight": 0.6}
 ],
 "competitors": [
 {"name": "MentionStream", "keywords": ["MentionStream", "MentionStream AI"]}
 ],
 "scan_frequency": "daily",
 "is_active": true,
 "last_scanned_at": "2025-01-06T08:30:00Z",
 "visibility_score": 0.42,
 "total_mentions": 89,
 "created_at": "2024-08-01T10:00:00Z"
 }
 ],
 "meta": {
 "page": 1,
 "limit": 20,
 "total": 1,
 "total_pages": 1
 }
}
```

### 2.2 Create Brand

```
POST /brands
```

**Request Body:**

```json
{
 "name": "CloudSync Pro",
 "industry": "SaaS / Cloud Infrastructure",
 "description": "Enterprise cloud sync platform",
 "website_url": "https://cloudsyncpro.com",
 "keywords": [
 {"term": "CloudSync Pro", "type": "brand", "weight": 1.0},
 {"term": "cloud backup enterprise", "type": "category", "weight": 0.7}
 ],
 "competitors": [
 {"name": "Dropbox Business", "keywords": ["Dropbox Business"]},
 {"name": "Box", "keywords": ["Box cloud"]}
 ],
 "scan_frequency": "weekly"
}
```

**Validation Rules:**

- `name`: required, 2-255 characters, unique per agency
- `industry`: optional, max 100 characters
- `keywords`: optional, array of objects with `term` (required, 1-100 chars) and `weight` (0.0-1.0)
- `competitors`: optional, array of objects with `name` and `keywords`
- `scan_frequency`: one of `hourly`, `daily`, `weekly`, `manual` (default: `daily`)

**Response:** `201 Created` with the new brand object.

### 2.3 Get Brand

```
GET /brands/{brand_id}
```

**Response:**

```json
{
 "success": true,
 "data": {
 "id": "b1111111-1111-1111-1111-111111111111",
 "name": "BrandLens",
 "industry": "MarTech / AI Analytics",
 "description": "AI-powered brand visibility monitoring platform",
 "keywords": [...],
 "competitors": [...],
 "scan_frequency": "daily",
 "is_active": true,
 "last_scanned_at": "2025-01-06T08:30:00Z",
 "visibility_score": 0.42,
 "total_mentions": 89,
 "created_at": "2024-08-01T10:00:00Z"
 }
}
```

### 2.4 Update Brand

```
PATCH /brands/{brand_id}
```

**Request Body:** Partial brand object (same fields as Create).

**Response:** `200 OK` with updated brand object.

### 2.5 Delete Brand

```
DELETE /brands/{brand_id}
```

**Response:** `204 No Content`

> Note: Deleting a brand cascades to ai_queries, mentions, competitors, and reports (soft-delete for reports).

### 2.6 Trigger Manual Scan

Starts an immediate scan for the brand across all configured platforms.

```
POST /brands/{brand_id}/scan
```

**Request Body (optional):**

```json
{
 "platforms": ["chatgpt", "perplexity"],
 "prompt_template_id": "pt-uuid-here",
 "query_variants": ["original", "paraphrased"]
}
```

**Response:**

```json
{
 "success": true,
 "data": {
 "scan_job_id": "sj-abc123",
 "brand_id": "b1111111-1111-1111-1111-111111111111",
 "status": "queued",
 "platforms": ["chatgpt", "perplexity"],
 "queries_total": 6,
 "estimated_duration_seconds": 90,
 "created_at": "2025-01-06T09:00:00Z"
 }
}
```

### 2.7 Get Brand Analytics

Aggregated analytics for a brand over a date range.

```
GET /brands/{brand_id}/analytics?from=2025-01-01&to=2025-01-31&granularity=day
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | date (ISO 8601) | Start date (inclusive) |
| `to` | date (ISO 8601) | End date (inclusive) |
| `granularity` | string | `hour`, `day`, `week`, `month` (default: `day`) |
| `platforms` | string | Comma-separated platform filter |
| `entity_type` | string | `brand`, `competitor`, `all` (default: `all`) |

**Response:**

```json
{
 "success": true,
 "data": {
 "brand_id": "b1111111-1111-1111-1111-111111111111",
 "period": {"from": "2025-01-01", "to": "2025-01-31"},
 "summary": {
 "total_queries": 142,
 "total_mentions": 89,
 "visibility_score": 0.42,
 "avg_sentiment": 0.61,
 "platforms_tracked": 4
 },
 "trends": [
 {"date": "2025-01-01", "queries": 12, "mentions": 7, "visibility": 0.38},
 {"date": "2025-01-02", "queries": 12, "mentions": 9, "visibility": 0.45}
 ],
 "sentiment_distribution": {
 "positive": 34,
 "neutral": 41,
 "negative": 14
 },
 "platform_breakdown": [
 {
 "platform": "chatgpt",
 "queries": 42,
 "mentions": 28,
 "visibility": 0.45,
 "avg_sentiment": 0.62
 },
 {
 "platform": "perplexity",
 "queries": 38,
 "mentions": 22,
 "visibility": 0.39,
 "avg_sentiment": 0.58
 }
 ],
 "top_queries": [
 {
 "query_text": "best AI brand monitoring tools",
 "platform": "chatgpt",
 "mention_count": 3,
 "avg_sentiment": 0.70
 }
 ],
 "keyword_performance": [
 {"term": "BrandLens", "mentions": 45, "avg_position": 2.3},
 {"term": "AI brand monitoring", "mentions": 12, "avg_position": 4.1}
 ]
 }
}
```

---

## 3. AI Queries

### 3.1 List Queries

```
GET /brands/{brand_id}/queries?page=1&limit=20&platform=chatgpt&from=2025-01-01&to=2025-01-31&status=completed
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `platform` | string | Filter by AI platform |
| `from` / `to` | date | Date range filter |
| `status` | string | Filter by status |
| `query_variant` | string | Filter by variant |
| `sentiment` | string | Filter by sentiment score range |
| `search` | string | Search query text |
| `sort` | string | `created_at`, `sentiment_score`, `confidence_score` (default: `created_at`) |
| `order` | string | `asc`, `desc` |

**Response:**

```json
{
 "success": true,
 "data": [
 {
 "id": "q1111111-1111-1111-1111-111111111111",
 "brand_id": "b1111111-1111-1111-1111-111111111111",
 "platform": "chatgpt",
 "query_text": "What are the best AI tools for brand visibility monitoring?",
 "query_variant": "original",
 "ai_response": {
 "raw_text": "...",
 "model": "gpt-4-turbo",
 "tokens_used": 1250,
 "latency_ms": 3400,
 "citations": ["https://..."]
 },
 "mentions": [
 {"entity": "BrandLens", "type": "brand", "position": 3}
 ],
 "mention_count": 2,
 "sentiment_score": 0.65,
 "confidence_score": 0.88,
 "status": "completed",
 "response_time_ms": 3400,
 "created_at": "2025-01-06T08:30:00Z"
 }
 ],
 "meta": { "page": 1, "limit": 20, "total": 142, "total_pages": 8 }
}
```

### 3.2 Get Query Detail

```
GET /queries/{query_id}
```

**Response:** Full query object including full `ai_response` and `mentions` arrays.

### 3.3 Get Query Mentions

Returns the normalized mention records for a single query.

```
GET /queries/{query_id}/mentions
```

**Response:**

```json
{
 "success": true,
 "data": [
 {
 "id": "m1111111-1111-1111-1111-111111111111",
 "query_id": "q1111111-1111-1111-1111-111111111111",
 "platform": "chatgpt",
 "entity_name": "BrandLens",
 "entity_type": "brand",
 "context": "BrandLens is a strong contender for real-time...",
 "sentiment": "positive",
 "sentiment_score": 0.65,
 "confidence_score": 0.88,
 "position": 3,
 "citation_urls": ["https://example.com/1"],
 "created_at": "2025-01-06T08:30:00Z"
 }
 ]
}
```

---

## 4. Mentions

### 4.1 List Mentions

```
GET /brands/{brand_id}/mentions?page=1&limit=20&platform=chatgpt&sentiment=positive&from=2025-01-01&to=2025-01-31&entity_type=brand,competitor
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `platform` | string | Filter by platform |
| `sentiment` | string | `positive`, `neutral`, `negative`, `mixed` |
| `from` / `to` | date | Date range |
| `entity_type` | string | Comma-separated entity types |
| `entity_name` | string | Filter by specific entity |
| `min_confidence` | float | Minimum confidence score (0.0-1.0) |
| `search` | string | Full-text search on context |
| `sort` | string | `created_at`, `sentiment_score`, `position` |
| `order` | string | `asc`, `desc` |

**Response:**

```json
{
 "success": true,
 "data": [
 {
 "id": "m1111111-1111-1111-1111-111111111111",
 "brand_id": "b1111111-1111-1111-1111-111111111111",
 "query_id": "q1111111-1111-1111-1111-111111111111",
 "platform": "chatgpt",
 "entity_name": "BrandLens",
 "entity_type": "brand",
 "context": "BrandLens is a strong contender for real-time AI visibility tracking...",
 "sentiment": "positive",
 "sentiment_score": 0.65,
 "confidence_score": 0.88,
 "position": 3,
 "citation_urls": ["https://example.com/1"],
 "created_at": "2025-01-06T08:30:00Z"
 }
 ],
 "meta": {
 "page": 1,
 "limit": 20,
 "total": 89,
 "total_pages": 5,
 "aggregations": {
 "sentiment_counts": {"positive": 34, "neutral": 41, "negative": 14},
 "platform_counts": {"chatgpt": 28, "perplexity": 22, "claude": 20},
 "avg_confidence": 0.86
 }
 }
}
```

### 4.2 Get Mention Feed

Real-time mention feed (new mentions first, paginated by cursor).

```
GET /brands/{brand_id}/mentions/feed?limit=20&after=m-uuid
```

**Response:**

```json
{
 "success": true,
 "data": [...],
 "meta": {
 "has_more": true,
 "next_cursor": "m-next-cursor-uuid"
 }
}
```

### 4.3 Get Sentiment Trends

```
GET /brands/{brand_id}/mentions/sentiment-trends?from=2025-01-01&to=2025-01-31&granularity=day
```

**Response:**

```json
{
 "success": true,
 "data": [
 {
 "date": "2025-01-01",
 "positive": 3,
 "neutral": 4,
 "negative": 1,
 "avg_sentiment": 0.42,
 "total_mentions": 8
 }
 ]
}
```

---

## 5. Competitors

### 5.1 List Competitors

```
GET /brands/{brand_id}/competitors
```

**Response:**

```json
{
 "success": true,
 "data": [
 {
 "id": "c1111111-1111-1111-1111-111111111111",
 "brand_id": "b1111111-1111-1111-1111-111111111111",
 "competitor_name": "BrandWatch AI",
 "mention_count": 42,
 "visibility_score": 0.35,
 "avg_sentiment_score": 0.12,
 "last_mentioned_at": "2025-01-06T08:30:00Z",
 "created_at": "2024-08-01T10:00:00Z",
 "updated_at": "2025-01-06T08:30:00Z"
 }
 ]
}
```

### 5.2 Add Competitor

```
POST /brands/{brand_id}/competitors
```

**Request Body:**

```json
{
 "name": "NewCompetitor",
 "keywords": ["NewCompetitor", "NC AI"]
}
```

**Response:** `201 Created` with new competitor object.

### 5.3 Remove Competitor

```
DELETE /brands/{brand_id}/competitors/{competitor_id}
```

**Response:** `204 No Content`

### 5.4 Get Competitor Comparison

Side-by-side visibility comparison between the brand and all tracked competitors.

```
GET /brands/{brand_id}/competitors/comparison?from=2025-01-01&to=2025-01-31
```

**Response:**

```json
{
 "success": true,
 "data": {
 "brand": {
 "name": "BrandLens",
 "visibility_score": 0.42,
 "mention_count": 89,
 "avg_sentiment": 0.61
 },
 "competitors": [
 {
 "name": "BrandWatch AI",
 "visibility_score": 0.35,
 "mention_count": 72,
 "avg_sentiment": 0.45,
 "trend": "up"
 },
 {
 "name": "MentionStream",
 "visibility_score": 0.28,
 "mention_count": 55,
 "avg_sentiment": 0.50,
 "trend": "down"
 }
 ],
 "period": {"from": "2025-01-01", "to": "2025-01-31"}
 }
}
```

---

## 6. Reports

### 6.1 List Reports

```
GET /brands/{brand_id}/reports?page=1&limit=20&report_type=weekly&from=2025-01-01&to=2025-01-31
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `report_type` | string | `weekly`, `monthly`, `quarterly`, `custom`, `competitor`, `sentiment` |
| `from` / `to` | date | Filter by creation date |
| `status` | string | `generating`, `completed`, `failed`, `sent` |

**Response:**

```json
{
 "success": true,
 "data": [
 {
 "id": "r1111111-1111-1111-1111-111111111111",
 "brand_id": "b1111111-1111-1111-1111-111111111111",
 "report_type": "weekly",
 "period_start": "2025-01-01",
 "period_end": "2025-01-07",
 "data": { "summary": "...", "total_queries": 142, ... },
 "pdf_url": "https://s3.brandlens.ai/reports/.../weekly.pdf",
 "html_url": "https://s3.brandlens.ai/reports/.../weekly.html",
 "status": "completed",
 "sent_at": "2025-01-07T09:00:00Z",
 "created_at": "2025-01-07T08:00:00Z"
 }
 ],
 "meta": { "page": 1, "limit": 20, "total": 12, "total_pages": 1 }
}
```

### 6.2 Generate Report

Queues a new report for async generation.

```
POST /brands/{brand_id}/reports
```

**Request Body:**

```json
{
 "report_type": "weekly",
 "period_start": "2025-01-01",
 "period_end": "2025-01-07",
 "send_to": ["client@example.com", "team@agency.com"],
 "format": ["pdf", "html"],
 "sections": ["overview", "mentions", "competitors", "sentiment", "trends"]
}
```

**Validation Rules:**

- `report_type`: required, one of `weekly`, `monthly`, `quarterly`, `custom`, `competitor`, `sentiment`
- `period_start` / `period_end`: required, valid date range (max 90 days for custom)
- `send_to`: optional, array of email addresses (max 10)
- `format`: optional, array of `pdf`, `html` (default: both)
- `sections`: optional, array of sections to include

**Response:**

```json
{
 "success": true,
 "data": {
 "report_id": "r-new-uuid",
 "status": "generating",
 "estimated_completion_seconds": 60,
 "created_at": "2025-01-07T08:00:00Z"
 }
}
```

### 6.3 Get Report

```
GET /reports/{report_id}
```

**Response:** Full report object (same shape as list response).

### 6.4 Download Report PDF

```
GET /reports/{report_id}/download?format=pdf
```

Returns a `302` redirect to the presigned S3 URL, or the file bytes directly depending on configuration.

### 6.5 Resend Report

Resends the completed report to specified recipients.

```
POST /reports/{report_id}/resend
```

**Request Body:**

```json
{
 "to": ["newrecipient@example.com"],
 "message": "Here is the latest weekly report."
}
```

**Response:**

```json
{
 "success": true,
 "data": {
 "report_id": "r1111111-1111-1111-1111-111111111111",
 "sent_to": ["newrecipient@example.com"],
 "sent_at": "2025-01-07T09:00:00Z"
 }
}
```

---

## 7. Scan Jobs

### 7.1 List Scan Jobs

```
GET /scan-jobs?brand_id=...&status=running&page=1&limit=20
```

**Response:**

```json
{
 "success": true,
 "data": [
 {
 "id": "sj-abc123",
 "brand_id": "b1111111-1111-1111-1111-111111111111",
 "platform": "chatgpt",
 "status": "running",
 "queries_total": 6,
 "queries_done": 3,
 "queries_failed": 0,
 "triggered_by": "scheduled",
 "started_at": "2025-01-06T08:30:00Z",
 "created_at": "2025-01-06T08:30:00Z"
 }
 ]
}
```

### 7.2 Get Scan Job

```
GET /scan-jobs/{job_id}
```

### 7.3 Cancel Scan Job

```
POST /scan-jobs/{job_id}/cancel
```

**Response:**

```json
{
 "success": true,
 "data": {
 "id": "sj-abc123",
 "status": "cancelled",
 "cancelled_at": "2025-01-06T08:35:00Z"
 }
}
```

---

## 8. Prompt Templates

### 8.1 List Prompt Templates

```
GET /prompt-templates?brand_id=...&platform=chatgpt&is_active=true
```

**Response:**

```json
{
 "success": true,
 "data": [
 {
 "id": "pt-uuid",
 "brand_id": "b1111111-1111-1111-1111-111111111111",
 "agency_id": "a1111111-1111-1111-1111-111111111111",
 "name": "Brand Comparison Query",
 "description": "Asks AI to compare our brand with competitors",
 "template": "You are a market analyst. Compare {{brand_name}} with {{competitors}}...",
 "variables": ["brand_name", "competitors", "industry"],
 "platform": "chatgpt",
 "is_default": false,
 "is_active": true,
 "created_at": "2024-09-01T10:00:00Z"
 }
 ]
}
```

### 8.2 Create Prompt Template

```
POST /prompt-templates
```

**Request Body:**

```json
{
 "brand_id": "b1111111-1111-1111-1111-111111111111",
 "name": "Brand Comparison Query",
 "description": "Asks AI to compare our brand with competitors",
 "template": "You are a market analyst. Compare {{brand_name}} with {{competitors}}...",
 "variables": ["brand_name", "competitors"],
 "platform": "chatgpt",
 "is_default": false
}
```

**Validation:**

- `name`: required, 2-255 characters
- `template`: required, 10-4000 characters, must be valid Handlebars-style template
- `platform`: required, valid platform
- `variables`: optional, derived from template, max 20 variables

**Response:** `201 Created` with template object.

### 8.3 Update Prompt Template

```
PATCH /prompt-templates/{template_id}
```

### 8.4 Delete Prompt Template

```
DELETE /prompt-templates/{template_id}
```

**Response:** `204 No Content`

---

## 9. Webhooks

### 9.1 List Webhook Events

```
GET /webhooks?event_type=mention.detected&from=2025-01-01&to=2025-01-31
```

**Response:**

```json
{
 "success": true,
 "data": [
 {
 "id": "wh-uuid",
 "event_type": "mention.detected",
 "payload": {
 "brand_name": "BrandLens",
 "platform": "chatgpt",
 "entity": "BrandLens",
 "sentiment": "positive",
 "context": "BrandLens is a strong contender..."
 },
 "delivery_status": "sent",
 "response_code": 200,
 "retry_count": 0,
 "created_at": "2025-01-06T08:30:00Z",
 "sent_at": "2025-01-06T08:30:05Z"
 }
 ]
}
```

### 9.2 Register Webhook Endpoint

```
POST /webhooks/endpoints
```

**Request Body:**

```json
{
 "url": "https://client-app.com/webhooks/brandlens",
 "events": ["mention.detected", "report.ready", "sentiment.spike"],
 "secret": "whsec_abc123"
}
```

**Response:** `201 Created` with webhook endpoint configuration.

---

## 10. Health & Status

### 10.1 Health Check

```
GET /health
```

**Response:**

```json
{
 "status": "healthy",
 "version": "1.2.0",
 "timestamp": "2025-01-06T08:00:00Z",
 "services": {
 "database": "healthy",
 "queue": "healthy",
 "ai_platforms": {
 "chatgpt": "healthy",
 "perplexity": "healthy",
 "claude": "healthy",
 "gemini": "degraded",
 "copilot": "healthy"
 }
 }
}
```

### 10.2 Platform Status

```
GET /status/platforms
```

Returns the current operational status of each integrated AI platform.

**Response:**

```json
{
 "success": true,
 "data": [
 {
 "platform": "chatgpt",
 "status": "operational",
 "latency_ms": 2100,
 "last_checked": "2025-01-06T08:00:00Z",
 "rate_limits": {
 "requests_per_minute": 3500,
 "tokens_per_minute": 150000
 }
 },
 {
 "platform": "perplexity",
 "status": "operational",
 "latency_ms": 1800,
 "last_checked": "2025-01-06T08:00:00Z"
 }
 ]
}
```

---

## Webhooks (Outbound)

BrandLens sends webhooks to registered endpoints for real-time event notifications.

### Events

| Event | Description | Payload |
|-----------------------|----------------------------------------|---------------------------------------------|
| `mention.detected` | New mention found for a brand | `{ brand_id, query_id, mention, platform }` |
| `sentiment.spike` | Sentiment changed significantly | `{ brand_id, old_score, new_score, change_pct }` |
| `report.ready` | Report generation completed | `{ report_id, brand_id, pdf_url, html_url }` |
| `report.failed` | Report generation failed | `{ report_id, brand_id, error }` |
| `scan.completed` | Scan job completed | `{ scan_job_id, brand_id, results }` |
| `scan.failed` | Scan job failed | `{ scan_job_id, brand_id, error }` |

### Webhook Delivery

- Retries up to 3 times with exponential backoff (1s, 5s, 30s)
- Payloads are signed with `X-BrandLens-Signature` header using HMAC-SHA256
- Includes `X-BrandLens-Delivery` header with delivery ID
- Expects `200-299` response within 10 seconds

```bash
# Example webhook payload
POST https://client-app.com/webhooks/brandlens
X-BrandLens-Signature: sha256=abc123...
X-BrandLens-Delivery: del-uuid-here
Content-Type: application/json

{
 "event": "mention.detected",
 "delivery_id": "del-uuid-here",
 "created_at": "2025-01-06T08:30:00Z",
 "data": {
 "brand_id": "b1111111-...",
 "brand_name": "BrandLens",
 "platform": "chatgpt",
 "mention": {
 "entity_name": "BrandLens",
 "entity_type": "brand",
 "sentiment": "positive",
 "context": "BrandLens is a strong contender..."
 }
 }
}
```

---

## SDKs & Code Examples

### Node.js

```js
const BrandLens = require('@brandlens/node-sdk');

const client = new BrandLens({
 apiKey: 'sk_live_abc123',
 baseURL: 'https://api.brandlens.ai/v1'
});

// Create a brand
const brand = await client.brands.create({
 name: 'MyBrand',
 industry: 'SaaS',
 keywords: [
 { term: 'MyBrand', type: 'brand', weight: 1.0 },
 { term: 'best SaaS tools', type: 'category', weight: 0.5 }
 ],
 competitors: [
 { name: 'CompetitorA', keywords: ['CompetitorA'] }
 ]
});

// Trigger a scan
const scan = await client.brands.scan(brand.id, {
 platforms: ['chatgpt', 'perplexity', 'claude']
});

// Get mentions
const mentions = await client.brands.mentions(brand.id, {
 from: '2025-01-01',
 to: '2025-01-31',
 sentiment: 'positive'
});
```

### Python

```python
from brandlens import BrandLensClient

client = BrandLensClient(api_key='sk_live_abc123')

# Create brand
brand = client.brands.create(
 name='MyBrand',
 industry='SaaS',
 keywords=[{'term': 'MyBrand', 'type': 'brand', 'weight': 1.0}],
 competitors=[{'name': 'CompetitorA', 'keywords': ['CompetitorA']}]
)

# Trigger scan
scan = client.brands.scan(brand['id'], platforms=['chatgpt', 'perplexity'])

# Get analytics
analytics = client.brands.analytics(
 brand['id'],
 from_date='2025-01-01',
 to_date='2025-01-31'
)

print(f"Visibility score: {analytics['summary']['visibility_score']}")
```

### cURL

```bash
# List brands
curl -H "Authorization: Bearer sk_live_abc123" \
 https://api.brandlens.ai/v1/brands

# Trigger scan
curl -X POST -H "Authorization: Bearer sk_live_abc123" \
 -H "Content-Type: application/json" \
 -d '{"platforms": ["chatgpt", "perplexity"]}' \
 https://api.brandlens.ai/v1/brands/b-uuid/scan

# Generate report
curl -X POST -H "Authorization: Bearer sk_live_abc123" \
 -H "Content-Type: application/json" \
 -d '{"report_type": "weekly", "period_start": "2025-01-01", "period_end": "2025-01-07"}' \
 https://api.brandlens.ai/v1/brands/b-uuid/reports
```
