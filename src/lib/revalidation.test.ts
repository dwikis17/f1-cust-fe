import assert from "node:assert/strict";
import test from "node:test";
import { immediateRevalidation, parseRevalidationTags } from "./revalidation.ts";

test("revalidation accepts known tags, deduplicates them, and rejects arbitrary input", () => {
	assert.deepEqual(parseRevalidationTags(["catalog:products", "catalog:product:ferrari-shirt", "catalog:products"]), [
		"catalog:products",
		"catalog:product:ferrari-shirt",
	]);
	assert.deepEqual(parseRevalidationTags(["content:home"]), ["content:home"]);
	assert.deepEqual(parseRevalidationTags(["content:shipping-returns:en", "content:shipping-returns:id", "content:support"]), [
		"content:shipping-returns:en",
		"content:shipping-returns:id",
		"content:support",
	]);
	assert.equal(parseRevalidationTags([]), null);
	assert.equal(parseRevalidationTags(["orders:all"]), null);
	assert.equal(parseRevalidationTags(Array.from({ length: 101 }, (_, index) => `catalog:product:item-${index}`)), null);
	assert.deepEqual(immediateRevalidation, { expire: 0 });
});
