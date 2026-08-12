import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
	if (process.env.APP_ENV === "staging") {
		return { rules: { userAgent: "*", disallow: "/" } };
	}
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/api/"],
		},
		sitemap: absoluteUrl("/sitemap.xml"),
		host: absoluteUrl("/"),
	};
}
