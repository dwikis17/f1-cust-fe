import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { ResponsiveBanner } from "@/components/responsive-banner";
import { catalog } from "@/lib/catalog";

const teams = [
	["◒", "McLaren"], ["ϟ", "Ferrari"], ["⬡", "Red Bull"], ["◇", "Mercedes"], ["⬢", "Aston Martin"], ["▦", "Sauber"], ["⠿", "Williams"],
];

export default async function Home() {
	const { data: products } = await catalog.listProducts({ limit: 8 });
	return (
		<main className="page-shell home-page">
			<section className="home-hero">
				<ResponsiveBanner alt="Two fictional grand-prix cars racing through a floodlit corner at night" />
				<div className="hero-shade" />
				<div className="hero-copy">
					<p className="eyebrow light">Performance engineering</p>
					<h1>2026 Teamwear<br /><span>Collection</span></h1>
					<p>Engineered for the paddock. Designed for the city. Experience the new era of McLaren Racing precision apparel.</p>
					<div className="hero-actions"><Link className="button button-light" href="/collections">Shop now</Link><a className="button button-outline-light" href="#editorial">View campaign</a></div>
				</div>
				<div className="hero-index"><span>01</span><i /><span>03</span></div>
			</section>

			<section className="team-strip" aria-label="Formula 1 teams">
				{teams.map(([symbol, name]) => <div key={name}><b>{symbol}</b><span>{name}</span></div>)}
			</section>

			<section className="section selected-products">
				<div className="section-heading">
					<div><p className="eyebrow">Selected works</p><h2>Precision gear</h2></div>
					<Link className="text-link" href="/collections">Explore entire shop <ArrowRightIcon /></Link>
				</div>
				<div className="home-product-grid">{products.slice(0, 4).map((product, index) => <ProductCard product={product} key={product.id} priority={index < 2} />)}</div>
			</section>

			<section className="editorial-section" id="editorial">
				<article className="editorial-feature">
					<Image src="/images/generated/banner-desktop.webp" alt="Grand-prix cars racing at night" fill sizes="(max-width: 800px) 100vw, 65vw" />
					<div className="editorial-copy"><p className="eyebrow light">Editorial</p><h2>The silent seconds</h2><p>Inside the mental preparation of the world&apos;s fastest athletes during the pre-race blackout.</p><a href="#">Read story</a></div>
				</article>
				<div className="editorial-side">
					<div className="engineering-card"><h3>Engineering brief</h3><p>Discover the aerodynamics behind our 2026 apparel textile weave.</p><span>♞</span></div>
					<div className="wheel-card"><Image src="/images/generated/product-04-detail.webp" alt="Detailed carbon-fibre racing helmet visor hardware" fill sizes="35vw" /><button type="button" aria-label="Play film">▶</button></div>
				</div>
			</section>
		</main>
	);
}
