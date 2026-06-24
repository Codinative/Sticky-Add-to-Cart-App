# API Reference

All endpoints are Next.js App Router route handlers under
[app/api/](../app/api/). There are three groups:

- **OAuth lifecycle** — called by BigCommerce (install / load / uninstall).
- **Dashboard (session-gated)** — called by the embedded admin UI; authenticated by
  the `context` JWT in the query string.
- **Storefront (public, CORS `*`)** — called by the injected `sticky-bar.min.js`;
  authenticated only by the opaque `uniqueStoreId` (`sid`).

Authentication primitives live in [lib/auth.ts](../lib/auth.ts). Session-gated routes
call `getSession(req)`, which reads `?context=`, verifies it with `JWT_KEY`, and
returns `{ accessToken, storeHash }` (or `null` → `401`).

---

## OAuth lifecycle

### `GET /api/auth` — install

Called by BigCommerce after the merchant authorizes the app.

- **Query**: `code`, `scope`, `context` (`stores/{hash}`), `user` (BC OAuth params).
- **Does**: `getBCAuth` exchanges the code for an access token → `setSession` (writes
  `stores/{hash}` + `users/{id}`) → writes the default config if none exists →
  `installOrUpdateScript` (non-blocking) → signs a `context` JWT.
- **Response**: `302` redirect to `{BASE_URL}/?context={jwt}`.
- Source: [app/api/auth/route.ts](../app/api/auth/route.ts).

### `GET /api/load` — launch

Called when the merchant opens the app inside the BC admin.

- **Query**: `signed_payload_jwt`.
- **Does**: `getBCVerify` validates the BC-signed JWT → `setSession` → mints our
  `context` JWT.
- **Response**: `302` redirect to `{BASE_URL}/?context={jwt}`.
- Source: [app/api/load/route.ts](../app/api/load/route.ts).

### `GET /api/uninstall` — uninstall webhook

- **Query**: `signed_payload_jwt`.
- **Does**: `getBCVerify` → fetch the store's access token → `deleteStoreScript`
  (**before** removing the store doc) → `removeSession` (delete store doc; remove store
  from the user, deleting the user if it has no stores left).
- **Response**: `200 {}`.
- Source: [app/api/uninstall/route.ts](../app/api/uninstall/route.ts).

---

## Dashboard (session-gated)

All require `?context={jwt}`; without a valid session they return
`401 { "message": "Session not found" }`.

### `/api/config` — bar configuration

Source: [app/api/config/route.ts](../app/api/config/route.ts).

| Method | Body | Response |
|--------|------|----------|
| `GET` | — | `200 { "data": StickyBarConfig \| null }` (nested form) |
| `POST` | `{ "data": StickyBarConfig }` | `200 { "message": "Config saved successfully" }`; `404` if `data` missing |
| `DELETE` | — | `200 { "message": "Config deleted ..." }` |

`POST` writes `stores/{hash}/stickyBar/config`. The dashboard converts its flat state
to nested with `flattenToNestedConfig` before sending.

### `/api/bc-scripts` — storefront script management

Source: [app/api/bc-scripts/route.ts](../app/api/bc-scripts/route.ts).

| Method | Does | Response |
|--------|------|----------|
| `GET` | `findExistingScript` | `200 { "installed": boolean, "script": object \| null }` |
| `POST` | `installOrUpdateScript` | `201` (created) or `200` (updated) `{ "message": "Script created/updated successfully" }` |
| `DELETE` | `deleteStoreScript` | `200 { "message": "Script removed successfully" }` |

The script's BC config: name `"Sticky Add to Cart Bar"`, `location: footer`,
`load_method: defer`, `visibility: storefront`, `auto_uninstall: true`, `kind: src`,
`src = {BASE_URL}/sticky-bar.min.js?sid={uniqueStoreId}&app={BASE_URL}`.

### `GET /api/products` — catalog summary

- **Does**: BC v3 `GET /catalog/summary` via the authenticated client.
- **Response**: `200 { "data": { inventory_count, variant_count, … } }`.
- Source: [app/api/products/route.ts](../app/api/products/route.ts). Surfaced in the
  dashboard via `useProducts` (SWR) in [lib/hooks.ts](../lib/hooks.ts).

---

## Storefront (public · CORS `*`)

Called by the injected script. Identified only by `sid` (the `uniqueStoreId`), which
the server reverse-maps with `getStoreByUniqueId`. The `storeHash` and access token
are **never** returned. Both support `OPTIONS` (preflight, `204`) and allow the
`ngrok-skip-browser-warning` header.

### `GET /api/storefront/config`

- **Query**: `sid` (required).
- **Response**: `200 { "config": StickyBarConfig }` with
  `Cache-Control: no-cache, no-store, must-revalidate` (so saved changes show on the
  next load). `400` missing `sid`; `404` store or config not found.
- Source: [app/api/storefront/config/route.ts](../app/api/storefront/config/route.ts).

### `GET /api/storefront/product`

Server-side product-page detection + product data, so the script needs no theme
knowledge.

- **Query**: `sid`, `path` (the storefront URL path, e.g. `/shoes/red-runner/`).
- **Does**: resolve `sid` → store → `getOrCreateStorefrontToken` (cached BC Storefront
  API token) → `fetchProductByPath` runs the GraphQL `route(path:)` query against
  `store-{hash}.mybigcommerce.com/graphql`.
- **Response**:
  - Not a product page: `200 { "isProductPage": false, "product": null }`
    (`Cache-Control: public, max-age=300, stale-while-revalidate=600`).
  - Product page: `200 { "isProductPage": true, "product": ProcessedProduct }`
    (`max-age=60, stale-while-revalidate=300`).
  - `400` missing params; `404` store not found; `500` on GraphQL error.
- Source: [app/api/storefront/product/route.ts](../app/api/storefront/product/route.ts),
  [lib/bigcommerce/graphql.ts](../lib/bigcommerce/graphql.ts).

`ProcessedProduct` (see `graphql.ts`):

```jsonc
{
  "entityId": 123,
  "name": "Red Runner",
  "image": { "url": "https://…", "alt": "Red Runner" },
  "prices": { "price": 89.0, "salePrice": 89.0, "basePrice": 99.0, "currencyCode": "USD" },
  "variants": [
    { "variantKey": "Size:M,Color:Red,", "price": 89.0, "optionsIds": { "M": 222, "Red": 333 } }
  ],
  "variantLabels": { "Size": ["S", "M", "L"], "Color": ["Red", "Blue"] },
  "options": [ { "id": 12, "name": "Size", "isVariantOption": true } ]
}
```

The script uses `variantKey` to match the shopper's selection and builds the
add-to-cart URL `/cart.php?action=add&product_id={entityId}&attribute[{optionId}]={valueEntityId}…&qty={n}`
from `options` + the matched variant's `optionsIds`.

---

## Conventions

- Errors return `{ "message": string }` with the upstream status or `500`.
- Session-gated routes are same-origin (admin iframe) and are **not** CORS-open.
- `OPTIONS` is implemented only on the storefront routes.
- Request lifecycle end to end is diagrammed in
  [.claude/skills/architecture.md](../.claude/skills/architecture.md).
