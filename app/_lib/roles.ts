import type { Role } from "@/app/_generated/prisma/enums";

export function isAdmin(subject: { role: Role } | null | undefined): boolean {
	return subject?.role === "admin";
}

// An allowlist rather than a denylist: a role added later (a registered guest,
// say) cannot write posts until it is named here.
const AUTHOR_ROLES: readonly Role[] = ["admin", "editor"];

export function canAuthorManagePosts(
	subject: { role: Role } | null | undefined,
): boolean {
	return subject ? AUTHOR_ROLES.includes(subject.role) : false;
}
