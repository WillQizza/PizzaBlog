import "server-only";

import { prisma } from "@/app/_lib/prisma";

const WORDS_PER_MINUTE = 200;
const EXCERPT_MAX_LENGTH = 140;

export type PostPreview = {
	id: number;
	title: string;
	excerpt: string;
	authorName: string;
	publishedAt: Date;
	readMinutes: number;
};

function toExcerpt(body: string): string {
	const text = body.replace(/\s+/g, " ").trim();
	if (text.length <= EXCERPT_MAX_LENGTH) return text;

	const cut = text.slice(0, EXCERPT_MAX_LENGTH);
	const lastSpace = cut.lastIndexOf(" ");
	return `${cut.slice(0, lastSpace > 0 ? lastSpace : EXCERPT_MAX_LENGTH)}…`;
}

function toReadMinutes(body: string): number {
	const words = body.trim().split(/\s+/).filter(v => !!v).length;
	return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export async function getRecentPosts(limit = 3): Promise<PostPreview[]> {
	const posts = await prisma.post.findMany({
		orderBy: { createdAt: "desc" },
		take: limit,
		include: {
			author: { select: { firstName: true, lastName: true } },
		},
	});

	return posts.map(post => ({
		id: post.id,
		title: post.title,
		excerpt: toExcerpt(post.body),
		authorName: `${post.author.firstName} ${post.author.lastName}`,
		publishedAt: post.createdAt,
		readMinutes: toReadMinutes(post.body),
	}));
}
