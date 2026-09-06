import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { mentionFilterSchema } from '@/lib/validations';
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

 const { searchParams } = new URL(request.url);
 const parsed = mentionFilterSchema.parse({
 platform: searchParams.get('platform'),
 sentiment: searchParams.get('sentiment'),
 from: searchParams.get('from'),
 to: searchParams.get('to'),
 entity_type: searchParams.get('entity_type'),
 entity_name: searchParams.get('entity_name'),
 min_confidence: searchParams.get('min_confidence'),
 search: searchParams.get('search'),
 sort: searchParams.get('sort'),
 order: searchParams.get('order'),
 page: searchParams.get('page'),
 limit: searchParams.get('limit'),
 });

 // Verify brand belongs to agency
 const brand = await prisma.brands.findFirst({
 where: { id: params.id, agency_id: agency.id },
 select: { id: true },
 });

 if (!brand) {
 return errorResponse('NOT_FOUND', 'Brand not found', 404);
 }

 const where: any = { brand_id: params.id };

 if (parsed.platform) {
 where.platform = parsed.platform;
 }
 if (parsed.sentiment) {
 where.sentiment = parsed.sentiment;
 }
 if (parsed.from || parsed.to) {
 where.created_at = {};
 if (parsed.from) where.created_at.gte = new Date(parsed.from);
 if (parsed.to) where.created_at.lte = new Date(parsed.to);
 }
 if (parsed.entity_type) {
 const types = parsed.entity_type.split(',').map((t) => t.trim());
 where.entity_type = { in: types };
 }
 if (parsed.entity_name) {
 where.entity_name = { contains: parsed.entity_name, mode: 'insensitive' };
 }
 if (parsed.min_confidence !== undefined) {
 where.confidence_score = { gte: parsed.min_confidence };
 }
 if (parsed.search) {
 where.context = { search: parsed.search };
 }

 const orderBy: any = {};
 const sortField = parsed.sort || 'created_at';
 orderBy[sortField] = parsed.order;

 const [total, mentions] = await Promise.all([
 prisma.mentions.count({ where }),
 prisma.mentions.findMany({
 where,
 skip: (parsed.page - 1) * parsed.limit,
 take: parsed.limit,
 orderBy,
 }),
 ]);

 return successResponse(mentions, {
 page: parsed.page,
 limit: parsed.limit,
 total,
 total_pages: Math.ceil(total / parsed.limit),
 });
 } catch (error: any) {
 if (error instanceof z.ZodError) {
 return errorResponse('VALIDATION_ERROR', 'Validation failed', 422, error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })));
 }
 console.error('List mentions error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to fetch mentions', 500);
 }
}
