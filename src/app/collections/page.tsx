import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, ChevronDownIcon, GridIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { catalog } from "@/lib/catalog";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function valueOf(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }

export default async function CollectionsPage({ searchParams }: { searchParams: SearchParams }) {
	const params = await searchParams;
	const category = valueOf(params.category);
	const tag = valueOf(params.tag);
	const search = valueOf(params.search);
	const [{ data: products, total }, categories, tags] = await Promise.all([
		catalog.listProducts({ category, tag, search, limit: 24 }),
		catalog.listCategories(),
		catalog.listTags(),
	]);

	return (
		<main className="page-shell collection-page">
			<section className="collection-hero">
				<Image src="/images/collection-hero.jpg" alt="A racing helmet displayed in a Formula 1 engineering garage" fill priority sizes="100vw" />
				<div className="hero-shade" />
				<div><p className="eyebrow light">Heritage & innovation</p><h1>Precision engineered<br />collectibles</h1><p>Experience the apex of motorsport engineering through our curated selection of authentic driver replicas and team technical wear.</p><a className="button button-light" href="#catalog">Explore collection</a></div>
			</section>

			<section className="catalog-layout" id="catalog">
				<aside className="filters">
					<FilterGroup title="Teams" items={tags.filter((item) => item.slug !== "limited-edition")} active={tag} param="tag" category={category} />
					<FilterGroup title="Category" items={categories} active={category} param="category" tag={tag} />
					<div className="filter-group"><h2>Price range</h2><input aria-label="Maximum price" type="range" min="0" max="25000000" defaultValue="12500000" /><div className="range-label"><span>Rp 0</span><span>Rp 25M+</span></div></div>
					<div className="filter-group"><h2>Display</h2><button className="display-button" type="button" aria-label="Grid display"><GridIcon /></button></div>
				</aside>
				<div className="catalog-results">
					<div className="catalog-toolbar"><span>Showing {total.toString().padStart(2, "0")} results</span><button type="button">Sort by: Featured <ChevronDownIcon /></button></div>
					{products.length ? <div className="catalog-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 3} />)}</div> : <div className="empty-state"><h2>No machines found</h2><p>Clear the current filters to return to the full grid.</p><Link className="button button-dark" href="/collections">Clear filters</Link></div>}
					<div className="pagination"><button disabled>‹</button><span>Page 01 / 01</span><button disabled>›</button></div>
				</div>
			</section>

			<section className="collection-editorial">
				<div><p className="eyebrow light">Inside the paddock</p><h2>The engineering of<br />aerodynamics</h2><p>Discover the obsessive attention to detail that goes into every curve of a Formula 1 helmet. Designed not just for safety, but for the invisible science of air management at 200mph.</p><a className="text-link light" href="#">Read the article <ArrowRightIcon /></a></div>
				<div className="aero-image"><Image src="/images/aero-editorial.jpg" alt="Formula 1 car undergoing aerodynamic testing" fill sizes="50vw" /></div>
			</section>
		</main>
	);
}

function FilterGroup({ title, items, active, param, category, tag }: { title: string; items: Array<{ name: string; slug: string }>; active?: string; param: "tag" | "category"; category?: string; tag?: string }) {
	return <div className="filter-group"><h2>{title}</h2><ul>{items.map((item) => {
		const query = new URLSearchParams();
		if (param === "tag" ? category : tag) query.set(param === "tag" ? "category" : "tag", (param === "tag" ? category : tag)!);
		if (active !== item.slug) query.set(param, item.slug);
		return <li key={item.slug}><Link className={active === item.slug ? "active" : ""} href={`/collections${query.size ? `?${query}` : ""}`}>{item.name}</Link></li>;
	})}</ul></div>;
}
