"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { cartSubtotal, readStoredCart, resolveCartLines, type CartLine, type StoredCartItem, writeStoredCart } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";
import type { PublicProduct } from "@/lib/mock";

type Step = "shipping" | "review";
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
type ShippingDetails = {
	email: string;
	firstName: string;
	lastName: string;
	address: string;
	province: string;
	city: string;
	postalCode: string;
	phone: string;
};
type CheckoutResponse = { orderId: string; snapToken: string; paymentStatus: string; totalIdr: number };

declare global {
	interface Window {
		snap?: { pay: (token: string, callbacks: { onSuccess: () => void; onPending: () => void; onError: () => void; onClose: () => void }) => void };
	}
}

const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
const midtransSnapUrl = process.env.NEXT_PUBLIC_MIDTRANS_ENV === "production"
	? "https://app.midtrans.com/snap/snap.js"
	: "https://app.sandbox.midtrans.com/snap/snap.js";

const emptyDetails: ShippingDetails = { email: "", firstName: "", lastName: "", address: "", province: "", city: "", postalCode: "", phone: "" };

export function CheckoutClient({ products }: { products: PublicProduct[] }) {
	const router = useRouter();
	const locale = useLocale();
	const messages = useDictionary();
	const [items, setItems] = useState<StoredCartItem[]>([]);
	const [ready, setReady] = useState(false);
	const [step, setStep] = useState<Step>("shipping");
	const [details, setDetails] = useState<ShippingDetails>(emptyDetails);
	const [rates, setRates] = useState<ShippingRate[]>([]);
	const [selectedRateKey, setSelectedRateKey] = useState("");
	const [shippingError, setShippingError] = useState("");
	const [shippingLoading, setShippingLoading] = useState(false);
	const [idempotencyKey, setIdempotencyKey] = useState("");
	const [checkout, setCheckout] = useState<CheckoutResponse>();
	const [paymentLoading, setPaymentLoading] = useState(false);
	const [paymentError, setPaymentError] = useState("");
	const [snapReady, setSnapReady] = useState(false);

	useEffect(() => {
		const stored = readStoredCart(localStorage);
		const resolvedIndexes = new Set(resolveCartLines(stored, products).map((line) => line.index));
		const valid = stored.filter((_, index) => resolvedIndexes.has(index));
		if (valid.length !== stored.length) writeStoredCart(localStorage, valid);
		setItems(valid);
		setIdempotencyKey(crypto.randomUUID());
		setReady(true);
	}, [products]);

	const lines = useMemo(() => resolveCartLines(items, products), [items, products]);
	const subtotal = cartSubtotal(lines);
	const selectedRate = rates.find((rate) => rateKey(rate) === selectedRateKey);
	const total = subtotal + (selectedRate?.price ?? 0);

	function updateDetail(field: keyof ShippingDetails, value: string) {
		const nextValue = field === "postalCode" ? value.replace(/\D/g, "").slice(0, 5) : value;
		setDetails((current) => ({ ...current, [field]: nextValue }));
		if (field === "postalCode") {
			setRates([]);
			setSelectedRateKey("");
			setShippingError("");
		}
	}

	async function checkShipping(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setShippingLoading(true);
		setShippingError("");
		setRates([]);
		setSelectedRateKey("");
		try {
			const response = await fetch("/api/shipping/rates", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ destinationPostalCode: details.postalCode, items: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })) }),
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

	function openSnap(payment: CheckoutResponse) {
		if (!window.snap) {
			setPaymentError(messages.checkout.paymentUnavailable);
			return;
		}
		window.snap.pay(payment.snapToken, {
			onSuccess: () => router.push(`/orders/${payment.orderId}`),
			onPending: () => router.push(`/orders/${payment.orderId}`),
			onError: () => setPaymentError(messages.checkout.paymentFailed),
			onClose: () => setPaymentError(messages.checkout.paymentClosed),
		});
	}

	async function startPayment() {
		if (checkout) {
			openSnap(checkout);
			return;
		}
		if (!selectedRate || !idempotencyKey) return;
		setPaymentLoading(true);
		setPaymentError("");
		try {
			const response = await fetch("/api/checkout", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					idempotencyKey,
					...details,
					items: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
					courierCode: selectedRate.courierCode,
					serviceCode: selectedRate.serviceCode,
				}),
			});
			const body = await response.json() as CheckoutResponse & { error?: { code?: string } };
			if (!response.ok) {
				if (body.error?.code === "PAYMENT_UPSTREAM_ERROR") setIdempotencyKey(crypto.randomUUID());
				const errors: Record<string, string> = {
					CART_CHANGED: messages.cart.unavailableItem,
					SHIPPING_RATE_CHANGED: messages.checkout.shippingRateChanged,
					PAYMENT_NOT_CONFIGURED: messages.checkout.paymentUnavailable,
					PAYMENT_UPSTREAM_ERROR: messages.checkout.paymentFailed,
				};
				throw new Error(errors[body.error?.code ?? ""] ?? messages.checkout.paymentFailed);
			}
			setCheckout(body);
			openSnap(body);
		} catch (error) {
			setPaymentError(error instanceof Error ? error.message : messages.checkout.paymentFailed);
		} finally {
			setPaymentLoading(false);
		}
	}

	if (!ready) return <main className="page-shell checkout-page"><div className="checkout-empty"><p className="eyebrow">{messages.checkout.loading}</p></div></main>;
	if (!lines.length) return <main className="page-shell checkout-page"><div className="checkout-empty"><p className="eyebrow">{messages.checkout.checkout}</p><h1>{messages.checkout.emptyTitle}</h1><p>{messages.checkout.emptyText}</p><Link className="button button-dark" href="/cart">{messages.checkout.returnCart}</Link></div></main>;

	return (
		<main className="page-shell checkout-page">
			{midtransClientKey ? <Script src={midtransSnapUrl} data-client-key={midtransClientKey} strategy="afterInteractive" onReady={() => setSnapReady(Boolean(window.snap))} onError={() => setPaymentError(messages.checkout.paymentUnavailable)} /> : null}
			<CheckoutSteps step={step} setStep={setStep} canOpenPayment={Boolean(selectedRate)} messages={messages.checkout} />
			<div className="checkout-layout">
				<section className="checkout-main">
					{step === "shipping" ? <ShippingStep details={details} updateDetail={updateDetail} rates={rates} selectedRateKey={selectedRateKey} setSelectedRateKey={setSelectedRateKey} error={shippingError} loading={shippingLoading} checkShipping={checkShipping} continueToReview={() => setStep("review")} messages={messages} locale={locale} /> : null}
					{step === "review" && selectedRate ? <ReviewStep lines={lines} details={details} selectedRate={selectedRate} editShipping={() => setStep("shipping")} locked={Boolean(checkout)} startPayment={startPayment} paymentLoading={paymentLoading} paymentReady={snapReady && Boolean(midtransClientKey)} paymentError={paymentError} messages={messages.checkout} locale={locale} /> : null}
				</section>
				<CheckoutSummary lines={lines} subtotal={subtotal} selectedRate={selectedRate} total={total} messages={messages.checkout} locale={locale} />
			</div>
		</main>
	);
}

function rateKey(rate: ShippingRate) {
	return `${rate.courierCode}:${rate.serviceCode}:${rate.price}`;
}

function CheckoutSteps({ step, setStep, canOpenPayment, messages }: { step: Step; setStep: (step: Step) => void; canOpenPayment: boolean; messages: ReturnType<typeof useDictionary>["checkout"] }) {
	const steps: Array<{ id: Step; label: string }> = [{ id: "shipping", label: messages.shippingStep }, { id: "review", label: messages.reviewStep }];
	return <nav className="checkout-steps" aria-label={messages.checkoutProgress}>{steps.map((item, index) => {
		const enabled = item.id === "shipping" || canOpenPayment;
		return <button type="button" key={item.id} className={step === item.id ? "active" : ""} disabled={!enabled} onClick={() => setStep(item.id)}><span>0{index + 1}</span>{item.label}</button>;
	})}</nav>;
}

function ShippingStep({ details, updateDetail, rates, selectedRateKey, setSelectedRateKey, error, loading, checkShipping, continueToReview, messages, locale }: {
	details: ShippingDetails;
	updateDetail: (field: keyof ShippingDetails, value: string) => void;
	rates: ShippingRate[];
	selectedRateKey: string;
	setSelectedRateKey: (value: string) => void;
	error: string;
	loading: boolean;
	checkShipping: (event: FormEvent<HTMLFormElement>) => void;
	continueToReview: () => void;
	messages: ReturnType<typeof useDictionary>;
	locale: "en" | "id";
}) {
	const checkout = messages.checkout;
	return <>
		<header className="checkout-heading"><p className="eyebrow">{checkout.shippingStep}</p><h1>{checkout.shippingTitle}</h1><p>{checkout.shippingIntro}</p></header>
		<form className="checkout-form" onSubmit={checkShipping}>
			<fieldset><legend>{checkout.contactEmail}</legend><label className="full"><span>{checkout.emailAddress}</span><input type="email" autoComplete="email" required value={details.email} onChange={(event) => updateDetail("email", event.target.value)} /></label><p className="form-hint">{checkout.emailHint}</p></fieldset>
			<fieldset><legend>{checkout.deliveryMethod}</legend><div className="delivery-method selected"><span aria-hidden="true">✓</span><div><strong>{checkout.homeDelivery}</strong><small>{checkout.homeDeliveryText}</small></div></div></fieldset>
			<fieldset><legend>{checkout.personalDetails}</legend><div className="checkout-fields">
				<Field label={checkout.firstName} autoComplete="given-name" value={details.firstName} update={(value) => updateDetail("firstName", value)} />
				<Field label={checkout.lastName} autoComplete="family-name" value={details.lastName} update={(value) => updateDetail("lastName", value)} />
				<Field className="full" label={checkout.address} autoComplete="street-address" value={details.address} update={(value) => updateDetail("address", value)} />
				<label><span>{checkout.country}</span><input value="Indonesia" disabled /></label>
				<Field label={checkout.province} autoComplete="address-level1" value={details.province} update={(value) => updateDetail("province", value)} />
				<Field label={checkout.city} autoComplete="address-level2" value={details.city} update={(value) => updateDetail("city", value)} />
				<Field label={checkout.postcode} autoComplete="postal-code" inputMode="numeric" pattern="[0-9]{5}" minLength={5} maxLength={5} value={details.postalCode} update={(value) => updateDetail("postalCode", value)} />
				<Field className="full" label={checkout.phone} type="tel" autoComplete="tel" value={details.phone} update={(value) => updateDetail("phone", value)} />
			</div></fieldset>
			<div className="shipping-actions"><Link href="/cart">← {checkout.returnCart}</Link><button className="button button-dark" type="submit" disabled={loading}>{loading ? checkout.checking : checkout.getDeliveryOptions}</button></div>
		</form>
		<div className="checkout-rates" aria-live="polite">
			{error ? <p className="checkout-error">{error}</p> : null}
			{!error && rates.length === 0 ? <p>{checkout.ratesIntro}</p> : null}
			{rates.length > 0 ? <fieldset><legend>{checkout.chooseDelivery}</legend>{rates.map((rate) => <label className={selectedRateKey === rateKey(rate) ? "selected" : ""} key={rateKey(rate)}><input type="radio" name="shipping-rate" value={rateKey(rate)} checked={selectedRateKey === rateKey(rate)} onChange={(event) => setSelectedRateKey(event.target.value)} /><span><strong>{rate.courierName} — {rate.serviceName}</strong><small>{rate.duration || messages.cart.etaUnavailable}{rate.description ? ` · ${rate.description}` : ""}</small></span><b>{formatPrice(rate.price, locale)}</b></label>)}</fieldset> : null}
			{rates.length > 0 ? <button className="button button-dark" type="button" disabled={!selectedRateKey} onClick={continueToReview}>{checkout.continueReview}</button> : null}
		</div>
	</>;
}

function Field({ label, value, update, className, type = "text", autoComplete, inputMode, pattern, minLength, maxLength }: { label: string; value: string; update: (value: string) => void; className?: string; type?: string; autoComplete?: string; inputMode?: "numeric"; pattern?: string; minLength?: number; maxLength?: number }) {
	return <label className={className}><span>{label}</span><input type={type} autoComplete={autoComplete} inputMode={inputMode} pattern={pattern} minLength={minLength} maxLength={maxLength} required value={value} onChange={(event) => update(event.target.value)} /></label>;
}

function ReviewStep({ lines, details, selectedRate, editShipping, locked, startPayment, paymentLoading, paymentReady, paymentError, messages, locale }: { lines: CartLine[]; details: ShippingDetails; selectedRate: ShippingRate; editShipping: () => void; locked: boolean; startPayment: () => void; paymentLoading: boolean; paymentReady: boolean; paymentError: string; messages: ReturnType<typeof useDictionary>["checkout"]; locale: "en" | "id" }) {
	return <>
		<header className="checkout-heading"><p className="eyebrow">{messages.reviewStep}</p><h1>{messages.reviewTitle}</h1><p>{messages.reviewIntro}</p></header>
		<div className="review-block"><div><h2>{messages.shippingAddress}</h2>{locked ? null : <button type="button" onClick={editShipping}>{messages.edit}</button>}</div><p>{details.firstName} {details.lastName}<br />{details.address}<br />{details.city}, {details.province} {details.postalCode}<br />Indonesia<br />{details.phone}</p></div>
		<div className="review-block"><div><h2>{messages.delivery}</h2>{locked ? null : <button type="button" onClick={editShipping}>{messages.edit}</button>}</div><p>{selectedRate.courierName} — {selectedRate.serviceName}<br />{selectedRate.duration || messages.etaUnavailable} · {formatPrice(selectedRate.price, locale)}</p></div>
		<div className="review-block review-items"><div><h2>{messages.items}</h2></div>{lines.map((line) => <p key={line.variantId}><span>{line.quantity} × {line.product.name}</span><strong>{formatPrice(line.product.priceIdr * line.quantity, locale)}</strong></p>)}</div>
		{paymentError ? <p className="payment-notice" role="alert">{paymentError}</p> : null}
		<div className="checkout-nav">{locked ? <span /> : <button type="button" onClick={editShipping}>← {messages.backShipping}</button>}<button className="button button-dark" type="button" disabled={paymentLoading || !paymentReady} onClick={startPayment}>{paymentLoading ? messages.startingPayment : messages.placeOrder}</button></div>
	</>;
}

function CheckoutSummary({ lines, subtotal, selectedRate, total, messages, locale }: { lines: CartLine[]; subtotal: number; selectedRate?: ShippingRate; total: number; messages: ReturnType<typeof useDictionary>["checkout"]; locale: "en" | "id" }) {
	return <aside className="checkout-summary"><h2>{messages.orderSummary}</h2><ul>{lines.map((line) => <li key={line.variantId}><div>{line.product.photos[0] ? <Image src={line.product.photos[0].url} alt="" fill sizes="72px" /> : <span className="cart-image-placeholder">V</span>}<span className="checkout-item-quantity">{line.quantity}</span></div><p><strong>{line.product.name}</strong><small>{[line.variant.color, line.variant.size].filter(Boolean).join(" / ") || line.variant.sku}</small></p><b>{formatPrice(line.product.priceIdr * line.quantity, locale)}</b></li>)}</ul><dl><div><dt>{messages.subtotal}</dt><dd>{formatPrice(subtotal, locale)}</dd></div><div><dt>{messages.shipping}</dt><dd>{selectedRate ? formatPrice(selectedRate.price, locale) : messages.calculatedAfterSelection}</dd></div><div><dt>{messages.total}</dt><dd>{formatPrice(total, locale)}</dd></div></dl><p className="secure-note">◇ {messages.secureCheckout}</p></aside>;
}
