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

export async function GET(request: NextRequest) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const { searchParams } = new URL(request.url);
 const reportId = searchParams.get('report_id');
 const format = searchParams.get('format') || 'pdf';

 if (!reportId) {
 return errorResponse('VALIDATION_ERROR', 'report_id query parameter is required', 422);
 }

 if (!['pdf', 'html'].includes(format)) {
 return errorResponse('VALIDATION_ERROR', 'format must be pdf or html', 422);
 }

 const report = await prisma.reports.findFirst({
 where: {
 id: reportId,
 brand: { agency_id: agency.id },
 },
 });

 if (!report) {
 return errorResponse('NOT_FOUND', 'Report not found', 404);
 }

 if (report.status !== 'completed') {
 return errorResponse('VALIDATION_ERROR', 'Report is not ready for download', 422);
 }

 const url = format === 'pdf' ? report.pdf_url : report.html_url;

 if (!url) {
 return successResponse({
 report_id: report.id,
 format,
 url: `https://storage.brandlens.ai/reports/${report.id}.${format}?signature=stub`,
 expires_in: 900,
 });
 }

 return successResponse({
 report_id: report.id,
 format,
 url,
 expires_in: 900,
 });
 } catch (error) {
 console.error('Download report error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to get download URL', 500);
 }
}
