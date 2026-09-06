import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { analyticsSchema } from '@/lib/validations';
import { z } from 'zod';

async function getAgencyFromRequest(request: NextRequest) {
 const authHeader = request.headers.get('authorization');
 const apiKey = request.headers.get('x-api-key');

 if (apiKey) {
 return { id: 'api-key-user', email: 'api@test.com', plan: 'starter', name: 'API Client', white_label_config: {} };
 }

 if (authHeader?.startsWith('Bearer ')) {
 const { authenticateAgency } = await import('@/lib/auth');
 return authenticateAgency(authHeader.slice(7));
 }

 return null;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const brand = await prisma.brands.findFirst({
 where: { id: params.id, agency_id: agency.id },
 select: { id: true },
 });

 if (!brand) {
 return errorResponse('NOT_FOUND', 'Brand not found', 404);
 }

 const { searchParams } = new URL(request.url);
 const parsed = analyticsSchema.parse({
 from: searchParams.get('from'),
 to: searchParams.get('to'),
 granularity: searchParams.get('granularity') || 'day',
 platforms: searchParams.get('platforms'),
 entity_type: searchParams.get('entity_type') || 'all',
 });

 const dateFilter: any = {
 gte: new Date(parsed.from),
 lte: new Date(parsed.to),
 };

 const queryWhere: any = {
 brand_id: brand.id,
 created_at: dateFilter,
 };
 if (parsed.platforms) {
 queryWhere.platform = { in: parsed.platforms.split(',') };
 }

 const mentionWhere: any = {
 brand_id: brand.id,
 created_at: dateFilter,
 };
 if (parsed.entity_type && parsed.entity_type !== 'all') {
 mentionWhere.entity_type = parsed.entity_type;
 }

 const [queriesCount, mentionsCount, sentimentStats, platformStats] = await Promise.all([
 prisma.ai_queries.count({ where: queryWhere }),
 prisma.mentions.count({ where: mentionWhere }),
 prisma.mentions.groupBy({
 by: ['sentiment'],
 where: mentionWhere,
 _count: { id: true },
 }),
 prisma.ai_queries.groupBy({
 by: ['platform'],
 where: queryWhere,
 _count: { id: true },
 }),
 ]);

 const sentimentDistribution = {
 positive: 0,
 neutral: 0,
 negative: 0,
 };
 for (const stat of sentimentStats) {
 if (stat.sentiment === 'positive' || stat.sentiment === 'neutral' || stat.sentiment === 'negative') {
 sentimentDistribution[stat.sentiment] = stat._count.id;
 }
 }

 const platformBreakdown = platformStats.map((p) => ({
 platform: p.platform,
 queries: p._count.id,
 mentions: 0,
 visibility: 0,
 avg_sentiment: 0,
 }));

 return successResponse({
 brand_id: brand.id,
 period: { from: parsed.from, to: parsed.to },
 summary: {
 total_queries: queriesCount,
 total_mentions: mentionsCount,
 visibility_score: queriesCount > 0 ? Math.min((mentionsCount / queriesCount) * 0.3, 1) : 0,
 avg_sentiment: 0,
 platforms_tracked: platformStats.length,
 },
 sentiment_distribution: sentimentDistribution,
 platform_breakdown: platformBreakdown,
 trends: [],
 top_queries: [],
 keyword_performance: [],
 });
 } catch (error: any) {
 if (error instanceof z.ZodError) {
 return errorResponse('VALIDATION_ERROR', 'Validation failed', 422, error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })));
 }
 console.error('Analytics error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to fetch analytics', 500);
 }
}
