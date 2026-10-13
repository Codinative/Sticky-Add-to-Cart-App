import Stripe from 'stripe';
import { getBillingRecord, updateBillingRecord } from '@/lib/dbs/firebase';
import { BillingRecord, BillingStatus } from '@/types/billing';

// ─── Config ────────────────────────────────────────────────────

export const TRIAL_DAYS = 7;

// Statuses that keep the bar live on the storefront. past_due is included so the bar
// keeps working while Stripe retries a failed card; cancel-at-period-end subscriptions
// stay "active" until the period ends.
const USABLE_STATUSES = new Set(['trialing', 'active', 'past_due']);

let stripeClient: Stripe | null = null;

// Server-only. Throws if the secret key is missing so misconfiguration fails loudly.
export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function getPriceId(): string {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId) throw new Error('STRIPE_PRICE_ID is not set');
  return priceId;
}

export function isUsableStatus(status?: string | null): boolean {
  return !!status && USABLE_STATUSES.has(status);
}

// ─── Store access ──────────────────────────────────────────────

export async function hasActiveSubscription(storeHash: string): Promise<boolean> {
  const record = await getBillingRecord(storeHash);
  return isUsableStatus(record?.subscriptionStatus);
}

// ─── Subscription sync ─────────────────────────────────────────

/**
 * Writes the current state of a Stripe subscription to billing/{storeHash}.
 * Always re-fetches from Stripe, so webhook events arriving out of order or
 * more than once can't leave stale data behind.
 */
export async function syncSubscription(subscriptionId: string) {
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const storeHash = subscription.metadata?.storeHash;
  if (!storeHash) {
    console.warn('Stripe subscription has no storeHash metadata:', subscription.id);
    return;
  }

  const record = await getBillingRecord(storeHash);

  // The store already has a different, working subscription (e.g. two checkout tabs
  // were completed). Never let the other one overwrite it; cancel it if it's live.
  if (
    record?.stripeSubscriptionId &&
    record.stripeSubscriptionId !== subscription.id &&
    isUsableStatus(record.subscriptionStatus)
  ) {
    if (isUsableStatus(subscription.status)) {
      console.warn('Duplicate subscription for store, cancelling newer one:', storeHash, subscription.id);
      await stripe.subscriptions.cancel(subscription.id);
    }
    return;
  }

  // In current Stripe API versions the billing period lives on the subscription item
  const periodEnd = subscription.items.data[0]?.current_period_end ?? null;
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  // A scheduled cancellation shows up either as cancel_at_period_end, or (e.g. when
  // cancelled from the Customer Portal on current API versions) as a cancel_at date
  // with cancel_at_period_end left false. Treat both the same.
  const cancelAt = subscription.cancel_at ?? (subscription.cancel_at_period_end ? periodEnd : null);

  const data: BillingRecord = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status,
    trialEnd: subscription.trial_end,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end || subscription.cancel_at !== null,
    cancelAt,
    trialUsed: true,
  };

  await updateBillingRecord(storeHash, data);
}

// ─── Dashboard status ──────────────────────────────────────────

let cachedPrice: BillingStatus['price'] | undefined;

async function getPriceSummary(): Promise<BillingStatus['price']> {
  if (cachedPrice !== undefined) return cachedPrice;

  try {
    const price = await getStripe().prices.retrieve(getPriceId());
    cachedPrice = {
      amount: (price.unit_amount ?? 0) / 100,
      currency: price.currency,
      interval: price.recurring?.interval ?? 'month',
    };
  } catch (error) {
    console.error('Error loading Stripe price:', error);
    return null; // don't cache failures
  }
  return cachedPrice;
}

export async function getBillingStatus(storeHash: string): Promise<BillingStatus> {
  const record = await getBillingRecord(storeHash);
  const status = record?.subscriptionStatus || 'none';

  return {
    status,
    isActive: isUsableStatus(status),
    trialAvailable: !record?.trialUsed,
    trialDays: TRIAL_DAYS,
    trialEnd: record?.trialEnd ?? null,
    currentPeriodEnd: record?.currentPeriodEnd ?? null,
    cancelAtPeriodEnd: !!record?.cancelAtPeriodEnd,
    cancelAt: record?.cancelAt ?? null,
    hasCustomer: !!record?.stripeCustomerId,
    price: await getPriceSummary(),
  };
}

// ─── Uninstall ─────────────────────────────────────────────────

// Cancels immediately (no further charges) when the merchant removes the app.
export async function cancelStoreSubscription(storeHash: string) {
  const record = await getBillingRecord(storeHash);
  if (!record?.stripeSubscriptionId || !isUsableStatus(record.subscriptionStatus)) return;

  await getStripe().subscriptions.cancel(record.stripeSubscriptionId);
}
