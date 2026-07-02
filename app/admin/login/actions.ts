"use server";

import { redirect } from "next/navigation";
import { createSession } from "@/app/_lib/session";
import { verifyCredentials } from "@/app/_lib/users";

export type LoginState = { error?: string } | undefined;

export async function login(
	_prevState: LoginState,
	formData: FormData,
): Promise<LoginState> {
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
