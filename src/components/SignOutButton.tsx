"use client";
import { useState } from "react";
import Button from "@mui/material/Button";

export default function SignOutButton() {
	const [loading, setLoading] = useState(false);
	return (
		<Button
			onClick={async () => {
				setLoading(true);
				await fetch("/api/auth/signout", { method: "POST" });
				window.location.href = "/login";
			}}
			disabled={loading}
			color="inherit"
		>
			Sign Out
		</Button>
	);
}
