import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AppError, NotFoundError, ValidationError } from '../utils/errors';
import { addCompetitorSchema } from '../utils/validators';
import { CompetitorInfo } from '../types';

export class CompetitorService {
 constructor(private prisma: PrismaClient) {}

 async list(agencyId: string, brandId: string): Promise<CompetitorInfo[]> {
 const brand = await this.prisma.brands.findFirst({
 where: { id: brandId, agency_id: agencyId },
 select: { id: true },
 });

 if (!brand) {
 throw new NotFoundError('Brand');
 }

 const competitors = await this.prisma.competitors.findMany({
 where: { brand_id: brandId },
 orderBy: { visibility_score: 'desc' },
 });

 return competitors.map((c) => this.mapRowToCompetitor(c));
 }

 async get(agencyId: string, brandId: string, competitorId: string): Promise<CompetitorInfo> {
 const competitor = await this.prisma.competitors.findFirst({
 where: { id: competitorId, brand_id: brandId },
 });

 if (!competitor) {
 throw new NotFoundError('Competitor');
 }

 return this.mapRowToCompetitor(competitor);
 }

 async add(agencyId: string, brandId: string, input: unknown): Promise<CompetitorInfo> {
 const parsed = addCompetitorSchema.parse(input);

 // Verify brand ownership
 const brand = await this.prisma.brands.findFirst({
 where: { id: brandId, agency_id: agencyId },
 select: { id: true },
 });

 if (!brand) {
 throw new NotFoundError('Brand');
 }

 try {
 const competitor = await this.prisma.competitors.create({
 data: {
 brand_id: brandId,
 competitor_name: parsed.name,
 mention_count: 0,
 visibility_score: 0,
 avg_sentiment_score: null,
 last_mentioned_at: null,
 },
 });

 return this.mapRowToCompetitor(competitor);
 } catch (error: any) {
 if (error.code === 'P2002') {
 throw new ValidationError('This competitor already exists for this brand', [
 { field: 'name', message: 'Competitor must be unique per brand' },
 ]);
 }
 throw new AppError(`Failed to add competitor: ${error.message}`, 500);
 }
 }

 async remove(agencyId: string, brandId: string, competitorId: string): Promise<void> {
 const existing = await this.prisma.competitors.findFirst({
 where: { id: competitorId, brand_id: brandId },
 select: { id: true },
 });

 if (!existing) {
 throw new NotFoundError('Competitor');
 }

 await this.prisma.competitors.delete({ where: { id: competitorId } });
 }

 async getComparison(agencyId: string, brandId: string, options: { from?: string; to?: string } = {}): Promise<Record<string, unknown>> {
 const { from = '2000-01-01', to = new Date().toISOString() } = options;

 const brand = await this.prisma.brands.findFirst({
 where: { id: brandId, agency_id: agencyId },
 select: { id: true, name: true },
 });

 if (!brand) {
 throw new NotFoundError('Brand');
 }

 const brandMentions = await this.prisma.mentions.findMany({
 where: { brand_id: brandId, entity_type: 'brand', created_at: { gte: from, lte: to } },
 select: { sentiment_score: true, entity_type: true },
 });

 const competitors = await this.prisma.competitors.findMany({
 where: { brand_id: brandId },
 orderBy: { visibility_score: 'desc' },
 });

 const brandMentionCount = brandMentions.length;
 const brandSentimentScores = brandMentions.filter((m) => m.sentiment_score !== null).map((m) => m.sentiment_score as number);
 const brandAvgSentiment = brandSentimentScores.length > 0
 ? Math.round((brandSentimentScores.reduce((a, b) => a + b, 0) / brandSentimentScores.length) * 1000) / 1000
 : 0;

 const competitorComparisons = competitors.map((c) => ({
 name: c.competitor_name,
 visibility_score: c.visibility_score,
 mention_count: c.mention_count,
 avg_sentiment: c.avg_sentiment_score || 0,
 trend: 'stable',
 }));

 return {
 brand: {
 name: brand.name,
 visibility_score: 0.5,
 mention_count: brandMentionCount,
 avg_sentiment: brandAvgSentiment,
 },
 competitors: competitorComparisons,
 period: { from, to },
 };
 }

 async updateCompetitorStats(agencyId: string, brandId: string): Promise<void> {
 const brand = await this.prisma.brands.findFirst({
 where: { id: brandId, agency_id: agencyId },
 select: { id: true, competitors: true },
 });

 if (!brand?.competitors) return;

 const competitorNames = (brand.competitors as any[]).map((c: any) => c.name);

 for (const name of competitorNames) {
 const mentions = await this.prisma.mentions.findMany({
 where: { brand_id: brandId, entity_name: name },
 select: { sentiment_score: true },
 });

 const mentionCount = mentions.length;
 const avgSentiment = mentions.length > 0
 ? Math.round(
 mentions.filter((m) => m.sentiment_score !== null)
 .reduce((acc, m) => acc + (m.sentiment_score as number), 0) / mentions.length * 1000,
 ) / 1000
 : null;

 const visibilityScore = mentionCount > 0 ? Math.min(1.0, mentionCount / 100) : 0;

 const existing = await this.prisma.competitors.findFirst({
 where: { brand_id: brandId, competitor_name: name },
 select: { id: true },
 });

 if (existing) {
 await this.prisma.competitors.update({
 where: { id: existing.id },
 data: {
 mention_count: mentionCount,
 visibility_score: visibilityScore,
 avg_sentiment_score: avgSentiment,
 last_mentioned_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 },
 });
 } else {
 await this.prisma.competitors.create({
 data: {
 brand_id: brandId,
 competitor_name: name,
 mention_count: mentionCount,
 visibility_score: visibilityScore,
 avg_sentiment_score: avgSentiment,
 last_mentioned_at: new Date().toISOString(),
 },
 });
 }
 }
 }

 private mapRowToCompetitor(row: any): CompetitorInfo {
 return {
 id: row.id,
 brand_id: row.brand_id,
 competitor_name: row.competitor_name,
 mention_count: row.mention_count,
 visibility_score: Number(row.visibility_score),
 avg_sentiment_score: row.avg_sentiment_score,
 last_mentioned_at: row.last_mentioned_at,
 created_at: row.created_at,
 updated_at: row.updated_at,
 };
 }
}