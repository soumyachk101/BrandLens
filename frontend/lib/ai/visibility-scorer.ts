/**
 * Visibility Scorer
 *
 * Computes a composite brand visibility score (0-100) from scan results.
 * Score formula:
 * - mentionRate: % of queries where the brand appeared (0-40 points)
 * - sentimentScore: net sentiment quality (0-25 points)
 * - positionScore: average position rank (0-20 points)
 * - platformSpread: diversity of platforms mentioning the brand (0-15 points)
 */

import type { BrandMention, VisibilityScore, SentimentBreakdown } from "../types.js";

export function computeVisibilityScore(
 mentions: BrandMention[],
 sentimentBreakdown: SentimentBreakdown,
): VisibilityScore {
 if (mentions.length === 0) {
 return {
 total: 0,
 breakdown: { mentionRate: 0, sentimentScore: 0, positionScore: 0, platformSpread: 0 },
 grade: "F",
 };
 }

 const platformsSet = new Set(mentions.filter((m) => m.mentioned).map((m) => m.platform));
 const totalPossiblePlatforms = 4; // chatgpt, claude, perplexity, google_ai_overview

 // 1. Mention rate: 0-40 pts
 const mentionRate = mentions.filter((m) => m.mentioned).length / mentions.length;
 const mentionRateScore = Math.round(mentionRate * 40);

 // 2. Sentiment score: 0-25 pts
 const total = sentimentBreakdown.positive + sentimentBreakdown.neutral + sentimentBreakdown.negative;
 const netSentiment = total > 0 ? (sentimentBreakdown.positive - sentimentBreakdown.negative) / total : 0;
 const sentimentScore = Math.round(((netSentiment + 1) / 2) * 25);

 // 3. Position score: 0-20 pts (lower position number = better)
 const mentionedPositions = mentions.filter((m) => m.mentioned && m.position < 999).map((m) => m.position);
 const avgPosition = mentionedPositions.length > 0
 ? mentionedPositions.reduce((a, b) => a + b, 0) / mentionedPositions.length
 : 999;
 const positionScore = avgPosition < 10 ? 20 : avgPosition < 50 ? 15 : avgPosition < 200 ? 10 : avgPosition < 500 ? 5 : 0;

 // 4. Platform spread: 0-15 pts
 const platformSpread = Math.round((platformsSet.size / totalPossiblePlatforms) * 15);

 const totalScore = Math.min(100, mentionRateScore + sentimentScore + positionScore + platformSpread);

 let grade: VisibilityScore["grade"];
 if (totalScore >= 85) grade = "A";
 else if (totalScore >= 70) grade = "B";
 else if (totalScore >= 55) grade = "C";
 else if (totalScore >= 40) grade = "D";
 else grade = "F";

 return {
 total: totalScore,
 breakdown: { mentionRate: mentionRateScore, sentimentScore: sentimentScore, positionScore, platformSpread },
 grade,
 };
}
