import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";

export const runtime = "nodejs";

// Placeholder route until card entities are implemented
export async function POST(_req: NextRequest, context: any) {
	if (!isAdminRequest()) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const { params } = context as { params: { id: string } };
	return NextResponse.json({ ok: true, id: params.id, note: "Card approve stub" });
}

