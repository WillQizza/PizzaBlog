"use client";

import { useEffect, useRef } from "react";
import { Crepe } from "@milkdown/crepe";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";
import styles from "./MilkdownEditor.module.css";

export function MilkdownEditor({
	initialMarkdown,
	onReady,
}: {
	initialMarkdown: string;
	onReady: (crepe: Crepe) => void;
}) {
	const hostRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const host = hostRef.current;
		if (!host) {
			return;
		}

		const crepe = new Crepe({ root: host, defaultValue: initialMarkdown });
		let destroyed = false;

		crepe.create().then(() => {
			if (!destroyed) {
				onReady(crepe);
			}
		});

		return () => {
			destroyed = true;
			crepe.destroy();
		};
	}, []);

	return <div ref={hostRef} className={styles.editor} />;
}
