import assert from "node:assert/strict";
import test from "node:test";

import { buildSizingRows } from "./sizing-guide.ts";

const guide = (length: number, chestWidth: number, waistWidth?: number) => ({
	unit: "cm" as const,
	measurements: { length, chestWidth, ...(waistWidth === undefined ? {} : { waistWidth }) },
});

test("sizing rows use only complete unique sizes in variant order", () => {
	const rows = buildSizingRows([
		{ size: "L", available: false, sizingGuide: guide(74, 56, 54) },
		{ size: "M", available: true, sizingGuide: guide(72, 52, 50) },
		{ size: "M", available: true, sizingGuide: guide(99, 99, 99) },
		{ size: "XL", available: true, sizingGuide: guide(76, 60) },
	]);

	assert.deepEqual(rows, [
		{ size: "L", unit: "cm", length: 74, chestWidth: 56, waistWidth: 54 },
		{ size: "M", unit: "cm", length: 72, chestWidth: 52, waistWidth: 50 },
	]);
});
