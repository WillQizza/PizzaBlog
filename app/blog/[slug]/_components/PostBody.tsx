import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./PostBody.module.css";

// Specific behaviour for some HTML
const components: Components = {
	p({ node, children }) {
		const [only] = node?.children ?? [];
		const isLoneImage =
			node?.children.length === 1 && only?.type === "element" && only.tagName === "img";

		if (!isLoneImage) {
			return <p>{children}</p>;
		}

		// Images become figures
		const alt = (only.properties?.alt ?? "").toString();
		return (
			<figure className={styles.figure}>
				{children}
				{alt ? <figcaption>{alt}</figcaption> : null}
			</figure>
		);
	},
	table({ children }) {
		return (
			<div className={styles.tableScroll}>
				<table>{children}</table>
			</div>
		);
	},
};

export function PostBody({ markdown }: { markdown: string }) {
	return (
		<div className={styles.prose}>
			<Markdown remarkPlugins={[remarkGfm]} components={components}>
				{markdown}
			</Markdown>
		</div>
	);
}
