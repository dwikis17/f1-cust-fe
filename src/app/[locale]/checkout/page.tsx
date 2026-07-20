import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout-client";
import { QueryProvider } from "@/components/query-provider";
import { dictionary } from "@/lib/i18n";
import { parseLocale } from "@/lib/locale";
import { noIndexMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const locale = parseLocale((await params).locale);
	return locale ? noIndexMetadata(dictionary(locale).metadata.checkoutTitle) : {};
}

export default function CheckoutPage() {
	return <QueryProvider><CheckoutClient /></QueryProvider>;
}
