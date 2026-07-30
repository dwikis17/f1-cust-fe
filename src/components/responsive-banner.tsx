export function ResponsiveBanner({
	alt,
	desktopSrc = "/images/generated/banner-desktop.webp",
	mobileSrc = "/images/generated/banner-mobile.webp",
}: {
	alt: string;
	desktopSrc?: string;
	mobileSrc?: string;
}) {
	return (
		<picture className="hero-art">
			<source media="(max-width: 600px)" srcSet={mobileSrc} />
			<img src={desktopSrc} alt={alt} fetchPriority="high" />
		</picture>
	);
}
