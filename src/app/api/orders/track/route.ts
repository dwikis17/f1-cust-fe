const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");

export async function POST(request: Request) {
	if (!apiBaseUrl) return Response.json({ error: { code: "ORDER_API_UNAVAILABLE", message: "Order tracking is unavailable" } }, { status: 503 });
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body" } }, { status: 400 });
	}
	try {
		const upstream = await fetch(`${apiBaseUrl}/api/orders/track`, {
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
		return Response.json({ error: { code: "ORDER_API_UNAVAILABLE", message: "Order tracking is unavailable" } }, { status: 502 });
	}
}
