# Storefront image specifications

## Recommended production masters

| Asset | Recommended master | Ratio | Composition guidance |
| --- | ---: | ---: | --- |
| Desktop hero | 2400 × 960 px | 5:2 | Keep the left 40% low-detail for copy; focal action in the right half. |
| Mobile hero | 1080 × 2300 px | ~0.47:1 | Keep the focal subject in the upper-middle and the lower 35–40% dark for copy. |
| Product gallery | 1600 × 1600 px | 1:1 | Keep the complete product inside a 10–12% safe margin on a consistent background. |

For the current site, 1200 × 1200 px is the practical minimum for product images. Square masters work cleanly in the collection's 1:1 tiles, the home page's 4:5 crop, thumbnails, and the responsive product gallery.

## Generated assets in this build

| File | Native dimensions | Purpose |
| --- | ---: | --- |
| `banner-desktop.webp` | 1983 × 793 px | Desktop/tablet hero source. |
| `banner-mobile.webp` | 859 × 1831 px | Mobile hero source selected at 600 px and below. |
| `product-01-hero.webp` | 1254 × 1254 px | Primary three-quarter product view. |
| `product-02-side.webp` | 1254 × 1254 px | Side profile. |
| `product-03-rear.webp` | 1254 × 1254 px | Rear three-quarter view. |
| `product-04-detail.webp` | 1254 × 1254 px | Carbon weave and visor-hardware macro. |
| `product-05-front.webp` | 1254 × 1254 px | Centered front view. |

The generated files are encoded as high-quality WebP. Avoid upscaling these sources; generate a larger master when a future layout needs more pixels.
