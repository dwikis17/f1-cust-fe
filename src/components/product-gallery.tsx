"use client";

import Image from "next/image";
import { useState } from "react";
import { useDictionary } from "@/components/i18n-provider";
import type { ProductPhoto } from "@/lib/catalog";

export function ProductGallery({ photos }: { photos: ProductPhoto[] }) {
	const messages = useDictionary();
	const [active, setActive] = useState(0);
	const current = photos[active] ?? photos[0];
	if (!current) return null;

	return (
		<div className="gallery">
			<div className="gallery-thumbs" aria-label={messages.product.productPhotos}>
				{photos.map((photo, index) => (
					<button className={active === index ? "active" : ""} key={photo.id} type="button" onClick={() => setActive(index)} aria-label={`${messages.product.viewImage} ${index + 1}`}>
						<Image src={photo.url} alt="" fill sizes="76px" />
					</button>
				))}
			</div>
			<div className="gallery-main">
				<span className="stock-badge">{messages.product.lastStock}</span>
				<div className="gallery-main-image" key={current.id}>
					<Image src={current.url} alt={current.altText} fill sizes="(max-width: 800px) 100vw, 50vw" loading="eager" />
				</div>
			</div>
		</div>
	);
}
