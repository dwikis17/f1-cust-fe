"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ResponsiveBanner } from "@/components/responsive-banner";
import { nextSlideIndex, shouldAutoplay, type ResolvedHomeHero } from "@/lib/home";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale";

const AUTOPLAY_MS = 6_000;

export function HomeCarousel({
	slides,
	locale,
	labels,
}: {
	slides: ResolvedHomeHero[];
	locale: Locale;
	labels: { carousel: string; previous: string; next: string; show: string; editorial: string };
}) {
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const [reducedMotion, setReducedMotion] = useState(false);
	const [visible, setVisible] = useState(true);
	const [navigation, setNavigation] = useState(0);

	useEffect(() => {
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setReducedMotion(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);

	useEffect(() => {
		const update = () => setVisible(document.visibilityState === "visible");
		update();
		document.addEventListener("visibilitychange", update);
		return () => document.removeEventListener("visibilitychange", update);
	}, []);

	useEffect(() => {
		if (!shouldAutoplay(slides.length, paused, reducedMotion, visible)) return;
		const timer = window.setTimeout(() => setIndex((current) => nextSlideIndex(current, 1, slides.length)), AUTOPLAY_MS);
		return () => window.clearTimeout(timer);
	}, [index, navigation, paused, reducedMotion, slides.length, visible]);

	function goTo(next: number) {
		setIndex(next);
		setNavigation((current) => current + 1);
	}

	const multiple = slides.length > 1;
	return (
		<section
			className="home-carousel"
			aria-label={labels.carousel}
			aria-roledescription="carousel"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			onFocusCapture={() => setPaused(true)}
			onBlurCapture={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
			}}
		>
			<div className="home-carousel-slides" aria-live={paused ? "polite" : "off"}>
				{slides.map((slide, slideIndex) => {
					const active = slideIndex === index;
					return (
						<article
							className={`home-hero home-carousel-slide${active ? " is-active" : ""}`}
							aria-label={`${slideIndex + 1} / ${slides.length}`}
							aria-roledescription="slide"
							aria-hidden={!active}
							inert={!active}
							key={slide.id}
						>
							<ResponsiveBanner
								alt={slide.imageAlt}
								desktopSrc={slide.desktopImageUrl}
								mobileSrc={slide.mobileImageUrl}
								priority={slideIndex === 0}
							/>
							<div className="hero-shade" />
							<div className="hero-copy">
								<p className="eyebrow light">{slide.eyebrow}</p>
								<h1>{slide.title}<br /><span>{slide.outlinedTitle}</span></h1>
								<p>{slide.body}</p>
								<div className="hero-actions">
									<Link className="button button-light" href={localizedPath(locale, slide.ctaPath)}>{slide.ctaLabel}</Link>
									{slide.managed ? null : <a className="button button-outline-light" href="#editorial">{labels.editorial}</a>}
								</div>
							</div>
						</article>
					);
				})}
			</div>
			{multiple ? (
				<div className="home-carousel-controls">
					<button type="button" aria-label={labels.previous} onClick={() => goTo(nextSlideIndex(index, -1, slides.length))}>
						<span aria-hidden="true">←</span>
					</button>
					<div className="home-carousel-indicators">
						{slides.map((slide, slideIndex) => (
							<button
								type="button"
								aria-label={`${labels.show} ${slideIndex + 1}`}
								aria-current={slideIndex === index}
								key={slide.id}
								onClick={() => goTo(slideIndex)}
							/>
						))}
					</div>
					<button type="button" aria-label={labels.next} onClick={() => goTo(nextSlideIndex(index, 1, slides.length))}>
						<span aria-hidden="true">→</span>
					</button>
				</div>
			) : null}
		</section>
	);
}
