import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import { getReceivingAddresses } from "@/lib/settings";
import {
	Card,
	CardContent,
	CardHeader,
	Button,
	Chip,
	Typography,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Box,
	Divider,
} from "@mui/material";
import Image from "next/image";
import ManualCardSection from "@/components/ManualCardSection";
import DashboardStat from "@/components/DashboardStat";

export default async function Dashboard() {
	const user = await getCurrentUser();
	const dbUser = await prisma.user.upsert({
		where: { email: user.email },
		update: {},
		create: { email: user.email, name: user.name ?? "Demo" },
	});
	const balances = await prisma.balance.findMany({
		where: { userId: dbUser.id },
	});
	const [pendingDeposits, pendingWithdrawals, recentLedger] = await Promise.all(
		[
			prisma.deposit.findMany({
				where: { userId: dbUser.id, status: "PENDING" },
			}),
			prisma.withdrawal.findMany({
				where: { userId: dbUser.id, status: "PENDING" },
			}),
			prisma.ledger.findMany({
				where: { userId: dbUser.id },
				orderBy: { createdAt: "desc" },
				take: 10,
			}),
		],
	);
	const addresses = getReceivingAddresses();
	const supported = Array.from(new Set(addresses.map((a) => a.asset)));
	const totalAvailable = balances.reduce(
		(acc, b) => acc + parseFloat(b.available.toString()),
		0,
	);
	const totalLocked = balances.reduce(
		(acc, b) => acc + parseFloat(b.locked.toString()),
		0,
	);
	const pendingDepositSum = pendingDeposits.reduce(
		(acc, d) => acc + parseFloat(d.amount.toString()),
		0,
	);
	const pendingWithdrawalSum = pendingWithdrawals.reduce(
		(acc, w) => acc + parseFloat(w.amount.toString()),
		0,
	);
	const fmt = (n: number) =>
		n.toLocaleString(undefined, { maximumFractionDigits: 8 });
	const fmtAsset = (asset: string, n: any) => {
		const num = typeof n === "number" ? n : parseFloat(String(n));
		return asset === "USD"
			? `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
			: num.toLocaleString(undefined, { maximumFractionDigits: 8 });
	};
	return (
		<Box>
			<Typography variant="h5" gutterBottom>
				Welcome, {dbUser.email}
			</Typography>

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: {
						xs: "1fr",
						sm: "repeat(2, 1fr)",
						md: "repeat(4, 1fr)",
					},
					gap: 2,
					mb: 3,
				}}
			>
				<DashboardStat
					title="Total Available"
					sub={"Across all assets"}
					value={fmt(totalAvailable)}
					targetId="balances"
					color="primary"
				/>
				<DashboardStat
					title="Locked"
					sub={"In holds/withdrawals"}
					value={fmt(totalLocked)}
					targetId="balances"
					color="warning"
				/>
				<DashboardStat
					title="Pending Deposits"
					sub={`${pendingDeposits.length} requests`}
					value={fmt(pendingDepositSum)}
					targetId="history"
					color="info"
				/>
				<DashboardStat
					title="Pending Withdrawals"
					sub={`${pendingWithdrawals.length} requests`}
					value={fmt(pendingWithdrawalSum)}
					targetId="history"
					color="info"
				/>
			</Box>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
					gap: 2,
					mb: 3,
				}}
			>
				<Box>
					<Card variant="outlined">
						<CardHeader title="Deposit" subheader="Payment methods" />
						<CardContent>
							<Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
								{supported.length ? (
									supported.map((a) => <Chip key={a} label={a} />)
								) : (
									<Typography variant="body2" color="text.secondary">
										No methods configured
									</Typography>
								)}
							</Box>
							<Button
								LinkComponent={Link as any}
								href="/deposits/new"
								variant="contained"
								color="success"
								size="large"
								sx={{ mt: 1 }}
							>
								<b>Deposit Funds</b>
							</Button>
						</CardContent>
					</Card>
				</Box>
				<Box>
					<Card variant="outlined">
						<CardHeader
							title="Withdraw"
							subheader="Request a withdrawal to your address"
						/>
						<CardContent>
							<Button
								LinkComponent={Link as any}
								href="/withdrawals/new"
								variant="contained"
								color="warning"
								size="large"
								sx={{ mt: 1 }}
							>
								<b>Withdraw Funds</b>
							</Button>
						</CardContent>
					</Card>
				</Box>
				<Box>
					<Card variant="outlined">
						<CardHeader title="History" />
						<CardContent>
							<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
								<Button
									LinkComponent={Link as any}
									href="/deposits"
									color="info"
									variant="outlined"
									sx={{ fontWeight: "bold" }}
								>
									View Deposit History
								</Button>
								<Button
									LinkComponent={Link as any}
									href="/withdrawals"
									color="info"
									variant="outlined"
									sx={{ fontWeight: "bold" }}
								>
									View Withdrawal History
								</Button>
							</Box>
						</CardContent>
					</Card>
				</Box>
			</Box>

			{/* Manual off-chain card preview */}
			<Card variant="outlined" sx={{ mb: 3 }} id="card">
				<CardHeader
					title="Williams Holdings Visa Card"
					subheader="Get your card in a few easy steps"
				/>
				<CardContent>
					<ManualCardSection
						userId={dbUser.id}
						usdBalance={(() => {
							const b = balances.find((b) => b.asset === "USD");
							return b ? parseFloat(String(b.available)) : 0;
						})()}
					/>
				</CardContent>
			</Card>

			<Typography variant="h6" sx={{ mb: 1, mt: 2 }} id="balances">
				Your Balances
			</Typography>
			{balances.length === 0 ? (
				<Typography color="text.secondary">No balances yet.</Typography>
			) : (
				<Table
					size="small"
					sx={{
						borderRadius: 1,
						overflow: "hidden",
						border: "1px solid",
						borderColor: "divider",
					}}
				>
					<TableHead>
						<TableRow>
							<TableCell>Asset</TableCell>
							<TableCell>Network</TableCell>
							<TableCell>Available</TableCell>
							<TableCell>Locked</TableCell>
							<TableCell>Withdraw Address</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{balances.map((b) => (
							<TableRow key={b.id} hover>
								<TableCell>{b.asset}</TableCell>
								<TableCell>{b.network}</TableCell>
								<TableCell>{fmtAsset(b.asset, b.available)}</TableCell>
								<TableCell>{fmtAsset(b.asset, b.locked)}</TableCell>
								<TableCell>
									<form action="/withdrawals/new">
										<input name="asset" type="hidden" value={b.asset} />
										<input name="network" type="hidden" value={b.network} />
										<input
											name="address"
											placeholder="Your address"
											style={{
												padding: 8,
												border: "1px solid #ddd",
												borderRadius: 6,
												marginRight: 8,
											}}
										/>
										<Button type="submit" size="small" variant="outlined">
											Withdraw
										</Button>
									</form>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}

			<Divider sx={{ my: 3 }} />
			<Typography variant="h6" sx={{ mb: 1 }} id="history">
				Recent Activity
			</Typography>
			{recentLedger.length === 0 ? (
				<Typography color="text.secondary">No recent activity.</Typography>
			) : (
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>When</TableCell>
							<TableCell>Type</TableCell>
							<TableCell>Asset</TableCell>
							<TableCell>Network</TableCell>
							<TableCell align="right">Amount</TableCell>
							<TableCell>Memo</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{recentLedger.map((l) => (
							<TableRow key={l.id} hover>
								<TableCell>
									{new Date(l.createdAt as any).toLocaleString()}
								</TableCell>
								<TableCell>{l.type}</TableCell>
								<TableCell>{l.asset}</TableCell>
								<TableCell>{l.network}</TableCell>
								<TableCell align="right">
									{fmtAsset(l.asset as any, l.amount as any)}
								</TableCell>
								<TableCell>{l.memo || "-"}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			)}
		</Box>
	);
}
