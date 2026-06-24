# Sticky Add to Cart — BigCommerce App

> Embedded BigCommerce app by **Codinative** that adds a persistent, fully
> customizable **Add to Cart** bar to every product page. App: `sticky.codinative.com` ·
> Marketing site: [sticky-add-to-cart.codinative.com](https://sticky-add-to-cart.codinative.com/).

As a shopper scrolls a product page, the original Add to Cart button eventually
scrolls out of view. This app keeps a configurable bar — product image, title,
price, variant selectors, quantity picker, and an Add to Cart button — pinned to
the edge of the viewport, so the purchase action is always one click away.

Merchants design the bar in a no-code visual dashboard (colors, gradients, fonts,
button styles, layout, triggers, animations) with a real-time live preview. On
save, the app injects a single self-contained script into the storefront via the
BigCommerce **Scripts API** — no theme edits required. The script detects product
pages server-side through the BigCommerce **GraphQL Storefront API**, so it works
across themes without client-side product-ID guessing.

## Documentation

| Audience | Document |
|----------|----------|
| **Merchants** — every setting, screen, and FAQ | [USER-GUIDE.md](USER-GUIDE.md) |
| **Developers** — config object schema (every key, type, default) | [docs/CONFIGURATION.md](docs/CONFIGURATION.md) |
| **Developers** — HTTP API reference (all routes) | [docs/API.md](docs/API.md) |
| **Claude Code / contributors** — repo quick reference | [CLAUDE.md](CLAUDE.md) and [.claude/skills/](.claude/skills/) |
| **Release history** | [CHANGELOG.md](CHANGELOG.md) |

Public merchant-facing pages (also linked from the in-app Help menu):

| Page | Link |
|------|------|
| Marketing home | https://sticky-add-to-cart.codinative.com/ |
| Documentation home | https://sticky-add-to-cart.codinative.com/docs |
| Installation guide | https://sticky-add-to-cart.codinative.com/docs/installation |
| User guide | https://sticky-add-to-cart.codinative.com/docs/user-guide |

The marketing site lives in a separate project (`Sticky-Add-to-Cart-Website`).

## How it works

The app has two halves: the **dashboard** the merchant configures, and the
**storefront script** that renders the bar for shoppers. They share one config
document, stored in Firestore.

```
┌─ MERCHANT (BigCommerce admin iframe) ──────────────────────────────┐
│  Dashboard (Styling · Layout · Behavior + Live Preview)            │
│        │ Save                                                      │
│        ▼                                                           │
│  POST /api/config ──► Firestore stores/{hash}/stickyBar/config     │
│        │ (also installs/updates the storefront script)            │
└────────┼──────────────────────────────────────────────────────────┘
         │ BigCommerce Scripts API injects:
         │   {BASE_URL}/sticky-bar.min.js?sid={uniqueStoreId}&app={BASE_URL}
         ▼
┌─ STOREFRONT (shopper's browser) ───────────────────────────────────┐
│  sticky-bar.min.js (vanilla JS, zero deps)                        │
│    1. GET /api/storefront/config?sid=…    → bar styling/behavior   │
│    2. GET /api/storefront/product?sid=&path=…                      │
│         └─ server resolves the URL via BC GraphQL Storefront API   │
│            → { isProductPage, product { variants, prices, … } }    │
│    3. product page? → render the bar, wire variants/qty/add-to-cart│
│       not a product page? → do nothing                            │
└────────────────────────────────────────────────────────────────────┘
```

The storefront never sees the merchant's `storeHash` or access token. It is
identified only by an opaque `uniqueStoreId` (a UUID), which the server maps back
to a store. See [docs/API.md](docs/API.md) for the full request lifecycle.

## Tech stack

- **Next.js 15** (App Router, Turbopack) · **React 19** · **TypeScript 5**
- **Firebase Firestore** (`firebase-admin`) — store sessions + bar config
- **node-bigcommerce** — OAuth + v3 REST; raw `fetch` for the Scripts API and the GraphQL Storefront API
- **jsonwebtoken** — signed `context` tokens for the embedded iframe
- **Tailwind CSS v4** + **styled-components** · **@headlessui/react** · **SWR**
- **esbuild** — bundles/minifies the storefront script to a single IIFE

## Project layout

| Path | Purpose |
|------|---------|
| [app/dashboard/page.tsx](app/dashboard/page.tsx) | Merchant dashboard — three config tabs + live preview + save bar |
| [app/preview/page.tsx](app/preview/page.tsx) | Full-page preview (desktop/mobile) that loads the real storefront script |
| [components/dashboard/](components/dashboard/) | `stylePanel`, `layoutPanel`, `behaviorPanel`, `livePreview`, `statusBar` |
| [components/common/](components/common/) | Reusable UI kit (color picker, sliders, toggles, section cards, element arranger, icons…) |
| [lib/defaultConfig.ts](lib/defaultConfig.ts) | Default bar configuration (source of truth for every setting + default) |
| [lib/configConverter.ts](lib/configConverter.ts) | Converts between the flat dashboard config and the nested Firestore config |
| [lib/auth.ts](lib/auth.ts) | OAuth (`getBCAuth`/`getBCVerify`), JWT context encode/decode, session helpers |
| [lib/db.ts](lib/db.ts) · [lib/dbs/firebase.ts](lib/dbs/firebase.ts) | Firestore data layer (stores, users, config, storefront-token cache) |
| [lib/bigcommerce/scripts.ts](lib/bigcommerce/scripts.ts) | Install / update / delete the storefront script via the BC Scripts API |
| [lib/bigcommerce/graphql.ts](lib/bigcommerce/graphql.ts) | Storefront API token + `route(path:)` product lookup |
| [app/api/](app/api/) | Route handlers — see [docs/API.md](docs/API.md) |
| [scripts/storefront/sticky-bar.js](scripts/storefront/sticky-bar.js) | The storefront bar (vanilla JS source) |
| [scripts/storefront/build.js](scripts/storefront/build.js) | esbuild bundle → `public/sticky-bar.min.js` |
| [types/config.ts](types/config.ts) | `DefaultStickyBarConfig` (flat) and `StickyBarConfig` (nested) |
| [docs/](docs/) | Configuration schema + API reference |

## Getting started

```bash
npm install
cp .env.example .env          # then fill in real values (see below)
npm run build:storefront      # bundle scripts/storefront → public/sticky-bar.min.js
npm run dev                   # http://localhost:3000 (Turbopack)
```

BigCommerce requires **HTTPS** callback URLs, so for local OAuth testing expose the
dev server with a tunnel and point the app's callbacks at it:

```bash
ngrok http 3000               # use the https URL for BASE_URL / AUTH_CALLBACK
```

Then set the matching OAuth callback URL (`{tunnel}/api/auth`) in the BigCommerce
developer portal, and open the app from your store's **Apps** list.

### Required environment

Copy [.env.example](.env.example) and fill it in. All variables:

| Variable | Required | Purpose |
|----------|----------|---------|
| `CLIENT_ID` | yes | BigCommerce app OAuth client ID |
| `CLIENT_SECRET` | yes | BigCommerce app OAuth client secret |
| `AUTH_CALLBACK` | yes | OAuth callback URL — `{BASE_URL}/api/auth` |
| `BASE_URL` | yes | Public URL of the deployed app; also the origin of the injected script `src` |
| `JWT_KEY` | yes | Secret used to sign/verify the embedded-app `context` token (use a long random string) |
| `DB_TYPE` | no | Database backend selector; only `firebase` is implemented (the default) |
| `FIRE_ADMIN_PROJECT_ID` | yes | Firebase service-account project ID |
| `FIRE_ADMIN_CLIENT_EMAIL` | yes | Firebase service-account client email |
| `FIRE_ADMIN_PRIVATE_KEY` | yes | Firebase service-account private key (`\n` newlines are unescaped at runtime) |
| `API_URL` | no | Override the BigCommerce API base (used **only** with `LOGIN_URL`, for non-prod BC environments) |
| `LOGIN_URL` | no | Override the BigCommerce login base (used **only** with `API_URL`) |

> `.env` is gitignored. Never commit real secrets — `FIRE_ADMIN_PRIVATE_KEY` and
> `CLIENT_SECRET` in particular. Use `.env.example` as the template.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) on :3000 |
| `npm run build` | Production Next.js build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run build:storefront` | Bundle + minify `scripts/storefront/sticky-bar.js` → `public/sticky-bar.min.js` |

> **Run `build:storefront` whenever you edit the storefront script.** The committed
> `public/sticky-bar.min.js` is what merchants' storefronts actually load — editing
> the source alone changes nothing until it is rebuilt.
>
> The `db:setup` entry in `package.json` is a template leftover (`scripts/db.js`
> does not exist); Firestore needs no setup step beyond service-account credentials.

## Deployment

Deploy to Vercel (or any Node host). On each environment set every variable from the
table above; `BASE_URL` and `AUTH_CALLBACK` must point at that environment's public
domain, and the BigCommerce app's OAuth callback must match `AUTH_CALLBACK`. Because
the injected script's `src` is built from `BASE_URL`, a misconfigured `BASE_URL`
means storefronts load the script from the wrong origin. Commit a freshly built
`public/sticky-bar.min.js` so the deployed origin serves the current bar.

## License

Proprietary — © Codinative. All rights reserved.

---

**Built for BigCommerce by [Codinative](https://codinative.com).** Questions: [info@codinative.com](mailto:info@codinative.com).
