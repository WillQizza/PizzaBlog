import { redirect } from "next/navigation";
import { logout } from "@/app/admin/actions";
import { Logo } from "@/app/_components/Logo";
import { isAdmin } from "@/app/_lib/roles";
import { getCurrentUser } from "@/app/_lib/users";
import { AdminNav, type AdminNavGroup } from "./_components/AdminNav";
import styles from "./layout.module.css";

export default async function AdminLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const user = await getCurrentUser();
	if (!user) {
		return redirect("/admin/login");
	}

	const admin = isAdmin(user);

	const groups: AdminNavGroup[] = [
		{
			label: "Manage",
			items: [
				{ label: "Dashboard", href: "/admin" },
				{ label: "Posts", href: "/admin/posts" },
				...(admin ? [{ label: "Authors", href: "/admin/authors" }] : []),
			],
		},
		{
			label: "Site",
			items: [
				...(admin ? [{ label: "Site settings", href: "/admin/settings" }] : []),
				{ label: "View site", href: "/" },
			],
		},
		{
			label: "Account",
			items: [
				{ label: "Settings", href: "/admin/account" },
				{ label: "Log out", action: logout },
			],
		},
	];

	return (
		<div className={styles.app}>
			<aside className={styles.sidebar}>
				<div className={styles.brand}>
					<Logo />
				</div>

				<AdminNav groups={groups} />

				<div className={styles.spacer} />
			</aside>

			<main className={styles.main}>{children}</main>
		</div>
	);
}
