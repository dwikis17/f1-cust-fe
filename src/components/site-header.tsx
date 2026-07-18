import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { catalog } from "@/lib/catalog";
import { dictionary, type Locale } from "@/lib/i18n";
import { BagIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";

export async function SiteHeader({ locale }: { locale: Locale }) {
	const collections = await catalog.listCollections();
	const messages = dictionary(locale);
	return (
		<header className="site-header">
			<div className="header-left">
				<Link className="brand" href="/" aria-label={messages.header.home}>VALDYE</Link>
				<nav className="desktop-nav" aria-label={messages.header.primaryNavigation}>
					{collections.map((root) => <div className="nav-group" key={root.id}><Link href={`/collections/${root.slug}`}>{root.name}</Link>{root.children.length ? <div className="nav-dropdown">{root.children.map((child) => <Link key={child.id} href={`/collections/${child.slug}`}>{child.name}</Link>)}</div> : null}</div>)}
					<Link href="/collections">{messages.header.shopAll}</Link><Link href="/#editorial">{messages.header.editorial}</Link>
				</nav>
			</div>
			<div className="header-actions">
				<LanguageSwitcher />
				<Link className="header-search" href="/collections" aria-label={messages.header.search}><SearchIcon /></Link>
				<Link href="/cart" aria-label={messages.header.shoppingBag}><BagIcon /></Link>
				<button className="icon-button desktop-account" type="button" aria-label={messages.header.account}><UserIcon /></button>
				<details className="mobile-menu"><summary aria-label={messages.header.openMenu}><MenuIcon /></summary><nav aria-label={messages.header.mobileNavigation}>{collections.map((root) => <div key={root.id}><Link href={`/collections/${root.slug}`}>{root.name}</Link>{root.children.map((child) => <Link key={child.id} href={`/collections/${child.slug}`}>{child.name}</Link>)}</div>)}<Link href="/collections">{messages.header.shopAll}</Link></nav></details>
			</div>
		</header>
	);
}
