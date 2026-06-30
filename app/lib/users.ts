import "server-only";

import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import type { SessionUser } from "@/app/lib/session";

const SALT_ROUNDS = 12;

// A bcrypt hash of a throwaway value. When no user matches we still run a
// comparison against this so the response time does not reveal whether the
// email exists. The plaintext placeholder comes from env and is hashed here.
const DUMMY_HASH = bcrypt.hashSync(
	process.env.DUMMY_PASSWORD ?? "unused-placeholder-password",
	SALT_ROUNDS,
);

export function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
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

	return { id: String(user.id), email: user.email, role: user.role };
}
