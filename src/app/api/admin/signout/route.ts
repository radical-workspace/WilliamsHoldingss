import { NextResponse } from "next/server";

export async function POST() {
	return new NextResponse(JSON.stringify({ ok: true }), {
		status: 200,
		headers: {
			"Set-Cookie": `admin=; Path=/; Max-Age=0`,
		},
	});
}
