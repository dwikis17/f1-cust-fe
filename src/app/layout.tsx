import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { AppProviders } from "@/components/app-providers";
import { I18nProvider } from "@/components/i18n-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import "./globals.css";

const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const body = Hanken_Grotesk({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
	const messages = dictionary(await getLocale());
	return {
		title: { default: messages.metadata.title, template: messages.metadata.titleTemplate },
		description: messages.metadata.description,
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
