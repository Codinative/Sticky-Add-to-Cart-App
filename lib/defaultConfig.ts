import { DefaultStickyBarConfig } from "@/types/config";

export const defaultStickyBarConfig: DefaultStickyBarConfig = {
    // Display
    enabled: true,

    // Bar Appearance
    barBgColor: "#FFFFFF",
    barGradientEnabled: false,
    barGradientFrom: "#FFFFFF",
    barGradientTo: "#F3F4F6",
    barGradientDirection: "horizontal",
    barBorderRadius: 0,
    barPadding: 12,
    barShadow: "lg",
    barBorderColor: "#E5E7EB",
    barBorderWidth: 0,
    barOpacity: 100,

    // Typography
    titleColor: "#1F2937",
    titleFontWeight: "600",
    priceColor: "#1F2937",
    priceFontWeight: "700",
    discountedPriceColor: "#9CA3AF",
    comparePriceStyle: "strikethrough",
    fontFamily: "inherit",
    fontSize: 14,
    titleLetterSpacing: 0,
    textTransform: "none",

    // Button Styling
    buttonBgColor: "#2563EB",
    buttonTextColor: "#FFFFFF",
    buttonHoverBgColor: "#1D4ED8",
    buttonBorderRadius: 8,
    buttonStyle: "filled",
    buttonBorderColor: "#2563EB",
    buttonBorderWidth: 2,
    buttonCustomText: "Add to Cart",
    buttonShowIcon: true,
    buttonShadow: "none",
    buttonFontWeight: "600",
    buttonPaddingX: 24,
    buttonPaddingY: 10,

    // Image Styling
    imageSize: 56,
    imageBorderRadius: 8,
    imageBorderColor: "#E5E7EB",
    imageBorderWidth: 0,

    // Variant Styling
    variantOptions: [
      { name: "Size", displayType: "rectangleList" },
      { name: "Color", displayType: "swatch" },
    ],
    variantShowLabels: true,
    variantActiveColor: "#2563EB",
    variantBorderColor: "#E5E7EB",
    variantTextColor: "#6B7280",
    variantBorderRadius: 6,

    // Quantity Styling
    quantityStyle: "plusMinus",
    quantityBorderColor: "#E5E7EB",
    quantityBorderRadius: 8,
    quantityTextColor: "#374151",
    quantityBgColor: "#FFFFFF",
    quantityButtonColor: "#9CA3AF",

    // Layout
    position: "bottom",
    elements: [
      { id: "image", label: "Product Image", visible: true },
      { id: "title", label: "Product Title", visible: true },
      { id: "price", label: "Price", visible: true },
      { id: "variants", label: "Variant Selector", visible: true },
      { id: "quantity", label: "Quantity Picker", visible: true },
      { id: "button", label: "Add to Cart Button", visible: true },
    ],
    elementGap: 12,
    groupGap: 32,
    barOffset: 0,
    barWidthMode: "full",
    barMaxWidth: 1200,
    contentMaxWidth: 0,
    contentAlignment: "spaceBetween",
    verticalAlignment: "center",

    // Behavior - Display
    triggerMode: "scroll",
    triggerDelay: 3,
    scrollThreshold: 50,
    showCloseButton: false,
    closeBehavior: "hideTemporary",

    // Behavior - Animation
    animation: "slide",
    animationDuration: 300,
    exitAnimation: "slide",

    // Behavior - Cart
    cartAction: "stayOnPage",
    showSuccessNotification: true,
    successMessage: "Added to cart successfully!",
    autoHideAfterATC: false,
    autoHideDelay: 3,

    // Behavior - Mobile
    showOnMobile: true,
    mobileCompact: true,
    mobileBreakpoint: 768,

    // Advanced
    zIndex: 9999,
    customCssClass: "",
};
