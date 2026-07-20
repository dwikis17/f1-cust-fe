import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ResponsiveBanner } from "@/components/responsive-banner";
import { StructuredData } from "@/components/structured-data";
import { catalog } from "@/lib/catalog";
import { dictionary } from "@/lib/i18n";
import { localeAlternates, localizedPath, parseLocale } from "@/lib/locale";
import { absoluteUrl, siteName } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const locale = parseLocale((await params).locale);
	if (!locale) return {};
	const path = localizedPath(locale);
	return { alternates: { canonical: path, ...localeAlternates() } };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
	const locale = parseLocale((await params).locale);
	if (!locale) return null;
	const messages = dictionary(locale);
	const homePath = localizedPath(locale);
	const collectionsPath = localizedPath(locale, "/collections");
	const [{ data: products }, teams] = await Promise.all([
		catalog.listProducts({ limit: 4 }, locale),
		catalog.listTeams(),
	]);
	return (
		<main className="page-shell home-page">
			<StructuredData data={{
				"@context": "https://schema.org",
				"@graph": [
					{
						"@type": "OnlineStore",
						"@id": `${absoluteUrl(homePath)}#organization`,
						name: siteName,
						url: absoluteUrl(homePath),
						email: "support@valdye.com",
						description: messages.metadata.description,
					},
					{
						"@type": "WebSite",
						"@id": `${absoluteUrl(homePath)}#website`,
						name: siteName,
						url: absoluteUrl(homePath),
						publisher: { "@id": `${absoluteUrl(homePath)}#organization` },
						inLanguage: locale === "id" ? "id-ID" : "en",
					},
				],
			}} />
			<section className="home-hero">
				<ResponsiveBanner alt={messages.home.bannerAlt} />
				<div className="hero-shade" />
				<div className="hero-copy">
					<p className="eyebrow light">{messages.home.performanceEngineering}</p>
					<h1>{messages.home.teamwear}<br /><span>{messages.home.collection}</span></h1>
					<p>{messages.home.heroText}</p>
					<div className="hero-actions"><Link className="button button-light" href={collectionsPath}>{messages.home.shopNow}</Link><a className="button button-outline-light" href="#editorial">{messages.home.viewCampaign}</a></div>
				</div>
			</section>

			<section className="team-strip" aria-label={messages.home.teamsLabel}>
				{teams.map((team) => <Link href={localizedPath(locale, `/collections/${team.slug}`)} aria-label={team.name} key={team.id}>{team.logoUrl ? <Image src={team.logoUrl} alt={team.name} fill sizes="(max-width: 640px) 104px, 12vw" /> : <span>{team.name}</span>}</Link>)}
			</section>

			<section className="section selected-products">
				<div className="section-heading">
					<div><p className="eyebrow">{messages.home.selectedWorks}</p><h2>{messages.home.precisionGear}</h2></div>
					<Link className="text-link" href={collectionsPath}>{messages.home.exploreShop} <ArrowRightIcon /></Link>
				</div>
				<div className="home-product-grid">{products.slice(0, 4).map((product, index) => <ProductCard product={product} locale={locale} key={product.id} priority={index < 2} />)}</div>
			</section>

			<section className="editorial-section" id="editorial">
				<article className="editorial-feature">
					<Image src="/images/generated/banner-desktop.webp" alt={messages.home.racingAlt} fill sizes="(max-width: 800px) 100vw, 65vw" />
					<div className="editorial-copy"><p className="eyebrow light">{messages.home.editorial}</p><h2>{messages.home.silentSeconds}</h2><p>{messages.home.silentText}</p><Link href={collectionsPath}>{messages.home.shopNow}</Link></div>
				</article>
				<div className="editorial-side">
					<div className="engineering-card"><h3>{messages.home.engineeringBrief}</h3><p>{messages.home.engineeringText}</p><Link className="text-link light" href={collectionsPath}>{messages.home.exploreShop} <ArrowRightIcon /></Link></div>
					<div className="wheel-card"><Link href={collectionsPath} aria-label={messages.home.shopNow}><Image src="/images/generated/product-04-detail.webp" alt={messages.home.detailAlt} fill sizes="(max-width: 600px) 100vw, 35vw" /><span aria-hidden="true"><ArrowRightIcon /></span></Link></div>
				</div>
			</section>
		</main>
	);
}
