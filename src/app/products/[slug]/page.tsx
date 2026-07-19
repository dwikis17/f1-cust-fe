import Link from "next/link";
import { notFound } from "next/navigation";
import { CubeIcon, VerifiedIcon } from "@/components/icons";
import { ProductGallery } from "@/components/product-gallery";
import { PurchasePanel } from "@/components/purchase-panel";
import { SizingGuide } from "@/components/sizing-guide";
import { catalog, formatPrice } from "@/lib/catalog";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { mockProducts } from "@/lib/mock";

export function generateStaticParams() { return mockProducts.map(({ slug }) => ({ slug })); }

export default async function ProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ collection?: string }> }) {
	const [{ slug }, query] = await Promise.all([params, searchParams]);
	const locale = await getLocale();
	const messages = dictionary(locale);
	const product = await catalog.getProduct(slug, locale);
	if (!product) notFound();
	const currentCollection = product.collections.find((collection) => collection.slug === query.collection) ?? product.collections[0];

	return (
		<main className="page-shell product-page">
			<nav className="breadcrumbs" aria-label={messages.collections.breadcrumb}><Link href="/">{messages.collections.homepage}</Link><span>/</span><Link href={currentCollection ? `/collections/${currentCollection.slug}` : "/collections"}>{currentCollection?.name ?? messages.collections.title}</Link><span>/</span><strong>{product.name}</strong></nav>
			<section className="product-top">
				<ProductGallery photos={product.photos} />
				<div className="product-info">
					<p className="eyebrow">{product.team?.name ?? product.productType.name}{product.drivers.length ? ` / ${product.drivers.map((driver) => driver.name).join(" + ")}` : ""}</p>
					<h1>{product.name}</h1>
					<p className="product-price">{formatPrice(product.priceIdr, locale)}</p>
					<SizingGuide variants={product.variants} note={product.sizingNote} />
					<p className="product-description">{product.description}</p>
					<div className="product-promises"><span><VerifiedIcon /> {messages.product.officialMerchandise}</span><span><CubeIcon /> {messages.product.liveShippingRates}</span></div>
					<PurchasePanel productId={product.id} productName={product.name} variants={product.variants} />
					<details><summary>{messages.product.productDetails}</summary><p>{messages.product.productDetailsText}</p></details>
					<details><summary>{messages.product.deliveryReturns}</summary><p>{messages.product.deliveryReturnsText} <Link className="inline-link" href="/help/shipping-returns">{messages.footer.shippingReturns} →</Link></p></details>
				</div>
			</section>

			<section className="commentary-block">
				<div><span>{messages.product.paddockCommentary}</span><strong>{messages.product.designerPerspective}</strong></div>
				<article><p>{messages.product.commentaryOne}</p><p>{messages.product.commentaryTwo}</p><blockquote>{messages.product.quote}</blockquote></article>
			</section>
		</main>
	);
}
