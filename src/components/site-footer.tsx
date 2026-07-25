import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale";

export function SiteFooter({ locale }: { locale: Locale }) {
	const messages = dictionary(locale);
	return (
		<footer className="site-footer">
			<div className="footer-brand">
				<Link className="brand" href={localizedPath(locale)}>VALYDE</Link>
				<p>{messages.footer.tagline}</p>
			</div>
			<div className="footer-column"><strong>{messages.footer.shop}</strong><Link href={localizedPath(locale, "/collections/formula-1")}>{messages.footer.teams}</Link><Link href={localizedPath(locale, "/collections/drivers")}>{messages.footer.drivers}</Link><Link href={`${localizedPath(locale, "/collections/formula-1")}?productType=helmets-replicas`}>{messages.footer.replicas}</Link><Link href={`${localizedPath(locale, "/collections/formula-1")}?productType=headwear`}>{messages.footer.headwear}</Link></div>
			<div className="footer-column"><strong>{messages.footer.support}</strong><Link href={localizedPath(locale, "/track-order")}>{messages.footer.trackOrder}</Link><Link href={localizedPath(locale, "/help/faq")}>{messages.footer.faq}</Link><Link href={localizedPath(locale, "/help/shipping-returns")}>{messages.footer.shippingReturns}</Link><Link href={localizedPath(locale, "/help/contact")}>{messages.footer.contact}</Link><Link href={localizedPath(locale, "/help/accessibility")}>{messages.footer.accessibility}</Link></div>
			<div className="footer-column"><strong>{messages.footer.legal}</strong><Link href={localizedPath(locale, "/help/privacy")}>{messages.footer.privacy}</Link><Link href={localizedPath(locale, "/help/terms")}>{messages.footer.terms}</Link></div>
			<p className="footer-copyright">{messages.footer.copyright}</p>
		</footer>
	);
}
