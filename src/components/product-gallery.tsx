"use client";

import Image from "next/image";
import { useDictionary } from "@/components/i18n-provider";
import { useProductSelection } from "@/components/product-selection";
import type { ProductPhoto } from "@/lib/catalog";

export function ProductGallery({ photos }: { photos: ProductPhoto[] }) {
	const messages = useDictionary();
	const { activePhoto, setActivePhoto, selectedStock } = useProductSelection();
	const current = photos[activePhoto] ?? photos[0];
	if (!current) return null;

	return (
		<div className="gallery">
			<div className="gallery-thumbs" aria-label={messages.product.productPhotos}>
				{photos.map((photo, index) => (
					<button className={activePhoto === index ? "active" : ""} key={photo.id} type="button" onClick={() => setActivePhoto(index)} aria-label={`${messages.product.viewImage} ${index + 1}`}>
						<Image src={photo.url} alt="" fill sizes="76px" />
					</button>
				))}
			</div>
			<div className="gallery-main">
				{selectedStock === 1 ? <span className="stock-badge">{messages.product.lastStock}</span> : null}
				<div className="gallery-main-image" key={current.id}>
					<Image src={current.url} alt={current.altText} fill sizes="(max-width: 800px) 100vw, 50vw" loading="eager" />
				</div>
			</div>
		</div>
	);
}
