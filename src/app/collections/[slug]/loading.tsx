"use client";

import { useDictionary } from "@/components/i18n-provider";

export default function CollectionLoading() {
	const messages = useDictionary();
	return <main className="page-shell collection-page"><section className="collection-title"><p className="eyebrow">{messages.collections.loading}</p><h1>{messages.collections.preparing}</h1></section><div className="catalog-loading" aria-label={messages.collections.loadingProducts} /></main>;
}
