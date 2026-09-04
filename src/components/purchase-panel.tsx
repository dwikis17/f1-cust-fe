"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { useDictionary, useLocale } from "@/components/i18n-provider";
import { useProductSelection } from "@/components/product-selection";
import type { CartItemsResponse } from "@/lib/cart-catalog";
import { maxPurchasableQuantity } from "@/lib/cart";
import { useCartStore } from "@/lib/cart-store";
import { productPhotoForColor, type ProductPhoto, type ProductVariant } from "@/lib/catalog";

type Props = { productId: string; productName: string; variants: ProductVariant[]; photos: ProductPhoto[] };

export function PurchasePanel({ productId, productName, variants, photos }: Props) {
	const messages = useDictionary();
	const locale = useLocale();
	const { selectColor, setSelectedStock } = useProductSelection();
	const addItem = useCartStore((state) => state.addItem);
	const cartItems = useCartStore((state) => state.items);
	const firstAvailable = variants.find((variant) => variant.available) ?? variants[0];
	const [variantId, setVariantId] = useState(firstAvailable?.id ?? "");
	const [quantity, setQuantity] = useState(1);
	const [added, setAdded] = useState<{ key: number; quantity: number } | null>(null);
	const [inventory, setInventory] = useState<Record<string, number>>(() =>
		Object.fromEntries(variants.map((variant) => [variant.id, variant.stockQuantity])));
	const [unitsSold, setUnitsSold] = useState<Record<string, number>>({});
	const selected = variants.find((variant) => variant.id === variantId) ?? firstAvailable;
	const sizes = useMemo(() => [...new Set(variants.flatMap((variant) => variant.size ? [variant.size] : []))], [variants]);
	const colors = useMemo(() => [...new Set(variants.flatMap((variant) => variant.color ? [variant.color] : []))], [variants]);
	const stockFor = (variant: ProductVariant) => inventory[variant.id] ?? variant.stockQuantity;
	const selectedStock = selected ? stockFor(selected) : 0;
	const selectedUnitsSold = selected ? unitsSold[selected.id] ?? 0 : 0;
	const orderLimit = maxPurchasableQuantity(selectedStock);
	const cartQuantity = cartItems.find((item) => item.variantId === selected?.id)?.quantity ?? 0;
	const remaining = Math.max(0, orderLimit - cartQuantity);
	const selectedQuantity = Math.min(quantity, Math.max(1, remaining));

	useEffect(() => setSelectedStock(selectedStock), [selectedStock, setSelectedStock]);

	useEffect(() => {
		if (!added) return;
		const timeout = window.setTimeout(() => setAdded(null), 2200);
		return () => window.clearTimeout(timeout);
	}, [added]);

	useEffect(() => {
		const controller = new AbortController();
		const variantIds = variants.map((variant) => variant.id);
		const batches = Array.from({ length: Math.ceil(variantIds.length / 50) }, (_, index) =>
			variantIds.slice(index * 50, index * 50 + 50));
		void Promise.all(batches.map(async (ids) => {
			const response = await fetch("/api/cart-items", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ variantIds: ids, locale }),
				cache: "no-store",
				signal: controller.signal,
			});
			if (!response.ok) throw new Error("Inventory refresh failed");
			return response.json() as Promise<CartItemsResponse>;
		})).then((results) => {
			const fresh = new Map(results.flatMap((result) => result.data.map((item) => [item.variant.id, item.variant] as const)));
			setInventory(Object.fromEntries(variantIds.map((id) => [id, fresh.get(id)?.stockQuantity ?? 0])));
			setUnitsSold(Object.fromEntries(variantIds.map((id) => [id, fresh.get(id)?.unitsSold ?? 0])));
		}).catch((error) => {
			if ((error as Error).name !== "AbortError") return;
		});
		return () => controller.abort();
	}, [locale, variants]);

	function chooseOption(kind: "size" | "color", value: string) {
		const match = variants.find((variant) => variant[kind] === value && stockFor(variant) > 0 && (kind === "size" ? colors.length < 2 || variant.color === selected?.color : sizes.length < 2 || variant.size === selected?.size))
			?? variants.find((variant) => variant[kind] === value && stockFor(variant) > 0);
		if (match) {
			setVariantId(match.id);
			setQuantity(1);
			if (kind === "color") selectColor(match.color);
		}
	}

	function addToBag() {
		if (!selected || remaining < selectedQuantity) return;
		addItem({ productId, productName, variantId: selected.id, quantity: selectedQuantity }, orderLimit);
		setAdded((current) => ({ key: (current?.key ?? 0) + 1, quantity: selectedQuantity }));
	}

	return <>
		<div className="purchase-panel">
			{colors.length > 1 ? <ColorButtons label={messages.product.color} values={colors} selected={selected?.color} photos={photos} available={(value) => variants.some((variant) => variant.color === value && stockFor(variant) > 0)} choose={(value) => chooseOption("color", value)} /> : null}
			{sizes.length > 0 ? <OptionButtons label={messages.product.size} values={sizes} selected={selected?.size} available={(value) => variants.some((variant) => variant.size === value && stockFor(variant) > 0 && (colors.length < 2 || variant.color === selected?.color))} choose={(value) => chooseOption("size", value)} /> : null}
			<div className="purchase-row"><div className="quantity" aria-label={messages.product.quantitySelector}><button type="button" aria-label={`${messages.product.quantitySelector}: −`} disabled={selectedQuantity <= 1} onClick={() => setQuantity(Math.max(1, selectedQuantity - 1))}>−</button><span>{selectedQuantity}</span><button type="button" aria-label={`${messages.product.quantitySelector}: +`} disabled={remaining === 0 || selectedQuantity >= remaining} onClick={() => setQuantity(Math.min(remaining, selectedQuantity + 1))}>+</button></div><button className="button button-dark add-button" type="button" onClick={addToBag} disabled={!selectedStock || !remaining}>{selectedStock ? messages.product.addToCart : messages.product.outOfStock}</button>{added ? <span className="add-confirmation" key={added.key} role="status">✓ {added.quantity} {messages.product.addedToBag}</span> : null}</div>
			<p className="payment-note" aria-live="polite">{!selectedStock
				? messages.product.optionUnavailable
				: !remaining
					? messages.product.maximumInCart
					: `${selectedStock} ${messages.product.unitsAvailable}${selectedStock > 9 ? ` · ${messages.product.maximumPerOrder}` : ""}`}{selectedUnitsSold > 0 ? ` · ${selectedUnitsSold} ${messages.product.sold}` : ""}</p>
		</div>
		<section className="technical-data" aria-live="polite">
			<div><span>{messages.product.packageWeight}</span><strong>{selected ? `${selected.packageWeightG} ${messages.product.grams}` : "—"}</strong></div>
			<div><span>{messages.product.dimensions}</span><strong>{selected ? `${selected.packageLengthMm} × ${selected.packageWidthMm} × ${selected.packageHeightMm} mm` : "—"}</strong></div>
			<div><span>{messages.product.modelNumber}</span><strong>{selected?.sku ?? "—"}</strong></div>
			{selected?.size ? <div><span>{messages.product.size}</span><strong>{selected.size}</strong></div> : null}
			{colors.length > 1 && selected?.color ? <div><span>{messages.product.color}</span><strong>{selected.color}</strong></div> : null}
			<div><span>{messages.product.availability}</span><strong>{selectedStock ? `${selectedStock} ${messages.product.unitsAvailable}` : messages.product.outOfStock}</strong></div>
		</section>
	</>;
}

function ColorButtons({ label, values, selected, photos, available, choose }: { label: string; values: string[]; selected: string | null | undefined; photos: ProductPhoto[]; available: (value: string) => boolean; choose: (value: string) => void }) {
	return <fieldset className="variant-options color-options"><legend>{label}: <strong>{selected}</strong></legend><div>{values.map((value) => {
		const photo = productPhotoForColor(photos, value);
		return <button type="button" key={value} aria-label={`${label}: ${value}`} aria-pressed={selected === value} disabled={!available(value)} onClick={() => choose(value)}>{photo ? <Image src={photo.url} alt="" fill sizes="72px" /> : value}</button>;
	})}</div></fieldset>;
}

function OptionButtons({ label, values, selected, available, choose }: { label: string; values: string[]; selected: string | null | undefined; available: (value: string) => boolean; choose: (value: string) => void }) {
	return <fieldset className="variant-options"><legend>{label}</legend><div>{values.map((value) => <button type="button" key={value} aria-pressed={selected === value} disabled={!available(value)} onClick={() => choose(value)}>{value}</button>)}</div></fieldset>;
}
