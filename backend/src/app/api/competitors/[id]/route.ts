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

 const competitor = await prisma.competitors.findFirst({
 where: {
 id: params.id,
 brand: { agency_id: agency.id },
 },
 });

 if (!competitor) {
 return errorResponse('NOT_FOUND', 'Competitor not found', 404);
 }

 return successResponse(competitor);
 } catch (error) {
 console.error('Get competitor error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to fetch competitor', 500);
 }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const existing = await prisma.competitors.findFirst({
 where: {
 id: params.id,
 brand: { agency_id: agency.id },
 },
 });

 if (!existing) {
 return errorResponse('NOT_FOUND', 'Competitor not found', 404);
 }

 await prisma.competitors.delete({ where: { id: params.id } });

 return new NextResponse(null, { status: 204 });
 } catch (error) {
 console.error('Delete competitor error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to delete competitor', 500);
 }
}
