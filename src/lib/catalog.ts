import {
	mockGetProduct,
	mockGetCollection,
	mockListCategories,
	mockListCollectionProducts,
	mockListCollections,
	mockListProducts,
	mockListTags,
	mockListTeams,
	type CatalogEntity,
	type CollectionDetail,
	type CollectionNode,
	type CollectionProductsResponse,
	type ProductListResponse,
	type ProductQuery,
	type PublicProduct,
	type Team,
} from "./mock";
import type { Locale } from "./i18n";

const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");

async function apiFetch<T>(path: string): Promise<T> {
	if (!apiBaseUrl) throw new Error("API_BASE_URL is not configured");
	const response = await fetch(`${apiBaseUrl}${path}`, { next: { revalidate: 180 } });
	if (!response.ok) throw new Error(`Catalog API request failed with ${response.status}`);
	return response.json() as Promise<T>;
}

function queryString(query: ProductQuery & { locale?: Locale }): string {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (Array.isArray(value)) {
			for (const item of value) params.append(key, String(item));
		} else if (value !== undefined && value !== "") params.set(key, String(value));
	}
	const value = params.toString();
	return value ? `?${value}` : "";
}

export const catalog = {
	listProducts(query: ProductQuery = {}, locale: Locale = "en"): Promise<ProductListResponse> {
		return apiBaseUrl ? apiFetch(`/api/products${queryString({ ...query, locale })}`) : mockListProducts(query, locale);
	},
	async getProduct(slug: string, locale: Locale = "en"): Promise<PublicProduct | null> {
		if (!apiBaseUrl) return mockGetProduct(slug, locale);
		const response = await fetch(`${apiBaseUrl}/api/products/${encodeURIComponent(slug)}?locale=${locale}`, { next: { revalidate: 180 } });
		if (response.status === 404) return null;
		if (!response.ok) throw new Error(`Catalog API request failed with ${response.status}`);
		return response.json() as Promise<PublicProduct>;
	},
	listCategories(): Promise<CatalogEntity[]> {
		return apiBaseUrl ? apiFetch("/api/categories") : mockListCategories();
	},
	listTags(): Promise<CatalogEntity[]> {
		return apiBaseUrl ? apiFetch("/api/tags") : mockListTags();
	},
	listTeams(): Promise<Team[]> {
		return apiBaseUrl ? apiFetch("/api/teams") : mockListTeams();
	},
	listCollections(): Promise<CollectionNode[]> {
		return apiBaseUrl ? apiFetch("/api/collections") : mockListCollections();
	},
	async getCollection(slug: string): Promise<CollectionDetail | null> {
		if (!apiBaseUrl) return mockGetCollection(slug);
		const response = await fetch(`${apiBaseUrl}/api/collections/${encodeURIComponent(slug)}`, { next: { revalidate: 180 } });
		if (response.status === 404) return null;
		if (!response.ok) throw new Error(`Catalog API request failed with ${response.status}`);
		return response.json() as Promise<CollectionDetail>;
	},
	async listCollectionProducts(slug: string, query: ProductQuery = {}, locale: Locale = "en"): Promise<CollectionProductsResponse | null> {
		if (!apiBaseUrl) return mockListCollectionProducts(slug, query, locale);
		const response = await fetch(
			`${apiBaseUrl}/api/collections/${encodeURIComponent(slug)}/products${queryString({ ...query, locale })}`,
			{ next: { revalidate: 180 } },
		);
		if (response.status === 404) return null;
		if (!response.ok) throw new Error(`Catalog API request failed with ${response.status}`);
		return response.json() as Promise<CollectionProductsResponse>;
	},
};

export function formatPrice(priceIdr: number, locale: Locale = "en"): string {
	return new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(priceIdr);
}
