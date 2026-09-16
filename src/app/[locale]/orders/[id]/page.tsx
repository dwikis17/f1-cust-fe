import type { Metadata } from "next";
import { OrderStatusClient } from "@/components/order-status-client";
import { QueryProvider } from "@/components/query-provider";
import { dictionary } from "@/lib/i18n";
import { parseLocale } from "@/lib/locale";
import { noIndexMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
	const locale = parseLocale((await params).locale);
	return locale ? noIndexMetadata(dictionary(locale).order.title) : {};
}

export default async function OrderPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ pay?: string }> }) {
	const [{ id }, query] = await Promise.all([params, searchParams]);
	return <QueryProvider><OrderStatusClient id={id} autoOpenPayment={query.pay === "1"} /></QueryProvider>;
}
