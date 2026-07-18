# 001 — Add restrained interaction motion

- **Status**: DONE
- **Commit**: a5dec84
- **Severity**: MEDIUM
- **Category**: Easing & duration; Physicality & origin; Accessibility
- **Estimated scope**: 1 file, small CSS-only change

## Problem

The storefront has abrupt trigger-anchored surfaces and almost no physical press
feedback. The existing product-card zoom also takes 500ms, which is too slow for
a frequently used catalog interaction.

```css
/* src/app/globals.css:30-32 — current */
.nav-dropdown { background: var(--black); display: none; left: -18px; min-width: 190px; padding: 14px 18px; position: absolute; top: 100%; }
.nav-dropdown a { display: block; white-space: nowrap; }
.nav-group:focus-within .nav-dropdown, .nav-group:hover .nav-dropdown { display: block; }

/* src/app/globals.css:89-90 — current */
.product-image img { object-fit: cover; transition: transform .5s ease; }
.product-card:hover .product-image img { transform: scale(1.035); }

/* src/app/globals.css:390-392 — current */
@media (prefers-reduced-motion: reduce) {
	*, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
}
```

## Target

Add shared motion tokens and use only transform and opacity for movement. Desktop
navigation dropdowns enter from their trigger edge in 180ms. Product imagery
uses a subtle 220ms hover zoom only on fine pointers. Buttons use 140ms press
feedback. Reduced-motion users keep color/opacity feedback but do not receive
scale or translation.

```css
:root {
	--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
	--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
}

.nav-dropdown {
	opacity: 0;
	transform: translateY(-4px) scale(.97);
	transform-origin: top left;
	transition: opacity 180ms var(--ease-out), transform 180ms var(--ease-out), visibility 0s linear 180ms;
	visibility: hidden;
}

.nav-group:focus-within .nav-dropdown,
.nav-group:hover .nav-dropdown {
	opacity: 1;
	transform: translateY(0) scale(1);
	transition-delay: 0s;
	visibility: visible;
}
```

## Repo conventions to follow

- Shared visual tokens already live in `:root` in `src/app/globals.css:3`.
- Existing component styling is centralized in `src/app/globals.css`.
- Do not add a motion dependency for deterministic CSS interactions.

## Steps

1. Add the two shared cubic-bezier tokens to `:root` in `src/app/globals.css`.
2. Replace the dropdown's `display` toggle with interruptible opacity/transform/visibility transitions and a trigger-aligned origin.
3. Change the product image hover to 220ms and gate it with `@media (hover: hover) and (pointer: fine)`.
4. Add 140ms `scale(.97)` press feedback to primary buttons and compact interactive controls without overriding elements whose base transform positions them.
5. Replace the global reduced-motion duration reset with targeted rules that remove movement while retaining short color/opacity feedback.

## Boundaries

- Do NOT change component markup.
- Do NOT add dependencies.
- Do NOT animate layout properties.
- Do NOT add page-transition or ambient animation.
- If a selector has an existing positioning transform, exclude it from generic press feedback.

## Verification

- **Mechanical**: run `npm run lint` and `npm run build`; both must exit 0.
- **Feel check**: hover and keyboard-focus a desktop collection menu, hover a product card, and press each button type. Confirm the dropdown grows from the trigger edge, the card zoom feels immediate, and press scale is subtle.
- In DevTools at 10% playback, confirm only transform and opacity move.
- Emulate `prefers-reduced-motion: reduce`; confirm translation and scaling are removed while color and opacity feedback remain.
- **Done when**: the interactions are interruptible, stay under 220ms, and introduce no layout shift.

### Result

Implemented and browser-verified on 2026-07-18. `npm run build` passed, including
TypeScript and static page generation, and the local browser reported no console
errors. Repository-wide lint remains blocked by the existing Next.js 16 lint
script/configuration documented in the task handoff.
