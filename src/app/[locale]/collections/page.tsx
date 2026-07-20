import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { catalog } from "@/lib/catalog";
import { dictionary } from "@/lib/i18n";
import { localeAlternates, localizedPath, parseLocale } from "@/lib/locale";

type PageProps = { params: Promise<{ locale: string }>; searchParams: SearchParams };

export async function generateMetadata({ params: routeParams, searchParams }: PageProps): Promise<Metadata> {
	const [params, { locale: value }] = await Promise.all([searchParams, routeParams]);
	const locale = parseLocale(value);
	if (!locale) return {};
	const messages = dictionary(locale);
	const hasQuery = Object.values(params).some((value) => value !== undefined && value !== "");
	const path = localizedPath(locale, "/collections");
	return {
		title: messages.collections.title,
		description: messages.collections.intro,
		alternates: { canonical: path, ...localeAlternates("/collections") },
		robots: hasQuery ? { index: false, follow: true } : undefined,
		openGraph: {
			title: messages.collections.title,
			description: messages.collections.intro,
			url: path,
		},
	};
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function CollectionsPage({ params: routeParams, searchParams }: PageProps) {
	const [params, { locale: value }] = await Promise.all([searchParams, routeParams]);
	const search = first(params.search);
	const locale = parseLocale(value);
	if (!locale) return null;
	const messages = dictionary(locale);
	const collectionsPath = localizedPath(locale, "/collections");
	const [tree, products] = await Promise.all([catalog.listCollections(), catalog.listProducts({ search, limit: 24 }, locale)]);
	return <main className="page-shell collection-page">
		<section className="collection-title collection-directory-heading"><p className="eyebrow">{messages.collections.browse}</p><h1>{messages.collections.title}</h1><p>{messages.collections.intro}</p></section>
		<section className="all-products" id="catalog"><div className="catalog-toolbar"><span>{products.total.toString().padStart(2, "0")} {messages.collections.products}</span><form className="catalog-search" action={collectionsPath}><label>{messages.collections.search}<input name="search" type="search" defaultValue={search} /></label><button type="submit">{messages.collections.find}</button></form></div>{products.data.length ? <div className="catalog-grid">{products.data.map((product, index) => <ProductCard key={product.id} product={product} locale={locale} priority={index < 3} />)}</div> : <div className="empty-state"><h2>{messages.collections.noProducts}</h2><Link className="button button-dark" href={collectionsPath}>{messages.collections.clearSearch}</Link></div>}</section>
		<section className="collection-directory" aria-label={messages.collections.directory}>{tree.map((root) => <div className="directory-group" key={root.id}><h2><Link href={localizedPath(locale, `/collections/${root.slug}`)}>{root.name}</Link></h2><div>{root.children.slice(0, 5).map((child) => <Link className="directory-link" key={child.id} href={localizedPath(locale, `/collections/${child.slug}`)}><strong>{child.name}</strong><span>{messages.kinds[child.kind]} <b aria-hidden="true">→</b></span></Link>)}{root.children.length > 5 ? <Link className="directory-more" href={localizedPath(locale, `/collections/${root.slug}`)}>{messages.collections.viewAll} {root.name} →</Link> : null}</div></div>)}</section>
	</main>;
}
