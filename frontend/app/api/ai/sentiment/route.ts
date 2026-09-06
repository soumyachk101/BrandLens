/**
 * POST /api/ai/sentiment
 *
 * Analyzes sentiment for a batch of mention texts using GPT-4o.
 * Accepts raw text snippets and returns labeled sentiment results.
 */

import OpenAI from "openai";
import type { SentimentBreakdown } from "../../../lib/types.js";

const DEFAULT_RETRY = { maxRetries: 3, baseDelayMs: 500, maxDelayMs: 5000 };

function sleep(ms: number): Promise<void> {
 return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
 let attempt = 0;
 const { maxRetries, baseDelayMs, maxDelayMs } = DEFAULT_RETRY;
 while (true) {
 try {
 return await fn();
 } catch (err) {
 attempt++;
 if (attempt >= maxRetries) {
 throw new Error(`[${label}] Failed after ${maxRetries} attempts: ${(err as Error).message}`);
 }
 const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
 console.warn(`[${label}] Attempt ${attempt} failed – retrying in ${delay}ms`, (err as Error).message);
 await sleep(delay);
 }
 }
}

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------

interface SentimentRequestBody {
 texts: string[];
}

interface SentimentResultItem {
 text: string;
 sentiment: "positive" | "neutral" | "negative";
 confidence: number;
}

interface SentimentResponse {
 results: SentimentResultItem[];
 breakdown: SentimentBreakdown;
}

// ---------------------------------------------------------------------------
// Heuristic fallback
// ---------------------------------------------------------------------------

function heuristicSentiment(text: string): { sentiment: "positive" | "neutral" | "negative"; confidence: number } {
 const positiveWords = ["great", "excellent", "best", "love", "recommend", "innovative", "leading", "amazing", "superior", "top", "outstanding", "trusted"];
 const negativeWords = ["poor", "bad", "worst", "hate", "avoid", "problem", "issue", "terrible", "flawed", "disappointing", "overpriced", "concern"];
 const words = text.toLowerCase().split(/\W+/);
 const pos = positiveWords.filter((w) => words.includes(w)).length;
 const neg = negativeWords.filter((w) => words.includes(w)).length;
 if (pos > neg) return { sentiment: "positive", confidence: Math.min(0.85, 0.5 + pos * 0.08) };
 if (neg > pos) return { sentiment: "negative", confidence: Math.min(0.85, 0.5 + neg * 0.08) };
 return { sentiment: "neutral", confidence: 0.6 };
}

// ---------------------------------------------------------------------------
// GPT-4o batch analysis
// ---------------------------------------------------------------------------

async function analyzeWithGPT4o(texts: string[], apiKey: string): Promise<SentimentResultItem[]> {
 const openai = new OpenAI({ apiKey });

 const prompt = `Analyze the sentiment of each text block below toward the brand being discussed. Respond ONLY with a JSON array where each element matches:
 { "sentiment": "positive" | "neutral" | "negative", "confidence": number 0-1 }

 Texts:
 ${texts.map((t, i) => `[${i}] "${t.slice(0, 2000)}"`).join("\n\n")}`;

 const result = await withRetry(
 async () =>
 openai.chat.completions.create({
 model: "gpt-4o",
 messages: [{ role: "user", content: prompt }],
 max_tokens: 1500,
 temperature: 0.1,
 }),
 "openai-sentiment-batch",
 );

 const raw = result.choices[0]?.message?.content ?? "[]";

 try {
 const parsed = JSON.parse(raw) as Array<{ sentiment?: string; confidence?: number }>;
 return texts.map((text, i) => {
 const item = parsed[i] ?? {};
 const valid = ["positive", "neutral", "negative"].includes(item.sentiment ?? "");
 return {
 text,
 sentiment: valid ? (item.sentiment as "positive" | "neutral" | "negative") : "neutral",
 confidence: typeof item.confidence === "number" ? Math.max(0, Math.min(1, item.confidence)) : 0.6,
 };
 });
 } catch {
 return texts.map((text) => {
 const h = heuristicSentiment(text);
 return { text, sentiment: h.sentiment, confidence: h.confidence };
 });
 }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function handleSentimentRequest(body: unknown): Promise<Response> {
 try {
 const { texts } = body as SentimentRequestBody;

 if (!texts || !Array.isArray(texts) || texts.length === 0) {
 return new Response(
 JSON.stringify({ error: "Request body must include a non-empty 'texts' array." }),
 { status: 400, headers: { "Content-Type": "application/json" } },
 );
 }

 if (texts.length > 100) {
 return new Response(
 JSON.stringify({ error: "Maximum 100 texts allowed per request." }),
 { status: 400, headers: { "Content-Type": "application/json" } },
 );
 }

 const apiKey = process.env.OPENAI_API_KEY;
 let results: SentimentResultItem[];

 if (apiKey) {
 try {
 results = await analyzeWithGPT4o(texts, apiKey);
 } catch (err) {
 console.warn("[api/sentiment] GPT-4o failed, falling back to heuristic:", (err as Error).message);
 results = texts.map((text) => {
 const h = heuristicSentiment(text);
 return { text, sentiment: h.sentiment, confidence: h.confidence };
 });
 }
 } else {
 results = texts.map((text) => {
 const h = heuristicSentiment(text);
 return { text, sentiment: h.sentiment, confidence: h.confidence };
 });
 }

 const breakdown: SentimentBreakdown = { positive: 0, neutral: 0, negative: 0, dominant: "neutral" };
 for (const r of results) {
 breakdown[r.sentiment]++;
 }
 const maxCount = Math.max(breakdown.positive, breakdown.neutral, breakdown.negative);
 if (maxCount === breakdown.positive) breakdown.dominant = "positive";
 else if (maxCount === breakdown.negative) breakdown.dominant = "negative";

 const response: SentimentResponse = { results, breakdown };

 return new Response(JSON.stringify(response), {
 status: 200,
 headers: { "Content-Type": "application/json" },
 });
 } catch (err) {
 console.error("[api/sentiment] Error:", (err as Error).message);
 return new Response(
 JSON.stringify({ error: "Sentiment analysis failed", message: (err as Error).message }),
 { status: 500, headers: { "Content-Type": "application/json" } },
 );
 }
}
