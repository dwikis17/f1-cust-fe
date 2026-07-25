"use client";

import { useEffect, useMemo, useState } from "react";

import { useDictionary } from "@/components/i18n-provider";
import { useCartStore } from "@/lib/cart-store";
import type { ProductVariant } from "@/lib/catalog";

type Props = { productId: string; productName: string; variants: ProductVariant[] };

export function PurchasePanel({ productId, productName, variants }: Props) {
	const messages = useDictionary();
	const addItem = useCartStore((state) => state.addItem);
	const firstAvailable = variants.find((variant) => variant.available) ?? variants[0];
	const [variantId, setVariantId] = useState(firstAvailable?.id ?? "");
	const [quantity, setQuantity] = useState(1);
	const [added, setAdded] = useState(0);
	const selected = variants.find((variant) => variant.id === variantId) ?? firstAvailable;
	const sizes = useMemo(() => [...new Set(variants.flatMap((variant) => variant.size ? [variant.size] : []))], [variants]);
	const colors = useMemo(() => [...new Set(variants.flatMap((variant) => variant.color ? [variant.color] : []))], [variants]);

	useEffect(() => {
		if (!added) return;
		const timeout = window.setTimeout(() => setAdded(0), 2200);
		return () => window.clearTimeout(timeout);
	}, [added]);

	function chooseOption(kind: "size" | "color", value: string) {
		const match = variants.find((variant) => variant[kind] === value && variant.available && (kind === "size" ? colors.length < 2 || variant.color === selected?.color : sizes.length < 2 || variant.size === selected?.size))
			?? variants.find((variant) => variant[kind] === value && variant.available);
		if (match) setVariantId(match.id);
	}

	function addToBag() {
		if (!selected?.available) return;
		addItem({ productId, productName, variantId: selected.id, quantity });
		setAdded((count) => count + 1);
	}

	return <>
		<div className="purchase-panel">
			{colors.length > 1 ? <OptionButtons label={messages.product.color} values={colors} selected={selected?.color} available={(value) => variants.some((variant) => variant.color === value && variant.available)} choose={(value) => chooseOption("color", value)} /> : null}
			{sizes.length > 0 ? <OptionButtons label={messages.product.size} values={sizes} selected={selected?.size} available={(value) => variants.some((variant) => variant.size === value && variant.available && (colors.length < 2 || variant.color === selected?.color))} choose={(value) => chooseOption("size", value)} /> : null}
			<div className="purchase-row"><div className="quantity" aria-label={messages.product.quantitySelector}><button type="button" aria-label={`${messages.product.quantitySelector}: −`} disabled={quantity <= 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><span>{quantity}</span><button type="button" aria-label={`${messages.product.quantitySelector}: +`} disabled={quantity >= 9} onClick={() => setQuantity((value) => Math.min(9, value + 1))}>+</button></div><button className="button button-dark add-button" type="button" onClick={addToBag} disabled={!selected?.available}>{selected?.available ? messages.product.addToCart : messages.product.outOfStock}</button>{added ? <span className="add-confirmation" key={added} role="status">✓ {quantity} {messages.product.addedToBag}</span> : null}</div>
			<p className="payment-note" aria-live="polite">{selected?.available ? messages.product.readyToDispatch : messages.product.optionUnavailable}</p>
		</div>
		<section className="technical-data" aria-live="polite">
			<div className="data-heading"><span>{messages.product.technicalData}</span><strong>{messages.product.selectedSpecification}</strong></div>
			<div><span>{messages.product.packageWeight}</span><strong>{selected ? `${selected.packageWeightG} ${messages.product.grams}` : "—"}</strong></div>
			<div><span>{messages.product.dimensions}</span><strong>{selected ? `${selected.packageLengthMm} × ${selected.packageWidthMm} × ${selected.packageHeightMm} mm` : "—"}</strong></div>
			<div><span>{messages.product.modelNumber}</span><strong>{selected?.sku ?? "—"}</strong></div>
			{selected?.size ? <div><span>{messages.product.size}</span><strong>{selected.size}</strong></div> : null}
			{colors.length > 1 && selected?.color ? <div><span>{messages.product.color}</span><strong>{selected.color}</strong></div> : null}
			<div><span>{messages.product.availability}</span><strong>{selected?.available ? messages.product.readyToDispatch : messages.product.outOfStock}</strong></div>
			<div><span>{messages.product.authenticity}</span><strong>{messages.product.verified}</strong></div>
		</section>
	</>;
}

function OptionButtons({ label, values, selected, available, choose }: { label: string; values: string[]; selected: string | null | undefined; available: (value: string) => boolean; choose: (value: string) => void }) {
	return <fieldset className="variant-options"><legend>{label}</legend><div>{values.map((value) => <button type="button" key={value} aria-pressed={selected === value} disabled={!available(value)} onClick={() => choose(value)}>{value}</button>)}</div></fieldset>;
}
