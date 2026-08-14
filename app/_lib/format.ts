// Shared display formatting so the admin surfaces render dates identically.
export function formatDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

// Serializes a Date into the `YYYY-MM-DDTHH:mm` value an
// `<input type="datetime-local">` expects.
export function formatDateTimeInputValue(date: Date): string {
	const pad = (n: number) => n.toString().padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
