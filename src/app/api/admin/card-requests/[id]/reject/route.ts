import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/auth";

export async function POST(_req: NextRequest, context: any) {
	const { params } = context as { params: { id: string } };
	if (!(await isAdminRequest()))
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	const id = params.id;
	const cr = await prisma.cardRequest.update({
		where: { id },
		data: { status: "REJECTED" },
	});
	return NextResponse.json({ ok: true, request: cr });
}
