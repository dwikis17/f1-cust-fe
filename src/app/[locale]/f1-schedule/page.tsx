import type { Metadata } from "next";
import Link from "next/link";

import { StructuredData } from "@/components/structured-data";
import { F1_2026_SCHEDULE } from "@/lib/races";
import { dictionary } from "@/lib/i18n";
import { localeAlternates, localeStaticParams, localizedPath, parseLocale } from "@/lib/locale";
import { absoluteUrl, siteName } from "@/lib/seo";

export const dynamic = "force-static";
export const dynamicParams = false;

const dateFormatters = {
	en: new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", timeZone: "UTC", year: "numeric" }),
	id: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", timeZone: "UTC", year: "numeric" }),
};

export function generateStaticParams() {
	return localeStaticParams();
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const locale = parseLocale((await params).locale);
	if (!locale) return {};
	const messages = dictionary(locale);
	const pagePath = localizedPath(locale, "/f1-schedule");
	return {
		title: messages.schedule.title,
		description: messages.schedule.intro,
		alternates: { canonical: pagePath, ...localeAlternates("/f1-schedule") },
	};
}

export default async function F1SchedulePage({ params }: { params: Promise<{ locale: string }> }) {
	const locale = parseLocale((await params).locale);
	if (!locale) return null;
	const messages = dictionary(locale);
	const homePath = localizedPath(locale);
	const pagePath = localizedPath(locale, "/f1-schedule");

	return (
		<main className="page-shell schedule-page">
			<StructuredData data={{
				"@context": "https://schema.org",
				"@graph": [
					{
						"@type": "Article",
						"@id": `${absoluteUrl(pagePath)}#article`,
						headline: messages.schedule.title,
						description: messages.schedule.intro,
						mainEntityOfPage: absoluteUrl(pagePath),
						inLanguage: locale === "id" ? "id-ID" : "en-US",
						publisher: { "@type": "Organization", name: siteName, url: absoluteUrl(homePath) },
					},
					{
						"@type": "BreadcrumbList",
						itemListElement: [
							{ "@type": "ListItem", position: 1, name: siteName, item: absoluteUrl(homePath) },
							{ "@type": "ListItem", position: 2, name: messages.schedule.breadcrumb, item: absoluteUrl(pagePath) },
						],
					},
				],
			}} />

			<nav className="breadcrumbs" aria-label={messages.schedule.breadcrumb}>
				<Link href={homePath}>{siteName}</Link><span>/</span><strong>{messages.schedule.breadcrumb}</strong>
			</nav>

			<header className="schedule-hero">
				<p className="schedule-eyebrow">{messages.schedule.eyebrow}</p>
				<h1>{messages.schedule.title}</h1>
				<p>{messages.schedule.intro}</p>
			</header>

			<div className="schedule-layout">
				<article className="schedule-copy">
					<section>
						<h2>{messages.schedule.calendarTitle}</h2>
						<p>{messages.schedule.calendarText}</p>
					</section>
					<section>
						<h2>{messages.schedule.circuitsTitle}</h2>
						<p>{messages.schedule.circuitsText}</p>
					</section>
					<section>
						<h2>{messages.schedule.raceDayTitle}</h2>
						<p>{messages.schedule.raceDayText}</p>
					</section>
					<Link className="button button-dark schedule-cta" href={localizedPath(locale, "/collections")}>
						{messages.schedule.shopGear}
					</Link>
				</article>

				<section className="schedule-calendar" aria-labelledby="schedule-calendar-title">
					<div className="schedule-calendar-heading">
						<p className="eyebrow">{messages.schedule.eyebrow}</p>
						<h2 id="schedule-calendar-title">{messages.schedule.tableTitle}</h2>
					</div>
					<div className="schedule-table-wrapper">
						<table className="schedule-table">
							<caption className="sr-only">{messages.schedule.tableTitle}</caption>
							<thead>
								<tr>
									<th scope="col">{messages.schedule.round}</th>
									<th scope="col">{messages.schedule.grandPrix}</th>
									<th scope="col">{messages.schedule.date}</th>
									<th scope="col">{messages.schedule.circuit}</th>
									<th scope="col">{messages.schedule.location}</th>
								</tr>
							</thead>
							<tbody>
								{F1_2026_SCHEDULE.map((race, index) => (
									<tr key={race.slug}>
										<th scope="row">{String(index + 1).padStart(2, "0")}</th>
										<td><span className="schedule-flag" aria-hidden="true">{race.flag}</span>{race.name[locale]}</td>
										<td>{dateFormatters[locale].format(new Date(race.raceDate))}</td>
										<td>{race.circuit}</td>
										<td>{race.location}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</section>
			</div>
		</main>
	);
}
