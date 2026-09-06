/**
 * Report Narrator
 *
 * Generates executive narrative summaries from scan results using GPT-4o.
 * Falls back to a template-based narrative when no API key is configured.
 */

import OpenAI from "openai";
import type { ScanJob, VisibilityScore, NarrativeReport, SentimentBreakdown } from "../types.js";

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
// Template-based fallback narrator
// ---------------------------------------------------------------------------

function buildTemplateNarrative(
 job: ScanJob,
 score: VisibilityScore,
 breakdown: SentimentBreakdown,
): NarrativeReport {
 const grade = score.grade;
 const totalMentions = job.mentions.length;
 const brandMentions = job.mentions.filter((m) => m.mentioned);
 const mentionedPlatforms = new Set(brandMentions.map((m) => m.platform));

 const summary = `${job.brandName} received a visibility score of ${score.total}/100 (Grade ${grade}) across ${totalMentions} AI-generated responses on ${mentionedPlatforms.size} of 4 platforms scanned. The brand was mentioned in ${brandMentions.length} of ${totalMentions} responses. Sentiment is ${breakdown.dominant}, with ${breakdown.positive} positive, ${breakdown.neutral} neutral, and ${breakdown.negative} negative mentions.`;

 const keyFindings: string[] = [];
 keyFindings.push(`Brand appears in ${brandMentions.length}/${totalMentions} responses (${Math.round((brandMentions.length / totalMentions.length) * 100)}% mention rate).`);
 if (mentionedPlatforms.size < 4) {
 const missing = ["chatgpt", "claude", "perplexity", "google_ai_overview"].filter((p) => !mentionedPlatforms.has(p as any));
 keyFindings.push(`Not mentioned on: ${missing.join(", ")}.`);
 }
 if (breakdown.dominant === "negative") {
 keyFindings.push("Negative sentiment dominates – review brand perception and address concerns.");
 } else if (breakdown.dominant === "positive") {
 keyFindings.push("Positive sentiment dominates – leverage this in marketing materials.");
 }

 const recommendations: string[] = [];
 if (score.total < 70) {
 recommendations.push("Increase brand content production to improve AI citation rates.");
 }
 if (mentionedPlatforms.size < 4) {
 recommendations.push("Optimize brand presence on platforms where visibility is low.");
 }
 if (breakdown.negative > breakdown.positive) {
 recommendations.push("Address negative sentiment triggers through PR and customer success initiatives.");
 }
 if (recommendations.length === 0) {
 recommendations.push("Maintain current content strategy and monitor for shifts in AI-generated responses.");
 }

 const riskAreas: string[] = [];
 if (breakdown.negative > 0) {
 riskAreas.push(`${breakdown.negative} responses carry negative sentiment about ${job.brandName}.`);
 }
 if (mentionedPlatforms.size <= 1) {
 riskAreas.push("Brand visibility is concentrated on a single platform – diversify AI content strategy.");
 }
 if (score.breakdown.positionScore < 10) {
 riskAreas.push("When mentioned, the brand appears deep in AI responses, reducing visibility impact.");
 }

 return {
 executiveSummary: summary,
 keyFindings,
 recommendations,
 riskAreas,
 generatedAt: new Date().toISOString(),
 };
}

// ---------------------------------------------------------------------------
// GPT-4o-powered narrator
// ---------------------------------------------------------------------------

async function generateWithGPT4o(
 job: ScanJob,
 score: VisibilityScore,
 breakdown: SentimentBreakdown,
 apiKey: string,
): Promise<NarrativeReport> {
 const openai = new OpenAI({ apiKey });

 const mentionSummaries = job.mentions
 .slice(0, 20)
 .map(
 (m) =>
 `- [${m.platform}] Mentioned: ${m.mentioned ? "Yes" : "No"} | Sentiment: ${m.sentiment} | Confidence: ${Math.round(m.confidence * 100)}%`,
 )
 .join("\n");

 const prompt = `You are a senior brand analyst. Given the following AI visibility scan data, generate an executive narrative report.

 Brand: ${job.brandName}
 Visibility Score: ${score.total}/100 (Grade ${score.grade})
 Mention Rate: ${score.breakdown.mentionRate}/40 pts
 Sentiment Score: ${score.breakdown.sentimentScore}/25 pts
 Position Score: ${score.breakdown.positionScore}/20 pts
 Platform Spread: ${score.breakdown.platformSpread}/15 pts
 Sentiment Breakdown: ${breakdown.positive} positive, ${breakdown.neutral} neutral, ${breakdown.negative} negative

 Mention details:
 ${mentionSummaries}

 Respond ONLY with valid JSON matching this schema:
 {
 "executiveSummary": "2-3 paragraph executive summary",
 "keyFindings": ["finding 1", "finding 2", ...],
 "recommendations": ["recommendation 1", "recommendation 2", ...],
 "riskAreas": ["risk 1", "risk 2", ...]
 }`;

 const result = await withRetry(
 async () =>
 openai.chat.completions.create({
 model: "gpt-4o",
 messages: [{ role: "user", content: prompt }],
 max_tokens: 1500,
 temperature: 0.4,
 }),
 "openai-narrator",
 );

 const raw = result.choices[0]?.message?.content ?? "";
 try {
 const parsed = JSON.parse(raw) as NarrativeReport;
 return { ...parsed, generatedAt: new Date().toISOString() };
 } catch {
 console.warn("Failed to parse GPT-4o narrative response, falling back to template.");
 return buildTemplateNarrative(job, score, breakdown);
 }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateNarrative(
 job: ScanJob,
 score: VisibilityScore,
 apiKey?: string,
): Promise<NarrativeReport> {
 const breakdown = computeSentimentBreakdown(job.mentions);

 if (apiKey) {
 try {
 return await generateWithGPT4o(job, score, breakdown, apiKey);
 } catch (err) {
 console.warn(`GPT-4o narrator failed, using template fallback:`, (err as Error).message);
 }
 }

 return buildTemplateNarrative(job, score, breakdown);
}

function computeSentimentBreakdown(mentions: ScanJob["mentions"]): SentimentBreakdown {
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
