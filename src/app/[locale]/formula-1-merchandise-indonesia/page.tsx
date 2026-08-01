import type { Metadata } from "next";
import Link from "next/link";

import { StructuredData } from "@/components/structured-data";
import { dictionary } from "@/lib/i18n";
import { localeAlternates, localeStaticParams, localizedPath, parseLocale } from "@/lib/locale";
import { absoluteUrl, siteName } from "@/lib/seo";

export const dynamic = "force-static";
export const dynamicParams = false;

const merchandiseLinks = [
	{ slug: "mclaren", name: { en: "McLaren", id: "McLaren" } },
	{ slug: "red-bull-racing", name: { en: "Red Bull Racing", id: "Red Bull Racing" } },
	{ slug: "ferrari", name: { en: "Ferrari", id: "Ferrari" } },
	{ slug: "mercedes-amg", name: { en: "Mercedes-AMG", id: "Mercedes-AMG" } },
] as const;

export function generateStaticParams() {
	return localeStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const locale = parseLocale((await params).locale);
	if (!locale) return {};
	const messages = dictionary(locale);
	const pagePath = localizedPath(locale, "/formula-1-merchandise-indonesia");
	return {
		title: messages.merchandise.title,
		description: messages.merchandise.intro,
		alternates: { canonical: pagePath, ...localeAlternates("/formula-1-merchandise-indonesia") },
	};
}

export default async function MerchandisePage({ params }: { params: Promise<{ locale: string }> }) {
	const locale = parseLocale((await params).locale);
	if (!locale) return null;
	const messages = dictionary(locale);
	const homePath = localizedPath(locale);
	const collectionsPath = localizedPath(locale, "/collections");
	const pagePath = localizedPath(locale, "/formula-1-merchandise-indonesia");

	return (
		<main className="page-shell merchandise-page">
			<StructuredData data={{
				"@context": "https://schema.org",
				"@graph": [
					{
						"@type": "CollectionPage",
						"@id": `${absoluteUrl(pagePath)}#page`,
						name: messages.merchandise.title,
						description: messages.merchandise.intro,
						url: absoluteUrl(pagePath),
						inLanguage: locale === "id" ? "id-ID" : "en-US",
						isPartOf: { "@type": "WebSite", name: siteName, url: absoluteUrl(homePath) },
					},
					{
						"@type": "ItemList",
						"@id": `${absoluteUrl(pagePath)}#teams`,
						name: messages.merchandise.teamsTitle,
						itemListElement: merchandiseLinks.map((team, index) => ({
							"@type": "ListItem",
							position: index + 1,
							name: team.name[locale],
							url: absoluteUrl(localizedPath(locale, `/collections/${team.slug}`)),
						})),
					},
					{
						"@type": "BreadcrumbList",
						itemListElement: [
							{ "@type": "ListItem", position: 1, name: siteName, item: absoluteUrl(homePath) },
							{ "@type": "ListItem", position: 2, name: messages.merchandise.breadcrumb, item: absoluteUrl(pagePath) },
						],
					},
				],
			}} />

			<nav className="breadcrumbs" aria-label={messages.merchandise.breadcrumb}>
				<Link href={homePath}>{siteName}</Link><span>/</span><strong>{messages.merchandise.breadcrumb}</strong>
			</nav>

			<header className="merchandise-hero">
				<p className="merchandise-eyebrow">{messages.merchandise.eyebrow}</p>
				<h1>{messages.merchandise.title}</h1>
				<p>{messages.merchandise.intro}</p>
			</header>

			<div className="merchandise-layout">
				<article className="merchandise-guide">
					<section>
						<h2>{messages.merchandise.teamwearTitle}</h2>
						<p>{messages.merchandise.teamwearText}</p>
					</section>
					<section>
						<h2>{messages.merchandise.chooseTitle}</h2>
						<p>{messages.merchandise.chooseText}</p>
					</section>
					<section>
						<h2>{messages.merchandise.detailsTitle}</h2>
						<p>{messages.merchandise.detailsText}</p>
					</section>
					<Link className="button button-dark merchandise-cta" href={collectionsPath}>
						{messages.merchandise.shopAll}
					</Link>
				</article>

				<aside className="merchandise-teams" aria-labelledby="merchandise-teams-title">
					<div className="merchandise-teams-heading">
						<p className="eyebrow">{messages.merchandise.teamsEyebrow}</p>
						<h2 id="merchandise-teams-title">{messages.merchandise.teamsTitle}</h2>
					</div>
					<nav className="merchandise-team-links" aria-label={messages.merchandise.teamsTitle}>
						{merchandiseLinks.map((team) => (
							<Link
								className="merchandise-team-link"
								href={localizedPath(locale, `/collections/${team.slug}`)}
								aria-label={`${messages.merchandise.shopTeam}: ${team.name[locale]}`}
								key={team.slug}
							>
								<strong>{team.name[locale]}</strong><span aria-hidden="true">→</span>
							</Link>
						))}
					</nav>
				</aside>
			</div>
		</main>
	);
}
