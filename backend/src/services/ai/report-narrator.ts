/**
 * Report Narrator
 *
 * Generates human-readable summaries and insights from analytics data.
 * Uses GPT-4o to produce executive-level narrative summaries for reports.
 */

import { getOpenAIClient } from './openai.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportNarrativeInput {
 brandName: string;
 industry: string;
 agencyName?: string;
 period: { start: string; end: string };
 summary: {
 totalQueries: number;
 totalMentions: number;
 visibilityScore: number;
 visibilityScoreChange?: number;
 avgSentiment: number;
 avgSentimentChange?: number;
 topPlatform: string;
 trend: 'improving' | 'declining' | 'stable';
 };
 sentimentDistribution: {
 positive: number;
 neutral: number;
 negative: number;
 positive_pct?: number;
 neutral_pct?: number;
 negative_pct?: number;
 };
 platformBreakdown: Array<{
 platform: string;
 queries: number;
 mentions: number;
 visibility: number;
 avgSentiment: number;
 mentionCountChange?: number;
 }>;
 keywordPerformance: Array<{
 term: string;
 mentionCount: number;
 avgPosition: number;
 sentiment: number;
 trend: string;
 }>;
 competitorComparison: Array<{
 name: string;
 visibilityScore: number;
 mentionCount: number;
 avgSentiment: number;
 shareOfVoice: number;
 trend: string;
 }>;
}

export interface NarrativeSection {
 heading: string;
 body: string;
 keyPoints: string[];
}

export interface ReportNarrative {
 executiveSummary: string;
 sections: NarrativeSection[];
 keyInsights: string[];
 recommendations: string[];
 fullText: string;
 generatedAt: string;
 model: string;
}

// ─── Prompt Templates ─────────────────────────────────────────────────────────

const EXECUTIVE_SUMMARY_PROMPT = (data: ReportNarrativeInput) => `You are a professional market analyst writing for a ${data.industry} agency client.

Write a concise executive summary (2-3 sentences) for a brand visibility report covering ${data.period.start} to ${data.period.end}.

Brand: ${data.brandName}
Industry: ${data.industry}
Period: ${data.period.start} to ${data.period.end}

Key metrics:
- Total queries run: ${data.summary.totalQueries}
- Total mentions found: ${data.summary.totalMentions}
- Visibility score: ${data.summary.visibilityScore.toFixed(2)}${data.summary.visibilityScoreChange !== undefined ? ` (${data.summary.visibilityScoreChange > 0 ? '+' : ''}${data.summary.visibilityScoreChange.toFixed(2)} change)` : ''}
- Average sentiment: ${data.summary.avgSentiment.toFixed(2)}
- Top platform: ${data.summary.topPlatform}
- Overall trend: ${data.summary.trend}

Sentiment distribution:
- Positive: ${data.sentimentDistribution.positive} (${data.sentimentDistribution.positive_pct ?? Math.round(data.sentimentDistribution.positive / Math.max(1, data.summary.totalMentions) * 100)}%)
- Neutral: ${data.sentimentDistribution.neutral} (${data.sentimentDistribution.neutral_pct ?? Math.round(data.sentimentDistribution.neutral / Math.max(1, data.summary.totalMentions) * 100)}%)
- Negative: ${data.sentimentDistribution.negative} (${data.sentimentDistribution.negative_pct ?? Math.round(data.sentimentDistribution.negative / Math.max(1, data.summary.totalMentions) * 100)}%)

Write in a professional, data-driven tone. Be specific with numbers. Highlight the most important finding first.
Respond in JSON: { "text": "your summary here" }`;

const INSIGHTS_PROMPT = (data: ReportNarrativeInput) => `You are a professional market analyst. Based on the following brand visibility data, generate 3-5 key insights.

Each insight should be:
- Specific and data-backed
- Actionable
- One sentence
- Highlighting a trend, anomaly, or opportunity

Brand: ${data.brandName}
Industry: ${data.industry}

Visibility score: ${data.summary.visibilityScore.toFixed(2)} (${data.summary.trend})
Total mentions: ${data.summary.totalMentions} across ${data.summary.topPlatform}

Platform breakdown:
${data.platformBreakdown.map((p) => `- ${p.platform}: ${p.mentions} mentions, visibility ${p.visibility.toFixed(2)}, sentiment ${p.avgSentiment.toFixed(2)}`).join('\n')}

Competitor comparison:
${data.competitorComparison.map((c) => `- ${c.name}: visibility ${c.visibilityScore.toFixed(2)}, ${c.mentionCount} mentions, sentiment ${c.avgSentiment.toFixed(2)}, trend: ${c.trend}`).join('\n')}

Keyword performance:
${data.keywordPerformance.map((k) => `- "${k.term}": ${k.mentionCount} mentions, avg position ${k.avgPosition.toFixed(1)}, sentiment ${k.sentiment.toFixed(2)}, trend: ${k.trend}`).join('\n')}

Respond in JSON: { "insights": ["insight 1", "insight 2", ...] }`;

const RECOMMENDATIONS_PROMPT = (data: ReportNarrativeInput) => `You are a brand strategy consultant. Based on the following brand visibility data, generate 3-5 concrete, actionable recommendations.

Each recommendation should:
- Be specific to the data
- Include a clear action
- Be ranked by impact (highest first)
- Be achievable in the next 30 days

Brand: ${data.brandName}
Industry: ${data.industry}

Visibility score: ${data.summary.visibilityScore.toFixed(2)}
Weak areas:
${data.competitorComparison.filter((c) => c.visibilityScore > data.summary.visibilityScore).map((c) => `- Losing to ${c.name} (visibility ${c.visibilityScore.toFixed(2)} vs ${data.summary.visibilityScore.toFixed(2)})`).join('\n') || '- None identified'}
Underperforming keywords:
${data.keywordPerformance.filter((k) => k.avgPosition > 5 || k.sentiment < 0.3).map((k) => `- "${k.term}": position ${k.avgPosition.toFixed(1)}, sentiment ${k.sentiment.toFixed(2)}`).join('\n') || '- None identified'}
Negative sentiment mentions: ${data.sentimentDistribution.negative}

Respond in JSON: { "recommendations": ["recommendation 1", "recommendation 2", ...] }`;

const SECTION_PROMPTS: Record<string, (data: ReportNarrativeInput) => string> = {
 overview: (data) => `Write a 2-paragraph overview section for a brand visibility report.

Brand: ${data.brandName}
${EXECUTIVE_SUMMARY_PROMPT(data).split('Write a concise')[0]}

Key metrics:
- Queries: ${data.summary.totalQueries}
- Mentions: ${data.summary.totalMentions}
- Visibility score: ${data.summary.visibilityScore.toFixed(2)}
- Platforms tracked: ${data.platformBreakdown.map((p) => p.platform).join(', ')}

Write in markdown with a brief intro paragraph and a bullet-point summary of key findings.`,

 mentions: (data) => `Write a "Mentions Analysis" section for a brand visibility report.

Brand: ${data.brandName}
Total mentions this period: ${data.summary.totalMentions}
Brand mentions: ${data.platformBreakdown.reduce((s, p) => s + p.brandMentions, 0)}
Competitor mentions: ${data.competitorComparison.reduce((s, c) => s + c.mentionCount, 0)}

Platform breakdown:
${data.platformBreakdown.map((p) => `- ${p.platform}: ${p.mentions} mentions (${p.queries} queries), visibility: ${p.visibility.toFixed(2)}`).join('\n')}

Top keywords by performance:
${data.keywordPerformance.slice(0, 5).map((k) => `- "${k.term}": ${k.mentionCount} mentions, position ${k.avgPosition.toFixed(1)}, sentiment ${k.sentiment.toFixed(2)}`).join('\n')}

Write in markdown. Include a summary paragraph and key takeaways in bullets.`,

 sentiment: (data) => `Write a "Sentiment Analysis" section for a brand visibility report.

Brand: ${data.brandName}

Overall average sentiment: ${data.summary.avgSentiment.toFixed(2)}
Sentiment distribution:
- Positive: ${data.sentimentDistribution.positive} (${data.sentimentDistribution.positive_pct ?? 'N/A'}%)
- Neutral: ${data.sentimentDistribution.neutral} (${data.sentimentDistribution.neutral_pct ?? 'N/A'}%)
- Negative: ${data.sentimentDistribution.negative} (${data.sentimentDistribution.negative_pct ?? 'N/A'}%)

Per-platform sentiment:
${data.platformBreakdown.map((p) => `- ${p.platform}: avg sentiment ${p.avgSentiment.toFixed(2)}`).join('\n')}

Write in markdown. Highlight any sentiment shifts or areas of concern.`,

 competitors: (data) => `Write a "Competitive Analysis" section for a brand visibility report.

Brand: ${data.brandName}
Brand visibility score: ${data.summary.visibilityScore.toFixed(2)}

Competitor comparison:
${data.competitorComparison.map((c) => `- ${c.name}: visibility ${c.visibilityScore.toFixed(2)}, ${c.mentionCount} mentions, sentiment ${c.avgSentiment.toFixed(2)}, share of voice ${(c.shareOfVoice * 100).toFixed(1)}%, trend: ${c.trend}`).join('\n')}

Write in markdown. Include:
- How the brand ranks vs competitors
- Key competitive gaps
- Areas where the brand leads`,

 trends: (data) => `Write a "Trends" section for a brand visibility report.

Brand: ${data.brandName}
Overall trend: ${data.summary.trend}
Visibility score change: ${data.summary.visibilityScoreChange !== undefined ? (data.summary.visibilityScoreChange > 0 ? '+' : '') + data.summary.visibilityScoreChange.toFixed(2) : 'N/A'}
Sentiment change: ${data.summary.avgSentimentChange !== undefined ? (data.summary.avgSentimentChange > 0 ? '+' : '') + data.summary.avgSentimentChange.toFixed(2) : 'N/A'}

Platform trends:
${data.platformBreakdown.map((p) => `- ${p.platform}: ${p.mentionCountChange !== undefined ? (p.mentionCountChange > 0 ? '+' : '') + p.mentionCountChange + ' mention change' : 'stable'}`).join('\n')}

Write in markdown. Describe what drove the trend changes.`,
};

// ─── Main Narration Function ──────────────────────────────────────────────────

/**
 * Generates a complete AI-powered narrative for a brand visibility report.
 *
 * Calls GPT-4o for:
 * 1. Executive summary
 * 2. Key insights
 * 3. Actionable recommendations
 * 4. Per-section narratives
 */
export async function generateReportNarrative(
 data: ReportNarrativeInput,
 model: string = 'gpt-4o',
 sections: string[] = ['overview', 'mentions', 'sentiment', 'competitors', 'trends'],
): Promise<ReportNarrative> {
 const client = getOpenAIClient();
 const startTime = Date.now();

 try {
 // Execute all LLM calls in parallel
 const [summaryResult, insightsResult, recommendationsResult, ...sectionResults] =
 await Promise.all([
 callLLMForJSON(client, EXECUTIVE_SUMMARY_PROMPT(data), model),
 callLLMForJSON(client, INSIGHTS_PROMPT(data), model),
 callLLMForJSON(client, RECOMMENDATIONS_PROMPT(data), model),
 ...sections
 .filter((s) => SECTION_PROMPTS[s])
 .map((sectionKey) =>
 callLLMForText(client, SECTION_PROMPTS[sectionKey](data), model),
 ),
 ]);

 const narrativeSections: NarrativeSection[] = sectionResults.map((result, i) => ({
 heading: sectionTitle(sections[i]),
 body: result,
 keyPoints: extractBulletPoints(result),
 }));

 const narrative: ReportNarrative = {
 executiveSummary: summaryResult?.text ?? generateFallbackSummary(data),
 sections: narrativeSections,
 keyInsights: insightsResult?.insights ?? generateFallbackInsights(data),
 recommendations:
 recommendationsResult?.recommendations ?? generateFallbackRecommendations(data),
 fullText: '',
 generatedAt: new Date().toISOString(),
 model,
 };

 // Compose full text
 narrative.fullText = composeFullText(narrative);

 return narrative;
 } catch (error) {
 console.error('[ReportNarrator] Generation failed:', {
 error: error instanceof Error ? error.message : String(error),
 model,
 });

 // Fallback to template-based narrative
 return generateFallbackNarrative(data, model);
 }
}

// ─── LLM Helpers ──────────────────────────────────────────────────────────────

async function callLLMForJSON(
 client: OpenAI,
 prompt: string,
 model: string,
): Promise<any> {
 try {
 const response = await client.chat.completions.create(
 {
 model,
 temperature: 0.4,
 max_tokens: 1024,
 response_format: { type: 'json_object' },
 messages: [
 { role: 'system', content: 'You are a helpful data analyst. Always respond with valid JSON.' },
 { role: 'user', content: prompt },
 ],
 },
 { timeout: 45_000 },
 );

 const content = response.choices[0]?.message?.content;
 if (!content) return null;

 try {
 return JSON.parse(content);
 } catch {
 return null;
 }
 } catch {
 return null;
 }
}

async function callLLMForText(client: OpenAI, prompt: string, model: string): Promise<string> {
 try {
 const response = await client.chat.completions.create(
 {
 model,
 temperature: 0.4,
 max_tokens: 512,
 messages: [
 { role: 'system', content: 'You are a professional brand analyst. Write clear, concise markdown.' },
 { role: 'user', content: prompt },
 ],
 },
 { timeout: 45_000 },
 );

 return response.choices[0]?.message?.content ?? '';
 } catch {
 return '';
 }
}

// ─── Fallback Generators ──────────────────────────────────────────────────────

function generateFallbackSummary(data: ReportNarrativeInput): string {
 const changeStr = data.summary.visibilityScoreChange !== undefined
 ? ` (${data.summary.visibilityScoreChange > 0 ? '+' : ''}${data.summary.visibilityScoreChange.toFixed(2)} from previous period)`
 : '';

 return `${data.brandName}'s visibility score is ${data.summary.visibilityScore.toFixed(2)}${changeStr} across ${data.platformBreakdown.length} AI platforms. The brand was mentioned ${data.summary.totalMentions} times out of ${data.summary.totalQueries} queries, with an average sentiment of ${data.summary.avgSentiment.toFixed(2)}. The top-performing platform is ${data.summary.topPlatform}.`;
}

function generateFallbackInsights(data: ReportNarrativeInput): string[] {
 const insights: string[] = [];

 if (data.summary.visibilityScore > 0.5) {
 insights.push(`${data.brandName} shows strong visibility at ${data.summary.visibilityScore.toFixed(2)} across AI platforms.`);
 } else if (data.summary.visibilityScore > 0.2) {
 insights.push(`${data.brandName} has moderate visibility at ${data.summary.visibilityScore.toFixed(2)} — room for improvement exists.`);
 } else {
 insights.push(`${data.brandName} has low visibility at ${data.summary.visibilityScore.toFixed(2)} — immediate action recommended.`);
 }

 if (data.sentimentDistribution.negative > data.sentimentDistribution.positive) {
 insights.push(`Negative mentions (${data.sentimentDistribution.negative}) exceed positive ones (${data.sentimentDistribution.positive}) — reputation management is needed.`);
 }

 if (data.competitorComparison.length > 0) {
 const topCompetitor = data.competitorComparison[0];
 if (topCompetitor.visibilityScore > data.summary.visibilityScore) {
 insights.push(`${topCompetitor.name} leads with visibility ${topCompetitor.visibilityScore.toFixed(2)} vs ${data.summary.visibilityScore.toFixed(2)}.`);
 }
 }

 if (data.keywordPerformance.length > 0) {
 const worstKeyword = [...data.keywordPerformance].sort((a, b) => a.avgPosition - b.avgPosition)[0];
 if (worstKeyword.avgPosition > 5) {
 insights.push(`Keyword "${worstKeyword.term}" averages position ${worstKeyword.avgPosition.toFixed(1)} — optimization recommended.`);
 }
 }

 return insights;
}

function generateFallbackRecommendations(data: ReportNarrativeInput): string[] {
 const recs: string[] = [];

 if (data.summary.visibilityScore < 0.4) {
 recs.push('Increase prompt diversity to cover more query angles related to your brand.');
 }

 if (data.sentimentDistribution.negative > data.sentimentDistribution.positive * 0.3) {
 recs.push('Address negative sentiment by improving brand messaging and monitoring competitor positioning.');
 }

 const topCompetitor = data.competitorComparison[0];
 if (topCompetitor && topCompetitor.visibilityScore > data.summary.visibilityScore) {
 recs.push(`Study ${topCompetitor.name}'s positioning and messaging to identify visibility gaps.`);
 }

 if (data.keywordPerformance.some((k) => k.avgPosition > 5)) {
 recs.push('Optimize keyword strategy: focus on terms with high search volume but lower AI ranking positions.');
 }

 recs.push('Increase scan frequency to detect sentiment changes in real-time.');
 }

 return recs;
}

function generateFallbackNarrative(data: ReportNarrativeInput, model: string): ReportNarrative {
 return {
 executiveSummary: generateFallbackSummary(data),
 sections: [
 {
 heading: 'Overview',
 body: `During the period ${data.period.start} to ${data.period.end}, ${data.brandName} was monitored across ${data.platformBreakdown.length} AI platforms.`,
 keyPoints: [
 `Total queries: ${data.summary.totalQueries}`,
 `Total mentions: ${data.summary.totalMentions}`,
 `Visibility score: ${data.summary.visibilityScore.toFixed(2)}`,
 `Average sentiment: ${data.summary.avgSentiment.toFixed(2)}`,
 ],
 },
 {
 heading: 'Sentiment',
 body: `Sentiment distribution shows ${data.sentimentDistribution.positive} positive, ${data.sentimentDistribution.neutral} neutral, and ${data.sentimentDistribution.negative} negative mentions.`,
 keyPoints: [
 `Positive: ${data.sentimentDistribution.positive}`,
 `Neutral: ${data.sentimentDistribution.neutral}`,
 `Negative: ${data.sentimentDistribution.negative}`,
 ],
 },
 ],
 keyInsights: generateFallbackInsights(data),
 recommendations: generateFallbackRecommendations(data),
 fullText: '',
 generatedAt: new Date().toISOString(),
 model: 'fallback',
 };
}

// ─── Text Utilities ───────────────────────────────────────────────────────────

function sectionTitle(key: string): string {
 const titles: Record<string, string> = {
 overview: 'Overview',
 mentions: 'Mentions Analysis',
 sentiment: 'Sentiment Analysis',
 competitors: 'Competitive Analysis',
 trends: 'Trends',
 };
 return titles[key] ?? key;
}

function extractBulletPoints(markdown: string): string[] {
 const points: string[] = [];
 const lines = markdown.split('\n');
 for (const line of lines) {
 const trimmed = line.trim();
 if ((trimmed.startsWith('-') || trimmed.startsWith('*')) && trimmed.length > 2) {
 points.push(trimmed.slice(1).trim());
 }
 }
 return points.slice(0, 5);
}

function composeFullText(narrative: ReportNarrative): string {
 const parts: string[] = [`# ${narrative.executiveSummary}\n`];

 for (const section of narrative.sections) {
 parts.push(`## ${section.heading}\n`);
 parts.push(section.body);
 parts.push('');
 }

 if (narrative.keyInsights.length > 0) {
 parts.push('## Key Insights\n');
 for (const insight of narrative.keyInsights) {
 parts.push(`- ${insight}`);
 }
 parts.push('');
 }

 if (narrative.recommendations.length > 0) {
 parts.push('## Recommendations\n');
 for (const rec of narrative.recommendations) {
 parts.push(`- ${rec}`);
 }
 parts.push('');
 }

 return parts.join('\n');
}

// ─── Quick Summary Generator ──────────────────────────────────────────────────

/**
 * Generates a quick one-liner summary for notifications/emails.
 */
export function quickSummary(data: {
 brandName: string;
 visibilityScore: number;
 totalMentions: number;
 avgSentiment: number;
 trend: 'improving' | 'declining' | 'stable';
 period: { start: string; end: string };
}): string {
 const trendStr =
 data.trend === 'improving' ? 'improved' : data.trend === 'declining' ? 'declined' : 'remained stable';

 return `${data.brandName}: ${data.totalMentions} mentions found with visibility score ${data.visibilityScore.toFixed(2)}. Sentiment is ${data.avgSentiment >= 0.5 ? 'positive' : data.avgSentiment >= 0 ? 'neutral' : 'negative'} (${data.avgSentiment.toFixed(2)}). Overall trend ${trendStr}.`;
}
