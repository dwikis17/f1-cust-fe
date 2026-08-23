import type { Metadata } from "next";
import { NotFoundBridge } from "@/components/not-found-bridge";
import { noIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = noIndexMetadata("Page not found");

export default function LocaleNotFound() {
	return <NotFoundBridge />;
}
