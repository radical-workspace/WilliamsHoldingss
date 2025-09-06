import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
	const { pathname } = req.nextUrl;
	const isApi = pathname.startsWith("/api");

	const protectUser = ["/dashboard", "/deposits", "/withdrawals"];
	const protectApi = ["/api/deposits", "/api/withdrawals", "/api/balances"];
	const protectAdmin = ["/admin"];

	const userEmail = req.cookies.get("userEmail")?.value;
	const isAdmin =
		req.cookies.get("admin")?.value === "1" ||
		req.headers.get("x-admin-secret");

	if (protectUser.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
		if (!userEmail) {
			const url = req.nextUrl.clone();
			url.pathname = "/login";
			url.searchParams.set("next", pathname);
			return NextResponse.redirect(url);
		}
	}

	if (protectApi.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
		if (!userEmail)
			return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
			});
	}

	if (
		protectAdmin.some((p) => pathname === p || pathname.startsWith(p + "/"))
	) {
		if (
			!isAdmin &&
			pathname !== "/admin/login" &&
			!pathname.startsWith("/api/admin")
		) {
			const url = req.nextUrl.clone();
			url.pathname = "/admin/login";
			return NextResponse.redirect(url);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|api/settings/receiving|api/addresses|login|register|$).*)",
	],
};
