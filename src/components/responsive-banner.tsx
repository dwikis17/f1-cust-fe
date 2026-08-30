import { getImageProps } from "next/image";

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
	const common = { alt, sizes: "100vw", priority, fetchPriority: priority ? "high" as const : undefined };
	const { props: { srcSet: desktopSrcSet, alt: desktopAlt, ...desktop } } = getImageProps({ ...common, src: desktopSrc, width: 1983, height: 793 });
	const { props: { srcSet: mobileSrcSet } } = getImageProps({ ...common, src: mobileSrc, width: 859, height: 1831 });
	return (
		<picture className="hero-art">
			<source media="(max-width: 600px)" srcSet={mobileSrcSet} sizes="100vw" />
			<img {...desktop} srcSet={desktopSrcSet} alt={desktopAlt} />
		</picture>
	);
}
