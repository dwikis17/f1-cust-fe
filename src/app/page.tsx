import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ResponsiveBanner } from "@/components/responsive-banner";
import { catalog } from "@/lib/catalog";
import { dictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

const teams = [
	["◒", "McLaren"], ["ϟ", "Ferrari"], ["⬡", "Red Bull"], ["◇", "Mercedes"], ["⬢", "Aston Martin"], ["▦", "Sauber"], ["⠿", "Williams"],
];

export default async function Home() {
	const locale = await getLocale();
	const messages = dictionary(locale);
	const { data: products } = await catalog.listProducts({ limit: 8 }, locale);
	return (
		<main className="page-shell home-page">
			<section className="home-hero">
				<ResponsiveBanner alt={messages.home.bannerAlt} />
				<div className="hero-shade" />
				<div className="hero-copy">
					<p className="eyebrow light">{messages.home.performanceEngineering}</p>
					<h1>{messages.home.teamwear}<br /><span>{messages.home.collection}</span></h1>
					<p>{messages.home.heroText}</p>
					<div className="hero-actions"><Link className="button button-light" href="/collections">{messages.home.shopNow}</Link><a className="button button-outline-light" href="#editorial">{messages.home.viewCampaign}</a></div>
				</div>
				<div className="hero-index"><span>01</span><i /><span>03</span></div>
			</section>

			<section className="team-strip" aria-label={messages.home.teamsLabel}>
				{teams.map(([symbol, name]) => <div key={name}><b>{symbol}</b><span>{name}</span></div>)}
			</section>

			<section className="section selected-products">
				<div className="section-heading">
					<div><p className="eyebrow">{messages.home.selectedWorks}</p><h2>{messages.home.precisionGear}</h2></div>
					<Link className="text-link" href="/collections">{messages.home.exploreShop} <ArrowRightIcon /></Link>
				</div>
				<div className="home-product-grid">{products.slice(0, 4).map((product, index) => <ProductCard product={product} locale={locale} key={product.id} priority={index < 2} />)}</div>
			</section>

			<section className="editorial-section" id="editorial">
				<article className="editorial-feature">
					<Image src="/images/generated/banner-desktop.webp" alt={messages.home.racingAlt} fill sizes="(max-width: 800px) 100vw, 65vw" />
					<div className="editorial-copy"><p className="eyebrow light">{messages.home.editorial}</p><h2>{messages.home.silentSeconds}</h2><p>{messages.home.silentText}</p><a href="#">{messages.home.readStory}</a></div>
				</article>
				<div className="editorial-side">
					<div className="engineering-card"><h3>{messages.home.engineeringBrief}</h3><p>{messages.home.engineeringText}</p><span>♞</span></div>
					<div className="wheel-card"><Image src="/images/generated/product-04-detail.webp" alt={messages.home.detailAlt} fill sizes="35vw" /><button type="button" aria-label={messages.home.playFilm}>▶</button></div>
				</div>
			</section>
		</main>
	);
}
