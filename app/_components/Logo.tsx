import Link from "next/link";
import { getSiteSettings } from "@/app/_lib/settings";
import styles from "./Logo.module.css";

export async function Logo() {
	const { siteName } = await getSiteSettings();

	return (
		<Link href="/" className={styles.logo}>
			<span className={styles.mark}>
				{siteName[0]}
			</span>
			<span className={styles.wordmark}>{siteName}</span>
		</Link>
	);
}
