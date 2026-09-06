/**
 * Multi-Platform AI Scanner
 *
 * Queries multiple AI platforms (ChatGPT, Claude, Perplexity, Google AI Overviews)
 * for brand mentions and collects structured results.
 */

import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import type { BrandMention, Platform, ScanJob, VisibilityScore, NarrativeReport, SentimentBreakdown, AiProviderConfig } from "../types.js";

// ---------------------------------------------------------------------------
// Configuration & retry helpers
// ---------------------------------------------------------------------------

interface RetryOptions {
 maxRetries: number;
 baseDelayMs: number;
 maxDelayMs: number;
}

const DEFAULT_RETRY: RetryOptions = {
 maxRetries: 3,
 baseDelayMs: 500,
 maxDelayMs: 5000,
};

function sleep(ms: number): Promise<void> {
 return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(
 fn: () => Promise<T>,
 label: string,
 opts: RetryOptions = DEFAULT_RETRY,
): Promise<T> {
 let attempt = 0;
 while (true) {
 try {
 return await fn();
 } catch (err) {
 attempt++;
 if (attempt >= opts.maxRetries) {
 throw new Error(`[${label}] Failed after ${opts.maxRetries} attempts: ${(err as Error).message}`);
 }
 const delay = Math.min(opts.baseDelayMs * 2 ** (attempt - 1), opts.maxDelayMs);
 console.warn(`[${label}] Attempt ${attempt} failed – retrying in ${delay}ms`, (err as Error).message);
 await sleep(delay);
 }
 }
}

// ---------------------------------------------------------------------------
// OpenAI (ChatGPT) scanner
// ---------------------------------------------------------------------------

async function scanChatGPT(
 brandName: string,
 query: string,
 config: AiProviderConfig,
): Promise<{ response: string; position: number }> {
 const openai = new OpenAI({ apiKey: config.openaiApiKey });

 const prompt = `You are a research assistant. Answer the following question truthfully. If the brand "${brandName}" is relevant, mention it.${"\n\n"}Question: ${query}${"\n\n"}Please provide a concise, factual answer.`;

 const result = await withRetry(
 async () =>
 openai.chat.completions.create({
 model: "gpt-4o",
 messages: [{ role: "user", content: prompt }],
 max_tokens: 1024,
 temperature: 0.2,
 }),
 "openai-chatgpt",
 );

 const response = result.choices[0]?.message?.content ?? "";
 // Position is a proxy: how far into the response the brand first appears (0-indexed char)
 const position = response.toLowerCase().indexOf(brandName.toLowerCase());
 return { response, position: position === -1 ? -1 : position };
}

// ---------------------------------------------------------------------------
// Anthropic (Claude) scanner
// ---------------------------------------------------------------------------

async function scanClaude(
 brandName: string,
 query: string,
 config: AiProviderConfig,
): Promise<{ response: string; position: number }> {
 const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });

 const prompt = `You are a research assistant. Answer the following question truthfully. If the brand "${brandName}" is relevant, mention it.${"\n\n"}Question: ${query}${"\n\n"}Please provide a concise, factual answer.`;

 const result = await withRetry(
 async () =>
 anthropic.messages.create({
 model: "claude-sonnet-4-20250514",
 max_tokens: 1024,
 temperature: 0.2,
 messages: [{ role: "user", content: prompt }],
 }),
 "anthropic-claude",
 );

 const textBlock = result.content.find((b) => b.type === "text");
 const response = textBlock?.type === "text" ? textBlock.text : "";
 const position = response.toLowerCase().indexOf(brandName.toLowerCase());
 return { response, position: position === -1 ? -1 : position };
}

// ---------------------------------------------------------------------------
// Perplexity scanner
// ---------------------------------------------------------------------------

async function scanPerplexity(
 brandName: string,
 query: string,
 _config: AiProviderConfig,
): Promise<{ response: string; position: number }> {
 // Perplexity uses an OpenAI-compatible chat-completions endpoint.
 const perplexityApiKey = _config.perplexityApiKey;
 const resp = await withRetry(
 async () =>
 fetch("https://api.perplexity.ai/chat/completions", {
 method: "POST",
 headers: {
 "Content-Type": "application/json",
 Authorization: `Bearer ${perplexityApiKey}`,
 },
 body: JSON.stringify({
 model: "sonar",
 messages: [
 {
 role: "user",
 content: `Answer this question concisely. If the brand "${brandName}" is relevant, mention it.\n\nQuestion: ${query}`,
 },
 ],
 max_tokens: 1024,
 temperature: 0.2,
 }),
 }),
 "perplexity-api",
 );

 if (!resp.ok) {
 const body = await resp.text();
 throw new Error(`Perplexity API responded ${resp.status}: ${body}`);
 }

 const data = (await resp.json()) as { choices?: { message?: { content?: string } }[] };
 const response = data.choices?.[0]?.message?.content ?? "";
 const position = response.toLowerCase().indexOf(brandName.toLowerCase());
 return { response, position: position === -1 ? -1 : position };
}

// ---------------------------------------------------------------------------
// Google AI Overviews (simulated via Google Search API)
// ---------------------------------------------------------------------------

async function scanGoogleAIOverview(
 brandName: string,
 query: string,
 _config: AiProviderConfig,
): Promise<{ response: string; position: number }> {
 // Google AI Overviews does not expose a public API.
 // We query the Custom Search JSON API and extract the AI-generated snippets.
 const apiKey = _config.openaiApiKey; // reuse any valid key – the endpoint is Google-side
 const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

 if (!cx) {
 throw new Error("GOOGLE_SEARCH_ENGINE_ID is not set – cannot query Google AI Overviews");
 }

 const searchUrl = new URL("https://www.googleapis.com/customsearch/v1");
 searchUrl.searchParams.set("key", apiKey);
 searchUrl.searchParams.set("cx", cx);
 searchUrl.searchParams.set("q", query);
 searchUrl.searchParams.set("num", "5");

 const resp = await withRetry(async () => fetch(searchUrl.toString()), "google-search");

 if (!resp.ok) {
 const body = await resp.text();
 throw new Error(`Google Search API responded ${resp.status}: ${body}`);
 }

 const data = (await resp.json()) as {
 items?: { snippet?: string; title?: string; link?: string }[];
 };

 const snippets = (data.items ?? [])
 .filter((item) => item.snippet && item.snippet.length > 0)
 .map((item) => item.snippet)
 .join(" ");

 const response = snippets || "No Google AI Overview results available.";
 const position = response.toLowerCase().indexOf(brandName.toLowerCase());
 return { response, position: position === -1 ? -1 : position };
}

// ---------------------------------------------------------------------------
// Platform dispatch
// ---------------------------------------------------------------------------

type ScanFn = (
 brandName: string,
 query: string,
 config: AiProviderConfig,
) => Promise<{ response: string; position: number }>;

const PLATFORM_SCANNERS: Record<string, ScanFn> = {
 chatgpt: scanChatGPT,
 claude: scanClaude,
 perplexity: scanPerplexity,
 google_ai_overview: scanGoogleAIOverview,
};

// ---------------------------------------------------------------------------
// Sentiment & competitor extraction (lightweight NLP heuristics)
// ---------------------------------------------------------------------------

function extractSentiment(text: string, brandName: string): { sentiment: "positive" | "neutral" | "negative"; confidence: number } {
 const positiveWords = ["great", "excellent", "best", "love", "recommend", "innovative", "leading", "amazing", "superior", "top", "outstanding"];
 const negativeWords = ["poor", "bad", "worst", "hate", "avoid", "problem", "issue", "terrible", "flawed", "disappointing", "overpriced"];
 const words = text.toLowerCase().split(/\W+/);
 const pos = positiveWords.filter((w) => words.includes(w)).length;
 const neg = negativeWords.filter((w) => words.includes(w)).length;

 if (pos > neg) return { sentiment: "positive", confidence: Math.min(0.9, 0.5 + pos * 0.1) };
 if (neg > pos) return { sentiment: "negative", confidence: Math.min(0.9, 0.5 + neg * 0.1) };
 return { sentiment: "neutral", confidence: 0.6 };
}

function extractCompetitors(text: string, brandName: string, competitors: string[]): string[] {
 const lower = text.toLowerCase();
 return competitors.filter((c) => c.toLowerCase() !== brandName.toLowerCase() && lower.includes(c.toLowerCase()));
}

// ---------------------------------------------------------------------------
// Main entry: scan a brand across platforms
// ---------------------------------------------------------------------------

export async function scanBrandAcrossPlatforms(
 brandName: string,
 queries: string[],
 platforms: string[],
 config: AiProviderConfig,
 competitors: string[] = [],
): Promise<ScanJob> {
 const jobId = crypto.randomUUID();
 const job: ScanJob = {
 id: jobId,
 brandName,
 queries,
 platforms: platforms as Platform[],
 status: "running",
 mentions: [],
 totalMentions: 0,
 visibilityScore: null,
 sentimentBreakdown: null,
 narrativeSummary: null,
 createdAt: new Date().toISOString(),
 startedAt: new Date().toISOString(),
 };

 try {
 for (const platform of platforms) {
 const scanner = PLATFORM_SCANNERS[platform];
 if (!scanner) {
 console.warn(`No scanner registered for platform "${platform}" – skipping.`);
 continue;
 }

 for (const query of queries) {
 try {
 const { response, position } = await scanner(brandName, query, config);
 const mentioned = response.toLowerCase().includes(brandName.toLowerCase());
 const { sentiment, confidence } = extractSentiment(response, brandName);
 const competitorsFound = extractCompetitors(response, brandName, competitors);

 const mention = {
 id: crypto.randomUUID(),
 platform: platform as Platform,
 query,
 brandName,
 mentioned,
 snippet: response.slice(0, 500),
 fullResponse: response,
 sentiment,
 confidence,
 position: position === -1 ? 999 : position,
 competitorsMentioned: competitorsFound,
 sourceUrl: platform === "google_ai_overview" ? "https://www.google.com/search" : undefined,
 scannedAt: new Date().toISOString(),
 } as BrandMention;

 job.mentions.push(mention);
 } catch (err) {
 console.error(`Scan error [${platform}] query="${query}":`, (err as Error).message);
 }
 }
 }

 job.totalMentions = job.mentions.filter((m) => m.mentioned).length;
 job.status = "completed";
 job.completedAt = new Date().toISOString();
 } catch (err) {
 job.status = "failed";
 job.error = (err as Error).message;
 job.completedAt = new Date().toISOString();
 }

 return job;
}
