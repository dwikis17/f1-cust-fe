import Link from "next/link";

export function SiteFooter() {
	return (
		<footer className="site-footer">
			<div className="footer-brand">
				<Link className="brand" href="/">VALDYE</Link>
				<p>The definitive collection of motorsport engineering excellence. Official team gear and technical collectibles for the modern paddock.</p>
			</div>
			<div className="footer-column"><strong>Shop</strong><Link href="/collections/formula-1">Teams</Link><Link href="/collections/drivers">Drivers</Link><Link href="/collections/formula-1?productType=helmets-replicas">Replicas</Link><Link href="/collections/formula-1?productType=headwear">Headwear</Link></div>
			<div className="footer-column"><strong>Support</strong><a href="#">Shipping & returns</a><a href="#">Contact</a><a href="#">Accessibility</a></div>
			<div className="footer-column"><strong>Legal</strong><a href="#">Privacy policy</a><a href="#">Terms of service</a></div>
			<p className="footer-copyright">© 2026 Valdye Precision Engineering. All rights reserved.</p>
		</footer>
	);
}
