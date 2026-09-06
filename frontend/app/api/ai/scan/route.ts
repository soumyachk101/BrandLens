/**
 * POST /api/ai/scan
 *
 * Triggers a multi-platform brand scan across ChatGPT, Claude, Perplexity,
 * and Google AI Overviews. Returns the scan job with mention results.
 */

import type { ScanRequestBody, ScanJobResponse, AiProviderConfig } from "../../lib/types.js";
import { scanBrandAcrossPlatforms } from "../../lib/ai/multi-platform-scanner.js";
import { analyzeMentionsSentiment } from "../../lib/ai/sentiment-analyzer.js";
import { computeSentimentBreakdown } from "../../lib/ai/sentiment-analyzer.js";
import { computeVisibilityScore } from "../../lib/ai/visibility-scorer.js";
import { generateNarrative } from "../../lib/ai/report-narrator.js";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function getAiConfig(): AiProviderConfig {
 return {
 openaiApiKey: process.env.OPENAI_API_KEY ?? "",
 anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
 perplexityApiKey: process.env.PERPLEXITY_API_KEY ?? "",
 };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

const DEFAULT_PLATFORMS = ["chatgpt", "claude", "perplexity", "google_ai_overview"] as const;

export async function handleScanRequest(body: ScanRequestBody): Promise<Response> {
 try {
 const { brandName, queries, platforms } = body;

 if (!brandName || !queries || queries.length === 0) {
 return new Response(
 JSON.stringify({ error: "brandName and at least one query are required." }),
 { status: 400, headers: { "Content-Type": "application/json" } },
 );
 }

 if (queries.length > 20) {
 return new Response(
 JSON.stringify({ error: "Maximum 20 queries allowed per scan." }),
 { status: 400, headers: { "Content-Type": "application/json" } },
 );
 }

 const config = getAiConfig();
 const scanPlatforms = platforms ?? [...DEFAULT_PLATFORMS];

 console.log(`[api/scan] Starting scan for brand: "${brandName}" on platforms: ${scanPlatforms.join(", ")}`);

 // 1. Run multi-platform scan
 const job = await scanBrandAcrossPlatforms(brandName, queries, scanPlatforms, config);

 // 2. Analyze sentiment for each mention
 job.mentions = await analyzeMentionsSentiment(job.mentions, config.openaiApiKey);
 const breakdown = computeSentimentBreakdown(job.mentions);
 job.sentimentBreakdown = breakdown;

 // 3. Compute visibility score
 const score = computeVisibilityScore(job.mentions, breakdown);
 job.visibilityScore = score.total;

 // 4. Generate narrative summary
 job.narrativeSummary = JSON.stringify(await generateNarrative(job, score, config.openaiApiKey));

 console.log(`[api/scan] Completed scan for "${brandName}": ${job.totalMentions} mentions, score=${job.visibilityScore}`);

 return new Response(JSON.stringify({ job } satisfies ScanJobResponse), {
 status: 200,
 headers: { "Content-Type": "application/json" },
 });
 } catch (err) {
 console.error("[api/scan] Error:", (err as Error).message);
 return new Response(
 JSON.stringify({ error: "Scan failed", message: (err as Error).message }),
 { status: 500, headers: { "Content-Type": "application/json" } },
 );
 }
}
