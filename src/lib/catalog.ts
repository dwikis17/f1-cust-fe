import type { Locale } from "./i18n";
import type { PublicHomeCollectionBlock, PublicHomeHero } from "./home";

export type CatalogEntity = { id: string; name: string; slug: string; createdAt: string; updatedAt: string };
export type ProductAudience = "MEN" | "WOMEN" | "KIDS" | "UNISEX";
export type ProductCondition = "BNWT" | "BNWOT" | "USED";
export type CollectionKind = "DOMAIN" | "TEAM" | "DRIVER" | "MERCHANDISE" | "BRAND" | "PROMOTION" | "MANUAL";
export type Team = CatalogEntity & { logoUrl: string | null };
export type Driver = CatalogEntity & { racingNumber: number; photoUrl: string | null; teamId: string | null; team: Team | null };
export type SizingGuide = {
	unit: "cm" | "in";
	measurements: { length: number; chestWidth: number; waistWidth: number };
};
export type ProductVariant = {
	id: string; productId: string; sku: string; size: string | null; color: string | null;
	packageLengthMm: number; packageWidthMm: number; packageHeightMm: number; packageWeightG: number;
	sizingGuide: SizingGuide | null; createdAt: string; updatedAt: string; stockQuantity: number; available: boolean;
};
export type ProductPhoto = {
	id: string; productId: string; color: string | null; path: string; altText: string; position: number;
	createdAt: string; updatedAt: string; url: string;
};
export type CollectionSummary = {
	id: string; name: string; slug: string; kind: CollectionKind; parentId: string | null; imageUrl: string | null;
	description: string; position: number; active: boolean; createdAt: string; updatedAt: string;
};
export type CollectionNode = CollectionSummary & { children: CollectionNode[] };
export type CollectionDetail = CollectionSummary & {
	parent: CollectionSummary | null; children: CollectionSummary[]; _count: { products: number };
};
export type PublicProduct = {
	id: string; name: string; slug: string; description: string; sizingNote: string | null; priceIdr: number;
	originalPriceIdr: number | null;
	salePercentage: number | null;
	category: CatalogEntity; productType: CatalogEntity; team: Team | null; drivers: Driver[];
	audience: ProductAudience | null; condition?: ProductCondition; collections: CollectionSummary[]; tags: CatalogEntity[];
	variants: ProductVariant[]; photos: ProductPhoto[]; createdAt: string; updatedAt: string;
};
export type NamedFacet = { id: string; name: string; slug: string; count: number };
export type ProductFacets = {
	teams: NamedFacet[]; drivers: NamedFacet[]; productTypes: NamedFacet[];
	audiences: Array<{ value: ProductAudience; count: number }>;
	conditions: Array<{ value: ProductCondition; count: number }>;
	availability: { inStock: number }; price: { min: number; max: number };
};
export type ProductListResponse = { data: PublicProduct[]; page: number; limit: number; total: number };
export type CollectionProductsResponse = ProductListResponse & { collection: CollectionDetail; facets: ProductFacets };
export type ProductSort = "featured" | "relevance" | "name_asc" | "name_desc" | "price_asc" | "price_desc" | "newest" | "oldest";
export type ProductQuery = {
	page?: number; limit?: number; search?: string; productType?: string[]; category?: string[]; tag?: string[];
	team?: string[]; driver?: string[]; size?: string[]; color?: string[]; audience?: ProductAudience[];
	condition?: ProductCondition[]; availability?: "in_stock"; minPrice?: number; maxPrice?: number; sort?: ProductSort;
};

const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");

function apiUrl(path: string): string {
	if (!apiBaseUrl) throw new Error("API_BASE_URL is required for storefront catalog requests");
	return `${apiBaseUrl}${path}`;
}

const CATALOG_TTL_SECONDS = 300;
const TAXONOMY_TTL_SECONDS = 3_600;

async function apiFetch<T>(path: string, revalidate = CATALOG_TTL_SECONDS, tags: string[] = []): Promise<T> {
	const response = await fetch(apiUrl(path), { next: { revalidate, tags } });
	if (!response.ok) throw new Error(`Catalog API request failed with ${response.status}`);
	return response.json() as Promise<T>;
}

async function staticApiFetch<T>(path: string, tags: string[]): Promise<T> {
	const response = await fetch(apiUrl(path), { cache: "force-cache", next: { tags } });
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
	listProducts(query: ProductQuery = {}, locale: Locale = "en", revalidate = CATALOG_TTL_SECONDS): Promise<ProductListResponse> {
		return apiFetch(`/api/products${queryString({ ...query, locale })}`, revalidate, ["catalog:products"]);
	},
	async getProduct(slug: string, locale: Locale = "en"): Promise<PublicProduct | null> {
		const response = await fetch(apiUrl(`/api/products/${encodeURIComponent(slug)}?locale=${locale}`), {
			next: { revalidate: CATALOG_TTL_SECONDS, tags: ["catalog:products", `catalog:product:${slug}`] },
		});
		if (response.status === 404) return null;
		if (!response.ok) throw new Error(`Catalog API request failed with ${response.status}`);
		return response.json() as Promise<PublicProduct>;
	},
	listCategories(): Promise<CatalogEntity[]> {
		return apiFetch("/api/categories", TAXONOMY_TTL_SECONDS, ["catalog:products"]);
	},
	listTags(): Promise<CatalogEntity[]> {
		return apiFetch("/api/tags", TAXONOMY_TTL_SECONDS, ["catalog:products"]);
	},
	listTeams(): Promise<Team[]> {
		return apiFetch("/api/teams", TAXONOMY_TTL_SECONDS, ["catalog:teams"]);
	},
	listCollections(locale: Locale = "en", revalidate = CATALOG_TTL_SECONDS): Promise<CollectionNode[]> {
		return apiFetch(`/api/collections?locale=${locale}`, revalidate, ["catalog:collections"]);
	},
	listNavigationCollections(locale: Locale = "en"): Promise<CollectionNode[]> {
		return apiFetch(`/api/collections?locale=${locale}`, CATALOG_TTL_SECONDS, ["catalog:collections"]);
	},
	async getHomeHeroes(locale: Locale = "en"): Promise<PublicHomeHero[]> {
		try {
			const response = await fetch(apiUrl(`/api/home?locale=${locale}`), {
				next: { revalidate: TAXONOMY_TTL_SECONDS, tags: ["content:home"] },
			});
			if (!response.ok) return [];
			return response.json() as Promise<PublicHomeHero[]>;
		} catch {
			return [];
		}
	},
	async getHomeCollectionBlocks(locale: Locale = "en"): Promise<PublicHomeCollectionBlock[]> {
		try {
			const response = await fetch(apiUrl(`/api/home/collection-blocks?locale=${locale}`), {
				next: { revalidate: TAXONOMY_TTL_SECONDS, tags: ["content:home", "catalog:collections", "catalog:products"] },
			});
			if (!response.ok) return [];
			return response.json() as Promise<PublicHomeCollectionBlock[]>;
		} catch {
			return [];
		}
	},
	async getCollection(slug: string, locale: Locale = "en"): Promise<CollectionDetail | null> {
		const response = await fetch(apiUrl(`/api/collections/${encodeURIComponent(slug)}?locale=${locale}`), {
			next: { revalidate: CATALOG_TTL_SECONDS, tags: ["catalog:collections", `catalog:collection:${slug}`] },
		});
		if (response.status === 404) return null;
		if (!response.ok) throw new Error(`Catalog API request failed with ${response.status}`);
		return response.json() as Promise<CollectionDetail>;
	},
	async listCollectionProducts(slug: string, query: ProductQuery = {}, locale: Locale = "en"): Promise<CollectionProductsResponse | null> {
		const response = await fetch(
			apiUrl(`/api/collections/${encodeURIComponent(slug)}/products${queryString({ ...query, locale })}`),
			{ next: { revalidate: CATALOG_TTL_SECONDS, tags: ["catalog:products", "catalog:collections", `catalog:collection:${slug}`] } },
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
