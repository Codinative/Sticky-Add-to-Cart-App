import { NextRequest, NextResponse } from 'next/server';
import { encodePayload, getBCAuth, setSession } from '../../../lib/auth';
import { installOrUpdateScript } from '@/lib/bigcommerce/scripts';
import { getStickyBarConfig, setStickyBarConfig } from '@/lib/dbs/firebase';
import { defaultStickyBarConfig } from '@/lib/defaultConfig';
import { flattenToNestedConfig } from '@/lib/configConverter';

export async function GET (req: NextRequest) {
    try {
        console.log('************************ Authenticating app on install ************************');
        // Authenticate the app on install
        const { searchParams } = new URL(req.url);

        const session = await getBCAuth(Object.fromEntries(searchParams));
        const encodedContext = encodePayload(session); // Signed JWT to validate/ prevent tampering

        await setSession(session);

        // Extract store information
        const storeHash = (session?.context || '').split('/')[1] || '';
        const accessToken = session?.access_token || '';

        // Save default config to Firebase if it doesn't exist
        if (storeHash) {
            try {
                const existingConfig = await getStickyBarConfig(storeHash);
                if (!existingConfig) {
                    console.log('No existing config found. Saving default configuration for store:', storeHash);
                    const defaultNestedConfig = flattenToNestedConfig(defaultStickyBarConfig);
                    await setStickyBarConfig(storeHash, defaultNestedConfig);
                    console.log('Default configuration saved successfully');
                }
            } catch (configError: any) {
                console.error('Failed to save default config:', configError.message);
                // Non-blocking: config will be saved on first dashboard save
            }
        }

        // Install the storefront script on the merchant's store
        if (storeHash && accessToken) {
            try {
                const result = await installOrUpdateScript(storeHash, accessToken);
                console.log('Script installation on app install:', result);
            } catch (scriptError: any) {
                // Non-blocking: if script install fails, user can still use the app
                // The dashboard save will retry installation as a fallback
                console.warn('Script installation failed during app install:', scriptError.message);
            }
        }

        // Once the app has been authorized, redirect
        const baseUrl = process.env.BASE_URL || '';
        const redirectUrl = `${baseUrl}/?context=${encodedContext}`;

        console.log("redirecting to:", redirectUrl);

        return NextResponse.redirect(redirectUrl, 302);
    } catch (error: any) {
        const {message, response} = error;

        return NextResponse.json(
            { message: message || "Something went wrong" },
            { status: response?.status || 500 }
        );
    }
}