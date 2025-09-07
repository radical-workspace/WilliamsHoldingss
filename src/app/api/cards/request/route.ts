import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(_req: NextRequest) {
	// Placeholder implementation
	const user = await getCurrentUser().catch(() => null);
	return NextResponse.json({ ok: true, user: user?.email ?? null, note: "Card request stub" });
}

