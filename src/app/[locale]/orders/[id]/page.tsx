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

export default async function OrderPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
	return <QueryProvider><OrderStatusClient id={(await params).id} /></QueryProvider>;
}
