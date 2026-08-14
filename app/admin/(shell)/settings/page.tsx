import { redirect } from "next/navigation";
import { getSession } from "@/app/_lib/session";
import { isAdmin } from "@/app/_lib/roles";
import { getSiteSettings } from "@/app/_lib/settings";
import { SettingsForm } from "./_components/SettingsForm";

export default async function SettingsPage() {
	const session = await getSession();
	if (!session) {
		return redirect("/admin/login");
	}
	if (!isAdmin(session)) {
		return redirect("/admin");
	}

	const settings = await getSiteSettings();

	return <SettingsForm settings={settings} />;
}
