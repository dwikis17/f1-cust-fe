import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CollectionGallery } from "@/components/collection-gallery";
import { CollectionResults, collectionQuery, type CollectionSearchParams } from "@/components/collection-results";
import { StructuredData } from "@/components/structured-data";
import { catalog } from "@/lib/catalog";
import { domainCollectionChildren } from "@/lib/collection-page";
import { dictionary } from "@/lib/i18n";
import { localeAlternates, localizedPath, parseLocale } from "@/lib/locale";
import { absoluteUrl, metadataDescription } from "@/lib/seo";

type CollectionPageProps = {
	params: Promise<{ locale: string; slug: string }>;
	searchParams: Promise<CollectionSearchParams>;
};

export async function generateMetadata({ params, searchParams }: CollectionPageProps): Promise<Metadata> {
	const [{ slug, locale: value }, currentParams] = await Promise.all([params, searchParams]);
	const locale = parseLocale(value);
	if (!locale) return {};
	const collection = await catalog.getCollection(slug, locale);
	if (!collection) return {};
	const basePath = `/collections/${collection.slug}`;
	const path = localizedPath(locale, basePath);
	const description = metadataDescription(
		collection.description,
		locale === "id"
			? `Belanja koleksi ${collection.name} di Valyde Jersey.`
			: `Shop the ${collection.name} collection at Valyde Jersey.`,
	);
	const hasQuery = Object.values(currentParams).some((value) => value !== undefined && value !== "");
	return {
		title: collection.name,
		description,
		alternates: { canonical: path, ...localeAlternates(basePath) },
		robots: hasQuery ? { index: false, follow: true } : undefined,
		openGraph: {
			type: "website",
			title: collection.name,
			description,
			url: path,
			images: collection.imageUrl ? [collection.imageUrl] : undefined,
		},
		twitter: {
			card: "summary_large_image",
			title: collection.name,
			description,
			images: collection.imageUrl ? [collection.imageUrl] : undefined,
		},
	};
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
	const [{ slug, locale: value }, currentParams] = await Promise.all([params, searchParams]);
	const locale = parseLocale(value);
	if (!locale) notFound();
	const messages = dictionary(locale);
	const response = await catalog.listCollectionProducts(slug, collectionQuery(currentParams), locale);
	if (!response) notFound();
	const path = localizedPath(locale, `/collections/${response.collection.slug}`);
	const collectionsPath = localizedPath(locale, "/collections");
	const homePath = localizedPath(locale);
	const galleryCollections = domainCollectionChildren(response.collection);
	const galleryTitle = response.collection.children[0]?.kind === "TEAM"
		? messages.collections.teams
		: response.collection.children[0]?.kind === "DRIVER"
			? messages.collections.drivers
			: response.collection.name;
	const identityImage = response.collection.kind === "TEAM" || response.collection.kind === "DRIVER" ? response.collection.imageUrl : null;
	return <main className="page-shell collection-page">
		<StructuredData data={{
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [
				{ "@type": "ListItem", position: 1, name: messages.collections.homepage, item: absoluteUrl(homePath) },
				{ "@type": "ListItem", position: 2, name: messages.collections.title, item: absoluteUrl(collectionsPath) },
				...(response.collection.parent ? [{ "@type": "ListItem", position: 3, name: response.collection.parent.name, item: absoluteUrl(localizedPath(locale, `/collections/${response.collection.parent.slug}`)) }] : []),
				{ "@type": "ListItem", position: response.collection.parent ? 4 : 3, name: response.collection.name, item: absoluteUrl(path) },
			],
		}} />
		<section className="collection-title"><nav className="breadcrumbs" aria-label={messages.collections.breadcrumb}><Link href={homePath}>{messages.collections.homepage}</Link><span>/</span><Link href={collectionsPath}>{messages.collections.title}</Link>{response.collection.parent ? <><span>/</span><Link href={localizedPath(locale, `/collections/${response.collection.parent.slug}`)}>{response.collection.parent.name}</Link></> : null}</nav><div className="collection-title-content">{identityImage ? <div className={`collection-title-image collection-title-image-${response.collection.kind.toLowerCase()}`}><Image src={identityImage} alt={response.collection.name} fill priority sizes="(max-width: 600px) 96px, 132px" /></div> : null}<div className="collection-title-copy"><p className="eyebrow">{messages.kinds[response.collection.kind]}</p><h1>{response.collection.name}</h1>{response.collection.description ? <p>{response.collection.description}</p> : null}{!galleryCollections && response.collection.children.length ? <div className="child-collections">{response.collection.children.map((child) => <Link key={child.id} href={localizedPath(locale, `/collections/${child.slug}`)}>{child.name}</Link>)}</div> : null}</div></div></section>
		{galleryCollections
			? <CollectionGallery id={response.collection.slug} title={galleryTitle} collections={galleryCollections} locale={locale} priority showTitle={false} />
			: <CollectionResults path={path} params={currentParams} response={response} locale={locale} />}
	</main>;
}
