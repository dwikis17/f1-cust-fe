import Link from "next/link";
import { notFound } from "next/navigation";
import { CubeIcon, VerifiedIcon } from "@/components/icons";
import { ProductGallery } from "@/components/product-gallery";
import { PurchasePanel } from "@/components/purchase-panel";
import { catalog, formatPrice } from "@/lib/catalog";
import { mockProducts } from "@/lib/mock";

export function generateStaticParams() { return mockProducts.map(({ slug }) => ({ slug })); }

export default async function ProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ collection?: string }> }) {
	const [{ slug }, query] = await Promise.all([params, searchParams]);
	const product = await catalog.getProduct(slug);
	if (!product) notFound();
	const currentCollection = product.collections.find((collection) => collection.slug === query.collection) ?? product.collections[0];

	return (
		<main className="page-shell product-page">
			<nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Homepage</Link><span>/</span><Link href={currentCollection ? `/collections/${currentCollection.slug}` : "/collections"}>{currentCollection?.name ?? "Collections"}</Link><span>/</span><strong>{product.name}</strong></nav>
			<section className="product-top">
				<ProductGallery photos={product.photos} />
				<div className="product-info">
					<p className="eyebrow">{product.team?.name ?? product.productType.name}{product.drivers.length ? ` / ${product.drivers.map((driver) => driver.name).join(" + ")}` : ""}</p>
					<h1>{product.name}</h1>
					<p className="product-price">{formatPrice(product.priceIdr)}</p>
					<p className="product-description">{product.description}</p>
					<div className="product-promises"><span><VerifiedIcon /> Official merchandise</span><span><CubeIcon /> Free shipping</span></div>
					<PurchasePanel productId={product.id} productName={product.name} variants={product.variants} />
					<details><summary>Product details</summary><p>Precision-made collector merchandise. Each piece is verified and packaged for secure display.</p></details>
					<details><summary>Delivery & returns</summary><p>Complimentary tracked delivery. Returns are accepted within 14 days in original condition.</p></details>
				</div>
			</section>

			<section className="commentary-block">
				<div><span>Paddock commentary</span><strong>Designer perspective</strong></div>
				<article><p>The VALDYE collection puts creativity in pole position. This is more than merchandise; it is an engineering study that mirrors the meticulous detail required in the actual paddock.</p><p>Every material, line and graphic is selected to celebrate the team&apos;s competitive identity while preserving the character of the original race equipment.</p><blockquote>“Built for the people who notice the final millimetre.”</blockquote></article>
			</section>
		</main>
	);
}
