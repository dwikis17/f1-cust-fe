export interface F1Race {
	slug: string;
	name: {
		en: string;
		id: string;
	};
	circuit: string;
	location: string;
	countryCode: string;
	flag: string;
	weekendStartDate: string; // ISO String for Friday start of weekend
	raceDate: string; // ISO String for Sunday main race lights out
	featuredCollectionSlug?: string;
}

export interface TimeRemaining {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	isLive: boolean;
	isCompleted: boolean;
}

export const F1_2026_SCHEDULE: F1Race[] = [
	{
		slug: "aus-gp",
		name: { en: "Australian Grand Prix", id: "Grand Prix Australia" },
		circuit: "Albert Park Circuit",
		location: "Melbourne",
		countryCode: "AU",
		flag: "🇦🇺",
		weekendStartDate: "2026-03-06T00:00:00Z",
		raceDate: "2026-03-08T04:00:00Z",
		featuredCollectionSlug: "mclaren",
	},
	{
		slug: "chn-gp",
		name: { en: "Chinese Grand Prix", id: "Grand Prix Tiongkok" },
		circuit: "Shanghai International Circuit",
		location: "Shanghai",
		countryCode: "CN",
		flag: "🇨🇳",
		weekendStartDate: "2026-03-13T00:00:00Z",
		raceDate: "2026-03-15T07:00:00Z",
		featuredCollectionSlug: "kick-sauber",
	},
	{
		slug: "jpn-gp",
		name: { en: "Japanese Grand Prix", id: "Grand Prix Jepang" },
		circuit: "Suzuka International Racing Course",
		location: "Suzuka",
		countryCode: "JP",
		flag: "🇯🇵",
		weekendStartDate: "2026-03-27T00:00:00Z",
		raceDate: "2026-03-29T05:00:00Z",
		featuredCollectionSlug: "rb",
	},
	{
		slug: "bhr-gp",
		name: { en: "Bahrain Grand Prix", id: "Grand Prix Bahrain" },
		circuit: "Bahrain International Circuit",
		location: "Sakhir",
		countryCode: "BH",
		flag: "🇧🇭",
		weekendStartDate: "2026-04-10T00:00:00Z",
		raceDate: "2026-04-12T15:00:00Z",
		featuredCollectionSlug: "red-bull-racing",
	},
	{
		slug: "sau-gp",
		name: { en: "Saudi Arabian Grand Prix", id: "Grand Prix Arab Saudi" },
		circuit: "Jeddah Corniche Circuit",
		location: "Jeddah",
		countryCode: "SA",
		flag: "🇸🇦",
		weekendStartDate: "2026-04-17T00:00:00Z",
		raceDate: "2026-04-19T17:00:00Z",
		featuredCollectionSlug: "aston-martin",
	},
	{
		slug: "mia-gp",
		name: { en: "Miami Grand Prix", id: "Grand Prix Miami" },
		circuit: "Miami International Autodrome",
		location: "Miami",
		countryCode: "US",
		flag: "🇺🇸",
		weekendStartDate: "2026-05-01T00:00:00Z",
		raceDate: "2026-05-03T20:00:00Z",
		featuredCollectionSlug: "haas",
	},
	{
		slug: "can-gp",
		name: { en: "Canadian Grand Prix", id: "Grand Prix Kanada" },
		circuit: "Circuit Gilles-Villeneuve",
		location: "Montreal",
		countryCode: "CA",
		flag: "🇨🇦",
		weekendStartDate: "2026-05-22T00:00:00Z",
		raceDate: "2026-05-24T18:00:00Z",
		featuredCollectionSlug: "williams",
	},
	{
		slug: "mon-gp",
		name: { en: "Monaco Grand Prix", id: "Grand Prix Monako" },
		circuit: "Circuit de Monaco",
		location: "Monte Carlo",
		countryCode: "MC",
		flag: "🇲🇨",
		weekendStartDate: "2026-06-05T00:00:00Z",
		raceDate: "2026-06-07T13:00:00Z",
		featuredCollectionSlug: "ferrari",
	},
	{
		slug: "esp-gp",
		name: { en: "Spanish Grand Prix", id: "Grand Prix Spanyol" },
		circuit: "Circuit de Barcelona-Catalunya",
		location: "Barcelona",
		countryCode: "ES",
		flag: "🇪🇸",
		weekendStartDate: "2026-06-12T00:00:00Z",
		raceDate: "2026-06-14T13:00:00Z",
		featuredCollectionSlug: "ferrari",
	},
	{
		slug: "aut-gp",
		name: { en: "Austrian Grand Prix", id: "Grand Prix Austria" },
		circuit: "Red Bull Ring",
		location: "Spielberg",
		countryCode: "AT",
		flag: "🇦🇹",
		weekendStartDate: "2026-06-26T00:00:00Z",
		raceDate: "2026-06-28T13:00:00Z",
		featuredCollectionSlug: "red-bull-racing",
	},
	{
		slug: "gbr-gp",
		name: { en: "British Grand Prix", id: "Grand Prix Inggris" },
		circuit: "Silverstone Circuit",
		location: "Silverstone",
		countryCode: "GB",
		flag: "🇬🇧",
		weekendStartDate: "2026-07-03T00:00:00Z",
		raceDate: "2026-07-05T14:00:00Z",
		featuredCollectionSlug: "mercedes",
	},
	{
		slug: "bel-gp",
		name: { en: "Belgian Grand Prix", id: "Grand Prix Belgia" },
		circuit: "Circuit de Spa-Francorchamps",
		location: "Stavelot",
		countryCode: "BE",
		flag: "🇧🇪",
		weekendStartDate: "2026-07-17T00:00:00Z",
		raceDate: "2026-07-19T13:00:00Z",
		featuredCollectionSlug: "alpine",
	},
	{
		slug: "hun-gp",
		name: { en: "Hungarian Grand Prix", id: "Grand Prix Hungaria" },
		circuit: "Hungaroring",
		location: "Budapest",
		countryCode: "HU",
		flag: "🇭🇺",
		weekendStartDate: "2026-07-24T00:00:00Z",
		raceDate: "2026-07-26T13:00:00Z",
		featuredCollectionSlug: "mclaren",
	},
	{
		slug: "nld-gp",
		name: { en: "Dutch Grand Prix", id: "Grand Prix Belanda" },
		circuit: "Circuit Zandvoort",
		location: "Zandvoort",
		countryCode: "NL",
		flag: "🇳🇱",
		weekendStartDate: "2026-08-21T00:00:00Z",
		raceDate: "2026-08-23T13:00:00Z",
		featuredCollectionSlug: "red-bull-racing",
	},
	{
		slug: "ita-gp",
		name: { en: "Italian Grand Prix", id: "Grand Prix Italia" },
		circuit: "Autodromo Nazionale Monza",
		location: "Monza",
		countryCode: "IT",
		flag: "🇮🇹",
		weekendStartDate: "2026-09-04T00:00:00Z",
		raceDate: "2026-09-06T13:00:00Z",
		featuredCollectionSlug: "ferrari",
	},
	{
		slug: "mad-gp",
		name: { en: "Madrid Grand Prix", id: "Grand Prix Madrid" },
		circuit: "MADRING Circuit",
		location: "Madrid",
		countryCode: "ES",
		flag: "🇪🇸",
		weekendStartDate: "2026-09-11T00:00:00Z",
		raceDate: "2026-09-13T13:00:00Z",
		featuredCollectionSlug: "ferrari",
	},
	{
		slug: "aze-gp",
		name: { en: "Azerbaijan Grand Prix", id: "Grand Prix Azerbaijan" },
		circuit: "Baku City Circuit",
		location: "Baku",
		countryCode: "AZ",
		flag: "🇦🇿",
		weekendStartDate: "2026-09-24T00:00:00Z",
		raceDate: "2026-09-26T11:00:00Z",
		featuredCollectionSlug: "red-bull-racing",
	},
	{
		slug: "sgp-gp",
		name: { en: "Singapore Grand Prix", id: "Grand Prix Singapura" },
		circuit: "Marina Bay Street Circuit",
		location: "Marina Bay",
		countryCode: "SG",
		flag: "🇸🇬",
		weekendStartDate: "2026-10-09T00:00:00Z",
		raceDate: "2026-10-11T12:00:00Z",
		featuredCollectionSlug: "mclaren",
	},
	{
		slug: "usa-gp",
		name: { en: "United States Grand Prix", id: "Grand Prix Amerika Serikat" },
		circuit: "Circuit of the Americas",
		location: "Austin",
		countryCode: "US",
		flag: "🇺🇸",
		weekendStartDate: "2026-10-23T00:00:00Z",
		raceDate: "2026-10-25T19:00:00Z",
		featuredCollectionSlug: "haas",
	},
	{
		slug: "mex-gp",
		name: { en: "Mexico City Grand Prix", id: "Grand Prix Kota Meksiko" },
		circuit: "Autódromo Hermanos Rodríguez",
		location: "Mexico City",
		countryCode: "MX",
		flag: "🇲🇽",
		weekendStartDate: "2026-10-30T00:00:00Z",
		raceDate: "2026-11-01T20:00:00Z",
		featuredCollectionSlug: "red-bull-racing",
	},
	{
		slug: "bra-gp",
		name: { en: "São Paulo Grand Prix", id: "Grand Prix São Paulo" },
		circuit: "Autódromo José Carlos Pace",
		location: "São Paulo",
		countryCode: "BR",
		flag: "🇧🇷",
		weekendStartDate: "2026-11-06T00:00:00Z",
		raceDate: "2026-11-08T17:00:00Z",
		featuredCollectionSlug: "mercedes",
	},
	{
		slug: "lve-gp",
		name: { en: "Las Vegas Grand Prix", id: "Grand Prix Las Vegas" },
		circuit: "Las Vegas Strip Circuit",
		location: "Las Vegas",
		countryCode: "US",
		flag: "🇺🇸",
		weekendStartDate: "2026-11-19T00:00:00Z",
		raceDate: "2026-11-21T06:00:00Z",
		featuredCollectionSlug: "ferrari",
	},
	{
		slug: "qat-gp",
		name: { en: "Qatar Grand Prix", id: "Grand Prix Qatar" },
		circuit: "Lusail International Circuit",
		location: "Lusail",
		countryCode: "QA",
		flag: "🇶🇦",
		weekendStartDate: "2026-11-27T00:00:00Z",
		raceDate: "2026-11-29T16:00:00Z",
		featuredCollectionSlug: "mclaren",
	},
	{
		slug: "abu-gp",
		name: { en: "Abu Dhabi Grand Prix", id: "Grand Prix Abu Dhabi" },
		circuit: "Yas Marina Circuit",
		location: "Yas Island",
		countryCode: "AE",
		flag: "🇦🇪",
		weekendStartDate: "2026-12-04T00:00:00Z",
		raceDate: "2026-12-06T13:00:00Z",
		featuredCollectionSlug: "red-bull-racing",
	},
];

/**
 * Returns the active or next upcoming race based on the current date.
 */
export function getNextRace(now: Date = new Date()): { race: F1Race; isLive: boolean } {
	const currentTime = now.getTime();

	for (const race of F1_2026_SCHEDULE) {
		const startMs = new Date(race.weekendStartDate).getTime();
		// Race weekend is considered live from Friday start until 4 hours after Sunday race launch
		const endMs = new Date(race.raceDate).getTime() + 4 * 60 * 60 * 1000;

		if (currentTime >= startMs && currentTime <= endMs) {
			return { race, isLive: true };
		}
		if (currentTime < startMs) {
			return { race, isLive: false };
		}
	}

	// If season ended, fallback to the last race or wrap around
	return { race: F1_2026_SCHEDULE[F1_2026_SCHEDULE.length - 1], isLive: false };
}

/**
 * Calculates remaining time breakdown to a given target date.
 */
export function calculateTimeRemaining(targetDateISO: string, now: Date = new Date()): TimeRemaining {
	const targetMs = new Date(targetDateISO).getTime();
	const diffMs = targetMs - now.getTime();

	if (diffMs <= 0) {
		return {
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
			isLive: true,
			isCompleted: true,
		};
	}

	const seconds = Math.floor((diffMs / 1000) % 60);
	const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
	const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
	const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	return {
		days,
		hours,
		minutes,
		seconds,
		isLive: false,
		isCompleted: false,
	};
}
