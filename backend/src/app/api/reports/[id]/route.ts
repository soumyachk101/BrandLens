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

 const report = await prisma.reports.findFirst({
 where: {
 id: params.id,
 brand: { agency_id: agency.id },
 },
 });

 if (!report) {
 return errorResponse('NOT_FOUND', 'Report not found', 404);
 }

 return successResponse(report);
 } catch (error) {
 console.error('Get report error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to fetch report', 500);
 }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const existing = await prisma.reports.findFirst({
 where: {
 id: params.id,
 brand: { agency_id: agency.id },
 },
 });

 if (!existing) {
 return errorResponse('NOT_FOUND', 'Report not found', 404);
 }

 const body = await request.json();
 const report = await prisma.reports.update({
 where: { id: params.id },
 data: {
 ...(body.status && { status: body.status }),
 ...(body.sent_to && { sent_to: body.sent_to }),
 ...(body.sent_at && { sent_at: new Date(body.sent_at) }),
 ...(body.pdf_url && { pdf_url: body.pdf_url }),
 ...(body.html_url && { html_url: body.html_url }),
 ...(body.data && { data: body.data }),
 },
 });

 return successResponse(report);
 } catch (error) {
 console.error('Update report error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to update report', 500);
 }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const existing = await prisma.reports.findFirst({
 where: {
 id: params.id,
 brand: { agency_id: agency.id },
 },
 });

 if (!existing) {
 return errorResponse('NOT_FOUND', 'Report not found', 404);
 }

 await prisma.reports.delete({ where: { id: params.id } });

 return new NextResponse(null, { status: 204 });
 } catch (error) {
 console.error('Delete report error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to delete report', 500);
 }
}
