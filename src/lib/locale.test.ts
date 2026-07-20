import assert from "node:assert/strict";
import test from "node:test";
import { localeAlternates, localizedPath, parseLocale } from "./locale.ts";

test("locale paths are deterministic and expose language alternates", () => {
	assert.equal(parseLocale("en"), "en");
	assert.equal(parseLocale("fr"), null);
	assert.equal(localizedPath("id"), "/id");
	assert.equal(localizedPath("en", "products/helmet"), "/en/products/helmet");
	assert.deepEqual(localeAlternates("/products/helmet").languages, {
		en: "/en/products/helmet",
		id: "/id/products/helmet",
		"x-default": "/en/products/helmet",
	});
});
