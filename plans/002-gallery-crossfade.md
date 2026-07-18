# 002 — Bridge product gallery image changes

- **Status**: DONE
- **Commit**: a5dec84
- **Severity**: MEDIUM
- **Category**: Missed opportunities; State indication; Accessibility
- **Estimated scope**: 2 files, small component and CSS change

## Problem

Selecting a product thumbnail swaps the main image instantly, so the relationship
between the selected thumbnail and new image is visually abrupt.

```tsx
// src/components/product-gallery.tsx:23-26 — current
<div className="gallery-main">
	<span className="stock-badge">{messages.product.lastStock}</span>
	<Image src={current.url} alt={current.altText} fill sizes="(max-width: 800px) 100vw, 50vw" loading="eager" />
</div>
```

## Target

Give each selected image a stable keyed wrapper and apply an interruptible 180ms
ease-out opacity/scale entrance with `@starting-style`. Start from `opacity: 0`
and `scale(.97)`, never `scale(0)`. Reduced motion keeps a 120ms opacity fade and
removes scaling.

```css
.gallery-main-image {
	inset: 0;
	opacity: 1;
	position: absolute;
	transform: scale(1);
	transition: opacity 180ms var(--ease-out), transform 180ms var(--ease-out);
}

@starting-style {
	.gallery-main-image { opacity: 0; transform: scale(.97); }
}
```

## Repo conventions to follow

- Reuse `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` from plan 001.
- Keep image layout and `next/image` usage consistent with the current gallery.
- Keep the stock badge above the animated image with its existing z-index.

## Steps

1. In `src/components/product-gallery.tsx`, wrap the main `Image` in a `div` keyed by `current.id` and assign `gallery-main-image`.
2. In `src/app/globals.css`, position the wrapper over the gallery and add the 180ms `@starting-style` entrance transition.
3. Add a reduced-motion override that removes scale and uses a 120ms opacity-only entrance.

## Boundaries

- Do NOT add a carousel library.
- Do NOT animate thumbnail selection or image layout.
- Do NOT change image loading, sizes, or accessible alternative text.
- Do NOT keep multiple full-resolution images mounted after the transition.

## Verification

- **Mechanical**: run `npm run lint` and `npm run build`; both must exit 0.
- **Feel check**: rapidly select several thumbnails. Each image must appear immediately and settle in 180ms without a blank frame or accumulated queue.
- At 10% playback, confirm the scale starts at `.97` and never at zero.
- Emulate `prefers-reduced-motion: reduce`; confirm only opacity changes.
- **Done when**: thumbnail changes remain responsive and the swap is visually bridged without keeping old images mounted.

### Result

Implemented and browser-verified on 2026-07-18. The keyed image changes correctly,
the wrapper matches the gallery dimensions, both transition properties report
180ms, no browser console errors were emitted, and `npm run build` passed.
