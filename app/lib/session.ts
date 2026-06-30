import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { Role } from "@/app/generated/prisma/client";

const SESSION_COOKIE = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET);

export type SessionUser = {
	id: string;
	email: string;
	role: Role;
};

export type SessionPayload = {
	userId: string;
	email: string;
	role: Role;
	expiresAt: string; // ISO timestamp
};

export async function encrypt(payload: SessionPayload): Promise<string> {
	return new SignJWT(payload)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("7d")
		.sign(encodedKey);
}

export async function decrypt(
	session?: string,
): Promise<SessionPayload | null> {
	if (!session) return null;

	try {
		const { payload } = await jwtVerify(session, encodedKey, {
			algorithms: ["HS256"],
		});
		return payload as unknown as SessionPayload;
	} catch {
		// Tampered, expired, or otherwise invalid token.
		return null;
	}
}

export async function createSession(user: SessionUser): Promise<void> {
	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
	const session = await encrypt({
		userId: user.id,
		email: user.email,
		role: user.role,
		expiresAt: expiresAt.toISOString(),
	});

	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE, session, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		expires: expiresAt,
		sameSite: "lax",
		path: "/",
	});
}

export async function getSession(): Promise<SessionPayload | null> {
	const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
	return decrypt(cookie);
}

export async function deleteSession(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE);
}
