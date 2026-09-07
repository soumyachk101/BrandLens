import { PrismaClient, PlanType, SubscriptionStatus } from '@prisma/client';
import Stripe from 'stripe';
import { AppError, NotFoundError, ValidationError } from '../utils/errors';
import { Subscription } from '../types';
import { config } from '../config/env';

const stripe = new Stripe(config.stripe.secretKey, {
 apiVersion: '2024-11-20.acacia',
});

export class SubscriptionService {
 constructor(private prisma: PrismaClient) {}

 async getByAgency(agencyId: string): Promise<Subscription | null> {
 const subscription = await this.prisma.subscriptions.findFirst({
 where: { agency_id: agencyId },
 orderBy: { created_at: 'desc' },
 });

 if (!subscription) {
 return null;
 }

 return this.mapRowToSubscription(subscription);
 }

 async createCheckoutSession(
 agencyId: string,
 plan: PlanType,
 successUrl: string,
 cancelUrl: string,
 ): Promise<{ session_url: string }> {
 const priceId = config.stripe.prices[plan];

 if (!priceId) {
 throw new ValidationError(`Invalid plan: ${plan}`);
 }

 const agency = await this.prisma.agencies.findFirst({
 where: { id: agencyId },
 select: { id: true, email: true, name: true },
 });

 if (!agency) {
 throw new NotFoundError('Agency');
 }

 let customerId: string | null = null;
 const existingSub = await this.getByAgency(agencyId);
 if (existingSub?.stripe_customer_id) {
 customerId = existingSub.stripe_customer_id;
 }

 if (!customerId) {
 const customer = await stripe.customers.create({
 email: agency.email,
 name: agency.name,
 metadata: { agency_id: agencyId },
 });
 customerId = customer.id;

 await this.prisma.agencies.update({
 where: { id: agencyId },
 data: { api_key: null as any },
 });
 }

 const session = await stripe.checkout.sessions.create({
 mode: 'subscription',
 payment_method_types: ['card'],
 customer: customerId,
 line_items: [{ price: priceId, quantity: 1 }],
 success_url: successUrl,
 cancel_url: cancelUrl,
 metadata: { agency_id: agencyId, plan },
 });

 await this.prisma.subscriptions.upsert({
 where: { stripe_subscription_id: session.subscription as string },
 update: {},
 create: {
 agency_id: agencyId,
 stripe_customer_id: customerId,
 stripe_subscription_id: session.subscription as string,
 plan,
 status: 'trialing',
 current_period_start: new Date(),
 current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
 metadata: { checkout_session_id: session.id },
 },
 });

 return { session_url: session.url || '' };
 }

 async handleWebhook(payload: Buffer, signature: string): Promise<void> {
 const event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);

 if (!event) {
 throw new AppError('Invalid webhook signature', 401, 'UNAUTHORIZED');
 }

 const subscription = event.data.object as Stripe.Subscription;

 if (!subscription.metadata?.agency_id) {
 return;
 }

 const agencyId = subscription.metadata.agency_id as string;
 const plan = subscription.metadata.plan as PlanType || 'starter';

 let status: SubscriptionStatus = 'active';
 if (event.type === 'customer.subscription.created') {
 status = subscription.status === 'trialing' ? 'trialing' : 'active';
 } else if (event.type === 'customer.subscription.updated') {
 status = subscription.status as SubscriptionStatus;
 } else if (event.type === 'customer.subscription.deleted') {
 status = 'canceled';
 }

 const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
 const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

 await this.prisma.subscriptions.upsert({
 where: { stripe_subscription_id: subscription.id },
 update: {
 status,
 current_period_start: currentPeriodStart,
 current_period_end: currentPeriodEnd,
 cancel_at_period_end: subscription.cancel_at_period_end,
 trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
 metadata: { stripe_status: subscription.status },
 updated_at: new Date().toISOString(),
 },
 create: {
 agency_id: agencyId,
 stripe_customer_id: subscription.customer as string,
 stripe_subscription_id: subscription.id,
 plan,
 status,
 current_period_start: currentPeriodStart,
 current_period_end: currentPeriodEnd,
 cancel_at_period_end: subscription.cancel_at_period_end,
 trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
 metadata: { stripe_status: subscription.status },
 },
 });

 if (status === 'canceled' || status === 'unpaid') {
 await this.prisma.agencies.update({
 where: { id: agencyId },
 data: { plan: 'starter' as PlanType },
 });
 }
 }

 async cancelSubscription(agencyId: string): Promise<Subscription> {
 const subscription = await this.getByAgency(agencyId);

 if (!subscription || !subscription.stripe_subscription_id) {
 throw new NotFoundError('Subscription');
 }

 await stripe.subscriptions.update(subscription.stripe_subscription_id, {
 cancel_at_period_end: true,
 });

 const updated = await this.prisma.subscriptions.update({
 where: { stripe_subscription_id: subscription.stripe_subscription_id },
 data: { cancel_at_period_end: true, updated_at: new Date() },
 });

 return this.mapRowToSubscription(updated);
 }

 async getPlanLimits(agencyId: string): Promise<{
 plan: PlanType;
 limits: {
 requests_per_minute: number;
 scans_per_day: number;
 concurrent_scans: number;
 brands_max: number;
 };
 usage: {
 scans_this_month: number;
 brands_count: number;
 };
 }> {
 const subscription = await this.getByAgency(agencyId);

 const agency = await this.prisma.agencies.findFirst({
 where: { id: agencyId },
 select: { plan: true },
 });

 const plan = subscription?.plan || agency?.plan || 'starter';

 const planLimits: Record<PlanType, { requests_per_minute: number; scans_per_day: number; concurrent_scans: number; brands_max: number }> = {
 starter: { requests_per_minute: 60, scans_per_day: 100, concurrent_scans: 2, brands_max: 5 },
 growth: { requests_per_minute: 300, scans_per_day: 1000, concurrent_scans: 5, brands_max: 25 },
 enterprise: { requests_per_minute: 1000, scans_per_day: 10000, concurrent_scans: 20, brands_max: -1 },
 };

 const brandsCount = await this.prisma.brands.count({ where: { agency_id: agencyId } });

 const now = new Date();
 const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

 const scansThisMonth = await this.prisma.ai_queries.count({
 where: {
 brand_id: { in: (await this.prisma.brands.findMany({ where: { agency_id: agencyId }, select: { id: true } })).map((b) => b.id) },
 created_at: { gte: monthStart },
 },
 });

 return {
 plan,
 limits: planLimits[plan],
 usage: {
 scans_this_month: scansThisMonth,
 brands_count: brandsCount,
 },
 };
 }

 private mapRowToSubscription(row: any): Subscription {
 return {
 id: row.id,
 agency_id: row.agency_id,
 stripe_customer_id: row.stripe_customer_id,
 stripe_subscription_id: row.stripe_subscription_id,
 plan: row.plan,
 status: row.status,
 current_period_start: row.current_period_start,
 current_period_end: row.current_period_end,
 cancel_at_period_end: row.cancel_at_period_end,
 trial_ends_at: row.trial_ends_at,
 metadata: row.metadata,
 created_at: row.created_at,
 updated_at: row.updated_at,
 };
 }
}