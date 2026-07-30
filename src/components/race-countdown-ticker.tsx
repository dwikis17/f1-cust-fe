"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/locale";
import { calculateTimeRemaining, getNextRace, type TimeRemaining } from "@/lib/races";

export function RaceCountdownTicker({ locale }: { locale: Locale }) {
	const [mounted, setMounted] = useState(false);
	const [dismissed, setDismissed] = useState(false);
	const [{ race, isLive }, setRaceData] = useState(() => getNextRace());
	const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
		calculateTimeRemaining(race.raceDate)
	);

	const messages = dictionary(locale);

	useEffect(() => {
		const frame = requestAnimationFrame(() => {
			setMounted(true);
			try {
				setDismissed(sessionStorage.getItem(`vld_dismiss_race_${race.slug}`) === "1");
			} catch {
				setDismissed(false);
			}
		});

		return () => cancelAnimationFrame(frame);
	}, [race.slug]);

	useEffect(() => {
		const timer = setInterval(() => {
			const currentNow = new Date();
			const activeRace = getNextRace(currentNow);
			setRaceData(activeRace);
			setTimeRemaining(calculateTimeRemaining(activeRace.race.raceDate, currentNow));
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	if (dismissed) {
		return null;
	}

	const handleDismiss = () => {
		setDismissed(true);
		try {
			sessionStorage.setItem(`vld_dismiss_race_${race.slug}`, "1");
		} catch {
			// Storage unavailable
		}
	};

	const raceName = race.name[locale] || race.name.en;
	const collectionHref = race.featuredCollectionSlug
		? localizedPath(locale, `/collections/${race.featuredCollectionSlug}`)
		: localizedPath(locale, "/collections");

	const pad = (num: number) => String(num).padStart(2, "0");

	return (
		<div className="race-ticker-bar" role="region" aria-label={messages.raceCountdown.nextRace}>
			<div className="race-ticker-content">
				{/* Left Badge: Status & Race Details */}
				<div className="race-ticker-identity">
					<span className={`race-ticker-badge ${isLive ? "is-live" : ""}`}>
						<span className="ticker-badge-dot" />
						<span className="ticker-badge-text">
							{isLive ? messages.raceCountdown.liveWeekend : messages.raceCountdown.nextRace}
						</span>
					</span>
					<span className="race-ticker-title">
						<span className="race-flag" aria-hidden="true">
							{race.flag}
						</span>
						<strong className="race-name">{raceName}</strong>
						<span className="race-circuit-sep">•</span>
						<span className="race-circuit">{race.location}</span>
					</span>
				</div>

				{/* Center: Live Digital Clock */}
				<div className="race-ticker-clock" aria-label="Countdown">
					{!mounted ? (
						<span className="clock-loading">--d --h --m --s</span>
					) : timeRemaining.isCompleted || isLive ? (
						<span className="clock-live-tag">LIGHTS OUT 🏎️</span>
					) : (
						<div className="clock-digits">
							<span className="clock-unit">
								<strong>{pad(timeRemaining.days)}</strong>
								<small>{messages.raceCountdown.days}</small>
							</span>
							<span className="clock-sep">:</span>
							<span className="clock-unit">
								<strong>{pad(timeRemaining.hours)}</strong>
								<small>{messages.raceCountdown.hours}</small>
							</span>
							<span className="clock-sep">:</span>
							<span className="clock-unit">
								<strong>{pad(timeRemaining.minutes)}</strong>
								<small>{messages.raceCountdown.minutes}</small>
							</span>
							<span className="clock-sep">:</span>
							<span className="clock-unit">
								<strong>{pad(timeRemaining.seconds)}</strong>
								<small>{messages.raceCountdown.seconds}</small>
							</span>
						</div>
					)}
				</div>

				{/* Right: CTA & Dismiss */}
				<div className="race-ticker-actions">
					<Link href={collectionHref} className="race-ticker-cta">
						<span>{messages.raceCountdown.shopGear}</span>
						<span className="cta-arrow">→</span>
					</Link>
					<button
						type="button"
						className="race-ticker-dismiss"
						onClick={handleDismiss}
						aria-label={messages.raceCountdown.closeBanner}
						title={messages.raceCountdown.closeBanner}
					>
						✕
					</button>
				</div>
			</div>
		</div>
	);
}
