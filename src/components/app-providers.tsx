"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useCartStore } from "@/lib/cart-store";

export const QUERY_CACHE_MS = 180_000;

export function AppProviders({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => new QueryClient({
		defaultOptions: {
			queries: { staleTime: QUERY_CACHE_MS, gcTime: QUERY_CACHE_MS, retry: false },
		},
	}));

	useEffect(() => useCartStore.getState().hydrate(), []);

	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
