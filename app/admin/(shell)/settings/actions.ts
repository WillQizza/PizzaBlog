"use server";

import { refresh } from "next/cache";
import { getSession } from "@/app/_lib/session";
import { isAdmin } from "@/app/_lib/roles";
import {
	DEFAULT_SETTINGS,
	updateSiteSettings,
	type SiteSettings,
	type SiteSettingKey,
} from "@/app/_lib/settings";

export type SettingsState =
	| { ok: true; settings: SiteSettings }
	| { error: string }
	| undefined;

const SETTING_KEYS = Object.keys(DEFAULT_SETTINGS) as SiteSettingKey[];

export async function updateSettings(
	formData: FormData,
): Promise<SettingsState> {
	const session = await getSession();
	if (!session || !isAdmin(session)) {
		return { error: "You do not have permission to change site settings." };
	}

	const settings = {} as SiteSettings;
	for (const key of SETTING_KEYS) {
		settings[key] = (formData.get(key) ?? "").toString().trim();
	}

	if (!settings.siteName) {
		return { error: "Site name can't be empty." };
	}

	await updateSiteSettings(settings);

	// Re-render the server tree so the sidebar logo and public site pick up
	// the new values.
	refresh();

	return { ok: true, settings };
}
