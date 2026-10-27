import { getStorefrontToken, saveStorefrontToken } from "@/lib/dbs/firebase";

// ─── Types ─────────────────────────────────────────────────────

export interface ProcessedVariant {
    variantKey: string;
    price: number;
    optionsIds: Record<string, number>; // option display name → value entityId
    inStock: boolean; // purchasable and in stock (BigCommerce's own check)
}

export interface ProcessedProduct {
    entityId: number;
    name: string;
    inStock: boolean; // product can be bought at all (not Unavailable / out of stock)
    image: { url: string; alt: string };
    prices: {
        price: number;
        salePrice: number | null;
        basePrice: number | null;
        currencyCode: string;
        // Store's display format for currencyCode (null → client falls back to Intl)
        currency?: CurrencyDisplay | null;
    };
    variants: ProcessedVariant[];
    variantLabels: Record<string, string[]>;
    options: ProcessedOption[];
}

export interface CurrencyDisplay {
    symbol: string;
    symbolPlacement: "LEFT" | "RIGHT";
    decimalToken: string;
    thousandsToken: string;
    decimalPlaces: number;
}

export interface ProcessedOption {
    id: number;
    name: string;
    isVariantOption: boolean;
    isRequired: boolean;
    // Modifier (non-variant) multiple-choice options only: value ids for attribute[id]=valueId
    values?: { id: number; label: string; isDefault: boolean }[];
    // Variant options only: the value the merchant set as default (the theme preselects it)
    defaultValue?: string;
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
                channel_id: 1, // default storefront — the only channel the bar runs on
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
                        availabilityV2 { status }
                        inventory { isInStock }
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
                                    isPurchasable
                                    inventory { isInStock }
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
                                    ... on MultipleChoiceOption {
                                        values(first: 50) {
                                            edges {
                                                node {
                                                    entityId
                                                    label
                                                    isDefault
                                                }
                                            }
                                        }
                                    }
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
    product.prices.currency = await fetchCurrencyDisplay(storeHash, storefrontToken, product.prices.currencyCode);
    return { isProductPage: true, product };
}

/**
 * Fetch how the store displays a currency (symbol, placement, separators), so the
 * bar matches the theme's prices. Kept separate from the product query and never
 * throws: a failure here only costs the formatting, not the bar.
 */
async function fetchCurrencyDisplay(
    storeHash: string,
    storefrontToken: string,
    currencyCode: string
): Promise<CurrencyDisplay | null> {
    // Inlined as a GraphQL enum literal, so allow only ISO 4217 codes
    if (!/^[A-Z]{3}$/.test(currencyCode)) return null;
    try {
        const response = await fetch(
            `https://store-${storeHash}.mybigcommerce.com/graphql`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${storefrontToken}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    query: `{ site { currency(currencyCode: ${currencyCode}) { display { symbol symbolPlacement decimalToken thousandsToken decimalPlaces } } } }`,
                }),
            }
        );
        if (!response.ok) return null;
        const data = await response.json();
        const display = data?.data?.site?.currency?.display;
        if (!display || typeof display.symbol !== "string") return null;
        return {
            symbol: display.symbol,
            symbolPlacement: display.symbolPlacement === "RIGHT" ? "RIGHT" : "LEFT",
            decimalToken: display.decimalToken ?? ".",
            thousandsToken: display.thousandsToken ?? ",",
            decimalPlaces: Number.isInteger(display.decimalPlaces) ? display.decimalPlaces : 2,
        };
    } catch (error) {
        console.error("Currency display lookup failed:", error);
        return null;
    }
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
    const options: ProcessedOption[] = [];
    // Multiple-choice modifiers (customizations), shown in the variants row after the variant options
    const modifierLabels: Record<string, string[]> = {};
    // Value order of each multiple-choice option as set in the store (what the theme's form shows)
    const optionValueOrder: Record<string, string[]> = {};

    // Process product options from productOptions
    if (gqlProduct.productOptions?.edges) {
        for (const edge of gqlProduct.productOptions.edges) {
            const opt = edge.node;
            if (opt.__typename === "MultipleChoiceOption" && opt.values?.edges?.length) {
                optionValueOrder[opt.displayName] = opt.values.edges.map((v: any) => v.node.label);
            }
            const defaultEdge = opt.isVariantOption
                ? opt.values?.edges?.find((v: any) => v.node.isDefault)
                : null;
            const option: ProcessedOption = {
                id: opt.entityId,
                name: opt.displayName,
                isVariantOption: opt.isVariantOption,
                isRequired: !!opt.isRequired,
            };
            if (defaultEdge) option.defaultValue = defaultEdge.node.label;
            if (!opt.isVariantOption && opt.__typename === "MultipleChoiceOption" && opt.values?.edges?.length) {
                const values = opt.values.edges.map((v: any) => ({
                    id: v.node.entityId,
                    label: v.node.label,
                    isDefault: !!v.node.isDefault,
                }));
                option.values = values;
                modifierLabels[opt.displayName] = values.map((v: { label: string }) => v.label);
            }
            options.push(option);
        }
    }

    // Process variants — build variantKey, price, and optionsIds
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

                    // Build optionsIds keyed by option name: { "Color": 111, "Size": 222 }
                    // (a variant has one value per option; labels can repeat across options)
                    optionsIds[displayName] = entityId;

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
                inStock: variantNode.isPurchasable !== false && variantNode.inventory?.isInStock !== false,
            });
        }
    }

    // Variant labels were collected in variant order (e.g. 29, 32, 28…); show them in the
    // store's option order instead. Labels missing from that list keep their place at the end.
    for (const name in variantLabels) {
        const order = optionValueOrder[name];
        if (!order) continue;
        const rank = (label: string) => {
            const i = order.indexOf(label);
            return i === -1 ? order.length : i;
        };
        variantLabels[name] = variantLabels[name]
            .map((label, i) => ({ label, i }))
            .sort((a, b) => rank(a.label) - rank(b.label) || a.i - b.i)
            .map((x) => x.label);
    }

    // Modifiers render after the variant options (a variant option wins on a name clash)
    for (const name in modifierLabels) {
        if (!variantLabels[name]) variantLabels[name] = modifierLabels[name];
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
        inStock: gqlProduct.availabilityV2?.status !== "Unavailable" && gqlProduct.inventory?.isInStock !== false,
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
