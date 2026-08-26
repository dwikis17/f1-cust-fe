import type { NextConfig } from "next";

const isStaging = process.env.APP_ENV === "staging";

const nextConfig: NextConfig = {
	async redirects() {
		return [
			{ source: "/", destination: "/en", permanent: true },
			{ source: "/collections/:path*", destination: "/en/collections/:path*", permanent: true },
			{ source: "/products/:path*", destination: "/en/products/:path*", permanent: true },
			{ source: "/help/:path*", destination: "/en/help/:path*", permanent: true },
			{ source: "/cart", destination: "/en/cart", permanent: true },
			{ source: "/checkout", destination: "/en/checkout", permanent: true },
			{ source: "/track-order", destination: "/en/track-order", permanent: true },
			{ source: "/orders/:path*", destination: "/en/orders/:path*", permanent: true },
		];
	},
	async headers() {
		return isStaging
			? [{ source: "/(.*)", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]
			: [];
	},
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "media.valydejersey.com" },
			{ protocol: "https", hostname: "dev-media.valydejersey.com" },
			{ protocol: "https", hostname: "f1-store-api.dwikis17.workers.dev" },
			{ protocol: "https", hostname: "media.formula1.com" },
	
		],
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
