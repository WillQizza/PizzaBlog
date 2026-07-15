"use client";

import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
import type { Author } from "@/app/_lib/users";
import { AuthorForm } from "./AuthorForm";
import { AuthorsTable } from "./AuthorsTable";
import { DeleteAuthorDialog } from "./DeleteAuthorDialog";
import styles from "./authors.module.css";

export function AuthorsView({
	authors,
	currentUserId,
}: {
	authors: Author[];
	currentUserId: number;
}) {
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<Author | null>(null);
	const [deleting, setDeleting] = useState<Author | null>(null);

	const [toastMessage, setToastMessage] = useState("");
	const [toastDanger, setToastDanger] = useState(false);
	const [toastShown, setToastShown] = useState(false);
	const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const restoreFocus = useRef<HTMLElement | null>(null);

	const adminCount = authors.filter(author => author.role === "admin").length;
	const editorCount = authors.length - adminCount;

	function showToast(message: string, danger = false) {
		setToastMessage(message);
		setToastDanger(danger);
		setToastShown(true);
		if (toastTimer.current) {
			clearTimeout(toastTimer.current);
		}
		toastTimer.current = setTimeout(() => setToastShown(false), 2600);
	}

	function openAdd() {
		restoreFocus.current = document.activeElement as HTMLElement;
		setEditing(null);
		setFormOpen(true);
	}

	function openEdit(author: Author) {
		restoreFocus.current = document.activeElement as HTMLElement;
		setEditing(author);
		setFormOpen(true);
	}

	function closeForm() {
		setFormOpen(false);
		setEditing(null);
		restoreFocus.current?.focus();
	}

	function openDelete(author: Author) {
		restoreFocus.current = document.activeElement as HTMLElement;
		setDeleting(author);
	}

	function closeDelete() {
		setDeleting(null);
		restoreFocus.current?.focus();
	}

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setFormOpen(false);
				setEditing(null);
				setDeleting(null);
			}
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, []);

	useEffect(() => {
		return () => {
			if (toastTimer.current) {
				clearTimeout(toastTimer.current);
			}
		};
	}, []);

	return (
		<div className={styles.page}>
			<header className={styles.topbar}>
				<div>
					<h1 className={styles.title}>Authors</h1>
					<p className={styles.subtitle}>
						{authors.length} author{authors.length === 1 ? "" : "s"} · {adminCount}{" "}
						admin{adminCount === 1 ? "" : "s"}, {editorCount} editor
						{editorCount === 1 ? "" : "s"}
					</p>
				</div>
				<button
					type="button"
					className={`${styles.btn} ${styles.btnPrimary} ${styles.newBtn}`}
					onClick={openAdd}
				>
					<FontAwesomeIcon icon={faPlus} aria-hidden />
					Add author
				</button>
			</header>

			<AuthorsTable
				authors={authors}
				currentUserId={currentUserId}
				onEdit={openEdit}
				onDelete={openDelete}
			/>

			{formOpen && (
				<AuthorForm
					key={editing?.id ?? "new"}
					author={editing}
					onClose={closeForm}
					onSaved={message => {
						showToast(message);
						closeForm();
					}}
				/>
			)}

			{deleting && (
				<DeleteAuthorDialog
					author={deleting}
					onClose={closeDelete}
					onDeleted={message => {
						showToast(message, true);
						closeDelete();
					}}
				/>
			)}

			<div
				className={
					toastShown
						? `${styles.toast} ${styles.toastShown}${toastDanger ? ` ${styles.toastDangerVariant}` : ""}`
						: `${styles.toast}${toastDanger ? ` ${styles.toastDangerVariant}` : ""}`
				}
				role="status"
				aria-live="polite"
			>
				<span className={styles.toastMark} aria-hidden>
					<FontAwesomeIcon icon={faCheck} />
				</span>
				<span>{toastMessage}</span>
			</div>
		</div>
	);
}
