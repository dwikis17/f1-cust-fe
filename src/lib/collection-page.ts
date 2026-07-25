import type { CollectionKind } from "./catalog";

export function domainCollectionChildren<T>(collection: { kind: CollectionKind; children: T[] }): T[] | null {
	return collection.kind === "DOMAIN" ? collection.children : null;
}
