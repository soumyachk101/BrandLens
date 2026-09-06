/**
 * Sentiment Analyzer
 *
 * Two-pass sentiment analysis pipeline:
 * 1. Heuristic (sync) - AFINN-165 + VADER lexicon for fast classification
 * 2. LLM-based (async) - GPT-4o-mini / Claude Haiku for accurate scoring
 *
 * Sentiment labels: positive | neutral | negative | mixed
 * Score range: -1.0 (very negative) to 1.0 (very positive)
 */

import { getOpenAIClient } from './openai.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SentimentLabel = 'positive' | 'neutral' | 'negative' | 'mixed';

export interface SentimentResult {
 label: SentimentLabel;
 score: number; // -1.0 to 1.0
 confidence: number; // 0.0 to 1.0
 reasoning?: string;
}

export interface MentionWithContext {
 id?: string;
 context: string;
 entityName: string;
 entityType: string;
 platform: string;
}

export interface BatchSentimentOptions {
 useLLM?: boolean;
 llmModel?: string;
 batchSize?: number;
}

// ─── AFINN-165 Lexicon (abbreviated - core sentiment words) ───────────────────

const AFINN_SCORES: Record<string, number> = {
 // Positive words
 'good': 3,
 'great': 3,
 'excellent': 3,
 'amazing': 4,
 'awesome': 4,
 'fantastic': 4,
 'wonderful': 3,
 'best': 3,
 'love': 3,
 'loved': 3,
 'like': 2,
 'liked': 2,
 'happy': 3,
 'pleased': 2,
 'recommend': 2,
 'recommended': 2,
 'impressive': 3,
 'valuable': 2,
 'helpful': 2,
 'innovative': 3,
 'powerful': 2,
 'reliable': 2,
 'fast': 1,
 'easy': 2,
 'simple': 1,
 'top': 2,
 'favorite': 3,
 'favourite': 3,
 'brilliant': 3,
 'outstanding': 4,
 'superb': 4,
 'perfect': 3,
 'strong': 2,
 'solid': 2,
 'worth': 1,
 'worthwhile': 2,
 'leads': 1,
 'leading': 2,
 'leader': 2,
 'win': 2,
 'winner': 2,
 'wins': 2,
 'success': 2,
 'successful': 2,
 'better': 2,
 'improved': 2,
 'improvement': 2,
 'benefit': 2,
 'beneficial': 2,
 'advantages': 2,
 'pros': 1,
 'strengths': 1,
 // Negative words
 'bad': -3,
 'terrible': -3,
 'horrible': -3,
 'awful': -3,
 'worst': -3,
 'hate': -3,
 'hated': -3,
 'poor': -2,
 'disappointing': -2,
 'disappointed': -2,
 'slow': -1,
 'difficult': -2,
 'hard': -1,
 'problem': -2,
 'problems': -2,
 'issue': -2,
 'issues': -2,
 'error': -2,
 'errors': -2,
 'bug': -2,
 'bugs': -2,
 'fail': -2,
 'failed': -2,
 'failure': -2,
 'crash': -2,
 'crashes': -2,
 'broken': -2,
 'worse': -3,
 'worst': -3,
 'useless': -3,
 'waste': -2,
 'wasted': -2,
 'frustrating': -2,
 'frustrated': -2,
 'annoying': -2,
 'annoyed': -2,
 'confusing': -2,
 'complicated': -1,
 'unreliable': -2,
 'weak': -1,
 'limitation': -1,
 'limitations': -1,
 'missing': -1,
 'lack': -1,
 'lacks': -1,
 'avoid': -2,
 'avoided': -2,
 'risk': -1,
 'risks': -1,
 'dangerous': -2,
 'threat': -2,
 'threatening': -2,
 'lose': -2,
 'losing': -2,
 'loss': -2,
 'lost': -2,
 'decline': -2,
 'declining': -2,
 'drop': -1,
 'dropped': -1,
 'falling': -1,
 'fallen': -1,
 'cons': -1,
 'weakness': -1,
 'weaknesses': -1,
 'flaw': -2,
 'flaws': -2,
 'flawed': -2,
};

// ─── VADER-inspired intensifiers ─────────────────────────────────────────────

const INTENSIFIERS: Record<string, number> = {
 'very': 0.5,
 'really': 0.5,
 'extremely': 0.5,
 'incredibly': 0.5,
 'absolutely': 0.5,
 'totally': 0.5,
 'completely': 0.5,
 'utterly': 0.5,
 'highly': 0.4,
 'quite': 0.3,
 'rather': 0.3,
 'somewhat': 0.2,
 'slightly': 0.2,
 'barely': -0.2,
 'hardly': -0.2,
 'not': -0.5,
 'no': -0.5,
 'never': -0.5,
 'isnt': -0.5,
 "isn't": -0.5,
 'arent': -0.5,
 "aren't": -0.5,
 'wasnt': -0.5,
 "wasn't": -0.5,
 'werent': -0.5,
 "weren't": -0.5,
};

// ─── Heuristic Scorer ────────────────────────────────────────────────────────

/**
 * Analyzes sentiment using a lexicon-based heuristic approach (AFINN-165 + VADER).
 * Fast and suitable for real-time processing; returns results immediately.
 *
 * Confidence is based on:
 * - Number of matching sentiment words relative to text length
 * - Presence of intensifiers
 * - Negation handling
 */
export function analyzeSentimentHeuristic(text: string): SentimentResult {
 const words = text
 .toLowerCase()
 .replace(/[^a-z\s'-]/g, '')
 .split(/\s+/)
 .filter(Boolean);

 if (words.length === 0) {
 return { label: 'neutral', score: 0, confidence: 0.5 };
 }

 let totalScore = 0;
 let matchCount = 0;
 let hasNegation = false;

 for (let i = 0; i < words.length; i++) {
 const word = words[i];
 const afinnScore = AFINN_SCORES[word];
 if (afinnScore !== undefined) {
 // Check for intensifiers
 let adjustedScore = afinnScore;
 if (i > 0 && INTENSIFIERS[words[i - 1]] !== undefined) {
 adjustedScore += afinnScore * INTENSIFIERS[words[i - 1]];
 }
 // Check for negation (up to 2 words back)
 for (let j = Math.max(0, i - 2); j < i; j++) {
 if (INTENSIFIERS[words[j]] !== undefined && INTENSIFIERS[words[j]] < 0) {
 adjustedScore = -adjustedScore * 0.8;
 hasNegation = true;
 break;
 }
 }
 totalScore += adjustedScore;
 matchCount++;
 }
 }

 // Normalize score to -1.0 to 1.0 range
 const maxPossibleScore = words.length * 0.5; // max per-word contribution
 const normalizedScore = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0;
 const clampedScore = Math.max(-1, Math.min(1, normalizedScore));

 // Determine label
 let label: SentimentLabel;
 if (Math.abs(clampedScore) < 0.1) {
 label = hasNegation ? 'negative' : 'neutral';
 } else if (clampedScore > 0.5) {
 label = 'positive';
 } else if (clampedScore > 0.1) {
 label = hasNegation ? 'mixed' : 'positive';
 } else if (clampedScore < -0.5) {
 label = 'negative';
 } else if (clampedScore < -0.1) {
 label = hasNegation ? 'mixed' : 'negative';
 } else {
 label = 'neutral';
 }

 // Confidence based on match coverage
 const coverage = matchCount / words.length;
 let confidence = Math.min(0.7, coverage * 2); // Max 0.7 for heuristic
 if (hasNegation) confidence *= 0.85;
 confidence = Math.round(confidence * 100) / 100;

 return {
 label,
 score: Math.round(clampedScore * 1000) / 1000,
 confidence,
 };
}

// ─── LLM-based Scorer ────────────────────────────────────────────────────────

const SENTIMENT_SYSTEM_PROMPT = `You are a precise sentiment analysis engine.
Analyze the sentiment of each text snippet.
For each snippet, return:
- sentiment: "positive" | "neutral" | "negative" | "mixed"
- score: a float from -1.0 (very negative) to 1.0 (very positive)
- confidence: how confident you are (0.0 to 1.0)
- reasoning: one sentence explaining your assessment

Respond ONLY with valid JSON:
{
 "results": [
 {
 "sentiment": "positive",
 "score": 0.65,
 "confidence": 0.9,
 "reasoning": "The text expresses clear satisfaction..."
 }
 ]
}`;

/**
 * Analyzes sentiment using an LLM (GPT-4o-mini or Claude Haiku).
 * More accurate than heuristic but slower; intended for async batch processing.
 */
export async function analyzeSentimentLLM(
 mentions: MentionWithContext[],
 model: string = 'gpt-4o-mini',
): Promise<Map<string, SentimentResult>> {
 const client = getOpenAIClient();
 const results = new Map<string, SentimentResult>();

 if (mentions.length === 0) return results;

 try {
 const response = await client.chat.completions.create(
 {
 model,
 temperature: 0.2,
 max_tokens: 2048,
 response_format: { type: 'json_object' },
 messages: [
 { role: 'system', content: SENTIMENT_SYSTEM_PROMPT },
 {
 role: 'user',
 content: `Analyze the sentiment of these ${mentions.length} text snippets:\n\n${mentions
 .map(
 (m, i) =>
 `[${i}] Context: "${m.context.slice(0, 500)}"\nEntity: ${m.entityName}`,
 )
 .join('\n\n')}`,
 },
 ],
 },
 { timeout: 60_000 },
 );

 const choice = response.choices[0];
 if (!choice || !choice.message.content) {
 throw new Error('Empty response from sentiment LLM');
 }

 const parsed = JSON.parse(choice.message.content);
 const llmResults: Array<{
 sentiment: string;
 score: number;
 confidence: number;
 reasoning?: string;
 }> = parsed.results ?? [];

 for (let i = 0; i < Math.min(llmResults.length, mentions.length); i++) {
 const mention = mentions[i];
 const llm = llmResults[i];
 const validScore = Math.max(-1, Math.min(1, llm.score));
 const validConfidence = Math.max(0, Math.min(1, llm.confidence));

 results.set(mention.id ?? `batch-${i}`, {
 label: llm.sentiment as SentimentLabel,
 score: Math.round(validScore * 1000) / 1000,
 confidence: Math.round(validConfidence * 1000) / 1000,
 reasoning: llm.reasoning,
 });
 }

 return results;
 } catch (error) {
 console.error('[Sentiment] LLM analysis failed:', {
 model,
 mentionCount: mentions.length,
 error: error instanceof Error ? error.message : String(error),
 });
 return results;
 }
}

// ─── Main Sentiment Analysis Function ────────────────────────────────────────

export interface SentimentAnalysisOptions extends BatchSentimentOptions {
 onBatchComplete?: (results: Map<string, SentimentResult>) => void;
}

/**
 * Analyzes sentiment for a batch of mentions using two-pass approach:
 * 1. Fast heuristic pass (immediate)
 * 2. Optional LLM pass (async, higher accuracy)
 */
export async function analyzeSentiment(
 mentions: MentionWithContext[],
 options: SentimentAnalysisOptions = {},
): Promise<SentimentResult[]> {
 const { useLLM = true, batchSize = 50 } = options;
 const results: Map<string, SentimentResult> = new Map();

 // Pass 1: Heuristic (sync, immediate)
 for (const mention of mentions) {
 const heuristic = analyzeSentimentHeuristic(mention.context);
 results.set(mention.id ?? mention.context.slice(0, 32), heuristic);
 }

 // Pass 2: LLM-based (async, batch)
 if (useLLM) {
 const batches: MentionWithContext[][] = [];
 for (let i = 0; i < mentions.length; i += batchSize) {
 batches.push(mentions.slice(i, i + batchSize));
 }

 const batchPromises = batches.map((batch) => analyzeSentimentLLM(batch));
 const batchResults = await Promise.allSettled(batchPromises);

 for (const settled of batchResults) {
 if (settled.status === 'fulfilled') {
 for (const [key, llmResult] of settled.value) {
 // Prefer LLM result if confidence is higher
 const existing = results.get(key);
 if (existing && llmResult.confidence > existing.confidence) {
 results.set(key, llmResult);
 } else if (!existing) {
 results.set(key, llmResult);
 }
 }
 }
 }
 }

 if (options.onBatchComplete) {
 options.onBatchComplete(results);
 }

 return Array.from(results.values());
}

// ─── Sentiment Spike Detection ────────────────────────────────────────────────

export interface SentimentSpike {
 brandId: string;
 oldScore: number;
 newScore: number;
 changePct: number;
 direction: 'positive_spike' | 'negative_spike';
 recentMentions: MentionWithContext[];
 detectedAt: string;
}

/**
 * Detects significant sentiment changes for a brand.
 * Compares recent sentiment (last 24h) against the 7-day rolling average.
 */
export function detectSentimentSpike(
 currentScore: number,
 rollingAverage: number,
 thresholdPct: number = 20,
): SentimentSpike | null {
 if (rollingAverage === 0) return null;

 const changePct = Math.abs(currentScore - rollingAverage) / Math.abs(rollingAverage) * 100;

 if (changePct < thresholdPct) return null;

 const direction: 'positive_spike' | 'negative_spike' =
 currentScore > rollingAverage ? 'positive_spike' : 'negative_spike';

 return {
 brandId: '',
 oldScore: rollingAverage,
 newScore: currentScore,
 changePct: Math.round(changePct * 100) / 100,
 direction,
 recentMentions: [],
 detectedAt: new Date().toISOString(),
 };
}

// ─── Sentiment Distribution ───────────────────────────────────────────────────

export interface SentimentDistribution {
 positive: number;
 neutral: number;
 negative: number;
 mixed: number;
 avgScore: number;
}

/**
 * Computes sentiment distribution from a set of results.
 */
export function computeSentimentDistribution(
 results: SentimentResult[],
): SentimentDistribution {
 const counts: Record<string, number> = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
 let totalScore = 0;

 for (const r of results) {
 counts[r.label] = (counts[r.label] ?? 0) + 1;
 totalScore += r.score;
 }

 return {
 positive: counts.positive,
 neutral: counts.neutral,
 negative: counts.negative,
 mixed: counts.mixed,
 avgScore: results.length > 0 ? Math.round((totalScore / results.length) * 1000) / 1000 : 0,
 };
}
