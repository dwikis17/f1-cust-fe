export type PublicHomeHero = {
	id: string;
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

export function resolveHomeHeroes(
	heroes: PublicHomeHero[],
	fallback: Omit<ResolvedHomeHero, "managed">,
): ResolvedHomeHero[] {
	if (!heroes.length) return [{ ...fallback, managed: false }];
	return heroes.map(({ collection, ...content }) => ({
		...content,
		managed: true,
		imageAlt: "",
		ctaPath: `/collections/${collection.slug}`,
	}));
}

export function nextSlideIndex(current: number, offset: -1 | 1, count: number): number {
	return count > 0 ? (current + offset + count) % count : 0;
}

export function shouldAutoplay(count: number, paused: boolean, reducedMotion: boolean, visible: boolean): boolean {
	return count > 1 && !paused && !reducedMotion && visible;
}
