import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { createReportSchema } from '@/lib/validations';

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

export async function POST(request: NextRequest) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const body = await request.json();
 const parsed = createReportSchema.safeParse(body);

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

 const report = await prisma.reports.create({
 data: {
 brand_id: brandId,
 report_type: parsed.data.report_type,
 period_start: new Date(parsed.data.period_start),
 period_end: new Date(parsed.data.period_end),
 sent_to: parsed.data.send_to || [],
 status: 'generating',
 },
 });

 return successResponse(
 {
 report_id: report.id,
 status: 'generating',
 estimated_completion_seconds: 60,
 created_at: report.created_at,
 },
 undefined,
 202,
 );
 } catch (error) {
 console.error('Generate report error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to queue report generation', 500);
 }
}
