import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/session";

export default async function UsersPage() {
	const session = await getSession();
	if (!session) {
		return redirect("/admin/login");
	}
	if (session.role !== "admin") {
		return redirect("/admin");
	}

	return (
		<div>
			Users Page
		</div>
	);
}
