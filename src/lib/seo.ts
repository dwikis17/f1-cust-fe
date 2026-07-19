import type { Metadata } from "next";

export const siteName = "Valyde Jersey";
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://valydejersey.com").replace(/\/$/, "");

export function absoluteUrl(path: string): string {
	return new URL(path, `${siteUrl}/`).toString();
}

export function metadataDescription(value: string, fallback: string): string {
	const description = value.trim() || fallback;
	return description.length <= 160 ? description : `${description.slice(0, 157).trimEnd()}…`;
}

export function noIndexMetadata(title: string): Metadata {
	return {
		title,
		robots: { index: false, follow: false, nocache: true },
	};
}
