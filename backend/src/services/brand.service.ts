import { PrismaClient, PlanType, ScanFrequency } from '@prisma/client';
import { z } from 'zod';
import { AppError, ValidationError, NotFoundError } from '../utils/errors';
import { createBrandSchema, updateBrandSchema, brandFilterSchema } from '../utils/validators';
import { Brand, BrandKeyword, BrandCompetitor, PaginatedResponse } from '../types';

type BrandWithRelations = PrismaClient['brands'];

export class BrandService {
 constructor(private prisma: PrismaClient) {}

 async list(
 agencyId: string,
 options: {
 page?: number;
 limit?: number;
 search?: string;
 industry?: string;
 is_active?: boolean;
 sort?: string;
 order?: 'asc' | 'desc';
 } = {},
 ): Promise<{ data: Brand[]; meta: { page: number; limit: number; total: number; total_pages: number } }> {
 const { page = 1, limit = 20, search, industry, is_active, sort = 'created_at', order = 'desc' } = options;

 const where: any = { agency_id: agencyId };

 if (search) {
 where.OR = [
 { name: { contains: search, mode: 'insensitive' } },
 { description: { contains: search, mode: 'insensitive' } },
 ];
 }

 if (industry) {
 where.industry = industry;
 }

 if (typeof is_active === 'boolean') {
 where.is_active = is_active;
 }

 const [data, total] = await Promise.all([
 this.prisma.brands.findMany({
 where,
 skip: (page - 1) * limit,
 take: limit,
 orderBy: { [sort]: order },
 }),
 this.prisma.brands.count({ where }),
 ]);

 const brands = data.map((b) => this.mapRowToBrand(b));
 const totalPages = Math.ceil(total / limit);

 return { data: brands, meta: { page, limit, total, total_pages: totalPages } };
 }

 async get(agencyId: string, brandId: string): Promise<Brand> {
 const brand = await this.prisma.brands.findFirst({
 where: { id: brandId, agency_id: agencyId },
 include: {
 ai_queries: { take: 1 },
 mentions: { take: 1 },
 scan_jobs: { take: 1 },
 },
 });

 if (!brand) {
 throw new NotFoundError('Brand');
 }

 return this.mapRowToBrand(brand);
 }

 async create(agencyId: string, input: unknown): Promise<Brand> {
 const parsed = createBrandSchema.parse(input);

 const brand = await this.prisma.brands.create({
 data: {
 agency_id: agencyId,
 name: parsed.name,
 industry: parsed.industry,
 description: parsed.description,
 website_url: parsed.website_url,
 logo_url: parsed.logo_url,
 keywords: parsed.keywords || [],
 competitors: parsed.competitors || [],
 scan_frequency: parsed.scan_frequency || 'daily',
 is_active: true,
 },
 });

 return this.mapRowToBrand(brand);
 }

 async update(agencyId: string, brandId: string, input: unknown): Promise<Brand> {
 const parsed = updateBrandSchema.parse(input);

 // Verify ownership
 const existing = await this.prisma.brands.findFirst({
 where: { id: brandId, agency_id: agencyId },
 select: { id: true },
 });

 if (!existing) {
 throw new NotFoundError('Brand');
 }

 const updateData: any = { ...parsed };
 if (updateData.website_url !== undefined) {
 updateData.website_url = parsed.website_url || null;
 }
 if (updateData.logo_url !== undefined) {
 updateData.logo_url = parsed.logo_url || null;
 }
 if (updateData.industry !== undefined) {
 updateData.industry = parsed.industry || null;
 }
 if (updateData.description !== undefined) {
 updateData.description = parsed.description || null;
 }

 const brand = await this.prisma.brands.update({
 where: { id: brandId },
 data: updateData,
 });

 return this.mapRowToBrand(brand);
 }

 async delete(agencyId: string, brandId: string): Promise<void> {
 const existing = await this.prisma.brands.findFirst({
 where: { id: brandId, agency_id: agencyId },
 select: { id: true },
 });

 if (!existing) {
 throw new NotFoundError('Brand');
 }

 await this.prisma.brands.delete({ where: { id: brandId } });
 }

 async getAnalytics(agencyId: string, brandId: string, options: {
 from?: string;
 to?: string;
 granularity?: 'hour' | 'day' | 'week' | 'month';
 platforms?: string;
 entity_type?: string;
 } = {}): Promise<Record<string, unknown>> {
 await this.verifyBrandOwnership(agencyId, brandId);

 const { from = '2000-01-01', to = new Date().toISOString(), granularity = 'day', platforms, entity_type = 'all' } = options;

 const [queries, mentions] = await Promise.all([
 this.prisma.ai_queries.findMany({
 where: {
 brand_id: brandId,
 created_at: { gte: from, lte: to },
 },
 select: { id: true, platform: true, created_at: true, sentiment_score: true },
 }),
 this.prisma.mentions.findMany({
 where: {
 brand_id: brandId,
 created_at: { gte: from, lte: to },
 },
 select: { id: true, platform: true, entity_type: true, entity_name: true, sentiment: true, sentiment_score: true, created_at: true },
 }),
 ]);

 let filteredQueries = queries;
 let filteredMentions = mentions;

 if (platforms) {
 const platformList = platforms.split(',');
 filteredQueries = filteredQueries.filter((q) => platformList.includes(q.platform));
 filteredMentions = filteredMentions.filter((m) => platformList.includes(m.platform));
 }

 if (entity_type !== 'all') {
 const entityTypeList = entity_type.split(',');
 filteredMentions = filteredMentions.filter((m) => entityTypeList.includes(m.entity_type));
 }

 const totalQueries = filteredQueries.length;
 const totalMentions = filteredMentions.length;
 const brandMentions = filteredMentions.filter((m) => m.entity_type === 'brand').length;
 const visibilityScore = totalQueries > 0 ? Math.round((brandMentions / totalQueries) * 10000) / 10000 : 0;

 const sentimentScores = filteredMentions.filter((m) => m.sentiment_score !== null).map((m) => m.sentiment_score as number);
 const avgSentiment = sentimentScores.length > 0 ? Math.round((sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length) * 1000) / 1000 : 0;

 const platformsSet = new Set(filteredQueries.map((q) => q.platform));
 const platformBreakdown: Record<string, unknown> = {};

 for (const platform of platformsSet) {
 const pQueries = filteredQueries.filter((q) => q.platform === platform);
 const pMentions = filteredMentions.filter((m) => m.platform === platform);
 const pBrandMentions = pMentions.filter((m) => m.entity_type === 'brand').length;
 const pSentimentScores = pMentions.filter((m) => m.sentiment_score !== null).map((m) => m.sentiment_score as number);
 const pAvgSentiment = pSentimentScores.length > 0 ? Math.round((pSentimentScores.reduce((a, b) => a + b, 0) / pSentimentScores.length) * 1000) / 1000 : 0;
 const pVisibility = pQueries.length > 0 ? Math.round((pBrandMentions / pQueries.length) * 10000) / 10000 : 0;

 platformBreakdown[platform] = {
 platform,
 queries: pQueries.length,
 mentions: pMentions.length,
 visibility: pVisibility,
 avg_sentiment: pAvgSentiment,
 };
 }

 const sentimentDistribution = {
 positive: filteredMentions.filter((m) => m.sentiment === 'positive').length,
 neutral: filteredMentions.filter((m) => m.sentiment === 'neutral').length,
 negative: filteredMentions.filter((m) => m.sentiment === 'negative').length,
 mixed: filteredMentions.filter((m) => m.sentiment === 'mixed').length,
 };

 return {
 brand_id: brandId,
 period: { from: from || null, to: to || null },
 summary: {
 total_queries: totalQueries,
 total_mentions: totalMentions,
 visibility_score: visibilityScore,
 avg_sentiment: avgSentiment,
 platforms_tracked: platformsSet.size,
 },
 sentiment_distribution: sentimentDistribution,
 platform_breakdown: Object.values(platformBreakdown),
 };
 }

 async verifyBrandOwnership(agencyId: string, brandId: string): Promise<void> {
 const brand = await this.prisma.brands.findFirst({
 where: { id: brandId, agency_id: agencyId },
 select: { id: true },
 });

 if (!brand) {
 throw new NotFoundError('Brand');
 }
 }

 private mapRowToBrand(row: any): Brand {
 const keywords: BrandKeyword[] = (row.keywords as any) || [];
 const competitors: BrandCompetitor[] = (row.competitors as any) || [];

 return {
 id: row.id,
 agency_id: row.agency_id,
 name: row.name,
 industry: row.industry,
 description: row.description,
 website_url: row.website_url,
 logo_url: row.logo_url,
 keywords,
 competitors,
 scan_frequency: row.scan_frequency as ScanFrequency,
 is_active: row.is_active,
 last_scanned_at: row.last_scanned_at,
 visibility_score: row.visibility_score,
 total_mentions: row.total_mentions,
 created_at: row.created_at,
 updated_at: row.updated_at,
 };
 }
}