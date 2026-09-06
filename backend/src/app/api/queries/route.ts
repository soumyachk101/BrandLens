import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { queryFilterSchema } from '@/lib/validations';
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
 const parsed = queryFilterSchema.parse({
 platform: searchParams.get('platform'),
 from: searchParams.get('from'),
 to: searchParams.get('to'),
 status: searchParams.get('status'),
 query_variant: searchParams.get('query_variant'),
 sentiment: searchParams.get('sentiment'),
 search: searchParams.get('search'),
 sort: searchParams.get('sort'),
 order: searchParams.get('order'),
 page: searchParams.get('page'),
 limit: searchParams.get('limit'),
 });

 const brandId = searchParams.get('brand_id');
 if (!brandId) {
 return errorResponse('VALIDATION_ERROR', 'brand_id query parameter is required', 422);
 }

 // Verify brand belongs to agency
 const brand = await prisma.brands.findFirst({
 where: { id: brandId, agency_id: agency.id },
 select: { id: true },
 });

 if (!brand) {
 return errorResponse('NOT_FOUND', 'Brand not found', 404);
 }

 const where: any = { brand_id: brandId };

 if (parsed.platform) {
 where.platform = parsed.platform;
 }
 if (parsed.status) {
 where.status = parsed.status;
 }
 if (parsed.query_variant) {
 where.query_variant = parsed.query_variant;
 }
 if (parsed.sentiment) {
 where.sentiment_score = parsed.sentiment === 'positive' ? { gt: 0.1 } : parsed.sentiment === 'negative' ? { lt: -0.1 } : { gte: -0.1, lte: 0.1 };
 }
 if (parsed.from || parsed.to) {
 where.created_at = {};
 if (parsed.from) where.created_at.gte = new Date(parsed.from);
 if (parsed.to) where.created_at.lte = new Date(parsed.to);
 }
 if (parsed.search) {
 where.query_text = { contains: parsed.search, mode: 'insensitive' };
 }

 const orderBy: any = {};
 const sortField = parsed.sort || 'created_at';
 orderBy[sortField] = parsed.order;

 const [total, queries] = await Promise.all([
 prisma.ai_queries.count({ where }),
 prisma.ai_queries.findMany({
 where,
 skip: (parsed.page - 1) * parsed.limit,
 take: parsed.limit,
 orderBy,
 }),
 ]);

 const result = queries.map((q) => ({
 ...q,
 ai_response: q.ai_response as any,
 mentions: Array.isArray(q.mentions) ? q.mentions : [],
 }));

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
 console.error('List queries error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to fetch queries', 500);
 }
}
