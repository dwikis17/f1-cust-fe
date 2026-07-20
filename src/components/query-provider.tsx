"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const QUERY_CACHE_MS = 180_000;

export function QueryProvider({ children }: { children: React.ReactNode }) {
	const [client] = useState(() => new QueryClient({
		defaultOptions: { queries: { staleTime: QUERY_CACHE_MS, gcTime: QUERY_CACHE_MS, retry: false } },
	}));
	return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
