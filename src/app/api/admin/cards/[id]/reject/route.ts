import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(_req: NextRequest, context: any) {
	if (!(await isAdminRequest())) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const { params } = context as { params: { id: string } };
	return NextResponse.json({
		ok: true,
		id: params.id,
		note: "Card reject stub",
	});
}
