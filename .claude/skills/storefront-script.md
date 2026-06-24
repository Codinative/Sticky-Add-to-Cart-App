---
meta:
  purpose: "The storefront sticky-bar.js — params, flatten, fetch, product detection, render, triggers, add-to-cart, build"
  triggers: ["sticky-bar", "storefront script", "bar not rendering", "add to cart url", "variant", "trigger", "scroll", "build:storefront", "minify", "esbuild", "cart.php"]
  last_updated: "2026-06-24"
  critical: false
  tokens: "~950"
---

# Storefront script (`sticky-bar.js`)

The bar shoppers see. A single dependency-free IIFE in
[scripts/storefront/sticky-bar.js](../../scripts/storefront/sticky-bar.js) (~1.5k
lines, vanilla ES2018), bundled by [build.js](../../scripts/storefront/build.js)
into `public/sticky-bar.min.js`. BigCommerce injects it into every storefront page
via the Scripts API with `src`:

```
{BASE_URL}/sticky-bar.min.js?sid={uniqueStoreId}&app={BASE_URL}
```

> **Edit the source, then `npm run build:storefront`, then deploy the new
> `public/sticky-bar.min.js`.** Stores load the built file — the source alone is inert.
> The build output is committed.

## Lifecycle (top to bottom)

1. **Read params** — `document.currentScript.src` → `sid` (STORE_ID) and `app`
   (APP_URL). If either is missing the script returns immediately (no-op).
2. **Fire both fetches immediately** (before DOM ready), in parallel:
   - `fetchConfig()` → `GET {APP_URL}/api/storefront/config?sid=…` → nested config.
   - `fetchProductByPath(location.pathname)` → `GET {APP_URL}/api/storefront/product?sid=&path=…`
     → `{ isProductPage, product }`. **Product-page detection is server-side** (BC
     GraphQL `route(path:)`); the script never sniffs the DOM for a product.
   A `preconnect` hint to `APP_URL` is added to cut latency.
3. **`init()` on DOM ready** — `Promise.all([config, product])`, then bail unless:
   `productResult.isProductPage` is true **and** a `product` came back **and** config
   exists **and** `config.enabled`. Otherwise render nothing.
4. **Render** — `flattenConfig(nested)` → flat config, `initSelectedVariants()`,
   `calculateVariantPrice()`, `renderBar()`, attach a `ResizeObserver` to keep body
   padding in sync, then `setupTrigger()`.

## `flattenConfig(nested)` — mirror of the TS converter

Lines ~63–170. It re-implements `nestedToFlattenConfig` from
[lib/configConverter.ts](../../lib/configConverter.ts) in plain JS because the script
can't import TS. **Any change to the nested `StickyBarConfig` shape must be made in
both places** or the storefront silently falls back to defaults for the changed keys.

## Rendering

- `renderBar()` builds the fixed-position container and lays out elements into a
  **left group** (image, title, price) and **right group** (variants, quantity,
  button) per `config.elements` (order + visibility + group). `el(tag, attrs, kids)`
  is a tiny DOM helper; `svgIcon(type)` returns inline SVG.
- Per-element renderers: `renderImage`, `renderTitle`, `renderPrice` (handles
  compare-at as strikethrough or sale badge), `renderVariants`, `renderQuantity`,
  `renderButton`.
- **Variant display types** are chosen per option via `getVariantDisplayType(optionName)`
  (matches `config.variantOptions` by name, case-insensitive; default `dropdown`):
  `renderVariantDropdown` / `renderVariantSwatch` / `renderVariantRadio` /
  `renderVariantRectList`.
- **Quantity styles**: `plusMinus`, `dropdown`, `input` (in `renderQuantity`).
- **Button styles**: `filled` / `outline` / `pill` / `ghost` (in `renderButton`).
- Mobile: `isMobile()` is `innerWidth <= config.mobileBreakpoint`; compact mode and
  `showOnMobile` gate the layout.

## Variant + price + add-to-cart

- `initSelectedVariants()` seeds a selection from `product.variantLabels`.
- `calculateVariantPrice()` finds the matching variant and returns its price.
- A variant is matched by **`variantKey`**, the string `"Color:Red,Size:M,"` built
  server-side in `processGraphQLProduct`. Selecting an option rebuilds the key and
  finds the variant whose `variantKey` contains every selected `name:value,` fragment.
- `generateAddToCartUrl()` returns `null` until **all** options are selected, then:
  ```
  /cart.php?action=add&product_id={entityId}&attribute[{optionId}]={valueEntityId}…&qty={n}
  ```
  `optionId` comes from `product.options` (where `isVariantOption`); the value entity
  id from the matched variant's `optionsIds[label]`. `handleAddToCart()` posts to this
  URL; `highlightMissingVariants()` flags unselected options; `extractErrorFromHtml`
  surfaces a storefront error; `showNotification` shows the success toast.

## Triggers (`setupTrigger`)

- Skips entirely if `isMobile() && !config.showOnMobile`.
- `always` → `showBar()` immediately.
- `delay` → `showBar()` after `config.triggerDelay` seconds.
- `scroll` (default) → debounced scroll listener; shows once scrolled-percent ≥
  `config.scrollThreshold`, hides again above the threshold if it was visible.
- A `resize` listener hides the bar if the viewport crosses into mobile with
  `showOnMobile` off.

## Show / hide & layout safety

- `showBar` / `hideBar` apply the entry/exit animation (`slide` / `fade` / `bounce` /
  `none`) over `config.animationDuration`; `hideBarTimer` guards the
  `visibility:hidden` race.
- `applyBodyPadding` / `removeBodyPadding` add padding to `<body>` (top or bottom per
  position) so the fixed bar never covers page content; a `ResizeObserver` re-applies
  it when the bar wraps.
- `config.zIndex` (default 9999) and `config.customCssClass` come from the Advanced
  settings.

## CSS / shadows

`SHADOW_MAP` and `BTN_SHADOW_MAP` (top of file) translate the `none/sm/md/lg/xl`
tokens to box-shadow values. `buildCSS()` assembles the injected `<style>`.

## Testing changes

Use [app/preview/page.tsx](../../app/preview/page.tsx) (`/preview`) — it loads the
real `public/sticky-bar.min.js`, mocks `/api/storefront/*` via a `fetch` override, and
renders desktop + mobile frames. For real-store validation, save in the dashboard
(reinstalls the script) and open a product page. Config responses are `no-cache`, so a
saved change shows on the next product-page load.
