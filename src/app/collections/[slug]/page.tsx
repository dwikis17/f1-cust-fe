import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CollectionResults, collectionQuery, type CollectionSearchParams } from "@/components/collection-results";
import { StructuredData } from "@/components/structured-data";
import { catalog } from "@/lib/catalog";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { absoluteUrl, metadataDescription } from "@/lib/seo";

type CollectionPageProps = {
	params: Promise<{ slug: string }>;
	searchParams: Promise<CollectionSearchParams>;
};

export async function generateMetadata({ params, searchParams }: CollectionPageProps): Promise<Metadata> {
	const [{ slug }, currentParams, locale] = await Promise.all([params, searchParams, getLocale()]);
	const response = await catalog.listCollectionProducts(slug, { limit: 1 }, locale);
	if (!response) return {};
	const messages = dictionary(locale);
	const path = `/collections/${response.collection.slug}`;
	const description = metadataDescription(
		response.collection.description,
		locale === "id"
			? `Belanja koleksi ${response.collection.name} di Valyde Jersey.`
			: `Shop the ${response.collection.name} collection at Valyde Jersey.`,
	);
	const hasQuery = Object.values(currentParams).some((value) => value !== undefined && value !== "");
	return {
		title: response.collection.name,
		description,
		alternates: { canonical: path },
		robots: hasQuery ? { index: false, follow: true } : undefined,
		openGraph: {
			type: "website",
			title: response.collection.name,
			description,
			url: path,
			images: response.collection.imageUrl ? [response.collection.imageUrl] : undefined,
		},
		twitter: {
			card: "summary_large_image",
			title: response.collection.name,
			description,
			images: response.collection.imageUrl ? [response.collection.imageUrl] : undefined,
		},
	};
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
	const [{ slug }, currentParams] = await Promise.all([params, searchParams]);
	const locale = await getLocale();
	const messages = dictionary(locale);
	const response = await catalog.listCollectionProducts(slug, collectionQuery(currentParams), locale);
	if (!response) notFound();
	const path = `/collections/${response.collection.slug}`;
	return <main className="page-shell collection-page">
		<StructuredData data={{
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [
				{ "@type": "ListItem", position: 1, name: messages.collections.homepage, item: absoluteUrl("/") },
				{ "@type": "ListItem", position: 2, name: messages.collections.title, item: absoluteUrl("/collections") },
				...(response.collection.parent ? [{ "@type": "ListItem", position: 3, name: response.collection.parent.name, item: absoluteUrl(`/collections/${response.collection.parent.slug}`) }] : []),
				{ "@type": "ListItem", position: response.collection.parent ? 4 : 3, name: response.collection.name, item: absoluteUrl(path) },
			],
		}} />
		<section className="collection-title"><nav className="breadcrumbs" aria-label={messages.collections.breadcrumb}><Link href="/">{messages.collections.homepage}</Link><span>/</span><Link href="/collections">{messages.collections.title}</Link>{response.collection.parent ? <><span>/</span><Link href={`/collections/${response.collection.parent.slug}`}>{response.collection.parent.name}</Link></> : null}</nav><p className="eyebrow">{messages.kinds[response.collection.kind]}</p><h1>{response.collection.name}</h1><p>{response.collection.description}</p>{response.collection.children.length ? <div className="child-collections">{response.collection.children.map((child) => <Link key={child.id} href={`/collections/${child.slug}`}>{child.name}</Link>)}</div> : null}</section>
		<CollectionResults path={path} params={currentParams} response={response} locale={locale} />
	</main>;
}
