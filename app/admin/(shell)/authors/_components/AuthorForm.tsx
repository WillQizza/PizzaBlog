"use client";

import { useState, useTransition } from "react";
import type { Author } from "@/app/_lib/users";
import { createUser, updateUser, type AuthorInput } from "../actions";
import { fullName } from "./helpers";
import styles from "./authors.module.css";

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = { email?: string; password?: string; general?: string };

export function AuthorForm({
	author,
	onClose,
	onSaved,
}: {
	author: Author | null;
	onClose: () => void;
	onSaved: (message: string) => void;
}) {
	const editing = author;
	const [errors, setErrors] = useState<FieldErrors>({});
	const [pending, startTransition] = useTransition();

	function submitForm(formData: FormData) {
		const firstName = (formData.get("firstName") ?? "").toString().trim();
		const lastName = (formData.get("lastName") ?? "").toString().trim();
		const email = (formData.get("email") ?? "").toString().trim();
		const role = (formData.get("role") ?? "editor").toString();
		const password = (formData.get("password") ?? "").toString();

		const nextErrors: FieldErrors = {};
		if (!firstName) {
			nextErrors.general = "First name is required.";
		}
		if (!EMAIL_PATTERN.test(email)) {
			nextErrors.email = "Enter a valid email address.";
		}
		// Password is required for a new author, optional when editing.
		const passwordRequired = !editing || password.length > 0;
		if (passwordRequired && password.length < MIN_PASSWORD_LENGTH) {
			nextErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
		}
		if (nextErrors.email || nextErrors.password || nextErrors.general) {
			setErrors(nextErrors);
			return;
		}

		const input: AuthorInput = {
			firstName,
			lastName,
			email,
			role: role === "admin" ? "admin" : "editor",
			password,
		};

		const target = editing;
		startTransition(async () => {
			const result = target
				? await updateUser(target.id, input)
				: await createUser(input);
			if ("ok" in result) {
				onSaved(target ? "Author updated" : "Author added");
			} else if (result.field) {
				setErrors({ [result.field]: result.error });
			} else {
				setErrors({ general: result.error });
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
				className={styles.modal}
				role="dialog"
				aria-modal="true"
				aria-labelledby="userFormTitle"
			>
				<form
					onSubmit={event => {
						event.preventDefault();
						submitForm(new FormData(event.currentTarget));
					}}
					noValidate
				>
					<div className={styles.modalHead}>
						<h2 className={styles.modalTitle} id="userFormTitle">
							{editing ? "Edit author" : "Add author"}
						</h2>
						<p className={styles.modalSub}>
							{editing
								? `Update ${fullName(editing)}'s details and role.`
								: "Invite a new writer to the blog."}
						</p>
					</div>

					<div className={styles.modalBody}>
						<div className={styles.row2}>
							<div className={styles.field}>
								<label className={styles.label} htmlFor="firstName">
									First name
								</label>
								<input
									id="firstName"
									name="firstName"
									type="text"
									className={styles.control}
									defaultValue={editing?.firstName ?? ""}
									maxLength={40}
									autoFocus
								/>
							</div>
							<div className={styles.field}>
								<label className={styles.label} htmlFor="lastName">
									Last name
								</label>
								<input
									id="lastName"
									name="lastName"
									type="text"
									className={styles.control}
									defaultValue={editing?.lastName ?? ""}
									maxLength={40}
								/>
							</div>
						</div>

						<div
							className={
								errors.email
									? `${styles.field} ${styles.fieldError}`
									: styles.field
							}
						>
							<label className={styles.label} htmlFor="email">
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								className={styles.control}
								defaultValue={editing?.email ?? ""}
								autoComplete="off"
							/>
							{errors.email && (
								<p className={styles.errText}>{errors.email}</p>
							)}
						</div>

						<div className={styles.field}>
							<label className={styles.label} htmlFor="role">
								Role
							</label>
							<select
								id="role"
								name="role"
								className={styles.control}
								defaultValue={editing?.role ?? "editor"}
							>
								<option value="editor">
									Editor - writes and manages their own posts
								</option>
								<option value="admin">
									Admin - full access, including authors and settings
								</option>
							</select>
						</div>

						<div
							className={
								errors.password
									? `${styles.field} ${styles.fieldError}`
									: styles.field
							}
						>
							<label className={styles.label} htmlFor="password">
								{editing ? "New password" : "Temporary password"}
							</label>
							<input
								id="password"
								name="password"
								type="password"
								className={styles.control}
								autoComplete="new-password"
							/>
							{errors.password ? (
								<p className={styles.errText}>{errors.password}</p>
							) : (
								<p className={styles.hint}>
									{editing
										? "Leave blank to keep their current password."
										: `At least ${MIN_PASSWORD_LENGTH} characters. They can change it after signing in.`}
								</p>
							)}
						</div>

						{errors.general && (
							<p className={styles.generalError} role="alert">
								{errors.general}
							</p>
						)}
					</div>

					<div className={styles.modalFoot}>
						<div className={styles.spacer} />
						<button
							type="button"
							className={`${styles.btn} ${styles.btnGhost}`}
							onClick={onClose}
						>
							Cancel
						</button>
						<button
							type="submit"
							className={`${styles.btn} ${styles.btnPrimary}`}
							disabled={pending}
						>
							{pending
								? "Saving..."
								: editing
									? "Save changes"
									: "Add author"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
