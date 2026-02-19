export interface DefaultStickyBarConfig {
    // Display
    enabled: boolean;

    // Bar Appearance
    barBgColor: string;
    barGradientEnabled: boolean;
    barGradientFrom: string;
    barGradientTo: string;
    barGradientDirection: "horizontal" | "vertical" | "diagonal";
    barBorderRadius: number;
    barPadding: number;
    barShadow: string;
    barBorderColor: string;
    barBorderWidth: number;
    barOpacity: number;

    // Typography
    titleColor: string;
    titleFontWeight: string;
    priceColor: string;
    priceFontWeight: string;
    discountedPriceColor: string;
    comparePriceStyle: "strikethrough" | "badge";
    fontFamily: string;
    fontSize: number;
    titleLetterSpacing: number;
    textTransform: "none" | "uppercase" | "lowercase" | "capitalize";

    // Button Styling
    buttonBgColor: string;
    buttonTextColor: string;
    buttonHoverBgColor: string;
    buttonBorderRadius: number;
    buttonStyle: "filled" | "outline" | "pill" | "ghost";
    buttonBorderColor: string;
    buttonBorderWidth: number;
    buttonCustomText: string;
    buttonShowIcon: boolean;
    buttonShadow: string;
    buttonFontWeight: string;
    buttonPaddingX: number;
    buttonPaddingY: number;

    // Image Styling
    imageSize: number;
    imageBorderRadius: number;
    imageBorderColor: string;
    imageBorderWidth: number;

    // Variant Styling
    variantOptions: VariantOptionConfig[];
    variantShowLabels: boolean;
    variantActiveColor: string;
    variantBorderColor: string;
    variantTextColor: string;
    variantBorderRadius: number;

    // Quantity Styling
    quantityStyle: "plusMinus" | "dropdown" | "input";
    quantityBorderColor: string;
    quantityBorderRadius: number;
    quantityTextColor: string;
    quantityBgColor: string;
    quantityButtonColor: string;

    // Layout
    position: "top" | "bottom" | "left" | "right";
    elements: Element[];
    elementGap: number;
    groupGap: number;
    barOffset: number;
    barWidthMode: "full" | "contained";
    barMaxWidth: number;
    contentMaxWidth: number;
    contentAlignment: "left" | "center" | "right" | "spaceBetween" | "spaceAround" | "spaceEvenly";
    verticalAlignment: "top" | "center" | "bottom";

    // Behavior - Display
    triggerMode: "scroll" | "always" | "delay";
    triggerDelay: number;
    scrollThreshold: number;
    // Behavior - Animation
    animation: "slide" | "fade" | "bounce" | "none";
    animationDuration: number;
    exitAnimation: "slide" | "fade" | "none";

    // Behavior - Cart
    cartAction: "stayOnPage" | "redirect" | "drawer" | "flyToCart";
    showSuccessNotification: boolean;
    successMessage: string;
    // Behavior - Mobile
    showOnMobile: boolean;
    mobileCompact: boolean;
    mobileBreakpoint: number;

    // Advanced
    zIndex: number;
    customCssClass: string;
}

export interface StickyBarConfig {
    styling: StylingConfig;
    layout: LayoutConfig;
    behavior: BehaviorConfig;
}

interface StylingConfig {
    barAppearance: BarAppearanceConfig;
    typography: TypographyConfig;
    buttonStyling: ButtonStylingConfig;
    imageStyling: ImageStylingConfig;
    variantStyling: VariantStylingConfig;
    quantityStyling: QuantityStylingConfig;
}

interface LayoutConfig {
    elementArrangement: ElementArrangementConfig;
    position: PositionConfig;
    barWidth: BarWidthConfig;
    spacing: SpacingConfig;
}

interface BehaviorConfig {
    display: DisplayConfig;
    animation: AnimationConfig;
    cartBehavior: CartBehaviorConfig;
    mobile: MobileConfig;
    advanced: AdvancedConfig;
}

// ─── Styling Sub-configs ───────────────────────────────────────

interface BarAppearanceConfig {
    background: string;
    gradientEnabled: boolean;
    gradientFrom: string;
    gradientTo: string;
    gradientDirection: "horizontal" | "vertical" | "diagonal";
    borderRadius: number;
    padding: number;
    shadow: string;
    borderColor: string;
    borderWidth: number;
    opacity: number;
}

interface TypographyConfig {
    titleColor: string;
    titleFontWeight: string;
    priceColor: string;
    priceFontWeight: string;
    discountedPriceColor: string;
    comparePriceStyle: "strikethrough" | "badge";
    fontFamily: string;
    fontSize: number;
    titleLetterSpacing: number;
    textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
}

interface ButtonStylingConfig {
    background: string;
    textColor: string;
    hoverBackground: string;
    borderRadius: number;
    style: "filled" | "outline" | "pill" | "ghost";
    borderColor: string;
    borderWidth: number;
    customText: string;
    showIcon: boolean;
    shadow: string;
    fontWeight: string;
    paddingX: number;
    paddingY: number;
}

interface ImageStylingConfig {
    size: number;
    borderRadius: number;
    borderColor: string;
    borderWidth: number;
}

interface VariantStylingConfig {
    options: VariantOptionConfig[];
    showLabels: boolean;
    activeColor: string;
    borderColor: string;
    textColor: string;
    borderRadius: number;
}

interface QuantityStylingConfig {
    style: "plusMinus" | "dropdown" | "input";
    borderColor: string;
    borderRadius: number;
    textColor: string;
    bgColor: string;
    buttonColor: string;
}

// ─── Layout Sub-configs ────────────────────────────────────────

interface ElementArrangementConfig {
    elements: Element[];
}

interface PositionConfig {
    position: "top" | "bottom" | "left" | "right";
}

interface BarWidthConfig {
    mode: "full" | "contained";
    maxWidth: number;
    contentMaxWidth: number;
    contentAlignment: "left" | "center" | "right" | "spaceBetween" | "spaceAround" | "spaceEvenly";
    verticalAlignment: "top" | "center" | "bottom";
}

interface SpacingConfig {
    elementGap: number;
    groupGap: number;
    barOffset: number;
}

// ─── Behavior Sub-configs ──────────────────────────────────────

interface DisplayConfig {
    enabled: boolean;
    triggerMode: "scroll" | "always" | "delay";
    triggerDelay: number;
    scrollThreshold: number;
}

interface AnimationConfig {
    type: "slide" | "fade" | "bounce" | "none";
    duration: number;
    exitType: "slide" | "fade" | "none";
}

interface CartBehaviorConfig {
    action: "stayOnPage" | "redirect" | "drawer" | "flyToCart";
    showSuccessNotification: boolean;
    successMessage: string;
}

interface MobileConfig {
    enabled: boolean;
    compactMode: boolean;
    breakpoint: number;
}

interface AdvancedConfig {
    zIndex: number;
    customCssClass: string;
}

// ─── Shared Types ──────────────────────────────────────────────

export interface Element {
    id: string;
    label: string;
    visible: boolean;
}

export type VariantDisplayType = "dropdown" | "swatch" | "radioButtons" | "rectangleList";

export interface VariantOptionConfig {
    name: string;
    displayType: VariantDisplayType;
}
