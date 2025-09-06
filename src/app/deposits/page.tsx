import { prisma } from "../../lib/prisma";
import { getCurrentUser } from "../../lib/auth";
import { Badge } from "@/components/Badge";
import { TimeAgo } from "@/components/TimeAgo";

export const dynamic = "force-dynamic";

export default async function DepositsPage() {
	const user = await getCurrentUser();
	// map demo user to a real DB user by email
	const dbUser = await prisma.user.upsert({
		where: { email: user.email },
		update: {},
		create: { email: user.email, name: user.name ?? "Demo" },
	});

	const deposits = await prisma.deposit.findMany({
		where: { userId: dbUser.id },
		orderBy: { createdAt: "desc" },
	});

	return (
		<div>
			<h2>Your Deposits</h2>
			{deposits.length === 0 ? (
				<p className="muted">No deposits yet.</p>
			) : (
				<table>
					<thead>
						<tr>
							<th>Created</th>
							<th>Asset</th>
							<th>Network</th>
							<th>Amount</th>
							<th>Sent To</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{deposits.map((d) => (
							<tr key={d.id}>
								<td>
									<TimeAgo date={d.createdAt} />
								</td>
								<td>{d.asset}</td>
								<td>{d.network}</td>
								<td>{d.amount.toString()}</td>
								<td>{d.sentToAddress}</td>
								<td>
									{d.status === "PENDING" ? (
										<Badge>Pending</Badge>
									) : d.status === "APPROVED" ? (
										<Badge variant="success">Approved</Badge>
									) : (
										<Badge variant="error">Rejected</Badge>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
