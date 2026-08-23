"use client";

import { NotFoundView } from "@/components/not-found-view";
import { useLocale } from "@/components/i18n-provider";

export function NotFoundBridge() {
	return <NotFoundView locale={useLocale()} />;
}
