import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/auth";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { TimeAgo } from "@/components/TimeAgo";
import { ClientActions } from "@/components/ClientActions";
import React from "react";

export const dynamic = "force-dynamic";

export default async function AdminDeposits({
	searchParams,
}: { searchParams?: Promise<{ status?: string; q?: string; page?: string }> }) {
	if (!(await isAdminRequest())) {
		return <p>Unauthorized. Provide X-Admin-Secret header to access.</p>;
	}
	const sp = (await searchParams) || {};
	const status = sp.status;
	const q = (sp.q || "").trim();
	const page = Math.max(parseInt(sp.page || "1") || 1, 1);
	const pageSize = 20;
	const where: any = status ? { status } : {};
	if (q)
		where.OR = [
			{ user: { email: { contains: q, mode: "insensitive" } } },
			{ sentToAddress: { contains: q, mode: "insensitive" } },
		];
	const [total, deposits] = await Promise.all([
		prisma.deposit.count({ where }),
		prisma.deposit.findMany({
			where,
			orderBy: { createdAt: "desc" },
			include: { user: true },
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
	]);
	const pages = Math.max(1, Math.ceil(total / pageSize));
	return (
		<div>
			<h2 className="text-xl font-semibold mb-3">Admin: Deposits</h2>
			<form className="flex items-center gap-2 mb-3" action="/admin/deposits">
				<input
					className="border px-2 py-1"
					name="q"
					placeholder="Search email or address"
					defaultValue={q}
				/>
				<select
					className="border px-2 py-1"
					name="status"
					defaultValue={status || ""}
				>
					<option value="">All</option>
					<option value="PENDING">Pending</option>
					<option value="APPROVED">Approved</option>
					<option value="REJECTED">Rejected</option>
				</select>
				<button className="border px-3 py-1">Filter</button>
			</form>
			<table className="min-w-full bg-white border rounded">
				<thead>
					<tr className="bg-slate-50 text-left">
						<th>Created</th>
						<th>User</th>
						<th>Asset</th>
						<th>Network</th>
						<th>Amount</th>
						<th>To Address</th>
						<th>Status</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{deposits.map((d) => (
						<tr key={d.id} className="hover:bg-slate-50">
							<td className="p-2 border-b">
								<TimeAgo date={d.createdAt} />
							</td>
							<td className="p-2 border-b">{d.user.email}</td>
							<td className="p-2 border-b">{d.asset}</td>
							<td className="p-2 border-b">{d.network}</td>
							<td className="p-2 border-b">{d.amount.toString()}</td>
							<td className="p-2 border-b">
								<code>{d.sentToAddress}</code>
							</td>
							<td className="p-2 border-b">
								{d.status === "PENDING" ? (
									<Badge>Pending</Badge>
								) : d.status === "APPROVED" ? (
									<Badge variant="success">Approved</Badge>
								) : (
									<Badge variant="error">Rejected</Badge>
								)}
							</td>
							<td className="p-2 border-b">
								{d.status === "PENDING" ? (
									<ClientActions id={d.id} type="deposit" />
								) : (
									<span className="muted">—</span>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<div className="mt-3 flex gap-2 items-center">
				<span className="muted">
					Page {page} of {pages}
				</span>
				{page > 1 && (
					<Link
						className="border px-2 py-1"
						href={`/admin/deposits?${new URLSearchParams({
							q,
							status: status || "",
							page: String(page - 1),
						}).toString()}`}
					>
						Prev
					</Link>
				)}
				{page < pages && (
					<Link
						className="border px-2 py-1"
						href={`/admin/deposits?${new URLSearchParams({
							q,
							status: status || "",
							page: String(page + 1),
						}).toString()}`}
					>
						Next
					</Link>
				)}
			</div>
			<p className="muted">
				Use your wallet to verify on-chain; then approve/reject here.
			</p>
			<p>
				<Link href="/admin/balances">View Balances</Link>
			</p>
		</div>
	);
}
