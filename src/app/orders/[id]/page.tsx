import type { Metadata } from "next";
import { OrderStatusClient } from "@/components/order-status-client";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
	return { title: dictionary(await getLocale()).order.title };
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
	return <OrderStatusClient id={(await params).id} />;
}
