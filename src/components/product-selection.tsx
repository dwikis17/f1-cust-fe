"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { ProductPhoto } from "@/lib/catalog";

const ProductSelectionContext = createContext<{
	activePhoto: number;
	setActivePhoto: (index: number) => void;
	selectColor: (color: string | null) => void;
}>({ activePhoto: 0, setActivePhoto: () => {}, selectColor: () => {} });

export function ProductSelection({ children, photos }: { children: ReactNode; photos: ProductPhoto[] }) {
	const [activePhoto, setActivePhoto] = useState(0);

	function selectColor(color: string | null) {
		const index = photos.findIndex((photo) => photo.color === color);
		if (index >= 0) setActivePhoto(index);
	}

	return <ProductSelectionContext value={{ activePhoto, setActivePhoto, selectColor }}>{children}</ProductSelectionContext>;
}

export const useProductSelection = () => useContext(ProductSelectionContext);
