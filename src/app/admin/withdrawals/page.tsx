import { prisma } from "@/lib/prisma";
import { isAdminRequest } from "@/lib/auth";
import { Badge } from "@/components/Badge";
import { TimeAgo } from "@/components/TimeAgo";
import { ClientActions } from "@/components/ClientActions";

export const dynamic = "force-dynamic";

export default async function AdminWithdrawals({
	searchParams,
}: { searchParams?: Promise<{ status?: string; q?: string; page?: string }> }) {
	if (!isAdminRequest()) {
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
			{ destinationAddress: { contains: q, mode: "insensitive" } },
		];
	const [total, withdrawals, balances] = await Promise.all([
		prisma.withdrawal.count({ where }),
		prisma.withdrawal.findMany({
			where,
			orderBy: { createdAt: "desc" },
			include: { user: true },
			skip: (page - 1) * pageSize,
			take: pageSize,
		}),
		prisma.balance.findMany(),
	]);
	const pages = Math.max(1, Math.ceil(total / pageSize));
	const key = (u: string, a: string, n: string) => `${u}:${a}:${n}`;
	const map = new Map<string, { available: number }>();
	for (const b of balances)
		map.set(key(b.userId, b.asset, b.network), {
			available: Number(b.available),
		});

	return (
		<div>
			<h2 className="text-xl font-semibold mb-3">Admin: Withdrawals</h2>
			<form
				className="flex items-center gap-2 mb-3"
				action="/admin/withdrawals"
			>
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
						<th>Destination</th>
						<th>Status</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{withdrawals.map((w) => {
						const bal =
							map.get(key(w.userId, w.asset, w.network))?.available || 0;
						const warn = Number(w.amount) > bal;
						return (
							<tr key={w.id} className="hover:bg-slate-50">
								<td className="p-2 border-b">
									<TimeAgo date={w.createdAt} />
								</td>
								<td className="p-2 border-b">{w.user.email}</td>
								<td className="p-2 border-b">{w.asset}</td>
								<td className="p-2 border-b">{w.network}</td>
								<td className="p-2 border-b">
									{w.amount.toString()}{" "}
									{warn && (
										<span className="text-red-600">(insufficient {bal})</span>
									)}
								</td>
								<td className="p-2 border-b">
									<code>
										{w.destinationAddress.startsWith("ACH:")
											? (() => {
													const parts = w.destinationAddress.split(":");
													const r = parts[1] || "";
													const a = parts[2] || "";
													const n = parts[3] || "";
													return `ACH ${"*".repeat(7)}${r.slice(
														-2,
													)} / ****${a.slice(-4)} / ${n}`;
											  })()
											: w.destinationAddress}
									</code>
								</td>
								<td className="p-2 border-b">
									{w.status === "PENDING" ? (
										<Badge>Pending</Badge>
									) : w.status === "APPROVED" ? (
										<Badge variant="success">Approved</Badge>
									) : (
										<Badge variant="error">Rejected</Badge>
									)}
								</td>
								<td className="p-2 border-b">
									{w.status === "PENDING" ? (
										<ClientActions id={w.id} type="withdrawal" />
									) : (
										<span className="muted">—</span>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
			<div className="mt-3 flex gap-2 items-center">
				<span className="muted">
					Page {page} of {pages}
				</span>
				{page > 1 && (
					<a
						className="border px-2 py-1"
						href={`/admin/withdrawals?${new URLSearchParams({
							q,
							status: status || "",
							page: String(page - 1),
						}).toString()}`}
					>
						Prev
					</a>
				)}
				{page < pages && (
					<a
						className="border px-2 py-1"
						href={`/admin/withdrawals?${new URLSearchParams({
							q,
							status: status || "",
							page: String(page + 1),
						}).toString()}`}
					>
						Next
					</a>
				)}
			</div>
			<p className="muted">
				Approve only after actually sending funds off-chain.
			</p>
		</div>
	);
}
