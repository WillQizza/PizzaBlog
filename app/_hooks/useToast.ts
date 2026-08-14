"use client";

import { useEffect, useRef, useState } from "react";

export type Toast = {
	message: string;
	danger: boolean;
	shown: boolean;
	show: (message: string, danger?: boolean) => void;
};

// A brief status toast that auto-hides.
export function useToast(durationMs = 2600): Toast {
	const [message, setMessage] = useState("");
	const [danger, setDanger] = useState(false);
	const [shown, setShown] = useState(false);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	function show(nextMessage: string, nextDanger = false) {
		setMessage(nextMessage);
		setDanger(nextDanger);
		setShown(true);
		if (timer.current) {
			clearTimeout(timer.current);
		}
		timer.current = setTimeout(() => setShown(false), durationMs);
	}

	useEffect(() => {
		return () => {
			if (timer.current) {
				clearTimeout(timer.current);
			}
		};
	}, []);

	return { message, danger, shown, show };
}
