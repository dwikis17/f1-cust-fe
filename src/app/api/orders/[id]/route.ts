const apiBaseUrl = process.env.API_BASE_URL?.replace(/\/$/, "");

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
	if (!apiBaseUrl) return Response.json({ error: { code: "ORDER_API_UNAVAILABLE", message: "Order status is unavailable" } }, { status: 503 });
	const { id } = await params;
	try {
		const upstream = await fetch(`${apiBaseUrl}/api/orders/${encodeURIComponent(id)}`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
		return new Response(upstream.body, { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") ?? "application/json", "cache-control": "no-store" } });
	} catch {
		return Response.json({ error: { code: "ORDER_API_UNAVAILABLE", message: "Order status is unavailable" } }, { status: 502 });
	}
}
