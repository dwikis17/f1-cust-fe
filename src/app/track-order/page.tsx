import type { Metadata } from "next";
import { TrackOrderClient } from "@/components/track-order-client";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { noIndexMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
	return noIndexMetadata(dictionary(await getLocale()).metadata.trackOrderTitle);
}

export default function TrackOrderPage() {
	return <TrackOrderClient />;
}
