"use client";

import { useState } from "react";

import { CollectionGallery } from "@/components/collection-gallery";
import { useDictionary } from "@/components/i18n-provider";
import type { CollectionNode } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";

export function CollectionGalleryTabs({ parents, locale }: { parents: CollectionNode[]; locale: Locale }) {
	const [activeId, setActiveId] = useState(parents[0]?.id);
	const messages = useDictionary();
	const activeParent = parents.find((parent) => parent.id === activeId) ?? parents[0];
	if (!activeParent) return null;
	const childKind = activeParent.children[0]?.kind;
	const title = childKind === "TEAM"
		? messages.collections.teams
		: childKind === "DRIVER"
			? messages.collections.drivers
			: activeParent.name;

	return (
		<div className="collection-gallery-tabs">
			<nav className="collection-gallery-tablist" aria-label={messages.collections.title}>
				{parents.map((parent) => (
					<button
						type="button"
						aria-pressed={parent.id === activeParent.id}
						key={parent.id}
						onClick={() => setActiveId(parent.id)}
					>
						{parent.children[0]?.kind === "TEAM"
							? parent.name
							: parent.children[0]?.kind === "DRIVER"
								? messages.collections.drivers
								: parent.name}
						<span>{String(parent.children.length).padStart(2, "0")}</span>
					</button>
				))}
			</nav>
			<CollectionGallery
				id={activeParent.slug}
				title={title}
				collections={activeParent.children}
				locale={locale}
				priority
				messages={messages}
			/>
		</div>
	);
}
