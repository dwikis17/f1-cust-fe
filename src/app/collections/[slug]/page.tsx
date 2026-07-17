import Link from "next/link";
import { notFound } from "next/navigation";

import { CollectionResults, collectionQuery, type CollectionSearchParams } from "@/components/collection-results";
import { catalog } from "@/lib/catalog";

export default async function CollectionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<CollectionSearchParams> }) {
	const [{ slug }, currentParams] = await Promise.all([params, searchParams]);
	const response = await catalog.listCollectionProducts(slug, collectionQuery(currentParams));
	if (!response) notFound();
	const path = `/collections/${response.collection.slug}`;
	return <main className="page-shell collection-page">
		<section className="collection-title"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Homepage</Link><span>/</span><Link href="/collections">Collections</Link>{response.collection.parent ? <><span>/</span><Link href={`/collections/${response.collection.parent.slug}`}>{response.collection.parent.name}</Link></> : null}</nav><p className="eyebrow">{response.collection.kind}</p><h1>{response.collection.name}</h1><p>{response.collection.description}</p>{response.collection.children.length ? <div className="child-collections">{response.collection.children.map((child) => <Link key={child.id} href={`/collections/${child.slug}`}>{child.name}</Link>)}</div> : null}</section>
		<CollectionResults path={path} params={currentParams} response={response} />
	</main>;
}
