"use client";

import Link from "next/link";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { localizedPath } from "@/lib/locale";

export default function CollectionError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
	const messages = useDictionary();
	const locale = useLocale();
	return <main className="page-shell collection-page"><section className="empty-state collection-error"><p className="eyebrow">{messages.collections.unavailable}</p><h1>{messages.collections.loadFailed}</h1><p>{messages.collections.retainedFilters}</p><div className="hero-actions"><button className="button button-dark" type="button" onClick={reset}>{messages.collections.retry}</button><Link className="button" href={localizedPath(locale, "/collections")}>{messages.collections.allCollections}</Link></div></section></main>;
}
