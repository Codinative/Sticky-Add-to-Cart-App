import { getStoreByUniqueId } from "@/lib/dbs/firebase";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
    return NextResponse.json(null, { status: 204, headers: corsHeaders });
}

// ─── Types ─────────────────────────────────────────────────────

interface ProcessedVariant {
    variantKey: string;
    price: number;
    optionsIds: Record<string, number>;
}

interface ProcessedProduct {
    entityId: number;
    name: string;
    image: { url: string; alt: string };
    prices: {
        price: number;
        salePrice: number | null;
        basePrice: number | null;
        currencyCode: string;
    };
    variants: ProcessedVariant[];
    variantLabels: Record<string, string[]>;
    options: { id: number; name: string; isVariantOption: boolean }[];
}

// ─── Variant Processing (same pattern as reference code) ───────

function processProductData(product: any): ProcessedProduct {
    const variants: ProcessedVariant[] = [];
    const variantLabels: Record<string, string[]> = {};
    const options: { id: number; name: string; isVariantOption: boolean }[] = [];

    // Process product options
    if (product.options) {
        for (const option of product.options) {
            options.push({
                id: option.id,
                name: option.display_name,
                isVariantOption: option.type === "variant",
            });
        }
    }

    // Process variants - build variantKey, price, and optionsIds
    // following the exact same pattern as the reference code's processProductVariants
    if (product.variants) {
        for (const variant of product.variants) {
            let variantKey = "";
            const optionsIds: Record<string, number> = {};

            if (variant.option_values) {
                for (const optVal of variant.option_values) {
                    const displayName = optVal.option_display_name;
                    const label = optVal.label;
                    const valueId = optVal.id;

                    // Build variantKey: "Color:Red,Size:M,"
                    variantKey += `${displayName}:${label},`;

                    // Build optionsIds: { "Red": 111, "M": 222 }
                    optionsIds[label] = valueId;

                    // Collect unique variant labels
                    if (!variantLabels[displayName]) {
                        variantLabels[displayName] = [];
                    }
                    if (!variantLabels[displayName].includes(label)) {
                        variantLabels[displayName].push(label);
                    }
                }
            }

            variants.push({
                variantKey,
                price: variant.price ?? product.price,
                optionsIds,
            });
        }
    }

    // Build the processed product
    const primaryImage = product.images?.find((img: any) => img.is_thumbnail) || product.images?.[0];

    return {
        entityId: product.id,
        name: product.name,
        image: {
            url: primaryImage?.url_standard || primaryImage?.url_thumbnail || "",
            alt: primaryImage?.description || product.name,
        },
        prices: {
            price: product.calculated_price ?? product.price,
            salePrice: product.sale_price || null,
            basePrice: product.retail_price || product.price,
            currencyCode: "USD", // BigCommerce REST API doesn't include currency in product response; default to USD
        },
        variants,
        variantLabels,
        options,
    };
}

// ─── Route Handler ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        const sid = req.nextUrl.searchParams.get("sid");
        const productId = req.nextUrl.searchParams.get("productId");

        if (!sid || !productId) {
            return NextResponse.json(
                { message: "Missing required parameters: sid, productId" },
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

        // Fetch product from BigCommerce REST API
        const bcResponse = await fetch(
            `https://api.bigcommerce.com/stores/${store.storeHash}/v3/catalog/products/${productId}?include=variants,images,options`,
            {
                method: "GET",
                headers: {
                    "X-Auth-Token": store.accessToken,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
            }
        );

        if (!bcResponse.ok) {
            const errorText = await bcResponse.text();
            console.error("BigCommerce API error:", bcResponse.status, errorText);
            return NextResponse.json(
                { message: `Failed to fetch product: ${bcResponse.statusText}` },
                { status: bcResponse.status, headers: corsHeaders }
            );
        }

        const bcData = await bcResponse.json();
        const rawProduct = bcData.data;

        if (!rawProduct) {
            return NextResponse.json(
                { message: "Product not found" },
                { status: 404, headers: corsHeaders }
            );
        }

        // Process product data into variantKey/optionsIds format
        const product = processProductData(rawProduct);

        return NextResponse.json(
            { product },
            { status: 200, headers: corsHeaders }
        );
    } catch (error: any) {
        console.error("Error fetching product data:", error);
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500, headers: corsHeaders }
        );
    }
}
