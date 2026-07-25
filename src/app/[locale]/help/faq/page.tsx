import type { Metadata } from "next";
import Link from "next/link";

import { FaqCopyButton } from "@/components/faq-copy-button";
import { StructuredData } from "@/components/structured-data";
import { listFaqs } from "@/lib/faqs";
import { dictionary } from "@/lib/i18n";
import { localeAlternates, localizedPath, parseLocale } from "@/lib/locale";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3_600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const locale = parseLocale((await params).locale);
	if (!locale) return {};
	const messages = dictionary(locale);
	return { title: messages.faq.title, description: messages.faq.intro, alternates: { canonical: localizedPath(locale, "/help/faq"), ...localeAlternates("/help/faq") } };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
	const locale = parseLocale((await params).locale);
	if (!locale) return null;
	const messages = dictionary(locale);
	const faqs = await listFaqs(locale);
	const homePath = localizedPath(locale);
	const faqPath = localizedPath(locale, "/help/faq");

	return (
		<main className="page-shell help-page faq-page">
			<StructuredData data={{
				"@context": "https://schema.org",
				"@type": "BreadcrumbList",
				itemListElement: [
					{ "@type": "ListItem", position: 1, name: "Valyde Jersey", item: absoluteUrl(homePath) },
					{ "@type": "ListItem", position: 2, name: messages.faq.title, item: absoluteUrl(faqPath) },
				],
			}} />
			<nav className="breadcrumbs" aria-label={messages.faq.breadcrumb}>
				<Link href={homePath}>Valyde Jersey</Link><span>/</span><strong>{messages.faq.title}</strong>
			</nav>
			<header className="faq-hero">
				<div>
					<p className="faq-register">{messages.faq.eyebrow}</p>
					<h1>{messages.faq.title}</h1>
				</div>
				<p>{messages.faq.intro}</p>
			</header>
			<div className="faq-layout">
				<aside className="faq-support">
					<p className="faq-count"><span>{faqs.length}</span> {messages.faq.answerCount}</p>
					<h2>{messages.faq.stillNeedHelp}</h2>
					<p>{messages.faq.contactText}</p>
					<a className="faq-contact-link" href="mailto:support@valyde.com">{messages.faq.contactSupport}</a>
				</aside>
				<section className="faq-list" aria-label={messages.faq.title}>
					{faqs.length === 0 ? (
						<div className="faq-empty">
							<h2>{messages.faq.emptyTitle}</h2>
							<p>{messages.faq.emptyText}</p>
							<a className="faq-contact-link" href="mailto:support@valyde.com">{messages.faq.contactSupport}</a>
						</div>
					) : faqs.map((faq, index) => (
						<details className="faq-item" name="faq" open={index === 0} key={faq.id}>
							<summary>
								<span className="faq-index">{String(index + 1).padStart(2, "0")}</span>
								<span className="faq-question">{faq.question}</span>
								<span className="faq-toggle" aria-hidden="true" />
							</summary>
							<div className="faq-answer">
								<p>{faq.answer}</p>
								<FaqCopyButton answer={faq.answer} copyLabel={messages.faq.copyAnswer} copiedLabel={messages.faq.copied} />
							</div>
						</details>
					))}
				</section>
			</div>
		</main>
	);
}
