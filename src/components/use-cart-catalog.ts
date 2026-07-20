"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/components/i18n-provider";
import type { CartItemProduct, CartItemsResponse } from "@/lib/cart-catalog";
import { useCartStore } from "@/lib/cart-store";

export function useCartCatalog() {
	const locale = useLocale();
	const items = useCartStore((state) => state.items);
	const hydrated = useCartStore((state) => state.hydrated);
	const reconcile = useCartStore((state) => state.reconcile);
	const variantIds = useMemo(() => [...new Set(items.map((item) => item.variantId))], [items]);
	const requestKey = variantIds.join("|");
	const [attempt, setAttempt] = useState(0);
	const loadKey = `${locale}:${requestKey}:${attempt}`;
	const [result, setResult] = useState<{ key: string; products: CartItemProduct[]; error: boolean }>({ key: "", products: [], error: false });

	useEffect(() => {
		if (!hydrated) return;
		if (!requestKey) return;
		const controller = new AbortController();
		void fetch("/api/cart-items", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ variantIds, locale }),
			cache: "no-store",
			signal: controller.signal,
		}).then(async (response) => {
			if (!response.ok) throw new Error("Cart catalog request failed");
			const result = await response.json() as CartItemsResponse;
			setResult({ key: loadKey, products: result.data, error: false });
			reconcile(result.data);
		}).catch((requestError) => {
			if ((requestError as Error).name !== "AbortError") setResult({ key: loadKey, products: [], error: true });
		});
		return () => controller.abort();
	}, [hydrated, loadKey, locale, reconcile, requestKey, variantIds]);

	const retry = useCallback(() => setAttempt((value) => value + 1), []);
	const settled = result.key === loadKey;
	return {
		products: requestKey && settled ? result.products : [],
		error: Boolean(requestKey && settled && result.error),
		loading: !hydrated || Boolean(requestKey && !settled),
		retry,
	};
}
