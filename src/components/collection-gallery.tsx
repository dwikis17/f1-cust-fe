import Image from "next/image";
import Link from "next/link";

import type { CollectionSummary } from "@/lib/catalog";
import type { Dictionary, Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale";

export function CollectionGallery({
	title,
	collections,
	locale,
	id,
	priority = false,
	showTitle = true,
	messages,
}: {
	title: string;
	collections: CollectionSummary[];
	locale: Locale;
	id: string;
	priority?: boolean;
	showTitle?: boolean;
	messages: Dictionary;
}) {
	return (
		<section className="collection-gallery" aria-labelledby={showTitle && title ? `collection-gallery-${id}` : undefined}>
			<header className="collection-gallery-heading">
				<div>
					<p className="eyebrow">
						{String(collections.length).padStart(2, "0")} {messages.collections.collectionCount}
					</p>
					{showTitle && title ? <h2 id={`collection-gallery-${id}`}>{title}</h2> : null}
				</div>
			</header>
			<div className="collection-gallery-grid">
				{collections.map((collection, index) => (
					<Link
						className="collection-gallery-card"
						href={localizedPath(locale, `/collections/${collection.slug}`)}
						key={collection.id}
						aria-label={`${messages.collections.shopCollection}: ${collection.name}`}
					>
						{collection.imageUrl ? (
							<Image
								className="collection-gallery-image"
								src={collection.imageUrl}
								alt=""
								fill
								priority={priority && index < 3}
								sizes="(max-width: 600px) 50vw, 20vw"
							/>
						) : (
							<div className="collection-gallery-placeholder">
								<span>{messages.collections.imageUnavailable}</span>
							</div>
						)}
						<div className="collection-gallery-shade" />
						<div className="collection-gallery-copy">
							<p>{messages.kinds[collection.kind]}</p>
							<h3>{collection.name}</h3>
							<span>
								{messages.collections.shopCollection} <b aria-hidden="true">→</b>
							</span>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
