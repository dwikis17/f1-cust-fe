"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/catalog";
import type { PublicProduct } from "@/lib/mock";

type StoredItem = { productId: string; productName: string; variantId: string; quantity: number };
type ShippingRate = {
	courierCode: string;
	courierName: string;
	serviceCode: string;
	serviceName: string;
	description: string;
	duration: string;
	serviceType: string;
	currency: string;
	price: number;
};

export function CartClient({ products }: { products: PublicProduct[] }) {
	const [items, setItems] = useState<StoredItem[]>([]);
	const [ready, setReady] = useState(false);
	const [destinationPostalCode, setDestinationPostalCode] = useState("");
	const [rates, setRates] = useState<ShippingRate[] | null>(null);
	const [shippingError, setShippingError] = useState("");
	const [shippingLoading, setShippingLoading] = useState(false);

	useEffect(() => {
		setItems(JSON.parse(localStorage.getItem("valdye-cart") ?? "[]") as StoredItem[]);
		setReady(true);
	}, []);

	function persist(next: StoredItem[]) {
		setItems(next);
		localStorage.setItem("valdye-cart", JSON.stringify(next));
		setRates(null);
		setShippingError("");
	}

	const lines = useMemo(() => items.flatMap((item, index) => {
		const product = products.find((candidate) => candidate.id === item.productId);
		if (!product) return [];
		return [{ ...item, index, product, variant: product.variants.find((variant) => variant.id === item.variantId) }];
	}), [items, products]);
	const subtotal = lines.reduce((sum, line) => sum + line.product.priceIdr * line.quantity, 0);

	function updatePostalCode(value: string) {
		setDestinationPostalCode(value.replace(/\D/g, "").slice(0, 5));
		setRates(null);
		setShippingError("");
	}

	async function checkShipping(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setShippingLoading(true);
		setShippingError("");
		setRates(null);
		try {
			const response = await fetch("/api/shipping/rates", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					destinationPostalCode,
					items: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
				}),
			});
			const body = await response.json() as { rates?: ShippingRate[]; error?: { message?: string } };
			if (!response.ok) throw new Error(body.error?.message ?? "Unable to check shipping rates");
			setRates(body.rates ?? []);
		} catch (error) {
			setShippingError(error instanceof Error ? error.message : "Unable to check shipping rates");
		} finally {
			setShippingLoading(false);
		}
	}

	if (!ready) return <div className="cart-empty"><p className="eyebrow">Loading garage</p></div>;
	if (!lines.length) return <div className="cart-empty"><p className="eyebrow">Your bag / 00</p><h1>The garage is empty</h1><p>Build your race-day collection from the latest technical equipment.</p><Link className="button button-dark" href="/collections">Explore collection</Link></div>;

	return (
		<div className="cart-layout">
			<section className="cart-lines">
				<div className="cart-title"><p className="eyebrow">Your bag / {lines.length.toString().padStart(2, "0")}</p><h1>Selected equipment</h1></div>
				{lines.map((line) => (
					<article className="cart-line" key={`${line.productId}-${line.index}`}>
						<Link className="cart-line-image" href={`/products/${line.product.slug}`}><Image src={line.product.photos[0].url} alt={line.product.photos[0].altText} fill sizes="150px" /></Link>
						<div className="cart-line-copy"><p>{line.product.team?.name ?? line.product.productType.name}</p><h2><Link href={`/products/${line.product.slug}`}>{line.product.name}</Link></h2>{line.variant ? <span>{[line.variant.color, line.variant.size].filter(Boolean).join(" / ") || line.variant.sku}</span> : null}<button type="button" onClick={() => persist(items.filter((_, index) => index !== line.index))}>Remove</button></div>
						<div className="cart-line-end"><strong>{formatPrice(line.product.priceIdr * line.quantity)}</strong><div className="quantity"><button type="button" onClick={() => persist(items.map((item, index) => index === line.index ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item))}>−</button><span>{line.quantity}</span><button type="button" onClick={() => persist(items.map((item, index) => index === line.index ? { ...item, quantity: Math.min(9, item.quantity + 1) } : item))}>+</button></div></div>
					</article>
				))}
			</section>
			<aside className="cart-summary">
				<p className="eyebrow light">Race summary</p>
				<div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div>
				<div><span>Shipping</span><strong>{rates?.length ? `From ${formatPrice(rates[0].price)}` : "Enter postal code"}</strong></div>
				<form className="shipping-form" onSubmit={checkShipping}>
					<label htmlFor="destination-postal-code">Destination postal code</label>
					<div>
						<input id="destination-postal-code" name="destinationPostalCode" value={destinationPostalCode} onChange={(event) => updatePostalCode(event.target.value)} inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{5}" minLength={5} maxLength={5} placeholder="e.g. 12240" required />
						<button className="button button-light" type="submit" disabled={shippingLoading}>{shippingLoading ? "Checking…" : "Check shipping"}</button>
					</div>
					<p className={shippingError ? "shipping-message shipping-error" : "shipping-message"} aria-live="polite">
						{shippingError || (rates && rates.length === 0 ? "No delivery services are available for this destination." : "Rates are live estimates and may change at checkout.")}
					</p>
				</form>
				{rates?.length ? <ul className="shipping-rates" aria-label="Available shipping rates">
					{rates.map((rate, index) => <li key={`${rate.courierCode}-${rate.serviceCode}-${index}`}>
						<div><strong>{rate.courierName}</strong><span>{rate.serviceName}</span></div>
						<div><strong>{formatPrice(rate.price)}</strong><span>{rate.duration || "ETA unavailable"}</span></div>
						{rate.description ? <p>{rate.description}</p> : null}
					</li>)}
				</ul> : null}
				<p>Taxes calculated at checkout. All merchandise ships in track-safe protective packaging.</p>
				<button className="button button-light" type="button">Proceed to checkout</button>
				<Link href="/collections">Continue shopping →</Link>
			</aside>
		</div>
	);
}
