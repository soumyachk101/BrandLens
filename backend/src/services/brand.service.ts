import { v4 as uuidv4 } from 'uuid';
import { SupabaseClient } from '@supabase/supabase-js';
import { Brand, CreateBrandSchema, UpdateBrandSchema, BrandKeyword, BrandCompetitor, ScanFrequency } from '../../types';
import { AppError, NotFoundError, ValidationError } from '../../utils/errors';

export class BrandService {
 constructor(private supabase: SupabaseClient) {}

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
 } = {}
 ): Promise<{ data: Brand[]; meta: { page: number; limit: number; total: number; total_pages: number } }> {
 const { page = 1, limit = 20, search, industry, is_active, sort = 'created_at', order = 'desc' } = options;

 const from = (page - 1) * limit;
 const to = from + limit - 1;

 let query = this.supabase
 .from('brands')
 .select('*', { count: 'exact' })
 .eq('agency_id', agencyId)
 .order(sort, { ascending: order === 'asc' })
 .range(from, to);

 if (search) {
 query = query.ilike('name', `%${search}%`);
 }

 if (industry) {
 query = query.eq('industry', industry);
 }

 if (typeof is_active === 'boolean') {
 query = query.eq('is_active', is_active);
 }

 const { data, error, count } = await query;

 if (error) {
 throw new AppError(`Failed to fetch brands: ${error.message}`, 500);
 }

 const brands = (data || []).map(this.mapRowToBrand);
 const total = count || 0;

 return {
 data: brands,
 meta: {
 page,
 limit,
 total,
 total_pages: Math.ceil(total / limit),
 },
 };
 }

 async get(agencyId: string, brandId: string): Promise<Brand> {
 const { data, error } = await this.supabase
 .from('brands')
 .select('*')
 .eq('id', brandId)
 .eq('agency_id', agencyId)
 .maybeSingle();

 if (error || !data) {
 throw new NotFoundError('Brand');
 }

 return this.mapRowToBrand(data);
 }

 async create(agencyId: string, input: unknown): Promise<Brand> {
 const parsed = CreateBrandSchema.parse(input);

 const { data, error } = await this.supabase
 .from('brands')
 .insert({
 agency_id: agencyId,
 name: parsed.name,
 industry: parsed.industry || null,
 description: parsed.description || null,
 website_url: parsed.website_url || null,
 logo_url: parsed.logo_url || null,
 keywords: parsed.keywords || [],
 competitors: parsed.competitors || [],
 scan_frequency: parsed.scan_frequency || 'daily',
 is_active: true,
 })
 .select()
 .maybeSingle();

 if (error || !data) {
 if (error?.code === '23505') {
 throw new ValidationError('A brand with this name already exists', [
 { field: 'name', message: 'Brand name must be unique within the agency' },
 ]);
 }
 throw new AppError(`Failed to create brand: ${error?.message || 'Unknown error'}`, 500);
 }

 return this.mapRowToBrand(data);
 }

 async update(agencyId: string, brandId: string, input: unknown): Promise<Brand> {
 const parsed = UpdateBrandSchema.parse(input);

 const updateData: Record<string, unknown> = { ...parsed };
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

 const { data, error } = await this.supabase
 .from('brands')
 .update(updateData)
 .eq('id', brandId)
 .eq('agency_id', agencyId)
 .select()
 .maybeSingle();

 if (error || !data) {
 throw new NotFoundError('Brand');
 }

 return this.mapRowToBrand(data);
 }

 async delete(agencyId: string, brandId: string): Promise<void> {
 const { error } = await this.supabase
 .from('brands')
 .delete()
 .eq('id', brandId)
 .eq('agency_id', agencyId);

 if (error) {
 throw new AppError(`Failed to delete brand: ${error.message}`, 500);
 }
 }

 async getAnalytics(
 agencyId: string,
 brandId: string,
 options: {
 from?: string;
 to?: string;
 granularity?: 'hour' | 'day' | 'week' | 'month';
 platforms?: string;
 entity_type?: string;
 } = {}
 ): Promise<Record<string, unknown>> {
 await this.verifyBrandOwnership(agencyId, brandId);

 const { from, to, granularity = 'day', platforms, entity_type = 'all' } = options;

 const { data: queries, error } = await this.supabase
 .from('ai_queries')
 .select('id, platform, created_at, sentiment_score')
 .eq('brand_id', brandId)
 .gte('created_at', from || '2000-01-01')
 .lte('created_at', to || new Date().toISOString());

 if (error) {
 throw new AppError(`Failed to fetch analytics: ${error.message}`, 500);
 }

 let filteredQueries = queries || [];
 if (platforms) {
 const platformList = platforms.split(',');
 filteredQueries = filteredQueries.filter((q) => platformList.includes(q.platform));
 }

 const platformList = platforms ? platforms.split(',') : undefined;
 const entityTypeList = entity_type === 'all' ? undefined : entity_type.split(',');

 const { data: mentions, error: mentionsError } = await this.supabase
 .from('mentions')
 .select('id, platform, entity_type, entity_name, sentiment, sentiment_score, created_at')
 .eq('brand_id', brandId)
 .gte('created_at', from || '2000-01-01')
 .lte('created_at', to || new Date().toISOString());

 if (mentionsError) {
 throw new AppError(`Failed to fetch mentions for analytics: ${mentionsError.message}`, 500);
 }

 let filteredMentions = mentions || [];
 if (platformList) {
 filteredMentions = filteredMentions.filter((m) => platformList.includes(m.platform));
 }
 if (entityTypeList) {
 filteredMentions = filteredMentions.filter((m) => entityTypeList.includes(m.entity_type));
 }

 const totalQueries = filteredQueries.length;
 const totalMentions = filteredMentions.length;
 const brandMentions = filteredMentions.filter((m) => m.entity_type === 'brand').length;
 const visibilityScore = totalQueries > 0 ? Math.round((brandMentions / totalQueries) * 10000) / 10000 : 0;

 const sentimentScores = filteredMentions
 .filter((m) => m.sentiment_score !== null)
 .map((m) => m.sentiment_score as number);
 const avgSentiment = sentimentScores.length > 0
 ? Math.round((sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length) * 1000) / 1000
 : 0;

 const platformsSet = new Set(filteredQueries.map((q) => q.platform));

 const platformBreakdown: Record<string, unknown> = {};
 for (const platform of platformsSet) {
 const pQueries = filteredQueries.filter((q) => q.platform === platform);
 const pMentions = filteredMentions.filter((m) => m.platform === platform);
 const pBrandMentions = pMentions.filter((m) => m.entity_type === 'brand').length;
 const pSentimentScores = pMentions
 .filter((m) => m.sentiment_score !== null)
 .map((m) => m.sentiment_score as number);
 const pAvgSentiment = pSentimentScores.length > 0
 ? Math.round((pSentimentScores.reduce((a, b) => a + b, 0) / pSentimentScores.length) * 1000) / 1000
 : 0;
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
 const { data, error } = await this.supabase
 .from('brands')
 .select('id')
 .eq('id', brandId)
 .eq('agency_id', agencyId)
 .maybeSingle();

 if (error || !data) {
 throw new NotFoundError('Brand');
 }
 }

 private mapRowToBrand(row: Record<string, unknown>): Brand {
 return {
 id: row.id as string,
 agency_id: row.agency_id as string,
 name: row.name as string,
 industry: (row.industry as string) || null,
 description: (row.description as string) || null,
 website_url: (row.website_url as string) || null,
 logo_url: (row.logo_url as string) || null,
 keywords: (row.keywords as BrandKeyword[]) || [],
 competitors: (row.competitors as BrandCompetitor[]) || [],
 scan_frequency: row.scan_frequency as ScanFrequency,
 is_active: row.is_active as boolean,
 last_scanned_at: (row.last_scanned_at as string) || null,
 visibility_score: row.visibility_score as number | undefined,
 total_mentions: row.total_mentions as number | undefined,
 created_at: row.created_at as string,
 updated_at: row.updated_at as string,
 };
 }
}
