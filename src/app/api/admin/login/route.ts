import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const { secret } = await req.json();
	if (!secret || secret !== process.env.ADMIN_SECRET) {
		return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
	}
	const res = NextResponse.json({ ok: true });
	res.cookies.set("admin", "true", { httpOnly: false, path: "/", sameSite: "lax" });
	return res;
}
