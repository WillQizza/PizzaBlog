"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { SiteSettings } from "@/app/_lib/settings";
import { updateSettings } from "./actions";
import styles from "./settings.module.css";

const DESCRIPTION_SOFT_LIMIT = 160;

type SettingKey = keyof SiteSettings;

export function SettingsForm({ settings }: { settings: SiteSettings }) {
	const [values, setValues] = useState<SiteSettings>(settings);
	const [baseline, setBaseline] = useState<SiteSettings>(settings);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);
	const [pending, startTransition] = useTransition();
	const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const keys = Object.keys(values) as SettingKey[];
	const dirty = keys.some(key => values[key] !== baseline[key]);

	function update(key: SettingKey, value: string) {
		setValues(prev => ({ ...prev, [key]: value }));
	}

	function flashSaved() {
		setSaved(true);
		if (toastTimer.current) {
			clearTimeout(toastTimer.current);
		}
		toastTimer.current = setTimeout(() => setSaved(false), 2400);
	}

	function save(formData: FormData) {
		startTransition(async () => {
			const result = await updateSettings(undefined, formData);
			if (result && "ok" in result) {
				// Adopt the server's (trimmed) values so the form settles clean.
				setValues(result.settings);
				setBaseline(result.settings);
				setError(null);
				flashSaved();
			} else if (result && "error" in result) {
				setError(result.error);
			}
		});
	}

	useEffect(() => {
		return () => {
			if (toastTimer.current) {
				clearTimeout(toastTimer.current);
			}
		};
	}, []);

	const descriptionLength = values.description.length;

	return (
		<form
			onSubmit={event => {
				event.preventDefault();
				save(new FormData(event.currentTarget));
			}}
			className={styles.page}
		>
			<header className={styles.topbar}>
				<div>
					<h1 className={styles.title}>Site settings</h1>
					<p className={styles.subtitle}>
						Names, descriptions, and the homepage hero - everything a reader
						sees first.
					</p>
				</div>
			</header>

			{error && (
				<p role="alert" className={styles.error}>
					{error}
				</p>
			)}

			<section className={styles.section}>
				<div className={styles.sectionHead}>
					<span className={styles.kicker}>Identity</span>
					<h2 className={styles.sectionTitle}>Site identity</h2>
					<p className={styles.sectionDesc}>
						The name and tagline used in the header, browser tabs, and search
						results.
					</p>
				</div>
				<div className={styles.fields}>
					<div className={styles.field}>
						<label className={styles.label} htmlFor="siteName">
							Site name
						</label>
						<input
							id="siteName"
							name="siteName"
							type="text"
							className={styles.control}
							value={values.siteName}
							onChange={event => update("siteName", event.target.value)}
							maxLength={40}
							required
						/>
						<p className={styles.hint}>
							Also becomes the logo. The first letter forms the monogram mark.
						</p>
					</div>

					<div className={styles.field}>
						<div className={styles.labelRow}>
							<label className={styles.label} htmlFor="description">
								Description
							</label>
							<span
								className={
									descriptionLength > DESCRIPTION_SOFT_LIMIT
										? `${styles.counter} ${styles.counterOver}`
										: styles.counter
								}
							>
								{descriptionLength} / {DESCRIPTION_SOFT_LIMIT}
							</span>
						</div>
						<textarea
							id="description"
							name="description"
							className={styles.control}
							value={values.description}
							onChange={event => update("description", event.target.value)}
							maxLength={240}
							rows={2}
						/>
						<p className={styles.hint}>
							Used as the default meta description and social share text. Aim for
							under {DESCRIPTION_SOFT_LIMIT} characters.
						</p>
					</div>
				</div>
			</section>

			<section className={styles.section}>
				<div className={styles.sectionHead}>
					<span className={styles.kicker}>Homepage</span>
					<h2 className={styles.sectionTitle}>Homepage hero</h2>
					<p className={styles.sectionDesc}>
						The masthead at the top of your public homepage.
					</p>
				</div>
				<div className={styles.fields}>
					<div className={styles.field}>
						<label className={styles.label} htmlFor="heroHeader">
							Byline
						</label>
						<input
							id="heroHeader"
							name="heroHeader"
							type="text"
							className={styles.control}
							value={values.heroHeader}
							onChange={event => update("heroHeader", event.target.value)}
							maxLength={40}
						/>
						<p className={styles.hint}>
							The small eyebrow above the headline - usually the author or brand.
						</p>
					</div>

					<div className={styles.field}>
						<label className={styles.label} htmlFor="heroHeadline">
							Headline
						</label>
						<input
							id="heroHeadline"
							name="heroHeadline"
							type="text"
							className={styles.control}
							value={values.heroHeadline}
							onChange={event => update("heroHeadline", event.target.value)}
							maxLength={80}
						/>
					</div>

					<div className={styles.field}>
						<label className={styles.label} htmlFor="heroDescription">
							Intro
						</label>
						<textarea
							id="heroDescription"
							name="heroDescription"
							className={styles.control}
							value={values.heroDescription}
							onChange={event => update("heroDescription", event.target.value)}
							maxLength={180}
							rows={2}
						/>
					</div>
				</div>
			</section>

			<div className={styles.formActions}>
				<button
					type="submit"
					className={styles.save}
					disabled={!dirty || pending}
				>
					{pending ? "Saving..." : "Save changes"}
				</button>
			</div>

			<div
				className={saved ? `${styles.toast} ${styles.toastShow}` : styles.toast}
				role="status"
				aria-live="polite"
			>
				<span className={styles.checkCircle} aria-hidden>
					<svg
						viewBox="0 0 20 20"
						fill="none"
						stroke="currentColor"
						strokeWidth={3}
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M4 10.5 8 14.5 16 5.5" />
					</svg>
				</span>
				<span>Saved</span>
			</div>
		</form>
	);
}
