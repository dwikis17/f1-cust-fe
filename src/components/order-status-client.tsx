"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { writeStoredCart } from "@/lib/cart";
import { formatPrice } from "@/lib/catalog";

type OrderReceipt = {
	id: string;
	subtotalIdr: number;
	shippingIdr: number;
	totalIdr: number;
	paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUNDED";
	fulfillmentStatus: "UNFULFILLED" | "BOOKED" | "BOOKING_FAILED";
	courier: { name: string; serviceName: string; duration: string };
	tracking: { id: string | null; waybillId: string | null; status: string | null };
	createdAt: string;
};

export function OrderStatusClient({ id }: { id: string }) {
	const messages = useDictionary().order;
	const locale = useLocale();
	const [order, setOrder] = useState<OrderReceipt>();
	const [error, setError] = useState("");

	useEffect(() => {
		let active = true;
		let timer: ReturnType<typeof setTimeout>;
		let attempts = 0;
		async function load() {
			try {
				const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, { cache: "no-store" });
				if (!response.ok) throw new Error(messages.loadError);
				const next = await response.json() as OrderReceipt;
				if (!active) return;
				setOrder(next);
				setError("");
				if (next.paymentStatus === "PAID") writeStoredCart(localStorage, []);
				attempts += 1;
				if (attempts < 10 && (next.paymentStatus === "PENDING" || (next.paymentStatus === "PAID" && next.fulfillmentStatus === "UNFULFILLED"))) {
					timer = setTimeout(load, 2_000);
				}
			} catch (loadError) {
				if (active) setError(loadError instanceof Error ? loadError.message : messages.loadError);
			}
		}
		load();
		return () => { active = false; clearTimeout(timer); };
	}, [id, messages.loadError]);

	if (!order) return <main className="page-shell order-status-page"><section className="order-status-card"><p className="eyebrow">{messages.title}</p><h1>{error || messages.loading}</h1></section></main>;
	const payment = messages.paymentStatuses[order.paymentStatus];
	const fulfillment = messages.fulfillmentStatuses[order.fulfillmentStatus];
	return (
		<main className="page-shell order-status-page">
			<section className="order-status-card">
				<p className="eyebrow">{messages.title}</p>
				<h1>{payment}</h1>
				<p>{messages.orderNumber}: <strong>{order.id}</strong></p>
				<dl>
					<div><dt>{messages.payment}</dt><dd>{payment}</dd></div>
					<div><dt>{messages.fulfillment}</dt><dd>{fulfillment}</dd></div>
					<div><dt>{messages.courier}</dt><dd>{order.courier.name} — {order.courier.serviceName}</dd></div>
					{order.tracking.waybillId ? <div><dt>{messages.waybill}</dt><dd>{order.tracking.waybillId}</dd></div> : null}
					<div><dt>{messages.subtotal}</dt><dd>{formatPrice(order.subtotalIdr, locale)}</dd></div>
					<div><dt>{messages.shipping}</dt><dd>{formatPrice(order.shippingIdr, locale)}</dd></div>
					<div><dt>{messages.total}</dt><dd>{formatPrice(order.totalIdr, locale)}</dd></div>
				</dl>
				{error ? <p className="payment-notice" role="alert">{error}</p> : null}
				<Link className="button button-dark" href="/">{messages.returnHome}</Link>
			</section>
		</main>
	);
}
