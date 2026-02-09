import { NextRequest, NextResponse } from 'next/server';
import { encodePayload, getBCVerify, setSession } from '../../../lib/auth';
 
export async function GET (req: NextRequest, res: NextResponse) {
    try {
        console.log('************************ Verifying app on load ************************');
        // Verify when app loaded (launch)
        const { searchParams } = new URL(req.url);

        const session = await getBCVerify(Object.fromEntries(searchParams));
        const encodedContext = encodePayload(session); // Signed JWT to validate/ prevent tampering
        
        await setSession(session);
        
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