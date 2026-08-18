import type { MetadataRoute } from "next";

import { catalog, type CollectionNode, type PublicProductCard } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3_600;

const publicPages = [
	"",
	"/collections",
	"/sale",
	"/f1-schedule",
	"/formula-1-merchandise-indonesia",
	"/help/faq",
	"/help/shipping-returns",
	"/help/contact",
	"/help/accessibility",
	"/help/privacy",
	"/help/terms",
];
const sitemapLocales = ["en", "id"] as const;

function flattenCollections(nodes: CollectionNode[]): CollectionNode[] {
	return nodes.flatMap((node) => [node, ...flattenCollections(node.children)]);
}

async function listAllProducts(): Promise<PublicProductCard[]> {
	const limit = 100;
	const first = await catalog.listProducts({ page: 1, limit }, "en");
	const pageCount = Math.ceil(first.total / limit);
	if (pageCount <= 1) return first.data;

	const remaining = await Promise.all(
		Array.from({ length: pageCount - 1 }, (_, index) => catalog.listProducts({ page: index + 2, limit }, "en")),
	);
	return [first, ...remaining].flatMap((page) => page.data);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const [collectionTree, products] = await Promise.all([catalog.listCollections("en"), listAllProducts()]);
	const collections = flattenCollections(collectionTree);

	return [
		...sitemapLocales.flatMap((locale) => publicPages.map((path) => ({
			url: absoluteUrl(`/${locale}${path}`),
			changeFrequency: path === "" || path === "/collections" || path === "/sale" ? "daily" as const : path === "/f1-schedule" ? "yearly" as const : "monthly" as const,
			priority: path === "" ? 1 : path === "/collections" ? 0.9 : path === "/sale" ? 0.9 : path === "/f1-schedule" ? 0.8 : path === "/formula-1-merchandise-indonesia" ? 0.85 : 0.5,
			alternates: { languages: { en: absoluteUrl(`/en${path}`), id: absoluteUrl(`/id${path}`), "x-default": absoluteUrl(`/en${path}`) } },
		}))),
		...sitemapLocales.flatMap((locale) => collections.map((collection) => ({
			url: absoluteUrl(`/${locale}/collections/${collection.slug}`),
			lastModified: new Date(collection.updatedAt),
			changeFrequency: "daily" as const,
			priority: 0.8,
			alternates: { languages: { en: absoluteUrl(`/en/collections/${collection.slug}`), id: absoluteUrl(`/id/collections/${collection.slug}`), "x-default": absoluteUrl(`/en/collections/${collection.slug}`) } },
		}))),
		...sitemapLocales.flatMap((locale) => products.map((product) => ({
			url: absoluteUrl(`/${locale}/products/${product.slug}`),
			changeFrequency: "daily" as const,
			priority: 0.9,
			images: product.photos.map((photo) => photo.url),
			alternates: { languages: { en: absoluteUrl(`/en/products/${product.slug}`), id: absoluteUrl(`/id/products/${product.slug}`), "x-default": absoluteUrl(`/en/products/${product.slug}`) } },
		}))),
	];
}
