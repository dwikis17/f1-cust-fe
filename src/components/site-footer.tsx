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
			<div className="footer-column"><strong>{messages.footer.support}</strong><a href="#">{messages.footer.shippingReturns}</a><a href="#">{messages.footer.contact}</a><a href="#">{messages.footer.accessibility}</a></div>
			<div className="footer-column"><strong>{messages.footer.legal}</strong><a href="#">{messages.footer.privacy}</a><a href="#">{messages.footer.terms}</a></div>
			<p className="footer-copyright">{messages.footer.copyright}</p>
		</footer>
	);
}
