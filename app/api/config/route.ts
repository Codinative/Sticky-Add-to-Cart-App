import { getSession } from "@/lib/auth";
import { deleteStickyBarConfig, getStickyBarConfig, setStickyBarConfig } from "@/lib/dbs/firebase";
import { StickyBarConfig } from "@/types/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET (req: NextRequest) {
    try {
        const session = await getSession(req);
        console.log('session', session);
        if (!session) {
            return NextResponse.json({ message: "Session not found" }, { status: 401 });
        }

        const { storeHash } = session;

        const config = await getStickyBarConfig(storeHash);

        return NextResponse.json({ data: config || null }, { status: 200 });
    } catch (error: any) {
        const { message, response } = error;
        return NextResponse.json({ message: message || 'Something went wrong' }, { status: response?.status || 500 });
    }
}

export async function POST (req: NextRequest) {
    try {
        const session = await getSession(req);
        if (!session) {
            return NextResponse.json({ message: 'Session not found' }, { status: 401 });
        }

        const { storeHash } = session;

        const body = await req.json();

        const config = body.data as StickyBarConfig;
        if (!config) {
            return NextResponse.json({ message: 'Invalid config data' }, { status: 404 });
        }

        const id = await setStickyBarConfig(storeHash, config);
        if (!id) {
            return NextResponse.json({ messagee: 'Failed to save config' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Config saved successfully' }, { status: 200 });
    } catch (error: any) {
        const { message, response } = error;
        return NextResponse.json({ message: message || 'Something went wrong' }, { status: response?.status || 500 })
    }
}

export async function DELETE (req: NextRequest) {
    try {
        const session = await getSession(req);
        if (!session) {
            return NextResponse.json({ message: 'Session not found' }, { status: 401 });
        }

        const { storeHash } = session;
        
        const id = await deleteStickyBarConfig(storeHash);
        if (!id) {
            return NextResponse.json({ messagee: 'Failed to deleete conifg' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Config deleted suceessfully' }, { status: 200 });
    } catch (error: any) {
        const { message, response } = error;
        return NextResponse.json({ message: message || 'Somehing went wrong' }, { status: response?.status || 500 });
    }
}