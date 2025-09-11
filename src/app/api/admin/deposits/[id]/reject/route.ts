import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { isAdminRequest } from "../../../../../../lib/auth";

export async function POST(req: NextRequest, context: any) {
	const { params } = context as { params: { id: string } };
	if (!(await isAdminRequest()))
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const id = params.id;
	const body = (await req.json().catch(() => ({}))) as { adminNote?: string };
	const dep = await prisma.deposit.update({
		where: { id },
		data: { status: "REJECTED", adminNote: body.adminNote },
	});
	return NextResponse.json({ ok: true, deposit: dep });
}
