import { getSession } from "@/lib/auth";
import { getOrCreateStoreUniqueId, getStoreToken } from "@/lib/dbs/firebase";
import { NextRequest, NextResponse } from "next/server";

const { BASE_URL } = process.env;
const SCRIPT_NAME = "Sticky Add to Cart Bar";

// ─── Helper: Call BigCommerce Scripts API ────────────────────────

async function bcScriptsRequest(
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

// ─── Helper: Find existing script by name ────────────────────────

async function findExistingScript(storeHash: string, accessToken: string) {
    const res = await bcScriptsRequest("GET", storeHash, accessToken);
    if (!res.ok) return null;

    const data = await res.json();
    const scripts = data.data || [];
    return scripts.find((s: any) => s.name === SCRIPT_NAME) || null;
}

// ─── Helper: Build script tag HTML ───────────────────────────────

function buildScriptHtml(uniqueStoreId: string): string {
    return `<script src="${BASE_URL}/sticky-bar.min.js" data-store-id="${uniqueStoreId}" data-app-url="${BASE_URL}" defer></script>`;
}

// ─── GET: Check if script is installed ───────────────────────────

export async function GET(req: NextRequest) {
    try {
        const session = await getSession(req);
        if (!session) {
            return NextResponse.json({ message: "Session not found" }, { status: 401 });
        }

        const { accessToken, storeHash } = session;
        const existingScript = await findExistingScript(storeHash, accessToken);

        return NextResponse.json({
            installed: !!existingScript,
            script: existingScript || null,
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}

// ─── POST: Install or update the script ──────────────────────────

export async function POST(req: NextRequest) {
    try {
        const session = await getSession(req);
        if (!session) {
            return NextResponse.json({ message: "Session not found" }, { status: 401 });
        }

        const { accessToken, storeHash } = session;

        // Ensure unique store ID exists
        const uniqueStoreId = await getOrCreateStoreUniqueId(storeHash);
        if (!uniqueStoreId) {
            return NextResponse.json({ message: "Failed to get store ID" }, { status: 500 });
        }

        const scriptHtml = buildScriptHtml(uniqueStoreId);

        // Check if script already exists
        const existingScript = await findExistingScript(storeHash, accessToken);

        if (existingScript) {
            // Update existing script
            const res = await bcScriptsRequest("PUT", storeHash, accessToken, `/${existingScript.uuid}`, {
                name: SCRIPT_NAME,
                description: "Displays a sticky add to cart bar on product pages",
                html: scriptHtml,
                auto_uninstall: true,
                load_method: "defer",
                location: "footer",
                visibility: "storefront",
                kind: "script_tag",
            });

            const data = await res.json();
            if (!res.ok) {
                return NextResponse.json({ message: "Failed to update script", error: data }, { status: res.status });
            }

            return NextResponse.json({ message: "Script updated successfully", data }, { status: 200 });
        } else {
            // Create new script
            const res = await bcScriptsRequest("POST", storeHash, accessToken, "", {
                name: SCRIPT_NAME,
                description: "Displays a sticky add to cart bar on product pages",
                html: scriptHtml,
                auto_uninstall: true,
                load_method: "defer",
                location: "footer",
                visibility: "storefront",
                kind: "script_tag",
            });

            const data = await res.json();
            if (!res.ok) {
                return NextResponse.json({ message: "Failed to install script", error: data }, { status: res.status });
            }

            return NextResponse.json({ message: "Script installed successfully", data }, { status: 201 });
        }
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}

// ─── DELETE: Remove the script ───────────────────────────────────

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession(req);
        if (!session) {
            return NextResponse.json({ message: "Session not found" }, { status: 401 });
        }

        const { accessToken, storeHash } = session;
        const existingScript = await findExistingScript(storeHash, accessToken);

        if (!existingScript) {
            return NextResponse.json({ message: "Script not found" }, { status: 404 });
        }

        const res = await bcScriptsRequest("DELETE", storeHash, accessToken, `/${existingScript.uuid}`);

        if (!res.ok) {
            const data = await res.json();
            return NextResponse.json({ message: "Failed to delete script", error: data }, { status: res.status });
        }

        return NextResponse.json({ message: "Script removed successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
