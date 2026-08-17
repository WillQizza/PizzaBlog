"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { Crepe } from "@milkdown/crepe";
import { formatDateTimeInputValue } from "@/app/_lib/format";
import {
	createPostAction,
	updatePostAction,
	type PostActionState,
	type PublishMode,
} from "@/app/admin/(shell)/posts/actions";
import { MilkdownEditor } from "./MilkdownEditor";
import styles from "./PostEditor.module.css";

type PostEditorProps = {
	id?: number;
	title?: string;
	body?: string;
	publishAt?: Date | null;
};

type FieldErrors = {
	title?: string;
	body?: string;
	publishAt?: string;
	general?: string;
};

function initialMode(publishAt: Date | null | undefined): PublishMode {
	if (!publishAt) {
		return "draft";
	}
	return publishAt.getTime() <= Date.now() ? "now" : "schedule";
}

// Only a future publish time pre-fills the scheduler; a past/absent one leaves it blank.
function initialSchedule(publishAt: Date | null | undefined): string {
	if (publishAt && publishAt.getTime() > Date.now()) {
		return formatDateTimeInputValue(publishAt);
	}
	return "";
}

// Without an `id` there's no post to update, so we're creating a new one.
export function PostEditor({ id, title, body, publishAt }: PostEditorProps) {
	const isEdit = id !== undefined;

	const crepeRef = useRef<Crepe | null>(null);
	const titleRef = useRef<HTMLInputElement>(null);

	const [publishMode, setPublishMode] = useState<PublishMode>(initialMode(publishAt));
	const [scheduleValue, setScheduleValue] = useState(initialSchedule(publishAt));
	const [errors, setErrors] = useState<FieldErrors>({});
	const [pending, startTransition] = useTransition();

	function submit() {
		const nextTitle = titleRef.current?.value.trim() ?? "";
		const nextBody = crepeRef.current?.getMarkdown().trim() ?? "";

		// Input validation
		const nextErrors: FieldErrors = {};
		if (!nextTitle) {
			nextErrors.title = "Title is required.";
		}
		if (!nextBody) {
			nextErrors.body = "Write something before saving.";
		}

		if (publishMode === "schedule") {
			if (!scheduleValue) {
				nextErrors.publishAt = "Choose a date and time.";
			} else if (new Date(scheduleValue).getTime() <= Date.now()) {
				nextErrors.publishAt = "Schedule a time in the future.";
			}
		}
		if (nextErrors.title || nextErrors.body || nextErrors.publishAt) {
			setErrors(nextErrors);
			return;
		}

		const input = {
			title: nextTitle,
			body: nextBody,
			publishMode,
			publishAt: scheduleValue ? new Date(scheduleValue) : null,
		};

		startTransition(async () => {
			const result: PostActionState =
				id === undefined
					? await createPostAction(input)
					: await updatePostAction(id, input);

			// A successful save redirects server-side, so control only returns here
			// when the action reported an error.
			if ("error" in result) {
				if (result.field) {
					setErrors({ [result.field]: result.error });
				} else {
					setErrors({ general: result.error });
				}
			}
		});
	}

	return (
		<form
			className={styles.page}
			onSubmit={event => {
				event.preventDefault();
				submit();
			}}
		>
			<header className={styles.topbar}>
				<div>
					<h1 className={styles.title}>{isEdit ? "Edit post" : "New post"}</h1>
					<p className={styles.subtitle}>
						Write in Markdown - formatting renders as you type.
					</p>
				</div>
				<div className={styles.topActions}>
					<Link href="/admin/posts" className={`${styles.btn} ${styles.btnGhost}`}>
						Cancel
					</Link>
					<button
						type="submit"
						className={`${styles.btn} ${styles.btnPrimary}`}
						disabled={pending}
					>
						{pending ? "Saving..." : isEdit ? "Save changes" : "Publish"}
					</button>
				</div>
			</header>

			{errors.general && (
				<p className={styles.generalError} role="alert">
					{errors.general}
				</p>
			)}

			<div className={errors.title ? `${styles.field} ${styles.fieldError}` : styles.field}>
				<label className={styles.label} htmlFor="title">
					Title
				</label>
				<input
					id="title"
					name="title"
					type="text"
					ref={titleRef}
					className={styles.control}
					defaultValue={title ?? ""}
					placeholder="Give your post a title"
					maxLength={160}
					autoFocus
				/>
				{errors.title && <p className={styles.errText}>{errors.title}</p>}
			</div>

			<div className={errors.body ? `${styles.field} ${styles.fieldError}` : styles.field}>
				<label className={styles.label}>Body</label>
				<MilkdownEditor
					initialMarkdown={body ?? ""}
					onReady={crepe => {
						crepeRef.current = crepe;
					}}
				/>
				{errors.body && <p className={styles.errText}>{errors.body}</p>}
			</div>

			<fieldset className={styles.publish}>
				<legend className={styles.label}>Visibility</legend>
				<div className={styles.radios}>
					<label className={styles.radio}>
						<input
							type="radio"
							name="publishMode"
							checked={publishMode === "draft"}
							onChange={() => setPublishMode("draft")}
						/>
						<span>
							<span className={styles.radioTitle}>Draft</span>
							<span className={styles.radioHint}>Only you can see it.</span>
						</span>
					</label>
					<label className={styles.radio}>
						<input
							type="radio"
							name="publishMode"
							checked={publishMode === "now"}
							onChange={() => setPublishMode("now")}
						/>
						<span>
							<span className={styles.radioTitle}>Publish now</span>
							<span className={styles.radioHint}>Live on the blog immediately.</span>
						</span>
					</label>
					<label className={styles.radio}>
						<input
							type="radio"
							name="publishMode"
							checked={publishMode === "schedule"}
							onChange={() => setPublishMode("schedule")}
						/>
						<span>
							<span className={styles.radioTitle}>Schedule</span>
							<span className={styles.radioHint}>Go live at a set time.</span>
						</span>
					</label>
				</div>

				{publishMode === "schedule" && (
					<div
						className={
							errors.publishAt
								? `${styles.field} ${styles.fieldError} ${styles.scheduleField}`
								: `${styles.field} ${styles.scheduleField}`
						}
					>
						<label className={styles.label} htmlFor="publishAt">
							Publish date and time
						</label>
						<input
							id="publishAt"
							type="datetime-local"
							className={styles.control}
							value={scheduleValue}
							onChange={event => setScheduleValue(event.target.value)}
						/>
						{errors.publishAt && (
							<p className={styles.errText}>{errors.publishAt}</p>
						)}
					</div>
				)}
			</fieldset>
		</form>
	);
}
