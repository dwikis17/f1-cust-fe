"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { GbFlag, IdFlag } from "@/components/flags";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { CheckIcon, GlobeIcon } from "@/components/icons";
import { isLocale, type Locale } from "@/lib/i18n";

const LANGUAGES = [
	{ code: "en", name: "English", short: "EN", Flag: GbFlag },
	{ code: "id", name: "Bahasa Indonesia", short: "ID", Flag: IdFlag },
] as const;

export function LanguageSwitcher({ variant = "header" }: { variant?: "header" | "mobile" }) {
	const locale = useLocale();
	const messages = useDictionary();
	const router = useRouter();
	const pathname = usePathname();
	const [isHeaderOpen, setIsHeaderOpen] = useState(false);
	const pickerRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const selectRef = useRef<HTMLSelectElement>(null);

	useEffect(() => {
		if (variant !== "header" || !isHeaderOpen) return;

		function handlePointerDown(event: PointerEvent) {
			if (!pickerRef.current?.contains(event.target as Node)) setIsHeaderOpen(false);
		}

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === "Escape") {
				setIsHeaderOpen(false);
				triggerRef.current?.focus();
			}
		}

		function handleFocusIn(event: FocusEvent) {
			if (!pickerRef.current?.contains(event.target as Node)) setIsHeaderOpen(false);
		}

		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("focusin", handleFocusIn);
		selectRef.current?.focus();
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("focusin", handleFocusIn);
		};
	}, [isHeaderOpen, variant]);

	function select(next: Locale) {
		setIsHeaderOpen(false);
		triggerRef.current?.focus();
		if (next !== locale) {
			const segments = pathname.split("/");
			segments[1] = next;
			router.push(`${segments.join("/") || `/${next}`}${window.location.search}${window.location.hash}`);
		}
		if (variant === "mobile") {
			const details = document.querySelector<HTMLDetailsElement>("details.mobile-menu");
			if (details) details.open = false;
		}
	}

	if (variant === "mobile") {
		return (
			<div className="language-switcher-mobile" aria-label={messages.header.language}>
				<span className="language-switcher-title">{messages.header.language}</span>
				<div className="language-switcher-options">
					{LANGUAGES.map(({ code, name, short, Flag }) => {
						const isActive = locale === code;
						return (
							<button
								key={code}
								type="button"
								className={`language-option-card ${isActive ? "active" : ""}`}
								aria-pressed={isActive}
								onClick={() => select(code)}
							>
								<div className="language-option-left">
									<Flag width={22} height={15} className="flag-icon" />
									<div className="language-option-text">
										<span className="language-name">{name}</span>
										<span className="language-code">{short}</span>
									</div>
								</div>
								{isActive && <CheckIcon width={16} height={16} className="active-check" />}
							</button>
						);
					})}
				</div>
			</div>
		);
	}

	return (
		<div className="language-switcher-header" ref={pickerRef}>
			<button
				ref={triggerRef}
				type="button"
				className="language-header-trigger"
				aria-label={`${messages.header.language}: ${locale === "id" ? LANGUAGES[1].name : LANGUAGES[0].name}`}
				aria-expanded={isHeaderOpen}
				aria-controls="language-picker-panel"
				onClick={() => setIsHeaderOpen((open) => !open)}
			>
				<GlobeIcon className="language-header-globe" width={19} height={19} aria-hidden="true" />
				{locale === "id" ? <IdFlag width={18} height={12} className="language-header-flag" /> : <GbFlag width={18} height={12} className="language-header-flag" />}
			</button>
			<div id="language-picker-panel" className={`language-picker-panel${isHeaderOpen ? " is-open" : ""}`} aria-hidden={!isHeaderOpen}>
				<label className="language-picker-label" htmlFor="language-picker-select">{messages.header.language}</label>
				<select
					ref={selectRef}
					id="language-picker-select"
					value={locale}
					aria-label={messages.header.language}
					onChange={(event) => {
						if (isLocale(event.target.value)) select(event.target.value);
					}}
				>
					{LANGUAGES.map(({ code, name }) => <option key={code} value={code}>{name}</option>)}
				</select>
			</div>
		</div>
	);
}
