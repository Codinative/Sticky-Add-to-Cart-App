import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getBillingRecord } from '@/lib/dbs/firebase';
import { getStripe } from '@/lib/billing';

// Returns a Stripe Customer Portal link (update card, invoices, cancel).
// Opened in a new tab by the dashboard.
export async function POST(req: NextRequest) {
    try {
        const session = await getSession(req);
        if (!session) {
            return NextResponse.json({ message: 'Session not found' }, { status: 401 });
        }

        const record = await getBillingRecord(session.storeHash);
        if (!record?.stripeCustomerId) {
            return NextResponse.json({ message: 'No billing account for this store yet' }, { status: 404 });
        }

        const portal = await getStripe().billingPortal.sessions.create({
            customer: record.stripeCustomerId,
            return_url: `${process.env.BASE_URL}/billing/done?result=portal`,
        });

        return NextResponse.json({ url: portal.url }, { status: 200 });
    } catch (error: any) {
        console.error('Error creating billing portal session:', error);
        return NextResponse.json({ message: 'Failed to open billing portal' }, { status: 500 });
    }
}
