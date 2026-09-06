/**
 * Sentiment Analyzer
 *
 * Analyzes sentiment of brand mentions using GPT-4o via OpenAI SDK.
 * Falls back to heuristic analysis when the API key is not configured.
 */

import OpenAI from "openai";
import type { BrandMention, SentimentBreakdown } from "../types.js";

const DEFAULT_RETRY = { maxRetries: 3, baseDelayMs: 500, maxDelayMs: 5000 };

function sleep(ms: number): Promise<void> {
 return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(
 fn: () => Promise<T>,
 label: string,
): Promise<T> {
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
// Heuristic fallback sentiment analyzer
// ---------------------------------------------------------------------------

function heuristicSentiment(text: string): { sentiment: "positive" | "neutral" | "negative"; confidence: number } {
 const positiveWords = ["great", "excellent", "best", "love", "recommend", "innovative", "leading", "amazing", "superior", "top", "outstanding", "trusted", "reliable", "award-winning"];
 const negativeWords = ["poor", "bad", "worst", "hate", "avoid", "problem", "issue", "terrible", "flawed", "disappointing", "overpriced", "concern", "risk", "failure", "scandal"];
 const words = text.toLowerCase().split(/\W+/);
 const pos = positiveWords.filter((w) => words.includes(w)).length;
 const neg = negativeWords.filter((w) => words.includes(w)).length;
 if (pos > neg) return { sentiment: "positive", confidence: Math.min(0.85, 0.5 + pos * 0.08) };
 if (neg > pos) return { sentiment: "negative", confidence: Math.min(0.85, 0.5 + neg * 0.08) };
 return { sentiment: "neutral", confidence: 0.6 };
}

// ---------------------------------------------------------------------------
// GPT-4o sentiment analysis
// ---------------------------------------------------------------------------

interface SentimentResult {
 sentiment: "positive" | "neutral" | "negative";
 confidence: number;
 reasoning: string;
}

async function analyzeWithGPT4o(text: string, apiKey: string): Promise<SentimentResult> {
 const openai = new OpenAI({ apiKey });

 const prompt = `Analyze the sentiment of the following brand mention toward the brand being discussed. Respond ONLY with valid JSON matching this schema:
 {
 "sentiment": "positive" | "neutral" | "negative",
 "confidence": number between 0 and 1,
 "reasoning": "brief explanation"
 }

 Brand mention text:
 "${text.slice(0, 3000)}"`;

 const result = await withRetry(
 async () =>
 openai.chat.completions.create({
 model: "gpt-4o",
 messages: [{ role: "user", content: prompt }],
 max_tokens: 200,
 temperature: 0.1,
 }),
 "openai-sentiment",
 );

 const raw = result.choices[0]?.message?.content ?? '{"sentiment":"neutral","confidence":0.5,"reasoning":"empty response"}';

 try {
 const parsed = JSON.parse(raw) as SentimentResult;
 if (["positive", "neutral", "negative"].includes(parsed.sentiment)) {
 return {
 sentiment: parsed.sentiment,
 confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.6)),
 reasoning: parsed.reasoning,
 };
 }
 } catch {
 // fall through to heuristic
 }
 return heuristicSentiment(text);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function analyzeMentionSentiment(
 mention: BrandMention,
 apiKey?: string,
): Promise<BrandMention> {
 if (apiKey) {
 try {
 const result = await analyzeWithGPT4o(mention.fullResponse, apiKey);
 return { ...mention, sentiment: result.sentiment, confidence: result.confidence };
 } catch (err) {
 console.warn(`GPT-4o sentiment analysis failed for mention ${mention.id}, falling back to heuristic:`, (err as Error).message);
 }
 }
 const fallback = heuristicSentiment(mention.fullResponse);
 return { ...mention, sentiment: fallback.sentiment, confidence: fallback.confidence };
}

export async function analyzeMentionsSentiment(
 mentions: BrandMention[],
 apiKey?: string,
): Promise<BrandMention[]> {
 const results: BrandMention[] = [];
 for (const mention of mentions) {
 results.push(await analyzeMentionSentiment(mention, apiKey));
 }
 return results;
}

export function computeSentimentBreakdown(mentions: BrandMention[]): SentimentBreakdown {
 const breakdown: SentimentBreakdown = {
 positive: 0,
 neutral: 0,
 negative: 0,
 dominant: "neutral",
 };

 for (const m of mentions) {
 breakdown[m.sentiment]++;
 }

 const max = Math.max(breakdown.positive, breakdown.neutral, breakdown.negative);
 if (max === breakdown.positive) breakdown.dominant = "positive";
 else if (max === breakdown.negative) breakdown.dominant = "negative";

 return breakdown;
}
