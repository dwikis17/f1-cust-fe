import { Suspense } from "react";

import { CartLink } from "@/components/cart-link";
import { ChevronDownIcon } from "@/components/icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { MobileMenu } from "@/components/mobile-menu";
import { NavLink } from "@/components/nav-link";
import { ProductSearchForm, ProductSearchFormFallback } from "@/components/product-search-form";
import { RaceCountdownTicker } from "@/components/race-countdown-ticker";
import { catalog } from "@/lib/catalog";
import { dictionary, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale";

export async function SiteHeader({ locale }: { locale: Locale }) {
	const collections = await catalog.listNavigationCollections(locale);
	const messages = dictionary(locale);
	const searchPath = localizedPath(locale, "/collections");
	const searchFormProps = {
		action: searchPath,
		label: messages.header.search,
		placeholder: messages.header.searchPlaceholder,
		submitLabel: messages.header.searchSubmit,
	};
	return (
		<div className="header-wrapper">
			<RaceCountdownTicker locale={locale} />
			<header className="site-header">
				<div className="header-left">
					<NavLink className="brand" href={localizedPath(locale)}>VALYDE</NavLink>
					<nav className="desktop-nav" aria-label={messages.header.primaryNavigation}>
						{collections.map((root) => {
							const isDriverMenu = root.children.some((child) => child.kind === "DRIVER");
							return <div className={`nav-group${isDriverMenu ? " nav-group-drivers" : ""}`} key={root.id}><NavLink href={localizedPath(locale, `/collections/${root.slug}`)}>{root.name}</NavLink>{root.children.length ? <div className="nav-dropdown"><div className="nav-dropdown-links">{root.children.map((child) => <NavLink key={child.id} href={localizedPath(locale, `/collections/${child.slug}`)}>{child.name}</NavLink>)}</div><NavLink className="nav-view-all" href={localizedPath(locale, `/collections/${root.slug}`)}>{messages.header.viewAll} {root.name}</NavLink></div> : null}</div>;
						})}
						<NavLink href={localizedPath(locale, "/sale")}>{messages.header.sale}</NavLink>
						<NavLink href={localizedPath(locale, "/f1-schedule")}>{messages.header.editorial}</NavLink>
						<NavLink href={localizedPath(locale, "/collections")}>{messages.header.shopAll}</NavLink>
					</nav>
				</div>
				<div className="header-actions">
					<Suspense fallback={<ProductSearchFormFallback {...searchFormProps} className="product-search-desktop" />}><ProductSearchForm {...searchFormProps} className="product-search-desktop" /></Suspense>
					<LanguageSwitcher variant="header" />
					<CartLink label={messages.header.shoppingBag} locale={locale} />
					<MobileMenu openMenuLabel={messages.header.openMenu}>
						<Suspense fallback={<ProductSearchFormFallback {...searchFormProps} className="product-search-mobile" />}><ProductSearchForm {...searchFormProps} className="product-search-mobile" /></Suspense>
						{collections.map((root) => root.children.length ? (
							<details className="mobile-nav-group" key={root.id}>
								<summary>{root.name}<ChevronDownIcon aria-hidden="true" width={16} height={16} /></summary>
								<div className="mobile-nav-children">
									{root.children.map((child) => <NavLink key={child.id} href={localizedPath(locale, `/collections/${child.slug}`)}>{child.name}</NavLink>)}
									<NavLink className="nav-view-all" href={localizedPath(locale, `/collections/${root.slug}`)}>{messages.header.viewAll} {root.name}</NavLink>
								</div>
							</details>
						) : (
							<NavLink key={root.id} href={localizedPath(locale, `/collections/${root.slug}`)}>{root.name}</NavLink>
						))}
						<NavLink href={localizedPath(locale, "/sale")}>{messages.header.sale}</NavLink>
						<NavLink href={localizedPath(locale, "/f1-schedule")}>{messages.header.editorial}</NavLink>
						<NavLink href={localizedPath(locale, "/collections")}>{messages.header.shopAll}</NavLink>
						<LanguageSwitcher variant="mobile" />
					</MobileMenu>
				</div>
			</header>
		</div>
	);
}
