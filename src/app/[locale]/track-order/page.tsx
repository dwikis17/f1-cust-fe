import type { Metadata } from "next";
import { TrackOrderClient } from "@/components/track-order-client";
import { QueryProvider } from "@/components/query-provider";
import { dictionary } from "@/lib/i18n";
import { parseLocale } from "@/lib/locale";
import { noIndexMetadata } from "@/lib/seo";

type TrackOrderSearchParams = Record<string, string | string[] | undefined>;
type PageProps = { searchParams: Promise<TrackOrderSearchParams> };

const firstValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const locale = parseLocale((await params).locale);
	return locale ? noIndexMetadata(dictionary(locale).metadata.trackOrderTitle) : {};
}

export default async function TrackOrderPage({ searchParams }: PageProps) {
	const currentParams = await searchParams;
	const initialOrderNumber = firstValue(currentParams.orderNumber)?.trim().toUpperCase() ?? "";
	const initialEmail = firstValue(currentParams.email)?.trim() ?? "";
	const hasTrackingQuery = currentParams.orderNumber !== undefined || currentParams.email !== undefined;
	return <QueryProvider><TrackOrderClient initialOrderNumber={initialOrderNumber} initialEmail={initialEmail} hasTrackingQuery={hasTrackingQuery} /></QueryProvider>;
}
