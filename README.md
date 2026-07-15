# VALDYE Storefront

Customer-facing Formula 1 ecommerce storefront built with Next.js and OpenNext for Cloudflare.

## Local development

```bash
npm install
npm run dev
```

The storefront uses the backend-compatible data in `src/lib/mock.ts` when no API URL is configured. To use `f1-be`, start the backend and set:

```bash
API_BASE_URL=http://localhost:3000
```

The catalog adapter in `src/lib/catalog.ts` then calls:

- `GET /api/categories`
- `GET /api/tags`
- `GET /api/products`
- `GET /api/products/:slug`

## Checks and deployment

```bash
npm run build
npm run preview
npm run deploy
```
