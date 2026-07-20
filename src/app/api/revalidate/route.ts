import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { parseRevalidationTags } from "@/lib/revalidation";

function authorized(header: string | null, secret: string): boolean {
	if (!header?.startsWith("Bearer ")) return false;
	const supplied = Buffer.from(header.slice(7));
	const expected = Buffer.from(secret);
	return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(request: Request) {
	const secret = process.env.REVALIDATE_SECRET;
	if (!secret) return Response.json({ error: { code: "REVALIDATION_NOT_CONFIGURED" } }, { status: 503, headers: { "cache-control": "no-store" } });
	if (!authorized(request.headers.get("authorization"), secret)) {
		return Response.json({ error: { code: "UNAUTHORIZED" } }, { status: 401, headers: { "cache-control": "no-store" } });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ error: { code: "INVALID_JSON" } }, { status: 400, headers: { "cache-control": "no-store" } });
	}
	const tags = parseRevalidationTags((body as { tags?: unknown } | null)?.tags);
	if (!tags) return Response.json({ error: { code: "INVALID_TAGS" } }, { status: 400, headers: { "cache-control": "no-store" } });

	for (const tag of tags) revalidateTag(tag, "max");
	return Response.json({ revalidated: true, tags, now: Date.now() }, { headers: { "cache-control": "no-store" } });
}
