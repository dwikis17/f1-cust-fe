import type { CartItemProduct } from "./cart-catalog";

export const CART_STORAGE_KEY = "valyde-cart";

export type StoredCartItem = {
	productId: string;
	productName: string;
	variantId: string;
	quantity: number;
};

export type CartLine = StoredCartItem & {
	index: number;
	product: CartItemProduct["product"];
	variant: CartItemProduct["variant"];
};

type CartStorage = Pick<Storage, "getItem" | "setItem">;

function isStoredCartItem(value: unknown): value is StoredCartItem {
	if (!value || typeof value !== "object") return false;
	const item = value as Record<string, unknown>;
	return typeof item.productId === "string"
		&& typeof item.productName === "string"
		&& typeof item.variantId === "string"
		&& Number.isInteger(item.quantity)
		&& Number(item.quantity) >= 1
		&& Number(item.quantity) <= 9;
}

export function parseStoredCart(value: string | null): StoredCartItem[] {
	if (!value) return [];
	try {
		const parsed: unknown = JSON.parse(value);
		return Array.isArray(parsed) ? parsed.filter(isStoredCartItem) : [];
	} catch {
		return [];
	}
}

export function readStoredCart(storage: CartStorage): StoredCartItem[] {
	return parseStoredCart(storage.getItem(CART_STORAGE_KEY));
}

export function writeStoredCart(storage: CartStorage, items: StoredCartItem[]) {
	storage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function maxPurchasableQuantity(stockQuantity: number) {
	return Math.min(9, Math.max(0, stockQuantity));
}

export function addStoredCartItem(items: StoredCartItem[], item: StoredCartItem, maximum = 9): StoredCartItem[] {
	const limit = Math.min(9, Math.max(0, maximum));
	if (!limit) return items;
	const index = items.findIndex((candidate) => candidate.variantId === item.variantId);
	if (index === -1) return [...items, { ...item, quantity: Math.min(item.quantity, limit) }];
	return items.map((candidate, candidateIndex) => candidateIndex === index
		? { ...candidate, quantity: Math.min(limit, candidate.quantity + item.quantity) }
		: candidate);
}

export function reconcileStoredCart(items: StoredCartItem[], products: CartItemProduct[]) {
	const byVariant = new Map(products.map((product) => [product.variant.id, product]));
	let stockAdjusted = false;
	const reconciled = items.flatMap((item) => {
		const product = byVariant.get(item.variantId);
		if (!product || product.product.id !== item.productId) return [];
		const maximum = maxPurchasableQuantity(product.variant.stockQuantity);
		if (maximum > 0 && item.quantity > maximum) {
			stockAdjusted = true;
			return [{ ...item, quantity: maximum }];
		}
		return [item];
	});
	return { items: reconciled, stockAdjusted };
}

export function resolveCartLines(items: StoredCartItem[], products: CartItemProduct[]): CartLine[] {
	return items.flatMap((item, index) => {
		const value = products.find((candidate) => candidate.product.id === item.productId && candidate.variant.id === item.variantId);
		return value ? [{ ...item, index, product: value.product, variant: value.variant }] : [];
	});
}

export function cartSubtotal(lines: Array<Pick<CartLine, "product" | "quantity">>): number {
	return lines.reduce((sum, line) => sum + line.product.priceIdr * line.quantity, 0);
}
