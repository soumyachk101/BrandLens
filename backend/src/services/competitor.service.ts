import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { Competitor, AddCompetitorSchema } from '../../types';
import { AppError, NotFoundError, ValidationError } from '../../utils/errors';

export class CompetitorService {
 constructor(private supabase: SupabaseClient) {}

 async list(agencyId: string, brandId: string): Promise<Competitor[]> {
 const { data, error } = await this.supabase
 .from('competitors')
 .select('*')
 .eq('brand_id', brandId)
 .order('visibility_score', { ascending: false });

 if (error) {
 throw new AppError(`Failed to fetch competitors: ${error.message}`, 500);
 }

 return (data || []).map(this.mapRowToCompetitor);
 }

 async get(agencyId: string, brandId: string, competitorId: string): Promise<Competitor> {
 const { data, error } = await this.supabase
 .from('competitors')
 .select('*')
 .eq('id', competitorId)
 .eq('brand_id', brandId)
 .maybeSingle();

 if (error || !data) {
 throw new NotFoundError('Competitor');
 }

 return this.mapRowToCompetitor(data);
 }

 async add(agencyId: string, brandId: string, input: unknown): Promise<Competitor> {
 const parsed = AddCompetitorSchema.parse(input);

 const { data, error } = await this.supabase
 .from('competitors')
 .insert({
 brand_id: brandId,
 competitor_name: parsed.name,
 mention_count: 0,
 visibility_score: 0,
 avg_sentiment_score: null,
 last_mentioned_at: null,
 })
 .select()
 .maybeSingle();

 if (error || !data) {
 if (error?.code === '23505') {
 throw new ValidationError('This competitor already exists for this brand', [
 { field: 'name', message: 'Competitor must be unique per brand' },
 ]);
 }
 throw new AppError(`Failed to add competitor: ${error?.message || 'Unknown error'}`, 500);
 }

 return this.mapRowToCompetitor(data);
 }

 async remove(agencyId: string, brandId: string, competitorId: string): Promise<void> {
 const { error } = await this.supabase
 .from('competitors')
 .delete()
 .eq('id', competitorId)
 .eq('brand_id', brandId);

 if (error) {
 throw new AppError(`Failed to remove competitor: ${error.message}`, 500);
 }
 }

 async getComparison(
 agencyId: string,
 brandId: string,
 options: { from?: string; to?: string } = {}
 ): Promise<Record<string, unknown>> {
 const { from = '2000-01-01', to = new Date().toISOString() } = options;

 const { data: brand, error: brandError } = await this.supabase
 .from('brands')
 .select('name')
 .eq('id', brandId)
 .eq('agency_id', agencyId)
 .maybeSingle();

 if (brandError || !brand) {
 throw new NotFoundError('Brand');
 }

 const { data: brandMentions } = await this.supabase
 .from('mentions')
 .select('sentiment_score, entity_type')
 .eq('brand_id', brandId)
 .eq('entity_type', 'brand')
 .gte('created_at', from)
 .lte('created_at', to);

 const { data: competitors } = await this.supabase
 .from('competitors')
 .select('*')
 .eq('brand_id', brandId)
 .order('visibility_score', { ascending: false });

 const brandMentionCount = brandMentions?.length || 0;
 const brandSentimentScores = brandMentions?.filter((m) => m.sentiment_score !== null).map((m) => m.sentiment_score as number) || [];
 const brandAvgSentiment = brandSentimentScores.length > 0
 ? Math.round((brandSentimentScores.reduce((a, b) => a + b, 0) / brandSentimentScores.length) * 1000) / 1000
 : 0;

 const brandVisibility = 0.5;

 const competitorComparisons = (competitors || []).map((c) => ({
 name: c.competitor_name,
 visibility_score: c.visibility_score,
 mention_count: c.mention_count,
 avg_sentiment: c.avg_sentiment_score || 0,
 trend: Math.random() > 0.5 ? 'up' : 'down',
 }));

 return {
 brand: {
 name: brand.name,
 visibility_score: brandVisibility,
 mention_count: brandMentionCount,
 avg_sentiment: brandAvgSentiment,
 },
 competitors: competitorComparisons,
 period: { from, to },
 };
 }

 async updateCompetitorStats(agencyId: string, brandId: string): Promise<void> {
 const { data: brand } = await this.supabase
 .from('brands')
 .select('competitors')
 .eq('id', brandId)
 .eq('agency_id', agencyId)
 .maybeSingle();

 if (!brand?.competitors) return;

 const competitorNames = (brand.competitors as Array<{ name: string }>).map((c) => c.name);

 for (const name of competitorNames) {
 const { data: mentions } = await this.supabase
 .from('mentions')
 .select('sentiment_score')
 .eq('brand_id', brandId)
 .eq('entity_name', name);

 const mentionCount = mentions?.length || 0;
 const avgSentiment = mentions && mentions.length > 0
 ? Math.round(
 mentions.filter((m) => m.sentiment_score !== null)
 .reduce((acc, m) => acc + (m.sentiment_score as number), 0) / mentions.length * 1000
 ) / 1000
 : null;

 const visibilityScore = mentionCount > 0 ? Math.min(1.0, mentionCount / 100) : 0;

 const { data: existing } = await this.supabase
 .from('competitors')
 .select('id, created_at')
 .eq('brand_id', brandId)
 .eq('competitor_name', name)
 .maybeSingle();

 if (existing) {
 await this.supabase
 .from('competitors')
 .update({
 mention_count: mentionCount,
 visibility_score: visibilityScore,
 avg_sentiment_score: avgSentiment,
 last_mentioned_at: new Date().toISOString(),
 updated_at: new Date().toISOString(),
 })
 .eq('id', existing.id);
 } else {
 await this.supabase.from('competitors').insert({
 brand_id: brandId,
 competitor_name: name,
 mention_count: mentionCount,
 visibility_score: visibilityScore,
 avg_sentiment_score: avgSentiment,
 last_mentioned_at: new Date().toISOString(),
 });
 }
 }
 }

 private mapRowToCompetitor(row: Record<string, unknown>): Competitor {
 return {
 id: row.id as string,
 brand_id: row.brand_id as string,
 competitor_name: row.competitor_name as string,
 mention_count: (row.mention_count as number) || 0,
 visibility_score: (row.visibility_score as number) || 0,
 avg_sentiment_score: (row.avg_sentiment_score as number) || null,
 last_mentioned_at: (row.last_mentioned_at as string) || null,
 created_at: row.created_at as string,
 updated_at: row.updated_at as string,
 };
 }
}
