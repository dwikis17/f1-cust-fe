import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { catalog } from "@/lib/catalog";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function CollectionsPage({ searchParams }: { searchParams: SearchParams }) {
	const params = await searchParams;
	const search = first(params.search);
	const [tree, products] = await Promise.all([catalog.listCollections(), catalog.listProducts({ search, limit: 24 })]);
	return <main className="page-shell collection-page">
		<section className="collection-title collection-directory-heading"><p className="eyebrow">Browse the paddock</p><h1>Collections</h1><p>Shop by team, driver, or merchandise family.</p></section>
		<section className="collection-directory" aria-label="Collection directory">{tree.map((root) => <div key={root.id}><h2><Link href={`/collections/${root.slug}`}>{root.name}</Link></h2><div>{root.children.map((child) => <Link key={child.id} href={`/collections/${child.slug}`}>{child.name}<span>{child.kind}</span></Link>)}</div></div>)}</section>
		<section className="all-products" id="catalog"><div className="catalog-toolbar"><span>{products.total.toString().padStart(2, "0")} products</span><form action="/collections"><label>Search<input name="search" defaultValue={search} /></label><button type="submit">Find</button></form></div>{products.data.length ? <div className="catalog-grid">{products.data.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 3} />)}</div> : <div className="empty-state"><h2>No products found</h2><Link className="button button-dark" href="/collections">Clear search</Link></div>}</section>
	</main>;
}
