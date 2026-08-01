import { CartLink } from "@/components/cart-link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileMenu } from "@/components/mobile-menu";
import { NavLink } from "@/components/nav-link";
import { RaceCountdownTicker } from "@/components/race-countdown-ticker";
import { catalog } from "@/lib/catalog";
import { dictionary, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale";

export async function SiteHeader({ locale }: { locale: Locale }) {
	const collections = await catalog.listNavigationCollections(locale);
	const messages = dictionary(locale);
	return (
		<div className="header-wrapper">
			<RaceCountdownTicker locale={locale} />
			<header className="site-header">
				<div className="header-left">
					<NavLink className="brand" href={localizedPath(locale)}>VALYDE</NavLink>
					<nav className="desktop-nav" aria-label={messages.header.primaryNavigation}>
						{collections.map((root) => <div className="nav-group" key={root.id}><NavLink href={localizedPath(locale, `/collections/${root.slug}`)}>{root.name}</NavLink>{root.children.length ? <div className="nav-dropdown">{root.children.slice(0, 5).map((child) => <NavLink key={child.id} href={localizedPath(locale, `/collections/${child.slug}`)}>{child.name}</NavLink>)}<NavLink className="nav-view-all" href={localizedPath(locale, `/collections/${root.slug}`)}>{messages.header.viewAll} {root.name}</NavLink></div> : null}</div>)}
						<NavLink href={localizedPath(locale, "/f1-schedule")}>{messages.header.editorial}</NavLink>
						<NavLink href={localizedPath(locale, "/collections")}>{messages.header.shopAll}</NavLink>
					</nav>
				</div>
				<div className="header-actions">
					<LanguageSwitcher variant="header" />
					<CartLink label={messages.header.shoppingBag} locale={locale} />
					<MobileMenu openMenuLabel={messages.header.openMenu}>
						{collections.map((root) => <div key={root.id}><NavLink href={localizedPath(locale, `/collections/${root.slug}`)}>{root.name}</NavLink>{root.children.slice(0, 4).map((child) => <NavLink key={child.id} href={localizedPath(locale, `/collections/${child.slug}`)}>{child.name}</NavLink>)}<NavLink className="nav-view-all" href={localizedPath(locale, `/collections/${root.slug}`)}>{messages.header.viewAll} {root.name}</NavLink></div>)}
						<NavLink href={localizedPath(locale, "/f1-schedule")}>{messages.header.editorial}</NavLink>
						<NavLink href={localizedPath(locale, "/collections")}>{messages.header.shopAll}</NavLink>
						<LanguageSwitcher variant="mobile" />
					</MobileMenu>
				</div>
			</header>
		</div>
	);
}
