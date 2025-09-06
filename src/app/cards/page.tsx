import {
	Button,
	Card,
	CardContent,
	CardHeader,
	Typography,
	Box,
	List,
	ListItem,
} from "@mui/material";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function CardsPage() {
	const user = await getCurrentUser();
	const dbUser = await prisma.user.upsert({
		where: { email: user.email },
		update: {},
		create: { email: user.email, name: user.name ?? "Demo" },
	});
	const items = await prisma.cardRequest.findMany({
		where: { userId: dbUser.id },
		orderBy: { createdAt: "desc" },
	});
	return (
		<Box sx={{ display: "grid", gap: 2 }}>
			<Card variant="outlined">
				<CardHeader
					title="WilliamsHoldings Card"
					subheader="Manual, off-chain approval"
				/>
				<CardContent>
					<Typography sx={{ mb: 1 }}>
						To own a Visa card, submit a request. Our admin will review and
						manually approve or reject.
					</Typography>
					<Typography sx={{ mb: 2 }} color="text.secondary">
						Issuance fee: $1,000 (charged on approval). Ensure your USD (ACH)
						available balance covers it.
					</Typography>
					<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
						<form action="/api/card-requests" method="post">
							<input type="hidden" name="cardType" value="VIRTUAL" />
							<Button type="submit" variant="contained">
								Request Virtual Card
							</Button>
						</form>
						<form action="/api/card-requests" method="post">
							<input type="hidden" name="cardType" value="PHYSICAL" />
							<Button type="submit" variant="outlined">
								Request Physical Card
							</Button>
						</form>
					</Box>
				</CardContent>
			</Card>

			<Card variant="outlined">
				<CardHeader title="Your Requests" />
				<CardContent>
					{items.length === 0 ? (
						<Typography color="text.secondary">No requests yet.</Typography>
					) : (
						<List>
							{items.map((r) => (
								<ListItem
									key={r.id}
									sx={{ display: "flex", justifyContent: "space-between" }}
								>
									<span>
										{r.cardType} · {r.brand} · {r.status}
									</span>
									<span style={{ opacity: 0.7 }}>
										{new Date(r.createdAt as any).toLocaleString()}
									</span>
								</ListItem>
							))}
						</List>
					)}
				</CardContent>
			</Card>
		</Box>
	);
}
