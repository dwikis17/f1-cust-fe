"use client";

import Link from "next/link";
import Script from "next/script";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/catalog";
import { localizedPath } from "@/lib/locale";

type OrderReceipt = {
	id: string;
	orderNumber: string;
	subtotalIdr: number;
	discountIdr: number;
	shippingOriginalIdr: number;
	shippingDiscountIdr: number;
	shippingIdr: number;
	insuranceFeeIdr: number;
	totalIdr: number;
	promoCode: string | null;
	paymentUrl: string | null;
	paymentToken: string | null;
	paymentExpiresAt: string;
	paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUNDED";
	fulfillmentStatus: "UNFULFILLED" | "BOOKED" | "BOOKING_FAILED";
	lifecycleStatus: "UNFULFILLED" | "PROCESSING" | "FULFILLED" | "CANCELLED";
	refundState: "NONE" | "REQUIRED" | "EXTERNALLY_REFUNDED";
	courier: { name: string; serviceName: string; duration: string };
	tracking: { id: string | null; waybillId: string | null; status: string | null };
	createdAt: string;
};

declare global {
	interface Window {
		snap?: { pay: (token: string, callbacks: { onSuccess: () => void; onPending: () => void; onError: () => void; onClose: () => void }) => void };
	}
}

const midtransClientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
const midtransSnapUrl = String(process.env.NEXT_PUBLIC_MIDTRANS_ENV) === "production"
	? "https://app.midtrans.com/snap/snap.js"
	: "https://app.sandbox.midtrans.com/snap/snap.js";

export function OrderStatusClient({ id, autoOpenPayment = false }: { id: string; autoOpenPayment?: boolean }) {
	const messages = useDictionary().order;
	const locale = useLocale();
	const attempts = useRef(0);
	const autoPaymentHandled = useRef(false);
	const clearCart = useCartStore((state) => state.clear);
	const [copied, setCopied] = useState(false);
	const [snapReady, setSnapReady] = useState(false);
	const [paymentError, setPaymentError] = useState("");
	const { data: order, error, refetch } = useQuery({
		queryKey: ["order", id],
		queryFn: async () => {
			const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, { cache: "no-store" });
			if (!response.ok) throw new Error(messages.loadError);
			const receipt = await response.json() as OrderReceipt;
			attempts.current += 1;
			return receipt;
		},
		refetchInterval: (query) => {
			const receipt = query.state.data;
			if (query.state.status === "error" || !receipt) return false;
			if (receipt.lifecycleStatus === "CANCELLED") return false;
			if (receipt.paymentStatus === "PENDING") return 2_000;
			return receipt.paymentStatus === "PAID" && receipt.fulfillmentStatus === "UNFULFILLED" && attempts.current < 10 ? 2_000 : false;
		},
		refetchIntervalInBackground: true,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (order?.paymentStatus === "PAID") clearCart();
	}, [order?.paymentStatus, clearCart]);

	function openPayment() {
		if (!order?.paymentToken || !window.snap) {
			setPaymentError(messages.paymentUnavailable);
			return;
		}
		setPaymentError("");
		window.snap.pay(order.paymentToken, {
			onSuccess: () => { void refetch(); },
			onPending: () => { void refetch(); },
			onError: () => setPaymentError(messages.paymentFailed),
			onClose: () => undefined,
		});
	}

	useEffect(() => {
		if (!autoOpenPayment) return;
		window.history.replaceState(null, "", localizedPath(locale, `/orders/${id}`));
	}, [autoOpenPayment, id, locale]);

	useEffect(() => {
		if (!autoOpenPayment || !order || !snapReady || autoPaymentHandled.current) return;
		autoPaymentHandled.current = true;
		if (order.paymentStatus !== "PENDING" || !order.paymentToken) return;
		const storageKey = `midtrans-auto-open:${id}`;
		if (sessionStorage.getItem(storageKey)) return;
		sessionStorage.setItem(storageKey, "1");
		window.snap?.pay(order.paymentToken, {
			onSuccess: () => { void refetch(); },
			onPending: () => { void refetch(); },
			onError: () => setPaymentError(messages.paymentFailed),
			onClose: () => undefined,
		});
	}, [autoOpenPayment, id, messages.paymentFailed, order, refetch, snapReady]);

	if (!order) return <main className="page-shell order-status-page"><section className="order-status-card"><p className="eyebrow">{messages.title}</p><h1>{error instanceof Error ? error.message : messages.loading}</h1></section></main>;
	const payment = messages.paymentStatuses[order.paymentStatus];
	const fulfillment = messages.fulfillmentStatuses[order.fulfillmentStatus];
	const lifecycle = messages.lifecycleStatuses[order.lifecycleStatus];
	const refund = messages.refundStatuses[order.refundState];
	const heading = order.lifecycleStatus === "CANCELLED" ? lifecycle : payment;
	const orderNumber = order.orderNumber;
	async function copyOrderNumber() {
		try {
			await navigator.clipboard.writeText(orderNumber);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	}
	return (
		<main className="page-shell order-status-page">
			{midtransClientKey ? <Script src={midtransSnapUrl} data-client-key={midtransClientKey} strategy="afterInteractive" onReady={() => setSnapReady(Boolean(window.snap))} onError={() => setPaymentError(messages.paymentUnavailable)} /> : null}
			<section className="order-status-card">
				<p className="eyebrow">{messages.title}</p>
				<h1>{heading}</h1>
				<p className="order-number-line"><span>{messages.orderNumber}: <strong>{orderNumber}</strong></span><button className="order-number-copy" type="button" onClick={copyOrderNumber} aria-label={copied ? messages.orderNumberCopied : messages.copyOrderNumber}>{copied ? messages.orderNumberCopied : messages.copyOrderNumber}</button></p>
				{order.refundState !== "NONE" ? <p className="payment-notice" role="status">{refund}</p> : null}
				{order.paymentStatus === "PENDING" && order.paymentToken ? <div className="payment-notice" role="status"><p>{messages.paymentLinkSent}</p><p>{messages.paymentExpires} {new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(order.paymentExpiresAt))} WIB.</p><button className="button button-dark" type="button" disabled={!snapReady} onClick={openPayment}>{messages.continuePayment}</button></div> : null}
				{paymentError ? <p className="payment-notice" role="alert">{paymentError}</p> : null}
				<dl>
					<div><dt>{messages.payment}</dt><dd>{payment}</dd></div>
					<div><dt>{messages.fulfillment}</dt><dd>{lifecycle}</dd></div>
					<div><dt>{messages.shipment}</dt><dd>{fulfillment}</dd></div>
					<div><dt>{messages.courier}</dt><dd>{order.courier.name} — {order.courier.serviceName}</dd></div>
					{order.tracking.waybillId ? <div><dt>{messages.waybill}</dt><dd>{order.tracking.waybillId}</dd></div> : null}
					<div><dt>{messages.subtotal}</dt><dd>{formatPrice(order.subtotalIdr, locale)}</dd></div>
					{order.promoCode ? <div><dt>{messages.promoCode} · {order.promoCode}</dt><dd>-{formatPrice(order.discountIdr, locale)}</dd></div> : null}
					<div><dt>{messages.shipping}</dt><dd>{formatPrice(order.shippingOriginalIdr, locale)}</dd></div>
					{order.shippingDiscountIdr ? <div><dt>{messages.freeShippingCoverage}</dt><dd>-{formatPrice(order.shippingDiscountIdr, locale)}</dd></div> : null}
					{order.shippingDiscountIdr ? <div><dt>{messages.netShipping}</dt><dd>{formatPrice(order.shippingIdr, locale)}</dd></div> : null}
					{order.insuranceFeeIdr ? <div><dt>{messages.shippingInsurance}</dt><dd>{formatPrice(order.insuranceFeeIdr, locale)}</dd></div> : null}
					<div><dt>{messages.total}</dt><dd>{formatPrice(order.totalIdr, locale)}</dd></div>
				</dl>
				{error instanceof Error ? <p className="payment-notice" role="alert">{error.message}</p> : null}
				<div className="order-status-actions"><Link className="button button-dark" href={localizedPath(locale, "/track-order")}>{messages.trackShipment}</Link><Link className="button" href={localizedPath(locale)}>{messages.returnHome}</Link></div>
			</section>
		</main>
	);
}
