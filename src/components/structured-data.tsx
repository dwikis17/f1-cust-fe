type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>;

export function StructuredData({ data }: { data: JsonLdValue }) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll("<", "\\u003c") }}
		/>
	);
}

