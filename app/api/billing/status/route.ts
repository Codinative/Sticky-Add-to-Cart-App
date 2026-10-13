import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getBillingStatus } from '@/lib/billing';

// Subscription state for the dashboard's plan card
export async function GET(req: NextRequest) {
    try {
        const session = await getSession(req);
        if (!session) {
            return NextResponse.json({ message: 'Session not found' }, { status: 401 });
        }

        const status = await getBillingStatus(session.storeHash);
        return NextResponse.json({ data: status }, { status: 200 });
    } catch (error: any) {
        console.error('Error loading billing status:', error);
        return NextResponse.json({ message: 'Failed to load billing status' }, { status: 500 });
    }
}
