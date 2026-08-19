import assert from "node:assert/strict";
import test from "node:test";

process.env.API_BASE_URL = "https://api.valydejersey.com";

const { catalog } = await import("./catalog.ts");
const { listFaqs } = await import("./faqs.ts");

type TaggedRequestInit = RequestInit & { next?: { tags?: string[]; revalidate?: number } };

test("cache-safe storefront reads use persistent tagged cache", async () => {
	const originalFetch = globalThis.fetch;
	const calls: Array<{ url: string; init: TaggedRequestInit }> = [];
	globalThis.fetch = async (input, init = {}) => {
		calls.push({ url: String(input), init: init as TaggedRequestInit });
		return Response.json({});
	};

	try {
		await catalog.listProducts({ page: 1 }, "en");
		await catalog.getProduct("ferrari-shirt", "id");
		await catalog.listCollections("id");
		await catalog.listCollectionProducts("ferrari", { page: 1 }, "id");
		await catalog.getHomeHeroes("en");
		await listFaqs("id");
	} finally {
		globalThis.fetch = originalFetch;
	}

	assert.deepEqual(calls.map(({ url, init }) => ({
		url,
		cache: init.cache,
		tags: init.next?.tags,
		revalidate: init.next?.revalidate,
	})), [
		{
			url: "https://api.valydejersey.com/api/products?page=1&locale=en",
			cache: "force-cache",
			tags: ["catalog:products"],
			revalidate: 300,
		},
		{
			url: "https://api.valydejersey.com/api/products/ferrari-shirt?locale=id",
			cache: "force-cache",
			tags: ["catalog:products", "catalog:product:ferrari-shirt"],
			revalidate: 300,
		},
		{
			url: "https://api.valydejersey.com/api/collections?locale=id",
			cache: "force-cache",
			tags: ["catalog:collections"],
			revalidate: 300,
		},
		{
			url: "https://api.valydejersey.com/api/collections/ferrari/products?page=1&locale=id",
			cache: "force-cache",
			tags: ["catalog:products", "catalog:collections", "catalog:collection:ferrari"],
			revalidate: 300,
		},
		{
			url: "https://api.valydejersey.com/api/home?locale=en",
			cache: "force-cache",
			tags: ["content:home"],
			revalidate: 300,
		},
		{
			url: "https://api.valydejersey.com/api/faqs?locale=id",
			cache: "force-cache",
			tags: ["content:faqs:id"],
			revalidate: undefined,
		},
	]);
});
