import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { formatPrice } from "@/lib/catalog";
import type { CollectionProductsResponse, NamedFacet, ProductAudience, ProductQuery, ProductSort } from "@/lib/mock";

export type CollectionSearchParams = Record<string, string | string[] | undefined>;

const arrayValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value : value ? [value] : []).flatMap((item) => item.split(",")).filter(Boolean);
const firstValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export function collectionQuery(params: CollectionSearchParams): ProductQuery {
	const minPrice = Number(firstValue(params.minPrice));
	const maxPrice = Number(firstValue(params.maxPrice));
	return {
		page: Math.max(1, Number(firstValue(params.page)) || 1), limit: 12, search: firstValue(params.search),
		team: arrayValue(params.team), driver: arrayValue(params.driver), productType: arrayValue(params.productType),
		audience: arrayValue(params.audience) as ProductAudience[], availability: firstValue(params.availability) === "in_stock" ? "in_stock" : undefined,
		minPrice: Number.isFinite(minPrice) && firstValue(params.minPrice) ? minPrice : undefined,
		maxPrice: Number.isFinite(maxPrice) && firstValue(params.maxPrice) ? maxPrice : undefined,
		sort: (firstValue(params.sort) as ProductSort | undefined) ?? "featured",
	};
}

function urlParams(params: CollectionSearchParams) {
	const result = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		for (const item of Array.isArray(value) ? value : value ? [value] : []) result.append(key, item);
	}
	return result;
}

function removeValueHref(path: string, params: CollectionSearchParams, key: string, value: string) {
	const next = urlParams(params);
	const remaining = next.getAll(key).flatMap((item) => item.split(",")).filter((item) => item !== value);
	next.delete(key); next.delete("page");
	for (const item of remaining) next.append(key, item);
	return `${path}${next.size ? `?${next}` : ""}`;
}

function pageHref(path: string, params: CollectionSearchParams, page: number) {
	const next = urlParams(params); next.set("page", String(page)); return `${path}?${next}`;
}

function facetLabel(items: NamedFacet[], value: string) { return items.find((item) => item.slug === value)?.name ?? value.replaceAll("-", " "); }

export function CollectionResults({ path, params, response }: { path: string; params: CollectionSearchParams; response: CollectionProductsResponse }) {
	const query = collectionQuery(params);
	const pages = Math.max(1, Math.ceil(response.total / response.limit));
	const active = [
		...(query.team ?? []).map((value) => ({ key: "team", value, label: facetLabel(response.facets.teams, value) })),
		...(query.driver ?? []).map((value) => ({ key: "driver", value, label: facetLabel(response.facets.drivers, value) })),
		...(query.productType ?? []).map((value) => ({ key: "productType", value, label: facetLabel(response.facets.productTypes, value) })),
		...(query.audience ?? []).map((value) => ({ key: "audience", value, label: value[0] + value.slice(1).toLowerCase() })),
		...(query.availability ? [{ key: "availability", value: query.availability, label: "In stock" }] : []),
	];
	const audienceFacets = [...response.facets.audiences];
	for (const value of query.audience ?? []) {
		if (!audienceFacets.some((item) => item.value === value)) audienceFacets.push({ value, count: 0 });
	}
	return (
		<section className="catalog-layout" id="catalog">
			<details className="filters-drawer" open>
				<summary>Filters {active.length ? `(${active.length})` : ""}</summary>
				<form className="filters" action={path}>
					{query.search ? <input type="hidden" name="search" value={query.search} /> : null}
					<FacetGroup title="Team" name="team" items={response.facets.teams} selected={query.team ?? []} />
					<FacetGroup title="Driver" name="driver" items={response.facets.drivers} selected={query.driver ?? []} />
					<FacetGroup title="Product type" name="productType" items={response.facets.productTypes} selected={query.productType ?? []} />
					<div className="filter-group"><h2>Gender & audience</h2><ul>{audienceFacets.map((item) => <li key={item.value}><label><input type="checkbox" name="audience" value={item.value} defaultChecked={query.audience?.includes(item.value)} /><span>{item.value[0] + item.value.slice(1).toLowerCase()}</span><small>{item.count}</small></label></li>)}</ul></div>
					<div className="filter-group"><h2>Availability</h2><ul><li><label><input type="checkbox" name="availability" value="in_stock" defaultChecked={query.availability === "in_stock"} /><span>In stock</span><small>{response.facets.availability.inStock}</small></label></li></ul></div>
					<div className="filter-group"><h2>Price range</h2><div className="price-inputs"><label>From<input name="minPrice" type="number" min="0" step="1000" defaultValue={query.minPrice} placeholder={formatPrice(response.facets.price.min)} /></label><label>To<input name="maxPrice" type="number" min="0" step="1000" defaultValue={query.maxPrice} placeholder={formatPrice(response.facets.price.max)} /></label></div></div>
					<div className="filter-actions"><button className="button button-dark" type="submit">Apply filters</button><Link href={path}>Clear all</Link></div>
				</form>
			</details>
			<div className="catalog-results">
				<div className="catalog-toolbar"><span>Showing {response.total.toString().padStart(2, "0")} results</span><form action={path}>{Object.entries(params).flatMap(([key, value]) => key === "sort" || key === "page" ? [] : (Array.isArray(value) ? value : value ? [value] : []).map((item) => <input key={`${key}-${item}`} type="hidden" name={key} value={item} />))}<label>Sort by <select name="sort" defaultValue={query.sort} onChange={undefined}><option value="featured">Featured</option>{query.search ? <option value="relevance">Relevance</option> : null}<option value="name_asc">Name A–Z</option><option value="name_desc">Name Z–A</option><option value="price_asc">Price low–high</option><option value="price_desc">Price high–low</option><option value="newest">Newest</option><option value="oldest">Oldest</option></select></label><button type="submit">Apply</button></form></div>
				{active.length || query.minPrice !== undefined || query.maxPrice !== undefined ? <div className="active-filters">{active.map((item) => <Link key={`${item.key}-${item.value}`} href={removeValueHref(path, params, item.key, item.value)}>{item.label} ×</Link>)}{query.minPrice !== undefined ? <Link href={removeValueHref(path, params, "minPrice", String(query.minPrice))}>From {formatPrice(query.minPrice)} ×</Link> : null}{query.maxPrice !== undefined ? <Link href={removeValueHref(path, params, "maxPrice", String(query.maxPrice))}>To {formatPrice(query.maxPrice)} ×</Link> : null}<Link className="clear-filters" href={path}>Clear all</Link></div> : null}
				{response.data.length ? <div className="catalog-grid">{response.data.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 3} collectionSlug={response.collection.slug} />)}</div> : <div className="empty-state"><h2>No products found</h2><p>Your collection is still here. Adjust the current filters to see more products.</p><Link className="button button-dark" href={path}>Clear filters</Link></div>}
				<nav className="pagination" aria-label="Product pages"><Link aria-disabled={response.page <= 1} href={response.page > 1 ? pageHref(path, params, response.page - 1) : path}>‹</Link><span>Page {String(response.page).padStart(2, "0")} / {String(pages).padStart(2, "0")}</span><Link aria-disabled={response.page >= pages} href={response.page < pages ? pageHref(path, params, response.page + 1) : path}>›</Link></nav>
			</div>
		</section>
	);
}

function FacetGroup({ title, name, items, selected }: { title: string; name: string; items: NamedFacet[]; selected: string[] }) {
	const visible = [...items];
	for (const slug of selected) if (!visible.some((item) => item.slug === slug)) visible.push({ id: slug, slug, name: slug.replaceAll("-", " "), count: 0 });
	return <div className="filter-group"><h2>{title}</h2><ul>{visible.map((item) => <li key={item.slug}><label><input type="checkbox" name={name} value={item.slug} defaultChecked={selected.includes(item.slug)} /><span>{item.name}</span><small>{item.count}</small></label></li>)}</ul></div>;
}
