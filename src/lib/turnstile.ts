export type TurnstileOptions = {
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

export type TurnstileApi = {
	render: (container: HTMLElement, options: TurnstileOptions) => string;
	remove: (widgetId: string) => void;
};

declare global {
	interface Window {
		turnstile?: TurnstileApi;
	}
}

const scriptId = "cloudflare-turnstile";
const scriptUrl = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const scriptTimeoutMs = 10_000;
let loadPromise: Promise<TurnstileApi> | null = null;

export function loadTurnstileScript() {
	if (window.turnstile) return Promise.resolve(window.turnstile);
	if (loadPromise) return loadPromise;

	loadPromise = new Promise<TurnstileApi>((resolve, reject) => {
		const existing = document.getElementById(scriptId);
		if (existing) existing.remove();

		const script = document.createElement("script");
		let settled = false;
		script.id = scriptId;
		script.src = scriptUrl;
		script.async = true;
		script.onload = () => {
			if (window.turnstile) succeed(window.turnstile);
			else fail();
		};
		script.onerror = fail;
		const timeout = setTimeout(fail, scriptTimeoutMs);
		document.head.appendChild(script);

		function fail() {
			if (settled) return;
			settled = true;
			clearTimeout(timeout);
			script.remove();
			loadPromise = null;
			reject(new Error("Turnstile could not be loaded"));
		}

		function succeed(api: TurnstileApi) {
			if (settled) return;
			settled = true;
			clearTimeout(timeout);
			loadPromise = null;
			resolve(api);
		}
	});

	return loadPromise;
}
