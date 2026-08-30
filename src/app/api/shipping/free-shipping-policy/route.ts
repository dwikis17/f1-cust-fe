const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");

export async function GET() {
	if (!apiBaseUrl) return Response.json({ error: { code: "SHIPPING_API_UNAVAILABLE", message: "Shipping policy is unavailable" } }, { status: 503 });
	try {
		const upstream = await fetch(`${apiBaseUrl}/api/shipping/free-shipping-policy`, {
			cache: "force-cache",
			next: { tags: ["shipping:free-shipping-policy"], revalidate: 300 },
			signal: AbortSignal.timeout(10_000),
		});
		return new Response(upstream.body, { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") ?? "application/json", "cache-control": "no-store" } });
	} catch {
		return Response.json({ error: { code: "SHIPPING_API_UNAVAILABLE", message: "Shipping policy is unavailable" } }, { status: 502 });
	}
}
