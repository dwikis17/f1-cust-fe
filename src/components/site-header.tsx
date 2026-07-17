import Link from "next/link";
import { catalog } from "@/lib/catalog";
import { BagIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";

export async function SiteHeader() {
	const collections = await catalog.listCollections();
	return (
		<header className="site-header">
			<div className="header-left">
				<Link className="brand" href="/" aria-label="Valdye home">VALDYE</Link>
				<nav className="desktop-nav" aria-label="Primary navigation">
					{collections.map((root) => <div className="nav-group" key={root.id}><Link href={`/collections/${root.slug}`}>{root.name}</Link>{root.children.length ? <div className="nav-dropdown">{root.children.map((child) => <Link key={child.id} href={`/collections/${child.slug}`}>{child.name}</Link>)}</div> : null}</div>)}
					<Link href="/collections">Shop all</Link><Link href="/#editorial">Editorial</Link>
				</nav>
			</div>
			<div className="header-actions">
				<Link href="/collections" aria-label="Search"><SearchIcon /></Link>
				<Link href="/cart" aria-label="Shopping bag"><BagIcon /></Link>
				<button className="icon-button desktop-account" type="button" aria-label="Account"><UserIcon /></button>
				<details className="mobile-menu"><summary aria-label="Open menu"><MenuIcon /></summary><nav aria-label="Mobile navigation">{collections.map((root) => <div key={root.id}><Link href={`/collections/${root.slug}`}>{root.name}</Link>{root.children.map((child) => <Link key={child.id} href={`/collections/${child.slug}`}>{child.name}</Link>)}</div>)}<Link href="/collections">Shop all</Link></nav></details>
			</div>
		</header>
	);
}
