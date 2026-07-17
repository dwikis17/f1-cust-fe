"use client";

import { useMemo, useState } from "react";

import type { ProductVariant } from "@/lib/mock";

type Props = { productId: string; productName: string; variants: ProductVariant[] };

export function PurchasePanel({ productId, productName, variants }: Props) {
	const firstAvailable = variants.find((variant) => variant.available) ?? variants[0];
	const [variantId, setVariantId] = useState(firstAvailable?.id ?? "");
	const [quantity, setQuantity] = useState(1);
	const [message, setMessage] = useState("");
	const selected = variants.find((variant) => variant.id === variantId) ?? firstAvailable;
	const sizes = useMemo(() => [...new Set(variants.flatMap((variant) => variant.size ? [variant.size] : []))], [variants]);
	const colors = useMemo(() => [...new Set(variants.flatMap((variant) => variant.color ? [variant.color] : []))], [variants]);

	function chooseOption(kind: "size" | "color", value: string) {
		const match = variants.find((variant) => variant[kind] === value && variant.available && (kind === "size" ? colors.length < 2 || variant.color === selected?.color : sizes.length < 2 || variant.size === selected?.size))
			?? variants.find((variant) => variant[kind] === value && variant.available);
		if (match) setVariantId(match.id);
	}

	function addToBag() {
		if (!selected?.available) return;
		const item = { productId, productName, variantId: selected.id, quantity };
		const stored = JSON.parse(localStorage.getItem("valdye-cart") ?? "[]") as typeof item[];
		localStorage.setItem("valdye-cart", JSON.stringify([...stored, item]));
		setMessage(`${quantity} added to your bag`);
	}

	return <>
		<div className="purchase-panel">
			{colors.length > 1 ? <OptionButtons label="Color" values={colors} selected={selected?.color} available={(value) => variants.some((variant) => variant.color === value && variant.available)} choose={(value) => chooseOption("color", value)} /> : null}
			{sizes.length > 0 ? <OptionButtons label="Size" values={sizes} selected={selected?.size} available={(value) => variants.some((variant) => variant.size === value && variant.available && (colors.length < 2 || variant.color === selected?.color))} choose={(value) => chooseOption("size", value)} /> : null}
			<div className="purchase-row"><div className="quantity" aria-label="Quantity selector"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button><span>{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(9, value + 1))}>+</button></div><button className="button button-dark add-button" type="button" onClick={addToBag} disabled={!selected?.available}>{selected?.available ? "Add to cart" : "Out of stock"}</button></div>
			<button className="express-button" type="button" disabled={!selected?.available}>Buy with <strong>Shop</strong></button>
			<p className="payment-note" aria-live="polite">{message || (selected?.available ? "More payment options" : "This option is currently unavailable")}</p>
		</div>
		<section className="technical-data" aria-live="polite">
			<div className="data-heading"><span>Technical data</span><strong>Selected specification</strong></div>
			<div><span>Package weight</span><strong>{selected ? `${selected.packageWeightG} grams` : "—"}</strong></div>
			<div><span>Dimensions</span><strong>{selected ? `${selected.packageLengthMm} × ${selected.packageWidthMm} × ${selected.packageHeightMm} mm` : "—"}</strong></div>
			<div><span>Model no.</span><strong>{selected?.sku ?? "—"}</strong></div>
			{selected?.size ? <div><span>Size</span><strong>{selected.size}</strong></div> : null}
			{colors.length > 1 && selected?.color ? <div><span>Color</span><strong>{selected.color}</strong></div> : null}
			<div><span>Availability</span><strong>{selected?.available ? "Ready to dispatch" : "Out of stock"}</strong></div>
			<div><span>Authenticity</span><strong>Verified</strong></div>
			{selected?.sizingGuide ? <div className="sizing-data"><span>Sizing guide ({selected.sizingGuide.unit})</span><strong>{Object.entries(selected.sizingGuide.measurements).map(([name, value]) => `${name}: ${value}`).join(" · ")}</strong></div> : null}
		</section>
	</>;
}

function OptionButtons({ label, values, selected, available, choose }: { label: string; values: string[]; selected: string | null | undefined; available: (value: string) => boolean; choose: (value: string) => void }) {
	return <fieldset className="variant-options"><legend>{label}</legend><div>{values.map((value) => <button type="button" key={value} aria-pressed={selected === value} disabled={!available(value)} onClick={() => choose(value)}>{value}</button>)}</div></fieldset>;
}
