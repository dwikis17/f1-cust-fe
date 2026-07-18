import type { Metadata } from "next";
import { CartClient } from "@/components/cart-client";
import { catalog } from "@/lib/catalog";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
	return { title: dictionary(await getLocale()).metadata.cartTitle };
}

export default async function CartPage() {
	const locale = await getLocale();
	// ponytail: preload is capped at the public API maximum; add ID-based hydration when the catalog exceeds 100 products.
	const products = await catalog.listProducts({ limit: 100 }, locale);
	return <main className="page-shell cart-page"><CartClient products={products.data} /></main>;
}
