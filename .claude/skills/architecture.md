---
meta:
  purpose: "Folder structure, data flow, Firestore schema, config shapes, design decisions"
  triggers: ["architecture", "structure", "folder", "schema", "firestore", "data flow", "config shape", "where is", "how does install work"]
  last_updated: "2026-06-24"
  critical: false
  tokens: "~900"
---

# Architecture

BigCommerce embedded app. Merchant installs via the BC App Marketplace → OAuth →
the app loads inside the BC admin iframe, authenticated by a signed `context` JWT
passed in the URL. All state lives in **Firestore**, keyed by `storeHash`. The
product the app actually delivers is a **storefront sticky bar**; everything else
is the plumbing BigCommerce requires.

## Top-level layout

```
app/
  api/                     Route handlers (all server-side). Full reference: docs/API.md
    auth/                  OAuth install: token exchange → setSession → default config → install script
    load/                  App launch: verify signed JWT → refresh session → redirect to dashboard
    uninstall/             Uninstall webhook: delete script → remove store + user docs
    config/                Dashboard config CRUD (session-gated)
    bc-scripts/            Manage the BC Scripts API tag (session-gated)
    products/             /catalog/summary passthrough (session-gated)
    storefront/config/     PUBLIC (CORS *) — bar config by uniqueStoreId
    storefront/product/    PUBLIC (CORS *) — product detection + data by uniqueStoreId + path
  dashboard/               Merchant dashboard (tabs + live preview + save bar)
  preview/                 Full-page preview that loads the real sticky-bar.min.js
  page.tsx                 Redirects to /dashboard?context=…
  layout.tsx               Root layout; wraps SessionProvider
  globals.css              Tailwind v4 + CSS variables

components/
  dashboard/               stylePanel, layoutPanel, behaviorPanel, livePreview, statusBar
  common/                  Reusable UI kit (colorPicker, rangeSlider, toggle, selectField,
                           sectionCard, tabs/tabButton, elementArranger, positionSelector,
                           numberInput, toast, table, icons, header, dropdownWithMenuIcon)

lib/
  defaultConfig.ts         Default bar config (flat) — source of truth for keys + defaults
  configConverter.ts       flattenToNestedConfig / nestedToFlattenConfig
  auth.ts                  node-bigcommerce client, OAuth, JWT context encode/decode, getSession
  db.ts                    Switches on DB_TYPE (only `firebase`)
  dbs/firebase.ts          All Firestore helpers (firebase-admin)
  bigcommerce/scripts.ts   Scripts API: install/update/delete, buildScriptSrc
  bigcommerce/graphql.ts   Storefront token + route(path:) product lookup + processing
  hooks.ts                 useProducts (SWR)

scripts/storefront/
  sticky-bar.js            The storefront bar (vanilla JS source) — see storefront-script.md
  build.js                 esbuild bundle → public/sticky-bar.min.js (IIFE, es2018)

context/session.tsx        React context exposing the `context` JWT from the URL
types/                     auth.ts, config.ts (flat + nested), db.ts, index.ts, node-bigcommerce.d.ts
public/sticky-bar.min.js   Built storefront script that stores actually load
```

## Install / load / uninstall flow

```
INSTALL  GET /api/auth?code=…&context=stores/{hash}
  getBCAuth(query)            exchange code → { access_token, scope, user, context }
  encodePayload(session)      sign { context: storeHash } with JWT_KEY (24h)
  setSession                  setStore (stores/{hash}) + setUser (users/{id})
  if no config yet            save flattenToNestedConfig(defaultStickyBarConfig)
  installOrUpdateScript       create the BC Scripts API tag (non-blocking on failure)
  redirect → {BASE_URL}/?context={jwt}

LOAD     GET /api/load?signed_payload_jwt=…
  getBCVerify                 verify the BC-signed JWT
  setSession + encodePayload  refresh session, mint our context JWT
  redirect → {BASE_URL}/?context={jwt}

UNINSTALL GET /api/uninstall?signed_payload_jwt=…
  getBCVerify
  deleteStoreScript           delete the script BEFORE removing the store doc
                              (the doc holds the accessToken). auto_uninstall is the backstop.
  removeSession               delete store doc + remove store from user (delete user if empty)
```

## Two config shapes (keep them in sync)

The app moves config between two representations:

- **Flat** — `DefaultStickyBarConfig` ([types/config.ts](../../types/config.ts)),
  defaults in [lib/defaultConfig.ts](../../lib/defaultConfig.ts). ~100 top-level
  keys like `barBgColor`, `buttonStyle`, `triggerMode`. Used by the **dashboard
  state** and the **storefront script** at render time.
- **Nested** — `StickyBarConfig`. Grouped under `styling` / `layout` / `behavior`.
  This is what **Firestore stores**.

Conversion lives in [lib/configConverter.ts](../../lib/configConverter.ts):
`flattenToNestedConfig` (save) and `nestedToFlattenConfig` (load, fills gaps from
defaults). The storefront script re-implements the flatten step itself
(`flattenConfig` in `sticky-bar.js`) because it can't import TS — **if you change
the nested shape, change both.** Field-by-field mapping is in
[docs/CONFIGURATION.md](../../docs/CONFIGURATION.md).

## Firestore schema

```
stores/{storeHash}
  accessToken            string   BC API token (server-only, never sent to storefront)
  adminId                number   installing user id
  scope                  string   granted OAuth scopes
  uniqueStoreId          uuid     opaque public id used by the storefront script (?sid=)
  storefrontToken        string   cached BC Storefront API (GraphQL) token
  storefrontTokenExpiry  number   unix ms; treated as expired 5 min early
  stickyBar/config       doc      the nested StickyBarConfig

users/{userId}
  email                  string
  username               string
  stores                 string[] store hashes this admin installed
```

Note the **subcollection**: the config is at `stores/{hash}/stickyBar/config`, not a
field on the store doc. Helpers: `setStickyBarConfig` / `getStickyBarConfig` /
`deleteStickyBarConfig` in [lib/dbs/firebase.ts](../../lib/dbs/firebase.ts).

## Storefront data path (config save → bar on screen)

```
Dashboard save → POST /api/config (nested) → stores/{hash}/stickyBar/config
                                            → installOrUpdateScript (retry/idempotent)

BC injects: {BASE_URL}/sticky-bar.min.js?sid={uniqueStoreId}&app={BASE_URL}
  GET /api/storefront/config?sid=…              getStoreByUniqueId → getStickyBarConfig
  GET /api/storefront/product?sid=&path=…       getStoreByUniqueId → accessToken
       → getOrCreateStorefrontToken (cached)    POST /v3/storefront/api-token
       → fetchProductByPath (GraphQL route())   store-{hash}.mybigcommerce.com/graphql
       → processGraphQLProduct                  { isProductPage, product{variants,prices,options} }
```

## Key design decisions

- **Opaque store id on the storefront.** The script is identified by a random
  `uniqueStoreId` (UUID), reverse-looked-up via `getStoreByUniqueId`. The `storeHash`
  and access token never reach the browser. That's why `app/api/storefront/*` are the
  only public, CORS-`*` routes.
- **Server-side product detection.** Instead of guessing product pages/IDs from theme
  markup, `/api/storefront/product` resolves the current path with the GraphQL
  `route(path:)` query. If the resolved node isn't a `Product`, the bar does nothing.
  This is theme-agnostic.
- **Single store doc + one config subdoc** per merchant — no separate collections per
  feature. New settings are just new keys in the nested config.
- **JWT `context` is the only dashboard auth.** Decoded by `decodePayload` in
  [lib/auth.ts](../../lib/auth.ts); the `storeHash` is inside. Session-gated routes call
  `getSession(req)`.
- **Storefront token caching** with a 5-minute safety buffer avoids minting a Storefront
  API token on every storefront request.
- **Non-blocking script install** at OAuth time; the dashboard save retries it, so a
  transient Scripts-API failure on install self-heals on first save.
- **No test suite** — verify in the browser / on `/preview`. Don't add tests unless asked.
