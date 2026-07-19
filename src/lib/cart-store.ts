import { create } from "zustand";

import { addStoredCartItem, readStoredCart, resolveCartLines, type StoredCartItem, writeStoredCart } from "./cart.ts";
import type { PublicProduct } from "./catalog.ts";

type CartStore = {
	items: StoredCartItem[];
	hydrated: boolean;
	hydrate: () => void;
	addItem: (item: StoredCartItem) => void;
	setQuantity: (variantId: string, quantity: number) => void;
	removeItem: (variantId: string) => void;
	reconcile: (products: PublicProduct[]) => void;
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
		addItem(item) {
			persist(addStoredCartItem(currentItems(), item));
		},
		setQuantity(variantId, quantity) {
			persist(currentItems().map((item) => item.variantId === variantId
				? { ...item, quantity: Math.max(1, Math.min(9, quantity)) }
				: item));
		},
		removeItem(variantId) {
			persist(currentItems().filter((item) => item.variantId !== variantId));
		},
		reconcile(products) {
			const items = currentItems();
			const validIndexes = new Set(resolveCartLines(items, products).map((line) => line.index));
			const valid = items.filter((_, index) => validIndexes.has(index));
			if (valid.length !== items.length) persist(valid);
		},
		clear() {
			persist([]);
		},
	};
});
