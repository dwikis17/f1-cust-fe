"use client";

import { createContext, useContext } from "react";

import { defaultLocale, type Dictionary, type Locale } from "@/lib/i18n";

const LocaleContext = createContext<Locale>(defaultLocale);
const DictionaryContext = createContext<Dictionary | null>(null);

export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Dictionary; children: React.ReactNode }) {
  return <LocaleContext value={locale}><DictionaryContext value={messages}>{children}</DictionaryContext></LocaleContext>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useDictionary() {
  const messages = useContext(DictionaryContext);
  if (!messages) throw new Error("useDictionary must be used within I18nProvider");
  return messages;
}
