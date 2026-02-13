import { NextRequest, NextResponse } from 'next/server';
import { getBCVerify, removeSession } from '../../../lib/auth';
import { getStoreToken } from '@/lib/dbs/firebase';
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