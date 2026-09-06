import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { addCompetitorSchema } from '@/lib/validations';

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
 const brandId = searchParams.get('brand_id');

 if (!brandId) {
 return errorResponse('VALIDATION_ERROR', 'brand_id query parameter is required', 422);
 }

 const brand = await prisma.brands.findFirst({
 where: { id: brandId, agency_id: agency.id },
 select: { id: true },
 });

 if (!brand) {
 return errorResponse('NOT_FOUND', 'Brand not found', 404);
 }

 const competitors = await prisma.competitors.findMany({
 where: { brand_id: brandId },
 orderBy: { visibility_score: 'desc' },
 });

 return successResponse(competitors);
 } catch (error) {
 console.error('List competitors error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to fetch competitors', 500);
 }
}

export async function POST(request: NextRequest) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const body = await request.json();
 const parsed = addCompetitorSchema.safeParse(body);

 if (!parsed.success) {
 return errorResponse('VALIDATION_ERROR', 'Validation failed', 422, parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })));
 }

 const brandId = body.brand_id;
 if (!brandId) {
 return errorResponse('VALIDATION_ERROR', 'brand_id is required', 422);
 }

 const brand = await prisma.brands.findFirst({
 where: { id: brandId, agency_id: agency.id },
 select: { id: true },
 });

 if (!brand) {
 return errorResponse('NOT_FOUND', 'Brand not found', 404);
 }

 const competitor = await prisma.competitors.create({
 data: {
 brand_id: brandId,
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
