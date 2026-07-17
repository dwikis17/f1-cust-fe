import {
	mockGetProduct,
	mockGetCollection,
	mockListCategories,
	mockListCollectionProducts,
	mockListCollections,
	mockListProducts,
	mockListTags,
	type CatalogEntity,
	type CollectionDetail,
	type CollectionNode,
	type CollectionProductsResponse,
	type ProductListResponse,
	type ProductQuery,
	type PublicProduct,
} from "./mock";

const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");

async function apiFetch<T>(path: string): Promise<T> {
	if (!apiBaseUrl) throw new Error("API_BASE_URL is not configured");
	const response = await fetch(`${apiBaseUrl}${path}`, { next: { revalidate: 60 } });
	if (!response.ok) throw new Error(`Catalog API request failed with ${response.status}`);
	return response.json() as Promise<T>;
}

function queryString(query: ProductQuery): string {
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
	listProducts(query: ProductQuery = {}): Promise<ProductListResponse> {
		return apiBaseUrl ? apiFetch(`/api/products${queryString(query)}`) : mockListProducts(query);
	},
	async getProduct(slug: string): Promise<PublicProduct | null> {
		if (!apiBaseUrl) return mockGetProduct(slug);
		const response = await fetch(`${apiBaseUrl}/api/products/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
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
	listCollections(): Promise<CollectionNode[]> {
		return apiBaseUrl ? apiFetch("/api/collections") : mockListCollections();
	},
	async getCollection(slug: string): Promise<CollectionDetail | null> {
		if (!apiBaseUrl) return mockGetCollection(slug);
		const response = await fetch(`${apiBaseUrl}/api/collections/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } });
		if (response.status === 404) return null;
		if (!response.ok) throw new Error(`Catalog API request failed with ${response.status}`);
		return response.json() as Promise<CollectionDetail>;
	},
	async listCollectionProducts(slug: string, query: ProductQuery = {}): Promise<CollectionProductsResponse | null> {
		if (!apiBaseUrl) return mockListCollectionProducts(slug, query);
		const response = await fetch(
			`${apiBaseUrl}/api/collections/${encodeURIComponent(slug)}/products${queryString(query)}`,
			{ next: { revalidate: 60 } },
		);
		if (response.status === 404) return null;
		if (!response.ok) throw new Error(`Catalog API request failed with ${response.status}`);
		return response.json() as Promise<CollectionProductsResponse>;
	},
};

export function formatPrice(priceIdr: number): string {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		maximumFractionDigits: 0,
	}).format(priceIdr);
}
