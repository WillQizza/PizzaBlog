import { redirect } from "next/navigation";
import { getSession } from "@/app/_lib/session";

export default async function AccountSettingsPage() {
	const session = await getSession();
	if (!session) {
		return redirect("/admin/login");
	}

	return (
		<div>
			Account Settings
		</div>
	);
}
