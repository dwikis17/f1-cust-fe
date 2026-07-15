import Link from "next/link";

export function SiteFooter() {
	return (
		<footer className="site-footer">
			<div className="footer-brand">
				<Link className="brand" href="/">VANTAGE97</Link>
				<p>The definitive collection of motorsport engineering excellence. Official team gear and technical collectibles for the modern paddock.</p>
			</div>
			<div className="footer-column"><strong>Shop</strong><Link href="/collections">Teams</Link><Link href="/collections">Drivers</Link><Link href="/collections">Replicas</Link><Link href="/collections">Helmets</Link></div>
			<div className="footer-column"><strong>Support</strong><a href="#">Shipping & returns</a><a href="#">Contact</a><a href="#">Accessibility</a></div>
			<div className="footer-column"><strong>Legal</strong><a href="#">Privacy policy</a><a href="#">Terms of service</a></div>
			<p className="footer-copyright">© 2026 Vantage97 Precision Engineering. All rights reserved.</p>
		</footer>
	);
}
