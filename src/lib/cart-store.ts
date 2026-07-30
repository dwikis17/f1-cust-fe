import { create } from "zustand";

import { addStoredCartItem, readStoredCart, reconcileStoredCart, type StoredCartItem, writeStoredCart } from "./cart.ts";
import type { CartItemProduct } from "./cart-catalog.ts";

type CartStore = {
	items: StoredCartItem[];
	hydrated: boolean;
	hydrate: () => void;
	addItem: (item: StoredCartItem, maximum?: number) => void;
	setQuantity: (variantId: string, quantity: number, maximum?: number) => void;
	removeItem: (variantId: string) => void;
	reconcile: (products: CartItemProduct[]) => boolean;
	clear: () => void;
};

function storage() {
	return typeof window === "undefined" ? undefined : window.localStorage;
}

export const useCartStore = create<CartStore>((set, get) => {
	function currentItems() {
		if (get().hydrated) return get().items;
		const cartStorage = storage();
		if (!cartStorage) return get().items;
		const items = readStoredCart(cartStorage);
		set({ items, hydrated: true });
		return items;
	}

	function persist(items: StoredCartItem[]) {
		const cartStorage = storage();
		if (cartStorage) writeStoredCart(cartStorage, items);
		set({ items, hydrated: Boolean(cartStorage) || get().hydrated });
	}

	return {
		items: [],
		hydrated: false,
		hydrate() {
			currentItems();
		},
		addItem(item, maximum = 9) {
			const items = currentItems();
			if (items.length >= 50 && !items.some((candidate) => candidate.variantId === item.variantId)) return;
			persist(addStoredCartItem(items, item, maximum));
		},
		setQuantity(variantId, quantity, maximum = 9) {
			persist(currentItems().map((item) => item.variantId === variantId
				? { ...item, quantity: Math.max(1, Math.min(maximum, 9, quantity)) }
				: item));
		},
		removeItem(variantId) {
			persist(currentItems().filter((item) => item.variantId !== variantId));
		},
		reconcile(products) {
			const items = currentItems();
			const result = reconcileStoredCart(items, products);
			if (result.items.some((item, index) => item !== items[index]) || result.items.length !== items.length) {
				persist(result.items);
			}
			return result.stockAdjusted;
		},
		clear() {
			persist([]);
		},
	};
});
