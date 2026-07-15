import type { Author } from "@/app/_lib/users";

export function fullName(author: Author): string {
	return `${author.firstName} ${author.lastName}`.trim();
}

export function initialsOf(author: Author): string {
	return (
		(author.firstName[0] ?? "") + (author.lastName[0] ?? "")
	).toUpperCase();
}
