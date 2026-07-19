import type { Metadata } from "next";
import { TrackOrderClient } from "@/components/track-order-client";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
	return { title: dictionary(await getLocale()).metadata.trackOrderTitle };
}

export default function TrackOrderPage() {
	return <TrackOrderClient />;
}
