import assert from "node:assert/strict";
import test from "node:test";
import {
	nextSlideIndex,
	resolveHomeHeroes,
	shouldAutoplay,
	splitHomeCollectionBlocks,
	type ResolvedHomeHero,
} from "./home.ts";

const fallback: Omit<ResolvedHomeHero, "managed"> = {
	id: "fallback",
	eyebrow: "Fallback",
	title: "Static",
	outlinedTitle: "Hero",
	body: "Fallback copy",
	ctaLabel: "Shop now",
	desktopImageUrl: "/desktop.webp",
	mobileImageUrl: "/mobile.webp",
	imageAlt: "Race cars",
	ctaPath: "/collections",
};

const block = (slug: string) => ({
	id: slug,
	leadImageUrl: `/${slug}-lead.webp`,
	sideImageOneUrl: `/${slug}-side-one.webp`,
	sideImageTwoUrl: `/${slug}-side-two.webp`,
	collection: { name: slug, slug, description: "" },
	products: [],
});

test("home campaigns use ordered managed content and preserve the complete static fallback", () => {
	assert.deepEqual(resolveHomeHeroes([], fallback), [{ ...fallback, managed: false }]);
	assert.deepEqual(resolveHomeHeroes([{
		id: "campaign-1",
		eyebrow: "Campaign",
		title: "Race",
		outlinedTitle: "Week",
		body: "Campaign copy",
		ctaLabel: "Shop Ferrari",
		desktopImageUrl: "/uploads/desktop.webp",
		mobileImageUrl: "/uploads/mobile.webp",
		collection: { name: "Ferrari", slug: "ferrari" },
	}], fallback), [{
		id: "campaign-1",
		managed: true,
		eyebrow: "Campaign",
		title: "Race",
		outlinedTitle: "Week",
		body: "Campaign copy",
		ctaLabel: "Shop Ferrari",
		desktopImageUrl: "/uploads/desktop.webp",
		mobileImageUrl: "/uploads/mobile.webp",
		imageAlt: "",
		ctaPath: "/collections/ferrari",
	}]);
});

test("carousel navigation wraps and autoplay respects interaction and motion preferences", () => {
	assert.equal(nextSlideIndex(0, -1, 3), 2);
	assert.equal(nextSlideIndex(2, 1, 3), 0);
	assert.equal(nextSlideIndex(0, 1, 0), 0);
	assert.equal(shouldAutoplay(2, false, false, true), true);
	assert.equal(shouldAutoplay(1, false, false, true), false);
	assert.equal(shouldAutoplay(2, true, false, true), false);
	assert.equal(shouldAutoplay(2, false, true, true), false);
	assert.equal(shouldAutoplay(2, false, false, false), false);
});

test("home collection blocks reserve New Arrival without changing other block order", () => {
	const blocks = [block("ferrari"), block("new-arrival"), block("mclaren")];
	const split = splitHomeCollectionBlocks(blocks);

	assert.equal(split.newArrival?.collection.slug, "new-arrival");
	assert.deepEqual(split.remaining.map(({ collection }) => collection.slug), ["ferrari", "mclaren"]);

	const unchanged = splitHomeCollectionBlocks([block("ferrari"), block("mclaren")]);
	assert.equal(unchanged.newArrival, null);
	assert.deepEqual(unchanged.remaining.map(({ collection }) => collection.slug), ["ferrari", "mclaren"]);
});
