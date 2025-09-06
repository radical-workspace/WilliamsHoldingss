import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
	const { secret } = await req.json();
	if (!secret || secret !== process.env.ADMIN_SECRET) {
		return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
	}
	const c = cookies();
	c.set("admin", "true", { httpOnly: false, path: "/", sameSite: "lax" });
	return NextResponse.json({ ok: true });
}
