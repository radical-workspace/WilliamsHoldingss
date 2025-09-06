"use client";
import { useState } from "react";
import Link from "next/link";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [name, setName] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	return (
		<Paper elevation={0} sx={{ maxWidth: 480, mx: "auto", mt: 6, p: 3 }}>
			<Typography variant="h5" gutterBottom>
				Create Account
			</Typography>
			<Box
				component="form"
				onSubmit={async (e) => {
					e.preventDefault();
					setLoading(true);
					setError("");
					const res = await fetch("/api/auth/signup", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ email, name, password }),
					});
					setLoading(false);
					if (res.ok) window.location.href = "/dashboard";
					else setError((await res.json()).error || "Failed");
				}}
				sx={{ display: "grid", gap: 2 }}
			>
				<TextField
					type="email"
					label="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					fullWidth
				/>
				<TextField
					label="Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					fullWidth
				/>
				<TextField
					type="password"
					label="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					fullWidth
				/>
				<Button type="submit" variant="contained" disabled={loading}>
					Sign Up
				</Button>
			</Box>
			{error && (
				<Typography color="error" sx={{ mt: 2 }}>
					{error}
				</Typography>
			)}
			<Typography sx={{ mt: 2 }}>
				Have an account? <Link href="/login">Sign in</Link>
			</Typography>
		</Paper>
	);
}
