import type { MetadataRoute } from "next";

import { catalog, type CollectionNode, type PublicProduct } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

// Generate at request time so deployments never depend on a development API being online.
// The catalog fetches still use their own three-minute data cache.
export const dynamic = "force-dynamic";

const publicPages = [
	"/",
	"/collections",
	"/help/faq",
	"/help/shipping-returns",
	"/help/contact",
	"/help/accessibility",
	"/help/privacy",
	"/help/terms",
];

function flattenCollections(nodes: CollectionNode[]): CollectionNode[] {
	return nodes.flatMap((node) => [node, ...flattenCollections(node.children)]);
}

async function listAllProducts(): Promise<PublicProduct[]> {
	const limit = 100;
	const first = await catalog.listProducts({ page: 1, limit });
	const pageCount = Math.ceil(first.total / limit);
	if (pageCount <= 1) return first.data;

	const remaining = await Promise.all(
		Array.from({ length: pageCount - 1 }, (_, index) => catalog.listProducts({ page: index + 2, limit })),
	);
	return [first, ...remaining].flatMap((page) => page.data);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [collectionTree, products] = await Promise.all([catalog.listCollections(), listAllProducts()]);
	const collections = flattenCollections(collectionTree);

	return [
		...publicPages.map((path) => ({
			url: absoluteUrl(path),
			changeFrequency: path === "/" || path === "/collections" ? "daily" as const : "monthly" as const,
			priority: path === "/" ? 1 : path === "/collections" ? 0.9 : 0.5,
		})),
		...collections.map((collection) => ({
			url: absoluteUrl(`/collections/${collection.slug}`),
			lastModified: new Date(collection.updatedAt),
			changeFrequency: "daily" as const,
			priority: 0.8,
		})),
		...products.map((product) => ({
			url: absoluteUrl(`/products/${product.slug}`),
			lastModified: new Date(product.updatedAt),
			changeFrequency: "daily" as const,
			priority: 0.9,
			images: product.photos.map((photo) => photo.url),
		})),
	];
}
