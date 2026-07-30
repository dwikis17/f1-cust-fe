import assert from "node:assert/strict";
import test from "node:test";
import { resolveHomeHero, type ResolvedHomeHero } from "./home.ts";

const fallback: Omit<ResolvedHomeHero, "managed"> = {
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

test("home hero uses managed campaigns and preserves the complete static fallback", () => {
	assert.deepEqual(resolveHomeHero(null, fallback), { ...fallback, managed: false });
	assert.deepEqual(resolveHomeHero({
		eyebrow: "Campaign",
		title: "Race",
		outlinedTitle: "Week",
		body: "Campaign copy",
		ctaLabel: "Shop Ferrari",
		desktopImageUrl: "/uploads/desktop.webp",
		mobileImageUrl: "/uploads/mobile.webp",
		collection: { name: "Ferrari", slug: "ferrari" },
	}, fallback), {
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
	});
});
