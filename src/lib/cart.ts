import type { ProductVariant, PublicProduct } from "./mock";

export const CART_STORAGE_KEY = "valdye-cart";

export type StoredCartItem = {
	productId: string;
	productName: string;
	variantId: string;
	quantity: number;
};

export type CartLine = StoredCartItem & {
	index: number;
	product: PublicProduct;
	variant: ProductVariant;
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

export function addStoredCartItem(items: StoredCartItem[], item: StoredCartItem): StoredCartItem[] {
	const index = items.findIndex((candidate) => candidate.variantId === item.variantId);
	if (index === -1) return [...items, item];
	return items.map((candidate, candidateIndex) => candidateIndex === index
		? { ...candidate, quantity: Math.min(9, candidate.quantity + item.quantity) }
		: candidate);
}

export function resolveCartLines(items: StoredCartItem[], products: PublicProduct[]): CartLine[] {
	return items.flatMap((item, index) => {
		const product = products.find((candidate) => candidate.id === item.productId);
		const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
		return product && variant ? [{ ...item, index, product, variant }] : [];
	});
}

export function cartSubtotal(lines: Array<Pick<CartLine, "product" | "quantity">>): number {
	return lines.reduce((sum, line) => sum + line.product.priceIdr * line.quantity, 0);
}
