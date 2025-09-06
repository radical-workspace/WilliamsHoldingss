import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createUserSession } from "@/lib/session";

export async function POST(req: Request) {
	const body = await req.json();
	const { email, password } = body;
	const user = await prisma.user.findUnique({ where: { email } });
	const ph = (user as any)?.passwordHash as string | undefined;
	if (!user || !ph)
		return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	const ok = await bcrypt.compare(password, ph);
	if (!ok)
		return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
	await createUserSession(user.email);
	return NextResponse.json({ ok: true });
}
