import Link from "next/link";
import { ArrowRightIcon, GridIcon, RouteIcon, ShieldIcon } from "@/components/icons";
import { dictionary, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale";

export function NotFoundView({ locale }: { locale: Locale }) {
	const messages = dictionary(locale).notFoundPage;
	const homePath = localizedPath(locale);
	const collectionsPath = localizedPath(locale, "/collections");
	const destinations = [
		{ href: collectionsPath, title: messages.collectionsTitle, text: messages.collectionsText, Icon: GridIcon },
		{ href: localizedPath(locale, "/track-order"), title: messages.trackTitle, text: messages.trackText, Icon: RouteIcon },
		{ href: localizedPath(locale, "/help/faq"), title: messages.faqTitle, text: messages.faqText, Icon: ShieldIcon },
	];

	return (
		<main className="page-shell not-found-page">
			<section className="not-found-hero">
				<div className="not-found-grid-bg" aria-hidden="true" />
				<div className="not-found-container">
					<div className="not-found-badge">
						<span className="badge-pulse" aria-hidden="true" />
						<span className="badge-text">{messages.badge}</span>
					</div>
					<div className="not-found-display">
						<p className="not-found-code" aria-hidden="true">404</p>
						<div className="not-found-heading-group">
							<h1>{messages.heading}</h1>
							<p className="not-found-desc">{messages.description}</p>
						</div>
					</div>
					<div className="not-found-actions">
						<Link className="button button-light" href={collectionsPath}>{messages.shopAll}</Link>
						<Link className="button button-outline-dark" href={homePath}>{messages.returnHome}</Link>
					</div>
					<div className="not-found-telemetry" aria-hidden="true">
						<div className="telemetry-item">
							<span className="telemetry-label">{messages.statusLabel}</span>
							<span className="telemetry-value apex-text">{messages.statusValue}</span>
						</div>
						<div className="telemetry-divider" />
						<div className="telemetry-item">
							<span className="telemetry-label">{messages.codeLabel}</span>
							<span className="telemetry-value">404</span>
						</div>
					</div>
				</div>
			</section>
			<section className="not-found-destinations">
				<div className="not-found-destinations-container">
					<div className="destinations-header">
						<p className="eyebrow">{messages.destinationsEyebrow}</p>
						<h2>{messages.destinationsTitle}</h2>
					</div>
					<div className="destinations-grid">
						{destinations.map(({ href, title, text, Icon }) => (
							<Link className="destination-card" href={href} key={href}>
								<span className="destination-icon" aria-hidden="true"><Icon width={20} height={20} /></span>
								<span className="destination-content">
									<h3>{title}</h3>
									<p>{text}</p>
								</span>
								<span className="destination-arrow" aria-hidden="true"><ArrowRightIcon width={18} height={18} /></span>
							</Link>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
