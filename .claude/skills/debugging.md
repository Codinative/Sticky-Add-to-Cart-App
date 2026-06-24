---
meta:
  purpose: "Common failures: bar not appearing, wrong/no product, session 401s, script not updating, gotchas"
  triggers: ["bug", "not working", "bar not showing", "401", "session", "cors", "script not updating", "wrong product", "variant mismatch", "gotcha"]
  last_updated: "2026-06-24"
  critical: true
  tokens: "~750"
---

# Debugging & gotchas

## The bar doesn't appear on the storefront

Walk the render gate in `init()` ([sticky-bar.js](../../scripts/storefront/sticky-bar.js)) — it bails unless **all** hold:

1. **Script is injected.** `GET /api/bc-scripts` (session-gated) should report
   `installed: true`. If not, re-save in the dashboard (POST `/api/config` retries
   `installOrUpdateScript`) or check the store's **Storefront → Script Manager** for
   "Sticky Add to Cart Bar". Install can fail silently at OAuth time — the save is the
   retry path.
2. **`sid`/`app` params present.** The injected `src` must be
   `…/sticky-bar.min.js?sid={uuid}&app={BASE_URL}`. Missing params → the script
   returns immediately. A wrong `BASE_URL` at deploy time poisons every store's `src`.
3. **It's a product page.** `GET /api/storefront/product?sid=&path=…` must return
   `isProductPage: true`. The decision is the BC GraphQL `route(path:)` lookup —
   custom URLs, non-product pages, and unpublished products return `false`.
4. **`config.enabled` is true.** The Behavior tab master toggle. Stored at
   `behavior.display.enabled`.
5. **Not hidden by mobile rules.** `isMobile() && !showOnMobile` skips the bar.
6. **Trigger fired.** Default `scroll` mode only shows past `scrollThreshold` percent.
   Test with `always` to isolate.
7. **Not behind another element.** Raise `zIndex` (Advanced) above chat/cookie widgets.

## A saved style change isn't showing

- The dashboard saves the **nested** config; the storefront reads it via
  `/api/storefront/config` (sent with `no-cache`), so it appears on the next
  product-page load — not retroactively on an open tab.
- If the change is to the **storefront script itself**, you must
  `npm run build:storefront` and redeploy `public/sticky-bar.min.js`. Editing
  `sticky-bar.js` alone changes nothing.
- If a specific field reverts to default on the storefront but is correct in the
  dashboard, the script's `flattenConfig` is missing that key — it must mirror
  `nestedToFlattenConfig` in [lib/configConverter.ts](../../lib/configConverter.ts).

## Dashboard returns 401 "Session not found"

- Session-gated routes (`/api/config`, `/api/bc-scripts`, `/api/products`) read
  `?context=` and `decodePayload` it with `JWT_KEY` ([lib/auth.ts](../../lib/auth.ts)).
  Causes: missing `context` query param, expired token (24h), or a **changed
  `JWT_KEY`** between sign and verify. Re-open the app from BC (`/api/load` re-mints
  the token).

## Wrong price / add-to-cart does nothing

- `generateAddToCartUrl()` returns `null` until **every** option is selected;
  the button calls `highlightMissingVariants()` instead of navigating.
- Variant matching is by **`variantKey`** (`"Color:Red,Size:M,"`). If a product's
  option display names contain commas or colons, the key can mis-split — inspect
  `product.variants` from `/api/storefront/product`.
- The add-to-cart URL uses `attribute[{optionId}]={valueEntityId}`; `optionId` comes
  from `product.options` where `isVariantOption` is true. Non-variant options aren't
  appended.

## Variant options not styled as configured

- `getVariantDisplayType` matches `config.variantOptions[].name` against the option's
  display name **case-insensitively**; unmatched options fall back to `dropdown`.
  Spelling must match the BigCommerce option name.

## CORS / ngrok

- `app/api/storefront/*` send `Access-Control-Allow-Origin: *` and allow the
  `ngrok-skip-browser-warning` header. The session-gated routes are **not** CORS-open —
  they're same-origin from the admin iframe. Don't call them from the storefront.

## Fixed gotchas / invariants

- **`storeHash` and the access token never reach the browser.** The storefront only
  ever sends `uniqueStoreId`; the server reverse-maps it (`getStoreByUniqueId`). Don't
  add a route that returns the hash or token to a public caller.
- **Uninstall deletes the script before the store doc.** The store doc holds the
  access token needed to delete the script; reversing the order strands the script
  (auto_uninstall is the backstop, not the primary path). See
  [app/api/uninstall/route.ts](../../app/api/uninstall/route.ts).
- **Storefront token cache** is treated as expired 5 minutes early
  ([lib/dbs/firebase.ts](../../lib/dbs/firebase.ts) `getStorefrontToken`) to avoid
  using a token mid-expiry.
- **`db:setup` is dead** (`scripts/db.js` missing). Don't wire anything to it.
- Server logs to watch: `/api/auth` and `/api/load` print banner lines; script
  install/delete log `created`/`updated`/`deleted`; GraphQL errors log from
  [lib/bigcommerce/graphql.ts](../../lib/bigcommerce/graphql.ts).
