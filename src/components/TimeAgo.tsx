export function TimeAgo({ date }: { date: Date | string }) {
	const d = typeof date === "string" ? new Date(date) : date;
	const diff = Date.now() - d.getTime();
	const minutes = Math.floor(diff / 60000);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	let text = "just now";
	if (minutes >= 1) text = `${minutes}m ago`;
	if (hours >= 1) text = `${hours}h ago`;
	if (days >= 1) text = `${days}d ago`;
	return <span title={d.toISOString()}>{text}</span>;
}
