import { NextRequest, NextResponse } from 'next/server';
import { encodePayload, getBCAuth, setSession } from '../../../lib/auth';

export async function GET (req: NextRequest, res: NextResponse) {
    try {
        console.log('************************ Authenticating app on install ************************');
        // Authenticate the app on install
        const { searchParams } = new URL(req.url);

        const session = await getBCAuth(Object.fromEntries(searchParams));
        const encodedContext = encodePayload(session); // Signed JWT to validate/ prevent tampering

        await setSession(session);

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