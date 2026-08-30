import { defaultLocale, isLocale } from "@/lib/i18n";

const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");
const searchLimit = 4;

function errorResponse(code: string, status: 400 | 502 | 503) {
	return Response.json({ error: { code } }, { status, headers: { "cache-control": "no-store" } });
}

export async function GET(request: Request) {
	if (!apiBaseUrl) return errorResponse("SEARCH_API_UNAVAILABLE", 503);

	const params = new URL(request.url).searchParams;
	const search = params.get("search")?.trim() ?? "";
	const locale = params.get("locale") ?? defaultLocale;
	if (search.length < 2 || search.length > 100 || !isLocale(locale)) {
		return errorResponse("INVALID_SEARCH_QUERY", 400);
	}

	const upstreamUrl = new URL(`${apiBaseUrl}/api/products`);
	upstreamUrl.searchParams.set("search", search);
	upstreamUrl.searchParams.set("locale", locale);
	upstreamUrl.searchParams.set("page", "1");
	upstreamUrl.searchParams.set("limit", String(searchLimit));
	upstreamUrl.searchParams.set("sort", "featured");

	try {
		const upstream = await fetch(upstreamUrl, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
		if (!upstream.ok) {
			if (upstream.status === 400) return errorResponse("INVALID_SEARCH_QUERY", 400);
			if (upstream.status === 503) return errorResponse("SEARCH_API_UNAVAILABLE", 503);
			return errorResponse("SEARCH_API_BAD_GATEWAY", 502);
		}
		return new Response(upstream.body, {
			status: upstream.status,
			headers: {
				"content-type": upstream.headers.get("content-type") ?? "application/json",
				"cache-control": "no-store",
			},
		});
	} catch (error) {
		const timeout = error instanceof DOMException && error.name === "TimeoutError";
		return errorResponse(timeout ? "SEARCH_API_TIMEOUT" : "SEARCH_API_BAD_GATEWAY", timeout ? 503 : 502);
	}
}
