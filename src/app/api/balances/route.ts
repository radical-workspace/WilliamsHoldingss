import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const asset = searchParams.get("asset");
	const network = searchParams.get("network");
	const user = await getCurrentUser();
	const dbUser = await prisma.user.upsert({
		where: { email: user.email },
		update: {},
		create: { email: user.email, name: user.name ?? "Demo" },
	});
	if (!asset || !network)
		return NextResponse.json(
			{ error: "asset and network required" },
			{ status: 400 },
		);
	const bal = await prisma.balance.findUnique({
		where: {
			userId_asset_network: {
				userId: dbUser.id,
				asset: asset as any,
				network: network as any,
			},
		},
	});
	return NextResponse.json({
		available: Number(bal?.available || 0),
		locked: Number(bal?.locked || 0),
	});
}
