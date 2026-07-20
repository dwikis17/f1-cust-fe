import { isLocale } from "@/lib/i18n";

const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function errorResponse(code: string, status: 400 | 502 | 503) {
	return Response.json({ error: { code } }, { status, headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
	if (!apiBaseUrl) return errorResponse("CART_API_UNAVAILABLE", 503);
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return errorResponse("INVALID_JSON", 400);
	}
	const { variantIds, locale } = (body ?? {}) as { variantIds?: unknown; locale?: unknown };
	if (!Array.isArray(variantIds) || variantIds.length === 0 || variantIds.length > 50 || variantIds.some((id) => typeof id !== "string" || !uuidPattern.test(id)) || typeof locale !== "string" || !isLocale(locale)) {
		return errorResponse("INVALID_CART_ITEMS", 400);
	}
	try {
		const upstream = await fetch(`${apiBaseUrl}/api/products/cart-items`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ variantIds: [...new Set(variantIds)], locale }),
			cache: "no-store",
			signal: AbortSignal.timeout(10_000),
		});
		if (!upstream.ok) {
			if (upstream.status === 400) return errorResponse("INVALID_CART_ITEMS", 400);
			if (upstream.status === 503) return errorResponse("CART_API_UNAVAILABLE", 503);
			return errorResponse("CART_API_BAD_GATEWAY", 502);
		}
		return new Response(upstream.body, {
			status: upstream.status,
			headers: { "content-type": upstream.headers.get("content-type") ?? "application/json", "cache-control": "no-store" },
		});
	} catch (error) {
		return errorResponse(error instanceof DOMException && error.name === "TimeoutError" ? "CART_API_TIMEOUT" : "CART_API_BAD_GATEWAY", error instanceof DOMException && error.name === "TimeoutError" ? 503 : 502);
	}
}
