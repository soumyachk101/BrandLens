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

 const query = await prisma.ai_queries.findFirst({
 where: {
 id: params.id,
 brand: { agency_id: agency.id },
 },
 include: {
 brand: {
 select: {
 id: true,
 name: true,
 agency_id: true,
 },
 },
 },
 });

 if (!query) {
 return errorResponse('NOT_FOUND', 'Query not found', 404);
 }

 return successResponse({
 ...query,
 ai_response: query.ai_response as any,
 mentions: Array.isArray(query.mentions) ? query.mentions : [],
 });
 } catch (error) {
 console.error('Get query error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to fetch query', 500);
 }
}
