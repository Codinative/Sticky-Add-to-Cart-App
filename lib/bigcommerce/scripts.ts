import { getOrCreateStoreUniqueId } from "@/lib/dbs/firebase";

const { BASE_URL } = process.env;
const SCRIPT_NAME = "Sticky Add to Cart Bar";

// ─── Low-level: Call BigCommerce Scripts API ─────────────────────

export async function bcScriptsRequest(
    method: string,
    storeHash: string,
    accessToken: string,
    path: string = "",
    body?: any
) {
    const url = `https://api.bigcommerce.com/stores/${storeHash}/v3/content/scripts${path}`;
    const options: RequestInit = {
        method,
        headers: {
            "X-Auth-Token": accessToken,
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    return fetch(url, options);
}

// ─── Find existing script by name ────────────────────────────────

export async function findExistingScript(storeHash: string, accessToken: string) {
    const res = await bcScriptsRequest("GET", storeHash, accessToken);
    if (!res.ok) return null;

    const data = await res.json();
    const scripts = data.data || [];
    return scripts.find((s: any) => s.name === SCRIPT_NAME) || null;
}

// ─── Build script src URL ────────────────────────────────────────

export function buildScriptSrc(uniqueStoreId: string): string {
    return `${BASE_URL}/sticky-bar.min.js?sid=${encodeURIComponent(uniqueStoreId)}&app=${encodeURIComponent(BASE_URL || "")}`;
}

// ─── Install or update the storefront script ─────────────────────

export async function installOrUpdateScript(
    storeHash: string,
    accessToken: string
): Promise<{ success: boolean; action?: "created" | "updated"; error?: string }> {
    try {
        // Ensure unique store ID exists
        const uniqueStoreId = await getOrCreateStoreUniqueId(storeHash);
        if (!uniqueStoreId) {
            return { success: false, error: "Failed to get/create unique store ID" };
        }

        const scriptSrc = buildScriptSrc(uniqueStoreId);

        // Check if script already exists
        const existingScript = await findExistingScript(storeHash, accessToken);

        const scriptPayload = {
            name: SCRIPT_NAME,
            src: scriptSrc,
            auto_uninstall: true,
            load_method: "defer",
            location: "footer",
            visibility: "storefront",
            kind: "src",
            enabled: true,
        };

        if (existingScript) {
            // Update existing script
            const res = await bcScriptsRequest("PUT", storeHash, accessToken, `/${existingScript.uuid}`, scriptPayload);
            const data = await res.json();

            if (!res.ok) {
                console.error("Failed to update script:", res.status, JSON.stringify(data));
                return { success: false, error: data?.title || "Failed to update script" };
            }

            console.log("Script updated successfully for store:", storeHash);
            return { success: true, action: "updated" };
        } else {
            // Create new script
            const res = await bcScriptsRequest("POST", storeHash, accessToken, "", scriptPayload);
            const data = await res.json();

            if (!res.ok) {
                console.error("Failed to create script:", res.status, JSON.stringify(data));
                return { success: false, error: data?.title || "Failed to install script" };
            }

            console.log("Script installed successfully for store:", storeHash);
            return { success: true, action: "created" };
        }
    } catch (error: any) {
        console.error("installOrUpdateScript error:", error.message);
        return { success: false, error: error.message || "Unknown error" };
    }
}

// ─── Delete the storefront script ────────────────────────────────

export async function deleteStoreScript(
    storeHash: string,
    accessToken: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const existingScript = await findExistingScript(storeHash, accessToken);

        if (!existingScript) {
            console.log("No script found to delete for store:", storeHash);
            return { success: true }; // Nothing to delete
        }

        const res = await bcScriptsRequest("DELETE", storeHash, accessToken, `/${existingScript.uuid}`);

        if (!res.ok) {
            const data = await res.json();
            console.error("Failed to delete script:", res.status, JSON.stringify(data));
            return { success: false, error: data?.title || "Failed to delete script" };
        }

        console.log("Script deleted successfully for store:", storeHash);
        return { success: true };
    } catch (error: any) {
        console.error("deleteStoreScript error:", error.message);
        return { success: false, error: error.message || "Unknown error" };
    }
}
