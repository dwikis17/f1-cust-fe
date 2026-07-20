"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/catalog";
import { localizedPath } from "@/lib/locale";

type OrderReceipt = {
	id: string;
	orderNumber: string;
	subtotalIdr: number;
	discountIdr: number;
	shippingIdr: number;
	totalIdr: number;
	promoCode: string | null;
	paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUNDED";
	fulfillmentStatus: "UNFULFILLED" | "BOOKED" | "BOOKING_FAILED";
	courier: { name: string; serviceName: string; duration: string };
	tracking: { id: string | null; waybillId: string | null; status: string | null };
	createdAt: string;
};

export function OrderStatusClient({ id }: { id: string }) {
	const messages = useDictionary().order;
	const locale = useLocale();
	const attempts = useRef(0);
	const clearCart = useCartStore((state) => state.clear);
	const { data: order, error } = useQuery({
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
			if (query.state.status === "error" || !receipt || attempts.current >= 10) return false;
			return receipt.paymentStatus === "PENDING" || (receipt.paymentStatus === "PAID" && receipt.fulfillmentStatus === "UNFULFILLED") ? 2_000 : false;
		},
		refetchIntervalInBackground: true,
		refetchOnReconnect: false,
		refetchOnWindowFocus: false,
	});

	useEffect(() => {
		if (order?.paymentStatus === "PAID") clearCart();
	}, [order?.paymentStatus, clearCart]);

	if (!order) return <main className="page-shell order-status-page"><section className="order-status-card"><p className="eyebrow">{messages.title}</p><h1>{error instanceof Error ? error.message : messages.loading}</h1></section></main>;
	const payment = messages.paymentStatuses[order.paymentStatus];
	const fulfillment = messages.fulfillmentStatuses[order.fulfillmentStatus];
	return (
		<main className="page-shell order-status-page">
			<section className="order-status-card">
				<p className="eyebrow">{messages.title}</p>
				<h1>{payment}</h1>
				<p>{messages.orderNumber}: <strong>{order.orderNumber}</strong></p>
				<dl>
					<div><dt>{messages.payment}</dt><dd>{payment}</dd></div>
					<div><dt>{messages.fulfillment}</dt><dd>{fulfillment}</dd></div>
					<div><dt>{messages.courier}</dt><dd>{order.courier.name} — {order.courier.serviceName}</dd></div>
					{order.tracking.waybillId ? <div><dt>{messages.waybill}</dt><dd>{order.tracking.waybillId}</dd></div> : null}
					<div><dt>{messages.subtotal}</dt><dd>{formatPrice(order.subtotalIdr, locale)}</dd></div>
					{order.promoCode ? <div><dt>{messages.promoCode} · {order.promoCode}</dt><dd>-{formatPrice(order.discountIdr, locale)}</dd></div> : null}
					<div><dt>{messages.shipping}</dt><dd>{formatPrice(order.shippingIdr, locale)}</dd></div>
					<div><dt>{messages.total}</dt><dd>{formatPrice(order.totalIdr, locale)}</dd></div>
				</dl>
				{error instanceof Error ? <p className="payment-notice" role="alert">{error.message}</p> : null}
				<div className="order-status-actions"><Link className="button button-dark" href={localizedPath(locale, "/track-order")}>{messages.trackShipment}</Link><Link className="button" href={localizedPath(locale)}>{messages.returnHome}</Link></div>
			</section>
		</main>
	);
}
