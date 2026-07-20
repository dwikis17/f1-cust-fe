import { isLocale, locales, type Locale } from "./i18n.ts";

export type LocaleParams = { params: Promise<{ locale: string }> };

export function parseLocale(value: string): Locale | null {
	return isLocale(value) ? value : null;
}

export function localizedPath(locale: Locale, path = "/"): string {
	const normalized = path.startsWith("/") ? path : `/${path}`;
	return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

export function localeAlternates(path = "/") {
	return {
		languages: {
			en: localizedPath("en", path),
			id: localizedPath("id", path),
			"x-default": localizedPath("en", path),
		},
	};
}

export function localeStaticParams() {
	return locales.map((locale) => ({ locale }));
}
