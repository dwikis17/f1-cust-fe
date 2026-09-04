"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ProductPhoto } from "@/lib/catalog";

const ProductSelectionContext = createContext<{
	activePhoto: number;
	setActivePhoto: (index: number) => void;
	selectColor: (color: string | null) => void;
	selectedStock: number;
	setSelectedStock: (stock: number) => void;
}>({ activePhoto: 0, setActivePhoto: () => {}, selectColor: () => {}, selectedStock: 0, setSelectedStock: () => {} });

export function ProductSelection({ children, photos, initialColor, initialStockQuantity = 0 }: { children: ReactNode; photos: ProductPhoto[]; initialColor?: string | null; initialStockQuantity?: number }) {
	const [activePhoto, setActivePhoto] = useState(() => Math.max(0, photos.findIndex((photo) => photo.color === initialColor)));
	const [selectedStock, setSelectedStock] = useState(initialStockQuantity);

	function selectColor(color: string | null) {
		const index = photos.findIndex((photo) => photo.color === color);
		if (index >= 0) setActivePhoto(index);
	}

	return <ProductSelectionContext value={{ activePhoto, setActivePhoto, selectColor, selectedStock, setSelectedStock }}>{children}</ProductSelectionContext>;
}

export const useProductSelection = () => useContext(ProductSelectionContext);
