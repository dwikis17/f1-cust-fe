# VALYDE Storefront

Customer-facing Formula 1 ecommerce storefront built with Next.js and OpenNext for Cloudflare.

## Local development

```bash
npm install
npm run dev
```

The storefront requires `f1-be` for all catalog, collection, team, driver, and filter data. Start the backend and set:

```bash
API_BASE_URL=http://localhost:3000
```

`API_BASE_URL` is required in development and production. Product and collection responses use a five-minute fallback TTL, while taxonomy, FAQ, and sitemap data use one hour. Backend mutation webhooks normally invalidate affected tags earlier. The catalog adapter in `src/lib/catalog.ts` calls:

- `GET /api/categories`
- `GET /api/tags`
- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/teams`
- `GET /api/collections`
- `GET /api/collections/:slug/products`
- `GET /api/faqs?locale=en|id`
- `POST /api/products/cart-items`

The storefront uses deterministic `/en` and `/id` URLs. Legacy unprefixed storefront URLs permanently redirect to English, and every indexable page publishes canonical and language-alternate URLs. Indonesian catalog requests use `locale=id`; English remains the field-level fallback for untranslated product copy.

The cart posts shipping estimates to the storefront's same-origin `POST /api/shipping/rates` route, which forwards to `API_BASE_URL` without exposing backend configuration to the browser. Checkout quotes rates by the customer's postal code and manually entered address. The Mapbox address search and delivery pin (`delivery-location-map.tsx`, `/api/locations/search`) are disabled but kept in the codebase; `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is optional. Instant couriers that need exact coordinates (Gojek, Grab, Lalamove, etc.) are blocked by the backend. The backend must have the Biteship key and origin postal code configured before live estimates are available.

Checkout uses the same-origin `POST /api/checkout` proxy and Midtrans Snap.js. Turnstile is enabled only in production: export `NEXT_PUBLIC_TURNSTILE_SITE_KEY` with the Cloudflare Turnstile site key before running `npm run deploy`; the deploy command fails when it is missing. Leave it blank locally and omit it from `deploy:staging`. Restrict the widget to `valydejersey.com` (the page that renders it), not `api.valydejersey.com`. The Turnstile secret belongs only in `f1-be`; never put it in a `NEXT_PUBLIC_` variable. Payment and shipment state is displayed at `/:locale/orders/:id` from the safe public receipt endpoint.

OpenNext stores ISR and fetch-cache entries in the `f1-cust-fe-incremental-cache` R2 bucket and uses Durable Objects for time-based and tag revalidation. Set `REVALIDATE_SECRET` to the same value as the backend's `STOREFRONT_REVALIDATE_SECRET`.

## Checks and deployment

```bash
npm run build
npm run preview
npm run deploy
```
