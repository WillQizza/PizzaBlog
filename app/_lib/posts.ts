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
