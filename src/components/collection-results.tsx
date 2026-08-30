import Link from "next/link";

import { AutoSubmitSelect, PendingSubmitButton } from "@/components/form-controls";
import { ProductCard } from "@/components/product-card";
import { formatPrice, type NamedFacet, type ProductAudience, type ProductCondition, type ProductListResponse, type ProductQuery, type ProductSort } from "@/lib/catalog";
import { dictionary, type Locale } from "@/lib/i18n";

export type CollectionSearchParams = Record<string, string | string[] | undefined>;

const arrayValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value : value ? [value] : []).flatMap((item) => item.split(",")).filter(Boolean);
const firstValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export function collectionQuery(params: CollectionSearchParams): ProductQuery {
	const search = firstValue(params.search)?.trim();
	const minPrice = Number(firstValue(params.minPrice));
	const maxPrice = Number(firstValue(params.maxPrice));
	return {
		page: Math.max(1, Number(firstValue(params.page)) || 1), limit: 12, search: search || undefined,
		tag: arrayValue(params.tag), team: arrayValue(params.team), driver: arrayValue(params.driver), productType: arrayValue(params.productType),
		audience: arrayValue(params.audience) as ProductAudience[], availability: firstValue(params.availability) === "in_stock" ? "in_stock" : undefined,
		condition: arrayValue(params.condition) as ProductCondition[],
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

function facetLabel(items: NamedFacet[] = [], value: string) { return items?.find((item) => item.slug === value)?.name ?? value.replaceAll("-", " "); }

export function CollectionResults({ path, params, response, locale }: { path: string; params: CollectionSearchParams; response: ProductListResponse; locale: Locale }) {
	const messages = dictionary(locale);
	const query = collectionQuery(params);
	const pages = Math.max(1, Math.ceil(response.total / response.limit));
	const facets = response.facets;
	const active = [
		...(query.tag ?? []).map((value) => ({ key: "tag", value, label: facetLabel(facets?.tags, value) })),
		...(query.team ?? []).map((value) => ({ key: "team", value, label: facetLabel(facets?.teams, value) })),
		...(query.driver ?? []).map((value) => ({ key: "driver", value, label: facetLabel(facets?.drivers, value) })),
		...(query.productType ?? []).map((value) => ({ key: "productType", value, label: facetLabel(facets?.productTypes, value) })),
		...(query.audience ?? []).map((value) => ({ key: "audience", value, label: messages.audiences[value] ?? value })),
		...(query.condition ?? []).map((value) => ({ key: "condition", value, label: messages.conditions[value]?.label ?? value })),
		...(query.availability ? [{ key: "availability", value: query.availability, label: messages.filters.inStock }] : []),
	];
	const audienceFacets = [...(facets?.audiences ?? [])];
	const conditionFacets = [...(facets?.conditions ?? [])];
	const sortOptions = [
		{ value: "featured", label: messages.filters.featured },
		...(query.search ? [{ value: "relevance", label: messages.filters.relevance }] : []),
		{ value: "name_asc", label: messages.filters.nameAsc },
		{ value: "name_desc", label: messages.filters.nameDesc },
		{ value: "price_asc", label: messages.filters.priceAsc },
		{ value: "price_desc", label: messages.filters.priceDesc },
		{ value: "newest", label: messages.filters.newest },
		{ value: "oldest", label: messages.filters.oldest },
	];
	for (const value of query.audience ?? []) {
		if (!audienceFacets.some((item) => item.value === value)) audienceFacets.push({ value, count: 0 });
	}
	for (const value of query.condition ?? []) {
		if (!conditionFacets.some((item) => item.value === value)) conditionFacets.push({ value, count: 0 });
	}
	return (
		<section className="catalog-layout" id="catalog">
			<details className="filters-drawer" open>
				<summary>{messages.filters.filters} {active.length ? `(${active.length})` : ""}</summary>
				<form className="filters" action={path}>
					{query.search ? <input type="hidden" name="search" value={query.search} /> : null}
					<FacetGroup title={messages.filters.tag} name="tag" items={facets?.tags ?? []} selected={query.tag ?? []} />
					<FacetGroup title={messages.filters.team} name="team" items={facets?.teams ?? []} selected={query.team ?? []} />
					<FacetGroup title={messages.filters.driver} name="driver" items={facets?.drivers ?? []} selected={query.driver ?? []} />
					<FacetGroup title={messages.filters.productType} name="productType" items={facets?.productTypes ?? []} selected={query.productType ?? []} />
					<div className="filter-group"><h2>{messages.filters.genderAudience}</h2><ul>{audienceFacets.map((item) => <li key={item.value}><label><input type="checkbox" name="audience" value={item.value} defaultChecked={query.audience?.includes(item.value)} /><span>{messages.audiences[item.value] ?? item.value}</span><small>{item.count}</small></label></li>)}</ul></div>
					<div className="filter-group"><h2>{messages.filters.condition}</h2><ul>{conditionFacets.map((item) => <li key={item.value}><label><input type="checkbox" name="condition" value={item.value} defaultChecked={query.condition?.includes(item.value)} /><span>{messages.conditions[item.value]?.label ?? item.value}</span><small>{item.count}</small></label></li>)}</ul></div>
					<div className="filter-group"><h2>{messages.filters.availability}</h2><ul><li><label><input type="checkbox" name="availability" value="in_stock" defaultChecked={query.availability === "in_stock"} /><span>{messages.filters.inStock}</span><small>{facets?.availability?.inStock ?? 0}</small></label></li></ul></div>
					<div className="filter-group"><h2>{messages.filters.priceRange}</h2><div className="price-inputs"><label>{messages.filters.from}<input name="minPrice" type="number" min="0" step="1000" defaultValue={query.minPrice} placeholder={formatPrice(facets?.price?.min ?? 0, locale)} /></label><label>{messages.filters.to}<input name="maxPrice" type="number" min="0" step="1000" defaultValue={query.maxPrice} placeholder={formatPrice(facets?.price?.max ?? 0, locale)} /></label></div></div>
					<div className="filter-actions"><PendingSubmitButton className="button button-dark" idle={messages.filters.applyFilters} pending={messages.filters.updating} /><Link href={path}>{messages.filters.clearAll}</Link></div>
				</form>
			</details>
			<div className="catalog-results">
				<div className="catalog-toolbar"><span>{messages.filters.showing} {response.total.toString().padStart(2, "0")} {messages.filters.results}</span><form className="catalog-sort" action={path}>{Object.entries(params).flatMap(([key, value]) => key === "sort" || key === "page" ? [] : (Array.isArray(value) ? value : value ? [value] : []).map((item) => <input key={`${key}-${item}`} type="hidden" name={key} value={item} />))}<AutoSubmitSelect label={messages.filters.sortBy} name="sort" defaultValue={query.sort ?? "featured"} options={sortOptions} pendingLabel={messages.filters.updating} applyLabel={messages.filters.apply} /></form></div>
				{active.length || query.minPrice !== undefined || query.maxPrice !== undefined ? <div className="active-filters">{active.map((item) => <Link key={`${item.key}-${item.value}`} href={removeValueHref(path, params, item.key, item.value)}>{item.label} ×</Link>)}{query.minPrice !== undefined ? <Link href={removeValueHref(path, params, "minPrice", String(query.minPrice))}>{messages.filters.from} {formatPrice(query.minPrice, locale)} ×</Link> : null}{query.maxPrice !== undefined ? <Link href={removeValueHref(path, params, "maxPrice", String(query.maxPrice))}>{messages.filters.to} {formatPrice(query.maxPrice, locale)} ×</Link> : null}<Link className="clear-filters" href={path}>{messages.filters.clearAll}</Link></div> : null}
				{response.data.length ? <div className="catalog-grid">{response.data.map((product, index) => <ProductCard key={product.id} product={product} locale={locale} priority={index < 3} />)}</div> : <div className="empty-state"><h2>{messages.filters.noProducts}</h2><p>{query.search ? messages.filters.adjustSearch : messages.filters.adjustFilters}</p><Link className="button button-dark" href={path}>{messages.filters.clearFilters}</Link></div>}
				<nav className="pagination" aria-label={messages.filters.productPages}>{response.page > 1 ? <Link href={pageHref(path, params, response.page - 1)} aria-label={`${messages.filters.page} ${response.page - 1}`}>‹</Link> : <span className="pagination-disabled" aria-hidden="true">‹</span>}<span>{messages.filters.page} {String(response.page).padStart(2, "0")} / {String(pages).padStart(2, "0")}</span>{response.page < pages ? <Link href={pageHref(path, params, response.page + 1)} aria-label={`${messages.filters.page} ${response.page + 1}`}>›</Link> : <span className="pagination-disabled" aria-hidden="true">›</span>}</nav>
			</div>
		</section>
	);
}

function FacetGroup({ title, name, items, selected }: { title: string; name: string; items: NamedFacet[]; selected: string[] }) {
	const visible = [...(items ?? [])];
	for (const slug of selected) if (!visible.some((item) => item.slug === slug)) visible.push({ id: slug, slug, name: slug.replaceAll("-", " "), count: 0 });
	return <div className="filter-group"><h2>{title}</h2><ul>{visible.map((item) => <li key={item.slug}><label><input type="checkbox" name={name} value={item.slug} defaultChecked={selected.includes(item.slug)} /><span>{item.name}</span><small>{item.count}</small></label></li>)}</ul></div>;
}
