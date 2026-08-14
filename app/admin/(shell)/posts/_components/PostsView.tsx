"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
import type { PostListItem, PostState } from "@/app/_lib/posts";
import { useToast } from "@/app/_hooks/useToast";
import { DeletePostDialog } from "./DeletePostDialog";
import { PostsTable } from "./PostsTable";
import styles from "./posts.module.css";

type Filter = "all" | PostState;

const FILTERS: { key: Filter; label: string }[] = [
	{ key: "all", label: "All" },
	{ key: "published", label: "Published" },
	{ key: "draft", label: "Drafts" },
	{ key: "scheduled", label: "Scheduled" },
];

export function PostsView({
	posts,
	isAdmin,
}: {
	posts: PostListItem[];
	isAdmin: boolean;
}) {
	const [filter, setFilter] = useState<Filter>("all");
	const [deleting, setDeleting] = useState<PostListItem | null>(null);

	const toast = useToast();
	const restoreFocus = useRef<HTMLElement | null>(null);

	const counts = useMemo(() => {
		const base: Record<PostState, number> = { published: 0, draft: 0, scheduled: 0 };
		for (const post of posts) {
			base[post.state] += 1;
		}
		return base;
	}, [posts]);

	const visible = filter === "all" ? posts : posts.filter(post => post.state === filter);

	function openDelete(post: PostListItem) {
		restoreFocus.current = document.activeElement as HTMLElement;
		setDeleting(post);
	}

	function closeDelete() {
		setDeleting(null);
		restoreFocus.current?.focus();
	}

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setDeleting(null);
			}
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, []);

	return (
		<div className={styles.page}>
			<header className={styles.topbar}>
				<div>
					<h1 className={styles.title}>Posts</h1>
					<p className={styles.subtitle}>
						{posts.length} post{posts.length === 1 ? "" : "s"} · {counts.published}{" "}
						published, {counts.draft} draft{counts.draft === 1 ? "" : "s"},{" "}
						{counts.scheduled} scheduled
					</p>
				</div>
				<Link
					href="/admin/posts/new"
					className={`${styles.btn} ${styles.btnPrimary} ${styles.newBtn}`}
				>
					<FontAwesomeIcon icon={faPlus} aria-hidden />
					New post
				</Link>
			</header>

			<div className={styles.tabs} role="tablist" aria-label="Filter posts">
				{FILTERS.map(item => (
					<button
						key={item.key}
						type="button"
						role="tab"
						aria-selected={filter === item.key}
						className={filter === item.key ? `${styles.tab} ${styles.tabActive}` : styles.tab}
						onClick={() => setFilter(item.key)}
					>
						{item.label}
						<span className={styles.tabCount}>
							{item.key === "all" ? posts.length : counts[item.key]}
						</span>
					</button>
				))}
			</div>

			{visible.length === 0 ? (
				<p className={styles.empty}>
					{posts.length === 0 ? (
						<>
							No posts yet. <Link href="/admin/posts/new">Write the first one</Link>.
						</>
					) : (
						"No posts match this filter."
					)}
				</p>
			) : (
				<PostsTable posts={visible} showAuthor={isAdmin} onDelete={openDelete} />
			)}

			{deleting && (
				<DeletePostDialog
					post={deleting}
					onClose={closeDelete}
					onDeleted={(message, danger) => {
						toast.show(message, danger);
						closeDelete();
					}}
				/>
			)}

			<div
				className={
					toast.shown
						? `${styles.toast} ${styles.toastShown}${toast.danger ? ` ${styles.toastDangerVariant}` : ""}`
						: `${styles.toast}${toast.danger ? ` ${styles.toastDangerVariant}` : ""}`
				}
				role="status"
				aria-live="polite"
			>
				<span className={styles.toastMark} aria-hidden>
					<FontAwesomeIcon icon={faCheck} />
				</span>
				<span>{toast.message}</span>
			</div>
		</div>
	);
}
