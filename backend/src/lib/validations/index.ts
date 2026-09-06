import { z } from 'zod';

// Pagination
export const paginationSchema = z.object({
 page: z.coerce.number().int().positive().default(1),
 limit: z.coerce.number().int().positive().max(100).default(20),
 sort: z.string().optional(),
 order: z.enum(['asc', 'desc']).default('desc'),
});

// Agencies
export const signupSchema = z.object({
 name: z.string().min(2, 'Name must be at least 2 characters').max(255),
 email: z.string().email('Invalid email address'),
 password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateAgencySchema = z.object({
 name: z.string().min(2).max(255).optional(),
 white_label_config: z.record(z.any()).optional(),
});

// Brands
export const createBrandSchema = z.object({
 name: z.string().min(2, 'Name must be at least 2 characters').max(255),
 industry: z.string().max(100).optional().nullable(),
 description: z.string().optional().nullable(),
 website_url: z.string().url().optional().nullable(),
 logo_url: z.string().url().optional().nullable(),
 keywords: z.array(z.object({
 term: z.string().min(1).max(100),
 type: z.enum(['brand', 'product', 'category']).default('brand'),
 weight: z.coerce.number().min(0).max(1).default(1.0),
 })).optional().default([]),
 competitors: z.array(z.object({
 name: z.string().min(1).max(255),
 keywords: z.array(z.string()).default([]),
 })).optional().default([]),
 scan_frequency: z.enum(['hourly', 'daily', 'weekly', 'manual']).default('daily'),
});

export const updateBrandSchema = createBrandSchema.partial();

export const brandFilterSchema = z.object({
 search: z.string().optional(),
 industry: z.string().optional(),
 is_active: z.coerce.boolean().optional(),
 page: z.coerce.number().int().positive().default(1),
 limit: z.coerce.number().int().positive().max(100).default(20),
 sort: z.string().default('created_at'),
 order: z.enum(['asc', 'desc']).default('desc'),
});

// Queries
export const queryFilterSchema = z.object({
 platform: z.string().optional(),
 from: z.string().optional(),
 to: z.string().optional(),
 status: z.string().optional(),
 query_variant: z.string().optional(),
 sentiment: z.string().optional(),
 search: z.string().optional(),
 sort: z.string().default('created_at'),
 order: z.enum(['asc', 'desc']).default('desc'),
 page: z.coerce.number().int().positive().default(1),
 limit: z.coerce.number().int().positive().max(100).default(20),
});

// Mentions
export const mentionFilterSchema = z.object({
 platform: z.string().optional(),
 sentiment: z.enum(['positive', 'neutral', 'negative', 'mixed']).optional(),
 from: z.string().optional(),
 to: z.string().optional(),
 entity_type: z.string().optional(),
 entity_name: z.string().optional(),
 min_confidence: z.coerce.number().min(0).max(1).optional(),
 search: z.string().optional(),
 sort: z.string().default('created_at'),
 order: z.enum(['asc', 'desc']).default('desc'),
 page: z.coerce.number().int().positive().default(1),
 limit: z.coerce.number().int().positive().max(100).default(20),
});

// Reports
export const createReportSchema = z.object({
 report_type: z.enum(['weekly', 'monthly', 'quarterly', 'custom', 'competitor', 'sentiment']),
 period_start: z.string(),
 period_end: z.string(),
 send_to: z.array(z.string().email()).max(10).optional().default([]),
 format: z.array(z.enum(['pdf', 'html'])).optional().default(['pdf', 'html']),
 sections: z.array(z.string()).optional().default(['overview', 'mentions', 'competitors', 'sentiment', 'trends']),
});

export const reportFilterSchema = z.object({
 report_type: z.string().optional(),
 from: z.string().optional(),
 to: z.string().optional(),
 status: z.string().optional(),
 page: z.coerce.number().int().positive().default(1),
 limit: z.coerce.number().int().positive().max(100).default(20),
});

// Competitors
export const addCompetitorSchema = z.object({
 name: z.string().min(1, 'Name is required').max(255),
 keywords: z.array(z.string()).default([]),
});

// Scan
export const triggerScanSchema = z.object({
 platforms: z.array(z.string()).optional().default(['chatgpt', 'perplexity', 'claude']),
 prompt_template_id: z.string().optional(),
 query_variants: z.array(z.enum(['original', 'paraphrased', 'question_form'])).optional().default(['original']),
});

// Subscriptions / Webhooks
export const registerWebhookSchema = z.object({
 url: z.string().url('Invalid webhook URL'),
 events: z.array(z.string()).min(1, 'At least one event is required'),
 secret: z.string().optional(),
});

// Analytics
export const analyticsSchema = z.object({
 from: z.string(),
 to: z.string(),
 granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
 platforms: z.string().optional(),
 entity_type: z.string().default('all'),
});

export const sentimentTrendsSchema = z.object({
 from: z.string(),
 to: z.string(),
 granularity: z.enum(['hour', 'day', 'week', 'month']).default('day'),
});

export const competitorComparisonSchema = z.object({
 from: z.string(),
 to: z.string(),
});
