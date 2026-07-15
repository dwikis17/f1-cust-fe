import Link from "next/link";
import { BagIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";

const nav = [
	["Teams", "/collections?tag=mclaren"],
	["Drivers", "/collections"],
	["Shop", "/collections"],
	["Collections", "/collections"],
	["Editorial", "/#editorial"],
];

export function SiteHeader() {
	return (
		<header className="site-header">
			<div className="header-left">
				<Link className="brand" href="/" aria-label="Vantage97 home">VANTAGE97</Link>
				<nav className="desktop-nav" aria-label="Primary navigation">
					{nav.map(([label, href]) => <Link key={label} href={href}>{label}</Link>)}
				</nav>
			</div>
			<div className="header-actions">
				<Link href="/collections" aria-label="Search"><SearchIcon /></Link>
				<Link href="/cart" aria-label="Shopping bag"><BagIcon /></Link>
				<button className="icon-button desktop-account" type="button" aria-label="Account"><UserIcon /></button>
				<button className="icon-button mobile-menu" type="button" aria-label="Open menu"><MenuIcon /></button>
			</div>
		</header>
	);
}
