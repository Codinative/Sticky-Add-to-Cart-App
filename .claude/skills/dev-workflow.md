---
meta:
  purpose: "Run locally, env vars, tunnel for OAuth, build the storefront script, deploy"
  triggers: ["run locally", "dev", "env", "environment", "ngrok", "tunnel", "deploy", "vercel", "build", "install app", "oauth setup"]
  last_updated: "2026-06-24"
  critical: false
  tokens: "~650"
---

# Dev workflow

## First run

```bash
npm install
cp .env.example .env          # fill in real values (see below)
npm run build:storefront      # produce public/sticky-bar.min.js
npm run dev                   # http://localhost:3000 (Turbopack)
```

## Environment variables

Full table with descriptions is in [README.md](../../README.md#required-environment)
and the template is [.env.example](../../.env.example). Summary:

| Var | Where it's read | Notes |
|-----|-----------------|-------|
| `CLIENT_ID`, `CLIENT_SECRET`, `AUTH_CALLBACK` | [lib/auth.ts](../../lib/auth.ts) | BC OAuth app; `AUTH_CALLBACK` = `{BASE_URL}/api/auth` |
| `BASE_URL` | [lib/bigcommerce/scripts.ts](../../lib/bigcommerce/scripts.ts), `/api/auth`, `/api/load` | public app origin; also the script `src` origin |
| `JWT_KEY` | [lib/auth.ts](../../lib/auth.ts) | signs the `context` JWT; keep stable across deploys |
| `DB_TYPE` | [lib/db.ts](../../lib/db.ts) | only `firebase`; default if unset |
| `FIRE_ADMIN_PROJECT_ID` / `FIRE_ADMIN_CLIENT_EMAIL` / `FIRE_ADMIN_PRIVATE_KEY` | [lib/dbs/firebase.ts](../../lib/dbs/firebase.ts) | service account; `\n` in the key is unescaped at runtime |
| `API_URL` + `LOGIN_URL` | [lib/auth.ts](../../lib/auth.ts) | optional, **set both** to target a non-prod BC env |

`.env` is gitignored. It holds the Firebase admin private key and the BC client
secret — never print, commit, or paste them anywhere external. Add any new var to
`.env.example` too.

## Installing the app on a store (OAuth needs HTTPS)

BigCommerce only calls HTTPS callbacks, so a local install needs a tunnel:

```bash
ngrok http 3000               # copy the https URL
```

Then, with `{TUNNEL}` = the ngrok https URL:

1. In `.env`, set `BASE_URL={TUNNEL}` and `AUTH_CALLBACK={TUNNEL}/api/auth`.
2. In the BigCommerce dev portal app, set:
   - Auth callback → `{TUNNEL}/api/auth`
   - Load callback → `{TUNNEL}/api/load`
   - Uninstall callback → `{TUNNEL}/api/uninstall`
   - Scopes include **Content / Scripts (read/modify)** and **Products (read)**.
3. Restart `npm run dev` (env changes require a restart).
4. Install the app from the store's control panel → it hits `/api/auth`, stores the
   session, saves the default config, and installs the storefront script.

The CORS allowlist already permits the `ngrok-skip-browser-warning` header on the
storefront routes, so an ngrok-served script can call them.

## Editing the storefront bar

```bash
# edit scripts/storefront/sticky-bar.js
npm run build:storefront      # → public/sticky-bar.min.js
```

Verify on `/preview` (loads the real built file with mocked APIs) before deploying.
Commit the rebuilt `public/sticky-bar.min.js`. See
[storefront-script.md](storefront-script.md).

## Commands

```bash
npm run dev               # dev server (Turbopack)
npm run build             # production build — run before claiming a change compiles
npm run start             # serve the production build
npm run build:storefront  # rebuild the injected storefront script
npm run lint              # ESLint
npx tsc --noEmit          # type check (no test suite exists)
```

`db:setup` in package.json is a dead template script (`scripts/db.js` is absent) —
ignore it. Firestore needs only the service-account credentials.

## Deploy

Deploy to Vercel (or any Node host). Per environment:

- Set every env var; `BASE_URL` and `AUTH_CALLBACK` point at that environment's
  public domain, and the BC app's callback URLs must match.
- Commit a freshly built `public/sticky-bar.min.js` so the deployed origin serves the
  current bar (the injected `src` is `{BASE_URL}/sticky-bar.min.js`).
- `JWT_KEY` must be identical to whatever signed existing merchants' tokens, or their
  dashboards 401 until re-load.
