"use client";

import { usePathname, useRouter } from "next/navigation";
import { GbFlag, IdFlag } from "@/components/flags";
import { useDictionary, useLocale } from "@/components/i18n-provider";
import { CheckIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";

const LANGUAGES = [
	{ code: "en", name: "English", short: "EN", Flag: GbFlag },
	{ code: "id", name: "Bahasa Indonesia", short: "ID", Flag: IdFlag },
] as const;

export function LanguageSwitcher({ variant = "header" }: { variant?: "header" | "mobile" }) {
	const locale = useLocale();
	const messages = useDictionary();
	const router = useRouter();
	const pathname = usePathname();

	function select(next: Locale) {
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
		<div className="language-switcher-header" aria-label={messages.header.language} aria-live="polite">
			{LANGUAGES.map(({ code, short, name, Flag }) => {
				const isActive = locale === code;
				return (
					<button
						key={code}
						type="button"
						className={`language-header-btn ${isActive ? "active" : ""}`}
						aria-pressed={isActive}
						title={name}
						onClick={() => select(code)}
					>
						<Flag width={18} height={12} className="flag-icon" />
						<span className="language-code-text">{short}</span>
					</button>
				);
			})}
		</div>
	);
}
