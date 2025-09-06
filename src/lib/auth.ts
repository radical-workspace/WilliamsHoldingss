import { cookies, headers } from "next/headers";
import { getSessionUser } from "./session";

export async function getCurrentUser() {
	const user = await getSessionUser();
	if (!user) throw new Error("Unauthorized");
	return user as any;
}

export function isAdminRequest() {
	const adminSecret = process.env.ADMIN_SECRET;
	const h = headers();
	const provided = h.get("x-admin-secret") || h.get("X-Admin-Secret");
	if (adminSecret && provided && provided === adminSecret) return true;
	const cookieStore = cookies();
	const cookieAdmin = cookieStore.get("admin")?.value;
	return cookieAdmin === "1" || cookieAdmin === "true";
}
