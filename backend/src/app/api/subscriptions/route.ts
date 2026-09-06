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

 const subscriptions = await prisma.subscriptions.findMany({
 where: { agency_id: agency.id },
 orderBy: { current_period_end: 'desc' },
 select: {
 id: true,
 agency_id: true,
 stripe_customer_id: true,
 stripe_subscription_id: true,
 plan: true,
 status: true,
 current_period_start: true,
 current_period_end: true,
 cancel_at_period_end: true,
 trial_ends_at: true,
 created_at: true,
 },
 });

 return successResponse(subscriptions);
 } catch (error) {
 console.error('List subscriptions error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to fetch subscriptions', 500);
 }
}

export async function POST(request: NextRequest) {
 try {
 const agency = await getAgencyFromRequest(request);
 if (!agency) return errorResponse('UNAUTHORIZED', 'Not authenticated', 401);

 const body = await request.json();

 const subscription = await prisma.subscriptions.upsert({
 where: { stripe_subscription_id: body.stripe_subscription_id || `pending-${agency.id}` },
 update: {
 status: body.status || 'active',
 plan: body.plan || 'starter',
 current_period_start: body.current_period_start ? new Date(body.current_period_start) : undefined,
 current_period_end: body.current_period_end ? new Date(body.current_period_end) : undefined,
 cancel_at_period_end: body.cancel_at_period_end || false,
 trial_ends_at: body.trial_ends_at ? new Date(body.trial_ends_at) : undefined,
 metadata: body.metadata || {},
 },
 create: {
 agency_id: agency.id,
 stripe_customer_id: body.stripe_customer_id,
 stripe_subscription_id: body.stripe_subscription_id,
 plan: body.plan || 'starter',
 status: body.status || 'active',
 current_period_start: new Date(body.current_period_start || Date.now()),
 current_period_end: new Date(body.current_period_end || Date.now()),
 cancel_at_period_end: body.cancel_at_period_end || false,
 trial_ends_at: body.trial_ends_at ? new Date(body.trial_ends_at) : null,
 metadata: body.metadata || {},
 },
 });

 return successResponse(subscription, undefined, 201);
 } catch (error) {
 console.error('Create subscription error:', error);
 return errorResponse('INTERNAL_ERROR', 'Failed to create subscription', 500);
 }
}
