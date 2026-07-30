import assert from "node:assert/strict";
import test from "node:test";
import { addStoredCartItem, CART_STORAGE_KEY, cartSubtotal, maxPurchasableQuantity, parseStoredCart, reconcileStoredCart, resolveCartLines, type StoredCartItem } from "./cart.ts";
import { useCartStore } from "./cart-store.ts";
import type { CartItemProduct } from "./cart-catalog.ts";

const item: StoredCartItem = { productId: "product-1", productName: "Helmet", variantId: "variant-1", quantity: 2 };
const product = {
	product: { id: "product-1", name: "Helmet", slug: "helmet", priceIdr: 1_250_000, merchandisingLabel: "Helmets", photo: null },
	variant: { id: "variant-1", sku: "HELMET-1", size: null, color: null, stockQuantity: 3, available: true },
} satisfies CartItemProduct;

test("cart storage rejects malformed data and resolves authoritative product totals", () => {
	assert.deepEqual(parseStoredCart("not-json"), []);
	assert.deepEqual(parseStoredCart(JSON.stringify([item, { ...item, quantity: 0 }, { productId: 3 }])), [item]);

	const lines = resolveCartLines([item, { ...item, productId: "missing" }], [product]);
	assert.equal(lines.length, 1);
	assert.equal(cartSubtotal(lines), 2_500_000);
	assert.equal(addStoredCartItem([item], { ...item, quantity: 8 })[0].quantity, 9);
	assert.equal(addStoredCartItem([item], { ...item, quantity: 8 }, 3)[0].quantity, 3);
	assert.equal(maxPurchasableQuantity(30), 9);
	assert.deepEqual(reconcileStoredCart([{ ...item, quantity: 5 }], [product]), {
		items: [{ ...item, quantity: 3 }],
		stockAdjusted: true,
	});
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

		useCartStore.getState().addItem({ ...item, quantity: 8 }, 3);
		assert.deepEqual(JSON.parse(values.get(CART_STORAGE_KEY) ?? ""), [{ ...item, quantity: 3 }]);

		useCartStore.getState().setQuantity(item.variantId, 0);
		assert.equal(useCartStore.getState().items[0].quantity, 1);
		useCartStore.getState().setQuantity(item.variantId, 5);
		assert.equal(useCartStore.getState().reconcile([product]), true);
		assert.equal(useCartStore.getState().items[0].quantity, 3);

		useCartStore.getState().addItem({ ...item, productId: "missing", variantId: "missing" });
		useCartStore.getState().reconcile([product]);
		assert.deepEqual(useCartStore.getState().items, [{ ...item, quantity: 3 }]);

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
