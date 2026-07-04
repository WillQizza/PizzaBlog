import "server-only";

import bcrypt from "bcryptjs";
import { cache } from "react";
import { prisma } from "@/app/_lib/prisma";
import type { Role } from "@/app/_generated/prisma/enums";
import { getSession, type SessionUser } from "@/app/_lib/session";

export type UserProfile = {
	id: number;
	name: string;
	email: string;
	role: Role;
};

export type TeamMember = UserProfile & {
	postCount: number;
};

const SALT_ROUNDS = 12;

// A bcrypt hash of a throwaway value. When no user matches we still run a
// comparison against this so the response time does not reveal whether the
// email exists. The plaintext placeholder comes from env and is hashed here.
const DUMMY_HASH = bcrypt.hashSync(
	process.env.DUMMY_PASSWORD ?? "unused-placeholder-password",
	SALT_ROUNDS,
);

export const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
	const session = await getSession();
	if (!session) return null;

	const user = await prisma.user.findUnique({
		where: { id: session.userId },
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			role: true,
		},
	});
	if (!user) return null;

	return {
		id: user.id,
		name: `${user.firstName} ${user.lastName}`.trim(),
		email: user.email,
		role: user.role,
	};
});

export function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

export async function hasAnyUsers(): Promise<boolean> {
	const count = await prisma.user.count();
	return count > 0;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
	const users = await prisma.user.findMany({
		select: {
			id: true,
			firstName: true,
			lastName: true,
			email: true,
			role: true,
			_count: { select: { posts: true } },
		},
		orderBy: [{ role: "asc" }, { firstName: "asc" }],
	});

	return users.map(user => ({
		id: user.id,
		name: `${user.firstName} ${user.lastName}`.trim(),
		email: user.email,
		role: user.role,
		postCount: user._count.posts,
	}));
}

export async function registerUser({
	username,
	password,
	role,
}: {
	username: string;
	password: string;
	role: Role;
}): Promise<SessionUser> {
	const normalizedEmail = username.trim().toLowerCase();
	const hashedPassword = await hashPassword(password);

	// The schema requires a name; seed it from the email local-part so the
	// user has a sensible default they can refine later.
	const [localPart] = normalizedEmail.split("@");

	const user = await prisma.user.create({
		data: {
			email: normalizedEmail,
			password: hashedPassword,
			firstName: localPart ?? normalizedEmail,
			lastName: "",
			role,
		},
	});

	return { id: user.id, email: user.email, role: user.role };
}

export async function verifyCredentials(
	email: string,
	password: string,
): Promise<SessionUser | null> {
	const normalizedEmail = email.trim().toLowerCase();
	const user = await prisma.user.findUnique({
		where: { email: normalizedEmail },
	});

	// Always run a comparison, even when the user is missing, so the response
	// time does not reveal whether the email exists.
	const passwordMatches = await bcrypt.compare(
		password,
		user?.password ?? DUMMY_HASH,
	);

	if (!user || !passwordMatches) return null;

	return { id: user.id, email: user.email, role: user.role };
}
