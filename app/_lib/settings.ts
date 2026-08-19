import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import { prisma } from "@/app/_lib/prisma";

export const DEFAULT_SETTINGS = {
	siteName: "PizzaBlog",
	description: "Blog software written in Next.js",
	heroHeader: "John Doe",
	heroHeadline: "Blog software written in Next.js",
	heroDescription: "Come check out my posts!",
} as const;

export type SiteSettingKey = keyof typeof DEFAULT_SETTINGS;

export type SiteSettings = { [K in SiteSettingKey]: string };

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as SiteSettingKey[];

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
	await connection();

	const rows = await prisma.siteSetting.findMany({
		where: { key: { in: SETTING_KEYS } },
	});
	const stored = new Map(rows.map(row => [row.key, row.value]));

	const missing = SETTING_KEYS.filter(key => !stored.has(key));
	if (missing.length > 0) {
		await prisma.siteSetting.createMany({
			data: missing.map(key => ({ key, value: DEFAULT_SETTINGS[key] })),
			skipDuplicates: true,
		});
	}

	const settings = {} as SiteSettings;
	for (const key of SETTING_KEYS) {
		settings[key] = stored.get(key) ?? DEFAULT_SETTINGS[key];
	}
	return settings;
});

export async function updateSiteSettings(data: SiteSettings): Promise<void> {
	await prisma.$transaction(
		SETTING_KEYS.map(key =>
			prisma.siteSetting.upsert({
				where: { key },
				create: { key, value: data[key] },
				update: { value: data[key] },
			}),
		),
	);
}
