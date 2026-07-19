"use client";

import { useRouter } from "next/navigation";

import { useDictionary, useLocale } from "@/components/i18n-provider";
import { LOCALE_COOKIE, type Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const locale = useLocale();
  const messages = useDictionary();
  const router = useRouter();

  function select(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="language-switcher" aria-label={messages.header.language} aria-live="polite">
      {(["en", "id"] as const).map((value) => (
        <button key={value} type="button" aria-pressed={locale === value} onClick={() => select(value)}>
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
