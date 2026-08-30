import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import type { PublicHomeCollectionBlock } from "@/lib/home";
import { dictionary, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale";

export function HomeCollectionBlock({ block, locale }: { block: PublicHomeCollectionBlock; locale: Locale }) {
	const messages = dictionary(locale);
	const collectionPath = localizedPath(locale, `/collections/${block.collection.slug}`);
	const images = [
		{ src: block.leadImageUrl, className: "collection-block-image-lead" },
		{ src: block.sideImageOneUrl, className: "collection-block-image-side" },
		{ src: block.sideImageTwoUrl, className: "collection-block-image-side" },
	].filter((image): image is { src: string; className: string } => Boolean(image.src));

	return (
		<section className="section home-collection-block">
			{images.length ? <div className="collection-block-gallery" data-image-count={images.length}>
				{images.map((image, index) => (
					<Link
						className={image.className}
						href={collectionPath}
						aria-label={`${messages.header.viewAll} ${block.collection.name}`}
						key={image.src}
					>
						<Image
							src={image.src}
							alt=""
							fill
							sizes={index === 0 ? "(max-width: 600px) 84vw, 50vw" : "(max-width: 600px) 84vw, 25vw"}
						/>
					</Link>
				))}
			</div> : null}
			<div className="collection-block-heading">
				<div>
					<h2>{block.collection.name}</h2>
					{block.collection.description ? <p>{block.collection.description}</p> : null}
				</div>
				<Link className="text-link" href={collectionPath}>
					{messages.header.viewAll} <ArrowRightIcon />
				</Link>
			</div>
			<div className="collection-block-products">
				{block.products.map((product) => (
					<ProductCard
						product={product}
						locale={locale}
						imageSizes="(max-width: 600px) 76vw, (max-width: 900px) 44vw, 20vw"
						key={product.id}
					/>
				))}
			</div>
		</section>
	);
}
