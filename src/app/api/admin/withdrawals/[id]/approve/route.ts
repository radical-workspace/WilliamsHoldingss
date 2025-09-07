import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { isAdminRequest } from "../../../../../../lib/auth";

export async function POST(req: NextRequest, context: any) {
	const { params } = context as { params: { id: string } };
	if (!isAdminRequest())
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const id = params.id;
	const body = (await req.json().catch(() => ({}))) as { adminNote?: string };
	const result = await prisma.$transaction(async (tx) => {
		const wd = await tx.withdrawal.update({
			where: { id },
			data: { status: "APPROVED", adminNote: body.adminNote },
		});
		const bal = await tx.balance.findUnique({
			where: {
				userId_asset_network: {
					userId: wd.userId,
					asset: wd.asset,
					network: wd.network,
				},
			},
		});
		if (!bal) throw new Error("Balance not found");
		if (Number(bal.locked) < Number(wd.amount))
			throw new Error("Locked balance insufficient");
		const updated = await tx.balance.update({
			where: { id: bal.id },
			data: { locked: (Number(bal.locked) - Number(wd.amount)) as any },
		});
		await tx.ledger.create({
			data: {
				userId: wd.userId,
				asset: wd.asset,
				network: wd.network,
				amount: -Number(wd.amount) as any,
				type: "WITHDRAWAL",
				refType: "Withdrawal",
				refId: wd.id,
				memo: body.adminNote
					? body.adminNote
					: "Admin approved withdrawal and sent funds off-chain.",
			},
		});
		return { wd, bal: updated };
	});
	return NextResponse.json({ ok: true, withdrawal: result.wd });
}
