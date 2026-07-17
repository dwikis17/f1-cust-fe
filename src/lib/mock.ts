export type CatalogEntity = { id: string; name: string; slug: string; createdAt: string; updatedAt: string };
export type ProductAudience = "MEN" | "WOMEN" | "KIDS" | "UNISEX";
export type CollectionKind = "DOMAIN" | "TEAM" | "DRIVER" | "MERCHANDISE" | "BRAND" | "PROMOTION" | "MANUAL";
export type Team = CatalogEntity & { logoUrl: string | null };
export type Driver = CatalogEntity & { racingNumber: number; photoUrl: string | null; teamId: string | null; team: Team | null };
export type SizingGuide = { unit: "cm" | "in"; measurements: Record<string, number> };
export type ProductVariant = {
	id: string; productId: string; sku: string; size: string | null; color: string | null;
	packageLengthMm: number; packageWidthMm: number; packageHeightMm: number; packageWeightG: number;
	sizingGuide: SizingGuide | null; createdAt: string; updatedAt: string; available: boolean;
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
	id: string; name: string; slug: string; description: string; priceIdr: number;
	category: CatalogEntity; productType: CatalogEntity; team: Team | null; drivers: Driver[];
	audience: ProductAudience | null; collections: CollectionSummary[]; tags: CatalogEntity[];
	variants: ProductVariant[]; photos: ProductPhoto[]; createdAt: string; updatedAt: string;
};
export type NamedFacet = { id: string; name: string; slug: string; count: number };
export type ProductFacets = {
	teams: NamedFacet[]; drivers: NamedFacet[]; productTypes: NamedFacet[];
	audiences: Array<{ value: ProductAudience; count: number }>;
	availability: { inStock: number }; price: { min: number; max: number };
};
export type ProductListResponse = { data: PublicProduct[]; page: number; limit: number; total: number };
export type CollectionProductsResponse = ProductListResponse & { collection: CollectionDetail; facets: ProductFacets };
export type ProductSort = "featured" | "relevance" | "name_asc" | "name_desc" | "price_asc" | "price_desc" | "newest" | "oldest";
export type ProductQuery = {
	page?: number; limit?: number; search?: string; productType?: string[]; category?: string[]; tag?: string[];
	team?: string[]; driver?: string[]; size?: string[]; color?: string[]; audience?: ProductAudience[];
	availability?: "in_stock"; minPrice?: number; maxPrice?: number; sort?: ProductSort;
};

const now = "2026-07-15T08:00:00.000Z";
const entity = (id: string, name: string, slug: string): CatalogEntity => ({ id, name, slug, createdAt: now, updatedAt: now });

export const mockCategories = [
	entity("type-headwear", "Headwear", "headwear"),
	entity("type-apparel", "Technical Apparel", "technical-apparel"),
	entity("type-replicas", "Helmets & Replicas", "helmets-replicas"),
	entity("type-accessories", "Accessories", "accessories"),
];
export const mockTags = [entity("tag-limited", "Limited Edition", "limited-edition"), entity("tag-new", "New Arrival", "new-arrival")];

const teams: Team[] = [
	{ ...entity("team-mclaren", "McLaren F1 Team", "mclaren"), logoUrl: null },
	{ ...entity("team-ferrari", "Scuderia Ferrari", "ferrari"), logoUrl: null },
	{ ...entity("team-mercedes", "Mercedes-AMG", "mercedes"), logoUrl: null },
];
const drivers: Driver[] = [
	{ ...entity("driver-lando", "Lando Norris", "lando-norris"), racingNumber: 4, photoUrl: null, teamId: teams[0].id, team: teams[0] },
	{ ...entity("driver-oscar", "Oscar Piastri", "oscar-piastri"), racingNumber: 81, photoUrl: null, teamId: teams[0].id, team: teams[0] },
	{ ...entity("driver-charles", "Charles Leclerc", "charles-leclerc"), racingNumber: 16, photoUrl: null, teamId: teams[1].id, team: teams[1] },
	{ ...entity("driver-niki", "Niki Lauda", "niki-lauda"), racingNumber: 12, photoUrl: null, teamId: null, team: null },
];

const collectionSeed: CollectionSummary[] = [
	{ ...entity("collection-f1", "Formula 1", "formula-1"), kind: "DOMAIN", parentId: null, imageUrl: null, description: "Official Formula 1 teamwear and collectibles.", position: 0, active: true },
	{ ...entity("collection-drivers", "Drivers", "drivers"), kind: "DOMAIN", parentId: null, imageUrl: null, description: "Shop by current and legendary drivers.", position: 1, active: true },
	{ ...entity("collection-mclaren", "McLaren", "mclaren"), kind: "TEAM", parentId: "collection-f1", imageUrl: null, description: "Papaya teamwear and driver merchandise.", position: 0, active: true },
	{ ...entity("collection-ferrari", "Ferrari", "ferrari"), kind: "TEAM", parentId: "collection-f1", imageUrl: null, description: "Scuderia Ferrari technical merchandise.", position: 1, active: true },
	{ ...entity("collection-mercedes", "Mercedes", "mercedes"), kind: "TEAM", parentId: "collection-f1", imageUrl: null, description: "Mercedes-AMG paddock essentials.", position: 2, active: true },
	{ ...entity("collection-lando", "Lando Norris", "lando-norris"), kind: "DRIVER", parentId: "collection-drivers", imageUrl: null, description: "Lando Norris merchandise.", position: 0, active: true },
	{ ...entity("collection-oscar", "Oscar Piastri", "oscar-piastri"), kind: "DRIVER", parentId: "collection-drivers", imageUrl: null, description: "Oscar Piastri merchandise.", position: 1, active: true },
	{ ...entity("collection-charles", "Charles Leclerc", "charles-leclerc"), kind: "DRIVER", parentId: "collection-drivers", imageUrl: null, description: "Charles Leclerc merchandise.", position: 2, active: true },
	{ ...entity("collection-niki", "Niki Lauda", "niki-lauda"), kind: "DRIVER", parentId: "collection-drivers", imageUrl: null, description: "Historic Niki Lauda merchandise.", position: 3, active: true },
];

type Seed = {
	id: string; name: string; slug: string; description: string; priceIdr: number; type: number; team: number | null;
	drivers: number[]; collections: string[]; audience: ProductAudience; tags?: number[];
	sizes?: string[]; color?: string | null; unavailableSizes?: string[];
};
const gallery = [
	["/images/generated/product-01-hero.webp", "Motorsport collectible, three-quarter view"],
	["/images/generated/product-02-side.webp", "Motorsport collectible, side view"],
	["/images/generated/product-04-detail.webp", "Motorsport merchandise material detail"],
] as const;

function makeProduct(seed: Seed): PublicProduct {
	const productId = seed.id;
	const membershipSlugs = new Set([
		...seed.collections,
		...(seed.team === null ? [] : ["formula-1"]),
		...(seed.drivers.length ? ["drivers"] : []),
	]);
	const variants: ProductVariant[] = seed.sizes?.length
		? seed.sizes.map((size, index) => ({
			id: `${productId}-variant-${index}`, productId, sku: `${seed.slug.slice(0, 10).toUpperCase()}-${size}`,
			size, color: seed.color ?? null, packageLengthMm: 320, packageWidthMm: 240, packageHeightMm: 50,
			packageWeightG: 420, sizingGuide: { unit: "cm", measurements: { chest: 52 + index * 2, length: 70 + index } },
			createdAt: now, updatedAt: now, available: !seed.unavailableSizes?.includes(size),
		}))
		: [{ id: `${productId}-variant`, productId, sku: `${seed.slug.slice(0, 14).toUpperCase()}-STD`, size: null, color: seed.color ?? null,
			packageLengthMm: 360, packageWidthMm: 280, packageHeightMm: 220, packageWeightG: 950, sizingGuide: null,
			createdAt: now, updatedAt: now, available: true }];
	const category = mockCategories[seed.type];
	return {
		id: productId, name: seed.name, slug: seed.slug, description: seed.description, priceIdr: seed.priceIdr,
		category, productType: category, team: seed.team === null ? null : teams[seed.team], drivers: seed.drivers.map((index) => drivers[index]),
		audience: seed.audience, collections: collectionSeed.filter((item) => membershipSlugs.has(item.slug)),
		tags: (seed.tags ?? []).map((index) => mockTags[index]), variants,
		photos: gallery.map(([url, altText], index) => ({ id: `${productId}-photo-${index}`, productId, color: null, path: url.slice(1), altText, position: index, createdAt: now, updatedAt: now, url })),
		createdAt: now, updatedAt: now,
	};
}

export const mockProducts: PublicProduct[] = [
	makeProduct({ id: "product-1", name: "McLaren Driver Cap — Papaya", slug: "mclaren-driver-cap-papaya", description: "A lightweight papaya driver cap with precision embroidery.", priceIdr: 949000, type: 0, team: 0, drivers: [0, 1], collections: ["mclaren", "lando-norris", "oscar-piastri"], audience: "UNISEX", tags: [1] }),
	makeProduct({ id: "product-2", name: "McLaren Driver Cap — Black", slug: "mclaren-driver-cap-black", description: "A separate black colorway with its own gallery, SKU, and stock.", priceIdr: 949000, type: 0, team: 0, drivers: [0], collections: ["mclaren", "lando-norris"], audience: "UNISEX" }),
	makeProduct({ id: "product-3", name: "McLaren Technical Shirt", slug: "mclaren-technical-shirt", description: "Breathable size-only teamwear developed for race weekends.", priceIdr: 1999000, type: 1, team: 0, drivers: [0, 1], collections: ["mclaren", "lando-norris", "oscar-piastri"], audience: "MEN", sizes: ["S", "M", "L", "XL"], unavailableSizes: ["L"] }),
	makeProduct({ id: "product-4", name: "Ferrari Heritage Polo", slug: "ferrari-heritage-polo", description: "A tribute to Ferrari history, related to both a current and a legendary driver.", priceIdr: 2199000, type: 1, team: 1, drivers: [2, 3], collections: ["ferrari", "charles-leclerc", "niki-lauda"], audience: "UNISEX", sizes: ["S", "M", "L"] }),
	makeProduct({ id: "product-5", name: "Oscar Piastri LEGO Helmet", slug: "oscar-piastri-lego-helmet", description: "A display-ready replica of Oscar Piastri's official racing helmet.", priceIdr: 1699000, type: 2, team: 0, drivers: [1], collections: ["mclaren", "oscar-piastri"], audience: "KIDS", tags: [0] }),
	makeProduct({ id: "product-6", name: "Mercedes Paddock Bottle", slug: "mercedes-paddock-bottle", description: "A vacuum-insulated bottle engineered for race weekends.", priceIdr: 699000, type: 3, team: 2, drivers: [], collections: ["mercedes"], audience: "UNISEX" }),
];

function values(value?: string[]) { return value ?? []; }
function filterProducts(source: PublicProduct[], query: ProductQuery, omit?: "team" | "driver" | "productType" | "audience" | "availability" | "price") {
	const search = query.search?.trim().toLowerCase();
	const productTypes = [...values(query.productType), ...values(query.category)];
	return source.filter((product) => {
		if (search && !`${product.name} ${product.description}`.toLowerCase().includes(search)) return false;
		if (omit !== "productType" && productTypes.length && !productTypes.includes(product.productType.slug)) return false;
		if (values(query.tag).length && !product.tags.some((item) => values(query.tag).includes(item.slug))) return false;
		if (omit !== "team" && values(query.team).length && (!product.team || !values(query.team).includes(product.team.slug))) return false;
		if (omit !== "driver" && values(query.driver).length && !product.drivers.some((item) => values(query.driver).includes(item.slug))) return false;
		if (omit !== "audience" && values(query.audience).length && (!product.audience || !values(query.audience).includes(product.audience))) return false;
		if (values(query.size).length && !product.variants.some((item) => item.size && values(query.size).includes(item.size))) return false;
		if (values(query.color).length && !product.variants.some((item) => item.color && values(query.color).includes(item.color))) return false;
		if (omit !== "availability" && query.availability === "in_stock" && !product.variants.some((item) => item.available)) return false;
		if (omit !== "price" && query.minPrice !== undefined && product.priceIdr < query.minPrice) return false;
		if (omit !== "price" && query.maxPrice !== undefined && product.priceIdr > query.maxPrice) return false;
		return true;
	});
}
function sorted(products: PublicProduct[], sort: ProductSort = "newest") {
	const result = [...products];
	if (sort === "name_asc") result.sort((a, b) => a.name.localeCompare(b.name));
	if (sort === "name_desc") result.sort((a, b) => b.name.localeCompare(a.name));
	if (sort === "price_asc") result.sort((a, b) => a.priceIdr - b.priceIdr);
	if (sort === "price_desc") result.sort((a, b) => b.priceIdr - a.priceIdr);
	if (sort === "oldest") result.reverse();
	return result;
}
function page(products: PublicProduct[], query: ProductQuery): ProductListResponse {
	const current = query.page ?? 1; const limit = query.limit ?? 20; const start = (current - 1) * limit;
	return { data: products.slice(start, start + limit), page: current, limit, total: products.length };
}
function named(items: CatalogEntity[]) {
	const count = new Map<string, { item: CatalogEntity; count: number }>();
	for (const item of items) { const current = count.get(item.id); count.set(item.id, { item, count: (current?.count ?? 0) + 1 }); }
	return [...count.values()].map(({ item, count: total }) => ({ id: item.id, name: item.name, slug: item.slug, count: total })).sort((a, b) => a.name.localeCompare(b.name));
}
function facets(source: PublicProduct[], query: ProductQuery): ProductFacets {
	const audienceCount = new Map<ProductAudience, number>();
	for (const product of filterProducts(source, query, "audience")) if (product.audience) audienceCount.set(product.audience, (audienceCount.get(product.audience) ?? 0) + 1);
	const priceProducts = filterProducts(source, query, "price");
	return {
		teams: named(filterProducts(source, query, "team").flatMap((product) => product.team ? [product.team] : [])),
		drivers: named(filterProducts(source, query, "driver").flatMap((product) => product.drivers)),
		productTypes: named(filterProducts(source, query, "productType").map((product) => product.productType)),
		audiences: [...audienceCount].map(([value, count]) => ({ value, count })),
		availability: { inStock: filterProducts(source, query, "availability").filter((product) => product.variants.some((item) => item.available)).length },
		price: { min: priceProducts.length ? Math.min(...priceProducts.map((product) => product.priceIdr)) : 0, max: priceProducts.length ? Math.max(...priceProducts.map((product) => product.priceIdr)) : 0 },
	};
}

export async function mockListProducts(query: ProductQuery = {}) { return page(sorted(filterProducts(mockProducts, query), query.sort), query); }
export async function mockGetProduct(slug: string) { return mockProducts.find((product) => product.slug === slug) ?? null; }
export async function mockListCategories() { return mockCategories; }
export async function mockListTags() { return mockTags; }
export async function mockListCollections(): Promise<CollectionNode[]> {
	const build = (parentId: string | null): CollectionNode[] => collectionSeed.filter((item) => item.parentId === parentId).map((item) => ({ ...item, children: build(item.id) }));
	return build(null);
}
export async function mockGetCollection(slug: string): Promise<CollectionDetail | null> {
	const item = collectionSeed.find((collection) => collection.slug === slug); if (!item) return null;
	return { ...item, parent: collectionSeed.find((parent) => parent.id === item.parentId) ?? null, children: collectionSeed.filter((child) => child.parentId === item.id), _count: { products: mockProducts.filter((product) => product.collections.some((collection) => collection.slug === slug)).length } };
}
export async function mockListCollectionProducts(slug: string, query: ProductQuery = {}): Promise<CollectionProductsResponse | null> {
	const collection = await mockGetCollection(slug); if (!collection) return null;
	const source = mockProducts.filter((product) => product.collections.some((item) => item.slug === slug));
	return { ...page(sorted(filterProducts(source, query), query.sort ?? "featured"), query), collection, facets: facets(source, query) };
}
