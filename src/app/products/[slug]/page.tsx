import Link from "next/link";
import { notFound } from "next/navigation";
import { CubeIcon, VerifiedIcon } from "@/components/icons";
import { ProductGallery } from "@/components/product-gallery";
import { PurchasePanel } from "@/components/purchase-panel";
import { catalog, formatPrice } from "@/lib/catalog";
import { mockProducts } from "@/lib/mock";

export function generateStaticParams() { return mockProducts.map(({ slug }) => ({ slug })); }

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const product = await catalog.getProduct(slug);
	if (!product) notFound();
	const variant = product.variants[0];

	return (
		<main className="page-shell product-page">
			<nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Homepage</Link><span>/</span><Link href={`/collections?tag=${product.tags[0]?.slug ?? ""}`}>{product.tags[0]?.name ?? product.category.name}</Link><span>/</span><strong>{product.name}</strong></nav>
			<section className="product-top">
				<ProductGallery photos={product.photos} />
				<div className="product-info">
					<p className="eyebrow">{product.tags.some((tag) => tag.slug === "limited-edition") ? "Collectors series / limited edition" : product.category.name}</p>
					<h1>{product.name}</h1>
					<p className="product-price">{formatPrice(product.priceIdr)}</p>
					<p className="product-description">{product.description}</p>
					<div className="product-promises"><span><VerifiedIcon /> Official merchandise</span><span><CubeIcon /> Free shipping</span></div>
					<PurchasePanel productId={product.id} productName={product.name} variants={product.variants} />
					<details><summary>Product details</summary><p>Precision-made collector merchandise. Each piece is verified and packaged for secure display.</p></details>
					<details><summary>Delivery & returns</summary><p>Complimentary tracked delivery. Returns are accepted within 14 days in original condition.</p></details>
				</div>
			</section>

			<section className="technical-data">
				<div className="data-heading"><span>Technical data</span><strong>Precision specifications</strong></div>
				<div><span>Package weight</span><strong>{variant ? `${variant.packageWeightG} grams` : "—"}</strong></div>
				<div><span>Dimensions</span><strong>{variant ? `${variant.packageLengthMm} × ${variant.packageWidthMm} × ${variant.packageHeightMm} mm` : "—"}</strong></div>
				<div><span>Model no.</span><strong>{variant?.sku ?? "—"}</strong></div>
				<div><span>Edition</span><strong>{variant?.color ?? "Team edition"}</strong></div>
				<div><span>Availability</span><strong>{variant?.available ? "Ready to dispatch" : "Waitlist"}</strong></div>
				<div><span>Authenticity</span><strong>Verified</strong></div>
			</section>

			<section className="commentary-block">
				<div><span>Paddock commentary</span><strong>Designer perspective</strong></div>
				<article><p>The VANTAGE97 collection puts creativity in pole position. This is more than merchandise; it is an engineering study that mirrors the meticulous detail required in the actual paddock.</p><p>Every material, line and graphic is selected to celebrate the team&apos;s competitive identity while preserving the character of the original race equipment.</p><blockquote>“Built for the people who notice the final millimetre.”</blockquote></article>
			</section>
		</main>
	);
}
