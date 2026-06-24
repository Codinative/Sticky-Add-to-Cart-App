import { getStorefrontToken, saveStorefrontToken } from "@/lib/dbs/firebase";

// ─── Types ─────────────────────────────────────────────────────

export interface ProcessedVariant {
    variantKey: string;
    price: number;
    optionsIds: Record<string, number>;
}

export interface ProcessedProduct {
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

export interface ProductRouteResult {
    isProductPage: boolean;
    product: ProcessedProduct | null;
}

// ─── Storefront API Token Management ────────────────────────────

/**
 * Get or create a BigCommerce Storefront API Token.
 * These tokens are required to call the GraphQL Storefront API.
 * Tokens are cached in Firebase with a 24-hour expiry.
 */
export async function getOrCreateStorefrontToken(
    storeHash: string,
    accessToken: string
): Promise<string> {
    // Check for cached token
    const cached = await getStorefrontToken(storeHash);
    if (cached) return cached.token;

    // Create a new token via the REST API (24-hour expiry)
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const expiresAtUnix = Math.floor(expiresAt / 1000);

    const response = await fetch(
        `https://api.bigcommerce.com/stores/${storeHash}/v3/storefront/api-token`,
        {
            method: "POST",
            headers: {
                "X-Auth-Token": accessToken,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({
                channel_id: 1,
                expires_at: expiresAtUnix,
                allowed_cors_origins: [],
            }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create storefront API token:", response.status, errorText);
        throw new Error(`Failed to create storefront API token: ${response.statusText}`);
    }

    const data = await response.json();
    const token = data?.data?.token;

    if (!token) {
        throw new Error("No token returned from BigCommerce");
    }

    // Cache the token in Firebase
    await saveStorefrontToken(storeHash, token, expiresAt);

    return token;
}

// ─── GraphQL Query ──────────────────────────────────────────────

/**
 * Build the GraphQL query to fetch product data by URL path.
 * Uses the `route(path:)` query which resolves any storefront URL to its entity.
 */
function buildProductByPathQuery(path: string): string {
    return `{
        site {
            route(path: "${path}") {
                node {
                    __typename
                    ... on Product {
                        entityId
                        name
                        defaultImage {
                            url(width: 500)
                            altText
                        }
                        prices {
                            price { value currencyCode }
                            basePrice { value }
                            salePrice { value }
                        }
                        variants(first: 250) {
                            edges {
                                node {
                                    options {
                                        edges {
                                            node {
                                                displayName
                                                values {
                                                    edges {
                                                        node {
                                                            label
                                                            entityId
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    prices {
                                        price { value }
                                    }
                                }
                            }
                        }
                        productOptions(first: 50) {
                            edges {
                                node {
                                    entityId
                                    displayName
                                    isVariantOption
                                    isRequired
                                    __typename
                                }
                            }
                        }
                    }
                }
            }
        }
    }`;
}

// ─── GraphQL Fetch ──────────────────────────────────────────────

/**
 * Call the BigCommerce GraphQL Storefront API to resolve a URL path
 * and fetch product data if the path is a product page.
 */
export async function fetchProductByPath(
    storeHash: string,
    storefrontToken: string,
    path: string
): Promise<ProductRouteResult> {
    const query = buildProductByPathQuery(path);

    const response = await fetch(
        `https://store-${storeHash}.mybigcommerce.com/graphql`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${storefrontToken}`,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify({ query }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("GraphQL Storefront API error:", response.status, errorText);
        throw new Error(`GraphQL request failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.errors) {
        console.error("GraphQL errors:", data.errors);
        throw new Error(`GraphQL errors: ${data.errors.map((e: any) => e.message).join(", ")}`);
    }

    const node = data?.data?.site?.route?.node;

    // If no node or not a Product, this is not a product page
    if (!node || node.__typename !== "Product") {
        return { isProductPage: false, product: null };
    }

    // Process the GraphQL product into our standard format
    const product = processGraphQLProduct(node);
    return { isProductPage: true, product };
}

// ─── GraphQL Response Processing ────────────────────────────────

/**
 * Transform GraphQL Product response into the ProcessedProduct format.
 * Follows the same variantKey/optionsIds pattern as the reference code's
 * processProductVariants function.
 */
function processGraphQLProduct(gqlProduct: any): ProcessedProduct {
    const variants: ProcessedVariant[] = [];
    const variantLabels: Record<string, string[]> = {};
    const options: { id: number; name: string; isVariantOption: boolean }[] = [];

    // Process product options from productOptions
    if (gqlProduct.productOptions?.edges) {
        for (const edge of gqlProduct.productOptions.edges) {
            const opt = edge.node;
            options.push({
                id: opt.entityId,
                name: opt.displayName,
                isVariantOption: opt.isVariantOption,
            });
        }
    }

    // Process variants - build variantKey, price, and optionsIds
    // Same pattern as reference code's processProductVariants
    if (gqlProduct.variants?.edges) {
        for (const variantEdge of gqlProduct.variants.edges) {
            const variantNode = variantEdge.node;
            let variantKey = "";
            const optionsIds: Record<string, number> = {};

            if (variantNode.options?.edges) {
                for (const optEdge of variantNode.options.edges) {
                    const optNode = optEdge.node;
                    const displayName = optNode.displayName;
                    const valueNode = optNode.values?.edges?.[0]?.node;

                    if (!valueNode) continue;

                    const label = valueNode.label;
                    const entityId = valueNode.entityId;

                    // Build variantKey: "Color:Red,Size:M,"
                    variantKey += `${displayName}:${label},`;

                    // Build optionsIds: { "Red": 111, "M": 222 }
                    optionsIds[label] = entityId;

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
                price: variantNode.prices?.price?.value ?? 0,
                optionsIds,
            });
        }
    }

    // Extract pricing
    const priceValue = gqlProduct.prices?.price?.value ?? 0;
    const basePriceValue = gqlProduct.prices?.basePrice?.value ?? null;
    const salePriceValue = gqlProduct.prices?.salePrice?.value ?? null;
    const currencyCode = gqlProduct.prices?.price?.currencyCode ?? "USD";

    // Determine sale status
    const isOnSale = salePriceValue != null && basePriceValue != null && salePriceValue < basePriceValue;

    return {
        entityId: gqlProduct.entityId,
        name: gqlProduct.name,
        image: {
            url: gqlProduct.defaultImage?.url || "",
            alt: gqlProduct.defaultImage?.altText || gqlProduct.name,
        },
        prices: {
            price: isOnSale ? salePriceValue : priceValue,
            salePrice: isOnSale ? salePriceValue : null,
            basePrice: isOnSale ? basePriceValue : null,
            currencyCode,
        },
        variants,
        variantLabels,
        options,
    };
}
