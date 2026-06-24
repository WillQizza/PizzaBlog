import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/session";
import { logout } from "./actions";

// Admin Dashboard
export default async function AdminDashboardPage() {
	const session = await getSession();
	if (!session) {
		return redirect("/admin/login");
	}

	return (
		<div>
			<p>{session.email}</p>

			<form action={logout}>
				<button type="submit">Log out</button>
			</form>
		</div>
	);
}
