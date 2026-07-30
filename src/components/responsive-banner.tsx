export function ResponsiveBanner({
	alt,
	desktopSrc = "/images/generated/banner-desktop.webp",
	mobileSrc = "/images/generated/banner-mobile.webp",
	priority = false,
}: {
	alt: string;
	desktopSrc?: string;
	mobileSrc?: string;
	priority?: boolean;
}) {
	return (
		<picture className="hero-art">
			<source media="(max-width: 600px)" srcSet={mobileSrc} />
			<img src={desktopSrc} alt={alt} fetchPriority={priority ? "high" : undefined} loading={priority ? "eager" : "lazy"} />
		</picture>
	);
}
