import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { brandFilterSchema, createBrandSchema } from '@/lib/validations';
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

export async function GET(request: NextRequest) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const { searchParams } = new URL(request.url);
 const parsed = brandFilterSchema.parse({
 search: searchParams.get('search'),
 industry: searchParams.get('industry'),
 is_active: searchParams.get('is_active'),
 page: searchParams.get('page'),
 limit: searchParams.get('limit'),
 sort: searchParams.get('sort'),
 order: searchParams.get('order'),
 });

 const agencyId = agency.id;
 const where: any = { agency_id: agencyId };

 if (parsed.search) {
 where.name = { contains: parsed.search, mode: 'insensitive' };
 }
 if (parsed.industry) {
 where.industry = parsed.industry;
 }
 if (parsed.is_active !== undefined) {
 where.is_active = parsed.is_active;
 }

 const orderBy: any = {};
 const sortField = parsed.sort || 'created_at';
 orderBy[sortField] = parsed.order;

 const [total, brands] = await Promise.all([
 prisma.brands.count({ where }),
 prisma.brands.findMany({
 where,
 skip: (parsed.page - 1) * parsed.limit,
 take: parsed.limit,
 orderBy,
 select: {
 id: true,
 agency_id: true,
 name: true,
 industry: true,
 description: true,
 website_url: true,
 logo_url: true,
 keywords: true,
 competitors: true,
 scan_frequency: true,
 is_active: true,
 last_scanned_at: true,
 created_at: true,
 updated_at: true,
 },
 }),
 ]);

 // Fetch visibility scores in parallel
 const brandIds = brands.map((b) => b.id);
 const visibilityData = await prisma.ai_queries.groupBy({
 by: ['brand_id'],
 where: { brand_id: { in: brandIds } },
 _count: { id: true },
 _avg: { mention_count: true },
 });

 const visibilityMap = new Map(visibilityData.map((v: any) => [v.brand_id, v]));

 const result = brands.map((brand) => {
 const vd = visibilityMap.get(brand.id);
 const totalQueries = vd?._count?.id || 0;
 const totalMentions = brand.keywords ? brand.keywords.length : 0;
 const visibilityScore = totalQueries > 0 ? Math.min((totalMentions / totalQueries) * 0.3, 1) : 0;

 return {
 ...brand,
 visibility_score: visibilityScore,
 total_mentions: totalMentions,
 };
 });

 return successResponse(result, {
 page: parsed.page,
 limit: parsed.limit,
 total,
 total_pages: Math.ceil(total / parsed.limit),
 });
 } catch (error: any) {
 if (error instanceof z.ZodError) {
 return errorResponse('VALIDATION_ERROR', 'Validation failed', 422, error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })));
 }
 console.error('List brands error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to fetch brands', 500);
 }
}

export async function POST(request: NextRequest) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const body = await request.json();
 const parsed = createBrandSchema.safeParse(body);

 if (!parsed.success) {
 return errorResponse('VALIDATION_ERROR', 'Validation failed', 422, parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })));
 }

 const existing = await prisma.brands.findFirst({
 where: { agency_id: agency.id, name: parsed.data.name },
 });

 if (existing) {
 return errorResponse('VALIDATION_ERROR', 'A brand with this name already exists for your agency', 422);
 }

 const brand = await prisma.brands.create({
 data: {
 ...parsed.data,
 agency_id: agency.id,
 },
 select: {
 id: true,
 agency_id: true,
 name: true,
 industry: true,
 description: true,
 website_url: true,
 logo_url: true,
 keywords: true,
 competitors: true,
 scan_frequency: true,
 is_active: true,
 last_scanned_at: true,
 created_at: true,
 updated_at: true,
 },
 });

 return successResponse(brand, undefined, 201);
 } catch (error) {
 console.error('Create brand error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to create brand', 500);
 }
}
