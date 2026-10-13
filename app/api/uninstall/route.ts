import { NextRequest, NextResponse } from 'next/server';
import { getBCVerify, removeSession } from '../../../lib/auth';
import { deleteStickyBarConfig, getStoreToken } from '@/lib/dbs/firebase';
import { cancelStoreSubscription } from '@/lib/billing';
import { deleteStoreScript } from '@/lib/bigcommerce/scripts';
 
export async function GET (req: NextRequest) {
    try {
        console.log('************************ Uninstalling app ************************');
        const { searchParams } = new URL(req.url);
        const session = await getBCVerify(Object.fromEntries(searchParams));

        // Delete the storefront script BEFORE removing session/store data
        // (removeSession deletes the store doc which contains the accessToken)
        const contextString = session?.context || session?.sub || '';
        const storeHash = contextString.split('/')[1] || '';

        if (storeHash) {
            try {
                const accessToken = await getStoreToken(storeHash);
                if (accessToken) {
                    const result = await deleteStoreScript(storeHash, accessToken);
                    console.log('Script deletion on app uninstall:', result);
                }
            } catch (scriptError: any) {
                // Non-blocking: auto_uninstall flag is the safety net
                console.warn('Script deletion failed during app uninstall:', scriptError.message);
            }

            // Delete the bar config. Firestore does not remove subcollections when the
            // parent store doc is deleted, so stores/{storeHash}/stickyBar/config would
            // otherwise be left behind. Non-blocking: store/user cleanup must still run.
            const configDeleted = await deleteStickyBarConfig(storeHash);
            if (!configDeleted) {
                console.warn('Sticky bar config deletion failed during app uninstall:', storeHash);
            }

            // Stop billing the merchant. Non-blocking; the webhook then marks the
            // billing record as canceled (the record itself is kept, see types/billing.ts).
            try {
                await cancelStoreSubscription(storeHash);
            } catch (billingError: any) {
                console.error('Stripe subscription cancel failed during app uninstall:', storeHash, billingError.message);
            }
        }

        await removeSession(session);
        return NextResponse.json({}, { status: 200 });
    } catch (error: any) {
        const { message, response } = error;
        return NextResponse.json(
            { message: message || 'Something went wrong' }, 
            { status: response?.status || 500 }
        );
    }
}