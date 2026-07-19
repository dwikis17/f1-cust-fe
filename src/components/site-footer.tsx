import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
	const messages = dictionary(locale);
	return (
		<footer className="site-footer">
			<div className="footer-brand">
				<Link className="brand" href="/">VALDYE</Link>
				<p>{messages.footer.tagline}</p>
			</div>
			<div className="footer-column"><strong>{messages.footer.shop}</strong><Link href="/collections/formula-1">{messages.footer.teams}</Link><Link href="/collections/drivers">{messages.footer.drivers}</Link><Link href="/collections/formula-1?productType=helmets-replicas">{messages.footer.replicas}</Link><Link href="/collections/formula-1?productType=headwear">{messages.footer.headwear}</Link></div>
			<div className="footer-column"><strong>{messages.footer.support}</strong><Link href="/track-order">{messages.footer.trackOrder}</Link><Link href="/help/faq">{messages.footer.faq}</Link><Link href="/help/shipping-returns">{messages.footer.shippingReturns}</Link><Link href="/help/contact">{messages.footer.contact}</Link><Link href="/help/accessibility">{messages.footer.accessibility}</Link></div>
			<div className="footer-column"><strong>{messages.footer.legal}</strong><Link href="/help/privacy">{messages.footer.privacy}</Link><Link href="/help/terms">{messages.footer.terms}</Link></div>
			<p className="footer-copyright">{messages.footer.copyright}</p>
		</footer>
	);
}
