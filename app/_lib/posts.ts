import "server-only";

import { prisma } from "@/app/_lib/prisma";

const WORDS_PER_MINUTE = 200;
const EXCERPT_MAX_LENGTH = 140;

export type RecentPost = {
	id: number;
	title: string;
	excerpt: string;
	authorName: string;
	readMinutes: number;
	state: PostState;
	publishedAt: Date;
	updatedAt: Date;
};

export type PostState = "draft" | "published" | "scheduled";

export function getPostState(publishAt: Date | null, now = new Date()): PostState {
	if (!publishAt) return "draft";
	return publishAt <= now ? "published" : "scheduled";
}

function toExcerpt(body: string): string {
	const text = body.replace(/\s+/g, " ").trim();
	if (text.length <= EXCERPT_MAX_LENGTH) return text;

	const cut = text.slice(0, EXCERPT_MAX_LENGTH);
	const lastSpace = cut.lastIndexOf(" ");
	return `${cut.slice(0, lastSpace > 0 ? lastSpace : EXCERPT_MAX_LENGTH)}…`;
}

export function toReadMinutes(body: string): number {
	const words = body.trim().split(/\s+/).filter(v => !!v).length;
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export async function getRecentPosts({
	limit = 6,
	authorId,
	liveOnly = false,
}: {
	limit?: number;
	authorId?: number;
	liveOnly?: boolean;
} = {}): Promise<RecentPost[]> {
	const posts = await prisma.post.findMany({
		where: {
			...(authorId === undefined ? {} : { authorId }),
			// A post is live once its publishAt time has passed; null means draft.
			...(liveOnly ? { publishAt: { lte: new Date() } } : {}),
		},
		// Live feed reads chronologically; the working set by most recent edit.
		orderBy: liveOnly ? { publishAt: "desc" } : { updatedAt: "desc" },
		take: limit,
		include: {
			author: { select: { firstName: true, lastName: true } },
		},
	});

	const now = new Date();
	return posts.map(post => ({
		id: post.id,
		title: post.title,
		excerpt: toExcerpt(post.body),
		authorName: `${post.author.firstName} ${post.author.lastName}`,
		readMinutes: toReadMinutes(post.body),
		state: getPostState(post.publishAt, now),
		publishedAt: post.publishAt ?? post.createdAt,
		updatedAt: post.updatedAt,
	}));
}

export type PostListItem = {
	id: number;
	title: string;
	authorName: string;
	authorId: number;
	readMinutes: number;
	state: PostState;
	updatedAt: Date;
};

// Every post in every state, for the admin posts list. Admins pass no authorId
// to see all; editors pass their own id so they only manage their own posts.
export async function getPostsForList(authorId?: number): Promise<PostListItem[]> {
	const posts = await prisma.post.findMany({
		where: authorId === undefined ? {} : { authorId },
		orderBy: { updatedAt: "desc" },
		include: {
			author: { select: { firstName: true, lastName: true } },
		},
	});

	const now = new Date();
	return posts.map(post => ({
		id: post.id,
		title: post.title,
		authorName: `${post.author.firstName} ${post.author.lastName}`,
		authorId: post.authorId,
		readMinutes: toReadMinutes(post.body),
		state: getPostState(post.publishAt, now),
		updatedAt: post.updatedAt,
	}));
}

export type PostRecord = {
	id: number;
	title: string;
	body: string;
	authorId: number;
	publishAt: Date | null;
};

// One read of a single post, shared by the editor and by the actions that
// authorize against `authorId` or resolve "publish now" against `publishAt`.
export async function getPost(id: number): Promise<PostRecord | null> {
	return prisma.post.findUnique({
		where: { id },
		select: {
			id: true,
			title: true,
			body: true,
			authorId: true,
			publishAt: true,
		},
	});
}

export async function createPost(data: {
	title: string;
	body: string;
	authorId: number;
	publishAt: Date | null;
}): Promise<{ id: number }> {
	const post = await prisma.post.create({
		data: {
			title: data.title,
			body: data.body,
			authorId: data.authorId,
			publishAt: data.publishAt,
		},
		select: { id: true },
	});
	return post;
}

export async function updatePost(
	id: number,
	data: { title: string; body: string; publishAt: Date | null },
): Promise<void> {
	await prisma.post.update({
		where: { id },
		data: {
			title: data.title,
			body: data.body,
			publishAt: data.publishAt,
		},
	});
}

export async function deletePost(id: number): Promise<void> {
	await prisma.post.delete({ where: { id } });
}
