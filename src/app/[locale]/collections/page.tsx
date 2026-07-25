import type { Metadata } from "next";
import Link from "next/link";

import { CollectionGalleryTabs } from "@/components/collection-gallery-tabs";
import { catalog } from "@/lib/catalog";
import { dictionary } from "@/lib/i18n";
import { localeAlternates, localizedPath, parseLocale } from "@/lib/locale";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale: value } = await params;
	const locale = parseLocale(value);
	if (!locale) return {};
	const messages = dictionary(locale);
	const path = localizedPath(locale, "/collections");
	return {
		title: messages.collections.title,
		description: messages.collections.intro,
		alternates: { canonical: path, ...localeAlternates("/collections") },
		openGraph: {
			title: messages.collections.title,
			description: messages.collections.intro,
			url: path,
		},
	};
}

export default async function CollectionsPage({ params }: PageProps) {
	const { locale: value } = await params;
	const locale = parseLocale(value);
	if (!locale) return null;
	const messages = dictionary(locale);
	const parents = (await catalog.listCollections()).filter((collection) => collection.children.length > 0);

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
