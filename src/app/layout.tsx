import type { Metadata } from "next";
import { Hanken_Grotesk, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const body = Hanken_Grotesk({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
	title: { default: "VALDYE | Precision F1 Collections", template: "%s | VALDYE" },
	description: "Precision-engineered Formula 1 teamwear, collectibles and technical accessories.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body className={`${display.variable} ${body.variable} ${mono.variable}`}>
				<SiteHeader />
				{children}
				<SiteFooter />
			</body>
		</html>
	);
}
