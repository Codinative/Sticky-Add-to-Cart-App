import { getStoreByUniqueId } from "@/lib/dbs/firebase";
import { getOrCreateStorefrontToken, fetchProductByPath } from "@/lib/bigcommerce/graphql";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning",
};

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// ─── Route Handler ─────────────────────────────────────────────
// Proxy endpoint that uses BigCommerce GraphQL Storefront API to:
// 1. Determine if a given URL path is a product page
// 2. If so, return the full product data (variants, prices, options)
//
// This eliminates the need for client-side product page detection
// and product ID resolution, which vary across BigCommerce themes.

export async function GET(req: NextRequest) {
    try {
        const sid = req.nextUrl.searchParams.get("sid");
        const path = req.nextUrl.searchParams.get("path");

        if (!sid || !path) {
            return NextResponse.json(
                { message: "Missing required parameters: sid, path" },
                { status: 400, headers: corsHeaders }
            );
        }

        // Resolve uniqueStoreId to storeHash + accessToken
        const store = await getStoreByUniqueId(sid);
        if (!store) {
            return NextResponse.json(
                { message: "Store not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Get or create a Storefront API Token (cached in Firebase)
        const storefrontToken = await getOrCreateStorefrontToken(
            store.storeHash,
            store.accessToken
        );

        // Call BigCommerce GraphQL Storefront API with route(path:) query
        const result = await fetchProductByPath(
            store.storeHash,
            storefrontToken,
            path
        );

        // Not a product page - return early
        if (!result.isProductPage) {
            return NextResponse.json(
                { isProductPage: false, product: null },
                {
                    status: 200,
                    headers: {
                        ...corsHeaders,
                        // Cache non-product responses longer since page types don't change
                        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
                    },
                }
            );
        }

        // Product page - return full product data
        return NextResponse.json(
            { isProductPage: true, product: result.product },
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
                },
            }
        );
    } catch (error: any) {
        console.error("Error in storefront product proxy:", error);
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500, headers: corsHeaders }
        );
    }
}
