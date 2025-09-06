import Link from "next/link";
import Image from "next/image";
import BrandLogo from "@/components/BrandLogo";
import { ReactNode } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import ThemeToggle from "@/components/ThemeToggle";
import AvatarMenu from "@/components/AvatarMenu";

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div>
			<AppBar position="static" color="transparent" elevation={0}>
				<Toolbar>
					<Typography
						sx={{
							flexGrow: 1,
							fontWeight: 600,
							display: "flex",
							alignItems: "center",
							gap: 1,
						}}
					>
						<Link href="/" style={{ display: "inline-flex" }}>
							<BrandLogo width={24} height={24} rounded={6} />
						</Link>
						Admin
					</Typography>
					<Button href="/admin" component={Link as any}>
						Dashboard
					</Button>
					<Button href="/admin/deposits" component={Link as any}>
						Deposits
					</Button>
					<Button href="/admin/withdrawals" component={Link as any}>
						Withdrawals
					</Button>
					<Button href="/admin/balances" component={Link as any}>
						Balances
					</Button>
					<Button href="/admin/card-requests" component={Link as any}>
						Card Requests
					</Button>
					<ThemeToggle />
					<AvatarMenu />
					<form
						method="post"
						action="/api/admin/signout"
						style={{ marginLeft: 8 }}
					>
						<Button type="submit" color="inherit">
							Sign Out
						</Button>
					</form>
				</Toolbar>
			</AppBar>
			<Container maxWidth="lg" sx={{ py: 4 }} className="app-bg">
				{children}
			</Container>
		</div>
	);
}
