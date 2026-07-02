import Link from "next/link";
import { Logo } from "./Logo";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
	return (
		<header className={styles.header}>
			<div className={styles.inner}>
				<Logo />

				<nav className={styles.nav}>
					<Link href="/" className={styles.navLink}>
						Posts
					</Link>
					<span className={styles.divider} />
					<Link href="/admin/login" className={styles.signIn}>
						Sign in
					</Link>
				</nav>
			</div>
		</header>
	);
}
