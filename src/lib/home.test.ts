import assert from "node:assert/strict";
import test from "node:test";
import {
	nextSlideIndex,
	resolveHomeHeroes,
	shouldAutoplay,
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
