import { NextResponse } from "next/server";
import { getReceivingAddresses } from "@/lib/settings";

export async function GET() {
	const items = getReceivingAddresses();
	return NextResponse.json({ items });
}
