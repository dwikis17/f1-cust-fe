import assert from "node:assert/strict";
import test from "node:test";

import { domainCollectionChildren } from "./collection-page.ts";

test("domain collections use every ordered child while leaf collections keep their catalog", () => {
	const children = [{ slug: "mercedes" }, { slug: "ferrari" }];

	assert.strictEqual(domainCollectionChildren({ kind: "DOMAIN", children }), children);
	assert.equal(domainCollectionChildren({ kind: "TEAM", children }), null);
});
