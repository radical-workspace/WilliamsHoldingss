import "./globals.css";
import Link from "next/link";
import Image from "next/image";
import BrandLogo from "@/components/BrandLogo";
import type { Metadata } from "next";
import { FlashClient } from "@/components/FlashClient";
import { headers } from "next/headers";
import { ReactNode } from "react";
import ThemeRegistry from "@/components/ThemeRegistry";
import Container from "@mui/material/Container";
import MainNav from "@/components/MainNav";

export const metadata: Metadata = {
	icons: {
		icon: "/favicon.svg",
		shortcut: "/favicon.svg",
		apple: "/favicon.svg",
	},
};

export default async function RootLayout({
	children,
}: { children: ReactNode }) {
	// Fallback to reading cookie manually from header to avoid build-time cookie store mutation typing issues
	const h = await headers();
	const cookieHeader = h.get("cookie") || "";
	const userEmail = cookieHeader
		.split(/;\s*/)
		.find((c: string) => c.startsWith("userEmail="))
		?.split("=")[1];
	return (
		<html lang="en">
			<body>
				<ThemeRegistry>
					<MainNav userEmail={userEmail} />
					<Container maxWidth="lg" sx={{ py: 4 }} className="app-bg">
						<FlashClient />
						{children}
					</Container>
				</ThemeRegistry>
			</body>
		</html>
	);
}
