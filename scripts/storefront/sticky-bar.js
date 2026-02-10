/**
 * Sticky Add to Cart Bar - Storefront Script
 * Injected into BigCommerce merchant storefronts via the Scripts API.
 * Renders a configurable sticky bar on product pages with variant selection and add-to-cart.
 */
(function () {
  "use strict";

  // ─── Script Tag Attributes ─────────────────────────────────────
  var SCRIPT_TAG = document.currentScript;
  var STORE_ID = SCRIPT_TAG ? SCRIPT_TAG.getAttribute("data-store-id") : null;
  var APP_URL = SCRIPT_TAG ? SCRIPT_TAG.getAttribute("data-app-url") : null;

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
  var barDismissed = false;

  // ─── Product Page Detection ────────────────────────────────────

  function getProductId() {
    // 1. BigCommerce's standard BCData
    if (window.BCData && window.BCData.product_id) return window.BCData.product_id;
    // 2. Add-to-cart form hidden input
    var input = document.querySelector('input[name="product_id"]');
    if (input && input.value) return input.value;
    // 3. Data attribute
    var el = document.querySelector("[data-product-id]");
    if (el) return el.getAttribute("data-product-id");
    return null;
  }

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
      variantDisplayStyle: vs.displayStyle || "buttons",
      variantActiveColor: vs.activeColor || "#2563EB",
      variantBorderColor: vs.borderColor || "#E5E7EB",
      variantTextColor: vs.textColor || "#6B7280",
      variantBorderRadius: vs.borderRadius !== undefined ? vs.borderRadius : 6,
      quantityStyle: qs.style || "plusMinus",
      quantityBorderColor: qs.borderColor || "#E5E7EB",
      quantityBorderRadius: qs.borderRadius !== undefined ? qs.borderRadius : 8,
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
      barOffset: sp.barOffset || 0,
      barWidthMode: bw.mode || "full",
      barMaxWidth: bw.maxWidth || 1200,
      contentAlignment: bw.contentAlignment || "center",
      verticalAlignment: bw.verticalAlignment || "center",
      triggerMode: di.triggerMode || "scroll",
      triggerDelay: di.triggerDelay !== undefined ? di.triggerDelay : 3,
      scrollThreshold: di.scrollThreshold !== undefined ? di.scrollThreshold : 50,
      showCloseButton: di.showCloseButton || false,
      closeBehavior: di.closeBehavior || "hideTemporary",
      animation: an.type || "slide",
      animationDuration: an.duration !== undefined ? an.duration : 300,
      exitAnimation: an.exitType || "slide",
      cartAction: cb.action || "stayOnPage",
      showSuccessNotification: cb.showSuccessNotification !== undefined ? cb.showSuccessNotification : true,
      successMessage: cb.successMessage || "Added to cart successfully!",
      autoHideAfterATC: cb.autoHideAfterATC || false,
      autoHideDelay: cb.autoHideDelay !== undefined ? cb.autoHideDelay : 3,
      showOnMobile: mo.enabled !== undefined ? mo.enabled : true,
      mobileCompact: mo.compactMode !== undefined ? mo.compactMode : true,
      mobileBreakpoint: mo.breakpoint || 768,
      zIndex: ad.zIndex || 9999,
      customCssClass: ad.customCssClass || "",
    };
  }

  // ─── API Calls ─────────────────────────────────────────────────

  function fetchConfig() {
    return fetch(APP_URL + "/api/storefront/config?sid=" + encodeURIComponent(STORE_ID))
      .then(function (res) {
        if (!res.ok) throw new Error("Config fetch failed");
        return res.json();
      })
      .then(function (data) {
        return data.config || null;
      });
  }

  function fetchProductData(productId) {
    return fetch(
      APP_URL + "/api/storefront/product?sid=" + encodeURIComponent(STORE_ID) + "&productId=" + encodeURIComponent(productId)
    )
      .then(function (res) {
        if (!res.ok) throw new Error("Product fetch failed");
        return res.json();
      })
      .then(function (data) {
        return data.product || null;
      });
  }

  // ─── Variant Logic (same pattern as reference code) ────────────

  function initSelectedVariants() {
    selectedVariants = {};
    if (!product || !product.variantLabels) return;
    var labels = product.variantLabels;
    for (var name in labels) {
      if (labels.hasOwnProperty(name)) {
        selectedVariants[name] = "";
      }
    }
  }

  function calculateVariantPrice() {
    if (!product || !product.variants) return null;

    var variantOptions = [];
    for (var name in selectedVariants) {
      if (selectedVariants.hasOwnProperty(name) && selectedVariants[name]) {
        variantOptions.push(name + ":" + selectedVariants[name] + ",");
      }
    }

    // Need all options selected
    var allSelected = true;
    for (var n in selectedVariants) {
      if (selectedVariants.hasOwnProperty(n) && !selectedVariants[n]) {
        allSelected = false;
        break;
      }
    }
    if (!allSelected) return null;

    for (var i = 0; i < product.variants.length; i++) {
      var variant = product.variants[i];
      var allMatch = variantOptions.every(function (option) {
        return variant.variantKey.includes(option);
      });
      if (allMatch) {
        return variant.price;
      }
    }
    return null;
  }

  function generateAddToCartUrl() {
    if (!product) return null;

    // Check all variant options are selected
    for (var n in selectedVariants) {
      if (selectedVariants.hasOwnProperty(n) && !selectedVariants[n]) {
        return null;
      }
    }

    var url = "/cart.php?action=add&product_id=" + product.entityId;

    var variantOptions = [];
    for (var name in selectedVariants) {
      if (selectedVariants.hasOwnProperty(name) && selectedVariants[name]) {
        variantOptions.push(name + ":" + selectedVariants[name] + ",");
      }
    }

    for (var i = 0; i < product.variants.length; i++) {
      var variant = product.variants[i];
      var allMatch = variantOptions.every(function (option) {
        return variant.variantKey.includes(option);
      });

      if (allMatch) {
        // For each selected variant, find the option ID and value entity ID
        for (var variantName in selectedVariants) {
          if (!selectedVariants.hasOwnProperty(variantName)) continue;
          var value = selectedVariants[variantName];
          for (var j = 0; j < product.options.length; j++) {
            var opt = product.options[j];
            if (opt.name === variantName && opt.isVariantOption) {
              url += "&attribute[" + opt.id + "]=" + variant.optionsIds[value];
            }
          }
        }
        break;
      }
    }

    url += "&qty=" + quantity;
    return url;
  }

  // ─── Helpers ───────────────────────────────────────────────────

  function isMobile() {
    return window.innerWidth <= (config ? config.mobileBreakpoint : 768);
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
    var map = { left: "flex-start", center: "center", right: "flex-end", spaceBetween: "space-between" };
    return map[alignment] || "center";
  }

  function getVerticalAlignValue(alignment) {
    var map = { top: "flex-start", center: "center", bottom: "flex-end" };
    return map[alignment] || "center";
  }

  function formatPrice(price) {
    if (price == null) return "";
    return "$" + Number(price).toFixed(2);
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

  function renderVariants() {
    var container = el("div", { id: BAR_ID + "-variants", style: { flexShrink: "0" } });

    if (!product.variantLabels || Object.keys(product.variantLabels).length === 0) {
      return container;
    }

    for (var optionName in product.variantLabels) {
      if (!product.variantLabels.hasOwnProperty(optionName)) continue;
      var values = product.variantLabels[optionName];

      if (config.variantDisplayStyle === "dropdown") {
        var wrapper = el("div", { style: { position: "relative", display: "inline-block", marginRight: "8px" } });
        var select = el("select", {
          "data-variant-name": optionName,
          style: {
            padding: "4px 24px 4px 8px",
            fontSize: (config.fontSize - 2) + "px",
            border: "1px solid " + config.variantBorderColor,
            borderRadius: config.variantBorderRadius + "px",
            color: config.variantTextColor,
            backgroundColor: "#fff",
            appearance: "none",
            WebkitAppearance: "none",
            cursor: "pointer",
            minWidth: "70px",
          },
          onChange: function (e) {
            handleVariantChange(e.target.getAttribute("data-variant-name"), e.target.value);
          },
        });
        var defaultOpt = el("option", { value: "" }, optionName);
        select.appendChild(defaultOpt);
        values.forEach(function (val) {
          var opt = el("option", { value: val }, val);
          if (selectedVariants[optionName] === val) opt.selected = true;
          select.appendChild(opt);
        });
        wrapper.appendChild(select);
        container.appendChild(wrapper);
      } else {
        // Button style
        var btnGroup = el("div", {
          style: { display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" },
        });
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
              handleVariantChange(t.getAttribute("data-variant-name"), t.getAttribute("data-variant-value"));
            },
          }, val);
          btnGroup.appendChild(btn);
        });
        container.appendChild(btnGroup);
      }
    }

    return container;
  }

  function renderQuantity() {
    var container = el("div", { id: BAR_ID + "-quantity", style: { flexShrink: "0" } });

    if (config.quantityStyle === "dropdown") {
      var select = el("select", {
        style: {
          padding: "4px 24px 4px 8px",
          fontSize: "12px",
          border: "1px solid " + config.quantityBorderColor,
          borderRadius: config.quantityBorderRadius + "px",
          backgroundColor: "#fff",
          appearance: "none",
          WebkitAppearance: "none",
          cursor: "pointer",
          minWidth: "50px",
        },
        onChange: function (e) {
          quantity = parseInt(e.target.value, 10);
        },
      });
      for (var i = 1; i <= 10; i++) {
        var opt = el("option", { value: String(i) }, String(i));
        if (i === quantity) opt.selected = true;
        select.appendChild(opt);
      }
      container.appendChild(select);
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
        },
      });
      var minusBtn = el("button", {
        style: {
          padding: "4px 8px",
          fontSize: "12px",
          color: "#9CA3AF",
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
          fontSize: "12px",
          fontWeight: "500",
          color: "#374151",
          borderLeft: "1px solid " + config.quantityBorderColor,
          borderRight: "1px solid " + config.quantityBorderColor,
          lineHeight: "1",
        },
      }, String(quantity));
      var plusBtn = el("button", {
        style: {
          padding: "4px 8px",
          fontSize: "12px",
          color: "#9CA3AF",
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

    var btn = el("button", {
      id: BAR_ID + "-atc-btn",
      style: style,
      onClick: handleAddToCart,
      onMouseenter: function (e) {
        if (config.buttonStyle === "filled" || config.buttonStyle === "pill") {
          e.currentTarget.style.backgroundColor = config.buttonHoverBgColor;
        } else {
          e.currentTarget.style.opacity = "0.8";
        }
      },
      onMouseleave: function (e) {
        if (config.buttonStyle === "filled" || config.buttonStyle === "pill") {
          e.currentTarget.style.backgroundColor = config.buttonBgColor;
        } else {
          e.currentTarget.style.opacity = "1";
        }
      },
    }, children);

    return btn;
  }

  // ─── Bar Rendering ─────────────────────────────────────────────

  function renderBar() {
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

    var elementNodes = [];
    visibleElements.forEach(function (elem) {
      var node = null;
      switch (elem.id) {
        case "image": node = renderImage(); break;
        case "title": node = renderTitle(); break;
        case "price": node = renderPrice(); break;
        case "variants": node = renderVariants(); break;
        case "quantity": node = renderQuantity(); break;
        case "button": node = renderButton(); break;
      }
      if (node) elementNodes.push(node);
    });

    // Inner content container
    var inner = el("div", {
      style: {
        display: "flex",
        flexDirection: isHoriz ? "row" : "column",
        alignItems: isHoriz ? getVerticalAlignValue(config.verticalAlignment) : "center",
        justifyContent: isHoriz ? getAlignmentValue(config.contentAlignment) : undefined,
        gap: (config.elementGap || 12) + "px",
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
    }, elementNodes);

    // Close button
    if (config.showCloseButton) {
      var closeBtn = el("div", {
        style: {
          position: "absolute",
          top: "4px",
          right: "4px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "rgba(229,231,235,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "background-color 0.15s",
        },
        onClick: handleClose,
        onMouseenter: function (e) { e.currentTarget.style.backgroundColor = "rgba(209,213,219,0.8)"; },
        onMouseleave: function (e) { e.currentTarget.style.backgroundColor = "rgba(229,231,235,0.8)"; },
      }, [svgIcon("x")]);
      inner.appendChild(closeBtn);
    }

    // Width container
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
  }

  function buildCSS() {
    return (
      "#" + BAR_ID + " * { box-sizing: border-box; margin: 0; padding: 0; }\n" +
      "#" + BAR_ID + " button { font-family: inherit; }\n" +
      "#" + BAR_ID + " select { font-family: inherit; }\n" +
      "#" + BAR_ID + " input { font-family: inherit; }\n" +
      "#" + BAR_ID + " img { display: block; }\n"
    );
  }

  // ─── Update Functions ──────────────────────────────────────────

  function handleVariantChange(variantName, value) {
    selectedVariants[variantName] = value;
    currentPrice = calculateVariantPrice();
    updatePriceDisplay();
    updateVariantDisplay();
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
  }

  function updateQuantityDisplay() {
    var qtyDisplay = document.getElementById(BAR_ID + "-qty-display");
    if (qtyDisplay) qtyDisplay.textContent = String(quantity);
  }

  // ─── Add to Cart ───────────────────────────────────────────────

  function handleAddToCart() {
    var url = generateAddToCartUrl();
    if (!url) {
      // Not all options selected
      highlightMissingVariants();
      return;
    }

    var btn = document.getElementById(BAR_ID + "-atc-btn");
    if (btn) {
      btn.style.opacity = "0.6";
      btn.style.pointerEvents = "none";
      var originalText = btn.querySelector("span");
      if (originalText) originalText.textContent = "Adding...";
    }

    fetch(url, { method: "GET", credentials: "include" })
      .then(function (res) {
        if (!res.ok) throw new Error("Add to cart failed");

        // Restore button
        if (btn) {
          btn.style.opacity = "1";
          btn.style.pointerEvents = "auto";
          var span = btn.querySelector("span");
          if (span) span.textContent = config.buttonCustomText || "Add to Cart";
        }

        // Success notification
        if (config.showSuccessNotification) {
          showNotification(config.successMessage || "Added to cart successfully!");
        }

        // Cart action
        if (config.cartAction === "redirect") {
          window.location.href = "/cart.php";
        }

        // Auto-hide
        if (config.autoHideAfterATC) {
          setTimeout(function () { hideBar(); }, (config.autoHideDelay || 3) * 1000);
        }
      })
      .catch(function (err) {
        console.error("Sticky ATC error:", err);
        if (btn) {
          btn.style.opacity = "1";
          btn.style.pointerEvents = "auto";
          var span = btn.querySelector("span");
          if (span) span.textContent = config.buttonCustomText || "Add to Cart";
        }
      });
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

  function showNotification(message) {
    var existing = document.getElementById(NOTIFICATION_ID);
    if (existing) existing.remove();

    var notif = el("div", {
      id: NOTIFICATION_ID,
      style: {
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "#10B981",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        zIndex: String((config.zIndex || 9999) + 1),
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        transition: "opacity 0.3s, transform 0.3s",
        transform: "translateX(0)",
      },
    }, message);

    document.body.appendChild(notif);

    setTimeout(function () {
      notif.style.opacity = "0";
      notif.style.transform = "translateX(20px)";
      setTimeout(function () { notif.remove(); }, 300);
    }, 3000);
  }

  // ─── Show/Hide & Animation ─────────────────────────────────────

  function showBar() {
    if (barVisible || barDismissed) return;
    var bar = document.getElementById(BAR_ID);
    if (!bar) return;

    barVisible = true;
    bar.style.visibility = "visible";
    bar.style.transition = "opacity " + config.animationDuration + "ms ease, transform " + config.animationDuration + "ms ease";

    if (config.animation === "slide") {
      var from = config.position === "bottom" ? "translateY(100%)" :
                 config.position === "top" ? "translateY(-100%)" :
                 config.position === "left" ? "translateX(-100%)" : "translateX(100%)";
      bar.style.transform = from;
      bar.style.opacity = "1";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          bar.style.transform = config.position === "left" || config.position === "right"
            ? "translateY(-50%)" : "translateY(0)";
        });
      });
    } else if (config.animation === "fade") {
      bar.style.opacity = "0";
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          bar.style.opacity = "1";
        });
      });
    } else if (config.animation === "bounce") {
      bar.style.opacity = "1";
      bar.style.animation = "satc-bounce " + config.animationDuration + "ms ease";
    } else {
      bar.style.opacity = "1";
    }
  }

  function hideBar() {
    var bar = document.getElementById(BAR_ID);
    if (!bar) return;

    barVisible = false;
    bar.style.transition = "opacity " + config.animationDuration + "ms ease, transform " + config.animationDuration + "ms ease";

    if (config.exitAnimation === "slide") {
      var to = config.position === "bottom" ? "translateY(100%)" :
               config.position === "top" ? "translateY(-100%)" :
               config.position === "left" ? "translateX(-100%)" : "translateX(100%)";
      bar.style.transform = to;
    } else if (config.exitAnimation === "fade") {
      bar.style.opacity = "0";
    } else {
      bar.style.opacity = "0";
    }

    setTimeout(function () {
      bar.style.visibility = "hidden";
    }, config.animationDuration);
  }

  function handleClose() {
    hideBar();
    barDismissed = true;

    if (config.closeBehavior === "hideForever") {
      try { sessionStorage.setItem("satc-dismissed", "1"); } catch (e) {}
    } else if (config.closeBehavior === "hideUntilScroll") {
      barDismissed = false; // will re-show on next scroll trigger
      // Temporarily suppress for a moment
      setTimeout(function () { barDismissed = false; }, 500);
    } else if (config.closeBehavior === "hideTemporary") {
      setTimeout(function () {
        barDismissed = false;
      }, (config.autoHideDelay || 3) * 1000);
    }
  }

  // ─── Trigger Setup ─────────────────────────────────────────────

  function setupTrigger() {
    // Check if previously dismissed forever
    try {
      if (sessionStorage.getItem("satc-dismissed") === "1") {
        barDismissed = true;
        return;
      }
    } catch (e) {}

    // Mobile check
    if (isMobile() && !config.showOnMobile) return;

    if (config.triggerMode === "always") {
      showBar();
    } else if (config.triggerMode === "delay") {
      setTimeout(function () { showBar(); }, (config.triggerDelay || 3) * 1000);
    } else {
      // scroll trigger
      var threshold = config.scrollThreshold || 50;
      window.addEventListener("scroll", function () {
        var scrollPct = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPct >= threshold) {
          showBar();
        } else {
          if (barVisible && !barDismissed) {
            hideBar();
          }
        }
      }, { passive: true });
    }

    // Handle resize for mobile toggle
    window.addEventListener("resize", function () {
      if (isMobile() && !config.showOnMobile) {
        hideBar();
      }
    }, { passive: true });
  }

  // ─── Initialization ────────────────────────────────────────────

  function init() {
    var productId = getProductId();
    if (!productId) return; // Not a product page

    // Inject bounce animation keyframes
    var bounceStyle = document.createElement("style");
    bounceStyle.textContent =
      "@keyframes satc-bounce { 0% { transform: translateY(20px); opacity: 0; } " +
      "50% { transform: translateY(-5px); opacity: 1; } " +
      "100% { transform: translateY(0); opacity: 1; } }";
    document.head.appendChild(bounceStyle);

    // Fetch config, then product data
    fetchConfig()
      .then(function (nestedConfig) {
        if (!nestedConfig) return;
        config = flattenConfig(nestedConfig);

        if (!config.enabled) return;

        return fetchProductData(productId);
      })
      .then(function (productData) {
        if (!productData || !config) return;
        product = productData;

        // Initialize variant state
        initSelectedVariants();
        currentPrice = calculateVariantPrice();

        // Render the bar
        renderBar();

        // Setup trigger behavior
        setupTrigger();
      })
      .catch(function (err) {
        console.error("Sticky Add to Cart initialization error:", err);
      });
  }

  // Run when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
