import { redirect } from "next/navigation";
import { getSession } from "@/app/_lib/session";
import { hasAnyUsers } from "@/app/_lib/users";
import AuthForm from "./_components/AuthForm";

export default async function AdminLoginPage() {
	const session = await getSession();
	if (session) {
		redirect("/admin");
	}

	// No users = Admin registration first.
	const registered = await hasAnyUsers();
	return <AuthForm mode={registered ? "login" : "register"} />;
}
