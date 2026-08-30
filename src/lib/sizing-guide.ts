type GuideVariant = {
	size: string | null;
	available?: boolean;
	sizingGuide: {
		unit: "cm" | "in";
		measurements: Partial<Record<"length" | "chestWidth" | "waistWidth" | "chest" | "waist", number>>;
	} | null;
};

export type SizingRow = {
	size: string;
	unit: "cm" | "in";
	length: number;
	chestWidth: number;
	waistWidth: number;
};

export function buildSizingRows(variants: GuideVariant[]): SizingRow[] {
	const seen = new Set<string>();
	const rows: SizingRow[] = [];

	for (const variant of variants) {
		if (!variant.size || !variant.sizingGuide || seen.has(variant.size)) continue;
		const { measurements, unit } = variant.sizingGuide;
		const length = measurements.length;
		const chestWidth = measurements.chestWidth ?? measurements.chest;
		const waistWidth = measurements.waistWidth ?? measurements.waist;
		if (![length, chestWidth, waistWidth].every((value) => typeof value === "number" && Number.isFinite(value) && value > 0)) continue;
		seen.add(variant.size);
		rows.push({ size: variant.size, unit, length: Number(length), chestWidth: Number(chestWidth), waistWidth: Number(waistWidth) });
	}
	return rows;
}
