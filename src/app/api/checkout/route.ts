const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");

export async function POST(request: Request) {
	if (!apiBaseUrl) return Response.json({ error: { code: "PAYMENT_NOT_CONFIGURED", message: "Payment is not configured" } }, { status: 503 });
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: { code: "INVALID_JSON", message: "Request body must be valid JSON" } }, { status: 400 });
	}
	try {
		const upstream = await fetch(`${apiBaseUrl}/api/checkout`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
			cache: "no-store",
			signal: AbortSignal.timeout(12_000),
		});
		return new Response(upstream.body, { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") ?? "application/json", "cache-control": "no-store" } });
	} catch {
		return Response.json({ error: { code: "PAYMENT_API_UNAVAILABLE", message: "Payment is temporarily unavailable" } }, { status: 502 });
	}
}
