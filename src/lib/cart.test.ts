import assert from "node:assert/strict";
import test from "node:test";
import { addStoredCartItem, cartSubtotal, parseStoredCart, resolveCartLines, type StoredCartItem } from "./cart.ts";
import type { PublicProduct } from "./mock.ts";

const item: StoredCartItem = { productId: "product-1", productName: "Helmet", variantId: "variant-1", quantity: 2 };
const product = {
	id: "product-1",
	priceIdr: 1_250_000,
	variants: [{ id: "variant-1", available: true }],
} as PublicProduct;

test("cart storage rejects malformed data and resolves authoritative product totals", () => {
	assert.deepEqual(parseStoredCart("not-json"), []);
	assert.deepEqual(parseStoredCart(JSON.stringify([item, { ...item, quantity: 0 }, { productId: 3 }])), [item]);

	const lines = resolveCartLines([item, { ...item, productId: "missing" }], [product]);
	assert.equal(lines.length, 1);
	assert.equal(cartSubtotal(lines), 2_500_000);
	assert.equal(addStoredCartItem([item], { ...item, quantity: 8 })[0].quantity, 9);
});
