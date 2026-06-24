# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this app is

A **BigCommerce embedded app** by **Codinative** that adds a persistent, fully
customizable **Add to Cart bar** to every storefront product page. It has two
halves that share one config document:

1. **Dashboard** — a no-code visual configurator (Styling · Layout · Behavior tabs
   + a live preview) loaded inside the BigCommerce admin iframe.
2. **Storefront script** — a single self-contained vanilla-JS file injected into the
   merchant's storefront via the BigCommerce **Scripts API**. It renders the bar on
   product pages and wires up variant selection, quantity, and add-to-cart.

Config is stored in **Firestore** keyed by `storeHash`. Everything else (OAuth,
sessions, load/uninstall routes) is the plumbing BigCommerce requires.

## Routing table — read the skill that matches your task

| Task | File |
|---|---|
| Folder layout, data flow, Firestore schema, design decisions | [.claude/skills/architecture.md](.claude/skills/architecture.md) |
| The storefront `sticky-bar.js` — flatten, product detection, render, triggers, add-to-cart | [.claude/skills/storefront-script.md](.claude/skills/storefront-script.md) |
| Run locally, env vars, tunnel for OAuth, build the script, deploy | [.claude/skills/dev-workflow.md](.claude/skills/dev-workflow.md) |
| Bar not appearing, wrong product, iframe/session issues, gotchas | [.claude/skills/debugging.md](.claude/skills/debugging.md) |
| Full config schema (every key, type, default) | [docs/CONFIGURATION.md](docs/CONFIGURATION.md) |
| HTTP API reference (every route) | [docs/API.md](docs/API.md) |
| Merchant-facing manual | [USER-GUIDE.md](USER-GUIDE.md) |

## Architecture (one screen)

```
DASHBOARD (admin iframe, JWT `context` in URL)
  load:  GET  /api/config            → nested StickyBarConfig (Firestore)
  save:  POST /api/config            → setStickyBarConfig + installOrUpdateScript
                                        (flat ⇄ nested via lib/configConverter.ts)

INSTALL  GET /api/auth   → OAuth → setStore/setUser → save default config → install script
LOAD     GET /api/load   → verify signed JWT → refresh session → redirect to dashboard
UNINSTALL GET /api/uninstall → delete script → remove store + user docs

STOREFRONT (sticky-bar.min.js?sid={uniqueStoreId}&app={BASE_URL})
  GET /api/storefront/config?sid=…           → bar config (CORS *, no-cache)
  GET /api/storefront/product?sid=&path=…    → BC GraphQL route(path:) →
                                               { isProductPage, product }
  product page? render bar : do nothing
```

Two config shapes exist and must stay in sync:
- **Flat** `DefaultStickyBarConfig` — what the dashboard state and the storefront
  script use (~100 top-level keys). Defaults: [lib/defaultConfig.ts](lib/defaultConfig.ts).
- **Nested** `StickyBarConfig` — what Firestore stores (`styling`/`layout`/`behavior`).
- Convert with [lib/configConverter.ts](lib/configConverter.ts) (`flattenToNestedConfig`
  / `nestedToFlattenConfig`). The storefront script has its **own copy** of the flatten
  logic (`flattenConfig` in `sticky-bar.js`) — if you change the nested shape, update
  **both**.

## Key files

| File | Role |
|------|------|
| [lib/defaultConfig.ts](lib/defaultConfig.ts) | **Source of truth** for every setting + its default (flat shape) |
| [lib/configConverter.ts](lib/configConverter.ts) | flat ⇄ nested conversion |
| [types/config.ts](types/config.ts) | `DefaultStickyBarConfig` (flat) · `StickyBarConfig` (nested) |
| [lib/auth.ts](lib/auth.ts) | `getBCAuth`/`getBCVerify`, JWT `encode/decodePayload`, `getSession`, session set/remove |
| [lib/dbs/firebase.ts](lib/dbs/firebase.ts) | All Firestore helpers: stores, users, config, `uniqueStoreId`, storefront-token cache |
| [lib/db.ts](lib/db.ts) | Switches on `DB_TYPE` (only `firebase` exists) |
| [lib/bigcommerce/scripts.ts](lib/bigcommerce/scripts.ts) | Scripts API: `installOrUpdateScript`, `deleteStoreScript`, `buildScriptSrc` |
| [lib/bigcommerce/graphql.ts](lib/bigcommerce/graphql.ts) | Storefront token + `fetchProductByPath` (`route(path:)`) + `processGraphQLProduct` |
| [scripts/storefront/sticky-bar.js](scripts/storefront/sticky-bar.js) | The storefront bar (vanilla JS, ~1.5k lines) |
| [scripts/storefront/build.js](scripts/storefront/build.js) | esbuild → `public/sticky-bar.min.js` (IIFE) |
| [app/dashboard/page.tsx](app/dashboard/page.tsx) | Dashboard shell: tabs + live preview + save bar |
| [components/dashboard/](components/dashboard/) | `stylePanel`, `layoutPanel`, `behaviorPanel`, `livePreview`, `statusBar` |

## Commands

```bash
npm run dev               # Turbopack dev server on :3000
npm run build             # production build (run before claiming a change compiles)
npm run build:storefront  # rebuild public/sticky-bar.min.js after editing the storefront script
npm run lint              # ESLint
```

There is no test suite. Validate dashboard changes in the browser; validate storefront
changes via `/preview` (it loads the real `sticky-bar.min.js`) or on a real store.

## Conventions

- TypeScript strict mode; path alias `@/*` → repo root (`@/lib/...`, `@/types/...`).
- API routes are App Router handlers (`export async function GET/POST/DELETE`).
- Storefront-facing routes (`app/api/storefront/*`) are **public + CORS `*`** and
  identify the store only by the opaque `uniqueStoreId` — never the `storeHash` or token.
- Session-gated routes read the JWT from `?context=` via `getSession` ([lib/auth.ts](lib/auth.ts)).
- Match the existing 2/4-space style and the `─── section ───` comment dividers in `lib/`.
- Global rules in `~/.claude/CLAUDE.md` apply (security first, minimal changes, no `git add .`).

## Gotchas (full list in [.claude/skills/debugging.md](.claude/skills/debugging.md))

- **Rebuild after editing the storefront script.** `public/sticky-bar.min.js` is what
  stores load; editing `scripts/storefront/sticky-bar.js` alone changes nothing until
  `npm run build:storefront` runs and the new file is deployed.
- **Two flatten implementations.** `lib/configConverter.ts` (dashboard) and
  `flattenConfig` in `sticky-bar.js` (storefront) must agree. Update both.
- **`.env` holds a Firebase admin private key + the BC client secret** — never print,
  commit, or paste them into external tools. Update `.env.example` when adding a var.
- **HTTPS callbacks required.** In dev use a tunnel (ngrok); keep `BASE_URL` /
  `AUTH_CALLBACK` and the BC app's callback URL all in sync with the tunnel URL.
- **`db:setup` is dead** — `scripts/db.js` does not exist; don't rely on it.
- **The bar shows only on product pages**, decided server-side by the GraphQL
  `route(path:)` lookup in `/api/storefront/product` — not by URL-sniffing in the browser.
