import { DefaultStickyBarConfig, StickyBarConfig } from "@/types/config";
import { defaultStickyBarConfig } from "./defaultConfig";

/**
 * Converts flat default config format to nested Firebase config format
 * Used during installation and dashboard saves
 */
export function flattenToNestedConfig(config: DefaultStickyBarConfig): StickyBarConfig {
  return {
    styling: {
      barAppearance: {
        background: config.barBgColor,
        gradientEnabled: config.barGradientEnabled,
        gradientFrom: config.barGradientFrom,
        gradientTo: config.barGradientTo,
        gradientDirection: config.barGradientDirection,
        borderRadius: config.barBorderRadius,
        padding: config.barPadding,
        shadow: config.barShadow,
        borderColor: config.barBorderColor,
        borderWidth: config.barBorderWidth,
        opacity: config.barOpacity,
      },
      typography: {
        titleColor: config.titleColor,
        titleFontWeight: config.titleFontWeight,
        priceColor: config.priceColor,
        priceFontWeight: config.priceFontWeight,
        discountedPriceColor: config.discountedPriceColor,
        comparePriceStyle: config.comparePriceStyle,
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        titleLetterSpacing: config.titleLetterSpacing,
        textTransform: config.textTransform,
      },
      buttonStyling: {
        background: config.buttonBgColor,
        textColor: config.buttonTextColor,
        hoverBackground: config.buttonHoverBgColor,
        borderRadius: config.buttonBorderRadius,
        style: config.buttonStyle,
        borderColor: config.buttonBorderColor,
        borderWidth: config.buttonBorderWidth,
        customText: config.buttonCustomText,
        showIcon: config.buttonShowIcon,
        shadow: config.buttonShadow,
        fontWeight: config.buttonFontWeight,
        paddingX: config.buttonPaddingX,
        paddingY: config.buttonPaddingY,
      },
      imageStyling: {
        size: config.imageSize,
        borderRadius: config.imageBorderRadius,
        borderColor: config.imageBorderColor,
        borderWidth: config.imageBorderWidth,
      },
      variantStyling: {
        options: config.variantOptions,
        showLabels: config.variantShowLabels,
        activeColor: config.variantActiveColor,
        borderColor: config.variantBorderColor,
        textColor: config.variantTextColor,
        borderRadius: config.variantBorderRadius,
      },
      quantityStyling: {
        style: config.quantityStyle,
        borderColor: config.quantityBorderColor,
        borderRadius: config.quantityBorderRadius,
        textColor: config.quantityTextColor,
        bgColor: config.quantityBgColor,
        buttonColor: config.quantityButtonColor,
      },
    },
    layout: {
      elementArrangement: {
        elements: config.elements,
      },
      position: {
        position: config.position,
      },
      barWidth: {
        mode: config.barWidthMode,
        maxWidth: config.barMaxWidth,
        contentMaxWidth: config.contentMaxWidth,
        contentAlignment: config.contentAlignment,
        verticalAlignment: config.verticalAlignment,
      },
      spacing: {
        elementGap: config.elementGap,
        groupGap: config.groupGap,
        barOffset: config.barOffset,
      },
    },
    behavior: {
      display: {
        enabled: config.enabled,
        triggerMode: config.triggerMode,
        triggerDelay: config.triggerDelay,
        scrollThreshold: config.scrollThreshold,
      },
      animation: {
        type: config.animation,
        duration: config.animationDuration,
        exitType: config.exitAnimation,
      },
      cartBehavior: {
        action: config.cartAction,
        showSuccessNotification: config.showSuccessNotification,
        successMessage: config.successMessage,
      },
      mobile: {
        enabled: config.showOnMobile,
        compactMode: config.mobileCompact,
        breakpoint: config.mobileBreakpoint,
      },
      advanced: {
        zIndex: config.zIndex,
        customCssClass: config.customCssClass,
      },
    },
  };
}

/**
 * Converts nested Firebase config format to flat default config format
 * Used when loading config in the dashboard
 */
export function nestedToFlattenConfig(nested: StickyBarConfig): DefaultStickyBarConfig {
  const d = defaultStickyBarConfig;
  return {
    // Display
    enabled: nested.behavior?.display?.enabled ?? d.enabled,

    // Bar Appearance
    barBgColor: nested.styling?.barAppearance?.background ?? d.barBgColor,
    barGradientEnabled: nested.styling?.barAppearance?.gradientEnabled ?? d.barGradientEnabled,
    barGradientFrom: nested.styling?.barAppearance?.gradientFrom ?? d.barGradientFrom,
    barGradientTo: nested.styling?.barAppearance?.gradientTo ?? d.barGradientTo,
    barGradientDirection: nested.styling?.barAppearance?.gradientDirection ?? d.barGradientDirection,
    barBorderRadius: nested.styling?.barAppearance?.borderRadius ?? d.barBorderRadius,
    barPadding: nested.styling?.barAppearance?.padding ?? d.barPadding,
    barShadow: nested.styling?.barAppearance?.shadow ?? d.barShadow,
    barBorderColor: nested.styling?.barAppearance?.borderColor ?? d.barBorderColor,
    barBorderWidth: nested.styling?.barAppearance?.borderWidth ?? d.barBorderWidth,
    barOpacity: nested.styling?.barAppearance?.opacity ?? d.barOpacity,

    // Typography
    titleColor: nested.styling?.typography?.titleColor ?? d.titleColor,
    titleFontWeight: nested.styling?.typography?.titleFontWeight ?? d.titleFontWeight,
    priceColor: nested.styling?.typography?.priceColor ?? d.priceColor,
    priceFontWeight: nested.styling?.typography?.priceFontWeight ?? d.priceFontWeight,
    discountedPriceColor: nested.styling?.typography?.discountedPriceColor ?? d.discountedPriceColor,
    comparePriceStyle: nested.styling?.typography?.comparePriceStyle ?? d.comparePriceStyle,
    fontFamily: nested.styling?.typography?.fontFamily ?? d.fontFamily,
    fontSize: nested.styling?.typography?.fontSize ?? d.fontSize,
    titleLetterSpacing: nested.styling?.typography?.titleLetterSpacing ?? d.titleLetterSpacing,
    textTransform: nested.styling?.typography?.textTransform ?? d.textTransform,

    // Button Styling
    buttonBgColor: nested.styling?.buttonStyling?.background ?? d.buttonBgColor,
    buttonTextColor: nested.styling?.buttonStyling?.textColor ?? d.buttonTextColor,
    buttonHoverBgColor: nested.styling?.buttonStyling?.hoverBackground ?? d.buttonHoverBgColor,
    buttonBorderRadius: nested.styling?.buttonStyling?.borderRadius ?? d.buttonBorderRadius,
    buttonStyle: nested.styling?.buttonStyling?.style ?? d.buttonStyle,
    buttonBorderColor: nested.styling?.buttonStyling?.borderColor ?? d.buttonBorderColor,
    buttonBorderWidth: nested.styling?.buttonStyling?.borderWidth ?? d.buttonBorderWidth,
    buttonCustomText: nested.styling?.buttonStyling?.customText ?? d.buttonCustomText,
    buttonShowIcon: nested.styling?.buttonStyling?.showIcon ?? d.buttonShowIcon,
    buttonShadow: nested.styling?.buttonStyling?.shadow ?? d.buttonShadow,
    buttonFontWeight: nested.styling?.buttonStyling?.fontWeight ?? d.buttonFontWeight,
    buttonPaddingX: nested.styling?.buttonStyling?.paddingX ?? d.buttonPaddingX,
    buttonPaddingY: nested.styling?.buttonStyling?.paddingY ?? d.buttonPaddingY,

    // Image Styling
    imageSize: nested.styling?.imageStyling?.size ?? d.imageSize,
    imageBorderRadius: nested.styling?.imageStyling?.borderRadius ?? d.imageBorderRadius,
    imageBorderColor: nested.styling?.imageStyling?.borderColor ?? d.imageBorderColor,
    imageBorderWidth: nested.styling?.imageStyling?.borderWidth ?? d.imageBorderWidth,

    // Variant Styling
    variantOptions: nested.styling?.variantStyling?.options ?? d.variantOptions,
    variantShowLabels: nested.styling?.variantStyling?.showLabels ?? d.variantShowLabels,
    variantActiveColor: nested.styling?.variantStyling?.activeColor ?? d.variantActiveColor,
    variantBorderColor: nested.styling?.variantStyling?.borderColor ?? d.variantBorderColor,
    variantTextColor: nested.styling?.variantStyling?.textColor ?? d.variantTextColor,
    variantBorderRadius: nested.styling?.variantStyling?.borderRadius ?? d.variantBorderRadius,

    // Quantity Styling
    quantityStyle: nested.styling?.quantityStyling?.style ?? d.quantityStyle,
    quantityBorderColor: nested.styling?.quantityStyling?.borderColor ?? d.quantityBorderColor,
    quantityBorderRadius: nested.styling?.quantityStyling?.borderRadius ?? d.quantityBorderRadius,
    quantityTextColor: nested.styling?.quantityStyling?.textColor ?? d.quantityTextColor,
    quantityBgColor: nested.styling?.quantityStyling?.bgColor ?? d.quantityBgColor,
    quantityButtonColor: nested.styling?.quantityStyling?.buttonColor ?? d.quantityButtonColor,

    // Layout
    position: nested.layout?.position?.position ?? d.position,
    elements: (nested.layout?.elementArrangement?.elements ?? d.elements).map((el: { id: string; label: string; visible: boolean; group?: "left" | "right" }) => ({
      ...el,
      group: el.group ?? (["image", "title", "price"].includes(el.id) ? "left" : "right"),
    })),
    elementGap: nested.layout?.spacing?.elementGap ?? d.elementGap,
    groupGap: nested.layout?.spacing?.groupGap ?? d.groupGap,
    barOffset: nested.layout?.spacing?.barOffset ?? d.barOffset,
    barWidthMode: nested.layout?.barWidth?.mode ?? d.barWidthMode,
    barMaxWidth: nested.layout?.barWidth?.maxWidth ?? d.barMaxWidth,
    contentMaxWidth: nested.layout?.barWidth?.contentMaxWidth ?? d.contentMaxWidth,
    contentAlignment: nested.layout?.barWidth?.contentAlignment ?? d.contentAlignment,
    verticalAlignment: nested.layout?.barWidth?.verticalAlignment ?? d.verticalAlignment,

    // Behavior - Display
    triggerMode: nested.behavior?.display?.triggerMode ?? d.triggerMode,
    triggerDelay: nested.behavior?.display?.triggerDelay ?? d.triggerDelay,
    scrollThreshold: nested.behavior?.display?.scrollThreshold ?? d.scrollThreshold,
    // Behavior - Animation
    animation: nested.behavior?.animation?.type ?? d.animation,
    animationDuration: nested.behavior?.animation?.duration ?? d.animationDuration,
    exitAnimation: nested.behavior?.animation?.exitType ?? d.exitAnimation,

    // Behavior - Cart
    cartAction: nested.behavior?.cartBehavior?.action ?? d.cartAction,
    showSuccessNotification: nested.behavior?.cartBehavior?.showSuccessNotification ?? d.showSuccessNotification,
    successMessage: nested.behavior?.cartBehavior?.successMessage ?? d.successMessage,
    // Behavior - Mobile
    showOnMobile: nested.behavior?.mobile?.enabled ?? d.showOnMobile,
    mobileCompact: nested.behavior?.mobile?.compactMode ?? d.mobileCompact,
    mobileBreakpoint: nested.behavior?.mobile?.breakpoint ?? d.mobileBreakpoint,

    // Advanced
    zIndex: nested.behavior?.advanced?.zIndex ?? d.zIndex,
    customCssClass: nested.behavior?.advanced?.customCssClass ?? d.customCssClass,
  };
}
