"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/app/_lib/session";
import { canAuthorManagePosts, isAdmin } from "@/app/_lib/roles";
import { createPost, deletePost, getPost, updatePost } from "@/app/_lib/posts";

type PostError = { error: string; field?: "title" | "body" | "publishAt" };

export type PostActionState = { ok: true } | PostError;

export type PublishMode = "draft" | "now" | "schedule";

type PostInput = {
	title: string;
	body: string;
	publishMode: PublishMode;
	publishAt: Date | null;
};

type PostFields = {
	title: string;
	body: string;
	publishMode: string;
	publishAt: Date | null;
};

// Actions are reachable by direct POST, so `input` may be anything at runtime.
// Normalize to known-good values and reject what the editor should have caught.
function parseInput(input: PostInput): PostFields | PostError {
	const title = typeof input?.title === "string" ? input.title.trim() : "";
	if (!title) {
		return { error: "Title is required.", field: "title" };
	}

	const body = typeof input?.body === "string" ? input.body.trim() : "";
	if (!body) {
		return { error: "Write something before saving.", field: "body" };
	}

	return {
		title,
		body,
		publishMode: typeof input?.publishMode === "string" ? input.publishMode : "",
		publishAt: input?.publishAt instanceof Date ? input.publishAt : null,
	};
}

// Turn the editor's publish control into the single publishAt value the schema
// stores. `null` is a draft, a past/now time is published, a future time is
// scheduled (see getPostState).
function resolvePublishAt(
	fields: PostFields,
	stored: Date | null,
): Date | null | PostError {
	if (fields.publishMode === "draft") {
		return null;
	}

	if (fields.publishMode === "now") {
		// Re-saving an already-published post keeps its original publish time
		// instead of bumping it to the current moment. A stored time in the future
		// means it was only scheduled, so publishing it now stamps the real moment.
		if (stored && stored <= new Date()) {
			return stored;
		}
		return new Date();
	}

	if (fields.publishMode === "schedule") {
		const when = fields.publishAt;
		if (!when || Number.isNaN(when.getTime())) {
			return { error: "Choose a valid date and time to schedule.", field: "publishAt" };
		}
		if (when <= new Date()) {
			return { error: "Schedule a time in the future.", field: "publishAt" };
		}
		return when;
	}

	return { error: "Choose how to publish this post." };
}

// Check if session can edit a specific user
function canManage(session: SessionPayload, ownerId: number): boolean {
	return isAdmin(session) || session.userId === ownerId;
}

export async function createPostAction(
	input: PostInput,
): Promise<PostActionState> {
	const session = await getSession();
	if (!session || !canAuthorManagePosts(session)) {
		return { error: "You do not have permission to manage posts." };
	}

	const fields = parseInput(input);
	if ("error" in fields) {
		return fields;
	}

	// A post that does not exist yet has no publish time to preserve.
	const publishAt = resolvePublishAt(fields, null);
	if (publishAt !== null && !(publishAt instanceof Date)) {
		return publishAt;
	}

	await createPost({
		title: fields.title,
		body: fields.body,
		authorId: session.userId,
		publishAt,
	});

	// Redirect back to admin posts list
	refresh();
	redirect("/admin/posts");
}

export async function updatePostAction(
	id: number,
	input: PostInput,
): Promise<PostActionState> {
	const session = await getSession();
	if (!session || !canAuthorManagePosts(session)) {
		return { error: "You do not have permission to manage posts." };
	}

	if (!Number.isInteger(id)) {
		return { error: "That post could not be found." };
	}

	const post = await getPost(id);
	if (!post) {
		return { error: "That post could not be found." };
	}
	if (!canManage(session, post.authorId)) {
		return { error: "You can only edit your own posts." };
	}

	const fields = parseInput(input);
	if ("error" in fields) {
		return fields;
	}

	const publishAt = resolvePublishAt(fields, post.publishAt);
	if (publishAt !== null && !(publishAt instanceof Date)) {
		return publishAt;
	}

	await updatePost(id, {
		title: fields.title,
		body: fields.body,
		publishAt,
	});

	// Throws NEXT_REDIRECT, so a successful save never returns to the editor.
	refresh();
	redirect("/admin/posts");
}

export async function deletePostAction(id: number): Promise<PostActionState> {
	const session = await getSession();
	if (!session || !canAuthorManagePosts(session)) {
		return { error: "You do not have permission to manage posts." };
	}

	if (!Number.isInteger(id)) {
		return { error: "That post could not be found." };
	}

	const post = await getPost(id);
	if (!post) {
		return { error: "That post could not be found." };
	}
	if (!canManage(session, post.authorId)) {
		return { error: "You can only delete your own posts." };
	}

	await deletePost(id);

	refresh();
	return { ok: true };
}
