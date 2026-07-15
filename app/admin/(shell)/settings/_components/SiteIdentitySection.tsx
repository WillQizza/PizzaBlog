"use client";

import type { SiteSettings } from "@/app/_lib/settings";
import styles from "./settings.module.css";

const DESCRIPTION_SOFT_LIMIT = 160;

export function SiteIdentitySection({
	values,
	onChange,
}: {
	values: SiteSettings;
	onChange: (key: keyof SiteSettings, value: string) => void;
}) {
	const descriptionLength = values.description.length;

	return (
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
						onChange={event => onChange("siteName", event.target.value)}
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
						onChange={event => onChange("description", event.target.value)}
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
	);
}
