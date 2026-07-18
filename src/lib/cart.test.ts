import assert from "node:assert/strict";
import test from "node:test";
import { addStoredCartItem, CART_STORAGE_KEY, cartSubtotal, parseStoredCart, resolveCartLines, type StoredCartItem } from "./cart.ts";
import { useCartStore } from "./cart-store.ts";
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

test("cart store preserves the legacy array format and reconciles invalid items", () => {
	const values = new Map<string, string>();
	const localStorage = {
		getItem: (key: string) => values.get(key) ?? null,
		setItem: (key: string, value: string) => values.set(key, value),
	};
	const previousWindow = globalThis.window;
	Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage } });
	useCartStore.setState({ items: [], hydrated: false });

	try {
		values.set(CART_STORAGE_KEY, JSON.stringify([item, { ...item, quantity: 0 }]));
		useCartStore.getState().hydrate();
		assert.deepEqual(useCartStore.getState().items, [item]);

		useCartStore.getState().addItem({ ...item, quantity: 8 });
		assert.deepEqual(JSON.parse(values.get(CART_STORAGE_KEY) ?? ""), [{ ...item, quantity: 9 }]);

		useCartStore.getState().setQuantity(item.variantId, 0);
		assert.equal(useCartStore.getState().items[0].quantity, 1);

		useCartStore.getState().addItem({ ...item, productId: "missing", variantId: "missing" });
		useCartStore.getState().reconcile([product]);
		assert.deepEqual(useCartStore.getState().items, [{ ...item, quantity: 1 }]);

		useCartStore.getState().removeItem(item.variantId);
		assert.deepEqual(useCartStore.getState().items, []);
		useCartStore.getState().addItem(item);
		useCartStore.getState().clear();
		assert.equal(values.get(CART_STORAGE_KEY), "[]");
	} finally {
		useCartStore.setState({ items: [], hydrated: false });
		if (previousWindow === undefined) delete (globalThis as { window?: Window }).window;
		else Object.defineProperty(globalThis, "window", { configurable: true, value: previousWindow });
	}
});
