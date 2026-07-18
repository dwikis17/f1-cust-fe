"use client";

import { createContext, useContext } from "react";

import { dictionary, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>("en");

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext value={locale}>{children}</LocaleContext>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useDictionary() {
  return dictionary(useLocale());
}
