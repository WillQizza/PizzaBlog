"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminNav.module.css";

export type AdminNavItem = {
	label: string;
	href?: string;
	action?: () => void;
};

export type AdminNavGroup = {
	label: string;
	items: AdminNavItem[];
};

function isActive(pathname: string, href: string): boolean {
	if (href === "/admin") {
		return pathname === "/admin";
	}
	
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ groups }: { groups: AdminNavGroup[] }) {
	const pathname = usePathname();

	return (
		<>
			{groups.map(group => (
				<nav key={group.label} className={styles.group}>
					<div className={styles.groupLabel}>{group.label}</div>
					{group.items.map(item =>
						item.action ? (
							<form key={item.label} action={item.action}>
								<button type="submit" className={`${styles.item} ${styles.itemButton}`}>
									{item.label}
								</button>
							</form>
						) : (
							<Link
								key={item.href}
								href={item.href!}
								className={
									isActive(pathname, item.href!)
										? `${styles.item} ${styles.active}`
										: styles.item
								}
							>
								{item.label}
							</Link>
						)
					)}
				</nav>
			))}
		</>
	);
}
