"use client";

import Image from "next/image";
import { useState, type PointerEvent } from "react";
import { useDictionary } from "@/components/i18n-provider";
import { useProductSelection } from "@/components/product-selection";
import type { ProductPhoto } from "@/lib/catalog";

export function ProductGallery({ photos }: { photos: ProductPhoto[] }) {
	const messages = useDictionary();
	const { activePhoto, setActivePhoto, selectedStock } = useProductSelection();
	const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
	const current = photos[activePhoto] ?? photos[0];
	if (!current) return null;

	function updateZoom(event: PointerEvent<HTMLDivElement>) {
		if (event.pointerType !== "mouse") return;
		const bounds = event.currentTarget.getBoundingClientRect();
		const x = Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100));
		const y = Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100));
		setZoom({ active: true, x, y });
	}

	return (
		<div className="gallery">
			<div className="gallery-thumbs" aria-label={messages.product.productPhotos}>
				{photos.map((photo, index) => (
					<button className={activePhoto === index ? "active" : ""} key={photo.id} type="button" onClick={() => { setActivePhoto(index); setZoom((state) => ({ ...state, active: false })); }} aria-label={`${messages.product.viewImage} ${index + 1}`}>
						<Image src={photo.url} alt="" fill sizes="76px" />
					</button>
				))}
			</div>
			<div className="gallery-main" onPointerMove={updateZoom} onPointerLeave={() => setZoom((state) => ({ ...state, active: false }))}>
				{selectedStock === 1 ? <span className="stock-badge">{messages.product.lastStock}</span> : null}
				<button
					className={`gallery-main-image${zoom.active ? " is-zoomed" : ""}`}
					key={current.id}
					type="button"
					aria-label={`${messages.product.viewImage} ${activePhoto + 1}`}
					aria-pressed={zoom.active}
					onClick={() => setZoom((state) => ({ ...state, active: !state.active }))}
					style={{ transformOrigin: `${zoom.x}% ${zoom.y}%` }}
				>
					<Image src={current.url} alt={current.altText} fill sizes="(max-width: 800px) 100vw, 50vw" loading="eager" />
				</button>
			</div>
		</div>
	);
}
