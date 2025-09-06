import { NextResponse } from "next/server";
import { getReceivingAddresses } from "@/lib/settings";

export async function GET() {
	return NextResponse.json({ addresses: getReceivingAddresses() });
}
