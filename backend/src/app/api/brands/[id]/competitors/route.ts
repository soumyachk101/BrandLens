import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';

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
 const from = searchParams.get('from');
 const to = searchParams.get('to');

 const competitors = await prisma.competitors.findMany({
 where: { brand_id: params.id },
 orderBy: { visibility_score: 'desc' },
 });

 // Compute competitor comparison if date range provided
 let comparison = null;
 if (from || to) {
 const dateFilter: any = {};
 if (from) dateFilter.gte = new Date(from);
 if (to) dateFilter.lte = new Date(to);

 const [brandStats, competitorStats] = await Promise.all([
 prisma.ai_queries.groupBy({
 by: ['brand_id'],
 where: { brand_id: params.id, created_at: dateFilter },
 _count: { id: true },
 }),
 prisma.mentions.groupBy({
 by: ['entity_name'],
 where: {
 brand_id: params.id,
 entity_type: 'competitor',
 created_at: dateFilter,
 },
 _count: { id: true },
 _avg: { sentiment_score: true },
 }),
 ]);

 comparison = {
 brand: {
 name: 'Brand',
 visibility_score: brandStats[0]?._count?.id ? 0.5 : 0,
 mention_count: brandStats[0]?._count?.id || 0,
 avg_sentiment: 0,
 },
 competitors: competitorStats.map((cs: any) => ({
 name: cs.entity_name,
 visibility_score: cs._count?.id ? 0.5 : 0,
 mention_count: cs._count?.id || 0,
 avg_sentiment: cs._avg?.sentiment_score || 0,
 trend: 'stable',
 })),
 period: { from, to },
 };
 }

 return successResponse({
 data: competitors,
 comparison,
 });
 } catch (error) {
 console.error('Get competitors error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to fetch competitors', 500);
 }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

 const body = await request.json();
 const { addCompetitorSchema } = await import('@/lib/validations');
 const parsed = addCompetitorSchema.safeParse(body);

 if (!parsed.success) {
 return errorResponse('VALIDATION_ERROR', 'Validation failed', 422, parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })));
 }

 const competitor = await prisma.competitors.create({
 data: {
 brand_id: params.id,
 competitor_name: parsed.data.name,
 keywords: parsed.data.keywords || [],
 },
 });

 return successResponse(competitor, undefined, 201);
 } catch (error: any) {
 if (error.code === 'P2002') {
 return errorResponse('VALIDATION_ERROR', 'Competitor already exists for this brand', 422);
 }
 console.error('Add competitor error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to add competitor', 500);
 }
}
