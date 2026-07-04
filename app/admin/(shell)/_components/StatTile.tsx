import styles from "./StatTile.module.css";

type StatTileProps = {
	label: string;
	value: number;
	delta?: string;
	deltaTone?: "good" | "muted";
};

export function StatTile({ label, value, delta, deltaTone = "muted" }: StatTileProps) {
	return (
		<div className={styles.tile}>
			<div className={styles.label}>{label}</div>
			<div className={styles.value}>{value}</div>
			{delta && (
				<div className={deltaTone === "good" ? styles.deltaGood : styles.delta}>
					{delta}
				</div>
			)}
		</div>
	);
}
