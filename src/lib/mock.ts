export type CatalogEntity = {
	id: string;
	name: string;
	slug: string;
	createdAt: string;
	updatedAt: string;
};

export type SizingGuide = {
	unit: "cm" | "in";
	measurements: Record<string, number>;
};

export type ProductVariant = {
	id: string;
	productId: string;
	sku: string;
	size: string;
	color: string;
	packageLengthMm: number;
	packageWidthMm: number;
	packageHeightMm: number;
	packageWeightG: number;
	sizingGuide: SizingGuide;
	createdAt: string;
	updatedAt: string;
	available: boolean;
};

export type ProductPhoto = {
	id: string;
	productId: string;
	color: string | null;
	path: string;
	altText: string;
	position: number;
	createdAt: string;
	updatedAt: string;
	url: string;
};

export type PublicProduct = {
	id: string;
	name: string;
	slug: string;
	description: string;
	priceIdr: number;
	category: CatalogEntity;
	tags: CatalogEntity[];
	variants: ProductVariant[];
	photos: ProductPhoto[];
	createdAt: string;
	updatedAt: string;
};

export type ProductListResponse = {
	data: PublicProduct[];
	page: number;
	limit: number;
	total: number;
};

export type ProductQuery = {
	page?: number;
	limit?: number;
	search?: string;
	category?: string;
	tag?: string;
	size?: string;
	color?: string;
};

const now = "2026-07-15T08:00:00.000Z";

export const mockCategories: CatalogEntity[] = [
	{ id: "10000000-0000-4000-8000-000000000001", name: "Helmets & Replicas", slug: "helmets-replicas", createdAt: now, updatedAt: now },
	{ id: "10000000-0000-4000-8000-000000000002", name: "Technical Apparel", slug: "technical-apparel", createdAt: now, updatedAt: now },
	{ id: "10000000-0000-4000-8000-000000000003", name: "Accessories", slug: "accessories", createdAt: now, updatedAt: now },
];

export const mockTags: CatalogEntity[] = [
	{ id: "20000000-0000-4000-8000-000000000001", name: "McLaren F1 Team", slug: "mclaren", createdAt: now, updatedAt: now },
	{ id: "20000000-0000-4000-8000-000000000002", name: "Oracle Red Bull Racing", slug: "red-bull", createdAt: now, updatedAt: now },
	{ id: "20000000-0000-4000-8000-000000000003", name: "Scuderia Ferrari", slug: "ferrari", createdAt: now, updatedAt: now },
	{ id: "20000000-0000-4000-8000-000000000004", name: "Mercedes-AMG", slug: "mercedes", createdAt: now, updatedAt: now },
	{ id: "20000000-0000-4000-8000-000000000005", name: "Aston Martin Aramco", slug: "aston-martin", createdAt: now, updatedAt: now },
	{ id: "20000000-0000-4000-8000-000000000006", name: "Limited Edition", slug: "limited-edition", createdAt: now, updatedAt: now },
];

type ProductSeed = {
	id: string;
	name: string;
	slug: string;
	description: string;
	priceIdr: number;
	category: number;
	tags: number[];
	images: Array<{ path: string; alt: string }>;
	colors?: string[];
	sizes?: string[];
};

function makeProduct(seed: ProductSeed): PublicProduct {
	const colors = seed.colors ?? ["Team Edition"];
	const sizes = seed.sizes ?? ["One Size"];
	const variants = colors.flatMap((color, colorIndex) =>
		sizes.map((size, sizeIndex) => ({
			id: `${seed.id.slice(0, -2)}${colorIndex}${sizeIndex}`,
			productId: seed.id,
			sku: `${seed.slug.toUpperCase().slice(0, 12)}-${colorIndex + 1}-${sizeIndex + 1}`,
			size,
			color,
			packageLengthMm: 360,
			packageWidthMm: 280,
			packageHeightMm: 220,
			packageWeightG: 950,
			sizingGuide: { unit: "cm" as const, measurements: { width: 28, height: 24 } },
			createdAt: now,
			updatedAt: now,
			available: !(colorIndex === colors.length - 1 && sizeIndex === sizes.length - 1 && sizes.length > 1),
		})),
	);

	return {
		id: seed.id,
		name: seed.name,
		slug: seed.slug,
		description: seed.description,
		priceIdr: seed.priceIdr,
		category: mockCategories[seed.category],
		tags: seed.tags.map((tag) => mockTags[tag]),
		variants,
		photos: seed.images.map((image, index) => ({
			id: `${seed.id.slice(0, -2)}9${index}`,
			productId: seed.id,
			color: null,
			path: image.path.replace("/images/", ""),
			altText: image.alt,
			position: index,
			createdAt: now,
			updatedAt: now,
			url: image.path,
		})),
		createdAt: now,
		updatedAt: now,
	};
}

const seededProducts: PublicProduct[] = [
	makeProduct({
		id: "30000000-0000-4000-8000-000000000001",
		name: "Oscar Piastri LEGO Helmet",
		slug: "oscar-piastri-lego-helmet",
		description: "A precision-engineered 1:5 scale replica of Oscar Piastri's official 2024 season racing helmet. Developed in collaboration with McLaren Racing for the ultimate paddock-to-shelf experience.",
		priceIdr: 1699000,
		category: 0,
		tags: [0, 5],
		images: [
			{ path: "/images/lego-main.jpg", alt: "Oscar Piastri LEGO racing helmet on a black display stand" },
			{ path: "/images/lego-detail.jpg", alt: "Close detail of the blue and papaya LEGO helmet graphics" },
			{ path: "/images/lego-side.jpg", alt: "Side profile of the Oscar Piastri LEGO helmet" },
			{ path: "/images/lego-box.jpg", alt: "Oscar Piastri LEGO helmet collector box" },
			{ path: "/images/lego-rear.jpg", alt: "Rear view of the Oscar Piastri LEGO helmet" },
		],
	}),
	makeProduct({
		id: "30000000-0000-4000-8000-000000000002",
		name: "Piastri 2024 Replica",
		slug: "piastri-2024-replica",
		description: "A full-detail papaya and carbon-fibre tribute to Oscar Piastri's breakthrough season.",
		priceIdr: 21999000,
		category: 0,
		tags: [0, 5],
		images: [{ path: "/images/piastri-replica.jpg", alt: "Papaya orange Oscar Piastri racing helmet replica" }],
	}),
	makeProduct({
		id: "30000000-0000-4000-8000-000000000003",
		name: "Verstappen WC Edition",
		slug: "verstappen-wc-edition",
		description: "A championship edition replica finished in high-gloss white, red and gold.",
		priceIdr: 23999000,
		category: 0,
		tags: [1, 5],
		images: [{ path: "/images/verstappen-helmet.jpg", alt: "Max Verstappen world champion helmet replica" }],
	}),
	makeProduct({
		id: "30000000-0000-4000-8000-000000000004",
		name: "Norris Signature 1:2",
		slug: "norris-signature-half-scale",
		description: "Lando Norris's unmistakable fluorescent race-day design in a display-ready half scale.",
		priceIdr: 3299000,
		category: 0,
		tags: [0],
		images: [{ path: "/images/norris-helmet.jpg", alt: "Fluorescent yellow Lando Norris helmet replica" }],
	}),
	makeProduct({
		id: "30000000-0000-4000-8000-000000000005",
		name: "Team Technical Polo",
		slug: "ferrari-team-technical-polo",
		description: "Race-spec breathable teamwear with precision embroidery and a structured paddock fit.",
		priceIdr: 1999000,
		category: 1,
		tags: [2],
		images: [{ path: "/images/ferrari-polo.jpg", alt: "Scuderia Ferrari red technical team polo" }],
		colors: ["Rosso Corsa", "Black"],
		sizes: ["S", "M", "L", "XL"],
	}),
	makeProduct({
		id: "30000000-0000-4000-8000-000000000006",
		name: "Petronas Driver Cap",
		slug: "petronas-driver-cap",
		description: "A lightweight team cap with tonal paneling and high-density Mercedes star embroidery.",
		priceIdr: 949000,
		category: 2,
		tags: [3],
		images: [{ path: "/images/mercedes-cap.jpg", alt: "Mercedes AMG Petronas grey driver cap" }],
	}),
	makeProduct({
		id: "30000000-0000-4000-8000-000000000007",
		name: "Alonso 2024 Replica",
		slug: "alonso-2024-replica",
		description: "British racing green and high-vis lime define Fernando Alonso's technical replica helmet.",
		priceIdr: 22999000,
		category: 0,
		tags: [4, 5],
		images: [{ path: "/images/alonso-helmet.jpg", alt: "Fernando Alonso green racing helmet replica" }],
	}),
	makeProduct({
		id: "30000000-0000-4000-8000-000000000008",
		name: "Aero-Sip 750ml Vessel",
		slug: "aero-sip-750ml-vessel",
		description: "A vacuum-insulated matte-black bottle engineered for long race weekends.",
		priceIdr: 699000,
		category: 2,
		tags: [3],
		images: [{ path: "/images/mercedes-bottle.jpg", alt: "Matte black Mercedes AMG technical water bottle" }],
	}),
];

// Keep the collection grid aligned with the backend's newest-first response while
// retaining the LEGO item as the dedicated detail-page story at the end.
export const mockProducts: PublicProduct[] = [...seededProducts.slice(1), seededProducts[0]];

export async function mockListProducts(query: ProductQuery = {}): Promise<ProductListResponse> {
	const page = query.page ?? 1;
	const limit = query.limit ?? 20;
	const search = query.search?.trim().toLocaleLowerCase();
	const filtered = mockProducts.filter((product) => {
		if (search && !`${product.name} ${product.description}`.toLocaleLowerCase().includes(search)) return false;
		if (query.category && product.category.slug !== query.category) return false;
		if (query.tag && !product.tags.some((tag) => tag.slug === query.tag)) return false;
		if (query.size && !product.variants.some((variant) => variant.size === query.size)) return false;
		if (query.color && !product.variants.some((variant) => variant.color === query.color)) return false;
		return true;
	});
	const start = (page - 1) * limit;
	return { data: filtered.slice(start, start + limit), page, limit, total: filtered.length };
}

export async function mockGetProduct(slug: string): Promise<PublicProduct | null> {
	return mockProducts.find((product) => product.slug === slug) ?? null;
}

export async function mockListCategories(): Promise<CatalogEntity[]> {
	return mockCategories;
}

export async function mockListTags(): Promise<CatalogEntity[]> {
	return mockTags;
}
