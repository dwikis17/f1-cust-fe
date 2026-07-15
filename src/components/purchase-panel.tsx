"use client";

import { useMemo, useState } from "react";
import type { ProductVariant } from "@/lib/mock";

type Props = { productId: string; productName: string; variants: ProductVariant[] };

export function PurchasePanel({ productId, productName, variants }: Props) {
	const available = useMemo(() => variants.filter((variant) => variant.available), [variants]);
	const [variantId, setVariantId] = useState(available[0]?.id ?? "");
	const [quantity, setQuantity] = useState(1);
	const [message, setMessage] = useState("");
	const hasChoices = available.length > 1;

	function addToBag() {
		const item = { productId, productName, variantId, quantity };
		const stored = JSON.parse(localStorage.getItem("vantage97-cart") ?? "[]") as typeof item[];
		localStorage.setItem("vantage97-cart", JSON.stringify([...stored, item]));
		setMessage(`${quantity} added to your bag`);
	}

	return (
		<div className="purchase-panel">
			{hasChoices ? (
				<label className="variant-select">Edition
					<select value={variantId} onChange={(event) => setVariantId(event.target.value)}>
						{available.map((variant) => <option value={variant.id} key={variant.id}>{variant.color} / {variant.size}</option>)}
					</select>
				</label>
			) : null}
			<div className="purchase-row">
				<div className="quantity" aria-label="Quantity selector">
					<button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
					<span>{quantity}</span>
					<button type="button" onClick={() => setQuantity((value) => Math.min(9, value + 1))}>+</button>
				</div>
				<button className="button button-dark add-button" type="button" onClick={addToBag} disabled={!variantId}>Add to cart</button>
			</div>
			<button className="express-button" type="button">Buy with <strong>Shop</strong></button>
			<p className="payment-note" aria-live="polite">{message || "More payment options"}</p>
		</div>
	);
}
