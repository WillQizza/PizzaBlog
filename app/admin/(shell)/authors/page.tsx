import { redirect } from "next/navigation";
import { getSession } from "@/app/_lib/session";
import { isAdmin } from "@/app/_lib/roles";
import { getAuthors } from "@/app/_lib/users";
import { AuthorsView } from "./_components/AuthorsView";

export default async function AuthorsPage() {
	const session = await getSession();
	if (!session) {
		return redirect("/admin/login");
	}
	if (!isAdmin(session)) {
		return redirect("/admin");
	}

	const authors = await getAuthors();

	return <AuthorsView authors={authors} currentUserId={session.userId} />;
}
