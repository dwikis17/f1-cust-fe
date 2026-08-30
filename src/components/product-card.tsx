import Image from "next/image";
import Link from "next/link";
import { formatPrice, type PublicProductCard } from "@/lib/catalog";
import { dictionary, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale";

export function ProductCard({
	product,
	locale,
	priority = false,
	imageSizes = "(max-width: 700px) 50vw, (max-width: 1100px) 33vw, 25vw",
}: {
	product: PublicProductCard;
	locale: Locale;
	priority?: boolean;
	imageSizes?: string;
}) {
	const photo = product.photos[0];
	const hoverPhoto = product.photos[1];
	const messages = dictionary(locale);
	const originalPrice = product.originalPriceIdr;
	const onSale = product.salePercentage !== null;
	return (
		<article className="product-card">
			<Link href={localizedPath(locale, `/products/${product.slug}`)} aria-label={product.name}>
				<div className="product-image">
					{photo ? (
						<>
							<Image
								src={photo.url}
								alt={photo.altText}
								fill
								className="product-image-primary"
								sizes={imageSizes}
								loading={priority ? "eager" : "lazy"}
							/>
							{hoverPhoto ? (
								<Image
									src={hoverPhoto.url}
									alt={hoverPhoto.altText || photo.altText}
									fill
									className="product-image-secondary"
									sizes={imageSizes}
									loading="lazy"
								/>
							) : null}
						</>
					) : (
						<span className="product-image-placeholder">
							<b aria-hidden="true">V</b>
							<span>{messages.product.imageUnavailable}</span>
						</span>
					)}
					{product.condition || product.tags.length ? (
						<div className="product-image-badges">
							{product.condition ? <span className="condition-badge">{messages.conditions[product.condition].short}</span> : null}
							{product.tags.length ? <div className="product-tags" aria-label="Product tags">{product.tags.map((tag) => <span className="tag-pill" key={tag.id}>{tag.name}</span>)}</div> : null}
						</div>
					) : null}
					{onSale ? <span className="sale-badge">-{product.salePercentage}%</span> : null}
				</div>
				<div className="product-meta">
					<p>{product.team?.name ?? product.productType.name}</p>
					<div><h3>{product.name}</h3>{originalPrice !== null ? <span className="product-card-price"><strong>{formatPrice(product.priceIdr, locale)}</strong><del>{formatPrice(originalPrice, locale)}</del></span> : <strong>{formatPrice(product.priceIdr, locale)}</strong>}</div>
				</div>
			</Link>
		</article>
	);
}
