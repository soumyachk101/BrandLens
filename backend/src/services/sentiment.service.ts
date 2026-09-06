import { SupabaseClient } from '@supabase/supabase-js';
import { SentimentType } from '../../types';
import { AppError } from '../../utils/errors';

const AFINN: Record<string, number> = {
 'good': 3,
 'great': 4,
 'excellent': 5,
 'amazing': 5,
 'outstanding': 5,
 'wonderful': 4,
 'fantastic': 5,
 'best': 4,
 'love': 4,
 'awesome': 4,
 'brilliant': 4,
 'superb': 5,
 'perfect': 5,
 'bad': -3,
 'terrible': -4,
 'horrible': -5,
 'awful': -5,
 'poor': -2,
 'worst': -5,
 'hate': -4,
 'disappointing': -3,
 'disappointed': -3,
 'disappointment': -3,
 'good': 3,
 'nice': 2,
 'helpful': 2,
 'useful': 2,
 'reliable': 2,
 'fast': 2,
 'easy': 2,
 'powerful': 2,
 'innovative': 3,
 'leading': 2,
 'trusted': 2,
 'popular': 1,
 'favorite': 3,
 'recommended': 2,
 'overrated': -2,
 'disappointing': -3,
 'slow': -2,
 'expensive': -2,
 'buggy': -3,
 'unreliable': -2,
 'confusing': -2,
 'difficult': -1,
 'frustrating': -3,
 'annoying': -2,
 'mediocre': -1,
 'overpriced': -2,
 'broken': -3,
 'useless': -3,
 'waste': -2,
};

export class SentimentService {
 constructor(private supabase: SupabaseClient) {}

 async analyzeSentiment(text: string): Promise<{ sentiment: SentimentType; score: number; confidence: number }> {
 const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
 let score = 0;
 let matches = 0;

 for (const word of words) {
 if (AFINN[word]) {
 score += AFINN[word];
 matches++;
 }
 }

 const maxScore = Math.max(matches * 5, 1);
 const normalizedScore = Math.max(-1, Math.min(1, score / maxScore));

 let sentiment: SentimentType;
 if (normalizedScore > 0.1) {
 sentiment = 'positive';
 } else if (normalizedScore < -0.1) {
 sentiment = 'negative';
 } else {
 sentiment = 'neutral';
 }

 const confidence = matches > 0 ? Math.min(0.7, matches * 0.15) : 0.1;

 return { sentiment, score: Math.round(normalizedScore * 1000) / 1000, confidence: Math.round(confidence * 1000) / 1000 };
 }

 async batchAnalyze(mentionIds: string[]): Promise<void> {
 if (mentionIds.length === 0) return;

 const { data: mentions, error } = await this.supabase
 .from('mentions')
 .select('id, context')
 .in('id', mentionIds);

 if (error || !mentions) {
 console.error('Failed to fetch mentions for batch sentiment analysis:', error);
 return;
 }

 for (const mention of mentions) {
 const result = await this.analyzeSentiment(mention.context);
 await this.supabase
 .from('mentions')
 .update({
 sentiment: result.sentiment,
 sentiment_score: result.score,
 confidence_score: result.confidence,
 })
 .eq('id', mention.id);
 }
 }

 async getSentimentTrends(
 brandId: string,
 options: {
 from?: string;
 to?: string;
 granularity?: 'hour' | 'day' | 'week' | 'month';
 } = {}
 ): Promise<Record<string, unknown>[]> {
 const { from = '2000-01-01', to = new Date().toISOString(), granularity = 'day' } = options;

 const { data, error } = await this.supabase
 .from('mentions')
 .select('created_at, sentiment, sentiment_score')
 .eq('brand_id', brandId)
 .gte('created_at', from)
 .lte('created_at', to)
 .order('created_at', { ascending: true });

 if (error) {
 throw new AppError(`Failed to fetch sentiment trends: ${error.message}`, 500);
 }

 const dateMap = new Map<string, { positive: number; neutral: number; negative: number; mixed: number; scores: number[] }>();

 for (const mention of (data || [])) {
 const date = new Date(mention.created_at);
 let key: string;
 if (granularity === 'day') {
 key = date.toISOString().split('T')[0];
 } else if (granularity === 'week') {
 const weekStart = new Date(date);
 weekStart.setDate(date.getDate() - date.getDay());
 key = weekStart.toISOString().split('T')[0];
 } else if (granularity === 'month') {
 key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
 } else {
 key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}`;
 }

 if (!dateMap.has(key)) {
 dateMap.set(key, { positive: 0, neutral: 0, negative: 0, mixed: 0, scores: [] });
 }

 const bucket = dateMap.get(key)!;
 bucket[(mention.sentiment as 'positive' | 'neutral' | 'negative' | 'mixed') || 'neutral']++;
 if (mention.sentiment_score !== null && mention.sentiment_score !== undefined) {
 bucket.scores.push(mention.sentiment_score);
 }
 }

 return Array.from(dateMap.entries())
 .sort(([a], [b]) => a.localeCompare(b))
 .map(([date, counts]) => ({
 date,
 positive: counts.positive,
 neutral: counts.neutral,
 negative: counts.negative,
 mixed: counts.mixed,
 avg_sentiment: counts.scores.length > 0
 ? Math.round((counts.scores.reduce((a, b) => a + b, 0) / counts.scores.length) * 1000) / 1000
 : 0,
 total_mentions: counts.positive + counts.neutral + counts.negative + counts.mixed,
 }));
 }
}
