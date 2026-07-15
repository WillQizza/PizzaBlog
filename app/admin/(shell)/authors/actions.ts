"use server";

import { refresh } from "next/cache";
import type { Role } from "@/app/_generated/prisma/enums";
import { getSession } from "@/app/_lib/session";
import {
	countAuthorPosts,
	createAuthor,
	deleteAuthor,
	findUserByEmail,
	updateAuthor,
} from "@/app/_lib/users";

const MIN_PASSWORD_LENGTH = 8;

export type UserActionState =
	| { ok: true }
	| { error: string; field?: "email" | "password" };

function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isRole(value: string): value is Role {
	return value === "admin" || value === "editor";
}

async function requireAdmin() {
	const session = await getSession();
	if (!session || session.role !== "admin") {
		return null;
	}
	return session;
}

type Fields = {
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	password: string;
};

function readFields(formData: FormData): Fields {
	return {
		firstName: String(formData.get("firstName") ?? "").trim(),
		lastName: String(formData.get("lastName") ?? "").trim(),
		email: String(formData.get("email") ?? "").trim().toLowerCase(),
		role: String(formData.get("role") ?? "editor"),
		password: String(formData.get("password") ?? ""),
	};
}

// Shared validation for the shape common to create and update. Password rules
// differ (required on create, optional on update) so they are checked by the
// callers.
function validateShared(fields: Fields): UserActionState | null {
	if (!fields.firstName) {
		return { error: "First name is required." };
	}
	if (!isValidEmail(fields.email)) {
		return { error: "Enter a valid email address.", field: "email" };
	}
	if (!isRole(fields.role)) {
		return { error: "Choose a valid role." };
	}
	return null;
}

export async function createUser(
	formData: FormData,
): Promise<UserActionState> {
	const session = await requireAdmin();
	if (!session) {
		return { error: "You do not have permission to manage authors." };
	}

	const fields = readFields(formData);
	const invalid = validateShared(fields);
	if (invalid) {
		return invalid;
	}
	if (fields.password.length < MIN_PASSWORD_LENGTH) {
		return {
			error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
			field: "password",
		};
	}

	const existing = await findUserByEmail(fields.email);
	if (existing) {
		return { error: "That email is already in use.", field: "email" };
	}

	await createAuthor({
		firstName: fields.firstName,
		lastName: fields.lastName,
		email: fields.email,
		role: fields.role as Role,
		password: fields.password,
	});

	refresh();
	return { ok: true };
}

export async function updateUser(
	formData: FormData,
): Promise<UserActionState> {
	const session = await requireAdmin();
	if (!session) {
		return { error: "You do not have permission to manage authors." };
	}

	const id = Number(formData.get("id"));
	if (!Number.isInteger(id)) {
		return { error: "That author could not be found." };
	}
	// You manage your own profile from Account settings, not here.
	if (id === session.userId) {
		return { error: "Edit your own account from Account settings." };
	}

	const fields = readFields(formData);
	const invalid = validateShared(fields);
	if (invalid) {
		return invalid;
	}
	if (fields.password && fields.password.length < MIN_PASSWORD_LENGTH) {
		return {
			error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
			field: "password",
		};
	}

	const existing = await findUserByEmail(fields.email);
	if (existing && existing.id !== id) {
		return { error: "That email is already in use.", field: "email" };
	}

	await updateAuthor(id, {
		firstName: fields.firstName,
		lastName: fields.lastName,
		email: fields.email,
		role: fields.role as Role,
		// Blank password on update means "keep the current one".
		password: fields.password || undefined,
	});

	refresh();
	return { ok: true };
}

export async function deleteUser(
	formData: FormData,
): Promise<UserActionState> {
	const session = await requireAdmin();
	if (!session) {
		return { error: "You do not have permission to manage authors." };
	}

	const id = Number(formData.get("id"));
	if (!Number.isInteger(id)) {
		return { error: "That author could not be found." };
	}
	if (id === session.userId) {
		return { error: "You can't delete your own account." };
	}

	const posts = await countAuthorPosts(id);
	if (posts > 0) {
		return { error: "Reassign or remove this author's posts before deleting." };
	}

	await deleteAuthor(id);

	refresh();
	return { ok: true };
}
