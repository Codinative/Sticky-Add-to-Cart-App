/**
 * Sticky Add to Cart Bar - Storefront Script
 * Injected into BigCommerce merchant storefronts via the Scripts API.
 * Renders a configurable sticky bar on product pages with variant selection and add-to-cart.
 */
(function () {
  "use strict";

  // ─── Script URL Parameters ────────────────────────────────────
  var SCRIPT_TAG = document.currentScript;
  var STORE_ID = null;
  var APP_URL = null;

  if (SCRIPT_TAG && SCRIPT_TAG.src) {
    try {
      var scriptUrl = new URL(SCRIPT_TAG.src);
      STORE_ID = scriptUrl.searchParams.get("sid");
      APP_URL = scriptUrl.searchParams.get("app");
    } catch (e) {
      // fallback: try data attributes
      STORE_ID = SCRIPT_TAG.getAttribute("data-store-id");
      APP_URL = SCRIPT_TAG.getAttribute("data-app-url");
    }
  }

  if (!STORE_ID || !APP_URL) return;

  // ─── Constants ─────────────────────────────────────────────────
  var BAR_ID = "satc-bar";
  var STYLE_ID = "satc-styles";
  var NOTIFICATION_ID = "satc-notification";

  var SHADOW_MAP = {
    none: "none",
    sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
    md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
    lg: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
    xl: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
  };

  var BTN_SHADOW_MAP = {
    none: "none",
    sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
    md: "0 4px 6px -1px rgba(0,0,0,0.1)",
    lg: "0 10px 15px -3px rgba(0,0,0,0.1)",
  };

  // ─── State ─────────────────────────────────────────────────────
  var config = null;       // Flattened config
  var product = null;      // Processed product data from API
  var selectedVariants = {};
  var currentPrice = null;
  var quantity = 1;
  var barVisible = false;

  var hideBarTimer = null; // tracks pending visibility:hidden timeout to prevent race conditions
  var _bodyPaddingProp = null;     // "paddingBottom" or "paddingTop"
  var _bodyPaddingOriginal = null; // original computed value (px) before we touched it

  // ─── Config Flattening (nested API format → flat format) ───────
  // Mirrors the dashboard's nestedToFlattenConfig function

  function flattenConfig(nested) {
    var s = nested.styling || {};
    var l = nested.layout || {};
    var b = nested.behavior || {};
    var ba = s.barAppearance || {};
    var ty = s.typography || {};
    var bs = s.buttonStyling || {};
    var is = s.imageStyling || {};
    var vs = s.variantStyling || {};
    var qs = s.quantityStyling || {};
    var ea = l.elementArrangement || {};
    var po = l.position || {};
    var bw = l.barWidth || {};
    var sp = l.spacing || {};
    var di = b.display || {};
    var an = b.animation || {};
    var cb = b.cartBehavior || {};
    var mo = b.mobile || {};
    var ad = b.advanced || {};

    return {
      enabled: di.enabled !== undefined ? di.enabled : true,
      barBgColor: ba.background || "#FFFFFF",
      barGradientEnabled: ba.gradientEnabled || false,
      barGradientFrom: ba.gradientFrom || "#FFFFFF",
      barGradientTo: ba.gradientTo || "#F3F4F6",
      barGradientDirection: ba.gradientDirection || "horizontal",
      barBorderRadius: ba.borderRadius || 0,
      barPadding: ba.padding !== undefined ? ba.padding : 12,
      barShadow: ba.shadow || "lg",
      barBorderColor: ba.borderColor || "#E5E7EB",
      barBorderWidth: ba.borderWidth || 0,
      barOpacity: ba.opacity !== undefined ? ba.opacity : 100,
      titleColor: ty.titleColor || "#1F2937",
      titleFontWeight: ty.titleFontWeight || "600",
      priceColor: ty.priceColor || "#1F2937",
      priceFontWeight: ty.priceFontWeight || "700",
      discountedPriceColor: ty.discountedPriceColor || "#9CA3AF",
      comparePriceStyle: ty.comparePriceStyle || "strikethrough",
      fontFamily: ty.fontFamily || "inherit",
      fontSize: ty.fontSize || 14,
      titleLetterSpacing: ty.titleLetterSpacing || 0,
      textTransform: ty.textTransform || "none",
      buttonBgColor: bs.background || "#2563EB",
      buttonTextColor: bs.textColor || "#FFFFFF",
      buttonHoverBgColor: bs.hoverBackground || "#1D4ED8",
      buttonBorderRadius: bs.borderRadius !== undefined ? bs.borderRadius : 8,
      buttonStyle: bs.style || "filled",
      buttonBorderColor: bs.borderColor || "#2563EB",
      buttonBorderWidth: bs.borderWidth !== undefined ? bs.borderWidth : 2,
      buttonCustomText: bs.customText || "Add to Cart",
      buttonShowIcon: bs.showIcon !== undefined ? bs.showIcon : true,
      buttonShadow: bs.shadow || "none",
      buttonFontWeight: bs.fontWeight || "600",
      buttonPaddingX: bs.paddingX !== undefined ? bs.paddingX : 24,
      buttonPaddingY: bs.paddingY !== undefined ? bs.paddingY : 10,
      imageSize: is.size || 56,
      imageBorderRadius: is.borderRadius !== undefined ? is.borderRadius : 8,
      imageBorderColor: is.borderColor || "#E5E7EB",
      imageBorderWidth: is.borderWidth || 0,
      variantOptions: vs.options || [
        { name: "Size", displayType: "dropdown" },
        { name: "Color", displayType: "dropdown" },
      ],
      variantShowLabels: vs.showLabels !== undefined ? vs.showLabels : true,
      variantActiveColor: vs.activeColor || "#2563EB",
      variantBorderColor: vs.borderColor || "#E5E7EB",
      variantTextColor: vs.textColor || "#6B7280",
      variantBorderRadius: vs.borderRadius !== undefined ? vs.borderRadius : 6,
      quantityStyle: qs.style || "plusMinus",
      quantityBorderColor: qs.borderColor || "#E5E7EB",
      quantityBorderRadius: qs.borderRadius !== undefined ? qs.borderRadius : 8,
      quantityTextColor: qs.textColor || "#374151",
      quantityBgColor: qs.bgColor || "#FFFFFF",
      quantityButtonColor: qs.buttonColor || "#9CA3AF",
      position: po.position || "bottom",
      elements: ea.elements || [
        { id: "image", label: "Product Image", visible: true },
        { id: "title", label: "Product Title", visible: true },
        { id: "price", label: "Price", visible: true },
        { id: "variants", label: "Variant Selector", visible: true },
        { id: "quantity", label: "Quantity Picker", visible: true },
        { id: "button", label: "Add to Cart Button", visible: true },
      ],
      elementGap: sp.elementGap !== undefined ? sp.elementGap : 12,
      groupGap: sp.groupGap !== undefined ? sp.groupGap : 32,
      barOffset: sp.barOffset || 0,
      barWidthMode: bw.mode || "full",
      barMaxWidth: bw.maxWidth || 1200,
      contentMaxWidth: bw.contentMaxWidth !== undefined ? bw.contentMaxWidth : 1400,
      contentAlignment: bw.contentAlignment || "spaceBetween",
      verticalAlignment: bw.verticalAlignment || "center",
      triggerMode: di.triggerMode || "scroll",
      triggerDelay: di.triggerDelay !== undefined ? di.triggerDelay : 3,
      scrollThreshold: di.scrollThreshold !== undefined ? di.scrollThreshold : 50,
      animation: an.type || "slide",
      animationDuration: an.duration !== undefined ? an.duration : 300,
      exitAnimation: an.exitType || "slide",
      cartAction: cb.action || "stayOnPage",
      redirectOnSuccess: cb.redirectOnSuccess || "cart",
      showSuccessNotification: cb.showSuccessNotification !== undefined ? cb.showSuccessNotification : true,
      successMessage: cb.successMessage || "Added to cart successfully!",
      showOnDesktop: di.showOnDesktop !== undefined ? di.showOnDesktop : true,
      showOnMobile: mo.enabled !== undefined ? mo.enabled : true,
      mobileCompact: mo.compactMode !== undefined ? mo.compactMode : true,
      mobileBreakpoint: mo.breakpoint || 768,
      zIndex: ad.zIndex || 9999,
      customCssClass: ad.customCssClass || "",
    };
  }

  // ─── API Calls ─────────────────────────────────────────────────

  // Shared headers for all API requests (includes ngrok bypass for dev)
  var API_HEADERS = { "ngrok-skip-browser-warning": "1" };

  function fetchConfig() {
    return fetch(APP_URL + "/api/storefront/config?sid=" + encodeURIComponent(STORE_ID), {
      headers: API_HEADERS,
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Config fetch failed");
        return res.json();
      })
      .then(function (data) {
        return data.config || null;
      });
  }

  /**
   * Fetch product data via our GraphQL proxy API.
   * Sends the current page path — the server determines if this is a product
   * page and returns the product data using BigCommerce's GraphQL route(path:) query.
   * Returns { isProductPage: boolean, product: object|null }
   */
  function fetchProductByPath(pagePath) {
    return fetch(
      APP_URL + "/api/storefront/product?sid=" + encodeURIComponent(STORE_ID) + "&path=" + encodeURIComponent(pagePath),
      { headers: API_HEADERS }
    )
      .then(function (res) {
        if (!res.ok) throw new Error("Product fetch failed");
        return res.json();
      });
  }

  // ─── Variant Logic (same pattern as reference code) ────────────

  function initSelectedVariants() {
    selectedVariants = {};
    if (!product || !product.variantLabels) return;
    var labels = product.variantLabels;
    for (var name in labels) {
      if (labels.hasOwnProperty(name)) {
        // Start on the merchant's default value, if any — as the theme's form does
        var mod = getModifier(name);
        var def = mod && mod.values.filter(function (v) { return v.isDefault; })[0];
        var variantDefault = !mod && getVariantDefault(name);
        selectedVariants[name] = def ? def.label
          : variantDefault && labels[name].indexOf(variantDefault) !== -1 ? variantDefault : "";
      }
    }
  }

  function getVariantDefault(name) {
    var opts = (product && product.options) || [];
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].name === name && opts[i].isVariantOption) return opts[i].defaultValue || "";
    }
    return "";
  }

  // Modifier = a non-variant multiple-choice option (BigCommerce "customization").
  // It is chosen like a variant but doesn't pick the variant or its price.
  function getModifier(name) {
    var opts = (product && product.options) || [];
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].name === name && !opts[i].isVariantOption && opts[i].values) return opts[i];
    }
    return null;
  }

  // Selected "Name:Value," keys for variant options only (used to match product.variants)
  function getSelectedVariantKeys() {
    var keys = [];
    for (var name in selectedVariants) {
      if (selectedVariants.hasOwnProperty(name) && selectedVariants[name] && !getModifier(name)) {
        keys.push(name + ":" + selectedVariants[name] + ",");
      }
    }
    return keys;
  }

  // A leading comma anchors each "Name:Value," fragment to an option boundary,
  // so "Size:Small," can't match inside "Shoe Size:Small,"
  function variantMatches(variant, keys) {
    var haystack = "," + variant.variantKey;
    return keys.every(function (key) { return haystack.indexOf("," + key) !== -1; });
  }

  // Names of variant options / required modifiers that still have no value
  function getMissingSelections() {
    var missing = [];
    for (var n in selectedVariants) {
      if (!selectedVariants.hasOwnProperty(n) || selectedVariants[n]) continue;
      var mod = getModifier(n);
      if (!mod || mod.isRequired) missing.push(n);
    }
    return missing;
  }

  // Every variant option and every required modifier has a value
  function hasRequiredSelections(variantsOnly) {
    for (var n in selectedVariants) {
      if (!selectedVariants.hasOwnProperty(n) || selectedVariants[n]) continue;
      var mod = getModifier(n);
      if (!mod) return false;
      if (!variantsOnly && mod.isRequired) return false;
    }
    return true;
  }

  // ─── Stock ────────────────────────────────────────────────────
  //
  // inStock comes from BigCommerce (isPurchasable + inventory). A missing flag —
  // older cached responses, the dashboard preview — counts as in stock, and so
  // does a combination with no matching variant (e.g. past the 250 we fetch):
  // the cart still validates it.

  // Could this value still be bought, given the other options already picked?
  function isValueInStock(name, value) {
    if (!product || getModifier(name)) return true;
    if (product.inStock === false) return false;
    var keys = [];
    for (var n in selectedVariants) {
      if (selectedVariants.hasOwnProperty(n) && n !== name && selectedVariants[n] && !getModifier(n)) {
        keys.push(n + ":" + selectedVariants[n] + ",");
      }
    }
    keys.push(name + ":" + value + ",");
    var matched = false;
    var variants = product.variants || [];
    for (var i = 0; i < variants.length; i++) {
      if (!variantMatches(variants[i], keys)) continue;
      if (variants[i].inStock !== false) return true;
      matched = true;
    }
    return !matched;
  }

  // Product, or the fully selected variant, can't be bought
  function isSelectionOutOfStock() {
    if (!product) return false;
    if (product.inStock === false) return true;
    var variants = product.variants || [];
    if (!variants.length) return false;
    if (!hasRequiredSelections(true)) {
      // Nothing picked yet: out of stock only if no variant can be bought at all
      for (var j = 0; j < variants.length; j++) {
        if (variants[j].inStock !== false) return false;
      }
      return true;
    }
    var keys = getSelectedVariantKeys();
    for (var i = 0; i < variants.length; i++) {
      if (variantMatches(variants[i], keys)) return variants[i].inStock === false;
    }
    return false;
  }

  function calculateVariantPrice() {
    if (!product || !product.variants) return null;

    var variantOptions = getSelectedVariantKeys();

    // Need all variant options selected (modifiers don't change the variant price)
    if (!hasRequiredSelections(true)) return null;

    for (var i = 0; i < product.variants.length; i++) {
      var variant = product.variants[i];
      var allMatch = variantMatches(variant, variantOptions);
      if (allMatch) {
        return variant.price;
      }
    }
    return null;
  }

  function generateAddToCartUrl() {
    if (!product) return null;

    // Check all variant options and required modifiers are selected
    if (!hasRequiredSelections(false)) return null;

    var url = "/cart.php?action=add&product_id=" + product.entityId;

    var variantOptions = getSelectedVariantKeys();

    for (var i = 0; i < product.variants.length; i++) {
      var variant = product.variants[i];
      var allMatch = variantMatches(variant, variantOptions);

      if (allMatch) {
        // For each selected variant, find the option ID and value entity ID
        for (var variantName in selectedVariants) {
          if (!selectedVariants.hasOwnProperty(variantName)) continue;
          var value = selectedVariants[variantName];
          for (var j = 0; j < product.options.length; j++) {
            var opt = product.options[j];
            if (opt.name === variantName && opt.isVariantOption) {
              // optionsIds is keyed by option name, so options sharing a value
              // label (Size: Small / Breed size: Small) keep their own ids.
              // The label fallback covers product data in the older label-keyed shape.
              var valueId = variant.optionsIds.hasOwnProperty(variantName)
                ? variant.optionsIds[variantName]
                : variant.optionsIds[value];
              url += "&attribute[" + opt.id + "]=" + valueId;
            }
          }
        }
        break;
      }
    }

    // Modifiers: attribute[optionId]=valueId for each chosen value
    for (var modName in selectedVariants) {
      if (!selectedVariants.hasOwnProperty(modName) || !selectedVariants[modName]) continue;
      var mod = getModifier(modName);
      if (!mod) continue;
      for (var k = 0; k < mod.values.length; k++) {
        if (mod.values[k].label === selectedVariants[modName]) {
          url += "&attribute[" + mod.id + "]=" + mod.values[k].id;
          break;
        }
      }
    }

    url += "&qty=" + quantity;
    return url;
  }

  // ─── Helpers ───────────────────────────────────────────────────

  function isMobile() {
    return window.innerWidth <= (config ? config.mobileBreakpoint : 768);
  }

  // Visibility toggles: is the bar switched off for the current device?
  function isHiddenOnDevice() {
    return isMobile() ? !config.showOnMobile : !config.showOnDesktop;
  }

  function getShadow() {
    var base = SHADOW_MAP[config.barShadow] || SHADOW_MAP.lg;
    if (base === "none") return "none";
    if (config.position === "bottom") {
      return base.replace(/(\d)px (\d)/g, "$1px -$2");
    }
    return base;
  }

  function getBarBackground() {
    if (config.barGradientEnabled) {
      var dir =
        config.barGradientDirection === "horizontal" ? "to right" :
        config.barGradientDirection === "vertical" ? "to bottom" : "135deg";
      return "linear-gradient(" + dir + ", " + config.barGradientFrom + ", " + config.barGradientTo + ")";
    }
    return config.barBgColor;
  }

  function getAlignmentValue(alignment) {
    var map = { left: "flex-start", center: "center", right: "flex-end", spaceBetween: "space-between", spaceAround: "space-around", spaceEvenly: "space-evenly" };
    return map[alignment] || "space-between";
  }

  function getVerticalAlignValue(alignment) {
    var map = { top: "flex-start", center: "center", bottom: "flex-end" };
    return map[alignment] || "center";
  }

  // Formats with the store's currency display settings (sent by /api/storefront/product).
  // Falls back to Intl for the currency code, then to "$" (e.g. the dashboard preview).
  function formatPrice(price) {
    if (price == null) return "";
    var value = Number(price);
    var prices = product && product.prices;
    var c = prices && prices.currency;
    if (c) {
      var places = c.decimalPlaces >= 0 && c.decimalPlaces <= 4 ? c.decimalPlaces : 2;
      var parts = Math.abs(value).toFixed(places).split(".");
      var amount = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, c.thousandsToken || "") +
        (parts[1] ? (c.decimalToken || ".") + parts[1] : "");
      var formatted = c.symbolPlacement === "RIGHT" ? amount + c.symbol : c.symbol + amount;
      return (value < 0 ? "-" : "") + formatted;
    }
    if (prices && prices.currencyCode && prices.currencyCode !== "USD") {
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency", currency: prices.currencyCode, currencyDisplay: "narrowSymbol",
          minimumFractionDigits: 2, maximumFractionDigits: 2,
        }).format(value);
      } catch (e) {}
    }
    return "$" + value.toFixed(2);
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      for (var key in attrs) {
        if (key === "style" && typeof attrs[key] === "object") {
          for (var s in attrs[key]) {
            node.style[s] = attrs[key][s];
          }
        } else if (key === "className") {
          node.className = attrs[key];
        } else if (key.indexOf("on") === 0) {
          node.addEventListener(key.substring(2).toLowerCase(), attrs[key]);
        } else {
          node.setAttribute(key, attrs[key]);
        }
      }
    }
    if (children) {
      if (typeof children === "string") {
        node.textContent = children;
      } else if (Array.isArray(children)) {
        children.forEach(function (child) {
          if (child) node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
        });
      } else {
        node.appendChild(typeof children === "string" ? document.createTextNode(children) : children);
      }
    }
    return node;
  }

  function svgIcon(type) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "15");
    svg.setAttribute("height", "15");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    if (type === "cart") {
      svg.innerHTML =
        '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>';
    } else if (type === "x") {
      svg.setAttribute("width", "12");
      svg.setAttribute("height", "12");
      svg.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>';
    } else if (type === "chevron-down") {
      svg.setAttribute("width", "12");
      svg.setAttribute("height", "12");
      svg.innerHTML = '<polyline points="6 9 12 15 18 9"/>';
    }
    return svg;
  }

  // Overlay a chevron on the trigger's right padding. pointer-events: none keeps
  // clicks on the trigger.
  function addSelectArrow(wrapper, color) {
    var arrow = svgIcon("chevron-down");
    arrow.style.position = "absolute";
    arrow.style.right = "8px";
    arrow.style.top = "50%";
    arrow.style.transform = "translateY(-50%)";
    arrow.style.pointerEvents = "none";
    arrow.style.color = color;
    wrapper.appendChild(arrow);
  }

  // ─── Custom Dropdown ───────────────────────────────────────────
  //
  // Native <select> popups are drawn by the browser and can't be sized, so on a
  // fixed bottom bar they run off-screen with no scroll. This dropdown renders its
  // list in <body> with position: fixed, opens on whichever side of the trigger
  // has more room, caps its height to that space (scrolls beyond it) and is
  // clamped inside the viewport width.

  var DROPDOWN_LIST_ID = "satc-dropdown-list";
  var DROPDOWN_EDGE = 8;           // min gap between the list and the viewport edge
  var DROPDOWN_MAX_HEIGHT = 280;
  var openDropdown = null;         // { trigger, list, onDocDown, onKey, onScroll, onResize }

  function closeDropdown(refocus) {
    if (!openDropdown) return;
    var d = openDropdown;
    openDropdown = null;
    document.removeEventListener("pointerdown", d.onDocDown, true);
    document.removeEventListener("keydown", d.onKey, true);
    window.removeEventListener("scroll", d.onScroll, true);
    window.removeEventListener("resize", d.onResize);
    if (d.list.parentNode) d.list.parentNode.removeChild(d.list);
    d.trigger.setAttribute("aria-expanded", "false");
    if (refocus && document.body.contains(d.trigger)) d.trigger.focus();
  }

  function positionDropdownList(trigger, list) {
    var r = trigger.getBoundingClientRect();
    var vw = document.documentElement.clientWidth || window.innerWidth;
    var vh = window.innerHeight;
    var below = vh - r.bottom - DROPDOWN_EDGE;
    var above = r.top - DROPDOWN_EDGE;
    var openUp = below < Math.min(list.scrollHeight, DROPDOWN_MAX_HEIGHT) && above > below;
    var maxH = Math.max(Math.min(openUp ? above : below, DROPDOWN_MAX_HEIGHT) - 4, 60);

    var width = Math.min(Math.max(r.width, 120), vw - DROPDOWN_EDGE * 2);
    var left = Math.min(Math.max(r.left, DROPDOWN_EDGE), vw - DROPDOWN_EDGE - width);

    list.style.maxHeight = maxH + "px";
    list.style.minWidth = width + "px";
    list.style.maxWidth = (vw - DROPDOWN_EDGE * 2) + "px";
    list.style.left = left + "px";
    if (openUp) {
      list.style.top = "auto";
      list.style.bottom = (vh - r.top + 4) + "px";
    } else {
      list.style.bottom = "auto";
      list.style.top = (r.bottom + 4) + "px";
    }
    // Keep a too-wide list (long option labels) inside the right edge
    var lr = list.getBoundingClientRect();
    if (lr.right > vw - DROPDOWN_EDGE) {
      list.style.left = Math.max(DROPDOWN_EDGE, vw - DROPDOWN_EDGE - lr.width) + "px";
    }
  }

  // opts: { value, options: [{ value, label }], textColor, fontSize, onSelect(value) }
  function openDropdownList(trigger, opts) {
    closeDropdown(false);

    var list = el("div", {
      id: DROPDOWN_LIST_ID,
      role: "listbox",
      style: {
        position: "fixed",
        zIndex: String((config.zIndex || 9999) + 2),
        overflowY: "auto",
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
        backgroundColor: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "6px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        padding: "4px 0",
        margin: "0",
        fontFamily: config.fontFamily || "inherit",
        fontSize: opts.fontSize,
        boxSizing: "border-box",
      },
    });

    var items = [];
    var activeIndex = 0;

    function setActive(i) {
      if (!items.length) return;
      activeIndex = (i + items.length) % items.length;
      items.forEach(function (item, idx) {
        item.style.backgroundColor = idx === activeIndex ? "#F3F4F6" : "transparent";
      });
      var a = items[activeIndex];
      if (a.offsetTop < list.scrollTop) list.scrollTop = a.offsetTop;
      else if (a.offsetTop + a.offsetHeight > list.scrollTop + list.clientHeight) {
        list.scrollTop = a.offsetTop + a.offsetHeight - list.clientHeight;
      }
    }

    function choose(i) {
      if (opts.options[i].disabled) return; // out of stock: keep the list open
      var v = opts.options[i].value;
      closeDropdown(true);
      if (v !== opts.value) opts.onSelect(v);
    }

    opts.options.forEach(function (o, i) {
      var selected = o.value === opts.value;
      if (selected) activeIndex = i;
      var item = el("div", {
        role: "option",
        "aria-selected": selected ? "true" : "false",
        "aria-disabled": o.disabled ? "true" : "false",
        style: {
          padding: "8px 12px",
          minHeight: "36px",
          display: "flex",
          alignItems: "center",
          cursor: o.disabled ? "not-allowed" : "pointer",
          whiteSpace: "nowrap",
          color: o.value === "" || o.disabled ? "#9CA3AF" : (opts.textColor || "#374151"),
          fontWeight: selected ? "600" : "400",
          lineHeight: "1.3",
        },
        onMouseenter: function () { setActive(i); },
        onClick: function (e) {
          e.preventDefault();
          e.stopPropagation();
          choose(i);
        },
      }, o.disabled ? o.label + " \u2014 Out of stock" : o.label);
      items.push(item);
      list.appendChild(item);
    });

    document.body.appendChild(list);
    positionDropdownList(trigger, list);
    setActive(activeIndex);
    trigger.setAttribute("aria-expanded", "true");

    var d = {
      trigger: trigger,
      list: list,
      onDocDown: function (e) {
        if (list.contains(e.target) || trigger.contains(e.target)) return;
        closeDropdown(false);
      },
      onKey: function (e) {
        if (e.key === "Escape" || e.key === "Tab") {
          if (e.key === "Escape") e.preventDefault();
          closeDropdown(e.key === "Escape");
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setActive(activeIndex + 1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActive(activeIndex - 1);
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          choose(activeIndex);
        }
      },
      // Page scroll moves the trigger (or hides the bar) — close; scrolling the list itself is fine
      onScroll: function (e) {
        if (e.target === list) return;
        closeDropdown(false);
      },
      onResize: function () { closeDropdown(false); },
    };
    openDropdown = d;
    document.addEventListener("pointerdown", d.onDocDown, true);
    document.addEventListener("keydown", d.onKey, true);
    window.addEventListener("scroll", d.onScroll, true);
    window.addEventListener("resize", d.onResize);
  }

  // Trigger button styled like the old <select>. Returns the wrapper element.
  // opts: { value, options, placeholder, triggerStyle, arrowColor, textColor, fontSize, attrs, onSelect }
  function renderDropdown(opts) {
    var wrapper = el("div", { style: { position: "relative", display: "inline-block" } });
    var current = null;
    for (var i = 0; i < opts.options.length; i++) {
      if (opts.options[i].value === opts.value) { current = opts.options[i]; break; }
    }
    var attrs = {
      type: "button",
      "aria-haspopup": "listbox",
      "aria-expanded": "false",
      style: opts.triggerStyle,
      onClick: function (e) {
        e.preventDefault();
        if (openDropdown && openDropdown.trigger === trigger) closeDropdown(false);
        else openDropdownList(trigger, opts);
      },
      onKeydown: function (e) {
        if (openDropdown) return;
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          openDropdownList(trigger, opts);
        }
      },
    };
    for (var k in opts.attrs || {}) attrs[k] = opts.attrs[k];

    // Every possible label sits in the same grid cell and only the current one is
    // visible, so the trigger is always as wide as its longest label: picking a
    // value never resizes it or shifts the controls next to it.
    var labelText = current ? current.label : (opts.placeholder || (opts.options[0] ? opts.options[0].label : ""));
    var candidates = [labelText];
    if (opts.placeholder) candidates.push(opts.placeholder);
    opts.options.forEach(function (o) { candidates.push(o.label); });
    var labelSpans = [];
    var seen = {};
    candidates.forEach(function (text) {
      if (seen.hasOwnProperty(text)) return;
      seen[text] = true;
      labelSpans.push(el("span", {
        "aria-hidden": text === labelText ? "false" : "true",
        style: {
          gridArea: "1 / 1",
          visibility: text === labelText ? "visible" : "hidden",
          minWidth: "0",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
      }, text));
    });
    function showLabel(text) {
      labelSpans.forEach(function (span) {
        var on = span.textContent === text;
        span.style.visibility = on ? "visible" : "hidden";
        span.setAttribute("aria-hidden", on ? "false" : "true");
      });
    }

    attrs.style = Object.assign({}, opts.triggerStyle, { display: "inline-grid", justifyItems: "start", alignItems: "center" });
    var trigger = el("button", attrs, labelSpans);
    // Keep the trigger label + selected value current for callers that don't re-render
    var onSelect = opts.onSelect;
    opts = Object.assign({}, opts, {
      onSelect: function (v) {
        opts.value = v;
        for (var j = 0; j < opts.options.length; j++) {
          if (opts.options[j].value === v) { showLabel(opts.options[j].label); break; }
        }
        onSelect(v);
      },
    });
    wrapper.appendChild(trigger);
    addSelectArrow(wrapper, opts.arrowColor);
    return wrapper;
  }

  // ─── Render Elements ───────────────────────────────────────────

  function renderImage() {
    var isHoriz = config.position === "top" || config.position === "bottom";
    var mobile = isMobile();
    var size = isHoriz ? (mobile ? Math.min(config.imageSize, 40) : config.imageSize) : "100%";
    var height = isHoriz ? size : 60;

    var img = el("img", {
      src: product.image.url,
      alt: product.image.alt || product.name,
      style: {
        width: typeof size === "number" ? size + "px" : size,
        height: typeof height === "number" ? height + "px" : height,
        objectFit: "cover",
        flexShrink: "0",
        borderRadius: config.imageBorderRadius + "px",
        borderWidth: (config.imageBorderWidth || 0) + "px",
        borderColor: config.imageBorderWidth > 0 ? config.imageBorderColor : "transparent",
        borderStyle: config.imageBorderWidth > 0 ? "solid" : "none",
      },
    });
    return img;
  }

  function renderTitle() {
    var baseFontSize = config.fontSize || 14;
    var p = el("span", {
      style: {
        color: config.titleColor,
        fontSize: baseFontSize + "px",
        fontFamily: config.fontFamily,
        fontWeight: config.titleFontWeight || "600",
        lineHeight: "1.4",
        letterSpacing: (config.titleLetterSpacing || 0) + "px",
        textTransform: config.textTransform || "none",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        display: "block",
        minWidth: "0",
      },
    }, product.name);
    return p;
  }

  function renderPrice() {
    var baseFontSize = config.fontSize || 14;
    var container = el("div", {
      id: BAR_ID + "-price",
      style: { flexShrink: "0", fontFamily: config.fontFamily },
    });

    var displayPrice = currentPrice != null ? currentPrice : product.prices.price;
    var priceSpan = el("span", {
      style: {
        color: config.priceColor,
        fontSize: Math.max(baseFontSize + 4, 16) + "px",
        fontWeight: config.priceFontWeight || "700",
      },
    }, formatPrice(displayPrice));
    container.appendChild(priceSpan);

    // Compare price (sale scenario)
    if (product.prices.basePrice && product.prices.salePrice && product.prices.basePrice > product.prices.salePrice) {
      if (config.comparePriceStyle === "badge") {
        var pct = Math.round((1 - product.prices.salePrice / product.prices.basePrice) * 100);
        var badge = el("span", {
          style: {
            marginLeft: "8px",
            display: "inline-flex",
            alignItems: "center",
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: Math.max(baseFontSize - 4, 9) + "px",
            fontWeight: "600",
            backgroundColor: config.discountedPriceColor + "20",
            color: config.discountedPriceColor,
          },
        }, "-" + pct + "%");
        container.appendChild(badge);
      } else {
        var strike = el("span", {
          style: {
            marginLeft: "6px",
            textDecoration: "line-through",
            color: config.discountedPriceColor,
            fontSize: Math.max(baseFontSize - 2, 11) + "px",
          },
        }, formatPrice(product.prices.basePrice));
        container.appendChild(strike);
      }
    }

    return container;
  }

  // ─── Variant Display Type Lookup ────────────────────────────────

  function getVariantDisplayType(optionName) {
    var options = config.variantOptions || [];
    for (var i = 0; i < options.length; i++) {
      if (options[i].name && options[i].name.toLowerCase() === optionName.toLowerCase()) {
        return options[i].displayType;
      }
    }
    return "dropdown"; // fallback
  }

  // ─── Variant Sub-Renderers ────────────────────────────────────

  function renderVariantDropdown(optionName, values) {
    var fontSize = Math.max((config.fontSize || 14) - 2, 11) + "px";
    // The option name is only the closed field's placeholder, never a choice. An
    // optional modifier gets an explicit "None" so the shopper can clear it.
    var mod = getModifier(optionName);
    var options = mod && !mod.isRequired ? [{ value: "", label: "None" }] : [];
    values.forEach(function (val) {
      options.push({ value: val, label: val, disabled: !isValueInStock(optionName, val) });
    });
    return renderDropdown({
      value: selectedVariants[optionName] || "",
      placeholder: optionName,
      options: options,
      textColor: config.variantTextColor,
      arrowColor: config.variantTextColor,
      fontSize: fontSize,
      attrs: { "data-variant-name": optionName, "aria-label": optionName },
      triggerStyle: {
        padding: "4px 26px 4px 8px",
        fontSize: fontSize,
        lineHeight: "1.4",
        border: "1px solid " + config.variantBorderColor,
        borderRadius: config.variantBorderRadius + "px",
        color: config.variantTextColor,
        backgroundColor: "#fff",
        cursor: "pointer",
        minWidth: "70px",
        maxWidth: "180px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        textAlign: "left",
      },
      onSelect: function (v) {
        handleVariantChange(optionName, v);
      },
    });
  }

  var COLOR_MAP = {
    red: "#EF4444", blue: "#3B82F6", green: "#22C55E", yellow: "#EAB308",
    orange: "#F97316", purple: "#A855F7", pink: "#EC4899", black: "#1F2937",
    white: "#FFFFFF", gray: "#6B7280", grey: "#6B7280", brown: "#92400E",
    navy: "#1E3A5F", teal: "#14B8A6", coral: "#F87171", beige: "#D4C5A9",
    maroon: "#7F1D1D", olive: "#6B7212", cyan: "#06B6D4", magenta: "#D946EF",
    gold: "#CA8A04", silver: "#9CA3AF", tan: "#D2B48C", ivory: "#FFFFF0",
    lavender: "#C4B5FD", indigo: "#6366F1", violet: "#8B5CF6", charcoal: "#374151",
    burgundy: "#800020", khaki: "#BDB76B", cream: "#FFFDD0", mint: "#A7F3D0",
    peach: "#FDBA74", turquoise: "#2DD4BF", salmon: "#FA8072", plum: "#9333EA",
    lime: "#84CC16", aqua: "#22D3EE", rose: "#FB7185", sky: "#38BDF8",
    slate: "#64748B", stone: "#78716C", zinc: "#71717A", amber: "#F59E0B",
    emerald: "#10B981", fuchsia: "#D946EF", natural: "#E7DDD2",
  };

  // Dim an out-of-stock swatch / radio / rectangle; its click handler skips it
  function markOutOfStock(node, optionName, val) {
    if (isValueInStock(optionName, val)) return;
    node.setAttribute("aria-disabled", "true");
    node.setAttribute("title", val + " (out of stock)");
    node.style.opacity = "0.4";
    node.style.cursor = "not-allowed";
    node.style.textDecoration = "line-through";
  }

  function renderVariantSwatch(optionName, values) {
    var group = el("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" } });
    values.forEach(function (val) {
      var isActive = selectedVariants[optionName] === val;
      var hexColor = COLOR_MAP[val.toLowerCase()] || null;
      var swatch = el("div", {
        "data-variant-name": optionName,
        "data-variant-value": val,
        title: val,
        style: {
          width: isMobile() ? "24px" : "28px",
          height: isMobile() ? "24px" : "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid " + (isActive ? config.variantActiveColor : (hexColor ? hexColor + "40" : config.variantBorderColor)),
          borderRadius: config.variantBorderRadius + "px",
          backgroundColor: hexColor || (isActive ? config.variantActiveColor + "18" : "#fff"),
          fontSize: hexColor ? "0" : (Math.max((config.fontSize || 14) - 4, 9) + "px"),
          fontWeight: "600",
          color: isActive ? config.variantActiveColor : config.variantTextColor,
          cursor: "pointer",
          transition: "all 0.15s",
          boxShadow: isActive ? "0 0 0 2px " + config.variantActiveColor : "none",
        },
        onClick: function (e) {
          var t = e.currentTarget;
          if (t.getAttribute("aria-disabled") === "true") return;
          handleVariantChange(t.getAttribute("data-variant-name"), t.getAttribute("data-variant-value"));
        },
      }, hexColor ? "" : val.substring(0, 2));
      markOutOfStock(swatch, optionName, val);
      group.appendChild(swatch);
    });
    return group;
  }

  function renderVariantRadio(optionName, values) {
    var group = el("div", { style: { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" } });
    values.forEach(function (val) {
      var isActive = selectedVariants[optionName] === val;

      var radioOuter = el("div", {
        style: {
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          border: "2px solid " + (isActive ? config.variantActiveColor : config.variantBorderColor),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: "0",
        },
      });
      if (isActive) {
        var radioInner = el("div", {
          style: {
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            backgroundColor: config.variantActiveColor,
          },
        });
        radioOuter.appendChild(radioInner);
      }

      var label = el("span", {
        style: {
          fontSize: Math.max((config.fontSize || 14) - 2, 11) + "px",
          color: isActive ? config.variantActiveColor : config.variantTextColor,
        },
      }, val);

      var row = el("div", {
        "data-variant-name": optionName,
        "data-variant-value": val,
        style: { display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" },
        onClick: function (e) {
          var t = e.currentTarget;
          if (t.getAttribute("aria-disabled") === "true") return;
          handleVariantChange(t.getAttribute("data-variant-name"), t.getAttribute("data-variant-value"));
        },
      }, [radioOuter, label]);
      markOutOfStock(row, optionName, val);

      group.appendChild(row);
    });
    return group;
  }

  function renderVariantRectList(optionName, values) {
    var group = el("div", { style: { display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" } });
    values.forEach(function (val) {
      var isActive = selectedVariants[optionName] === val;
      var btn = el("button", {
        "data-variant-name": optionName,
        "data-variant-value": val,
        style: {
          padding: isMobile() ? "2px 8px" : "4px 12px",
          fontSize: Math.max((config.fontSize || 14) - 2, 11) + "px",
          fontWeight: "500",
          border: "1px solid " + (isActive ? config.variantActiveColor : config.variantBorderColor),
          borderRadius: config.variantBorderRadius + "px",
          backgroundColor: isActive ? config.variantActiveColor + "18" : "#fff",
          color: isActive ? config.variantActiveColor : config.variantTextColor,
          cursor: "pointer",
          transition: "all 0.15s",
          lineHeight: "1.4",
        },
        onClick: function (e) {
          var t = e.currentTarget;
          if (t.getAttribute("aria-disabled") === "true") return;
          handleVariantChange(t.getAttribute("data-variant-name"), t.getAttribute("data-variant-value"));
        },
      }, val);
      markOutOfStock(btn, optionName, val);
      group.appendChild(btn);
    });
    return group;
  }

  // ─── Main Variant Renderer ────────────────────────────────────

  function renderVariants() {
    var container = el("div", {
      id: BAR_ID + "-variants",
      // Options side by side on one row (wraps only if they can't fit)
      style: { flexShrink: "0", display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: "12px", rowGap: "6px" },
    });

    if (!product.variantLabels || Object.keys(product.variantLabels).length === 0) {
      return container;
    }

    for (var optionName in product.variantLabels) {
      if (!product.variantLabels.hasOwnProperty(optionName)) continue;
      var values = product.variantLabels[optionName];
      var displayType = getVariantDisplayType(optionName);

      // Row: [label] [control]
      var row = el("div", {
        "data-satc-variant": displayType,
        style: { display: "flex", alignItems: "center", gap: "8px" },
      });

      // Label
      if (config.variantShowLabels) {
        var labelEl = el("span", {
          style: {
            fontSize: Math.max((config.fontSize || 14) - 2, 11) + "px",
            color: config.variantTextColor,
            fontWeight: "500",
            whiteSpace: "nowrap",
          },
        }, optionName + ":");
        row.appendChild(labelEl);
      }

      // Control
      var control = null;
      switch (displayType) {
        case "dropdown":
          control = renderVariantDropdown(optionName, values);
          break;
        case "swatch":
          control = renderVariantSwatch(optionName, values);
          break;
        case "radioButtons":
          control = renderVariantRadio(optionName, values);
          break;
        case "rectangleList":
          control = renderVariantRectList(optionName, values);
          break;
        default:
          control = renderVariantDropdown(optionName, values);
      }
      if (control) row.appendChild(control);

      container.appendChild(row);
    }

    return container;
  }

  function renderQuantity() {
    var container = el("div", { id: BAR_ID + "-quantity", style: { flexShrink: "0" } });

    var qtyTextColor = config.quantityTextColor || "#374151";
    var qtyBgColor = config.quantityBgColor || "#FFFFFF";
    var qtyBtnColor = config.quantityButtonColor || "#9CA3AF";

    if (config.quantityStyle === "dropdown") {
      var qtyOptions = [];
      for (var i = 1; i <= 10; i++) qtyOptions.push({ value: String(i), label: String(i) });
      container.appendChild(renderDropdown({
        value: String(quantity),
        options: qtyOptions,
        textColor: qtyTextColor,
        arrowColor: qtyBtnColor,
        fontSize: "12px",
        attrs: { "aria-label": "Quantity" },
        triggerStyle: {
          padding: "4px 26px 4px 8px",
          fontSize: "12px",
          lineHeight: "1.4",
          border: "1px solid " + config.quantityBorderColor,
          borderRadius: config.quantityBorderRadius + "px",
          backgroundColor: qtyBgColor,
          color: qtyTextColor,
          cursor: "pointer",
          minWidth: "50px",
          textAlign: "left",
        },
        onSelect: function (v) {
          quantity = parseInt(v, 10);
        },
      }));
    } else if (config.quantityStyle === "input") {
      var input = el("input", {
        type: "number",
        value: String(quantity),
        min: "1",
        style: {
          width: "50px",
          textAlign: "center",
          padding: "4px",
          fontSize: "12px",
          fontWeight: "500",
          border: "1px solid " + config.quantityBorderColor,
          borderRadius: config.quantityBorderRadius + "px",
          backgroundColor: qtyBgColor,
          color: qtyTextColor,
        },
        onChange: function (e) {
          var v = parseInt(e.target.value, 10);
          if (v > 0) quantity = v;
        },
      });
      container.appendChild(input);
    } else {
      // plusMinus
      var wrap = el("div", {
        style: {
          display: "flex",
          alignItems: "center",
          border: "1px solid " + config.quantityBorderColor,
          borderRadius: config.quantityBorderRadius + "px",
          overflow: "hidden",
          backgroundColor: qtyBgColor,
        },
      });
      var minusBtn = el("button", {
        style: {
          padding: "4px 8px",
          fontSize: "22px",
          color: qtyBtnColor,
          background: "none",
          border: "none",
          cursor: "pointer",
          lineHeight: "1",
        },
        onClick: function () {
          if (quantity > 1) {
            quantity--;
            updateQuantityDisplay();
          }
        },
      }, "\u2212");
      var qtyDisplay = el("span", {
        id: BAR_ID + "-qty-display",
        style: {
          padding: "4px 12px",
          fontSize: "16px",
          fontWeight: "500",
          color: qtyTextColor,
          borderLeft: "1px solid " + config.quantityBorderColor,
          borderRight: "1px solid " + config.quantityBorderColor,
          lineHeight: "1",
        },
      }, String(quantity));
      var plusBtn = el("button", {
        style: {
          padding: "4px 8px",
          fontSize: "22px",
          color: qtyBtnColor,
          background: "none",
          border: "none",
          cursor: "pointer",
          lineHeight: "1",
        },
        onClick: function () {
          quantity++;
          updateQuantityDisplay();
        },
      }, "+");
      wrap.appendChild(minusBtn);
      wrap.appendChild(qtyDisplay);
      wrap.appendChild(plusBtn);
      container.appendChild(wrap);
    }

    return container;
  }

  function renderButton() {
    var baseFontSize = config.fontSize || 14;
    var style = {
      color: config.buttonTextColor,
      padding: (config.buttonPaddingY || 10) + "px " + (config.buttonPaddingX || 24) + "px",
      fontSize: baseFontSize + "px",
      fontFamily: config.fontFamily,
      fontWeight: config.buttonFontWeight || "600",
      borderRadius: config.buttonStyle === "pill" ? "9999px" : config.buttonBorderRadius + "px",
      boxShadow: BTN_SHADOW_MAP[config.buttonShadow] || "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      flexShrink: "0",
      transition: "all 0.15s",
      lineHeight: "1.4",
      whiteSpace: "nowrap",
    };

    if (config.buttonStyle === "filled" || config.buttonStyle === "pill") {
      style.backgroundColor = config.buttonBgColor;
      style.border = "none";
    } else if (config.buttonStyle === "outline") {
      style.backgroundColor = "transparent";
      style.border = (config.buttonBorderWidth || 2) + "px solid " + (config.buttonBorderColor || config.buttonBgColor);
      style.color = config.buttonBorderColor || config.buttonBgColor;
    } else if (config.buttonStyle === "ghost") {
      style.backgroundColor = "transparent";
      style.border = "none";
      style.color = config.buttonBgColor;
    }

    var children = [];
    if (config.buttonShowIcon) {
      children.push(svgIcon("cart"));
    }
    children.push(el("span", null, config.buttonCustomText || "Add to Cart"));
    var hoverable = function (e) { return !e.currentTarget.disabled; };

    var btn = el("button", {
      id: BAR_ID + "-atc-btn",
      style: style,
      onClick: handleAddToCart,
      onMouseenter: function (e) {
        if (!hoverable(e)) return;
        if (config.buttonStyle === "filled" || config.buttonStyle === "pill") {
          e.currentTarget.style.backgroundColor = config.buttonHoverBgColor;
        } else {
          e.currentTarget.style.opacity = "0.8";
        }
      },
      onMouseleave: function (e) {
        if (!hoverable(e)) return;
        if (config.buttonStyle === "filled" || config.buttonStyle === "pill") {
          e.currentTarget.style.backgroundColor = config.buttonBgColor;
        } else {
          e.currentTarget.style.opacity = "1";
        }
      },
    }, children);

    applyStockState(btn);
    return btn;
  }

  // Out of stock → disabled button reading "Out of stock", like the theme's form
  function applyStockState(btn) {
    btn = btn || document.getElementById(BAR_ID + "-atc-btn");
    if (!btn) return;
    var oos = isSelectionOutOfStock();
    btn.disabled = oos;
    btn.style.opacity = oos ? "0.5" : "1";
    btn.style.cursor = oos ? "not-allowed" : "pointer";
    var span = btn.querySelector("span");
    if (span) span.textContent = oos ? "Out of stock" : (config.buttonCustomText || "Add to Cart");
  }

  // ─── Bar Rendering ─────────────────────────────────────────────

  function renderBar() {
    closeDropdown(false);
    // Remove existing
    var existing = document.getElementById(BAR_ID);
    if (existing) existing.remove();
    var existingStyle = document.getElementById(STYLE_ID);
    if (existingStyle) existingStyle.remove();

    if (!config.enabled) return;

    var isHoriz = config.position === "top" || config.position === "bottom";

    // Inject scoped CSS
    var css = buildCSS();
    var styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    styleEl.textContent = css;
    document.head.appendChild(styleEl);

    // Build visible elements
    var visibleElements = (config.elements || []).filter(function (e) { return e.visible; });

    // Fallback for configs saved before group property was added
    var DEFAULT_LEFT_IDS = { image: true, title: true, price: true };

    function isLeftGroup(elem) {
      if (elem.group) return elem.group === "left";
      return !!DEFAULT_LEFT_IDS[elem.id];
    }

    function renderElementNode(elem) {
      var node = renderElementById(elem);
      // Tag nodes so the stacked (mobile) CSS can place each element on its row
      if (node) node.setAttribute("data-satc-el", elem.id);
      return node;
    }

    function renderElementById(elem) {
      switch (elem.id) {
        case "image": return renderImage();
        case "title": return renderTitle();
        case "price": return renderPrice();
        case "variants": return renderVariants();
        case "quantity": return renderQuantity();
        case "button": return renderButton();
        default: return null;
      }
    }

    // Determine inner content children
    var innerChildren;
    var innerGap;

    if (isHoriz) {
      var leftNodes = [];
      var rightNodes = [];
      visibleElements.forEach(function (elem) {
        var node = renderElementNode(elem);
        if (!node) return;
        if (isLeftGroup(elem)) {
          leftNodes.push(node);
        } else {
          rightNodes.push(node);
        }
      });

      if (leftNodes.length > 0 && rightNodes.length > 0) {
        // Two groups with groupGap between them
        // Scale gap responsively based on viewport width
        var baseGroupGap = config.groupGap !== undefined ? config.groupGap : 32;
        var vw = window.innerWidth || document.documentElement.clientWidth || 768;
        var responsiveGap = baseGroupGap;
        if (vw < 1200) {
          // Scale proportionally: full gap at 1200px+, linearly down to 25% at 480px
          var scale = Math.max(0.25, (vw - 480) / (1200 - 480));
          responsiveGap = Math.round(baseGroupGap * scale);
        }

        var leftGroup = el("div", {
          style: {
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: (config.elementGap || 12) + "px",
            minWidth: "0",
          },
          className: "satc-group",
        }, leftNodes);

        var rightGroup = el("div", {
          style: {
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: (config.elementGap || 12) + "px",
          },
          className: "satc-group",
        }, rightNodes);

        innerChildren = [leftGroup, rightGroup];
        innerGap = responsiveGap + "px";
      } else {
        // Only one group present, render flat
        innerChildren = leftNodes.concat(rightNodes);
        innerGap = (config.elementGap || 12) + "px";
      }
    } else {
      // Vertical layout: render flat
      innerChildren = [];
      visibleElements.forEach(function (elem) {
        var node = renderElementNode(elem);
        if (node) innerChildren.push(node);
      });
      innerGap = (config.elementGap || 12) + "px";
    }

    // Content container (flex layout with configurable width and justify-content)
    // Use columnGap + rowGap separately so the gap shorthand cannot override rowGap.
    var contentWrapStyle = {
      display: "flex",
      flexDirection: isHoriz ? "row" : "column",
      alignItems: isHoriz ? getVerticalAlignValue(config.verticalAlignment) : "center",
      justifyContent: isHoriz ? (isMobile() ? "center" : getAlignmentValue(config.contentAlignment)) : undefined,
      flexWrap: isHoriz ? "wrap" : undefined,
      width: "100%",
      columnGap: innerGap,
      rowGap: isHoriz ? (config.elementGap || 12) + "px" : innerGap,
    };
    if (config.contentMaxWidth > 0) {
      contentWrapStyle.maxWidth = config.contentMaxWidth + "px";
      contentWrapStyle.margin = "0 auto";
    }

    // Hidden on desktop; on mobile it forces quantity + Add to Cart onto their own row
    if (isHoriz) innerChildren.push(el("div", { className: "satc-break" }));

    var contentWrap = el("div", {
      style: contentWrapStyle,
      className: "satc-content" + (isHoriz ? " satc-horiz" : ""),
    }, innerChildren);

    // Bar background shell (visual styling: bg, border, shadow, padding)
    var inner = el("div", {
      style: {
        background: getBarBackground(),
        borderRadius: config.barBorderRadius + "px",
        padding: config.barPadding + "px",
        boxShadow: getShadow(),
        opacity: String((config.barOpacity || 100) / 100),
        borderColor: config.barBorderWidth > 0 ? config.barBorderColor : "transparent",
        borderWidth: (config.barBorderWidth || 0) + "px",
        borderStyle: config.barBorderWidth > 0 ? "solid" : "none",
        position: "relative",
      },
    }, [contentWrap]);

    // Width container (bar-level max width)
    var widthWrap = el("div", {
      style: config.barWidthMode === "contained" ? {
        maxWidth: config.barMaxWidth + "px",
        margin: "0 auto",
      } : {},
    }, [inner]);

    // Outer bar (fixed position)
    var posStyle = {
      position: "fixed",
      zIndex: String(config.zIndex || 9999),
      left: "0",
      right: "0",
    };

    if (config.position === "bottom") {
      posStyle.bottom = config.barOffset + "px";
    } else if (config.position === "top") {
      posStyle.top = config.barOffset + "px";
    } else if (config.position === "left") {
      posStyle.left = "0";
      posStyle.top = "50%";
      posStyle.transform = "translateY(-50%)";
      posStyle.right = "auto";
      posStyle.width = isMobile() ? "60px" : "80px";
    } else if (config.position === "right") {
      posStyle.right = "0";
      posStyle.top = "50%";
      posStyle.transform = "translateY(-50%)";
      posStyle.left = "auto";
      posStyle.width = isMobile() ? "60px" : "80px";
    }

    var bar = el("div", {
      id: BAR_ID,
      className: config.customCssClass || "",
      style: posStyle,
    }, [widthWrap]);

    // Initial hidden state for animation
    bar.style.visibility = "hidden";
    bar.style.opacity = "0";

    document.body.appendChild(bar);
    updateStackedLayout();
  }

  // Whenever the single row doesn't fit — at any width, e.g. laptops at 125–150%
  // zoom — the bar switches to the stacked, centered 3-row layout instead of
  // wrapping unevenly:
  //   1. image · title · price   2. variants   3. quantity + Add to Cart
  // A screen with room for everything keeps the compact one-row bar.
  var MIN_TITLE_WIDTH = 140; // narrower than this (and truncated) counts as "doesn't fit"

  // Does the single-row layout wrap onto a second line, or squeeze the title?
  function singleRowOverflows(content) {
    var items = [];
    var nodes = content.querySelectorAll("[data-satc-el]");
    for (var i = 0; i < nodes.length; i++) {
      // Variant options wrap inside their own container — measure each option row
      if (nodes[i].getAttribute("data-satc-el") === "variants") {
        for (var j = 0; j < nodes[i].children.length; j++) items.push(nodes[i].children[j]);
      } else {
        items.push(nodes[i]);
      }
    }
    var maxTop = -Infinity, minBottom = Infinity;
    for (var k = 0; k < items.length; k++) {
      var r = items[k].getBoundingClientRect();
      if (!r.height) continue;
      if (r.top > maxTop) maxTop = r.top;
      if (r.bottom < minBottom) minBottom = r.bottom;
    }
    if (maxTop >= minBottom - 1) return true;

    var title = content.querySelector("[data-satc-el='title']");
    return !!title && title.scrollWidth > title.clientWidth && title.clientWidth < MIN_TITLE_WIDTH;
  }

  function updateStackedLayout() {
    var bar = document.getElementById(BAR_ID);
    if (!bar) return;
    var content = bar.querySelector(".satc-horiz");
    bar.classList.remove("satc-stacked");
    if (!content) return;
    if (singleRowOverflows(content)) bar.classList.add("satc-stacked");
  }

  function buildCSS() {
    var gap = config && config.elementGap || 12;
    // Tighter row spacing when stacked so the bar doesn't eat the screen on phones
    var rowGap = Math.min(gap, 8) + "px";
    var root = "#" + BAR_ID + ".satc-stacked .satc-horiz";
    var variantCol = root + " #" + BAR_ID + "-variants > [data-satc-variant='dropdown']";
    return (
      "#" + BAR_ID + " * { box-sizing: border-box; margin: 0; padding: 0; }\n" +
      "#" + BAR_ID + " button { font-family: inherit; }\n" +
      "#" + BAR_ID + " select { font-family: inherit; }\n" +
      "#" + BAR_ID + " input { font-family: inherit; }\n" +
      "#" + BAR_ID + " img { display: block; }\n" +
      "#" + BAR_ID + " .satc-break { display: none; }\n" +
      // Rows are spaced with margins (not row-gap) so an empty variants row adds no extra space
      root + " { justify-content: center !important; flex-wrap: wrap !important; row-gap: 0 !important; }\n" +
      // Dissolve the left/right groups so every element can be placed on its row
      root + " .satc-group { display: contents !important; }\n" +
      // Row 1: image · title · price — title takes the free space, up to two lines
      root + " [data-satc-el='image'] { order: 1; flex-shrink: 0; }\n" +
      root + " [data-satc-el='title'] { order: 2; flex: 1 1 0 !important; min-width: 0; " +
        "white-space: normal !important; display: -webkit-box !important; -webkit-box-orient: vertical; " +
        "-webkit-line-clamp: 2; line-clamp: 2; line-height: 1.3 !important; overflow-wrap: anywhere; }\n" +
      root + " #" + BAR_ID + "-price { order: 3; flex-shrink: 0; }\n" +
      // Row 2: variants, full width and centered
      root + " #" + BAR_ID + "-variants { order: 4; flex-basis: 100% !important; justify-content: center !important; margin-top: " + rowGap + "; }\n" +
      root + " #" + BAR_ID + "-variants:empty { display: none !important; }\n" +
      // Dropdown options sit side by side as small columns (label above the field)
      variantCol + " { flex-direction: column; align-items: stretch !important; gap: 2px !important; flex: 1 1 88px; min-width: 0; max-width: 180px; }\n" +
      variantCol + " > span { font-size: 11px !important; overflow: hidden; text-overflow: ellipsis; }\n" +
      variantCol + " > div { display: block !important; width: 100%; }\n" +
      variantCol + " button { width: 100%; min-width: 0 !important; max-width: none !important; }\n" +
      // Row 3: quantity + Add to Cart (the break keeps them off row 1 when there are no variants)
      root + " .satc-break { display: block; order: 5; flex-basis: 100%; height: 0; }\n" +
      root + " #" + BAR_ID + "-quantity, " + root + " #" + BAR_ID + "-atc-btn { order: 6; margin-top: " + rowGap + "; }\n" +
      // Quantity + Add to Cart always share one row: the button takes the rest and may shrink
      root + " #" + BAR_ID + "-quantity { flex-shrink: 0; }\n" +
      root + " #" + BAR_ID + "-atc-btn { flex: 1 1 auto !important; min-width: 0; max-width: 420px; }\n" +
      root + " #" + BAR_ID + "-atc-btn span { overflow: hidden; text-overflow: ellipsis; }\n"
    );
  }

  // ─── Update Functions ──────────────────────────────────────────

  function handleVariantChange(variantName, value) {
    selectedVariants[variantName] = value;
    currentPrice = calculateVariantPrice();
    updatePriceDisplay();
    updateVariantDisplay();
    applyStockState();
  }

  function updatePriceDisplay() {
    var priceContainer = document.getElementById(BAR_ID + "-price");
    if (!priceContainer) return;
    var priceSpan = priceContainer.querySelector("span");
    if (priceSpan) {
      var displayPrice = currentPrice != null ? currentPrice : product.prices.price;
      priceSpan.textContent = formatPrice(displayPrice);
    }
  }

  function updateVariantDisplay() {
    // Re-render variants section
    var variantsContainer = document.getElementById(BAR_ID + "-variants");
    if (!variantsContainer) return;
    var newVariants = renderVariants();
    variantsContainer.replaceWith(newVariants);
    newVariants.setAttribute("data-satc-el", "variants");
    // A longer selected value can push the one-row layout onto a second line
    updateStackedLayout();
  }

  function updateQuantityDisplay() {
    var qtyDisplay = document.getElementById(BAR_ID + "-qty-display");
    if (qtyDisplay) qtyDisplay.textContent = String(quantity);
  }

  // ─── Add to Cart ───────────────────────────────────────────────

  function handleAddToCart() {
    if (isSelectionOutOfStock()) {
      showNotification("This option is out of stock", "error");
      return;
    }
    var url = generateAddToCartUrl();
    if (!url) {
      // Not all options selected
      highlightMissingVariants();
      var missing = getMissingSelections();
      showNotification(missing.length
        ? "Please select " + missing.join(", ")
        : "Please select all options before adding to cart", "error");
      return;
    }

    var btn = document.getElementById(BAR_ID + "-atc-btn");
    if (btn) {
      btn.style.opacity = "0.6";
      btn.style.pointerEvents = "none";
      var originalText = btn.querySelector("span");
      if (originalText) originalText.textContent = "Adding...";
    }

    function restoreButton() {
      if (btn) {
        btn.style.opacity = "1";
        btn.style.pointerEvents = "auto";
        var span = btn.querySelector("span");
        if (span) span.textContent = config.buttonCustomText || "Add to Cart";
        applyStockState(btn);
      }
    }

    fetch(url, { method: "GET", credentials: "include" })
      .then(function (res) {
        return res.text().then(function (html) {
          return { ok: res.ok, status: res.status, html: html };
        });
      })
      .then(function (result) {
        restoreButton();

        // Try to extract error message from the response HTML
        var errorMsg = extractErrorFromHtml(result.html);

        if (!result.ok || errorMsg) {
          showNotification(errorMsg || "Failed to add item to cart. Please try again.", "error");
          return;
        }

        // Success notification
        if (config.showSuccessNotification) {
          showNotification(config.successMessage || "Added to cart successfully!", "success");
        }

        // Redirect per merchant setting ("stay" keeps the shopper on the page)
        if (config.redirectOnSuccess === "checkout") {
          window.location.href = "/checkout";
        } else if (config.redirectOnSuccess !== "stay") {
          window.location.href = "/cart.php";
        }
      })
      .catch(function (err) {
        console.error("Sticky ATC error:", err);
        restoreButton();
        showNotification("Something went wrong. Please try again.", "error");
      });
  }

  function extractErrorFromHtml(html) {
    if (!html) return null;
    try {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, "text/html");

      // BigCommerce typically puts errors in an alertBox-message or similar container
      var selectors = [
        ".alertBox-message",
        ".alertBox--error .alertBox-message",
        ".alertBox--error",
        "[data-alert-message]",
        ".productView-info--error",
      ];

      for (var i = 0; i < selectors.length; i++) {
        var el = doc.querySelector(selectors[i]);
        if (el) {
          var text = (el.textContent || "").trim();
          if (text) return text;
        }
      }
    } catch (e) {
      // DOMParser not available or parsing failed — ignore
    }
    return null;
  }

  function highlightMissingVariants() {
    // Brief flash on variant buttons/dropdowns to indicate missing selections
    var container = document.getElementById(BAR_ID + "-variants");
    if (!container) return;
    container.style.outline = "2px solid #EF4444";
    container.style.outlineOffset = "2px";
    container.style.borderRadius = "4px";
    setTimeout(function () {
      container.style.outline = "none";
    }, 1500);
  }

  function showNotification(message, type) {
    type = type || "success";
    var existing = document.getElementById(NOTIFICATION_ID);
    if (existing) existing.remove();

    var bgColor = type === "error" ? "#EF4444" : "#10B981";
    var icon = type === "error"
      ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.5v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11" r="0.75" fill="currentColor"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><path d="M3.5 8.5L6.5 11.5L12.5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var closeIcon = '<svg width="8" height="8" viewBox="0 0 8 8" fill="none" style="flex-shrink:0;cursor:pointer;opacity:0.8" class="notif-close-btn"><line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

    var notif = document.createElement("div");
    notif.id = NOTIFICATION_ID;
    Object.assign(notif.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      backgroundColor: bgColor,
      color: "#fff",
      padding: "12px 20px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      zIndex: String((config.zIndex || 9999) + 1),
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      transition: "opacity 0.3s, transform 0.3s",
      transform: "translateX(0)",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      maxWidth: "380px",
    });
    notif.innerHTML = icon + '<span style="flex:1">' + message + '</span>' + closeIcon;

    // Close button handler
    var closeBtn = notif.querySelector('.notif-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('mouseenter', function() {
        this.style.opacity = '1';
      });
      closeBtn.addEventListener('mouseleave', function() {
        this.style.opacity = '0.8';
      });
      closeBtn.addEventListener('click', function() {
        notif.style.opacity = "0";
        notif.style.transform = "translateX(20px)";
        setTimeout(function () { notif.remove(); }, 300);
      });
    }

    document.body.appendChild(notif);

    var duration = type === "error" ? 5000 : 3000;
    setTimeout(function () {
      notif.style.opacity = "0";
      notif.style.transform = "translateX(20px)";
      setTimeout(function () { notif.remove(); }, 300);
    }, duration);
  }

  // ─── Body Padding (prevent content hiding behind fixed bar) ────

  function applyBodyPadding() {
    var bar = document.getElementById(BAR_ID);
    if (!bar) return;
    var prop = config.position === "top" ? "paddingTop" :
               config.position === "bottom" ? "paddingBottom" : null;
    if (!prop) return;
    _bodyPaddingProp = prop;
    // Read the original computed value only once so we always add to it, never double-count
    if (_bodyPaddingOriginal === null) {
      _bodyPaddingOriginal = parseFloat(window.getComputedStyle(document.body)[prop]) || 0;
    }
    var barH = bar.offsetHeight + (config.barOffset || 0);
    document.body.style[prop] = (_bodyPaddingOriginal + barH) + "px";
  }

  function removeBodyPadding() {
    if (!_bodyPaddingProp) return;
    document.body.style[_bodyPaddingProp] = _bodyPaddingOriginal > 0
      ? _bodyPaddingOriginal + "px"
      : "";
  }

  // ─── Show/Hide & Animation ─────────────────────────────────────

  function showBar() {
    if (barVisible || isHiddenOnDevice()) return;
    var bar = document.getElementById(BAR_ID);
    if (!bar) return;

    // Cancel any pending hide timer so it doesn't override this show
    if (hideBarTimer) {
      clearTimeout(hideBarTimer);
      hideBarTimer = null;
    }

    barVisible = true;
    applyBodyPadding();

    // Determine the resting transform for left/right positioned bars
    var restTransform = config.position === "left" || config.position === "right"
      ? "translateY(-50%)" : "translateY(0)";

    if (config.animation === "slide") {
      var from = config.position === "bottom" ? "translateY(100%)" :
                 config.position === "top" ? "translateY(-100%)" :
                 config.position === "left" ? "translateX(-100%)" : "translateX(100%)";
      // Set starting state with no transition so the browser doesn't animate TO the "from" position
      bar.style.transition = "none";
      bar.style.transform = from;
      bar.style.opacity = "1";
      bar.style.visibility = "visible";
      // One rAF to flush the style writes, then enable transition and animate to final position
      requestAnimationFrame(function () {
        bar.offsetHeight; // force reflow so transition starts from the "from" state
        bar.style.transition = "transform " + config.animationDuration + "ms ease";
        bar.style.transform = restTransform;
      });
    } else if (config.animation === "fade") {
      // Reset transform in case a previous slide-exit left it off-screen
      bar.style.transition = "none";
      bar.style.transform = restTransform;
      bar.style.opacity = "0";
      bar.style.visibility = "visible";
      requestAnimationFrame(function () {
        bar.offsetHeight; // force reflow
        bar.style.transition = "opacity " + config.animationDuration + "ms ease";
        bar.style.opacity = "1";
      });
    } else if (config.animation === "bounce") {
      bar.style.transition = "none";
      bar.style.transform = restTransform;
      bar.style.opacity = "1";
      bar.style.visibility = "visible";
      bar.style.animation = "satc-bounce " + config.animationDuration + "ms ease";
    } else {
      bar.style.transition = "none";
      bar.style.transform = restTransform;
      bar.style.opacity = "1";
      bar.style.visibility = "visible";
    }
  }

  function hideBar() {
    closeDropdown(false);
    var bar = document.getElementById(BAR_ID);
    if (!bar) return;

    barVisible = false;
    bar.style.transition = "opacity " + config.animationDuration + "ms ease, transform " + config.animationDuration + "ms ease";

    if (config.exitAnimation === "slide") {
      var to = config.position === "bottom" ? "translateY(100%)" :
               config.position === "top" ? "translateY(-100%)" :
               config.position === "left" ? "translateX(-100%)" : "translateX(100%)";
      bar.style.transform = to;
      bar.style.opacity = "0";
    } else if (config.exitAnimation === "fade") {
      bar.style.opacity = "0";
    } else {
      bar.style.opacity = "0";
    }

    // Store timer ID so showBar() can cancel it if the bar is re-shown before this fires
    hideBarTimer = setTimeout(function () {
      hideBarTimer = null;
      // Only set hidden if the bar hasn't been re-shown in the meantime
      if (!barVisible) {
        bar.style.visibility = "hidden";
        removeBodyPadding();
      }
    }, config.animationDuration);
  }

  // ─── Trigger Setup ─────────────────────────────────────────────

  // The theme's own Add to Cart button. Cornerstone-based Stencil themes use
  // #form-action-addToCart; the rest are fallbacks for customised themes.
  var NATIVE_ATC_SELECTORS = [
    "#form-action-addToCart",
    "[data-button-type='add-cart']",
    ".productView form[action*='cart.php'] [type='submit']",
    "form[data-cart-item-add] [type='submit']",
    "form[action*='cart.php'] [type='submit']",
  ];

  function findNativeAddToCart() {
    for (var i = 0; i < NATIVE_ATC_SELECTORS.length; i++) {
      var nodes = document.querySelectorAll(NATIVE_ATC_SELECTORS[i]);
      for (var j = 0; j < nodes.length; j++) {
        var node = nodes[j];
        // Skip our own bar and anything not rendered (display:none, hidden tabs)
        if (node.closest("#" + BAR_ID)) continue;
        if (node.getClientRects().length === 0) continue;
        return node;
      }
    }
    return null;
  }

  // "scroll" mode: show the bar as soon as the theme's Add to Cart button has
  // scrolled up out of view, hide it when the button is back on screen.
  // Returns false when there's no button to watch (caller falls back to scroll %).
  function watchNativeAddToCart() {
    if (typeof IntersectionObserver === "undefined") return false;
    var target = findNativeAddToCart();
    if (!target) return false;

    new IntersectionObserver(function (entries) {
      var entry = entries[entries.length - 1];
      // Only "scrolled past" counts — a button still below the fold hasn't been seen yet
      if (!entry.isIntersecting && entry.boundingClientRect.bottom <= 0) {
        showBar();
      } else if (barVisible) {
        hideBar();
      }
    }).observe(target);
    return true;
  }

  function setupTrigger() {
    // Device visibility is enforced in showBar(), so the trigger still works
    // after a resize/rotation onto a device the bar is enabled for.

    if (config.triggerMode === "always") {
      showBar();
    } else if (config.triggerMode === "delay") {
      setTimeout(function () { showBar(); }, (config.triggerDelay || 3) * 1000);
    } else if (!watchNativeAddToCart()) {
      // scroll trigger fallback (theme's Add to Cart button not found):
      // show once the shopper has scrolled scrollThreshold % of the page
      var threshold = config.scrollThreshold || 50;
      var scrollDebounceTimer = null;
      window.addEventListener("scroll", function () {
        if (scrollDebounceTimer) clearTimeout(scrollDebounceTimer);
        scrollDebounceTimer = setTimeout(function () {
          scrollDebounceTimer = null;
          var scrollPct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
          if (scrollPct >= threshold) {
            showBar();
          } else {
            if (barVisible) {
              hideBar();
            }
          }
        }, 50);
      }, { passive: true });
    }

    // Crossing the mobile breakpoint can switch the bar off (or back on for "always")
    window.addEventListener("resize", function () {
      if (isHiddenOnDevice()) {
        if (barVisible) hideBar();
      } else if (config.triggerMode === "always") {
        showBar();
      }
    }, { passive: true });
  }

  // ─── Dashboard Live Preview ────────────────────────────────────
  //
  // The dashboard runs this same script in an iframe (window.__SATC_PREVIEW__ = true)
  // and posts { type: "satc:config", config: <nested config> } on every settings
  // change. We re-render in place — keeping selected variants / quantity — and show
  // the bar immediately, skipping triggers and entry animations. Real storefronts
  // never set the flag, so none of this runs there.

  var IS_LIVE_PREVIEW = window.__SATC_PREVIEW__ === true;

  function revealBarInstantly() {
    var bar = document.getElementById(BAR_ID);
    if (!bar) return;
    if (isHiddenOnDevice()) return;
    bar.style.transition = "none";
    bar.style.transform = config.position === "left" || config.position === "right"
      ? "translateY(-50%)" : "translateY(0)";
    bar.style.opacity = "1";
    bar.style.visibility = "visible";
    barVisible = true;
    applyBodyPadding();
  }

  function applyPreviewConfig(nestedConfig) {
    config = flattenConfig(nestedConfig);
    if (!product) return; // init() renders once the product resolves
    removeBodyPadding();
    _bodyPaddingOriginal = null;
    barVisible = false;
    renderBar();
    revealBarInstantly();
  }

  // Re-pick the one-row vs stacked layout whenever the width changes (also in the live preview)
  window.addEventListener("resize", updateStackedLayout, { passive: true });

  if (IS_LIVE_PREVIEW) {
    window.addEventListener("message", function (e) {
      if (e.source !== window.parent) return;
      var data = e.data;
      if (!data || data.type !== "satc:config" || !data.config) return;
      applyPreviewConfig(data.config);
    });
  }

  // ─── Initialization ────────────────────────────────────────────
  //
  // Strategy: No client-side product page detection needed.
  // We send the current page path to our GraphQL proxy API which uses
  // BigCommerce's route(path:) query to determine if this is a product
  // page AND fetch all product data in a single call.
  //
  // Config is fetched in parallel (starts immediately, may come from cache).
  // Both resolve → render the bar.

  // Add preconnect hint to reduce connection latency for API calls
  (function addPreconnect() {
    try {
      var link = document.createElement("link");
      link.rel = "preconnect";
      link.href = APP_URL;
      link.crossOrigin = "anonymous";
      (document.head || document.documentElement).appendChild(link);
    } catch (e) {}
  })();

  // Start config fetch IMMEDIATELY (no DOM dependency, may resolve from cache)
  var configPromise = fetchConfig();

  // Start product/route fetch IMMEDIATELY — sends the current page path
  // to our proxy which determines page type via BigCommerce GraphQL
  var productPromise = fetchProductByPath(window.location.pathname);

  function init() {
    // Inject bounce animation keyframes
    var bounceStyle = document.createElement("style");
    bounceStyle.textContent =
      "@keyframes satc-bounce { 0% { transform: translateY(20px); opacity: 0; } " +
      "50% { transform: translateY(-5px); opacity: 1; } " +
      "100% { transform: translateY(0); opacity: 1; } }";
    document.head.appendChild(bounceStyle);

    // Resolve BOTH promises in parallel
    var allPromise = Promise.all([configPromise, productPromise]);

    allPromise
      .then(function (results) {
        var nestedConfig = results[0];
        var productResult = results[1]; // { isProductPage, product }

        // Not a product page — nothing to render
        if (!productResult || !productResult.isProductPage || !productResult.product) return;

        // No config available
        if (!nestedConfig) return;

        // A live-preview config may have arrived while the fetches were in flight
        if (!config) config = flattenConfig(nestedConfig);

        product = productResult.product;

        // Initialize variant state
        initSelectedVariants();
        currentPrice = calculateVariantPrice();

        if (IS_LIVE_PREVIEW) {
          renderBar();
          revealBarInstantly();
          return;
        }

        if (!config.enabled) return;

        // Render the bar
        renderBar();

        // Keep body padding in sync with bar height changes (e.g. viewport resize causing wrapping)
        if (typeof ResizeObserver !== "undefined") {
          var barEl = document.getElementById(BAR_ID);
          if (barEl) {
            new ResizeObserver(function () {
              if (barVisible) applyBodyPadding();
            }).observe(barEl);
          }
        }

        // Setup trigger behavior
        setupTrigger();
      })
      .catch(function (err) {
        console.error("Sticky Add to Cart initialization error:", err);
      });
  }

  // Run when DOM is ready (both fetches are already in flight)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
