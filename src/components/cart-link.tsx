"use client";

import Link from "next/link";

import { useCartStore } from "@/lib/cart-store";
import { BagIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale";

export function CartLink({ label, locale }: { label: string; locale: Locale }) {
	const hydrated = useCartStore((state) => state.hydrated);
	const count = useCartStore((state) => state.items.reduce((total, item) => total + item.quantity, 0));
	return <Link className="cart-link" href={localizedPath(locale, "/cart")} aria-label={hydrated && count ? `${label}: ${count}` : label}><BagIcon />{hydrated && count ? <span aria-hidden="true">{count > 99 ? "99+" : count}</span> : null}</Link>;
}
