# VALDYE Storefront

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

`API_BASE_URL` is required in development and production. Catalog responses are revalidated every 180 seconds, so admin changes may take up to three minutes to appear. The catalog adapter in `src/lib/catalog.ts` calls:

- `GET /api/categories`
- `GET /api/tags`
- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/teams`
- `GET /api/collections`
- `GET /api/collections/:slug/products`
- `GET /api/faqs?locale=en|id`

The storefront supports English and Indonesian without locale-prefixed URLs. The header language switcher stores `en` or `id` in the `valdye-locale` cookie, and catalog requests forward that selection through the public API's `locale` query parameter. English is the default and the fallback when optional Indonesian product copy is missing.

The cart posts shipping estimates to the storefront's same-origin `POST /api/shipping/rates` route, which forwards to `API_BASE_URL` without exposing backend configuration to the browser. The backend must have its Biteship key and origin postal code configured before live estimates are available.

Checkout uses the same-origin `POST /api/checkout` proxy and Midtrans Snap.js. Set `NEXT_PUBLIC_MIDTRANS_ENV=sandbox` and the public `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` from `.env.example`; the Midtrans server key belongs only in `f1-be`. Payment and shipment state is displayed at `/orders/:id` from the safe public receipt endpoint.

## Checks and deployment

```bash
npm run build
npm run preview
npm run deploy
```
