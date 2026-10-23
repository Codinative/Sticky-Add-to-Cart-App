import { NextRequest, NextResponse } from 'next/server';
import { getBCVerify } from '../../../lib/auth';
import { deleteUser } from '@/lib/dbs/firebase';

// Called by BigCommerce when a store admin revokes a staff user's access to the
// app (required with "Enable multiple users"). Store data is untouched.
export async function GET (req: NextRequest) {
    try {
        console.log('************************ Removing app user ************************');
        const { searchParams } = new URL(req.url);
        const session = await getBCVerify(Object.fromEntries(searchParams));

        const contextString = session?.context || session?.sub || '';
        const storeHash = contextString.split('/')[1] || '';
        const userId = session?.user?.id;

        if (storeHash && userId) {
            await deleteUser(String(userId), storeHash);
        }

        return NextResponse.json({}, { status: 200 });
    } catch (error: any) {
        const { message, response } = error;
        return NextResponse.json(
            { message: message || 'Something went wrong' },
            { status: response?.status || 500 }
        );
    }
}
