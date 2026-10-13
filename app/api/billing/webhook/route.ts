import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe, syncSubscription } from '@/lib/billing';
import { getBillingRecord, updateBillingRecord } from '@/lib/dbs/firebase';

// Stripe → app webhook. Public, so every request is authenticated by its Stripe
// signature before anything is trusted. Subscription state is ONLY written here
// (never from the checkout success page, which anyone could open).
export async function POST(req: NextRequest) {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    const signature = req.headers.get('stripe-signature');

    if (!secret || !signature) {
        return NextResponse.json({ message: 'Missing signature or webhook secret' }, { status: 400 });
    }

    // Signature verification needs the exact raw body — don't use req.json()
    const body = await req.text();

    let event: Stripe.Event;
    try {
        event = getStripe().webhooks.constructEvent(body, signature, secret);
    } catch (error: any) {
        console.warn('Stripe webhook signature verification failed:', error.message);
        return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const checkout = event.data.object;
                const storeHash = checkout.metadata?.storeHash;

                if (storeHash) {
                    const record = await getBillingRecord(storeHash);
                    if (record?.pendingCheckoutSessionId === checkout.id) {
                        await updateBillingRecord(storeHash, { pendingCheckoutSessionId: null });
                    }
                }

                const subscriptionId = typeof checkout.subscription === 'string'
                    ? checkout.subscription
                    : checkout.subscription?.id;
                if (subscriptionId) await syncSubscription(subscriptionId);
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                await syncSubscription(event.data.object.id);
                break;

            default:
                // Not subscribed to anything else; ignore
                break;
        }
    } catch (error: any) {
        // 500 makes Stripe retry the event later
        console.error(`Error handling Stripe webhook ${event.type}:`, error);
        return NextResponse.json({ message: 'Webhook handler failed' }, { status: 500 });
    }

    return NextResponse.json({ received: true }, { status: 200 });
}
