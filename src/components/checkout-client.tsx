"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useMemo, useState } from "react";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { useCartCatalog } from "@/components/use-cart-catalog";
import { cartSubtotal, resolveCartLines, type CartLine } from "@/lib/cart";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/catalog";
import { localizedPath } from "@/lib/locale";

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
	originalPrice: number;
	shippingDiscountIdr: number;
	insuranceAvailable: boolean;
	insuranceFeeIdr: number;
	insuranceValueIdr: number;
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
type ShippingRequest = { destinationPostalCode: string; items: Array<{ variantId: string; quantity: number }>; includeInsurance?: boolean; promoCode?: string; turnstileToken?: string };
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
	shippingOriginalIdr: number;
	shippingDiscountIdr: number;
	shippingIdr: number;
	insuranceValueIdr: number;
	insuranceFeeIdr: number;
	totalIdr: number;
	promoCode: string | null;
};

declare global {
	interface Window {
		snap?: { pay: (token: string, callbacks: { onSuccess: () => void; onPending: () => void; onError: () => void; onClose: () => void }) => void };
	}
}

const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const turnstileEnabled = Boolean(turnstileSiteKey);
const midtransSnapUrl = String(process.env.NEXT_PUBLIC_MIDTRANS_ENV) === "production"
	? "https://app.midtrans.com/snap/snap.js"
	: "https://app.sandbox.midtrans.com/snap/snap.js";

const emptyDetails: ShippingDetails = { email: "", firstName: "", lastName: "", address: "", province: "", city: "", postalCode: "", phone: "" };

export function CheckoutClient() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const locale = useLocale();
	const messages = useDictionary();
	const items = useCartStore((state) => state.items);
	const ready = useCartStore((state) => state.hydrated);
	const { products, error: catalogError, loading: catalogLoading, stockAdjusted, retry: retryCatalog } = useCartCatalog();
	const [step, setStep] = useState<Step>("shipping");
	const [details, setDetails] = useState<ShippingDetails>(emptyDetails);
	const [selectedRateKey, setSelectedRateKey] = useState("");
	const [includeInsurance, setIncludeInsurance] = useState(false);
	const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
	const [paymentError, setPaymentError] = useState("");
	const [snapReady, setSnapReady] = useState(false);
	const [turnstileToken, setTurnstileToken] = useState("");
	const [turnstileError, setTurnstileError] = useState("");
	const [turnstileResetKey, setTurnstileResetKey] = useState(0);
	const [promoInput, setPromoInput] = useState("");
	const [appliedPromoState, setAppliedPromoState] = useState<{ cartKey: string; promo: PromoPreview } | null>(null);

	const lines = useMemo(() => resolveCartLines(items, products), [items, products]);
	const cartKey = lines.map((line) => `${line.variantId}:${line.quantity}`).join("|");
	const appliedPromo = appliedPromoState?.cartKey === cartKey ? appliedPromoState.promo : null;
	const subtotal = cartSubtotal(lines);
	const turnstileVerified = !turnstileEnabled || Boolean(turnstileToken);
	const shippingMutation = useMutation({
		mutationFn: (request: ShippingRequest) => queryClient.fetchQuery({
		queryKey: ["shipping-rates", request.destinationPostalCode, request.items, request.includeInsurance ?? false, request.promoCode ?? ""],
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
						HUMAN_VERIFICATION_FAILED: messages.checkout.humanVerificationFailed,
						HUMAN_VERIFICATION_UNAVAILABLE: messages.checkout.humanVerificationUnavailable,
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
		onSettled: () => {
			setTurnstileToken("");
			setTurnstileResetKey((value) => value + 1);
		},
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
			setAppliedPromoState({ cartKey, promo });
			setPromoInput(promo.code);
			setSelectedRateKey("");
			shippingMutation.reset();
			setStep("shipping");
		},
	});
	const checkoutMutation = useMutation({
		mutationFn: async () => {
			if (!selectedRate || !idempotencyKey || !turnstileVerified) throw new Error(messages.checkout.humanVerificationFailed);
			const response = await fetch("/api/checkout", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					idempotencyKey,
					...details,
					items: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
					courierCode: selectedRate.courierCode,
					serviceCode: selectedRate.serviceCode,
					quotedShippingIdr: selectedRate.price,
					includeInsurance,
					...(turnstileToken ? { turnstileToken } : {}),
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
					HUMAN_VERIFICATION_FAILED: messages.checkout.humanVerificationFailed,
					HUMAN_VERIFICATION_UNAVAILABLE: messages.checkout.humanVerificationUnavailable,
				};
				throw new Error(errors[body.error?.code ?? ""] ?? messages.checkout.paymentFailed);
			}
			return body;
		},
		onSuccess: (checkout) => openSnap(checkout),
		onError: (error) => {
			setPaymentError(error instanceof Error ? error.message : messages.checkout.paymentFailed);
			setTurnstileToken("");
			setTurnstileResetKey((value) => value + 1);
		},
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
		if (!turnstileVerified) {
			setTurnstileError(messages.checkout.humanVerificationFailed);
			return;
		}
		setTurnstileError("");
		setSelectedRateKey("");
		shippingMutation.reset();
		shippingMutation.mutate({
			destinationPostalCode: details.postalCode,
			items: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
			...(appliedPromo ? { promoCode: appliedPromo.code } : {}),
			...(includeInsurance ? { includeInsurance: true } : {}),
			...(turnstileToken ? { turnstileToken } : {}),
		});
	}

	function openSnap(payment: CheckoutResponse) {
		if (!window.snap) {
			setPaymentError(messages.checkout.paymentUnavailable);
			return;
		}
		window.snap.pay(payment.snapToken, {
			onSuccess: () => router.push(localizedPath(locale, `/orders/${payment.orderId}`)),
			onPending: () => router.push(localizedPath(locale, `/orders/${payment.orderId}`)),
			onError: () => setPaymentError(messages.checkout.paymentFailed),
			onClose: () => setPaymentError(messages.checkout.paymentClosed),
		});
	}

	function startPayment() {
		if (checkoutMutation.data) {
			openSnap(checkoutMutation.data);
			return;
		}
		if (!selectedRate || !idempotencyKey || !turnstileVerified) return;
		setPaymentError("");
		checkoutMutation.mutate();
	}

	if (!ready || catalogLoading) return <CheckoutSkeleton label={messages.checkout.loading} />;
	if (catalogError) return <main className="page-shell checkout-page"><div className="checkout-empty"><h1>{messages.cart.loadFailed}</h1><button className="button button-dark" type="button" onClick={retryCatalog}>{messages.cart.retry}</button></div></main>;
	if (!lines.length) return <main className="page-shell checkout-page"><div className="checkout-empty"><p className="eyebrow">{messages.checkout.checkout}</p><h1>{messages.checkout.emptyTitle}</h1><p>{messages.checkout.emptyText}</p><Link className="button button-dark" href={localizedPath(locale, "/cart")}>{messages.checkout.returnCart}</Link></div></main>;

	return (
		<main className="page-shell checkout-page">
			{midtransClientKey ? <Script src={midtransSnapUrl} data-client-key={midtransClientKey} strategy="afterInteractive" onReady={() => setSnapReady(Boolean(window.snap))} onError={() => setPaymentError(messages.checkout.paymentUnavailable)} /> : null}
			<CheckoutSteps step={step} setStep={(nextStep) => {
				if (nextStep === "shipping") {
					setTurnstileToken("");
					setTurnstileResetKey((value) => value + 1);
				}
				setStep(nextStep);
			}} canOpenPayment={Boolean(selectedRate)} messages={messages.checkout} />
			{stockAdjusted ? <p className="payment-notice" role="status">{messages.cart.stockAdjusted}</p> : null}
			<div className="checkout-layout">
				<section className="checkout-main">
					{step === "shipping" ? <ShippingStep
						details={details}
						updateDetail={updateDetail}
						rates={rates}
						selectedRateKey={selectedRateKey}
						setSelectedRateKey={setSelectedRateKey}
						error={shippingMutation.error instanceof Error ? shippingMutation.error.message : ""}
						loading={shippingMutation.isPending}
						checkShipping={checkShipping}
						continueToReview={() => {
							setTurnstileToken("");
							setTurnstileError("");
							setTurnstileResetKey((value) => value + 1);
							setStep("review");
						}}
						includeInsurance={includeInsurance}
						setIncludeInsurance={(value) => { setIncludeInsurance(value); setSelectedRateKey(""); shippingMutation.reset(); }}
						turnstileVerified={turnstileVerified}
						turnstileSiteKey={turnstileSiteKey}
						turnstileResetKey={turnstileResetKey}
						turnstileError={turnstileEnabled ? turnstileError : ""}
						onTurnstileToken={(token) => {
							setTurnstileToken(token);
							if (token) setTurnstileError("");
						}}
						onTurnstileError={() => setTurnstileError(messages.checkout.humanVerificationUnavailable)}
						messages={messages}
						locale={locale}
					/> : null}
					{step === "review" && selectedRate ? <ReviewStep
						lines={lines}
						details={details}
						selectedRate={selectedRate}
						editShipping={() => {
							setTurnstileToken("");
							setTurnstileResetKey((value) => value + 1);
							setStep("shipping");
						}}
						locked={Boolean(checkoutMutation.data)}
						startPayment={startPayment}
						paymentLoading={checkoutMutation.isPending}
						paymentReady={snapReady && Boolean(midtransClientKey) && turnstileVerified}
						paymentError={paymentError}
						turnstileVerified={turnstileVerified}
						turnstileSiteKey={turnstileSiteKey}
						turnstileResetKey={turnstileResetKey}
						turnstileError={turnstileEnabled ? turnstileError : ""}
						onTurnstileToken={(token) => {
							setTurnstileToken(token);
							if (token) setTurnstileError("");
						}}
						onTurnstileError={() => setTurnstileError(messages.checkout.humanVerificationUnavailable)}
						messages={messages.checkout}
						locale={locale}
					/> : null}
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
						setAppliedPromoState(null);
						setPromoInput("");
						promoMutation.reset();
						setSelectedRateKey("");
						shippingMutation.reset();
						setStep("shipping");
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

function CheckoutSkeleton({ label }: { label: string }) {
	return (
		<main className="page-shell checkout-page" aria-busy="true">
			<div className="checkout-skeleton" role="status" aria-live="polite">
				<span className="sr-only">{label}</span>
				<div className="checkout-skeleton-steps" aria-hidden="true">
					<span className="checkout-skeleton-step"><span className="checkout-skeleton-block checkout-skeleton-step-index" /><span className="checkout-skeleton-block checkout-skeleton-step-label" /></span>
					<span className="checkout-skeleton-step"><span className="checkout-skeleton-block checkout-skeleton-step-index" /><span className="checkout-skeleton-block checkout-skeleton-step-label checkout-skeleton-step-label-short" /></span>
				</div>
				<div className="checkout-layout">
					<section className="checkout-main" aria-hidden="true">
						<div className="checkout-skeleton-heading">
							<span className="checkout-skeleton-block checkout-skeleton-kicker" />
							<span className="checkout-skeleton-block checkout-skeleton-heading-title" />
							<span className="checkout-skeleton-block checkout-skeleton-heading-copy" />
						</div>
						<div className="checkout-skeleton-fieldset">
							<span className="checkout-skeleton-block checkout-skeleton-legend" />
							<div className="checkout-skeleton-field checkout-skeleton-field-full"><span className="checkout-skeleton-block checkout-skeleton-label" /><span className="checkout-skeleton-block checkout-skeleton-input" /></div>
							<span className="checkout-skeleton-block checkout-skeleton-hint" />
						</div>
						<div className="checkout-skeleton-fieldset">
							<span className="checkout-skeleton-block checkout-skeleton-legend checkout-skeleton-legend-short" />
							<div className="checkout-skeleton-delivery"><span className="checkout-skeleton-block checkout-skeleton-radio" /><span className="checkout-skeleton-block checkout-skeleton-delivery-copy" /></div>
						</div>
						<div className="checkout-skeleton-fieldset">
							<span className="checkout-skeleton-block checkout-skeleton-legend checkout-skeleton-legend-medium" />
							<div className="checkout-skeleton-fields">
								<div className="checkout-skeleton-field"><span className="checkout-skeleton-block checkout-skeleton-label" /><span className="checkout-skeleton-block checkout-skeleton-input" /></div>
								<div className="checkout-skeleton-field"><span className="checkout-skeleton-block checkout-skeleton-label checkout-skeleton-label-short" /><span className="checkout-skeleton-block checkout-skeleton-input" /></div>
								<div className="checkout-skeleton-field checkout-skeleton-field-full"><span className="checkout-skeleton-block checkout-skeleton-label checkout-skeleton-label-wide" /><span className="checkout-skeleton-block checkout-skeleton-input" /></div>
								<div className="checkout-skeleton-field"><span className="checkout-skeleton-block checkout-skeleton-label checkout-skeleton-label-short" /><span className="checkout-skeleton-block checkout-skeleton-input" /></div>
								<div className="checkout-skeleton-field"><span className="checkout-skeleton-block checkout-skeleton-label" /><span className="checkout-skeleton-block checkout-skeleton-input" /></div>
								<div className="checkout-skeleton-field"><span className="checkout-skeleton-block checkout-skeleton-label checkout-skeleton-label-short" /><span className="checkout-skeleton-block checkout-skeleton-input" /></div>
								<div className="checkout-skeleton-field"><span className="checkout-skeleton-block checkout-skeleton-label checkout-skeleton-label-short" /><span className="checkout-skeleton-block checkout-skeleton-input" /></div>
								<div className="checkout-skeleton-field checkout-skeleton-field-full"><span className="checkout-skeleton-block checkout-skeleton-label" /><span className="checkout-skeleton-block checkout-skeleton-input" /></div>
							</div>
						</div>
						<div className="checkout-skeleton-actions"><span className="checkout-skeleton-block checkout-skeleton-back" /><span className="checkout-skeleton-block checkout-skeleton-button" /></div>
						<div className="checkout-skeleton-rates"><span className="checkout-skeleton-block checkout-skeleton-rates-copy" /></div>
					</section>
					<aside className="checkout-summary checkout-skeleton-summary" aria-hidden="true">
						<span className="checkout-skeleton-block checkout-skeleton-summary-title" />
						<div className="checkout-skeleton-summary-items">
							{[0, 1, 2].map((item) => <div className="checkout-skeleton-summary-item" key={item}><span className="checkout-skeleton-block checkout-skeleton-thumb" /><span className="checkout-skeleton-item-copy"><span className="checkout-skeleton-block checkout-skeleton-item-name" /><span className="checkout-skeleton-block checkout-skeleton-item-meta" /></span><span className="checkout-skeleton-block checkout-skeleton-item-price" /></div>)}
						</div>
						<div className="checkout-skeleton-promo"><span className="checkout-skeleton-block checkout-skeleton-promo-label" /><span className="checkout-skeleton-block checkout-skeleton-promo-input" /></div>
						<div className="checkout-skeleton-totals"><span className="checkout-skeleton-block checkout-skeleton-total-line" /><span className="checkout-skeleton-block checkout-skeleton-total-line checkout-skeleton-total-line-short" /><span className="checkout-skeleton-block checkout-skeleton-total-line checkout-skeleton-total-line-last" /></div>
						<span className="checkout-skeleton-block checkout-skeleton-secure-note" />
					</aside>
				</div>
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

function ShippingStep({ details, updateDetail, rates, selectedRateKey, setSelectedRateKey, error, loading, checkShipping, continueToReview, includeInsurance, setIncludeInsurance, turnstileVerified, turnstileSiteKey, turnstileResetKey, turnstileError, onTurnstileToken, onTurnstileError, messages, locale }: {
	details: ShippingDetails;
	updateDetail: (field: keyof ShippingDetails, value: string) => void;
	rates: ShippingRate[];
	selectedRateKey: string;
	setSelectedRateKey: (value: string) => void;
	error: string;
	loading: boolean;
	checkShipping: (event: FormEvent<HTMLFormElement>) => void;
	continueToReview: () => void;
	includeInsurance: boolean;
	setIncludeInsurance: (value: boolean) => void;
	turnstileVerified: boolean;
	turnstileSiteKey?: string;
	turnstileResetKey: number;
	turnstileError: string;
	onTurnstileToken: (token: string) => void;
	onTurnstileError: () => void;
	messages: ReturnType<typeof useDictionary>;
	locale: "en" | "id";
}) {
	const checkout = messages.checkout;
	return <>
		<header className="checkout-heading"><p className="eyebrow">{checkout.shippingStep}</p><h1>{checkout.shippingTitle}</h1><p>{checkout.shippingIntro}</p></header>
		<form className="checkout-form" onSubmit={checkShipping}>
			<fieldset><legend>{checkout.contactEmail}</legend><label className="full"><span>{checkout.emailAddress}</span><input type="email" autoComplete="email" required value={details.email} onChange={(event) => updateDetail("email", event.target.value)} /></label><p className="form-hint">{checkout.emailHint}</p></fieldset>
			<fieldset><legend>{checkout.deliveryMethod}</legend><div className="delivery-method selected"><span aria-hidden="true">✓</span><div><strong>{checkout.homeDelivery}</strong><small>{checkout.homeDeliveryText}</small></div></div></fieldset>
			<fieldset><legend>{checkout.shippingInsurance}</legend><label className="delivery-method"><input type="checkbox" checked={includeInsurance} onChange={(event) => setIncludeInsurance(event.target.checked)} /><div><strong>{checkout.addShippingInsurance}</strong><small>{checkout.shippingInsuranceText}</small></div></label></fieldset>
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
			{turnstileSiteKey ? <TurnstileWidget siteKey={turnstileSiteKey} action="shipping-rates" language={locale} resetKey={turnstileResetKey} onToken={onTurnstileToken} onError={onTurnstileError} /> : null}
			{!turnstileVerified && !turnstileError ? <p className="verification-status" role="status">{checkout.verifyingHuman}</p> : null}
			{turnstileError ? <p className="payment-notice" role="alert">{turnstileError}</p> : null}
			<div className="shipping-actions"><Link href={localizedPath(locale, "/cart")}>← {checkout.returnCart}</Link><button className="button button-dark" type="submit" disabled={loading || !turnstileVerified}>{loading ? checkout.checking : checkout.getDeliveryOptions}</button></div>
		</form>
		<div className="checkout-rates" aria-live="polite">
			{error ? <p className="checkout-error">{error}</p> : null}
			{!error && rates.length === 0 ? <p>{checkout.ratesIntro}</p> : null}
			{rates.length > 0 ? <fieldset><legend>{checkout.chooseDelivery}</legend>{rates.map((rate) => <label className={selectedRateKey === rateKey(rate) ? "selected" : ""} key={rateKey(rate)}><input type="radio" name="shipping-rate" value={rateKey(rate)} disabled={includeInsurance && !rate.insuranceAvailable} checked={selectedRateKey === rateKey(rate)} onChange={(event) => setSelectedRateKey(event.target.value)} /><span><strong>{rate.courierName} — {rate.serviceName}</strong><small>{rate.duration || messages.cart.etaUnavailable}{rate.description ? ` · ${rate.description}` : ""}{includeInsurance && !rate.insuranceAvailable ? ` · ${checkout.insuranceUnavailable}` : ""}{rate.shippingDiscountIdr ? ` · ${checkout.freeShippingCoverage} -${formatPrice(rate.shippingDiscountIdr, locale)}` : ""}</small></span><b>{rate.shippingDiscountIdr ? <><s>{formatPrice(rate.originalPrice, locale)}</s><br /></> : null}{formatPrice(rate.price, locale)}</b></label>)}</fieldset> : null}
			{rates.length > 0 ? <button className="button button-dark" type="button" disabled={!selectedRateKey} onClick={continueToReview}>{checkout.continueReview}</button> : null}
		</div>
	</>;
}

function Field({ label, value, update, className, type = "text", autoComplete, inputMode, pattern, minLength, maxLength }: { label: string; value: string; update: (value: string) => void; className?: string; type?: string; autoComplete?: string; inputMode?: "numeric"; pattern?: string; minLength?: number; maxLength?: number }) {
	return <label className={className}><span>{label}</span><input type={type} autoComplete={autoComplete} inputMode={inputMode} pattern={pattern} minLength={minLength} maxLength={maxLength} required value={value} onChange={(event) => update(event.target.value)} /></label>;
}

function ReviewStep({ lines, details, selectedRate, editShipping, locked, startPayment, paymentLoading, paymentReady, paymentError, turnstileVerified, turnstileSiteKey, turnstileResetKey, turnstileError, onTurnstileToken, onTurnstileError, messages, locale }: {
	lines: CartLine[];
	details: ShippingDetails;
	selectedRate: ShippingRate;
	editShipping: () => void;
	locked: boolean;
	startPayment: () => void;
	paymentLoading: boolean;
	paymentReady: boolean;
	paymentError: string;
	turnstileVerified: boolean;
	turnstileSiteKey?: string;
	turnstileResetKey: number;
	turnstileError: string;
	onTurnstileToken: (token: string) => void;
	onTurnstileError: () => void;
	messages: ReturnType<typeof useDictionary>["checkout"];
	locale: "en" | "id";
}) {
	return <>
		<header className="checkout-heading"><p className="eyebrow">{messages.reviewStep}</p><h1>{messages.reviewTitle}</h1><p>{messages.reviewIntro}</p></header>
		<div className="review-block"><div><h2>{messages.shippingAddress}</h2>{locked ? null : <button type="button" onClick={editShipping}>{messages.edit}</button>}</div><p>{details.firstName} {details.lastName}<br />{details.address}<br />{details.city}, {details.province} {details.postalCode}<br />Indonesia<br />{details.phone}</p></div>
		<div className="review-block"><div><h2>{messages.delivery}</h2>{locked ? null : <button type="button" onClick={editShipping}>{messages.edit}</button>}</div><p>{selectedRate.courierName} — {selectedRate.serviceName}<br />{selectedRate.duration || messages.etaUnavailable} · {formatPrice(selectedRate.price, locale)}</p></div>
		<div className="review-block review-items"><div><h2>{messages.items}</h2></div>{lines.map((line) => <p key={line.variantId}><span>{line.quantity} × {line.product.name}</span><strong>{formatPrice(line.product.priceIdr * line.quantity, locale)}</strong></p>)}</div>
		{turnstileSiteKey && !locked ? <TurnstileWidget siteKey={turnstileSiteKey} action="checkout" language={locale} resetKey={turnstileResetKey} onToken={onTurnstileToken} onError={onTurnstileError} /> : null}
		{!locked && !turnstileVerified && !turnstileError ? <p className="verification-status" role="status">{messages.verifyingHuman}</p> : null}
		{turnstileError ? <p className="payment-notice" role="alert">{turnstileError}</p> : null}
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
	return <aside className="checkout-summary"><h2>{messages.orderSummary}</h2><ul>{lines.map((line) => <li key={line.variantId}><div>{line.product.photo ? <Image src={line.product.photo.url} alt="" fill sizes="72px" /> : <span className="cart-image-placeholder">V</span>}<span className="checkout-item-quantity">{line.quantity}</span></div><p><strong>{line.product.name}</strong><small>{[line.variant.color, line.variant.size].filter(Boolean).join(" / ") || line.variant.sku}</small></p><b>{formatPrice(line.product.priceIdr * line.quantity, locale)}</b></li>)}</ul><div className="promo-code"><label htmlFor="promo-code">{messages.promoCode}</label><form onSubmit={(event) => { event.preventDefault(); applyPromo(); }}><input id="promo-code" value={promoInput} placeholder={messages.promoPlaceholder} disabled={promoLoading || locked || Boolean(appliedPromo)} onChange={(event) => setPromoInput(event.target.value.toUpperCase())} /><button type="submit" disabled={promoLoading || locked || Boolean(appliedPromo) || promoInput.trim().length < 3}>{promoLoading ? messages.applyingPromo : messages.applyPromo}</button></form>{appliedPromo ? <p><span>{appliedPromo.code} · {appliedPromo.discountPercentage}%</span><button type="button" disabled={locked} onClick={removePromo}>{messages.removePromo}</button></p> : null}{promoError ? <small role="alert">{promoError}</small> : null}</div><dl><div><dt>{messages.subtotal}</dt><dd>{formatPrice(subtotal, locale)}</dd></div>{appliedPromo ? <div className="promo-discount"><dt>{messages.discount}</dt><dd>-{formatPrice(discount, locale)}</dd></div> : null}{selectedRate?.shippingDiscountIdr ? <><div><dt>{messages.shipping}</dt><dd>{formatPrice(selectedRate.originalPrice, locale)}</dd></div><div className="promo-discount"><dt>{messages.freeShippingCoverage}</dt><dd>-{formatPrice(selectedRate.shippingDiscountIdr, locale)}</dd></div><div><dt>{messages.netShipping}</dt><dd>{formatPrice(selectedRate.price - selectedRate.insuranceFeeIdr, locale)}</dd></div></> : <div><dt>{messages.shipping}</dt><dd>{selectedRate ? formatPrice(selectedRate.price - selectedRate.insuranceFeeIdr, locale) : messages.calculatedAfterSelection}</dd></div>}{selectedRate?.insuranceFeeIdr ? <div><dt>{messages.shippingInsurance}</dt><dd>{formatPrice(selectedRate.insuranceFeeIdr, locale)}</dd></div> : null}<div><dt>{messages.total}</dt><dd>{formatPrice(total, locale)}</dd></div></dl><p className="secure-note">◇ {messages.secureCheckout}</p></aside>;
}
