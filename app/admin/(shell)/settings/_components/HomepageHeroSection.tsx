"use client";

import type { SiteSettings } from "@/app/_lib/settings";
import styles from "./settings.module.css";

export function HomepageHeroSection({
	values,
	onChange,
}: {
	values: SiteSettings;
	onChange: (key: keyof SiteSettings, value: string) => void;
}) {
	return (
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
						onChange={event => onChange("heroHeader", event.target.value)}
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
						onChange={event => onChange("heroHeadline", event.target.value)}
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
						onChange={event => onChange("heroDescription", event.target.value)}
						maxLength={180}
						rows={2}
					/>
				</div>
			</div>
		</section>
	);
}
