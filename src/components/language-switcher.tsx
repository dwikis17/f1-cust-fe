"use client";

import { usePathname, useRouter } from "next/navigation";

import { useDictionary, useLocale } from "@/components/i18n-provider";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const locale = useLocale();
  const messages = useDictionary();
  const router = useRouter();
  const pathname = usePathname();

  function select(next: Locale) {
    if (next === locale) return;
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(`${segments.join("/") || `/${next}`}${window.location.search}${window.location.hash}`);
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
