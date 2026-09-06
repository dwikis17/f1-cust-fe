"use client";

import { useEffect, useRef } from "react";
import { loadTurnstileScript } from "@/lib/turnstile";

export function TurnstileWidget({ siteKey, action, language, resetKey, onToken, onError }: {
	siteKey: string;
	action: "shipping-rates" | "checkout";
	language: "en" | "id";
	resetKey: number;
	onToken: (token: string) => void;
	onError: () => void;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const onTokenRef = useRef(onToken);
	const onErrorRef = useRef(onError);

	useEffect(() => {
		onTokenRef.current = onToken;
		onErrorRef.current = onError;
	}, [onError, onToken]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		let active = true;
		let widgetId: string | undefined;
		const fail = () => {
			if (!active) return;
			onTokenRef.current("");
			onErrorRef.current();
		};

		loadTurnstileScript().then((turnstile) => {
			if (!active) return;
			widgetId = turnstile.render(container, {
				sitekey: siteKey,
				action,
				appearance: "interaction-only",
				size: "flexible",
				language,
				"refresh-expired": "auto",
				callback: (token) => active && onTokenRef.current(token),
				"error-callback": fail,
				"expired-callback": () => active && onTokenRef.current(""),
				"timeout-callback": fail,
				"unsupported-callback": fail,
			});
		}).catch(fail);

		return () => {
			active = false;
			if (widgetId) window.turnstile?.remove(widgetId);
		};
	}, [action, language, resetKey, siteKey]);

	return <div className="turnstile-check" ref={containerRef} />;
}
