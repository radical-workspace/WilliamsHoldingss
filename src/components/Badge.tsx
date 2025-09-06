export function Badge({
	children,
	variant = "default",
}: { children: React.ReactNode; variant?: "default" | "success" | "error" }) {
	const map: Record<string, string> = {
		default: "bg-gray-200 text-gray-800",
		success: "bg-green-100 text-green-800",
		error: "bg-red-100 text-red-800",
	};
	return (
		<span
			className={`inline-block px-2 py-0.5 rounded text-sm ${map[variant]}`}
		>
			{children}
		</span>
	);
}
