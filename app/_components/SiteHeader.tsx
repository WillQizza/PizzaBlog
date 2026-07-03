import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { getSession } from "@/app/_lib/session";
import { Logo } from "./Logo";
import styles from "./SiteHeader.module.css";

export async function SiteHeader() {
	const session = await getSession();

	return (
		<header className={styles.header}>
			<div className={styles.inner}>
				<Logo />

				<nav className={styles.nav}>
					<Link href="/" className={styles.navLink}>
						Posts
					</Link>
					<span className={styles.divider} />
					{session ? (
						<>
							<Link href="/admin" className={styles.signIn}>
								Dashboard
							</Link>
							<span className={styles.divider} />
							<form action={logout}>
								<button type="submit" className={styles.logOut}>
									Log out
								</button>
							</form>
						</>
					) : (
						<Link href="/admin/login" className={styles.signIn}>
							Sign in
						</Link>
					)}
				</nav>
			</div>
		</header>
	);
}
