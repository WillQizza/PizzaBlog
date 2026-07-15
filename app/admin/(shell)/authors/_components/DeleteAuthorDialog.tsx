"use client";

import { useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import type { Author } from "@/app/_lib/users";
import { deleteUser } from "../actions";
import { fullName } from "./helpers";
import styles from "./authors.module.css";

export function DeleteAuthorDialog({
	author,
	onClose,
	onDeleted,
}: {
	author: Author;
	onClose: () => void;
	onDeleted: (message: string) => void;
}) {
	const [pending, startTransition] = useTransition();
	const blockedByPosts = author.postCount > 0;

	function confirmDelete() {
		const formData = new FormData();
		formData.set("id", String(author.id));
		startTransition(async () => {
			const result = await deleteUser(formData);
			if (result && "ok" in result) {
				onDeleted(`${fullName(author)} removed`);
			} else if (result) {
				onDeleted(result.error);
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
				aria-labelledby="deleteTitle"
			>
				<div className={styles.modalHead}>
					<div className={styles.confirmIcon} aria-hidden>
						<FontAwesomeIcon icon={faTrash} />
					</div>
					<h2 className={styles.modalTitle} id="deleteTitle">
						Delete author?
					</h2>
					<p className={styles.confirmText}>
						<strong>{fullName(author)}</strong> will lose access immediately.
						This can&apos;t be undone.
					</p>
					{blockedByPosts && (
						<div className={styles.warnLine}>
							<FontAwesomeIcon icon={faTriangleExclamation} aria-hidden />
							<span>
								They have {author.postCount} post
								{author.postCount === 1 ? "" : "s"}. Reassign or remove those
								first.
							</span>
						</div>
					)}
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
						disabled={pending || blockedByPosts}
					>
						Delete author
					</button>
				</div>
			</div>
		</div>
	);
}
