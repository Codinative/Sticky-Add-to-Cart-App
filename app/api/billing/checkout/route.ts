import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getBillingRecord, updateBillingRecord } from '@/lib/dbs/firebase';
import { getPriceId, getStripe, isUsableStatus, TRIAL_DAYS } from '@/lib/billing';

// Creates (or reuses) a Stripe Checkout session for the store's subscription.
// The dashboard opens the returned URL in a new tab — Stripe Checkout can't run
// inside the BigCommerce admin iframe.
export async function POST(req: NextRequest) {
    try {
        const session = await getSession(req);
        if (!session) {
            return NextResponse.json({ message: 'Session not found' }, { status: 401 });
        }

        const { storeHash } = session;
        const stripe = getStripe();
        const record = await getBillingRecord(storeHash);

        if (isUsableStatus(record?.subscriptionStatus)) {
            return NextResponse.json({ message: 'Store already has an active subscription' }, { status: 409 });
        }

        // Reuse a still-open checkout so repeated clicks don't create parallel sessions
        if (record?.pendingCheckoutSessionId) {
            try {
                const pending = await stripe.checkout.sessions.retrieve(record.pendingCheckoutSessionId);
                if (pending.status === 'open' && pending.url) {
                    return NextResponse.json({ url: pending.url }, { status: 200 });
                }
            } catch {
                // Expired or missing — fall through and create a new one
            }
        }

        // One Stripe customer per store, reused across checkouts and reinstalls
        let customerId = record?.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                description: `BigCommerce store ${storeHash}`,
                metadata: { storeHash },
            });
            customerId = customer.id;
            await updateBillingRecord(storeHash, { stripeCustomerId: customerId });
        }

        const baseUrl = process.env.BASE_URL;
        const checkout = await stripe.checkout.sessions.create({
            mode: 'subscription',
            customer: customerId,
            line_items: [{ price: getPriceId(), quantity: 1 }],
            client_reference_id: storeHash,
            metadata: { storeHash },
            subscription_data: {
                metadata: { storeHash },
                // Free trial only for stores that have never subscribed
                ...(record?.trialUsed ? {} : { trial_period_days: TRIAL_DAYS }),
            },
            success_url: `${baseUrl}/billing/done?result=success`,
            cancel_url: `${baseUrl}/billing/done?result=cancelled`,
        });

        await updateBillingRecord(storeHash, { pendingCheckoutSessionId: checkout.id });

        return NextResponse.json({ url: checkout.url }, { status: 200 });
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json({ message: 'Failed to start checkout' }, { status: 500 });
    }
}
