import type { Locale } from "./i18n";

export const SUPPORT_EMAIL = "support@valydejersey.com";
export const SUPPORT_PHONE_DISPLAY = "+62 851-2156-5774";
export const SUPPORT_WHATSAPP_NUMBER = "6285121565774";
export const SUPPORT_WHATSAPP_URL = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}`;
export const SUPPORT_MAILTO_URL = `mailto:${SUPPORT_EMAIL}`;

export type SupportContent = {
	email: string;
	whatsappNumber: string;
	whatsappDisplay: string;
	mailtoUrl: string;
	whatsappUrl: string;
};

export type PublicShippingReturns = {
	title: string;
	intro: string;
	facts: Array<{ id: string; label: string; value: string }>;
	sections: Array<{
		id: string;
		title: string;
		body: string;
		items: Array<{ id: string; text: string }>;
	}>;
	support: SupportContent;
};

export const fallbackSupport: SupportContent = {
	email: SUPPORT_EMAIL,
	whatsappNumber: SUPPORT_WHATSAPP_NUMBER,
	whatsappDisplay: SUPPORT_PHONE_DISPLAY,
	mailtoUrl: SUPPORT_MAILTO_URL,
	whatsappUrl: SUPPORT_WHATSAPP_URL,
};

const apiBaseUrl = (process.env.API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export async function getSupportContent(): Promise<SupportContent> {
	try {
		const response = await fetch(`${apiBaseUrl}/api/content/support`, {
			cache: "force-cache",
			next: { tags: ["content:support"] },
		});
		if (!response.ok) return fallbackSupport;
		const value = await response.json() as SupportContent;
		return value.email && value.whatsappUrl && value.mailtoUrl ? value : fallbackSupport;
	} catch {
		return fallbackSupport;
	}
}

export async function getShippingReturnsContent(locale: Locale): Promise<PublicShippingReturns | null> {
	try {
		const response = await fetch(`${apiBaseUrl}/api/content/shipping-returns?locale=${locale}`, {
			cache: "force-cache",
			next: { tags: [`content:shipping-returns:${locale}`] },
		});
		if (!response.ok) return null;
		const value = await response.json() as PublicShippingReturns;
		return value.title && value.intro && Array.isArray(value.facts) && Array.isArray(value.sections) ? value : null;
	} catch {
		return null;
	}
}
