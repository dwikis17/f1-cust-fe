import { CartLink } from "@/components/cart-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NavLink } from "@/components/nav-link";
import { catalog } from "@/lib/catalog";
import { dictionary, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale";
import { MenuIcon } from "./icons";

export async function SiteHeader({ locale }: { locale: Locale }) {
	const collections = await catalog.listNavigationCollections(locale);
	const messages = dictionary(locale);
	return (
		<header className="site-header">
			<div className="header-left">
				<NavLink className="brand" href={localizedPath(locale)}>VALYDE</NavLink>
				<nav className="desktop-nav" aria-label={messages.header.primaryNavigation}>
					{collections.map((root) => <div className="nav-group" key={root.id}><NavLink href={localizedPath(locale, `/collections/${root.slug}`)}>{root.name}</NavLink>{root.children.length ? <div className="nav-dropdown">{root.children.slice(0, 5).map((child) => <NavLink key={child.id} href={localizedPath(locale, `/collections/${child.slug}`)}>{child.name}</NavLink>)}<NavLink className="nav-view-all" href={localizedPath(locale, `/collections/${root.slug}`)}>{messages.header.viewAll} {root.name}</NavLink></div> : null}</div>)}
					<NavLink href={localizedPath(locale, "/collections")}>{messages.header.shopAll}</NavLink><NavLink href={`${localizedPath(locale)}#editorial`}>{messages.header.editorial}</NavLink>
				</nav>
			</div>
			<div className="header-actions">
				<LanguageSwitcher />
				<CartLink label={messages.header.shoppingBag} locale={locale} />
				<details className="mobile-menu"><summary aria-label={messages.header.openMenu}><MenuIcon /></summary><nav aria-label={messages.header.mobileNavigation}>{collections.map((root) => <div key={root.id}><NavLink href={localizedPath(locale, `/collections/${root.slug}`)}>{root.name}</NavLink>{root.children.slice(0, 4).map((child) => <NavLink key={child.id} href={localizedPath(locale, `/collections/${child.slug}`)}>{child.name}</NavLink>)}<NavLink className="nav-view-all" href={localizedPath(locale, `/collections/${root.slug}`)}>{messages.header.viewAll} {root.name}</NavLink></div>)}<NavLink href={localizedPath(locale, "/collections")}>{messages.header.shopAll}</NavLink></nav></details>
			</div>
		</header>
	);
}
