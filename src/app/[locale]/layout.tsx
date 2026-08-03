import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { AppProviders } from "@/components/app-providers";
import { I18nProvider } from "@/components/i18n-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { dictionary } from "@/lib/i18n";
import { localeStaticParams, parseLocale } from "@/lib/locale";
import { siteName, siteUrl } from "@/lib/seo";
import "../globals.css";

const plusJakarta = Plus_Jakarta_Sans({ variable: "--font-plus-jakarta", subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

export const dynamicParams = true;
export function generateStaticParams() {
	return localeStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale: value } = await params;
	const locale = parseLocale(value);
	if (!locale) return {};
	const messages = dictionary(locale);
	const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
	const isStaging = process.env.APP_ENV === "staging";
	return {
		metadataBase: new URL(siteUrl),
		applicationName: siteName,
		title: { default: messages.metadata.title, template: messages.metadata.titleTemplate },
		description: messages.metadata.description,
		openGraph: {
			type: "website",
			siteName,
			title: messages.metadata.title,
			description: messages.metadata.description,
			images: [{ url: "/images/generated/banner-desktop.webp", alt: messages.home.bannerAlt }],
		},
		twitter: {
			card: "summary_large_image",
			title: messages.metadata.title,
			description: messages.metadata.description,
			images: ["/images/generated/banner-desktop.webp"],
		},
		robots: {
			index: !isStaging,
			follow: !isStaging,
			googleBot: {
				index: !isStaging,
				follow: !isStaging,
				"max-image-preview": "large",
				"max-snippet": -1,
				"max-video-preview": -1,
			},
		},
		verification: googleVerification ? { google: googleVerification } : undefined,
	};
}

export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
	const { locale: value } = await params;
	const locale = parseLocale(value);
	if (!locale) notFound();
	return (
		<html lang={locale} data-scroll-behavior="smooth">
			<body className={`${plusJakarta.variable} ${manrope.variable}`}>
				<I18nProvider locale={locale}>
					<AppProviders>
						<SiteHeader locale={locale} />
						{children}
						<SiteFooter locale={locale} />
					</AppProviders>
				</I18nProvider>
			</body>
		</html>
	);
}
