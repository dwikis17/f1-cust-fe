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

const sizeOrder = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "2XL", "XXXL", "3XL", "4XL"];

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

	return rows.sort((a, b) => {
		const aRank = sizeOrder.indexOf(a.size.trim().toUpperCase());
		const bRank = sizeOrder.indexOf(b.size.trim().toUpperCase());
		if (aRank === -1 && bRank === -1) return 0;
		if (aRank === -1) return 1;
		if (bRank === -1) return -1;
		return aRank - bRank;
	});
}
