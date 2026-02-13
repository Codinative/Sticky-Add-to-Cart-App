import { getSession } from "@/lib/auth";
import {
    findExistingScript,
    installOrUpdateScript,
    deleteStoreScript,
} from "@/lib/bigcommerce/scripts";
import { NextRequest, NextResponse } from "next/server";

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
        const result = await installOrUpdateScript(storeHash, accessToken);

        if (!result.success) {
            return NextResponse.json(
                { message: result.error || "Failed to install/update script" },
                { status: 500 }
            );
        }

        const status = result.action === "created" ? 201 : 200;
        return NextResponse.json(
            { message: `Script ${result.action} successfully` },
            { status }
        );
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
        const result = await deleteStoreScript(storeHash, accessToken);

        if (!result.success) {
            return NextResponse.json(
                { message: result.error || "Failed to delete script" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Script removed successfully" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
