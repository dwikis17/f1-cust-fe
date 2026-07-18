import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { catalog } from "@/lib/catalog";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function CollectionsPage({ searchParams }: { searchParams: SearchParams }) {
	const params = await searchParams;
	const search = first(params.search);
	const locale = await getLocale();
	const messages = dictionary(locale);
	const [tree, products] = await Promise.all([catalog.listCollections(), catalog.listProducts({ search, limit: 24 }, locale)]);
	return <main className="page-shell collection-page">
		<section className="collection-title collection-directory-heading"><p className="eyebrow">{messages.collections.browse}</p><h1>{messages.collections.title}</h1><p>{messages.collections.intro}</p></section>
		<section className="collection-directory" aria-label={messages.collections.directory}>{tree.map((root) => <div key={root.id}><h2><Link href={`/collections/${root.slug}`}>{root.name}</Link></h2><div>{root.children.map((child) => <Link key={child.id} href={`/collections/${child.slug}`}>{child.name}<span>{messages.kinds[child.kind]}</span></Link>)}</div></div>)}</section>
		<section className="all-products" id="catalog"><div className="catalog-toolbar"><span>{products.total.toString().padStart(2, "0")} {messages.collections.products}</span><form action="/collections"><label>{messages.collections.search}<input name="search" defaultValue={search} /></label><button type="submit">{messages.collections.find}</button></form></div>{products.data.length ? <div className="catalog-grid">{products.data.map((product, index) => <ProductCard key={product.id} product={product} locale={locale} priority={index < 3} />)}</div> : <div className="empty-state"><h2>{messages.collections.noProducts}</h2><Link className="button button-dark" href="/collections">{messages.collections.clearSearch}</Link></div>}</section>
	</main>;
}
