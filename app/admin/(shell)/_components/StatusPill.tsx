import type { PostState } from "@/app/_lib/posts";
import styles from "./StatusPill.module.css";

const LABELS: Record<PostState, string> = {
	published: "Published",
	draft: "Draft",
	scheduled: "Scheduled",
};

export function StatusPill({ state }: { state: PostState }) {
	return <span className={`${styles.pill} ${styles[state]}`}>{LABELS[state]}</span>;
}
