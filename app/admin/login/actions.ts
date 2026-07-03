"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/app/_lib/session";
import { hasAnyUsers, registerUser, verifyCredentials } from "@/app/_lib/users";

const MIN_PASSWORD_LENGTH = 8;

export type AuthState = { error?: string } | undefined;

export async function login(
	_prevState: AuthState,
	formData: FormData,
): Promise<AuthState> {
	const email = String(formData.get("email") ?? "");
	const password = String(formData.get("password") ?? "");

	if (!email || !password) {
		return { error: "Email and password are required." };
	}

	const user = await verifyCredentials(email, password);
	if (!user) {
		return { error: "Invalid email or password." };
	}

	await createSession(user);
	redirect("/admin");
}

export async function register(
	_prevState: AuthState,
	formData: FormData,
): Promise<AuthState> {
	const email = String(formData.get("email") ?? "");
	const password = String(formData.get("password") ?? "");

	if (!email || !password) {
		return { error: "Email and password are required." };
	}

	if (password.length < MIN_PASSWORD_LENGTH) {
		return {
			error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
		};
	}

	const usersExist = await hasAnyUsers();
	if (usersExist) {
		return { error: "An account already exists. Please sign in instead." };
	}

	const user = await registerUser({
		username: email,
		password,
		role: "admin",
	});

	await createSession(user);
	redirect("/admin");
}
