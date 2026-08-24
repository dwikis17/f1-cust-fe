import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HomeCarousel } from "@/components/home-carousel";
import { HomeCollectionBlock } from "@/components/home-collection-block";
import { RouteIcon, ShieldIcon, TruckIcon, VerifiedIcon } from "@/components/icons";
import { StructuredData } from "@/components/structured-data";
import { catalog } from "@/lib/catalog";
import { resolveHomeHeroes, splitHomeCollectionBlocks } from "@/lib/home";
import { dictionary } from "@/lib/i18n";
import { localeAlternates, localizedPath, parseLocale } from "@/lib/locale";
import { absoluteUrl, siteName } from "@/lib/seo";
import { getSupportContent } from "@/lib/support";

export const revalidate = 300;

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
	const [collectionTree, managedHeroes, collectionBlocks, support] = await Promise.all([
		catalog.listCollections(locale),
		catalog.getHomeHeroes(locale),
		catalog.getHomeCollectionBlocks(locale),
		getSupportContent(),
	]);
	const { newArrival, remaining: remainingCollectionBlocks } = splitHomeCollectionBlocks(collectionBlocks);
	const teams = collectionTree.flatMap((parent) => parent.children).filter((collection) => collection.kind === "TEAM");
	const heroes = resolveHomeHeroes(managedHeroes, {
		id: "fallback",
		eyebrow: messages.home.performanceEngineering,
		title: messages.home.teamwear,
		outlinedTitle: messages.home.collection,
		body: messages.home.heroText,
		ctaLabel: messages.home.shopNow,
		desktopImageUrl: "/images/generated/banner-desktop.webp",
		mobileImageUrl: "/images/generated/banner-mobile.webp",
		imageAlt: messages.home.bannerAlt,
		ctaPath: "/collections",
	});
	const trustItems = [
		{ id: "01", label: messages.home.conditionClear, Icon: VerifiedIcon },
		{ id: "02", label: messages.home.securePayment, Icon: ShieldIcon },
		{ id: "03", label: messages.home.indonesiaDelivery, Icon: TruckIcon },
		{ id: "04", label: messages.home.orderTracking, Icon: RouteIcon },
	];
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
						email: support.email,
						telephone: `+${support.whatsappNumber}`,
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
			<HomeCarousel
				slides={heroes}
				locale={locale}
				labels={{
					carousel: messages.home.carouselLabel,
					previous: messages.home.previousCampaign,
					next: messages.home.nextCampaign,
					show: messages.home.showCampaign,
					editorial: messages.home.viewCampaign,
				}}
			/>

			<section className="trust-bar" aria-label={messages.home.trustLabel}>
				<ul>
					{trustItems.map(({ id, label, Icon }) => (
						<li className="trust-item group" key={label}>
							<div className="trust-icon-box">
								<Icon aria-hidden="true" />
							</div>
							<div className="trust-content">
								<span className="trust-code">{id}</span>
								<span className="trust-label">{label}</span>
							</div>
						</li>
					))}
				</ul>
			</section>

			<section className="team-strip" aria-label={messages.home.teamsLabel}>
				{teams.map((team) => <Link href={localizedPath(locale, `/collections/${team.slug}`)} aria-label={team.name} key={team.id}>{team.imageUrl ? <Image src={team.imageUrl} alt={team.name} fill sizes="(max-width: 640px) 104px, 12vw" /> : <span>{team.name}</span>}</Link>)}
			</section>

			{newArrival ? <HomeCollectionBlock block={newArrival} locale={locale} /> : null}

			{remainingCollectionBlocks.map((block) => <HomeCollectionBlock block={block} locale={locale} key={block.id} />)}
		</main>
	);
}
