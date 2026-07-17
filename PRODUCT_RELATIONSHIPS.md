# Product Relationships Plan — Customer Storefront

## Scope

This plan covers customer-facing collection navigation, product facets, relationship labels/links, and variant selection. It excludes checkout, payments, accounts, reviews, promotions logic, and unrelated visual redesign.

The shared backend contract is defined in `../f1-be/PRODUCT_RELATIONSHIPS.md`.

## Vantage97 behavior to reproduce

- Navigation groups collections under Formula 1, Motorsport, WEC, Accessories, Bikes, and Drivers.
- Teams, drivers, merchandise families, and promotions have dedicated collection URLs.
- A collection can be narrowed by Team, Driver, Product type, Gender/audience, Availability, and Price.
- Filters show result counts.
- Multiple values can be selected in a facet.
- Sorting includes featured, relevance, best selling, alphabetical, price, and date choices; Best selling requires sales data that is outside this relationship phase.
- Apparel shows Size options.
- Caps may have no visible option control.
- Colorways are separate products/SKUs rather than a Color selector in the examples inspected.

## Current storefront gaps

- There is one generic `/collections` page and no `/collections/[slug]` collection detail route.
- The “Teams” filter is populated from tags, not the Team API.
- There is no Driver, Audience, Availability, or functional Price filter.
- Category is the only structural product-type filter.
- Price range, Sort, Display, and Pagination controls are visual placeholders.
- Filtering is single-value and has no facet counts.
- `ProductQuery` omits team and driver even though the backend already accepts them.
- `PublicProduct` in `src/lib/mock.ts` omits team and driver returned by the backend.
- The header hardcodes McLaren through a tag and the Drivers link is unfiltered.
- Product cards use the first tag as the team/byline.
- Product breadcrumbs use the first tag as the parent collection.
- `PurchasePanel` flattens Color and Size into one “Edition” select.
- Product technical data always reads the first variant, not the selected variant.
- Mock data models teams as tags and encourages Color variants that do not match the reference convention.

## Target routes and navigation

### Collection routes

Add:

- `/collections` — collection directory or default all-products collection.
- `/collections/[slug]` — collection detail with products and facets.

The header and mobile navigation should render the active collection tree from `GET /api/collections`, grouped by parent collection. Team and Driver links must point to their actual collection slugs rather than generic query placeholders.

Keep filter state in the URL so links are shareable and browser back/forward works. Preserve unrelated selected facets when one facet changes.

### Product relationship links

Product cards and detail pages should use structural data:

- team byline from `product.team`;
- product type from `product.productType` (or temporary `category` alias);
- driver links from `product.drivers`;
- breadcrumbs from the current collection context when present, otherwise a deterministic primary collection.

Tags are only for labels such as Limited Edition or New Arrival.

## Collection facet behavior

Render facets from the collection-products response, not from global uncounted entity lists:

1. Team
2. Driver
3. Product type
4. Gender & audience
5. In stock
6. Price from/to

Interaction rules:

- Use checkboxes for multi-value facets.
- OR values within one facet; the backend ANDs across facets.
- Show each facet's current result count.
- Keep a selected value visible even when its new count is zero.
- Add individual removable filter chips and Clear all.
- Desktop uses the sidebar; mobile uses an accessible filter drawer/sheet.
- Submit price values as `minPrice`/`maxPrice`; do not leave the current uncontrolled range input disconnected.
- `availability=in_stock` means at least one variant is available.
- Sort is a real URL parameter and server request.
- Show only sort modes the backend can rank honestly. Hide Best selling until a sales metric exists, and show Relevance only for searches.
- Pagination uses the returned page/limit/total and retains active facets.
- Loading, empty, and API error states preserve the user's current filter context.

## Product option behavior

Change `PurchasePanel` to select the actual available Size option:

- If variants differ by Size, render accessible Size radios/buttons and disable unavailable combinations.
- If there is only one default/optionless variant, render no option control and select it automatically.
- Only render Color if the API actually returns multiple color variants for a legacy product.
- Do not show a combined `Color / Size` “Edition” label.
- When a variant changes, SKU, availability, package data, and sizing guide must reflect the selected variant rather than `product.variants[0]`.
- If all variants are unavailable, disable Add to cart and show the out-of-stock state.

For new Vantage-style colorways, link separate product cards/pages; do not invent a Color selector.

## Client types and catalog access

Update `src/lib/mock.ts` or move shared API types to a dedicated module so `PublicProduct` includes:

```ts
type PublicProduct = {
  // existing fields
  team: Team | null;
  drivers: Driver[];
  productType: CatalogEntity; // or category during compatibility
  audience: "MEN" | "WOMEN" | "KIDS" | "UNISEX" | null;
  collections: CollectionSummary[];
  variants: Array<{
    size: string | null;
    color: string | null;
    sizingGuide: SizingGuide | null;
    available: boolean;
  }>;
};
```

Extend the catalog client with:

- `listCollections()`
- `getCollection(slug)`
- `listCollectionProducts(slug, query)`
- multi-value `team`, `driver`, `productType`, and `audience`
- availability, price, sort, page, and limit parameters

Serialize multi-values exactly as the backend contract specifies. Do not let mock and live API query behavior diverge.

## Mock data changes

Mocks remain useful when `API_BASE_URL` is absent, but they must model the real relationships:

- add teams and drivers as first-class objects;
- make product drivers an array;
- add audience and collection membership;
- add a nested collection tree;
- add computed facet counts;
- include one multi-driver product;
- include one historical driver whose current team differs from the product's team;
- include one Size-only apparel product;
- include one default-SKU cap with null Size/Color;
- represent distinct cap colors as separate products;
- stop labeling team tags as structural teams.

## Repository tasks

- [x] Update public product, variant, team, driver, collection, facet, and query types.
- [x] Add collection tree/detail/product methods to `src/lib/catalog.ts`.
- [x] Add `/collections/[slug]/page.tsx`.
- [x] Convert the current filters to URL-backed multi-select controls.
- [x] Add Driver, Gender & audience, Availability, and working Price facets.
- [x] Populate Team from the team facet, not tags.
- [x] Render facet counts and active-filter chips.
- [x] Wire sort and pagination to API query/response values.
- [x] Render navigation from the collection tree on desktop and mobile.
- [x] Update product cards to use primary team and structural badges.
- [x] Update breadcrumbs to use collection context/relationship data.
- [x] Refactor `PurchasePanel` for Size-first, nullable options, and selected-variant state.
- [x] Make technical data react to the selected variant.
- [x] Update mocks to use the same relationship and facet semantics as the API.
- [x] Preserve responsive behavior and keyboard/focus accessibility.

## Suggested implementation order

1. Update types and catalog client against the backend dual-read contract.
2. Fix mocks so local development exercises the same model.
3. Add collection-tree navigation and `/collections/[slug]`.
4. Implement URL-backed facets, counts, sorting, and pagination.
5. Update product cards and breadcrumbs.
6. Refactor selected-variant handling on product detail.
7. Remove temporary category/singular-driver compatibility after backend cleanup.

## Storefront acceptance cases

- McLaren collection + Lando Norris + Headwear + Unisex + In stock returns only matching products.
- Selecting Lando Norris and Oscar Piastri together uses OR for drivers.
- Adding Product type Headwear to that selection uses AND across facets.
- Facet counts update without losing currently selected values.
- A driver's collection remains valid after that driver changes current team.
- A product related to two drivers appears in both driver collections.
- A Size-only shirt lets the customer choose among available sizes.
- A one-SKU cap adds to cart without displaying a fake option selector.
- Separate colorway products retain independent slug, images, SKU, stock, and product page.
- Reload, shareable URLs, and browser back/forward preserve filters and sort.

## Customer storefront definition of done

- Customers can browse dedicated hierarchical collection URLs.
- Team, Driver, Product type, Gender & audience, Availability, and Price are real, counted filters.
- Navigation, cards, breadcrumbs, and product detail use normalized relationships rather than tag position.
- Size-only and optionless products are purchasable without misleading Color/Edition UI.
- Mock mode and live API mode behave the same for all relationship cases.
