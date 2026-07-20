import assert from "node:assert/strict";
import test from "node:test";
import { parseRevalidationTags } from "./revalidation.ts";

test("revalidation accepts known tags, deduplicates them, and rejects arbitrary input", () => {
	assert.deepEqual(parseRevalidationTags(["catalog:products", "catalog:product:ferrari-shirt", "catalog:products"]), [
		"catalog:products",
		"catalog:product:ferrari-shirt",
	]);
	assert.equal(parseRevalidationTags([]), null);
	assert.equal(parseRevalidationTags(["orders:all"]), null);
	assert.equal(parseRevalidationTags(Array.from({ length: 101 }, (_, index) => `catalog:product:item-${index}`)), null);
});
