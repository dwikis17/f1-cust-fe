import type { Metadata } from "next";
import { TrackOrderClient } from "@/components/track-order-client";
import { QueryProvider } from "@/components/query-provider";
import { dictionary } from "@/lib/i18n";
import { parseLocale } from "@/lib/locale";
import { noIndexMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const locale = parseLocale((await params).locale);
	return locale ? noIndexMetadata(dictionary(locale).metadata.trackOrderTitle) : {};
}

export default function TrackOrderPage() {
	return <QueryProvider><TrackOrderClient /></QueryProvider>;
}
