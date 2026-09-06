/**
 * Visibility Scorer
 *
 * Calculates and aggregates brand visibility scores across AI platforms.
 *
 * Core metrics:
 * - Visibility Score = Brand Mentions / Total Queries (weighted)
 * - Share of Voice = Brand Mentions / All Entity Mentions
 * - Position Score = Weighted average mention position
 * - Composite Score = Weighted combination of visibility, sentiment, and position
 *
 * Score range: 0.0 (no visibility) to 1.0 (top mention in every query)
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QueryMention {
 queryId: string;
 platform: string;
 entityName: string;
 entityType: 'brand' | 'competitor' | 'product' | 'keyword';
 context: string;
 position: number | null;
 sentimentScore: number | null;
 confidenceScore: number | null;
 createdAt: string;
}

export interface BrandMentionStats {
 brandId: string;
 totalQueries: number;
 totalMentions: number;
 brandMentions: number;
 competitorMentions: number;
 avgPosition: number;
 avgSentiment: number;
 platformBreakdown: Record<string, PlatformStats>;
 visibilityScore: number;
 shareOfVoice: number;
 positionScore: number;
 compositeScore: number;
}

export interface PlatformStats {
 queries: number;
 mentions: number;
 brandMentions: number;
 avgPosition: number | null;
 avgSentiment: number | null;
 visibility: number;
}

export interface CompetitorVisibility {
 competitorName: string;
 mentionCount: number;
 visibilityScore: number;
 avgSentiment: number | null;
 trend: 'up' | 'down' | 'stable';
}

// ─── Scoring Weights ──────────────────────────────────────────────────────────

const WEIGHTS = {
 visibility: 0.40, // Raw mention frequency
 shareOfVoice: 0.25, // Relative to competitors
 position: 0.20, // Rank/order in AI response
 sentiment: 0.15, // Quality of mentions
};

// ─── Core Calculations ────────────────────────────────────────────────────────

/**
 * Calculates the visibility score for a brand given its query and mention data.
 *
 * @param queries - All queries run for the brand
 * @param mentions - All mentions extracted from those queries
 * @param brandName - The exact brand name to track
 * @returns BrandMentionStats with all computed metrics
 */
export function calculateVisibilityScore(
 queries: Array<{ id: string; platform: string; createdAt: string }>,
 mentions: QueryMention[],
 brandName: string,
): BrandMentionStats {
 const platformBreakdown: Record<string, PlatformStats> = {};
 const totalQueries = queries.length;

 if (totalQueries === 0) {
 return zeroStats(brandName);
 }

 // Group mentions by platform
 const mentionsByPlatform = new Map<string, QueryMention[]>();
 for (const m of mentions) {
 const existing = mentionsByPlatform.get(m.platform) ?? [];
 existing.push(m);
 mentionsByPlatform.set(m.platform, existing);
 }

 // Group queries by platform
 const queriesByPlatform = new Map<string, typeof queries>();
 for (const q of queries) {
 const existing = queriesByPlatform.get(q.platform) ?? [];
 existing.push(q);
 queriesByPlatform.set(q.platform, existing);
 }

 let totalBrandMentions = 0;
 let totalCompetitorMentions = 0;
 let totalPositionScore = 0;
 let totalSentimentScore = 0;
 let positionCount = 0;
 let sentimentCount = 0;

 for (const [platform, platformMentions] of mentionsByPlatform) {
 const platformQueries = queriesByPlatform.get(platform) ?? [];
 const brandMentions = platformMentions.filter(
 (m) => m.entityType === 'brand' && m.entityName.toLowerCase() === brandName.toLowerCase(),
 );
 const competitorMentions = platformMentions.filter(
 (m) => m.entityType === 'competitor',
 );

 const positions = brandMentions
 .map((m) => m.position)
 .filter((p): p is number => p != null && p > 0);
 const avgPosition = positions.length > 0 ? positions.reduce((a, b) => a + b, 0) / positions.length : null;

 const sentiments = brandMentions
 .map((m) => m.sentimentScore)
 .filter((s): s is number => s != null);
 const avgSentiment = sentiments.length > 0 ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length : null;

 totalBrandMentions += brandMentions.length;
 totalCompetitorMentions += competitorMentions.length;

 if (avgPosition !== null) {
 totalPositionScore += avgPosition;
 positionCount++;
 }
 if (avgSentiment !== null) {
 totalSentimentScore += avgSentiment;
 sentimentCount++;
 }

 platformBreakdown[platform] = {
 queries: platformQueries.length,
 mentions: platformMentions.length,
 brandMentions: brandMentions.length,
 avgPosition,
 avgSentiment,
 visibility: platformQueries.length > 0 ? brandMentions.length / platformQueries.length : 0,
 };
 }

 // ─── Individual Score Components ───

 // 1. Raw Visibility Score: brand mentions / total queries
 const rawVisibility = totalQueries > 0 ? totalBrandMentions / totalQueries : 0;

 // 2. Share of Voice: brand mentions / all entity mentions
 const totalEntityMentions = totalBrandMentions + totalCompetitorMentions;
 const shareOfVoice = totalEntityMentions > 0 ? totalBrandMentions / totalEntityMentions : 0;

 // 3. Position Score: lower position = better score (position 1 = 1.0, position 10 = 0.1)
 const avgPosition = positionCount > 0 ? totalPositionScore / positionCount : 10;
 const maxExpectedPosition = 10;
 const positionScore = Math.max(0, 1 - avgPosition / maxExpectedPosition);

 // 4. Sentiment Score: normalize from -1..1 to 0..1
 const avgSentiment = sentimentCount > 0 ? totalSentimentScore / sentimentCount : 0;
 const sentimentScore = Math.max(0, (avgSentiment + 1) / 2);

 // ─── Composite Score ───
 const compositeScore = clamp(
 rawVisibility * WEIGHTS.visibility +
 shareOfVoice * WEIGHTS.shareOfVoice +
 positionScore * WEIGHTS.position +
 sentimentScore * WEIGHTS.sentiment,
 );

 return {
 brandId: '', // filled by caller
 totalQueries,
 totalMentions,
 brandMentions: totalBrandMentions,
 competitorMentions: totalCompetitorMentions,
 avgPosition: positionCount > 0 ? Math.round((totalPositionScore / positionCount) * 100) / 100 : null,
 avgSentiment: sentimentCount > 0 ? Math.round((totalSentimentScore / sentimentCount) * 1000) / 1000 : null,
 platformBreakdown,
 visibilityScore: Math.round(rawVisibility * 10000) / 10000,
 shareOfVoice: Math.round(shareOfVoice * 10000) / 10000,
 positionScore: Math.round(positionScore * 10000) / 10000,
 compositeScore,
 };
}

/**
 * Calculates visibility scores for multiple competitors.
 */
export function calculateCompetitorScores(
 brandName: string,
 mentions: QueryMention[],
 competitors: string[],
): CompetitorVisibility[] {
 const results: CompetitorVisibility[] = [];

 for (const competitor of competitors) {
 const competitorMentions = mentions.filter(
 (m) =>
 m.entityType === 'competitor' &&
 m.entityName.toLowerCase() === competitor.toLowerCase(),
 );

 const totalQueries = new Set(mentions.map((m) => m.queryId)).size;
 const mentionCount = competitorMentions.length;
 const visibilityScore = totalQueries > 0 ? mentionCount / totalQueries : 0;

 const sentiments = competitorMentions
 .map((m) => m.sentimentScore)
 .filter((s): s is number => s != null);
 const avgSentiment =
 sentiments.length > 0
 ? Math.round((sentiments.reduce((a, b) => a + b, 0) / sentiments.length) * 1000) / 1000
 : null;

 results.push({
 competitorName: competitor,
 mentionCount,
 visibilityScore: Math.round(visibilityScore * 10000) / 10000,
 avgSentiment,
 trend: 'stable', // Would need historical data for real trend
 });
 }

 // Sort by visibility score descending
 results.sort((a, b) => b.visibilityScore - a.visibilityScore);
 return results;
}

/**
 * Computes trend data for a brand over a time period.
 */
export function computeTrendData(
 queries: Array<{ id: string; platform: string; createdAt: string }>,
 mentions: QueryMention[],
 granularity: 'day' | 'week' | 'month' = 'day',
): Array<{
 date: string;
 queries: number;
 mentions: number;
 visibility: number;
 avgSentiment: number | null;
 platforms: number;
}> {
 const grouped = new Map<string, { queries: Set<string>; mentions: QueryMention[]; platforms: Set<string> }>();

 for (const q of queries) {
 const key = getDateKey(new Date(q.createdAt), granularity);
 const existing = grouped.get(key) ?? {
 queries: new Set<string>(),
 mentions: [],
 platforms: new Set<string>(),
 };
 existing.queries.add(q.id);
 existing.platforms.add(q.platform);
 grouped.set(key, existing);
 }

 for (const m of mentions) {
 const key = getDateKey(new Date(m.createdAt), granularity);
 const existing = grouped.get(key);
 if (existing) {
 existing.mentions.push(m);
 }
 }

 const trends: Array<{
 date: string;
 queries: number;
 mentions: number;
 visibility: number;
 avgSentiment: number | null;
 platforms: number;
 }> = [];

 for (const [date, data] of grouped) {
 const sentimentValues = data.mentions
 .map((m) => m.sentimentScore)
 .filter((s): s is number => s != null);
 const avgSentiment =
 sentimentValues.length > 0
 ? Math.round((sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length) * 1000) / 1000
 : null;

 trends.push({
 date,
 queries: data.queries.size,
 mentions: data.mentions.length,
 visibility: data.queries.size > 0 ? data.mentions.length / data.queries.size : 0,
 avgSentiment,
 platforms: data.platforms.size,
 });
 }

 // Sort by date ascending
 trends.sort((a, b) => a.date.localeCompare(b.date));
 return trends;
}

// ─── Utility Functions ────────────────────────────────────────────────────────

function zeroStats(brandId: string): BrandMentionStats {
 return {
 brandId,
 totalQueries: 0,
 totalMentions: 0,
 brandMentions: 0,
 competitorMentions: 0,
 avgPosition: null,
 avgSentiment: null,
 platformBreakdown: {},
 visibilityScore: 0,
 shareOfVoice: 0,
 positionScore: 0,
 compositeScore: 0,
 };
}

function clamp(value: number, min = 0, max = 1): number {
 return Math.round(Math.max(min, Math.min(max, value)) * 10000) / 10000;
}

function getDateKey(date: Date, granularity: 'day' | 'week' | 'month'): string {
 switch (granularity) {
 case 'day':
 return date.toISOString().split('T')[0]; // YYYY-MM-DD
 case 'week': {
 const d = new Date(date);
 const day = d.getUTCDay();
 const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
 d.setUTCDate(diff);
 return d.toISOString().split('T')[0];
 }
 case 'month':
 return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
 }
}

/**
 * Aggregates visibility stats for a brand across all historical data.
 */
export function aggregateVisibilityStats(
 brandId: string,
 queries: Array<{ id: string; platform: string; createdAt: string }>,
 mentions: QueryMention[],
 brandName: string,
): BrandMentionStats {
 return calculateVisibilityScore(queries, mentions, brandName);
}

/**
 * Compares brand visibility against competitors.
 */
export function compareVisibility(
 brand: BrandMentionStats,
 competitors: CompetitorVisibility[],
): {
 brand: BrandMentionStats;
 competitors: CompetitorVisibility[];
 rank: number;
 totalCompetitors: number;
 } {
 const all = [
 { name: 'brand', ...brand },
 ...competitors.map((c) => ({
 name: c.competitorName,
 compositeScore: c.visibilityScore,
 visibilityScore: c.visibilityScore,
 })),
 ];

 all.sort((a, b) => (b.compositeScore ?? b.visibilityScore) - (a.compositeScore ?? a.visibilityScore));

 const brandRank = all.findIndex((a) => a.name === 'brand') + 1;

 return {
 brand,
 competitors,
 rank: brandRank,
 totalCompetitors: competitors.length,
 };
}

/**
 * Generates visibility score trend for the dashboard.
 */
export function scoreTrend(
 trends: Array<{
 date: string;
 visibility: number;
 avgSentiment: number | null;
 }>,
 windowSize: number = 7,
): Array<{ date: string; score: number; trend: 'up' | 'down' | 'stable' }> {
 const result: Array<{ date: string; score: number; trend: 'up' | 'down' | 'stable' }> = [];

 for (let i = 0; i < trends.length; i++) {
 const window = trends.slice(Math.max(0, i - windowSize + 1), i + 1);
 const avg = window.reduce((sum, t) => sum + t.visibility, 0) / window.length;
 const current = trends[i].visibility;

 let trend: 'up' | 'down' | 'stable';
 if (i === 0) {
 trend = 'stable';
 } else {
 const prev = trends[i - 1].visibility;
 const diff = current - prev;
 trend = diff > 0.01 ? 'up' : diff < -0.01 ? 'down' : 'stable';
 }

 result.push({
 date: trends[i].date,
 score: Math.round(avg * 10000) / 10000,
 trend,
 });
 }

 return result;
}
