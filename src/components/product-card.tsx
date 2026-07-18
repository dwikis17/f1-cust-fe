import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import type { PublicProduct } from "@/lib/mock";

export function ProductCard({ product, locale, priority = false, collectionSlug }: { product: PublicProduct; locale: Locale; priority?: boolean; collectionSlug?: string }) {
	const photo = product.photos[0];
	return (
		<article className="product-card">
			<Link href={`/products/${product.slug}${collectionSlug ? `?collection=${collectionSlug}` : ""}`} aria-label={product.name}>
				<div className="product-image">
					{photo ? <Image src={photo.url} alt={photo.altText} fill sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" loading={priority ? "eager" : "lazy"} /> : null}
				</div>
				<div className="product-meta">
					<p>{product.team?.name ?? product.productType.name}</p>
					<div><h3>{product.name}</h3><strong>{formatPrice(product.priceIdr, locale)}</strong></div>
				</div>
			</Link>
		</article>
	);
}
