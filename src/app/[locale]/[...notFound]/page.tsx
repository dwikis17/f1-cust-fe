import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotFoundView } from "@/components/not-found-view";
import { dictionary } from "@/lib/i18n";
import { parseLocale } from "@/lib/locale";
import { noIndexMetadata } from "@/lib/seo";

type CatchAllProps = {
	params: Promise<{ locale: string; notFound: string[] }>;
};

export async function generateMetadata({ params }: CatchAllProps): Promise<Metadata> {
	const locale = parseLocale((await params).locale);
	if (!locale) return noIndexMetadata("Page not found");
	return noIndexMetadata(dictionary(locale).notFoundPage.metadataTitle);
}

export default async function CatchAllNotFound({ params }: CatchAllProps) {
	const locale = parseLocale((await params).locale);
	if (!locale) notFound();
	return <NotFoundView locale={locale} />;
}
