"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { useCartCatalog } from "@/components/use-cart-catalog";
import { cartSubtotal, resolveCartLines } from "@/lib/cart";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/catalog";
import { localizedPath } from "@/lib/locale";

export function CartClient() {
	const locale = useLocale();
	const messages = useDictionary();
	const items = useCartStore((state) => state.items);
	const ready = useCartStore((state) => state.hydrated);
	const setQuantity = useCartStore((state) => state.setQuantity);
	const removeItem = useCartStore((state) => state.removeItem);
	const addItem = useCartStore((state) => state.addItem);
	const { products, error, loading, retry } = useCartCatalog();
	const [removed, setRemoved] = useState<{ productId: string; productName: string; variantId: string; quantity: number } | null>(null);

	const lines = useMemo(() => resolveCartLines(items, products), [items, products]);
	const subtotal = cartSubtotal(lines);
	const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
	const hasUnavailableItem = lines.some((line) => !line.variant.available);
	useEffect(() => {
		if (!removed) return;
		const timer = window.setTimeout(() => setRemoved(null), 6000);
		return () => window.clearTimeout(timer);
	}, [removed]);

	function removeLine(line: (typeof lines)[number]) {
		setRemoved({ productId: line.productId, productName: line.productName, variantId: line.variantId, quantity: line.quantity });
		removeItem(line.variantId);
	}

	function undoRemove() {
		if (!removed) return;
		addItem(removed);
		setRemoved(null);
	}

	const undoNotice = removed ? <div className="cart-toast" role="status"><span>{messages.cart.removedItem}</span><button type="button" onClick={undoRemove}>{messages.cart.undo}</button></div> : null;

	if (!ready || loading) return <div className="cart-loading" role="status" aria-live="polite"><p className="eyebrow">{messages.cart.loadingGarage}</p><div className="cart-loading-line" /><div className="cart-loading-line" /></div>;
	if (error) return <div className="cart-empty"><h1>{messages.cart.loadFailed}</h1><button className="button button-dark" type="button" onClick={retry}>{messages.cart.retry}</button></div>;
	if (!lines.length) return <><div className="cart-empty"><p className="eyebrow">{messages.cart.yourBag} / 00</p><h1>{messages.cart.emptyTitle}</h1><p>{messages.cart.emptyText}</p><Link className="button button-dark" href={localizedPath(locale, "/collections")}>{messages.cart.exploreCollection}</Link></div>{undoNotice}</>;

	return (
		<div className="cart-layout">
			<section className="cart-lines">
				<header className="cart-title">
					<div><p className="eyebrow">{messages.cart.yourBag} / {itemCount.toString().padStart(2, "0")}</p><h1>{messages.cart.selectedEquipment}</h1></div>
					<Link href={localizedPath(locale, "/collections")}>{messages.cart.continueShopping}</Link>
				</header>
				{lines.map((line) => (
					<article className="cart-line" key={line.variantId}>
						<Link className="cart-line-image" href={localizedPath(locale, `/products/${line.product.slug}`)}>{line.product.photo ? <Image src={line.product.photo.url} alt={line.product.photo.altText} fill sizes="(max-width: 600px) 96px, 150px" /> : <span className="cart-image-placeholder">VALDYE</span>}</Link>
						<div className="cart-line-copy">
							<p>{line.product.merchandisingLabel}</p>
							<h2><Link href={localizedPath(locale, `/products/${line.product.slug}`)}>{line.product.name}</Link></h2>
							<span>{[line.variant.color, line.variant.size].filter(Boolean).join(" / ") || line.variant.sku}</span>
							{!line.variant.available ? <strong className="cart-unavailable">{messages.cart.unavailableItem}</strong> : null}
							<button type="button" onClick={() => removeLine(line)}>{messages.cart.remove}</button>
						</div>
						<div className="cart-line-end">
							<strong>{formatPrice(line.product.priceIdr * line.quantity, locale)}</strong>
							<div className="quantity" aria-label={`${line.product.name} ${messages.product.quantitySelector}`}>
								<button type="button" aria-label={`${messages.product.quantitySelector}: ${line.product.name}, −`} disabled={line.quantity <= 1} onClick={() => setQuantity(line.variantId, line.quantity - 1)}>−</button>
								<span aria-live="polite">{line.quantity}</span>
								<button type="button" aria-label={`${messages.product.quantitySelector}: ${line.product.name}, +`} disabled={line.quantity >= 9} onClick={() => setQuantity(line.variantId, line.quantity + 1)}>+</button>
							</div>
						</div>
					</article>
				))}
			</section>
			<aside className="cart-summary" aria-labelledby="cart-summary-title">
				<h2 id="cart-summary-title">{messages.cart.raceSummary}</h2>
				<div><span>{messages.cart.subtotal}</span><strong>{formatPrice(subtotal, locale)}</strong></div>
				<div><span>{messages.cart.shipping}</span><strong>{messages.cart.calculatedAtCheckout}</strong></div>
				<div className="cart-total"><span>{messages.cart.total}</span><strong>{formatPrice(subtotal, locale)}</strong></div>
				<p>{hasUnavailableItem ? messages.cart.unavailableItem : messages.cart.checkoutShippingNote}</p>
				{hasUnavailableItem
					? <span className="button button-dark disabled" aria-disabled="true">{messages.cart.checkout}</span>
					: <Link className="button button-dark" href={localizedPath(locale, "/checkout")}>{messages.cart.checkout}</Link>}
				<Link href={localizedPath(locale, "/collections")}>{messages.cart.continueShopping}</Link>
			</aside>
			{undoNotice}
		</div>
	);
}
