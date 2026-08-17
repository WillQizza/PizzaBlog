import "server-only";

import { cache } from "react";
import { toString } from "mdast-util-to-string";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import strip from "strip-markdown";
import { Prisma } from "@/app/_generated/prisma/client";
import { prisma } from "@/app/_lib/prisma";
import { slugify } from "@/app/_lib/slug";

const WORDS_PER_MINUTE = 200;
const EXCERPT_MAX_LENGTH = 140;

export type RecentPost = {
	id: number;
	title: string;
	slug: string;
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

// Post bodies are Markdown, so an excerpt has to shed the syntax before it is
// cut or a card reads "## What actually happens". This runs the same parser the
// reading page does, so the two never disagree about what a body says.
const markdownToText = remark().use(remarkGfm).use(strip);

function toPlainText(markdown: string): string {
	const tree = markdownToText.runSync(markdownToText.parse(markdown));
	return tree.children.map(node => toString(node)).join(" ");
}

function toExcerpt(body: string): string {
	const text = toPlainText(body).replace(/\s+/g, " ").trim();
	if (text.length <= EXCERPT_MAX_LENGTH) return text;

	const cut = text.slice(0, EXCERPT_MAX_LENGTH);
	const lastSpace = cut.lastIndexOf(" ");
	return `${cut.slice(0, lastSpace > 0 ? lastSpace : EXCERPT_MAX_LENGTH)}…`;
}

export function toReadMinutes(body: string): number {
	const words = body.trim().split(/\s+/).filter(v => !!v).length;
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

// True when `slug` is the base itself or the base plus the numeric suffix this
// module hands out. A post whose stored slug still matches its title's base
// keeps that slug, so a body-only save never moves a published URL.
function matchesBase(slug: string, base: string): boolean {
	if (slug === base) {
		return true;
	}
	if (!slug.startsWith(base)) {
		return false;
	}
	return /^-\d+$/.test(slug.slice(base.length));
}

// Finds the lowest free slug in the `base`, `base-2`, `base-3` sequence.
async function resolveUniqueSlug(base: string, excludePostId: number | undefined): Promise<string> {
	const rows = await prisma.post.findMany({
		where: {
			OR: [{ slug: base }, { slug: { startsWith: `${base}-` } }],
			...(excludePostId === undefined ? {} : { id: { not: excludePostId } }),
		},
		select: { slug: true },
	});

	// `startsWith` also matches unrelated titles ("pizza-dough" under the base
	// "pizza"); only the exact suffixed forms can actually be in the way.
	const taken = new Set(rows.map(row => row.slug).filter(slug => matchesBase(slug, base)));
	if (!taken.has(base)) {
		return base;
	}

	let suffix = 2;
	while (taken.has(`${base}-${suffix}`)) {
		suffix += 1;
	}
	return `${base}-${suffix}`;
}

// `slug` is the only unique constraint on Post, so a P2002 from a post write is
// always a slug clash: another request claimed it between our lookup and our
// write. Add a second unique field to the model and this has to narrow.
function isSlugConflict(error: unknown): boolean {
	return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

// Thrown when another request claimed the slug between our lookup and our
// write. Nothing was saved, and resolving again would land on the next free
// suffix, so the save is worth repeating exactly as the author made it.
export class SlugTakenError extends Error {
	constructor() {
		super("That post's link was just taken by another save.");
		this.name = "SlugTakenError";
	}
}

// Resolve a free slug and write with it. The lookup is only a best guess; the
// unique index is the arbiter, and losing that race goes back to the author
// rather than being papered over with a slug their title did not ask for.
async function writeWithSlug<T>(
	base: string,
	excludePostId: number | undefined,
	write: (slug: string) => Promise<T>,
): Promise<T> {
	const slug = await resolveUniqueSlug(base, excludePostId);

	try {
		return await write(slug);
	} catch (error) {
		if (isSlugConflict(error)) {
			throw new SlugTakenError();
		}
		throw error;
	}
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
		slug: post.slug,
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
	slug: string;
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
		slug: post.slug,
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

export type PostDetail = {
	id: number;
	title: string;
	body: string;
	excerpt: string;
	authorId: number;
	authorName: string;
	publishAt: Date | null;
	readMinutes: number;
};

// One post by its URL slug, in whatever state it is in: `publishAt` is carried
// out as-is so the caller decides what a draft or a scheduled post means to it.
// The public reading page must gate on getPostState before rendering anything.
// Cached because the page and its generateMetadata both ask for the same post.
export const getPostBySlug = cache(
	async (slug: string): Promise<PostDetail | null> => {
		const post = await prisma.post.findFirst({
			where: { slug: slug.toLowerCase() },
			include: {
				author: { select: { firstName: true, lastName: true } },
			},
		});

		if (!post) {
			return null;
		}

		return {
			id: post.id,
			title: post.title,
			body: post.body,
			excerpt: toExcerpt(post.body),
			authorId: post.authorId,
			authorName: `${post.author.firstName} ${post.author.lastName}`,
			publishAt: post.publishAt,
			readMinutes: toReadMinutes(post.body),
		};
	},
);

export async function createPost(data: {
	title: string;
	body: string;
	authorId: number;
	publishAt: Date | null;
}): Promise<{ id: number; slug: string }> {
	return writeWithSlug(slugify(data.title), undefined, slug =>
		prisma.post.create({
			data: {
				title: data.title,
				slug,
				body: data.body,
				authorId: data.authorId,
				publishAt: data.publishAt,
			},
			select: { id: true, slug: true },
		}),
	);
}

export async function updatePost(
	id: number,
	data: { title: string; body: string; publishAt: Date | null },
): Promise<void> {
	const current = await prisma.post.findUnique({
		where: { id },
		select: { slug: true },
	});
	if (!current) {
		throw new Error(`Post ${id} not found.`);
	}

	const base = slugify(data.title);

	// The URL only moves when the title changes shape. Editing the body, or
	// editing punctuation that slugifies away, leaves the slug where it is.
	if (matchesBase(current.slug, base)) {
		await prisma.post.update({
			where: { id },
			data: {
				title: data.title,
				body: data.body,
				publishAt: data.publishAt,
			},
		});
		return;
	}

	await writeWithSlug(base, id, slug =>
		prisma.post.update({
			where: { id },
			data: {
				title: data.title,
				slug,
				body: data.body,
				publishAt: data.publishAt,
			},
		}),
	);
}

export async function deletePost(id: number): Promise<void> {
	await prisma.post.delete({ where: { id } });
}
