# Changelog

All notable changes to **Sticky Add to Cart** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and
the project uses [Semantic Versioning](https://semver.org/). Dates are ISO `YYYY-MM-DD`.

---

## [Unreleased]

### Added
- `GET /api/remove_user` callback for "Enable multiple users"; staff users opening
  the app are now recorded so they can be removed.

### Changed
- **Each plan works on your store's default storefront only.** The script is created with `channel_id: 1`
  and `consent_category: functional`; documented in the User Guide (intro, Plan &
  Billing, FAQ) and API reference.
- Re-authorizing the app no longer wipes the store's `uniqueStoreId` (merge on `setStore`).
- [USER-GUIDE.md](USER-GUIDE.md): new Plan & Billing section and trial step; removed the
  retired Auto-Hide setting; documented Redirect on success; corrected live-preview details.
- README / dev-workflow: Stripe env vars and Firebase App Hosting deployment.

### Fixed (QA round)
- **Variant dropdowns** are now a custom list: opens up or down where there is room,
  max-height with scroll, stays inside the viewport (was cut off on mobile). The
  placeholder is no longer a selectable option; optional modifiers get a "None" choice.
  The field keeps a fixed width, so picking a value no longer shifts the controls.
- **Stacked layout** is chosen by measuring whether the single row fits (any width),
  replacing the fixed 940px breakpoint: no uneven wrapping at 941–1170px, one row on
  tablets when it fits. On phones the title gets two lines, dropdowns sit side by side
  and quantity + Add to Cart share one row (bar ~238px → ~161px at 320px).
- **Currency**: prices use the store's currency display settings (symbol, placement,
  separators) instead of a hard-coded `$`.
- **Option order** matches the store's value order (e.g. waist sizes 28, 29, 30…).
- **Stock**: out-of-stock values are marked and disabled; the button reads
  "Out of stock" and is disabled when the product or selected variant can't be bought.
- **Defaults**: variant options start on the merchant's default value, like the theme.
- Missing-option message names the options ("Please select Size, Life stage").
- **Many variants**: in the stacked layout the variants stay on one row that scrolls
  sideways (edge fade shows there is more), so the bar no longer grows with every option.
- **Dashboard** live preview no longer crops at 100–150% browser zoom.

---

## [1.0.0] — 2026-10-13 (first production release)

### Added
- **Stripe billing** — $5/month plan with a 7-day free trial (once per store):
  checkout, Customer Portal, status and webhook routes, dashboard plan card, and a
  `/billing/done` landing page. Promo codes can be applied at checkout.
- **Visibility card** — separate **Show on desktop** / **Show on mobile** switches.
- **Redirect on success** — stay on the page, go to the cart, or go to checkout.
- Live preview and `/preview` now run the real built storefront script in an iframe.
- Content Max Width presets (1140 / 1200 / 1280 / 1400 / 1600).
- Firebase App Hosting deploy config (`apphosting.yaml`, `firebase.json`, `.firebaserc`).
- Professional documentation set: rewritten [README.md](README.md), repo quick
  reference [CLAUDE.md](CLAUDE.md), `.claude/skills/` (architecture, storefront-script,
  dev-workflow, debugging), `docs/CONFIGURATION.md`, `docs/API.md`, and `.env.example`.

### Changed
- The bar is served only while the store's trial or subscription is active
  (`trialing`, `active`, `past_due`).
- Scroll Threshold is now a fallback, used only when the theme's Add to Cart button
  can't be found.

### Removed
- **Enable Sticky Bar** master toggle and Behavior → **Show on Mobile** (replaced by the
  Visibility card).
- **Auto-Hide After Add to Cart**.

### Fixed
- Uninstall now also deletes `stores/{storeHash}/stickyBar/config` and cancels the
  Stripe subscription.

### Security
- `npm audit fix` for production dependencies (0 known vulnerabilities).

---

## [0.1.0] — 2026-02 → 2026-06 (initial build)

First working version of the app: a no-code visual configurator plus the injected
storefront bar. Built incrementally over this window.

### Added
- **OAuth lifecycle** — install (`/api/auth`), load (`/api/load`), and uninstall
  (`/api/uninstall`) flows with signed `context` JWTs and Firestore-backed sessions.
- **Merchant dashboard** — Styling, Layout, and Behavior tabs with a real-time live
  preview and a floating save/discard bar.
- **Storefront sticky bar** (`scripts/storefront/sticky-bar.js`) — dependency-free
  vanilla-JS bar injected via the BigCommerce Scripts API, bundled with esbuild to
  `public/sticky-bar.min.js`. Renders product image, title, price, variant selectors,
  quantity picker, and an Add to Cart button.
- **Server-side product detection** — `/api/storefront/product` resolves the current
  URL with the BigCommerce GraphQL `route(path:)` query, so the bar is theme-agnostic
  and needs no client-side product-ID guessing.
- **Configuration storage** — flat ⇄ nested config conversion
  (`lib/configConverter.ts`) persisted to `stores/{storeHash}/stickyBar/config`;
  default config written on install.
- **Customization** — bar background/gradient, shadow, border, opacity; typography;
  four button styles; image, variant (dropdown / swatch / radio / rectangle list), and
  quantity styling; element reordering and show/hide; position (top/bottom/left/right);
  width, alignment, and spacing controls.
- **Behavior** — scroll / always / delay triggers, entry/exit animations, success
  notification, mobile breakpoint and compact layout, z-index and custom CSS class.
- **Storefront token caching** with a 5-minute expiry buffer to avoid minting a
  Storefront API token on every request.
- **Full-page preview** (`/preview`) that loads the real built script with mocked APIs
  in desktop and mobile frames.
- **Merchant user guide** ([USER-GUIDE.md](USER-GUIDE.md)).

### Security
- Resolved all known dependency vulnerabilities (75 Dependabot / 29 `npm audit`
  advisories → 0); pinned overrides for `jsonwebtoken`, `uuid`, and `postcss`.

[Unreleased]: https://github.com/Codinative/Sticky-Add-to-Cart-App/compare/main...HEAD
