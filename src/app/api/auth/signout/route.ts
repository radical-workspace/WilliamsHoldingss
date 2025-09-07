import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

export async function POST() {
	const res = await destroySession();
	return res;
}
