import assert from "node:assert/strict";
import test from "node:test";
import { formatPrice } from "./catalog.ts";

test("formatPrice formats nominal rupiah with commas as thousands separators", () => {
	assert.equal(formatPrice(1000000), "Rp 1,000,000");
	assert.equal(formatPrice(1250000), "Rp 1,250,000");
	assert.equal(formatPrice(50000), "Rp 50,000");
	assert.equal(formatPrice(0), "Rp 0");
});
