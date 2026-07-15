import { CartClient } from "@/components/cart-client";
import { mockProducts } from "@/lib/mock";

export const metadata = { title: "Your Cart" };

export default function CartPage() {
	return <main className="page-shell cart-page"><CartClient products={mockProducts} /></main>;
}
