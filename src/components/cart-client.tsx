"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useDictionary, useLocale } from "@/components/i18n-provider";
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
	const locale = useLocale();
	const messages = useDictionary();
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
			const body = await response.json() as { rates?: ShippingRate[]; error?: { code?: string } };
			if (!response.ok) {
				const errors: Record<string, string> = {
					INVALID_DESTINATION: messages.cart.invalidDestination,
					NO_COURIER_AVAILABLE: messages.cart.noServices,
					CART_CHANGED: messages.cart.unavailableItem,
					SHIPPING_NOT_CONFIGURED: messages.cart.shippingNotConfigured,
					SHIPPING_TIMEOUT: messages.cart.shippingUnavailable,
					SHIPPING_UPSTREAM_ERROR: messages.cart.shippingUnavailable,
					SHIPPING_API_UNAVAILABLE: messages.cart.shippingUnavailable,
				};
				throw new Error(errors[body.error?.code ?? ""] ?? messages.cart.genericShippingError);
			}
			setRates(body.rates ?? []);
		} catch (error) {
			setShippingError(error instanceof Error ? error.message : messages.cart.genericShippingError);
		} finally {
			setShippingLoading(false);
		}
	}

	if (!ready) return <div className="cart-empty"><p className="eyebrow">{messages.cart.loadingGarage}</p></div>;
	if (!lines.length) return <div className="cart-empty"><p className="eyebrow">{messages.cart.yourBag} / 00</p><h1>{messages.cart.emptyTitle}</h1><p>{messages.cart.emptyText}</p><Link className="button button-dark" href="/collections">{messages.cart.exploreCollection}</Link></div>;

	return (
		<div className="cart-layout">
			<section className="cart-lines">
				<div className="cart-title"><p className="eyebrow">{messages.cart.yourBag} / {lines.length.toString().padStart(2, "0")}</p><h1>{messages.cart.selectedEquipment}</h1></div>
				{lines.map((line) => (
					<article className="cart-line" key={`${line.productId}-${line.index}`}>
						<Link className="cart-line-image" href={`/products/${line.product.slug}`}><Image src={line.product.photos[0].url} alt={line.product.photos[0].altText} fill sizes="150px" /></Link>
						<div className="cart-line-copy"><p>{line.product.team?.name ?? line.product.productType.name}</p><h2><Link href={`/products/${line.product.slug}`}>{line.product.name}</Link></h2>{line.variant ? <span>{[line.variant.color, line.variant.size].filter(Boolean).join(" / ") || line.variant.sku}</span> : null}<button type="button" onClick={() => persist(items.filter((_, index) => index !== line.index))}>{messages.cart.remove}</button></div>
						<div className="cart-line-end"><strong>{formatPrice(line.product.priceIdr * line.quantity, locale)}</strong><div className="quantity"><button type="button" onClick={() => persist(items.map((item, index) => index === line.index ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item))}>−</button><span>{line.quantity}</span><button type="button" onClick={() => persist(items.map((item, index) => index === line.index ? { ...item, quantity: Math.min(9, item.quantity + 1) } : item))}>+</button></div></div>
					</article>
				))}
			</section>
			<aside className="cart-summary">
				<p className="eyebrow light">{messages.cart.raceSummary}</p>
				<div><span>{messages.cart.subtotal}</span><strong>{formatPrice(subtotal, locale)}</strong></div>
				<div><span>{messages.cart.shipping}</span><strong>{rates?.length ? `${messages.cart.from} ${formatPrice(rates[0].price, locale)}` : messages.cart.enterPostalCode}</strong></div>
				<form className="shipping-form" onSubmit={checkShipping}>
					<label htmlFor="destination-postal-code">{messages.cart.destinationPostalCode}</label>
					<div>
						<input id="destination-postal-code" name="destinationPostalCode" value={destinationPostalCode} onChange={(event) => updatePostalCode(event.target.value)} inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{5}" minLength={5} maxLength={5} placeholder={messages.cart.postalPlaceholder} required />
						<button className="button button-light" type="submit" disabled={shippingLoading}>{shippingLoading ? messages.cart.checking : messages.cart.checkShipping}</button>
					</div>
					<p className={shippingError ? "shipping-message shipping-error" : "shipping-message"} aria-live="polite">
						{shippingError || (rates && rates.length === 0 ? messages.cart.noServices : messages.cart.rateEstimate)}
					</p>
				</form>
				{rates?.length ? <ul className="shipping-rates" aria-label={messages.cart.availableRates}>
					{rates.map((rate, index) => <li key={`${rate.courierCode}-${rate.serviceCode}-${index}`}>
						<div><strong>{rate.courierName}</strong><span>{rate.serviceName}</span></div>
						<div><strong>{formatPrice(rate.price, locale)}</strong><span>{rate.duration || messages.cart.etaUnavailable}</span></div>
						{rate.description ? <p>{rate.description}</p> : null}
					</li>)}
				</ul> : null}
				<p>{messages.cart.taxes}</p>
				<button className="button button-light" type="button">{messages.cart.checkout}</button>
				<Link href="/collections">{messages.cart.continueShopping}</Link>
			</aside>
		</div>
	);
}
