"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type FocusEvent, type FormEvent, type KeyboardEvent } from "react";

import { useDictionary, useLocale } from "@/components/i18n-provider";
import { formatPrice, type ProductListResponse, type PublicProductCard } from "@/lib/catalog";
import { localizedPath } from "@/lib/locale";

const searchDebounceMs = 300;
const minimumSearchLength = 2;

type ProductSearchFormProps = {
	action: string;
	className?: string;
	label: string;
	placeholder: string;
	submitLabel: string;
};

type SearchStatus = "idle" | "loading" | "ready" | "error";

function submitSearch(event: FormEvent<HTMLFormElement>, action: string) {
	const input = event.currentTarget.elements.namedItem("search");
	if (!(input instanceof HTMLInputElement)) return;
	const value = input.value.trim();
	if (!value) {
		event.preventDefault();
		window.location.assign(action);
		return;
	}
	input.value = value;
}

function resultHref(action: string, query: string) {
	const separator = action.includes("?") ? "&" : "?";
	return `${action}${separator}${new URLSearchParams({ search: query })}`;
}

function SearchForm({ action, className, label, placeholder, submitLabel, value }: ProductSearchFormProps & { value: string }) {
	const router = useRouter();
	const locale = useLocale();
	const messages = useDictionary();
	const [inputValue, setInputValue] = useState(value);
	const [response, setResponse] = useState<ProductListResponse | null>(null);
	const [status, setStatus] = useState<SearchStatus>("idle");
	const [activeIndex, setActiveIndex] = useState(-1);
	const [isOpen, setIsOpen] = useState(false);
	const hasTyped = useRef(false);
	const shellRef = useRef<HTMLDivElement>(null);
	const listId = useId();
	const query = inputValue.trim();
	const products = response?.data ?? [];

	useEffect(() => {
		if (!hasTyped.current || query.length < minimumSearchLength) return;
		const controller = new AbortController();
		const timeoutId = window.setTimeout(() => {
			void fetch(`/api/product-search?${new URLSearchParams({ search: query, locale })}`, {
				cache: "no-store",
				signal: controller.signal,
			})
				.then(async (result) => {
					if (!result.ok) throw new Error("Product search failed");
					const data = await result.json() as ProductListResponse;
					if (!Array.isArray(data.data)) throw new Error("Invalid product search response");
					return data;
				})
				.then((data) => {
					if (controller.signal.aborted) return;
					setResponse(data);
					setStatus("ready");
				})
				.catch((error) => {
					if (controller.signal.aborted || (error as Error).name === "AbortError") return;
					setResponse(null);
					setStatus("error");
				});
		}, searchDebounceMs);
		return () => {
			window.clearTimeout(timeoutId);
			controller.abort();
		};
	}, [locale, query]);

	useEffect(() => {
		if (!isOpen) return;
		function closeOutside(event: PointerEvent) {
			if (shellRef.current && !shellRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setActiveIndex(-1);
			}
		}
		document.addEventListener("pointerdown", closeOutside);
		return () => document.removeEventListener("pointerdown", closeOutside);
	}, [isOpen]);

	function resetSearch() {
		setResponse(null);
		setStatus("idle");
		setActiveIndex(-1);
		setIsOpen(false);
	}

	function handleChange(nextValue: string) {
		hasTyped.current = true;
		setInputValue(nextValue);
		if (nextValue.trim().length < minimumSearchLength) {
			resetSearch();
			return;
		}
		setResponse(null);
		setStatus("loading");
		setActiveIndex(-1);
		setIsOpen(true);
	}

	function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.key === "Escape") {
			event.preventDefault();
			setIsOpen(false);
			setActiveIndex(-1);
			return;
		}
		if (!isOpen || products.length === 0) return;
		if (event.key === "ArrowDown") {
			event.preventDefault();
			setActiveIndex((index) => (index + 1) % products.length);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			setActiveIndex((index) => (index - 1 + products.length) % products.length);
		} else if (event.key === "Enter" && activeIndex >= 0) {
			event.preventDefault();
			const product = products[activeIndex];
			if (product) {
				setIsOpen(false);
				setActiveIndex(-1);
				router.push(localizedPath(locale, `/products/${product.slug}`));
			}
		}
	}

	function handleBlur(event: FocusEvent<HTMLDivElement>) {
		if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
			window.requestAnimationFrame(() => {
				setIsOpen(false);
				setActiveIndex(-1);
			});
		}
	}

	return (
		<div className={`product-search-shell${className ? ` ${className}` : ""}`} ref={shellRef} onBlur={handleBlur}>
			<form className="product-search-form" action={action} method="get" onSubmit={(event) => { setIsOpen(false); submitSearch(event, action); }}>
				<label>
					<span className="sr-only">{label}</span>
					<input
						aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
						aria-autocomplete="list"
						aria-controls={isOpen ? listId : undefined}
						aria-expanded={isOpen}
						aria-haspopup="listbox"
						aria-label={label}
						autoComplete="off"
						maxLength={100}
						name="search"
						onChange={(event) => handleChange(event.currentTarget.value)}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						role="combobox"
						value={inputValue}
						type="search"
					/>
				</label>
				<button type="submit">{submitLabel}</button>
			</form>
			{isOpen ? (
				<div className="product-search-dropdown" id={listId} aria-busy={status === "loading"}>
					<p className="product-search-heading">{messages.filters.searchResultsFor} “{query}”</p>
					{status === "loading" ? <p className="product-search-status" role="status">{messages.header.searchLoading}</p> : null}
					{status === "error" ? <p className="product-search-status" role="alert">{messages.header.searchUnavailable}</p> : null}
					{status === "ready" && products.length === 0 ? <p className="product-search-status" role="status">{messages.filters.noProducts}</p> : null}
					{status === "ready" && products.length > 0 ? (
						<ul className="product-search-results" role="listbox" aria-label={messages.filters.searchResults}>
							{products.map((product, index) => <SearchResult key={product.id} product={product} locale={locale} active={index === activeIndex} id={`${listId}-option-${index}`} />)}
						</ul>
					) : null}
					{status === "ready" ? <Link className="product-search-view-all" href={resultHref(action, query)}>{messages.header.viewAllResults}</Link> : null}
				</div>
			) : null}
		</div>
	);
}

function SearchResult({ product, locale, active, id }: { product: PublicProductCard; locale: "en" | "id"; active: boolean; id: string }) {
	const photo = product.photos[0];
	const originalPrice = product.originalPriceIdr;
	return (
		<li className={`product-search-result${active ? " is-active" : ""}`} id={id} role="option" aria-selected={active}>
			<Link href={localizedPath(locale, `/products/${product.slug}`)}>
				<span className="product-search-result-image">
					{photo ? <Image src={photo.url} alt="" fill sizes="56px" loading="lazy" /> : <b aria-hidden="true">V</b>}
				</span>
				<span className="product-search-result-copy">
					<strong className="product-search-result-name">{product.name}</strong>
					<span className="product-search-result-price">
						<strong>{formatPrice(product.priceIdr, locale)}</strong>
						{originalPrice !== null ? <del>{formatPrice(originalPrice, locale)}</del> : null}
					</span>
				</span>
			</Link>
		</li>
	);
}

export function ProductSearchForm(props: ProductSearchFormProps) {
	const searchParams = useSearchParams();
	const search = searchParams.get("search")?.trim() ?? "";
	return <SearchForm key={search} {...props} value={search} />;
}

export function ProductSearchFormFallback(props: ProductSearchFormProps) {
	return <SearchForm {...props} value="" />;
}
