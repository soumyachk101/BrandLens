import { SupabaseClient } from '@supabase/supabase-js';
import { Subscription, SubscriptionStatus, PlanType } from '../../types';
import { AppError, NotFoundError, ValidationError } from '../../utils/errors';
import Stripe from 'stripe';
import { config } from '../../config/env';

const stripe = new Stripe(config.stripe.secretKey, {
 apiVersion: '2024-11-20.acacia',
});

export class SubscriptionService {
 constructor(private supabase: SupabaseClient) {}

 async getByAgency(agencyId: string): Promise<Subscription | null> {
 const { data, error } = await this.supabase
 .from('subscriptions')
 .select('*')
 .eq('agency_id', agencyId)
 .order('created_at', { ascending: false })
 .limit(1)
 .maybeSingle();

 if (error || !data) {
 return null;
 }

 return this.mapRowToSubscription(data);
 }

 async createCheckoutSession(
 agencyId: string,
 plan: PlanType,
 successUrl: string,
 cancelUrl: string
 ): Promise<{ session_url: string }> {
 const priceId = config.stripe.prices[plan];

 if (!priceId) {
 throw new ValidationError(`Invalid plan: ${plan}`);
 }

 const { data: agency } = await this.supabase
 .from('agencies')
 .select('email, name')
 .eq('id', agencyId)
 .maybeSingle();

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

 await this.supabase
 .from('agencies')
 .update({ api_key: null })
 .eq('id', agencyId);
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

 await this.supabase
 .from('subscriptions')
 .upsert({
 agency_id: agencyId,
 stripe_customer_id: customerId,
 stripe_subscription_id: session.subscription as string,
 plan,
 status: 'trialing',
 current_period_start: new Date().toISOString(),
 current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
 metadata: { checkout_session_id: session.id },
 });

 return { session_url: session.url || '' };
 }

 async handleWebhook(payload: Buffer, signature: string): Promise<void> {
 const event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);

 if (!event) {
 throw new AppError('Invalid webhook signature', 401);
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

 await this.supabase
 .from('subscriptions')
 .upsert({
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
 updated_at: new Date().toISOString(),
 });

 if (status === 'canceled' || status === 'unpaid') {
 await this.supabase
 .from('agencies')
 .update({ plan: 'starter' })
 .eq('id', agencyId);
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

 const updated = await this.supabase
 .from('subscriptions')
 .update({ cancel_at_period_end: true })
 .eq('agency_id', agencyId)
 .select()
 .maybeSingle();

 if (!updated.data) {
 throw new AppError('Failed to cancel subscription', 500);
 }

 return this.mapRowToSubscription(updated.data);
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

 const { data: agency } = await this.supabase
 .from('agencies')
 .select('plan, api_key')
 .eq('id', agencyId)
 .maybeSingle();

 const plan = subscription?.plan || agency?.plan || 'starter';

 const planLimits: Record<PlanType, { requests_per_minute: number; scans_per_day: number; concurrent_scans: number; brands_max: number }> = {
 starter: { requests_per_minute: 60, scans_per_day: 100, concurrent_scans: 2, brands_max: 5 },
 growth: { requests_per_minute: 300, scans_per_day: 1000, concurrent_scans: 5, brands_max: 25 },
 enterprise: { requests_per_minute: 1000, scans_per_day: 10000, concurrent_scans: 20, brands_max: -1 },
 };

 const { count: brandsCount } = await this.supabase
 .from('brands')
 .select('*', { count: 'exact', head: true })
 .eq('agency_id', agencyId);

 return {
 plan,
 limits: planLimits[plan],
 usage: {
 scans_this_month: 0,
 brands_count: brandsCount || 0,
 },
 };
 }

 private mapRowToSubscription(row: Record<string, unknown>): Subscription {
 return {
 id: row.id as string,
 agency_id: row.agency_id as string,
 stripe_customer_id: (row.stripe_customer_id as string) || null,
 stripe_subscription_id: (row.stripe_subscription_id as string) || null,
 plan: row.plan as PlanType,
 status: row.status as SubscriptionStatus,
 current_period_start: row.current_period_start as string,
 current_period_end: row.current_period_end as string,
 cancel_at_period_end: (row.cancel_at_period_end as boolean) || false,
 trial_ends_at: (row.trial_ends_at as string) || null,
 metadata: (row.metadata as Record<string, unknown>) || {},
 created_at: row.created_at as string,
 updated_at: row.updated_at as string,
 };
 }
}
