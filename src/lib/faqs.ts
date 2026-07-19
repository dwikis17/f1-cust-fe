import type { Locale } from "./i18n";

export type PublicFaq = { id: string; question: string; answer: string };

const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");

export async function listFaqs(locale: Locale): Promise<PublicFaq[]> {
	if (!apiBaseUrl) throw new Error("API_BASE_URL is required for storefront FAQ requests");
	const response = await fetch(`${apiBaseUrl}/api/faqs?locale=${locale}`, { next: { revalidate: 180 } });
	if (!response.ok) throw new Error(`FAQ API request failed with ${response.status}`);
	return response.json() as Promise<PublicFaq[]>;
}
