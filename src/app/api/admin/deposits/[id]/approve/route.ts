import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { isAdminRequest } from "../../../../../../lib/auth";

export async function POST(req: NextRequest, context: any) {
	const { params } = context as { params: { id: string } };
	if (!isAdminRequest())
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const id = params.id;
	const body = (await req.json().catch(() => ({}))) as { adminNote?: string };
	const updated = await prisma.$transaction(async (tx) => {
		const dep = await tx.deposit.update({
			where: { id },
			data: { status: "APPROVED", adminNote: body.adminNote },
		});
		const bal = await tx.balance.upsert({
			where: {
				userId_asset_network: {
					userId: dep.userId,
					asset: dep.asset,
					network: dep.network,
				},
			},
			update: { available: { increment: dep.amount } as any },
			create: {
				userId: dep.userId,
				asset: dep.asset,
				network: dep.network,
				available: dep.amount,
				locked: 0 as any,
			},
		});
		await tx.ledger.create({
			data: {
				userId: dep.userId,
				asset: dep.asset,
				network: dep.network,
				amount: dep.amount,
				type: "DEPOSIT",
				refType: "Deposit",
				refId: dep.id,
				memo: body.adminNote
					? body.adminNote
					: "Admin approved deposit after off-chain verification.",
			},
		});
		return { dep, bal };
	});
	return NextResponse.json({ ok: true, deposit: updated.dep });
}
