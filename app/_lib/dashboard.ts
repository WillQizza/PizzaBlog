import "server-only";

import { prisma } from "@/app/_lib/prisma";

export type DashboardStats = {
	total: number;
	published: number;
	drafts: number;
	scheduled: number;
	createdThisMonth: number;
	publishedThisMonth: number;
	admins: number;
	editors: number;
};

export type MonthlyPoint = {
	label: string;
	count: number;
};

function monthStart(date: Date, offset = 0): Date {
	return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

export async function getDashboardStats(authorId?: number): Promise<DashboardStats> {
	const now = new Date();
	const scope = authorId === undefined ? {} : { authorId };

	const [total, published, drafts, createdThisMonth, publishedThisMonth, admins, editors] =
		await prisma.$transaction([
			prisma.post.count({ where: scope }),
			// A post is live once its publishAt time has passed. Null means draft.
			prisma.post.count({ where: { ...scope, publishAt: { lte: now } } }),
			prisma.post.count({ where: { ...scope, publishAt: null } }),
			prisma.post.count({ where: { ...scope, createdAt: { gte: monthStart(now) } } }),
			prisma.post.count({
				where: { ...scope, publishAt: { gte: monthStart(now), lte: now } },
			}),
			prisma.user.count({ where: { role: "admin" } }),
			prisma.user.count({ where: { role: "editor" } }),
		]);

	return {
		total,
		published,
		drafts,
		scheduled: total - published - drafts,
		createdThisMonth,
		publishedThisMonth,
		admins,
		editors,
	};
}

export async function getMonthlyPublishedPoints(authorId?: number): Promise<MonthlyPoint[]> {
	const now = new Date();
	const start = monthStart(now, -5);

	const posts = await prisma.post.findMany({
		select: { publishAt: true },
		where: {
			publishAt: { gte: start, lte: now },
			...(authorId === undefined ? {} : { authorId }),
		},
	});

	const points: MonthlyPoint[] = [];
	for (let offset = -5; offset <= 0; offset++) {
		const bucket = monthStart(now, offset);
		points.push({
			label: bucket.toLocaleDateString("en-US", { month: "short" }),
			count: posts.filter(post => {
				const at = post.publishAt!;
				return at >= bucket && at < monthStart(now, offset + 1);
			}).length,
		});
	}
	return points;
}
