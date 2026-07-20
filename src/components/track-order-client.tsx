"use client";

import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { formatPrice } from "@/lib/catalog";
import { localizedPath } from "@/lib/locale";

type TrackingResponse = {
	orderNumber: string;
	createdAt: string;
	paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUNDED";
	fulfillmentStatus: "UNFULFILLED" | "BOOKED" | "BOOKING_FAILED";
	destination: { city: string; province: string };
	courier: { name: string; serviceName: string; duration: string };
	items: Array<{ name: string; sku: string; color: string | null; size: string | null; unitPriceIdr: number; quantity: number }>;
	tracking: null | {
		waybillId: string;
		status: string;
		link: string | null;
		history: Array<{ status: string; note: string; updatedAt: string }>;
	};
};

const statusAliases = {
	confirmed: "confirmed",
	scheduled: "scheduled",
	allocated: "allocated",
	picking_up: "pickingUp",
	picked: "picked",
	in_transit: "inTransit",
	dropping_off: "droppingOff",
	return_in_transit: "returnInTransit",
	on_hold: "onHold",
	delivered: "delivered",
	rejected: "rejected",
	courier_not_found: "courierNotFound",
	returned: "returned",
	cancelled: "cancelled",
	disposed: "disposed",
} as const;

function normalizeStatus(status: string) {
	return status.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[\s-]+/g, "_").toLowerCase();
}

function humanizeStatus(status: string) {
	const value = normalizeStatus(status).replaceAll("_", " ");
	return value ? value.replace(/^./, (character) => character.toUpperCase()) : "—";
}

function formatDate(value: string, locale: "en" | "id", includeTime = true) {
	const date = new Date(value);
	if (Number.isNaN(date.valueOf())) return value;
	return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-ID", {
		dateStyle: "medium",
		...(includeTime ? { timeStyle: "short" as const } : {}),
	}).format(date);
}

export function TrackOrderClient() {
	const messages = useDictionary().tracking;
	const locale = useLocale();
	const [orderNumber, setOrderNumber] = useState("");
	const [email, setEmail] = useState("");
	const [copied, setCopied] = useState(false);
	const tracking = useMutation({
		mutationFn: async () => {
			const response = await fetch("/api/orders/track", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ orderNumber, email }),
			});
			const body = await response.json() as TrackingResponse & { error?: { code?: string } };
			if (!response.ok) {
				if (body.error?.code === "TRACKING_NOT_FOUND") throw new Error(messages.notFound);
				if (body.error?.code === "VALIDATION_ERROR") throw new Error(messages.invalidDetails);
				throw new Error(messages.unavailable);
			}
			return body;
		},
	});

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setCopied(false);
		tracking.mutate();
	}

	const result = tracking.data;
	const statusLabel = (status: string) => {
		const key = statusAliases[normalizeStatus(status) as keyof typeof statusAliases];
		return key ? messages.statuses[key] : humanizeStatus(status);
	};
	const fallbackStatus = result?.paymentStatus === "PENDING"
		? messages.waitingPayment
		: result?.fulfillmentStatus === "BOOKING_FAILED"
			? messages.bookingIssue
			: result?.fulfillmentStatus === "UNFULFILLED"
				? messages.preparingShipment
				: messages.notYetAvailable;
	const latestUpdate = result?.tracking?.history.at(-1)?.updatedAt;

	return (
		<main className="page-shell tracking-page">
			<header className="tracking-hero">
				<p className="eyebrow">{messages.eyebrow}</p>
				<h1>{messages.title}</h1>
				<p>{messages.intro}</p>
				<form className="tracking-form" onSubmit={submit}>
					<label><span>{messages.orderNumber}</span><input required maxLength={40} value={orderNumber} onChange={(event) => setOrderNumber(event.target.value.toUpperCase())} placeholder={messages.orderPlaceholder} autoCapitalize="characters" autoComplete="off" spellCheck={false} /></label>
					<label><span>{messages.email}</span><input required type="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder={messages.emailPlaceholder} autoComplete="email" /></label>
					<button className="button button-dark" type="submit" disabled={tracking.isPending}>{tracking.isPending ? messages.locating : messages.locate}</button>
				</form>
				<p className="tracking-form-status" role={tracking.error ? "alert" : "status"} aria-live="polite">{tracking.error instanceof Error ? tracking.error.message : tracking.isPending ? messages.locatingStatus : ""}</p>
			</header>

			{result ? <section className="tracking-results" aria-live="polite">
				<div className="tracking-summary">
					<div><span>{messages.deliveryEstimate}</span><strong>{result.courier.duration || messages.estimateUnavailable}</strong></div>
					<div><span>{messages.status}</span><strong>{result.tracking ? statusLabel(result.tracking.status) : fallbackStatus}</strong></div>
				</div>
				<div className="tracking-grid">
					<article className="tracking-timeline-card">
						<header><div><span className="tracking-badge">{messages.orderActive}</span><h2>{messages.shipment} {result.orderNumber}</h2><p>{messages.destination}: {result.destination.city}, {result.destination.province}</p></div><div><span>{messages.ordered}</span><strong>{formatDate(result.createdAt, locale, false)}</strong></div></header>
						{result.tracking?.history.length ? <ol className="tracking-timeline">{result.tracking.history.map((event, index) => <li className={index === result.tracking!.history.length - 1 ? "current" : "complete"} key={`${event.updatedAt}-${index}`}><span aria-hidden="true" /><div><strong>{statusLabel(event.status)}</strong><time dateTime={event.updatedAt}>{formatDate(event.updatedAt, locale)}</time><p>{event.note}</p></div></li>)}</ol> : <div className="tracking-pending"><h3>{fallbackStatus}</h3><p>{messages.notYetAvailableText}</p></div>}
					</article>

					<aside className="tracking-sidebar">
						<section className="tracking-detail-card"><h2>{messages.shippingDetails}</h2><dl><div><dt>{messages.carrier}</dt><dd>{result.courier.name}</dd></div><div><dt>{messages.service}</dt><dd>{result.courier.serviceName}</dd></div>{result.tracking ? <div className="wide"><dt>{messages.trackingNumber}</dt><dd><span>{result.tracking.waybillId}</span><button type="button" onClick={async () => { await navigator.clipboard.writeText(result.tracking!.waybillId); setCopied(true); }} aria-label={messages.copyTracking}>{copied ? messages.copied : messages.copy}</button></dd></div> : null}</dl>{result.tracking?.link ? <a className="text-link" href={result.tracking.link} target="_blank" rel="noreferrer">{messages.openCarrier}</a> : null}</section>
						<section className="tracking-package-card"><h2>{messages.packageContents}</h2><ul>{result.items.map((item) => <li key={item.sku}><div><strong>{item.name}</strong><span>{[item.color, item.size, item.sku].filter(Boolean).join(" · ")}</span></div><div><span>{messages.quantity} {item.quantity}</span><strong>{formatPrice(item.unitPriceIdr * item.quantity, locale)}</strong></div></li>)}</ul></section>
						<Link className="tracking-support" href={localizedPath(locale, "/help/contact")}><strong>{messages.needHelp}</strong><span>{messages.supportText}</span><b>{messages.contactSupport} →</b></Link>
					</aside>
				</div>
				<div className="tracking-source"><span>{messages.source}: Biteship</span><span>{messages.lastUpdate}: {latestUpdate ? formatDate(latestUpdate, locale) : messages.noUpdates}</span></div>
			</section> : null}
		</main>
	);
}
