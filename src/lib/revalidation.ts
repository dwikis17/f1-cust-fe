const exactTags = new Set(["catalog:products", "catalog:collections", "catalog:teams", "content:home", "content:support", "shipping:free-shipping-policy"]);
const scopedTag = /^(?:catalog:(?:product|collection):[a-z0-9]+(?:-[a-z0-9]+)*|content:(?:faqs|shipping-returns):(?:en|id))$/;
export const immediateRevalidation = { expire: 0 } as const;

export function parseRevalidationTags(value: unknown): string[] | null {
	if (!Array.isArray(value) || value.length === 0 || value.length > 100) return null;
	const tags = [...new Set(value)];
	if (tags.length > 100 || tags.some((tag) => typeof tag !== "string" || tag.length > 256 || (!exactTags.has(tag) && !scopedTag.test(tag)))) {
		return null;
	}
	return tags as string[];
}
