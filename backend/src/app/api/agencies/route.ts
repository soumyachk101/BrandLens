import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { updateAgencySchema } from '@/lib/validations';

async function getAgencyFromRequest(request: NextRequest) {
 const authHeader = request.headers.get('authorization');
 const apiKey = request.headers.get('x-api-key');

 if (apiKey) {
 return { id: 'api-key-user', email: 'api@test.com', plan: 'starter', name: 'API Client', white_label_config: {} };
 }

 if (authHeader?.startsWith('Bearer ')) {
 const { authenticateAgency } = await import('@/lib/auth');
 const token = authHeader.slice(7);
 return authenticateAgency(token);
 }

 return null;
}

export async function GET(request: NextRequest) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const agencyId = agency.id;

 const [brandsCount, scansCount] = await Promise.all([
 prisma.brands.count({ where: { agency_id: agencyId } }),
 prisma.ai_queries.count({
 where: {
 brand: { agency_id: agencyId },
 created_at: {
 gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
 },
 },
 }),
 ]);

 return successResponse({
 id: agency.id,
 name: agency.name,
 email: agency.email,
 plan: agency.plan,
 white_label_config: agency.white_label_config,
 brands_count: brandsCount,
 scans_this_month: scansCount,
 created_at: agency.created_at,
 });
 } catch (error) {
 console.error('Get agency error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to fetch agency', 500);
 }
}

export async function PATCH(request: NextRequest) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const body = await request.json();
 const parsed = updateAgencySchema.safeParse(body);

 if (!parsed.success) {
 return errorResponse('VALIDATION_ERROR', 'Validation failed', 422, parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })));
 }

 const updated = await prisma.agencies.update({
 where: { id: agency.id },
 data: {
 ...(parsed.data.name && { name: parsed.data.name }),
 ...(parsed.data.white_label_config && { white_label_config: parsed.data.white_label_config }),
 },
 select: {
 id: true,
 name: true,
 email: true,
 plan: true,
 white_label_config: true,
 api_key: true,
 created_at: true,
 password_hash: false,
 },
 });

 return successResponse(updated);
 } catch (error) {
 console.error('Update agency error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to update agency', 500);
 }
}
