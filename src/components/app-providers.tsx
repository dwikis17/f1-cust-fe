"use client";

import { useEffect } from "react";

import { useCartStore } from "@/lib/cart-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
	useEffect(() => useCartStore.getState().hydrate(), []);
	return children;
}
