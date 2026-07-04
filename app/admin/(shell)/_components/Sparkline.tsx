import type { MonthlyPoint } from "@/app/_lib/dashboard";
import styles from "./Sparkline.module.css";

const WIDTH = 240;
const HEIGHT = 64;
const PAD_Y = 6;

export function Sparkline({ points }: { points: MonthlyPoint[] }) {
	const max = Math.max(...points.map(point => point.count), 1);
	const stepX = WIDTH / Math.max(points.length - 1, 1);

	const coords = points.map((point, index) => ({
		x: index * stepX,
		y: HEIGHT - PAD_Y - (point.count / max) * (HEIGHT - PAD_Y * 2),
	}));

	const line = coords.map(c => `${c.x},${c.y}`).join(" L");
	const path = `M${line}`;
	const area = `${path} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;
	const last = coords[coords.length - 1];

	return (
		<div>
			<svg
				className={styles.chart}
				viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
				preserveAspectRatio="none"
				role="img"
				aria-label="Posts published per month over the last six months"
			>
				<path className={styles.area} d={area} />
				<path className={styles.line} d={path} />
				{last && <circle className={styles.dot} cx={last.x} cy={last.y} r="3.5" />}
			</svg>
			<div className={styles.labels}>
				{points.map(point => (
					<span key={point.label}>{point.label}</span>
				))}
			</div>
		</div>
	);
}
