"use client";

import { useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import type { PostListItem } from "@/app/_lib/posts";
import { deletePostAction } from "../actions";
import styles from "./posts.module.css";

export function DeletePostDialog({
	post,
	onClose,
	onDeleted,
}: {
	post: PostListItem;
	onClose: () => void;
	onDeleted: (message: string, danger: boolean) => void;
}) {
	const [pending, startTransition] = useTransition();

	function confirmDelete() {
		startTransition(async () => {
			const result = await deletePostAction(post.id);
			if (result && "ok" in result) {
				onDeleted(`"${post.title}" deleted`, true);
			} else if (result) {
				onDeleted(result.error, true);
			}
		});
	}

	return (
		<div
			className={styles.overlay}
			onMouseDown={event => {
				if (event.target === event.currentTarget) {
					onClose();
				}
			}}
		>
			<div
				className={`${styles.modal} ${styles.confirm}`}
				role="dialog"
				aria-modal="true"
				aria-labelledby="deletePostTitle"
			>
				<div className={styles.modalHead}>
					<div className={styles.confirmIcon} aria-hidden>
						<FontAwesomeIcon icon={faTrash} />
					</div>
					<h2 className={styles.modalTitle} id="deletePostTitle">
						Delete post?
					</h2>
					<p className={styles.confirmText}>
						<strong>{post.title}</strong> will be permanently removed. This
						can&apos;t be undone.
					</p>
				</div>
				<div className={styles.modalFoot}>
					<div className={styles.spacer} />
					<button
						type="button"
						className={`${styles.btn} ${styles.btnGhost}`}
						onClick={onClose}
						autoFocus
					>
						Cancel
					</button>
					<button
						type="button"
						className={`${styles.btn} ${styles.btnDanger}`}
						onClick={confirmDelete}
						disabled={pending}
					>
						{pending ? "Deleting..." : "Delete post"}
					</button>
				</div>
			</div>
		</div>
	);
}
