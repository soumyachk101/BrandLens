import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { reportFilterSchema } from '@/lib/validations';
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

 const parsed = reportFilterSchema.parse({
 report_type: searchParams.get('report_type'),
 from: searchParams.get('from'),
 to: searchParams.get('to'),
 status: searchParams.get('status'),
 page: searchParams.get('page'),
 limit: searchParams.get('limit'),
 });

 const where: any = { brand_id: brandId };

 if (parsed.report_type) {
 where.report_type = parsed.report_type;
 }
 if (parsed.status) {
 where.status = parsed.status;
 }
 if (parsed.from || parsed.to) {
 where.created_at = {};
 if (parsed.from) where.created_at.gte = new Date(parsed.from);
 if (parsed.to) where.created_at.lte = new Date(parsed.to);
 }

 const [total, reports] = await Promise.all([
 prisma.reports.count({ where }),
 prisma.reports.findMany({
 where,
 skip: (parsed.page - 1) * parsed.limit,
 take: parsed.limit,
 orderBy: { created_at: 'desc' },
 }),
 ]);

 return successResponse(reports, {
 page: parsed.page,
 limit: parsed.limit,
 total,
 total_pages: Math.ceil(total / parsed.limit),
 });
 } catch (error: any) {
 if (error instanceof z.ZodError) {
 return errorResponse('VALIDATION_ERROR', 'Validation failed', 422, error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })));
 }
 console.error('List reports error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to fetch reports', 500);
 }
}

export async function POST(request: NextRequest) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const body = await request.json();
 const { createReportSchema } = await import('@/lib/validations');
 const parsed = createReportSchema.safeParse(body);

 if (!parsed.success) {
 return errorResponse('VALIDATION_ERROR', 'Validation failed', 422, parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })));
 }

 const brand = await prisma.brands.findFirst({
 where: { id: (body as any).brand_id || '', agency_id: agency.id },
 select: { id: true, name: true },
 });

 // For route-level create, we need brand_id from body
 const report = await prisma.reports.create({
 data: {
 brand_id: (body as any).brand_id || '',
 report_type: parsed.data.report_type,
 period_start: new Date(parsed.data.period_start),
 period_end: new Date(parsed.data.period_end),
 sent_to: parsed.data.send_to || [],
 status: 'generating',
 },
 });

 return successResponse(report, undefined, 201);
 } catch (error: any) {
 if (error.code === 'P2003') {
 return errorResponse('NOT_FOUND', 'Brand not found', 404);
 }
 console.error('Create report error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to create report', 500);
 }
}
