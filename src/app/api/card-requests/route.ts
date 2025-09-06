// No imports needed here - existing ones below
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { CARD_REQUEST_FEE_USD } from "@/lib/constants";

// POST /api/card-requests  { cardType: 'VIRTUAL' | 'PHYSICAL', userId?: string }
export async function POST(req: Request) {
	const contentType = req.headers.get("content-type") || "";
	let userId: string | null = null;
	let cardType: "VIRTUAL" | "PHYSICAL" = "VIRTUAL";

	if (contentType.includes("application/json")) {
		const body = (await req.json().catch(() => ({}))) as {
			cardType?: "VIRTUAL" | "PHYSICAL";
			userId?: string;
		};
		cardType = body.cardType === "PHYSICAL" ? "PHYSICAL" : "VIRTUAL";
		userId =
			typeof body.userId === "string" && body.userId.trim()
				? body.userId
				: null;
	} else if (
		contentType.includes("application/x-www-form-urlencoded") ||
		contentType.includes("multipart/form-data")
	) {
		const form = await req.formData();
		const ct = String(form.get("cardType") || "VIRTUAL");
		cardType = ct === "PHYSICAL" ? "PHYSICAL" : "VIRTUAL";
		const uid = form.get("userId");
		userId = typeof uid === "string" && uid.trim() ? uid : null;
	}

	// If userId is provided in the request, use it directly
	// Otherwise get the current user from the session
	let dbUser;
	if (userId) {
		// Check if provided user exists
		dbUser = await prisma.user.findUnique({ where: { id: userId } });
		if (!dbUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}
	} else {
		// Use the current user from the session
		const user = await getCurrentUser();
		dbUser = await prisma.user.upsert({
			where: { email: user.email },
			update: {},
			create: { email: user.email, name: user.name ?? "Demo" },
		});
	}

	// Card issuance price requirement
	const bal = await prisma.balance.findUnique({
		where: {
			userId_asset_network: {
				userId: dbUser.id,
				asset: "USD",
				network: "ACH",
			},
		},
	});

	const available = Number(bal?.available || 0);
	if (available < CARD_REQUEST_FEE_USD) {
		return NextResponse.json(
			{
				error: `Insufficient USD balance ($${CARD_REQUEST_FEE_USD.toLocaleString()} required)`,
			},
			{ status: 400 },
		);
	}

	const cr = await prisma.cardRequest.create({
		data: {
			userId: dbUser.id,
			brand: "VISA",
			cardType,
		},
	});
	return NextResponse.json({ ok: true, request: cr });
}

// GET current user's requests
export async function GET() {
	const user = await getCurrentUser();
	const dbUser = await prisma.user.upsert({
		where: { email: user.email },
		update: {},
		create: { email: user.email, name: user.name ?? "Demo" },
	});
	const items = await prisma.cardRequest.findMany({
		where: { userId: dbUser.id },
		orderBy: { createdAt: "desc" },
	});
	return NextResponse.json({ items });
}
