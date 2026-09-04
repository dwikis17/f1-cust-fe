import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CubeIcon, VerifiedIcon } from "@/components/icons";
import { ProductGallery } from "@/components/product-gallery";
import { ProductSelection } from "@/components/product-selection";
import { PurchasePanel } from "@/components/purchase-panel";
import { SizingGuide } from "@/components/sizing-guide";
import { StructuredData } from "@/components/structured-data";
import { catalog, formatPrice } from "@/lib/catalog";
import { dictionary } from "@/lib/i18n";
import { localeAlternates, localizedPath, parseLocale } from "@/lib/locale";
import { absoluteUrl, metadataDescription, siteName } from "@/lib/seo";

type ProductPageProps = {
	params: Promise<{ locale: string; slug: string }>;
};

export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 600;
export function generateStaticParams() { return []; }

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
	const { slug, locale: value } = await params;
	const locale = parseLocale(value);
	if (!locale) return {};
	const product = await catalog.getProduct(slug, locale);
	if (!product) return {};
	const messages = dictionary(locale);
	const basePath = `/products/${product.slug}`;
	const path = localizedPath(locale, basePath);
	const description = metadataDescription(product.description, messages.metadata.description);
	const images = product.photos.map((photo) => ({ url: photo.url, alt: photo.altText || product.name }));
	return {
		title: product.name,
		description,
		alternates: { canonical: path, ...localeAlternates(basePath) },
		openGraph: {
			type: "website",
			title: product.name,
			description,
			url: path,
			images,
		},
		twitter: {
			card: "summary_large_image",
			title: product.name,
			description,
			images: product.photos.map((photo) => photo.url),
		},
	};
}

export default async function ProductPage({ params }: ProductPageProps) {
	const { slug, locale: value } = await params;
	const locale = parseLocale(value);
	if (!locale) notFound();
	const messages = dictionary(locale);
	const product = await catalog.getProduct(slug, locale);
	if (!product) notFound();
	const currentCollection = product.collections[0];
	const homePath = localizedPath(locale);
	const collectionsPath = localizedPath(locale, "/collections");
	const currentCollectionPath = currentCollection ? localizedPath(locale, `/collections/${currentCollection.slug}`) : collectionsPath;
	const productUrl = absoluteUrl(localizedPath(locale, `/products/${product.slug}`));
	const available = product.variants.some((variant) => variant.available);
	const initialVariant = product.variants.find((variant) => variant.available) ?? product.variants[0];
	const originalPrice = product.originalPriceIdr;
	const onSale = product.salePercentage !== null;

	return (
		<main className="page-shell product-page">
			<StructuredData data={[
				{
					"@context": "https://schema.org",
					"@type": "Product",
					"@id": `${productUrl}#product`,
					name: product.name,
					description: product.description,
					image: product.photos.map((photo) => photo.url),
					sku: product.variants[0]?.sku,
					category: product.category.name,
					offers: {
						"@type": "Offer",
						url: productUrl,
						priceCurrency: "IDR",
						price: product.priceIdr,
						availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
						itemCondition: product.condition === "USED"
							? "https://schema.org/UsedCondition"
							: "https://schema.org/NewCondition",
						seller: { "@type": "Organization", name: siteName, url: absoluteUrl(homePath) },
					},
				},
				{
					"@context": "https://schema.org",
					"@type": "BreadcrumbList",
					itemListElement: [
						{ "@type": "ListItem", position: 1, name: messages.collections.homepage, item: absoluteUrl(homePath) },
						{
							"@type": "ListItem",
							position: 2,
							name: currentCollection?.name ?? messages.collections.title,
							item: absoluteUrl(currentCollectionPath),
						},
						{ "@type": "ListItem", position: 3, name: product.name, item: productUrl },
					],
				},
			]} />
			<nav className="breadcrumbs" aria-label={messages.collections.breadcrumb}><Link href={homePath}>{messages.collections.homepage}</Link><span>/</span><Link href={currentCollectionPath}>{currentCollection?.name ?? messages.collections.title}</Link><span>/</span><strong>{product.name}</strong></nav>
			<ProductSelection photos={product.photos} initialColor={initialVariant?.color} initialStockQuantity={initialVariant?.stockQuantity ?? 0}>
				<section className="product-top">
					<ProductGallery photos={product.photos} />
					<div className="product-info">
						<p className="eyebrow">{product.team?.name ?? product.productType.name}{product.drivers.length ? ` / ${product.drivers.map((driver) => driver.name).join(" + ")}` : ""}</p>
						<h1>{product.name}</h1>
						<div className="product-price">
							{onSale ? (
								<span className="product-detail-sale-badge" aria-label={`-${product.salePercentage}%`}>
									-{product.salePercentage}%
								</span>
							) : null}
							{originalPrice !== null ? (
								<p className="product-price-values">
									<ins>{formatPrice(product.priceIdr, locale)}</ins>
									<del>{formatPrice(originalPrice, locale)}</del>
								</p>
							) : (
								<p className="product-price-values">{formatPrice(product.priceIdr, locale)}</p>
							)}
						</div>
						{product.condition ? <p className="product-condition"><span>{messages.product.condition}</span><strong>{messages.conditions[product.condition].label}</strong></p> : null}
						{product.tags.length ? <div className="product-detail-tags" aria-label="Product tags">{product.tags.map((tag) => <span className="tag-pill" key={tag.id}>{tag.name}</span>)}</div> : null}
						<div className="product-promises"><span><VerifiedIcon /> {messages.product.officialMerchandise}</span><span><CubeIcon /> {messages.product.liveShippingRates}</span></div>
						<PurchasePanel productId={product.id} productName={product.name} variants={product.variants} photos={product.photos} />
						<SizingGuide variants={product.variants} note={product.sizingNote} />
						<details>
							<summary>{messages.product.productDetails}</summary>
							<p>{product.description}</p>
							{product.bulletPoints.length ? (
								<ul className="product-detail-bullets">
									{product.bulletPoints.map((point, index) => <li key={`${index}-${point}`}>{point}</li>)}
								</ul>
							) : null}
						</details>
						<details><summary>{messages.product.deliveryReturns}</summary><p>{messages.product.deliveryReturnsText} <Link className="inline-link" href={localizedPath(locale, "/help/shipping-returns")}>{messages.footer.shippingReturns} →</Link></p></details>
					</div>
				</section>
			</ProductSelection>
		</main>
	);
}
