import { CartClient } from "@/components/cart-client";
import { catalog } from "@/lib/catalog";

export const metadata = { title: "Your Cart" };

export default async function CartPage() {
	// ponytail: preload is capped at the public API maximum; add ID-based hydration when the catalog exceeds 100 products.
	const products = await catalog.listProducts({ limit: 100 });
	return <main className="page-shell cart-page"><CartClient products={products.data} /></main>;
}
