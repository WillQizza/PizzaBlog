"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import type { SiteSettings } from "@/app/_lib/settings";
import { updateSettings } from "../actions";
import { HomepageHeroSection } from "./HomepageHeroSection";
import { SiteIdentitySection } from "./SiteIdentitySection";
import styles from "./settings.module.css";

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
			const result = await updateSettings(formData);
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

			<SiteIdentitySection values={values} onChange={update} />
			<HomepageHeroSection values={values} onChange={update} />

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
					<FontAwesomeIcon icon={faCheck} />
				</span>
				<span>Saved</span>
			</div>
		</form>
	);
}
