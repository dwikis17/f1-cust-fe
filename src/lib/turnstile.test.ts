import assert from "node:assert/strict";
import test from "node:test";
import { loadTurnstileScript, type TurnstileApi } from "./turnstile.ts";

test("Turnstile shares an active load and can retry after failure", async () => {
	const originalWindow = globalThis.window;
	const originalDocument = globalThis.document;
	let currentScript: HTMLScriptElement | null = null;
	const scripts: HTMLScriptElement[] = [];

	globalThis.window = {} as Window & typeof globalThis;
	globalThis.document = {
		getElementById: () => currentScript,
		createElement: () => {
			const script = {
				remove: () => { if (currentScript === script) currentScript = null; },
			} as unknown as HTMLScriptElement;
			scripts.push(script);
			return script;
		},
		head: { appendChild: (script: HTMLScriptElement) => { currentScript = script; } },
	} as unknown as Document;

	try {
		const first = loadTurnstileScript();
		const duplicate = loadTurnstileScript();
		assert.equal(first, duplicate);
		assert.equal(scripts.length, 1);

		scripts[0].onerror?.(new Event("error"));
		await assert.rejects(first, /could not be loaded/);

		const retry = loadTurnstileScript();
		assert.equal(scripts.length, 2);
		const api = { render: () => "widget", remove: () => undefined } as TurnstileApi;
		window.turnstile = api;
		scripts[1].onload?.(new Event("load"));
		assert.equal(await retry, api);
	} finally {
		globalThis.window = originalWindow;
		globalThis.document = originalDocument;
	}
});

test("Turnstile rejects a script load that never settles", async () => {
	const originalWindow = globalThis.window;
	const originalDocument = globalThis.document;
	const originalSetTimeout = globalThis.setTimeout;
	const originalClearTimeout = globalThis.clearTimeout;
	let timeout: (() => void) | undefined;
	let removed = false;

	globalThis.window = {} as Window & typeof globalThis;
	globalThis.document = {
		getElementById: () => null,
		createElement: () => ({ remove: () => { removed = true; } }) as HTMLScriptElement,
		head: { appendChild: () => undefined },
	} as unknown as Document;
	globalThis.setTimeout = ((callback: TimerHandler) => {
		timeout = callback as () => void;
		return 1 as unknown as NodeJS.Timeout;
	}) as typeof setTimeout;
	globalThis.clearTimeout = (() => undefined) as typeof clearTimeout;

	try {
		const pending = loadTurnstileScript();
		timeout?.();
		await assert.rejects(pending, /could not be loaded/);
		assert.equal(removed, true);
	} finally {
		globalThis.window = originalWindow;
		globalThis.document = originalDocument;
		globalThis.setTimeout = originalSetTimeout;
		globalThis.clearTimeout = originalClearTimeout;
	}
});
