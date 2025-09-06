import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { getCurrentUser } from "../../../lib/auth";
import { withdrawalSchema } from "../../../lib/validation";

export async function POST(req: Request) {
	const user = await getCurrentUser();
	const dbUser = await prisma.user.upsert({
		where: { email: user.email },
		update: {},
		create: { email: user.email, name: user.name ?? "Demo" },
	});
	const json = await req.json();
	const parsed = withdrawalSchema.safeParse(json);
	if (!parsed.success)
		return NextResponse.json({ error: parsed.error.message }, { status: 400 });
	const { asset, network, amount, destination_address } = parsed.data;

	const result = await prisma.$transaction(async (tx) => {
		const bal = await tx.balance.upsert({
			where: {
				userId_asset_network: {
					userId: dbUser.id,
					asset: asset as any,
					network: network as any,
				},
			},
			update: {},
			create: {
				userId: dbUser.id,
				asset: asset as any,
				network: network as any,
				available: 0,
				locked: 0,
			},
		});
		if (Number(bal.available) < amount) {
			throw new Error("Insufficient available balance");
		}
		const wd = await tx.withdrawal.create({
			data: {
				userId: dbUser.id,
				asset: asset as any,
				network: network as any,
				amount: amount as any,
				destinationAddress: destination_address,
			},
		});
		await tx.balance.update({
			where: { id: bal.id },
			data: {
				available: (Number(bal.available) - amount) as any,
				locked: (Number(bal.locked) + amount) as any,
			},
		});
		await tx.ledger.create({
			data: {
				userId: dbUser.id,
				asset: asset as any,
				network: network as any,
				amount: -amount as any,
				type: "WITHDRAWAL_LOCK",
				refType: "Withdrawal",
				refId: wd.id,
				memo: "User requested withdrawal; funds locked pending approval.",
			},
		});
		return wd;
	});
	return NextResponse.json({ id: result.id, status: result.status });
}
