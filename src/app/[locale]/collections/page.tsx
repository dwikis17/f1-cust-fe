import type { Metadata } from "next";
import Link from "next/link";

import { CollectionGalleryTabs } from "@/components/collection-gallery-tabs";
import { CollectionResults, collectionQuery, type CollectionSearchParams } from "@/components/collection-results";
import { catalog } from "@/lib/catalog";
import { dictionary } from "@/lib/i18n";
import { localeAlternates, localizedPath, parseLocale } from "@/lib/locale";

type PageProps = { params: Promise<{ locale: string }>; searchParams: Promise<CollectionSearchParams> };

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
	const [{ locale: value }, currentParams] = await Promise.all([params, searchParams]);
	const locale = parseLocale(value);
	if (!locale) return {};
	const messages = dictionary(locale);
	const path = localizedPath(locale, "/collections");
	const query = collectionQuery(currentParams);
	const hasSearch = Boolean(query.search);
	return {
		title: hasSearch ? messages.filters.searchResults : messages.collections.title,
		description: hasSearch ? `${messages.filters.searchResultsFor} “${query.search}”.` : messages.collections.intro,
		alternates: { canonical: path, ...localeAlternates("/collections") },
		robots: hasSearch ? { index: false, follow: true } : undefined,
		openGraph: {
			title: hasSearch ? messages.filters.searchResults : messages.collections.title,
			description: hasSearch ? `${messages.filters.searchResultsFor} “${query.search}”.` : messages.collections.intro,
			url: path,
		},
	};
}

export default async function CollectionsPage({ params, searchParams }: PageProps) {
	const [{ locale: value }, currentParams] = await Promise.all([params, searchParams]);
	const locale = parseLocale(value);
	if (!locale) return null;
	const messages = dictionary(locale);
	const query = collectionQuery(currentParams);
	const path = localizedPath(locale, "/collections");
	if (query.search) {
		const response = await catalog.listProducts({ ...query, includeFacets: true }, locale);
		return (
			<main className="page-shell collection-page">
				<section className="collection-title collection-gallery-hero">
					<nav className="breadcrumbs" aria-label={messages.collections.breadcrumb}>
						<Link href={localizedPath(locale)}>{messages.collections.homepage}</Link>
						<span>/</span>
						<span>{messages.filters.searchResults}</span>
					</nav>
					<p className="eyebrow">{messages.filters.searchResults}</p>
					<h1>{messages.filters.searchResults}</h1>
					<p>{messages.filters.searchResultsFor} “{query.search}”</p>
				</section>
				<CollectionResults path={path} params={currentParams} response={response} locale={locale} />
			</main>
		);
	}
	const parents = (await catalog.listCollections(locale)).filter((collection) => collection.children.length > 0);

	return (
		<main className="page-shell collection-page">
			<section className="collection-title collection-gallery-hero">
				<nav className="breadcrumbs" aria-label={messages.collections.breadcrumb}>
					<Link href={localizedPath(locale)}>{messages.collections.homepage}</Link>
					<span>/</span>
					<span>{messages.collections.title}</span>
				</nav>
				<p className="eyebrow">{messages.collections.browse}</p>
				<h1>{messages.collections.title}</h1>
				<p>{messages.collections.intro}</p>
			</section>
			<CollectionGalleryTabs parents={parents} locale={locale} />
		</main>
	);
}
