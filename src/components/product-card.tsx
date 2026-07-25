import Image from "next/image";
import Link from "next/link";
import { formatPrice, type PublicProduct } from "@/lib/catalog";
import { dictionary, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale";

export function ProductCard({ product, locale, priority = false }: { product: PublicProduct; locale: Locale; priority?: boolean }) {
	const photo = product.photos[0];
	const messages = dictionary(locale);
	const originalPrice = product.originalPriceIdr;
	const onSale = originalPrice !== null;
	return (
		<article className="product-card">
			<Link href={localizedPath(locale, `/products/${product.slug}`)} aria-label={product.name}>
				<div className="product-image">
					{photo ? <Image src={photo.url} alt={photo.altText} fill sizes="(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw" loading={priority ? "eager" : "lazy"} /> : <span className="product-image-placeholder"><b aria-hidden="true">V</b><span>{messages.product.imageUnavailable}</span></span>}
					{product.condition ? <span className="condition-badge">{messages.conditions[product.condition].short}</span> : null}
					{onSale ? <span className="sale-badge">{messages.product.sale}</span> : null}
				</div>
				<div className="product-meta">
					<p>{product.team?.name ?? product.productType.name}</p>
					<div><h3>{product.name}</h3>{originalPrice !== null ? <span className="product-card-price"><strong>{formatPrice(product.priceIdr, locale)}</strong><del>{formatPrice(originalPrice, locale)}</del></span> : <strong>{formatPrice(product.priceIdr, locale)}</strong>}</div>
				</div>
			</Link>
		</article>
	);
}
