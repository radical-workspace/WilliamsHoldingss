import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";

const USER_COOKIE = "userEmail";
const ADMIN_COOKIE = "admin";

export async function createUserSession(userEmail: string) {
	const res = NextResponse.json({ ok: true });
	res.cookies.set(USER_COOKIE, userEmail, {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
	});
	return res;
}

export async function destroySession() {
	const res = NextResponse.json({ ok: true });
	res.cookies.set(USER_COOKIE, "", { path: "/", maxAge: 0 });
	return res;
}

export async function getSessionUser() {
	const cookieStore = await cookies();
	const email = cookieStore.get(USER_COOKIE)?.value;
	if (!email) return null;
	const u = await prisma.user.findUnique({ where: { email } });
	return u;
}

export async function setAdminCookie() {
	const res = NextResponse.json({ ok: true });
	res.cookies.set(ADMIN_COOKIE, "1", {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
	});
	return res;
}

export async function clearAdminCookie() {
	const res = NextResponse.json({ ok: true });
	res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
	return res;
}

export async function isAdmin() {
	const cookieStore = await cookies();
	const hasCookie = cookieStore.get(ADMIN_COOKIE)?.value === "1";
	if (hasCookie) return true;
	const h = await headers();
	const adminSecret = process.env.ADMIN_SECRET;
	const provided = h.get("x-admin-secret") || h.get("X-Admin-Secret");
	return Boolean(adminSecret && provided && provided === adminSecret);
}
