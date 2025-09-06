import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createUserSession } from "@/lib/session";

export async function POST(req: Request) {
	const body = await req.json();
	const { email, name, password } = body;
	if (!email || !password)
		return NextResponse.json(
			{ error: "email and password required" },
			{ status: 400 },
		);
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing)
		return NextResponse.json(
			{ error: "Email already in use" },
			{ status: 409 },
		);
	const passwordHash = await bcrypt.hash(password, 10);
	const user = await prisma.user.create({
		data: { email, name, passwordHash } as any,
	});
	await createUserSession(user.email);
	return NextResponse.json({ ok: true });
}
