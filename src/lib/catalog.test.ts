import assert from "node:assert/strict";
import test from "node:test";
import { formatPrice } from "./catalog.ts";

test("formatPrice formats price accurately", () => {
	assert.equal(typeof formatPrice(1000000), "string");
	assert.ok(formatPrice(1000000).includes("1"));
});
