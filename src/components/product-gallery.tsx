"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";
import { useDictionary } from "@/components/i18n-provider";
import { useProductSelection } from "@/components/product-selection";
import type { ProductPhoto } from "@/lib/catalog";

type TouchGesture = {
	startX: number;
	startY: number;
	originX: number;
	originY: number;
	wasActive: boolean;
	moved: boolean;
};

export function ProductGallery({ photos }: { photos: ProductPhoto[] }) {
	const messages = useDictionary();
	const { activePhoto, setActivePhoto, selectedStock } = useProductSelection();
	const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
	const touchGesture = useRef<TouchGesture | null>(null);
	const current = photos[activePhoto] ?? photos[0];
	if (!current) return null;

	function getPosition(event: PointerEvent<HTMLDivElement>) {
		const bounds = event.currentTarget.getBoundingClientRect();
		return {
			x: Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100)),
			y: Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100)),
		};
	}

	function resetZoom() {
		touchGesture.current = null;
		setZoom((state) => ({ ...state, active: false }));
	}

	function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
		if (event.pointerType === "mouse") return;
		const position = getPosition(event);
		const wasActive = zoom.active;
		const originX = wasActive ? zoom.x : Math.min(100, Math.max(0, position.x * 2 - 50));
		const originY = wasActive ? zoom.y : Math.min(100, Math.max(0, position.y * 2 - 50));
		touchGesture.current = { startX: position.x, startY: position.y, originX, originY, wasActive, moved: false };
		event.currentTarget.setPointerCapture(event.pointerId);
		if (!wasActive) setZoom({ active: true, x: originX, y: originY });
	}

	function updateZoom(event: PointerEvent<HTMLDivElement>) {
		const position = getPosition(event);
		if (event.pointerType === "mouse") {
			setZoom({ active: true, x: position.x, y: position.y });
			return;
		}
		const gesture = touchGesture.current;
		if (!gesture) return;
		const deltaX = position.x - gesture.startX;
		const deltaY = position.y - gesture.startY;
		if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) gesture.moved = true;
		setZoom({
			active: true,
			x: Math.min(100, Math.max(0, gesture.originX - deltaX)),
			y: Math.min(100, Math.max(0, gesture.originY - deltaY)),
		});
	}

	function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
		if (event.pointerType !== "mouse" && event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
	}

	function toggleZoom() {
		const gesture = touchGesture.current;
		touchGesture.current = null;
		if (gesture) {
			if (gesture.wasActive && !gesture.moved) resetZoom();
			return;
		}
		setZoom((state) => ({ ...state, active: !state.active }));
	}

	return (
		<div className="gallery">
			<div className="gallery-thumbs" aria-label={messages.product.productPhotos}>
				{photos.map((photo, index) => (
					<button className={activePhoto === index ? "active" : ""} key={photo.id} type="button" onClick={() => { setActivePhoto(index); resetZoom(); }} aria-label={`${messages.product.viewImage} ${index + 1}`}>
						<Image src={photo.url} alt="" fill sizes="76px" />
					</button>
				))}
			</div>
			<div
				className="gallery-main"
				onPointerDown={handlePointerDown}
				onPointerMove={updateZoom}
				onPointerUp={handlePointerUp}
				onPointerCancel={resetZoom}
				onPointerLeave={(event) => { if (event.pointerType === "mouse") resetZoom(); }}
			>
				{selectedStock === 1 ? <span className="stock-badge">{messages.product.lastStock}</span> : null}
				<button
					className={`gallery-main-image${zoom.active ? " is-zoomed" : ""}`}
					key={current.id}
					type="button"
					aria-label={`${messages.product.viewImage} ${activePhoto + 1}`}
					aria-pressed={zoom.active}
					onClick={toggleZoom}
					style={{ transformOrigin: `${zoom.x}% ${zoom.y}%` }}
				>
					<Image src={current.url} alt={current.altText} fill sizes="(max-width: 800px) 100vw, 50vw" loading="eager" />
				</button>
			</div>
		</div>
	);
}
