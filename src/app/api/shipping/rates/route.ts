const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");

export async function POST(request: Request) {
	if (!apiBaseUrl) {
		return Response.json(
			{ error: { code: "SHIPPING_NOT_CONFIGURED", message: "Shipping estimates are not configured" } },
			{ status: 503, headers: { "cache-control": "no-store" } },
		);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json(
			{ error: { code: "INVALID_JSON", message: "Request body must be valid JSON" } },
			{ status: 400, headers: { "cache-control": "no-store" } },
		);
	}

	try {
		const upstream = await fetch(`${apiBaseUrl}/api/shipping/rates`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
			cache: "no-store",
			signal: AbortSignal.timeout(10_000),
		});
		return new Response(upstream.body, {
			status: upstream.status,
			headers: { "content-type": upstream.headers.get("content-type") ?? "application/json", "cache-control": "no-store" },
		});
	} catch {
		return Response.json(
			{ error: { code: "SHIPPING_API_UNAVAILABLE", message: "Shipping estimates are temporarily unavailable" } },
			{ status: 502, headers: { "cache-control": "no-store" } },
		);
	}
}
