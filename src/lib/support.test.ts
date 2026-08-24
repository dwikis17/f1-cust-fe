import assert from "node:assert/strict";
import { test } from "node:test";

import { fallbackSupport, getShippingReturnsContent, getSupportContent } from "./support.ts";

test("managed support and localized policy fall back safely", async () => {
	const originalFetch = globalThis.fetch;
	const requests: Array<{ url: string; tags?: string[] }> = [];
	try {
		globalThis.fetch = async (input, init) => {
			requests.push({ url: String(input), tags: init?.next?.tags });
			if (String(input).includes("shipping-returns")) {
				return Response.json({
					title: "Pengiriman terkelola",
					intro: "Intro",
					facts: [{ id: "second", label: "Kedua", value: "2" }, { id: "first", label: "Pertama", value: "1" }],
					sections: [{ id: "returns", title: "Pengembalian", body: "Body", items: [] }],
					support: fallbackSupport,
				});
			}
			return Response.json({
				...fallbackSupport,
				email: "managed@example.com",
				mailtoUrl: "mailto:managed@example.com",
			});
		};

		const support = await getSupportContent();
		assert.equal(support.email, "managed@example.com");
		const policy = await getShippingReturnsContent("id");
		assert.equal(policy?.title, "Pengiriman terkelola");
		assert.deepEqual(policy?.facts.map(({ id }) => id), ["second", "first"]);
		assert.deepEqual(requests.map(({ tags }) => tags), [
			["content:support"],
			["content:shipping-returns:id"],
		]);

		globalThis.fetch = async () => { throw new Error("offline"); };
		assert.deepEqual(await getSupportContent(), fallbackSupport);
		assert.equal(await getShippingReturnsContent("en"), null);
	} finally {
		globalThis.fetch = originalFetch;
	}
});
