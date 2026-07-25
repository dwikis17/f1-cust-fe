"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileOptions = {
	sitekey: string;
	action: string;
	appearance: "interaction-only";
	size: "flexible";
	language: string;
	"refresh-expired": "auto";
	callback: (token: string) => void;
	"error-callback": () => void;
	"expired-callback": () => void;
	"timeout-callback": () => void;
	"unsupported-callback": () => void;
};

declare global {
	interface Window {
		turnstile?: {
			render: (container: HTMLElement, options: TurnstileOptions) => string;
			remove: (widgetId: string) => void;
		};
	}
}

export function TurnstileWidget({ siteKey, language, resetKey, onToken, onError }: {
	siteKey: string;
	language: "en" | "id";
	resetKey: number;
	onToken: (token: string) => void;
	onError: () => void;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const onTokenRef = useRef(onToken);
	const onErrorRef = useRef(onError);
	const [ready, setReady] = useState(false);

	useEffect(() => {
		onTokenRef.current = onToken;
		onErrorRef.current = onError;
	}, [onError, onToken]);

	useEffect(() => {
		if (!ready || !containerRef.current || !window.turnstile) return;
		const fail = () => {
			onTokenRef.current("");
			onErrorRef.current();
		};
		const widgetId = window.turnstile.render(containerRef.current, {
			sitekey: siteKey,
			action: "checkout",
			appearance: "interaction-only",
			size: "flexible",
			language,
			"refresh-expired": "auto",
			callback: (token) => onTokenRef.current(token),
			"error-callback": fail,
			"expired-callback": () => onTokenRef.current(""),
			"timeout-callback": fail,
			"unsupported-callback": fail,
		});
		return () => window.turnstile?.remove(widgetId);
	}, [language, ready, resetKey, siteKey]);

	return <>
		<Script
			id="cloudflare-turnstile"
			src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
			strategy="afterInteractive"
			onReady={() => setReady(true)}
			onError={() => onErrorRef.current()}
		/>
		<div className="turnstile-check" ref={containerRef} />
	</>;
}
