export function ResponsiveBanner({ alt }: { alt: string }) {
	return (
		<picture className="hero-art">
			<source media="(max-width: 600px)" srcSet="/images/generated/banner-mobile.webp" />
			<img src="/images/generated/banner-desktop.webp" alt={alt} fetchPriority="high" />
		</picture>
	);
}
