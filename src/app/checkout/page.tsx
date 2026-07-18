import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout-client";
import { catalog } from "@/lib/catalog";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
	return { title: dictionary(await getLocale()).metadata.checkoutTitle };
}

export default async function CheckoutPage() {
	const locale = await getLocale();
	// ponytail: preload is capped at the public API maximum; add ID-based hydration when the catalog exceeds 100 products.
	const products = await catalog.listProducts({ limit: 100 }, locale);
	return <CheckoutClient products={products.data} />;
}
