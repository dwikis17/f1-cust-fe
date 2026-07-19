"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { cartSubtotal, resolveCartLines, type CartLine } from "@/lib/cart";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice, type PublicProduct } from "@/lib/catalog";

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
type ShippingRequest = { destinationPostalCode: string; items: Array<{ variantId: string; quantity: number }> };
type PromoPreview = {
	code: string;
	discountPercentage: number;
	maxDiscountIdr: number | null;
	subtotalIdr: number;
	discountIdr: number;
	discountedSubtotalIdr: number;
};
type CheckoutResponse = {
	orderId: string;
	snapToken: string;
	paymentStatus: string;
	subtotalIdr: number;
	discountIdr: number;
	shippingIdr: number;
	totalIdr: number;
	promoCode: string | null;
};

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
	const queryClient = useQueryClient();
	const locale = useLocale();
	const messages = useDictionary();
	const items = useCartStore((state) => state.items);
	const ready = useCartStore((state) => state.hydrated);
	const reconcile = useCartStore((state) => state.reconcile);
	const [step, setStep] = useState<Step>("shipping");
	const [details, setDetails] = useState<ShippingDetails>(emptyDetails);
	const [selectedRateKey, setSelectedRateKey] = useState("");
	const [idempotencyKey, setIdempotencyKey] = useState("");
	const [paymentError, setPaymentError] = useState("");
	const [snapReady, setSnapReady] = useState(false);
	const [promoInput, setPromoInput] = useState("");
	const [appliedPromo, setAppliedPromo] = useState<PromoPreview | null>(null);

	useEffect(() => {
		if (ready) reconcile(products);
	}, [products, ready, reconcile]);

	useEffect(() => setIdempotencyKey(crypto.randomUUID()), []);

	const lines = useMemo(() => resolveCartLines(items, products), [items, products]);
	const subtotal = cartSubtotal(lines);
	const shippingMutation = useMutation({
		mutationFn: (request: ShippingRequest) => queryClient.fetchQuery({
			queryKey: ["shipping-rates", request.destinationPostalCode, request.items],
			queryFn: async () => {
				const response = await fetch("/api/shipping/rates", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify(request),
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
				return body.rates ?? [];
			},
		}),
	});
	const rates = shippingMutation.data ?? [];
	const selectedRate = rates.find((rate) => rateKey(rate) === selectedRateKey);
	const pricedSubtotal = appliedPromo?.subtotalIdr ?? subtotal;
	const discount = appliedPromo?.discountIdr ?? 0;
	const total = pricedSubtotal - discount + (selectedRate?.price ?? 0);
	const promoMutation = useMutation({
		mutationFn: async () => {
			const response = await fetch("/api/promo-codes/preview", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					code: promoInput,
					items: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
				}),
			});
			const body = await response.json() as PromoPreview & { error?: { code?: string } };
			if (!response.ok) {
				throw new Error(body.error?.code === "PROMO_CODE_UNAVAILABLE"
					? messages.checkout.promoUnavailable
					: messages.checkout.promoError);
			}
			return body;
		},
		onSuccess: (promo) => {
			setAppliedPromo(promo);
			setPromoInput(promo.code);
		},
	});
	const cartKey = lines.map((line) => `${line.variantId}:${line.quantity}`).join("|");
	useEffect(() => setAppliedPromo(null), [cartKey]);
	const checkoutMutation = useMutation({
		mutationFn: async () => {
			if (!selectedRate || !idempotencyKey) throw new Error(messages.checkout.paymentFailed);
			const response = await fetch("/api/checkout", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					idempotencyKey,
					...details,
					items: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
					courierCode: selectedRate.courierCode,
					serviceCode: selectedRate.serviceCode,
					...(appliedPromo ? { promoCode: appliedPromo.code } : {}),
				}),
			});
			const body = await response.json() as CheckoutResponse & { error?: { code?: string } };
			if (!response.ok) {
				if (body.error?.code === "PAYMENT_UPSTREAM_ERROR") setIdempotencyKey(crypto.randomUUID());
				const errors: Record<string, string> = {
					CART_CHANGED: messages.cart.unavailableItem,
					SHIPPING_RATE_CHANGED: messages.checkout.shippingRateChanged,
					PROMO_CODE_UNAVAILABLE: messages.checkout.promoUnavailable,
					PAYMENT_NOT_CONFIGURED: messages.checkout.paymentUnavailable,
					PAYMENT_UPSTREAM_ERROR: messages.checkout.paymentFailed,
				};
				throw new Error(errors[body.error?.code ?? ""] ?? messages.checkout.paymentFailed);
			}
			return body;
		},
		onSuccess: (checkout) => openSnap(checkout),
		onError: (error) => setPaymentError(error instanceof Error ? error.message : messages.checkout.paymentFailed),
	});

	function updateDetail(field: keyof ShippingDetails, value: string) {
		const nextValue = field === "postalCode" ? value.replace(/\D/g, "").slice(0, 5) : value;
		setDetails((current) => ({ ...current, [field]: nextValue }));
		if (field === "postalCode") {
			shippingMutation.reset();
			setSelectedRateKey("");
		}
	}

	function checkShipping(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSelectedRateKey("");
		shippingMutation.reset();
		shippingMutation.mutate({
			destinationPostalCode: details.postalCode,
			items: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
		});
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

	function startPayment() {
		if (checkoutMutation.data) {
			openSnap(checkoutMutation.data);
			return;
		}
		if (!selectedRate || !idempotencyKey) return;
		setPaymentError("");
		checkoutMutation.mutate();
	}

	if (!ready) return <main className="page-shell checkout-page"><div className="checkout-empty"><p className="eyebrow">{messages.checkout.loading}</p></div></main>;
	if (!lines.length) return <main className="page-shell checkout-page"><div className="checkout-empty"><p className="eyebrow">{messages.checkout.checkout}</p><h1>{messages.checkout.emptyTitle}</h1><p>{messages.checkout.emptyText}</p><Link className="button button-dark" href="/cart">{messages.checkout.returnCart}</Link></div></main>;

	return (
		<main className="page-shell checkout-page">
			{midtransClientKey ? <Script src={midtransSnapUrl} data-client-key={midtransClientKey} strategy="afterInteractive" onReady={() => setSnapReady(Boolean(window.snap))} onError={() => setPaymentError(messages.checkout.paymentUnavailable)} /> : null}
			<CheckoutSteps step={step} setStep={setStep} canOpenPayment={Boolean(selectedRate)} messages={messages.checkout} />
			<div className="checkout-layout">
				<section className="checkout-main">
					{step === "shipping" ? <ShippingStep details={details} updateDetail={updateDetail} rates={rates} selectedRateKey={selectedRateKey} setSelectedRateKey={setSelectedRateKey} error={shippingMutation.error instanceof Error ? shippingMutation.error.message : ""} loading={shippingMutation.isPending} checkShipping={checkShipping} continueToReview={() => setStep("review")} messages={messages} locale={locale} /> : null}
					{step === "review" && selectedRate ? <ReviewStep lines={lines} details={details} selectedRate={selectedRate} editShipping={() => setStep("shipping")} locked={Boolean(checkoutMutation.data)} startPayment={startPayment} paymentLoading={checkoutMutation.isPending} paymentReady={snapReady && Boolean(midtransClientKey)} paymentError={paymentError} messages={messages.checkout} locale={locale} /> : null}
				</section>
				<CheckoutSummary
					lines={lines}
					subtotal={pricedSubtotal}
					discount={discount}
					selectedRate={selectedRate}
					total={total}
					promoInput={promoInput}
					setPromoInput={setPromoInput}
					appliedPromo={appliedPromo}
					applyPromo={() => promoMutation.mutate()}
					removePromo={() => {
						setAppliedPromo(null);
						setPromoInput("");
						promoMutation.reset();
					}}
					promoLoading={promoMutation.isPending}
					promoError={promoMutation.error instanceof Error ? promoMutation.error.message : ""}
					locked={Boolean(checkoutMutation.data)}
					messages={messages.checkout}
					locale={locale}
				/>
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

function CheckoutSummary({ lines, subtotal, discount, selectedRate, total, promoInput, setPromoInput, appliedPromo, applyPromo, removePromo, promoLoading, promoError, locked, messages, locale }: {
	lines: CartLine[];
	subtotal: number;
	discount: number;
	selectedRate?: ShippingRate;
	total: number;
	promoInput: string;
	setPromoInput: (value: string) => void;
	appliedPromo: PromoPreview | null;
	applyPromo: () => void;
	removePromo: () => void;
	promoLoading: boolean;
	promoError: string;
	locked: boolean;
	messages: ReturnType<typeof useDictionary>["checkout"];
	locale: "en" | "id";
}) {
	return <aside className="checkout-summary"><h2>{messages.orderSummary}</h2><ul>{lines.map((line) => <li key={line.variantId}><div>{line.product.photos[0] ? <Image src={line.product.photos[0].url} alt="" fill sizes="72px" /> : <span className="cart-image-placeholder">V</span>}<span className="checkout-item-quantity">{line.quantity}</span></div><p><strong>{line.product.name}</strong><small>{[line.variant.color, line.variant.size].filter(Boolean).join(" / ") || line.variant.sku}</small></p><b>{formatPrice(line.product.priceIdr * line.quantity, locale)}</b></li>)}</ul><div className="promo-code"><label htmlFor="promo-code">{messages.promoCode}</label><form onSubmit={(event) => { event.preventDefault(); applyPromo(); }}><input id="promo-code" value={promoInput} placeholder={messages.promoPlaceholder} disabled={promoLoading || locked || Boolean(appliedPromo)} onChange={(event) => setPromoInput(event.target.value.toUpperCase())} /><button type="submit" disabled={promoLoading || locked || Boolean(appliedPromo) || promoInput.trim().length < 3}>{promoLoading ? messages.applyingPromo : messages.applyPromo}</button></form>{appliedPromo ? <p><span>{appliedPromo.code} · {appliedPromo.discountPercentage}%</span><button type="button" disabled={locked} onClick={removePromo}>{messages.removePromo}</button></p> : null}{promoError ? <small role="alert">{promoError}</small> : null}</div><dl><div><dt>{messages.subtotal}</dt><dd>{formatPrice(subtotal, locale)}</dd></div>{appliedPromo ? <div className="promo-discount"><dt>{messages.discount}</dt><dd>-{formatPrice(discount, locale)}</dd></div> : null}<div><dt>{messages.shipping}</dt><dd>{selectedRate ? formatPrice(selectedRate.price, locale) : messages.calculatedAfterSelection}</dd></div><div><dt>{messages.total}</dt><dd>{formatPrice(total, locale)}</dd></div></dl><p className="secure-note">◇ {messages.secureCheckout}</p></aside>;
}
