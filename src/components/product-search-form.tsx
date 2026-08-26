"use client";

import { useSearchParams } from "next/navigation";
import type { FormEvent } from "react";

type ProductSearchFormProps = {
	action: string;
	className?: string;
	label: string;
	placeholder: string;
	submitLabel: string;
};

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

function SearchForm({ action, className, label, placeholder, submitLabel, value }: ProductSearchFormProps & { value: string }) {
	return (
		<form className={`product-search-form${className ? ` ${className}` : ""}`} action={action} method="get" onSubmit={(event) => submitSearch(event, action)}>
			<label>
				<span className="sr-only">{label}</span>
				<input aria-label={label} autoComplete="off" defaultValue={value} maxLength={100} name="search" placeholder={placeholder} type="search" />
			</label>
			<button type="submit">{submitLabel}</button>
		</form>
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
