"use client";

import Link from "next/link";

export default function CollectionError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return <main className="page-shell collection-page"><section className="empty-state collection-error"><p className="eyebrow">Collection unavailable</p><h1>We could not load this grid</h1><p>Your filters remain in the address bar. Retry without losing them, or return to all collections.</p><div className="hero-actions"><button className="button button-dark" type="button" onClick={reset}>Retry</button><Link className="button" href="/collections">All collections</Link></div></section></main>;
}
