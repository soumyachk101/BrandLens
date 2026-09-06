import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
 try {
 const rawBody = await request.text();
 const event = JSON.parse(rawBody);

 // In production, verify Stripe signature here
 // const signature = request.headers.get('stripe-signature');
 // if (!verifyStripeSignature(rawBody, signature)) return errorResponse('UNAUTHORIZED', 'Invalid signature', 401);

 const stripeSubscriptionId = event.data?.object?.id || event.stripe_subscription_id;
 if (!stripeSubscriptionId) {
 return errorResponse('VALIDATION_ERROR', 'stripe_subscription_id is required in webhook payload', 422);
 }

 const subscription = await prisma.subscriptions.update({
 where: { stripe_subscription_id: stripeSubscriptionId },
 data: {
 status: event.data?.object?.status || 'active',
 current_period_start: event.data?.object?.current_period_start ? new Date(event.data?.object?.current_period_start * 1000) : undefined,
 current_period_end: event.data?.object?.current_period_end ? new Date(event.data?.object?.current_period_end * 1000) : undefined,
 cancel_at_period_end: event.data?.object?.cancel_at_period_end || false,
 metadata: event.data?.object?.metadata || {},
 },
 });

 // Log webhook event
 await prisma.webhook_events.create({
 data: {
 agency_id: subscription.agency_id,
 event_type: event.type || 'subscription.updated',
 payload: event,
 delivery_status: 'sent',
 sent_at: new Date(),
 },
 });

 return successResponse({ received: true, subscription });
 } catch (error: any) {
 console.error('Stripe webhook error:', error);

 // Log failed webhook event
 try {
 const stripeSubscriptionId = error.stripe_subscription_id;
 if (stripeSubscriptionId) {
 const sub = await prisma.subscriptions.findFirst({ where: { stripe_subscription_id: stripeSubscriptionId } });
 if (sub) {
 await prisma.webhook_events.create({
 data: {
 agency_id: sub.agency_id,
 event_type: 'subscription.webhook.failed',
 payload: { error: error.message },
 delivery_status: 'failed',
 },
 });
 }
 }
 } catch (e) {
 // ignore logging errors
 }

 return errorResponse('INTERNAL_ERROR', 'Webhook processing failed', 500);
 }
}
