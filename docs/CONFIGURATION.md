# Configuration Reference

Every setting that drives the sticky bar, with its type, default, and where it lives
in each of the two config representations. This is the developer-facing companion to
the merchant-facing [USER-GUIDE.md](../USER-GUIDE.md).

## The two shapes

The same configuration exists in two forms:

| | Flat (`DefaultStickyBarConfig`) | Nested (`StickyBarConfig`) |
|---|---|---|
| Defined in | [types/config.ts](../types/config.ts) | [types/config.ts](../types/config.ts) |
| Defaults | [lib/defaultConfig.ts](../lib/defaultConfig.ts) | — (derived) |
| Used by | Dashboard state, storefront script render | Firestore storage |
| Shape | ~100 flat keys (`barBgColor`, `buttonStyle`, …) | grouped under `styling` / `layout` / `behavior` |

Conversion is [lib/configConverter.ts](../lib/configConverter.ts):
`flattenToNestedConfig` (on save) and `nestedToFlattenConfig` (on load, backfilling
missing keys from defaults). The storefront script re-implements the flatten in plain
JS (`flattenConfig` in `sticky-bar.js`). **Changing the nested shape means editing
both converters.**

Stored at Firestore path `stores/{storeHash}/stickyBar/config` (the nested form).

---

## Styling

### Bar appearance → `styling.barAppearance`

| Flat key | Nested key | Type | Default | Notes |
|----------|-----------|------|---------|-------|
| `barBgColor` | `background` | hex | `#FFFFFF` | Solid background (ignored when gradient is on) |
| `barGradientEnabled` | `gradientEnabled` | boolean | `false` | Toggles gradient background |
| `barGradientFrom` | `gradientFrom` | hex | `#FFFFFF` | Gradient start |
| `barGradientTo` | `gradientTo` | hex | `#F3F4F6` | Gradient end |
| `barGradientDirection` | `gradientDirection` | `horizontal` \| `vertical` \| `diagonal` | `horizontal` | |
| `barBorderRadius` | `borderRadius` | number px | `0` | 0–30 |
| `barPadding` | `padding` | number px | `12` | 4–32 |
| `barShadow` | `shadow` | `none` \| `sm` \| `md` \| `lg` \| `xl` | `lg` | Maps to `SHADOW_MAP` in the script |
| `barBorderColor` | `borderColor` | hex | `#E5E7EB` | Shown only when width > 0 |
| `barBorderWidth` | `borderWidth` | number px | `0` | 0–5 |
| `barOpacity` | `opacity` | number % | `100` | 20–100 |

### Typography → `styling.typography`

| Flat key | Nested key | Type | Default | Notes |
|----------|-----------|------|---------|-------|
| `titleColor` | `titleColor` | hex | `#1F2937` | Product title |
| `titleFontWeight` | `titleFontWeight` | `300`–`800` | `600` | |
| `priceColor` | `priceColor` | hex | `#1F2937` | Selling price |
| `priceFontWeight` | `priceFontWeight` | `400`–`800` | `700` | |
| `discountedPriceColor` | `discountedPriceColor` | hex | `#9CA3AF` | Compare-at price |
| `comparePriceStyle` | `comparePriceStyle` | `strikethrough` \| `badge` | `strikethrough` | Badge shows `-N%` |
| `fontFamily` | `fontFamily` | string | `inherit` | `inherit` = store theme font; or a preset family |
| `fontSize` | `fontSize` | number px | `14` | 11–20 |
| `titleLetterSpacing` | `titleLetterSpacing` | number px | `0` | -1–5 |
| `textTransform` | `textTransform` | `none` \| `uppercase` \| `lowercase` \| `capitalize` | `none` | |

### Button → `styling.buttonStyling`

| Flat key | Nested key | Type | Default | Notes |
|----------|-----------|------|---------|-------|
| `buttonBgColor` | `background` | hex | `#2563EB` | |
| `buttonTextColor` | `textColor` | hex | `#FFFFFF` | |
| `buttonHoverBgColor` | `hoverBackground` | hex | `#1D4ED8` | |
| `buttonBorderRadius` | `borderRadius` | number px | `8` | 0–30 |
| `buttonStyle` | `style` | `filled` \| `outline` \| `pill` \| `ghost` | `filled` | |
| `buttonBorderColor` | `borderColor` | hex | `#2563EB` | Outline/ghost |
| `buttonBorderWidth` | `borderWidth` | number px | `2` | |
| `buttonCustomText` | `customText` | string | `Add to Cart` | Button label |
| `buttonShowIcon` | `showIcon` | boolean | `true` | Cart icon |
| `buttonShadow` | `shadow` | `none` \| `sm` \| `md` \| `lg` | `none` | `BTN_SHADOW_MAP` |
| `buttonFontWeight` | `fontWeight` | `400`–`700` | `600` | |
| `buttonPaddingX` | `paddingX` | number px | `24` | |
| `buttonPaddingY` | `paddingY` | number px | `10` | |

### Image → `styling.imageStyling`

| Flat key | Nested key | Type | Default | Notes |
|----------|-----------|------|---------|-------|
| `imageSize` | `size` | number px | `56` | 24–80 |
| `imageBorderRadius` | `borderRadius` | number px | `8` | 0–20 |
| `imageBorderColor` | `borderColor` | hex | `#E5E7EB` | Shown when width > 0 |
| `imageBorderWidth` | `borderWidth` | number px | `0` | 0–4 |

### Variant selector → `styling.variantStyling`

| Flat key | Nested key | Type | Default | Notes |
|----------|-----------|------|---------|-------|
| `variantOptions` | `options` | `VariantOptionConfig[]` | `[{Size, rectangleList}, {Color, swatch}]` | Per-option display type; see below |
| `variantShowLabels` | `showLabels` | boolean | `true` | Show `Size:` / `Color:` labels |
| `variantActiveColor` | `activeColor` | hex | `#2563EB` | Selected value highlight |
| `variantBorderColor` | `borderColor` | hex | `#E5E7EB` | |
| `variantTextColor` | `textColor` | hex | `#6B7280` | |
| `variantBorderRadius` | `borderRadius` | number px | `6` | 0–16 |

`VariantOptionConfig` = `{ name: string; displayType: "dropdown" | "swatch" |
"radioButtons" | "rectangleList" }`. The storefront matches `name` against the BC
option display name **case-insensitively**; unconfigured options default to
`dropdown`.

### Quantity → `styling.quantityStyling`

| Flat key | Nested key | Type | Default | Notes |
|----------|-----------|------|---------|-------|
| `quantityStyle` | `style` | `plusMinus` \| `dropdown` \| `input` | `plusMinus` | |
| `quantityTextColor` | `textColor` | hex | `#374151` | |
| `quantityBgColor` | `bgColor` | hex | `#FFFFFF` | |
| `quantityButtonColor` | `buttonColor` | hex | `#9CA3AF` | `+` / `−` icon color |
| `quantityBorderColor` | `borderColor` | hex | `#E5E7EB` | |
| `quantityBorderRadius` | `borderRadius` | number px | `8` | 0–16 |

---

## Layout

### Element arrangement → `layout.elementArrangement.elements`

| Flat key | Type | Default |
|----------|------|---------|
| `elements` | `Element[]` | image, title, price (group `left`); variants, quantity, button (group `right`) — all visible |

`Element` = `{ id, label, visible: boolean, group: "left" | "right" }`. `id` is one of
`image` / `title` / `price` / `variants` / `quantity` / `button`. Order in the array
is render order within each group.

### Position → `layout.position.position`

| Flat key | Type | Default | Notes |
|----------|------|---------|-------|
| `position` | `top` \| `bottom` \| `left` \| `right` | `bottom` | Where the bar is fixed |

### Width & alignment → `layout.barWidth`

| Flat key | Nested key | Type | Default | Notes |
|----------|-----------|------|---------|-------|
| `barWidthMode` | `mode` | `full` \| `contained` | `full` | |
| `barMaxWidth` | `maxWidth` | number px | `1200` | Used when `contained`; 600–1800 |
| `contentMaxWidth` | `contentMaxWidth` | number px | `0` | Inner content cap; 0 = no limit |
| `contentAlignment` | `contentAlignment` | `start`\|`center`\|`end`\|`spaceBetween`\|`spaceAround`\|`spaceEvenly` | `spaceBetween` | Horizontal distribution |
| `verticalAlignment` | `verticalAlignment` | `top` \| `center` \| `bottom` | `center` | |

### Spacing → `layout.spacing`

| Flat key | Nested key | Type | Default | Notes |
|----------|-----------|------|---------|-------|
| `elementGap` | `elementGap` | number px | `12` | Gap within a group |
| `groupGap` | `groupGap` | number px | `32` | Gap between left and right groups |
| `barOffset` | `barOffset` | number px | `0` | Distance from the viewport edge; 0–50 |

---

## Behavior

### Display → `behavior.display`

| Flat key | Nested key | Type | Default | Notes |
|----------|-----------|------|---------|-------|
| `enabled` | `enabled` | boolean | `true` | Master on/off |
| `triggerMode` | `triggerMode` | `scroll` \| `always` \| `delay` | `scroll` | |
| `triggerDelay` | `triggerDelay` | number sec | `3` | Used when `delay`; 0–30 |
| `scrollThreshold` | `scrollThreshold` | number % | `50` | Used when `scroll`; 10–100 |

### Animation → `behavior.animation`

| Flat key | Nested key | Type | Default | Notes |
|----------|-----------|------|---------|-------|
| `animation` | `type` | `slide` \| `fade` \| `bounce` \| `none` | `slide` | Entry |
| `animationDuration` | `duration` | number ms | `300` | 100–1000 |
| `exitAnimation` | `exitType` | `slide` \| `fade` \| `none` | `slide` | Exit |

### Cart → `behavior.cartBehavior`

| Flat key | Nested key | Type | Default | Notes |
|----------|-----------|------|---------|-------|
| `cartAction` | `action` | string | `stayOnPage` | Post-add behavior |
| `showSuccessNotification` | `showSuccessNotification` | boolean | `true` | |
| `successMessage` | `successMessage` | string | `Added to cart successfully!` | |

### Mobile → `behavior.mobile`

| Flat key | Nested key | Type | Default | Notes |
|----------|-----------|------|---------|-------|
| `showOnMobile` | `enabled` | boolean | `true` | |
| `mobileCompact` | `compactMode` | boolean | `true` | Smaller layout under the breakpoint |
| `mobileBreakpoint` | `breakpoint` | number px | `768` | `isMobile()` = `innerWidth ≤ breakpoint`; 320–1024 |

### Advanced → `behavior.advanced`

| Flat key | Nested key | Type | Default | Notes |
|----------|-----------|------|---------|-------|
| `zIndex` | `zIndex` | number | `9999` | Raise above chat/cookie widgets |
| `customCssClass` | `customCssClass` | string | `""` | Extra class(es) on the bar element |

---

## Notes for editors

- The **canonical default object** is [lib/defaultConfig.ts](../lib/defaultConfig.ts).
  When you add a setting, add it there, to both interfaces in
  [types/config.ts](../types/config.ts), to both directions of
  [lib/configConverter.ts](../lib/configConverter.ts), to the storefront
  `flattenConfig` + render code in
  [scripts/storefront/sticky-bar.js](../scripts/storefront/sticky-bar.js), and to the
  relevant dashboard panel under [components/dashboard/](../components/dashboard/).
- A new store gets this default config written on install (`/api/auth`), so the bar
  works before the merchant touches anything.
