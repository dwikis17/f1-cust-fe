import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import { I18nProvider } from "@/components/i18n-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { siteName, siteUrl } from "@/lib/seo";
import "./globals.css";

const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const body = Hanken_Grotesk({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
	const messages = dictionary(await getLocale());
	const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
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
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-image-preview": "large",
				"max-snippet": -1,
				"max-video-preview": -1,
			},
		},
		verification: googleVerification ? { google: googleVerification } : undefined,
	};
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const locale = await getLocale();
	return (
		<html lang={locale} data-scroll-behavior="smooth">
			<body className={`${display.variable} ${body.variable} ${mono.variable}`}>
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
