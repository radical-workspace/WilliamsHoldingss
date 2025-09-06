"use client";
import { Card, CardContent, CardHeader, Typography } from "@mui/material";

export default function DashboardStat({
	title,
	sub,
	value,
	targetId,
	color = "primary",
}: {
	title: string;
	sub?: string;
	value: string | number;
	targetId?: string;
	color?: "primary" | "success" | "warning" | "info";
}) {
	const onClick = () => {
		if (!targetId) return;
		const el = document.getElementById(targetId);
		if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
	};
	return (
		<Card
			onClick={onClick}
			variant="outlined"
			sx={{
				cursor: targetId ? "pointer" : "default",
				transition: "transform .15s ease, box-shadow .15s ease",
				"&:hover": {
					transform: targetId ? "translateY(-2px)" : "none",
					boxShadow: targetId ? 2 : "none",
				},
			}}
		>
			<CardHeader
				title={title}
				subheader={sub}
				sx={{ "& .MuiCardHeader-title": { fontWeight: 600 } }}
			/>
			<CardContent>
				<Typography variant="h4" color={color}>
					{value}
				</Typography>
			</CardContent>
		</Card>
	);
}
