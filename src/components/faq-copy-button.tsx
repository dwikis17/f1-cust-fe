"use client";

import { useEffect, useRef, useState } from "react";

export function FaqCopyButton({ answer, copyLabel, copiedLabel }: { answer: string; copyLabel: string; copiedLabel: string }) {
	const [copied, setCopied] = useState(false);
	const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => () => {
		if (resetTimer.current) clearTimeout(resetTimer.current);
	}, []);

	async function copyAnswer() {
		try {
			await navigator.clipboard.writeText(answer);
			setCopied(true);
			if (resetTimer.current) clearTimeout(resetTimer.current);
			resetTimer.current = setTimeout(() => setCopied(false), 1800);
		} catch {
			setCopied(false);
		}
	}

	return (
		<button className={`faq-copy-button${copied ? " is-copied" : ""}`} type="button" onClick={copyAnswer}>
			<span className="faq-copy-icon" aria-hidden="true">
				{copied ? <svg viewBox="0 0 16 16"><path d="m3 8.5 3 3 7-7" /></svg> : <svg viewBox="0 0 16 16"><rect x="5" y="3" width="8" height="9" /><path d="M3 6v7h7" /></svg>}
			</span>
			<span aria-live="polite">{copied ? copiedLabel : copyLabel}</span>
		</button>
	);
}
