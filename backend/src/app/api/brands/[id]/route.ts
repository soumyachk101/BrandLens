import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { updateBrandSchema } from '@/lib/validations';

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

 if (!brand) {
 return errorResponse('NOT_FOUND', 'Brand not found', 404);
 }

 // Compute visibility score
 const [queriesCount, mentionsData] = await Promise.all([
 prisma.ai_queries.count({ where: { brand_id: brand.id } }),
 prisma.ai_queries.findMany({
 where: { brand_id: brand.id },
 select: { mentions: true },
 }),
 ]);

 let totalMentions = 0;
 for (const q of mentionsData) {
 const mentions = Array.isArray(q.mentions) ? q.mentions : [];
 totalMentions += mentions.length;
 }

 const visibilityScore = queriesCount > 0 ? Math.min((totalMentions / queriesCount) * 0.3, 1) : 0;

 return successResponse({ ...brand, visibility_score: visibilityScore, total_mentions: totalMentions });
 } catch (error) {
 console.error('Get brand error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to fetch brand', 500);
 }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const existing = await prisma.brands.findFirst({
 where: { id: params.id, agency_id: agency.id },
 });

 if (!existing) {
 return errorResponse('NOT_FOUND', 'Brand not found', 404);
 }

 const body = await request.json();
 const parsed = updateBrandSchema.safeParse(body);

 if (!parsed.success) {
 return errorResponse('VALIDATION_ERROR', 'Validation failed', 422, parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })));
 }

 const brand = await prisma.brands.update({
 where: { id: params.id },
 data: parsed.data,
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

 return successResponse(brand);
 } catch (error) {
 console.error('Update brand error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to update brand', 500);
 }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const existing = await prisma.brands.findFirst({
 where: { id: params.id, agency_id: agency.id },
 });

 if (!existing) {
 return errorResponse('NOT_FOUND', 'Brand not found', 404);
 }

 await prisma.brands.delete({ where: { id: params.id } });

 return new NextResponse(null, { status: 204 });
 } catch (error) {
 console.error('Delete brand error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to delete brand', 500);
 }
}
