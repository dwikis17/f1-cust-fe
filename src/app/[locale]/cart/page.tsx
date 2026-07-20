import type { Metadata } from "next";
import { CartClient } from "@/components/cart-client";
import { dictionary } from "@/lib/i18n";
import { parseLocale } from "@/lib/locale";
import { noIndexMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const locale = parseLocale((await params).locale);
	return locale ? noIndexMetadata(dictionary(locale).metadata.cartTitle) : {};
}

export default function CartPage() {
	return <main className="page-shell cart-page"><CartClient /></main>;
}
