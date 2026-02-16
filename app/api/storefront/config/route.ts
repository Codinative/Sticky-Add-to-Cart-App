import { getStoreByUniqueId, getStickyBarConfig } from "@/lib/dbs/firebase";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning",
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    try {
        const sid = req.nextUrl.searchParams.get("sid");

        if (!sid) {
            return NextResponse.json(
                { message: "Missing store ID (sid)" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Resolve uniqueStoreId to storeHash
        const store = await getStoreByUniqueId(sid);
        if (!store) {
            return NextResponse.json(
                { message: "Store not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Fetch the sticky bar config
        const config = await getStickyBarConfig(store.storeHash);
        if (!config) {
            return NextResponse.json(
                { message: "Config not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        return NextResponse.json(
            { config },
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                },
            }
        );
    } catch (error: any) {
        console.error("Error fetching storefront config:", error);
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500, headers: corsHeaders }
        );
    }
}
