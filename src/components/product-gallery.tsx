"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductPhoto } from "@/lib/mock";

export function ProductGallery({ photos }: { photos: ProductPhoto[] }) {
	const [active, setActive] = useState(0);
	const current = photos[active] ?? photos[0];
	if (!current) return null;

	return (
		<div className="gallery">
			<div className="gallery-thumbs" aria-label="Product photos">
				{photos.map((photo, index) => (
					<button className={active === index ? "active" : ""} key={photo.id} type="button" onClick={() => setActive(index)} aria-label={`View image ${index + 1}`}>
						<Image src={photo.url} alt="" fill sizes="76px" />
					</button>
				))}
			</div>
			<div className="gallery-main">
				<span className="stock-badge">Last stock</span>
				<Image src={current.url} alt={current.altText} fill sizes="(max-width: 800px) 100vw, 50vw" loading="eager" />
			</div>
		</div>
	);
}
