import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/app/_lib/session";
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

			{session.role === "admin" && (
				<nav>
					<Link href="/admin/settings">Site settings</Link>
				</nav>
			)}

			<form action={logout}>
				<button type="submit">Log out</button>
			</form>
		</div>
	);
}
