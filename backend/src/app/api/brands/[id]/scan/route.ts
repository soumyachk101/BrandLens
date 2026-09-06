import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import { triggerScanSchema } from '@/lib/validations';

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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const brand = await prisma.brands.findFirst({
 where: { id: params.id, agency_id: agency.id },
 select: { id: true, scan_frequency: true },
 });

 if (!brand) {
 return errorResponse('NOT_FOUND', 'Brand not found', 404);
 }

 const body = await request.json().catch(() => ({}));
 const parsed = triggerScanSchema.safeParse(body);

 if (!parsed.success) {
 return errorResponse('VALIDATION_ERROR', 'Validation failed', 422, parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })));
 }

 const platforms = parsed.data.platforms.length > 0 ? parsed.data.platforms : ['chatgpt', 'perplexity', 'claude'];
 const variants = parsed.data.query_variants;

 // Create scan job record
 const scanJobs = await Promise.all(
 platforms.map((platform) =>
 prisma.scan_jobs.create({
 data: {
 brand_id: brand.id,
 agency_id: agency.id,
 platform,
 status: 'queued',
 queries_total: variants.length,
 queries_done: 0,
 queries_failed: 0,
 triggered_by: 'api',
 },
 }),
 ),
 );

 return successResponse(
 {
 scan_job_ids: scanJobs.map((j) => j.id),
 brand_id: brand.id,
 status: 'queued',
 platforms,
 queries_total: variants.length * platforms.length,
 estimated_duration_seconds: 90,
 created_at: new Date().toISOString(),
 },
 undefined,
 202,
 );
 } catch (error) {
 console.error('Trigger scan error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to queue scan', 500);
 }
}
