import { Icons } from "../common/icons";

export function LivePreview({ config, previewDevice }: { config: any, previewDevice: "mobile" | "desktop" }) {
    if (!config) return null;
    
    const isMobile = previewDevice === "mobile";
    const containerWidth = isMobile ? "max-w-[375px]" : "w-full";
    const isHorizontal = config.position === "top" || config.position === "bottom";
    const isVertical = config.position === "left" || config.position === "right";
    
    const baseFontSize = typeof config.fontSize === 'number' && config.fontSize > 0 ? config.fontSize : 14;
  
    // Shadow mapping
    const shadowMap: Record<string, string> = {
      none: "none",
      sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    };

    const buttonShadowMap: Record<string, string> = {
      none: "none",
      sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
      md: "0 4px 6px -1px rgba(0,0,0,0.1)",
      lg: "0 10px 15px -3px rgba(0,0,0,0.1)",
    };

    const getShadow = () => {
      const baseShadow = shadowMap[config.barShadow] || shadowMap.lg;
      if (baseShadow === "none") return "none";
      if (config.position === "bottom") {
        return baseShadow.replace(/0 /g, "0 -");
      }
      return baseShadow;
    };

    // Gradient or solid background
    const getBarBackground = () => {
      if (config.barGradientEnabled) {
        const direction = config.barGradientDirection === "horizontal" ? "to right" :
          config.barGradientDirection === "vertical" ? "to bottom" : "135deg";
        return `linear-gradient(${direction}, ${config.barGradientFrom}, ${config.barGradientTo})`;
      }
      return config.barBgColor;
    };

    // Content alignment mapping
    const alignmentMap: Record<string, string> = {
      left: "flex-start",
      center: "center",
      right: "flex-end",
      spaceBetween: "space-between",
    };

    // Vertical alignment mapping
    const verticalAlignMap: Record<string, string> = {
      top: "flex-start",
      center: "center",
      bottom: "flex-end",
    };
  
    const barStyle: React.CSSProperties = {
      background: getBarBackground(),
      borderRadius: `${config.barBorderRadius}px`,
      padding: `${config.barPadding}px`,
      boxShadow: getShadow(),
      opacity: (config.barOpacity || 100) / 100,
      borderColor: config.barBorderWidth > 0 ? config.barBorderColor : "transparent",
      borderWidth: `${config.barBorderWidth || 0}px`,
      borderStyle: config.barBorderWidth > 0 ? "solid" : "none",
      justifyContent: isHorizontal ? (alignmentMap[config.contentAlignment] || "center") : undefined,
      alignItems: isHorizontal ? (verticalAlignMap[config.verticalAlignment] || "center") : "center",
    };

    // Contained width style
    const barContainerStyle: React.CSSProperties = config.barWidthMode === "contained" ? {
      maxWidth: `${config.barMaxWidth}px`,
      margin: "0 auto",
    } : {};
  
    const visibleElements = config.elements.filter((el: { id: string, visible: boolean }) => el.visible);

    // Button style computation
    const getButtonStyle = (): React.CSSProperties => {
      const style: React.CSSProperties = {
        color: config.buttonTextColor,
        padding: `${config.buttonPaddingY || 10}px ${config.buttonPaddingX || 24}px`,
        fontSize: `${baseFontSize}px`,
        fontFamily: config.fontFamily,
        borderRadius: config.buttonStyle === "pill" ? "9999px" : `${config.buttonBorderRadius}px`,
        fontWeight: config.buttonFontWeight || "600",
        boxShadow: buttonShadowMap[config.buttonShadow] || "none",
      };

      if (config.buttonStyle === "filled" || config.buttonStyle === "pill") {
        style.backgroundColor = config.buttonBgColor;
        style.border = "none";
      } else if (config.buttonStyle === "outline") {
        style.backgroundColor = "transparent";
        style.border = `${config.buttonBorderWidth || 2}px solid ${config.buttonBorderColor || config.buttonBgColor}`;
        style.color = config.buttonBorderColor || config.buttonBgColor;
      } else if (config.buttonStyle === "ghost") {
        style.backgroundColor = "transparent";
        style.border = "none";
        style.color = config.buttonBgColor;
      }

      return style;
    };
  
    const renderElement = (el: { id: string, visible: boolean }) => {
      switch (el.id as "image" | "title" | "price" | "variants" | "quantity" | "button") {
        case "image":
          return (
            <div
              key={el.id}
              className="shrink-0 overflow-hidden bg-gray-200 flex items-center justify-center"
              style={{ 
                width: isHorizontal ? (isMobile ? Math.min(config.imageSize, 40) : config.imageSize) : "100%", 
                height: isHorizontal ? (isMobile ? Math.min(config.imageSize, 40) : config.imageSize) : 60,
                borderRadius: `${config.imageBorderRadius}px`,
                borderWidth: `${config.imageBorderWidth || 0}px`,
                borderColor: config.imageBorderWidth > 0 ? config.imageBorderColor : "transparent",
                borderStyle: config.imageBorderWidth > 0 ? "solid" : "none",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          );
        case "title":
          return (
            <div key={el.id} className={`${isHorizontal ? "min-w-0" : "w-full"}`}>
              <p 
                className="truncate" 
                style={{ 
                  color: config.titleColor, 
                  fontSize: `${baseFontSize}px`,
                  fontFamily: config.fontFamily,
                  fontWeight: config.titleFontWeight || "600",
                  lineHeight: '1.4',
                  letterSpacing: `${config.titleLetterSpacing || 0}px`,
                  textTransform: config.textTransform || "none",
                }}
              >
                Premium Wireless Headphones
              </p>
              {!isMobile && isHorizontal && (
                <div className="flex items-center gap-1 mt-0.5">
                  {[1, 2, 3, 4].map(i => <Icons.Star key={i} />)}
                  <span className="text-xs text-gray-400 ml-1">(128)</span>
                </div>
              )}
            </div>
          );
        case "price":
          return (
            <div key={el.id} className={`shrink-0 ${isVertical ? "w-full text-center" : ""}`} style={{ fontFamily: config.fontFamily }}>
              <span 
                style={{ 
                  color: config.priceColor, 
                  fontSize: `${Math.max(baseFontSize + 4, 16)}px`,
                  fontWeight: config.priceFontWeight || "700",
                }}
              >
                $299.99
              </span>
              {!isMobile && (
                config.comparePriceStyle === "badge" ? (
                  <span 
                    className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold"
                    style={{ 
                      backgroundColor: `${config.discountedPriceColor}20`,
                      color: config.discountedPriceColor,
                      fontSize: `${Math.max(baseFontSize - 4, 9)}px`,
                    }}
                  >
                    -25%
                  </span>
                ) : (
                  <span 
                    className="line-through ml-1.5" 
                    style={{ 
                      color: config.discountedPriceColor,
                      fontSize: `${Math.max(baseFontSize - 2, 11)}px`
                    }}
                  >
                    $399.99
                  </span>
                )
              )}
            </div>
          );
        case "variants":
          return (
            <div key={el.id} className={`shrink-0 ${isVertical ? "w-full" : ""}`}>
              {config.variantDisplayStyle === "dropdown" ? (
                <div 
                  className="flex items-center gap-1 px-2 py-1.5 text-xs border bg-white"
                  style={{ 
                    borderColor: config.variantBorderColor,
                    borderRadius: `${config.variantBorderRadius}px`,
                    color: config.variantTextColor,
                    minWidth: isMobile ? "60px" : "80px",
                  }}
                >
                  <span className="flex-1">Medium</span>
                  <Icons.ChevronDown size={12} />
                </div>
              ) : (
                <div className={`flex gap-1.5 ${isVertical ? "justify-center" : ""}`}>
                  {["S", "M", "L"].map((s) => (
                    <button
                      key={s}
                      className="font-medium border transition-colors"
                      style={{
                        padding: isMobile ? "2px 8px" : "4px 12px",
                        fontSize: `${Math.max(baseFontSize - 2, 11)}px`,
                        borderRadius: `${config.variantBorderRadius}px`,
                        borderColor: s === "M" ? config.variantActiveColor : config.variantBorderColor,
                        backgroundColor: s === "M" ? `${config.variantActiveColor}12` : "white",
                        color: s === "M" ? config.variantActiveColor : config.variantTextColor,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        case "quantity":
          return (
            <div key={el.id} className={`shrink-0 ${isVertical ? "mx-auto" : ""}`}>
              {config.quantityStyle === "dropdown" ? (
                <div 
                  className="flex items-center gap-1 px-2 py-1.5 text-xs border bg-white"
                  style={{ 
                    borderColor: config.quantityBorderColor,
                    borderRadius: `${config.quantityBorderRadius}px`,
                    minWidth: "50px",
                  }}
                >
                  <span className="flex-1 text-gray-700">1</span>
                  <Icons.ChevronDown size={12} />
                </div>
              ) : config.quantityStyle === "input" ? (
                <div 
                  className="border overflow-hidden"
                  style={{ 
                    borderColor: config.quantityBorderColor,
                    borderRadius: `${config.quantityBorderRadius}px`,
                  }}
                >
                  <span className="px-3 py-1 text-xs font-medium text-gray-700 inline-block" style={{ minWidth: "40px", textAlign: "center" }}>1</span>
                </div>
              ) : (
                <div 
                  className="flex items-center border overflow-hidden"
                  style={{ 
                    borderColor: config.quantityBorderColor,
                    borderRadius: `${config.quantityBorderRadius}px`,
                  }}
                >
                  <button className="px-2 py-1 text-gray-400 hover:bg-gray-50 text-xs">−</button>
                  <span className="px-3 py-1 text-xs font-medium text-gray-700" style={{ borderLeft: `1px solid ${config.quantityBorderColor}`, borderRight: `1px solid ${config.quantityBorderColor}` }}>1</span>
                  <button className="px-2 py-1 text-gray-400 hover:bg-gray-50 text-xs">+</button>
                </div>
              )}
            </div>
          );
        case "button":
          return (
            <button
              key={el.id}
              className={`shrink-0 transition-all hover:opacity-90 flex items-center justify-center gap-2 ${isVertical ? "w-full" : ""}`}
              style={getButtonStyle()}
            >
              {config.buttonShowIcon && <Icons.ShoppingCart size={isMobile ? 13 : 15} />}
              <span>{config.buttonCustomText || "Add to Cart"}</span>
            </button>
          );
        default:
          return null;
      }
    };
  
    const barPositionClasses = {
      top: "top-0 left-0 right-0",
      bottom: "bottom-0 left-0 right-0",
      left: "top-1/2 -translate-y-1/2 left-0",
      right: "top-1/2 -translate-y-1/2 right-0",
    };
  
    const barFlexDirection = isHorizontal
      ? `flex-row gap-${isMobile ? 2 : 3}`
      : `flex-col items-center gap-3 py-2`;

    return (
      <div className={`${containerWidth} mx-auto h-full flex flex-col overflow-y-auto`}>
        {/* Simulated Product Page */}
        <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden flex-1 min-h-[520px]"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
  
          {/* Fake browser bar */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200 text-center truncate">
                yourstore.mybigcommerce.com/premium-wireless-headphones
              </div>
            </div>
          </div>
  
          {/* Product page content */}
          <div className="p-6 relative h-[calc(100%-40px)]">
            {/* Minimal product page mockup */}
            <div className={`flex gap-6 ${isMobile ? "flex-col" : ""}`}>
              {/* Product Image */}
              <div className={`${isMobile ? "w-full h-40" : "w-1/2 h-48"} bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center`}>
                <div className="text-gray-300">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              </div>
              {/* Product Info */}
              <div className={`${isMobile ? "w-full" : "w-1/2"}`}>
                <div className="h-3 w-24 bg-gray-200 rounded mb-3" />
                <div className="h-5 w-full bg-gray-100 rounded mb-2" />
                <div className="h-5 w-3/4 bg-gray-100 rounded mb-4" />
                <div className="h-6 w-20 bg-gray-200 rounded mb-4" />
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-3.5 h-3.5 rounded-sm ${i <= 4 ? "bg-yellow-300" : "bg-gray-200"}`} />
                  ))}
                  <div className="h-3 w-12 bg-gray-100 rounded ml-2" />
                </div>
                <div className="space-y-2 mb-5">
                  <div className="h-3 w-full bg-gray-100 rounded" />
                  <div className="h-3 w-5/6 bg-gray-100 rounded" />
                  <div className="h-3 w-4/6 bg-gray-100 rounded" />
                </div>
                {!isMobile && (
                  <>
                    <div className="flex gap-2 mb-4">
                      {["S", "M", "L", "XL"].map((s) => (
                        <div key={s} className="w-10 h-8 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-400">{s}</div>
                      ))}
                    </div>
                    <div className="h-10 w-full bg-gray-800 rounded-lg flex items-center justify-center text-white text-sm font-medium opacity-40">
                      Add to Cart
                    </div>
                  </>
                )}
              </div>
            </div>
  
            {/* Sticky Bar */}
            {config.enabled && (
              <div
                className={`absolute ${barPositionClasses[config.position as keyof typeof barPositionClasses]} z-10`}
                style={{
                  ...(isVertical ? { width: isMobile ? "60px" : "80px" } : {}),
                  ...(config.barOffset > 0 && isHorizontal ? { 
                    [config.position]: `${config.barOffset}px` 
                  } : {}),
                }}
              >
                <div style={barContainerStyle}>
                  <div
                    className={`flex ${barFlexDirection} relative`}
                    style={{
                      ...barStyle,
                      gap: `${config.elementGap || 12}px`,
                    }}
                  >
                    {visibleElements.map((el: { id: string, visible: boolean }) => renderElement(el))}
                    
                    {/* Close Button */}
                    {config.showCloseButton && (
                      <div 
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-gray-200/80 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-300/80 transition-colors"
                        style={{ fontSize: "10px" }}
                      >
                        <Icons.X size={10} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
  
        {/* Preview Status */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className={`w-2 h-2 rounded-full ${config.enabled ? "bg-green-400 animate-pulse" : "bg-gray-300"}`} />
          <span className="text-xs text-gray-500">
            {config.enabled ? "Sticky bar active" : "Sticky bar disabled"} · {config.position} position · {config.triggerMode === "scroll" ? "Shows on scroll" : config.triggerMode === "always" ? "Always visible" : `Shows after ${config.triggerDelay}s`}
            {config.showCloseButton && " · Dismissible"}
          </span>
        </div>
      </div>
    );
  }
