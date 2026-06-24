# Changelog

All notable changes to **Sticky Add to Cart** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and
the project uses [Semantic Versioning](https://semver.org/). Dates are ISO `YYYY-MM-DD`.

---

## [Unreleased]

### Added
- Professional documentation set: rewritten [README.md](README.md), repo quick
  reference [CLAUDE.md](CLAUDE.md), `.claude/skills/` (architecture, storefront-script,
  dev-workflow, debugging), `docs/CONFIGURATION.md`, `docs/API.md`, and `.env.example`.

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
