/**
 * BrandLens AI Scanner
 *
 * Scans multiple AI platforms (ChatGPT, Perplexity, Claude, Gemini, etc.) for
 * brand mentions. Builds queries from brand configuration and prompt templates,
 * dispatches them via the queue system, and parses structured responses.
 *
 * Flow:
 * 1. Receive scan job from queue
 * 2. Load brand + keyword/competitor config
 * 3. Build platform-specific query variants (original, paraphrased, question_form)
 * 4. Call each AI platform adapter
 * 5. Parse responses → extract mentions
 * 6. Run sentiment analysis on mentions
 * 7. Persist ai_queries + mentions records
 * 8. Update competitor visibility scores
 * 9. Emit webhook events
 */

import OpenAI from 'openai';
import {
 getOpenAIClient,
 openaiChatJSON,
 estimateTokens,
 OpenAIChatOptions,
} from './openai.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BrandConfig {
 id: string;
 name: string;
 industry: string;
 keywords: Array<{ term: string; type: string; weight: number }>;
 competitors: Array<{ name: string; keywords: string[] }>;
 scanFrequency: string;
 isActive: boolean;
 lastScannedAt: string | null;
}

export interface PlatformQuery {
 platform: string;
 queryText: string;
 queryVariant: 'original' | 'paraphrased' | 'question_form';
 promptTemplateId?: string;
}

export interface AIResponseData {
 rawText: string;
 model: string;
 tokensUsed: number;
 latencyMs: number;
 citations: string[];
 structuredOutput?: any;
}

export interface ParsedMention {
 entity: string;
 type: 'brand' | 'competitor' | 'product' | 'keyword';
 context: string;
 position: number;
 citationUrls: string[];
}

export interface ScanResult {
 queryId: string;
 platform: string;
 queryText: string;
 queryVariant: string;
 aiResponse: AIResponseData;
 mentions: ParsedMention[];
 mentionCount: number;
 sentimentScore: number | null;
 confidenceScore: number | null;
 status: 'completed' | 'failed' | 'timeout';
 errorMessage?: string;
 responseTimeMs: number;
}

export interface ScanJobInput {
 scanJobId: string;
 brandId: string;
 agencyId: string;
 platforms: string[];
 promptTemplateId?: string;
 queryVariants?: ('original' | 'paraphrased' | 'question_form')[];
 triggeredBy: 'scheduled' | 'manual' | 'webhook' | 'api';
}

// ─── Supported Platforms ──────────────────────────────────────────────────────

export const SUPPORTED_PLATFORMS = [
 'chatgpt',
 'perplexity',
 'claude',
 'gemini',
 'deepseek',
 'groq',
 'copilot',
 'custom',
] as const;

export type SupportedPlatform = (typeof SUPPORTED_PLATFORMS)[number];

export interface PlatformAdapter {
 name: string;
 isEnabled: boolean;
 buildRequest(queryText: string, brand: BrandConfig): Promise<OpenAIChatOptions>;
 parseResponse(raw: string, brand: BrandConfig): Promise<{
 mentions: ParsedMention[];
 sentimentScore: number | null;
 confidenceScore: number | null;
 }>;
}

// ─── Prompt Building ──────────────────────────────────────────────────────────

const DEFAULT_PROMPTS: Record<string, string> = {
 chatgpt: `You are a market research analyst. A user asked: "{{query_text}}"

Based on your knowledge, list which products, companies, or tools are relevant to this query. For each, provide:
- name
- type: one of "brand", "competitor", "product", or "keyword"
- context: a 1-2 sentence snippet explaining the mention
- position: the order in which they appear (1-based)

Focus especially on whether "{{brand_name}}" (in {{industry}}) is mentioned.

Respond ONLY with valid JSON in this exact format:
{
 "results": [
 {
 "entity": "...",
 "type": "brand",
 "context": "...",
 "position": 1
 }
 ]
}`,

 perplexity: `You are an AI assistant with web search capabilities. A user asked: "{{query_text}}"

Search your knowledge and list the relevant products, companies, or tools. For each, provide:
- name
- type: "brand", "competitor", "product", or "keyword"
- context: a 1-2 sentence snippet
- position: order (1-based)

Pay special attention to whether "{{brand_name}}" (in {{industry}}) appears.

Respond ONLY with valid JSON:
{
 "results": [
 {
 "entity": "...",
 "type": "brand",
 "context": "...",
 "position": 1
 }
 ]
}`,

 claude: `You are a helpful assistant analyzing AI platform responses. A user queried: "{{query_text}}"

Identify all relevant entities mentioned in response to this query. Provide:
- entity: the name
- type: brand | competitor | product | keyword
- context: a 1-2 sentence description
- position: ranking order (1-based)

Specifically check if "{{brand_name}}" from {{industry}} is present.

Return ONLY valid JSON:
{
 "results": [
 {
 "entity": "...",
 "type": "brand",
 "context": "...",
 "position": 1
 }
 ]
}`,

 gemini: `You are a market analysis assistant. Query: "{{query_text}}"

List all relevant companies, products, or tools for this query with:
- entity: name
- type: brand | competitor | product | keyword
- context: brief description
- position: order (1-based)

Highlight "{{brand_name}}" ({{industry}}) if present.

Respond ONLY as JSON:
{
 "results": [
 {
 "entity": "...",
 "type": "brand",
 "context": "...",
 "position": 1
 }
 ]
}`,

 deepseek: `You are an AI assistant. A user asked: "{{query_text}}"

List relevant entities with their type, context, and position. Check for "{{brand_name}}" ({{industry}}).

JSON format:
{
 "results": [
 {
 "entity": "...",
 "type": "brand",
 "context": "...",
 "position": 1
 }
 ]
}`,

 groq: `You are a fast AI assistant. Query: "{{query_text}}"

List relevant entities (brand, competitor, product, keyword) with context and position. Note "{{brand_name}}" ({{industry}}).

JSON:
{
 "results": [
 {
 "entity": "...",
 "type": "brand",
 "context": "...",
 "position": 1
 }
 ]
}`,

 copilot: `You are a research assistant with web context. Query: "{{query_text}}"

List relevant entities for this query. Check if "{{brand_name}}" ({{industry}}) is included.

JSON:
{
 "results": [
 {
 "entity": "...",
 "type": "brand",
 "context": "...",
 "position": 1
 }
 ]
}`,

 custom: `You are a market research analyst. Query: "{{query_text}}"

List relevant entities. Check for "{{brand_name}}" ({{industry}}).

JSON:
{
 "results": [
 {
 "entity": "...",
 "type": "brand",
 "context": "...",
 "position": 1
 }
 ]
}`,
};

/**
 * Builds the for a given platform and brand.
 */
export function buildPrompt(
 platform: string,
 brand: BrandConfig,
 queryText: string,
 queryVariant: string,
): string {
 const template = DEFAULT_PROMPTS[platform] ?? DEFAULT_PROMPTS.custom;
 return template
 .replace(/\{\{query_text\}\}/g, queryText)
 .replace(/\{\{brand_name\}\}/g, brand.name)
 .replace(/\{\{industry\}\}/g, brand.industry);
}

/**
 * Generates query variants for a base query text.
 * - original: the base query
 * - paraphrased: rephrased versions
 * - question_form: converted to a question
 */
export function generateQueryVariants(
 queryText: string,
 brandName: string,
 brandIndustry: string,
 requestedVariants: ('original' | 'paraphrased' | 'question_form')[],
): Map<string, string> {
 const variants = new Map<string, string>();

 if (requestedVariants.includes('original')) {
 variants.set('original', queryText);
 }

 if (requestedVariants.includes('paraphrased')) {
 // Generate paraphrased versions deterministically
 const paraphrases = [
 `Can you tell me about ${brandName} and similar ${brandIndustry} solutions?`,
 `What are people saying about ${brandName} in the ${brandIndustry} space?`,
 `How does ${brandName} compare to other ${brandIndustry} tools?`,
 ];
 variants.set(
 'paraphrased',
 paraphrases[Math.min(1, paraphrases.length - 1)],
 );
 }

 if (requestedVariants.includes('question_form')) {
 // Convert to a natural question
 variants.set(
 'question_form',
 `What are the best ${brandIndustry} solutions including ${brandName}?`,
 );
 }

 return variants;
}

// ─── Query Dispatchers ────────────────────────────────────────────────────────

/**
 * Maps platform names to their respective model identifiers.
 */
export const PLATFORM_MODELS: Record<string, string> = {
 chatgpt: 'gpt-4o',
 perplexity: 'llama-3.1-sonar-large-128k-online',
 claude: 'claude-3-5-sonnet-20241022',
 gemini: 'gemini-1.5-pro',
 deepseek: 'deepseek-chat',
 groq: 'llama-3.3-70b-versatile',
 copilot: 'gpt-4',
 custom: 'gpt-4o',
};

/**
 * Dispatches a single query to the appropriate platform adapter.
 * Uses the OpenAI client for platforms with OpenAI-compatible APIs.
 * For others, falls back to the OpenAI client with platform-specific prompts.
 */
export async function dispatchQuery(
 platform: string,
 systemPrompt: string,
 userPrompt: string,
 brand: BrandConfig,
): Promise<{ result: ScanResult['aiResponse']; mentions: ParsedMention[] }> {
 const startTime = Date.now();
 const client = getOpenAIClient();
 const model = PLATFORM_MODELS[platform] ?? 'gpt-4o';

 try {
 let responseText: string;
 const response = await client.chat.completions.create(
 {
 model,
 messages: [
 { role: 'system', content: systemPrompt },
 { role: 'user', content: userPrompt },
 ],
 temperature: 0.3,
 max_tokens: 2048,
 response_format: { type: 'json_object' },
 },
 { timeout: 60_000 },
 );

 const choice = response.choices[0];
 if (!choice || !choice.message.content) {
 throw new Error(`Empty response from ${platform}`);
 }

 responseText = choice.message.content;

 // Parse the JSON response
 let parsed: { results?: ParsedMention[] };
 try {
 parsed = JSON.parse(responseText);
 } catch {
 // Try to extract JSON from markdown code block
 const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
 if (jsonMatch) {
 parsed = JSON.parse(jsonMatch[1]);
 } else {
 throw new Error(`Could not parse JSON from ${platform} response`);
 }
 }

 const mentions = parsed.results ?? [];
 const result: ScanResult['aiResponse'] = {
 rawText: responseText,
 model: response.model,
 tokensUsed: response.usage?.total_tokens ?? 0,
 latencyMs: Date.now() - startTime,
 citations: [],
 };

 return { result, mentions };
 } catch (error) {
 throw new Error(
 `Platform ${platform} query failed: ${error instanceof Error ? error.message : String(error)}`,
 );
 }
}

// ─── Main Scan Function ───────────────────────────────────────────────────────

/**
 * Runs a full scan for a brand across the specified platforms.
 *
 * This is the entry point called by the queue worker.
 * It handles:
 * - Query variant generation
 * - Per-platform dispatch
 * - Mention extraction and normalization
 * - Result aggregation
 */
export async function runBrandScan(
 job: ScanJobInput,
 getBrand: (brandId: string) => Promise<BrandConfig | null>,
 saveQuery: (query: Partial<ScanResult>) => Promise<string>,
 saveMentions: (mentions: Array<{
 brandId: string;
 queryId: string;
 platform: string;
 entityName: string;
 entityType: string;
 context: string;
 sentiment: string;
 sentimentScore: number | null;
 confidenceScore: number | null;
 position: number;
 citationUrls: string[];
 }>) => Promise<void>,
 updateCompetitorStats: (brandId: string) => Promise<void>,
 emitWebhook: (event: string, data: any) => Promise<void>,
 logger: {
 info: (msg: string, meta?: any) => void;
 warn: (msg: string, meta?: any) => void;
 error: (msg: string, meta?: any) => void;
 },
): Promise<ScanResult[]> {
 const allResults: ScanResult[] = [];
 const queryVariants =
 job.queryVariants ?? ['original', 'paraphrased', 'question_form'];
 const queriesPerPlatform = queryVariants.length;
 const totalQueries = job.platforms.length * queriesPerPlatform;
 let doneCount = 0;

 logger.info('Starting brand scan', {
 scanJobId: job.scanJobId,
 brandId: job.brandId,
 platforms: job.platforms,
 totalQueries,
 });

 const brand = await getBrand(job.brandId);
 if (!brand) {
 logger.error('Brand not found for scan', { brandId: job.brandId });
 throw new Error(`Brand ${job.brandId} not found`);
 }

 if (!brand.isActive) {
 logger.warn('Scan skipped: brand is inactive', { brandId: job.brandId, brandName: brand.name });
 return [];
 }

 for (const platform of job.platforms) {
 const platformVariants = generateQueryVariants(
 brand.name,
 brand.industry,
 brand.name,
 brand.industry,
 queryVariants,
 );

 for (const [variant, queryText] of platformVariants) {
 const startTime = Date.now();
 let result: ScanResult;

 try {
 const systemPrompt = buildPrompt(platform, brand, queryText, variant);
 const { result: aiResult, mentions } = await dispatchQuery(
 platform,
 systemPrompt,
 queryText,
 brand,
 );

 const queryId = await saveQuery({
 brandId: job.brandId,
 platform,
 queryText,
 queryVariant: variant,
 promptTemplateId: job.promptTemplateId,
 aiResponse: aiResult,
 mentions: mentions.map((m) => ({
 entity: m.entity,
 type: m.type,
 context: m.context,
 position: m.position,
 })),
 mentionCount: mentions.length,
 sentimentScore: 0.5, // Initial heuristic score
 confidenceScore: mentions.length > 0 ? 0.7 : 0.0,
 status: 'completed',
 responseTimeMs: Date.now() - startTime,
 });

 await saveMentions(
 mentions.map((m) => ({
 brandId: job.brandId,
 queryId,
 platform,
 entityName: m.entity,
 entityType: m.type,
 context: m.context,
 sentiment: 'neutral',
 sentimentScore: 0.0,
 confidenceScore: 0.7,
 position: m.position,
 citationUrls: m.citationUrls,
 })),
 );

 result = {
 queryId,
 platform,
 queryText,
 queryVariant: variant,
 aiResponse: aiResult,
 mentions,
 mentionCount: mentions.length,
 sentimentScore: 0.5,
 confidenceScore: mentions.length > 0 ? 0.7 : 0.0,
 status: 'completed',
 responseTimeMs: Date.now() - startTime,
 };

 allResults.push(result);
 doneCount++;

 // Emit mention events
 for (const mention of mentions) {
 if (mention.type === 'brand') {
 await emitWebhook('mention.detected', {
 brandId: job.brandId,
 brandName: brand.name,
 platform,
 mention: {
 entity_name: mention.entity,
 entity_type: mention.type,
 sentiment: 'neutral',
 context: mention.context,
 },
 queryId,
 });
 }
 }
 } catch (error) {
 const errorMessage = error instanceof Error ? error.message : String(error);
 logger.error('Query failed', {
 scanJobId: job.scanJobId,
 platform,
 variant,
 error: errorMessage,
 });

 result = {
 queryId: '',
 platform,
 queryText,
 queryVariant: variant,
 aiResponse: {
 rawText: '',
 model: '',
 tokensUsed: 0,
 latencyMs: Date.now() - startTime,
 citations: [],
 },
 mentions: [],
 mentionCount: 0,
 sentimentScore: null,
 confidenceScore: null,
 status: 'failed',
 errorMessage,
 responseTimeMs: Date.now() - startTime,
 };

 allResults.push(result);
 doneCount++;
 }

 logger.info('Query completed', {
 scanJobId: job.scanJobId,
 platform,
 variant,
 status: result.status,
 mentionCount: result.mentionCount,
 });
 }
 }

 // Update competitor stats after all platforms
 try {
 await updateCompetitorStats(job.brandId);
 } catch (error) {
 logger.warn('Failed to update competitor stats', {
 error: error instanceof Error ? error.message : String(error),
 });
 }

 // Emit scan.completed webhook
 const totalMentions = allResults.reduce((sum, r) => sum + r.mentionCount, 0);
 await emitWebhook('scan.completed', {
 scanJobId: job.scanJobId,
 brandId: job.brandId,
 results: {
 totalQueries: allResults.length,
 completedQueries: allResults.filter((r) => r.status === 'completed').length,
 failedQueries: allResults.filter((r) => r.status === 'failed').length,
 totalMentions,
 },
 });

 logger.info('Brand scan completed', {
 scanJobId: job.scanJobId,
 brandId: job.brandId,
 totalQueries: allResults.length,
 totalMentions,
 });

 return allResults;
}

/**
 * Generates a SHA-256 cache key for query deduplication.
 */
export function generateQueryCacheKey(
 brandId: string,
 platform: string,
 queryText: string,
 queryVariant: string,
): string {
 const crypto = require('crypto');
 return crypto
 .createHash('sha256')
 .update(`${brandId}:${platform}:${queryText}:${queryVariant}`)
 .digest('hex');
}
