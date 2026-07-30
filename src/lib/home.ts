export type PublicHomeHero = {
	eyebrow: string;
	title: string;
	outlinedTitle: string;
	body: string;
	ctaLabel: string;
	desktopImageUrl: string;
	mobileImageUrl: string;
	collection: { name: string; slug: string };
};

export type ResolvedHomeHero = Omit<PublicHomeHero, "collection"> & {
	managed: boolean;
	imageAlt: string;
	ctaPath: string;
};

export function resolveHomeHero(
	hero: PublicHomeHero | null,
	fallback: Omit<ResolvedHomeHero, "managed">,
): ResolvedHomeHero {
	if (!hero) return { ...fallback, managed: false };
	const { collection, ...content } = hero;
	return {
		...content,
		managed: true,
		imageAlt: "",
		ctaPath: `/collections/${collection.slug}`,
	};
}
