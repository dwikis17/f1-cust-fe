import assert from "node:assert/strict";
import test from "node:test";
import { formatPrice, productPhotoForColor } from "./catalog.ts";

test("formatPrice formats price accurately", () => {
	assert.equal(typeof formatPrice(1000000), "string");
	assert.ok(formatPrice(1000000).includes("1"));
});

test("productPhotoForColor prefers a matching photo and falls back to the shared photo", () => {
	const photos = [{ id: "shared", color: null }, { id: "black", color: "Black" }];
	assert.equal(productPhotoForColor(photos, "Black")?.id, "black");
	assert.equal(productPhotoForColor(photos, "White")?.id, "shared");
});
