import type { Metadata } from "next";
import Link from "next/link";

import { listFaqs } from "@/lib/faqs";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export async function generateMetadata(): Promise<Metadata> {
	const messages = dictionary(await getLocale());
	return { title: messages.faq.title, description: messages.faq.intro };
}

export default async function FaqPage() {
	const locale = await getLocale();
	const messages = dictionary(locale);
	const faqs = await listFaqs(locale);

	return (
		<main className="page-shell help-page faq-page">
			<nav className="breadcrumbs" aria-label={messages.faq.breadcrumb}>
				<Link href="/">VALDYE</Link><span>/</span><strong>{messages.faq.title}</strong>
			</nav>
			<header className="faq-hero">
				<div>
					<p className="faq-register">{messages.faq.supportDesk}</p>
					<h1>{messages.faq.title}</h1>
				</div>
				<p>{messages.faq.intro}</p>
			</header>
			<div className="faq-layout">
				<aside className="faq-support">
					<p className="faq-count"><span>{faqs.length}</span> {messages.faq.answerCount}</p>
					<h2>{messages.faq.stillNeedHelp}</h2>
					<p>{messages.faq.contactText}</p>
					<a className="text-link" href="mailto:support@valdye.com">{messages.faq.contactSupport}</a>
				</aside>
				<section className="faq-list" aria-label={messages.faq.title}>
					{faqs.length === 0 ? (
						<div className="faq-empty">
							<h2>{messages.faq.emptyTitle}</h2>
							<p>{messages.faq.emptyText}</p>
							<a className="text-link" href="mailto:support@valdye.com">{messages.faq.contactSupport}</a>
						</div>
					) : faqs.map((faq, index) => (
						<details className="faq-item" name="faq" open={index === 0} key={faq.id}>
							<summary>
								<span className="faq-index">{String(index + 1).padStart(2, "0")}</span>
								<span className="faq-question">{faq.question}</span>
								<span className="faq-toggle" aria-hidden="true" />
							</summary>
							<div className="faq-answer"><p>{faq.answer}</p></div>
						</details>
					))}
				</section>
			</div>
		</main>
	);
}
