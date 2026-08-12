import type { Metadata } from "next";
import Link from "next/link";

import { CollectionResults, collectionQuery, type CollectionSearchParams } from "@/components/collection-results";
import { StructuredData } from "@/components/structured-data";
import { catalog } from "@/lib/catalog";
import { dictionary } from "@/lib/i18n";
import { localeAlternates, localizedPath, parseLocale } from "@/lib/locale";
import { absoluteUrl, siteName } from "@/lib/seo";

type SalePageProps = {
	params: Promise<{ locale: string }>;
	searchParams: Promise<CollectionSearchParams>;
};

export async function generateMetadata({ params, searchParams }: SalePageProps): Promise<Metadata> {
	const [{ locale: value }, currentParams] = await Promise.all([params, searchParams]);
	const locale = parseLocale(value);
	if (!locale) return {};
	const messages = dictionary(locale);
	const path = localizedPath(locale, "/sale");
	const hasQuery = Object.values(currentParams).some((item) => item !== undefined && item !== "");
	return {
		title: messages.sale.title,
		description: messages.sale.intro,
		alternates: { canonical: path, ...localeAlternates("/sale") },
		robots: hasQuery ? { index: false, follow: true } : undefined,
		openGraph: { title: messages.sale.title, description: messages.sale.intro, url: path },
	};
}

export default async function SalePage({ params, searchParams }: SalePageProps) {
	const [{ locale: value }, currentParams] = await Promise.all([params, searchParams]);
	const locale = parseLocale(value);
	if (!locale) return null;
	const messages = dictionary(locale);
	const path = localizedPath(locale, "/sale");
	const homePath = localizedPath(locale);
	const response = await catalog.listProducts({
		...collectionQuery(currentParams),
		sale: true,
		includeFacets: true,
	}, locale);

	return (
		<main className="page-shell collection-page">
			<StructuredData data={{
				"@context": "https://schema.org",
				"@type": "CollectionPage",
				name: messages.sale.title,
				description: messages.sale.intro,
				url: absoluteUrl(path),
				isPartOf: { "@type": "WebSite", name: siteName, url: absoluteUrl(homePath) },
			}} />
			<section className="collection-title">
				<nav className="breadcrumbs" aria-label={messages.sale.breadcrumb}>
					<Link href={homePath}>{messages.collections.homepage}</Link>
					<span>/</span>
					<strong>{messages.sale.breadcrumb}</strong>
				</nav>
				<p className="eyebrow">{messages.sale.eyebrow}</p>
				<h1>{messages.sale.title}</h1>
				<p>{messages.sale.intro}</p>
			</section>
			<CollectionResults path={path} params={currentParams} response={response} locale={locale} />
		</main>
	);
}
