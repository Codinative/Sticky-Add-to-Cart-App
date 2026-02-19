import { Icons } from "../common/icons";

export function LivePreview({ config, previewDevice }: { config: any, previewDevice: "mobile" | "desktop" }) {
    if (!config) return null;
    
    const isMobile = previewDevice === "mobile";
    const containerWidth = isMobile ? "max-w-[375px]" : "w-full";
    const isHorizontal = config.position === "top" || config.position === "bottom";
    const isVertical = config.position === "left" || config.position === "right";

    // Scale down sizes for mobile preview
    const mobileScale = isMobile ? 0.65 : 1;
    const baseFontSize = typeof config.fontSize === 'number' && config.fontSize > 0 ? Math.round((config.fontSize * mobileScale)) : (isMobile ? 9 : 14);
  
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
      spaceAround: "space-around",
      spaceEvenly: "space-evenly",
    };

    // Vertical alignment mapping
    const verticalAlignMap: Record<string, string> = {
      top: "flex-start",
      center: "center",
      bottom: "flex-end",
    };
  
    // Bar background styling (outer shell)
    const barStyle: React.CSSProperties = {
      background: getBarBackground(),
      borderRadius: `${Math.round(config.barBorderRadius * mobileScale)}px`,
      padding: `${Math.round(config.barPadding * mobileScale)}px`,
      boxShadow: getShadow(),
      opacity: (config.barOpacity || 100) / 100,
      borderColor: config.barBorderWidth > 0 ? config.barBorderColor : "transparent",
      borderWidth: `${Math.round((config.barBorderWidth || 0) * mobileScale)}px`,
      borderStyle: config.barBorderWidth > 0 ? "solid" : "none",
    };

    // Inner content container styling (inside the background)
    const contentStyle: React.CSSProperties = {
      maxWidth: config.contentMaxWidth > 0 ? `${config.contentMaxWidth}px` : "none",
      margin: "0 auto",
      display: "flex",
      width: "100%",
      flexDirection: isHorizontal ? "row" : "column",
      justifyContent: isHorizontal ? (isMobile ? "center" : (alignmentMap[config.contentAlignment] || "space-between")) : undefined,
      alignItems: isHorizontal ? (verticalAlignMap[config.verticalAlignment] || "center") : "center",
    };

    // Contained width style
    const barContainerStyle: React.CSSProperties = config.barWidthMode === "contained" ? {
      maxWidth: `${config.barMaxWidth}px`,
      margin: "0 auto",
    } : {};
  
    const visibleElements = config.elements.filter((el: { id: string, visible: boolean }) => el.visible);

    // Split elements into left (info) and right (action) groups
    const LEFT_IDS = new Set(["image", "title", "price"]);
    const leftElements = visibleElements.filter((el: { id: string }) => LEFT_IDS.has(el.id));
    const rightElements = visibleElements.filter((el: { id: string }) => !LEFT_IDS.has(el.id));

    // Button style computation
    const getButtonStyle = (): React.CSSProperties => {
      const paddingY = Math.round((config.buttonPaddingY || 10) * mobileScale);
      const paddingX = Math.round((config.buttonPaddingX || 24) * mobileScale);
      const borderRadius = Math.round(config.buttonBorderRadius * mobileScale);

      const style: React.CSSProperties = {
        color: config.buttonTextColor,
        padding: `${paddingY}px ${paddingX}px`,
        fontSize: `${baseFontSize}px`,
        fontFamily: config.fontFamily,
        borderRadius: config.buttonStyle === "pill" ? "9999px" : `${borderRadius}px`,
        fontWeight: config.buttonFontWeight || "600",
        boxShadow: isMobile ? "none" : (buttonShadowMap[config.buttonShadow] || "none"),
      };

      if (config.buttonStyle === "filled" || config.buttonStyle === "pill") {
        style.backgroundColor = config.buttonBgColor;
        style.border = "none";
      } else if (config.buttonStyle === "outline") {
        style.backgroundColor = "transparent";
        style.border = `${Math.max(Math.round((config.buttonBorderWidth || 2) * mobileScale), 1)}px solid ${config.buttonBorderColor || config.buttonBgColor}`;
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
          const scaledImageSize = Math.round(config.imageSize * mobileScale);
          return (
            <div
              key={el.id}
              className="shrink-0 overflow-hidden bg-gray-200 flex items-center justify-center"
              style={{
                width: isHorizontal ? scaledImageSize : "100%",
                height: isHorizontal ? scaledImageSize : Math.round(60 * mobileScale),
                borderRadius: `${Math.round(config.imageBorderRadius * mobileScale)}px`,
                borderWidth: `${Math.round((config.imageBorderWidth || 0) * mobileScale)}px`,
                borderColor: config.imageBorderWidth > 0 ? config.imageBorderColor : "transparent",
                borderStyle: config.imageBorderWidth > 0 ? "solid" : "none",
              }}
            >
              <svg width={isMobile ? "16" : "24"} height={isMobile ? "16" : "24"} viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
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
                  fontSize: `${Math.max(baseFontSize + (isMobile ? 2 : 4), isMobile ? 10 : 16)}px`,
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
        case "variants": {
          // Mock data for preview
          const mockVariants: Record<string, { values: string[], active: string }> = {
            Size: { values: ["S", "M", "L"], active: "M" },
            Color: { values: ["Red", "Blue", "Green"], active: "Blue" },
          };

          // Lookup display type from config.variantOptions by name (case-insensitive), fallback to dropdown
          const getDisplayType = (name: string): string => {
            const match = (config.variantOptions || []).find(
              (o: { name: string; displayType: string }) => o.name.toLowerCase() === name.toLowerCase()
            );
            return match?.displayType || "dropdown";
          };

          const renderVariantControl = (name: string, values: string[], activeVal: string, displayType: string) => {
            const variantBorderRadius = Math.round(config.variantBorderRadius * mobileScale);
            switch (displayType) {
              case "dropdown":
                return (
                  <div
                    className="flex items-center border bg-white"
                    style={{
                      gap: `${isMobile ? 2 : 4}px`,
                      padding: `${isMobile ? 3 : 6}px ${isMobile ? 6 : 8}px`,
                      fontSize: `${baseFontSize}px`,
                      borderColor: config.variantBorderColor,
                      borderRadius: `${variantBorderRadius}px`,
                      color: config.variantTextColor,
                      minWidth: isMobile ? "40px" : "80px",
                    }}
                  >
                    <span className="flex-1 truncate">{activeVal}</span>
                    <Icons.ChevronDown size={isMobile ? 8 : 12} />
                  </div>
                );
              case "swatch":
                const swatchSize = Math.round(28 * mobileScale);
                return (
                  <div className="flex gap-1 flex-wrap">
                    {values.map((v) => {
                      const isActive = v === activeVal;
                      return (
                        <div
                          key={v}
                          className="flex items-center justify-center border-2 transition-colors"
                          style={{
                            width: `${swatchSize}px`,
                            height: `${swatchSize}px`,
                            borderRadius: `${variantBorderRadius}px`,
                            borderColor: isActive ? config.variantActiveColor : config.variantBorderColor,
                            backgroundColor: isActive ? `${config.variantActiveColor}18` : "white",
                            fontSize: `${Math.max(baseFontSize - 3, 7)}px`,
                            fontWeight: 600,
                            color: isActive ? config.variantActiveColor : config.variantTextColor,
                            cursor: "pointer",
                          }}
                          title={v}
                        >
                          {v.substring(0, isMobile ? 1 : 2)}
                        </div>
                      );
                    })}
                  </div>
                );
              case "radioButtons":
                return (
                  <div className="flex gap-2.5 flex-wrap">
                    {values.map((v) => {
                      const isActive = v === activeVal;
                      return (
                        <div key={v} className="flex items-center gap-1" style={{ cursor: "pointer" }}>
                          <div 
                            className="rounded-full border-2 flex items-center justify-center"
                            style={{
                              width: "14px",
                              height: "14px",
                              borderColor: isActive ? config.variantActiveColor : config.variantBorderColor,
                            }}
                          >
                            {isActive && (
                              <div className="rounded-full" style={{ width: "7px", height: "7px", backgroundColor: config.variantActiveColor }} />
                            )}
                          </div>
                          <span style={{ fontSize: `${Math.max(baseFontSize - 2, 11)}px`, color: isActive ? config.variantActiveColor : config.variantTextColor }}>{v}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              case "rectangleList":
              default:
                return (
                  <div className="flex gap-1 flex-wrap">
                    {values.map((v) => {
                      const isActive = v === activeVal;
                      const rectPadding = isMobile ? "2px 4px" : "4px 12px";
                      return (
                        <button
                          key={v}
                          className="font-medium border transition-colors"
                          style={{
                            padding: rectPadding,
                            fontSize: `${Math.max(baseFontSize - 2, 7)}px`,
                            borderRadius: `${variantBorderRadius}px`,
                            borderColor: isActive ? config.variantActiveColor : config.variantBorderColor,
                            backgroundColor: isActive ? `${config.variantActiveColor}12` : "white",
                            color: isActive ? config.variantActiveColor : config.variantTextColor,
                          }}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                );
            }
          };

          return (
            <div key={el.id} className={`shrink-0 ${isVertical ? "w-full" : ""}`} style={{ display: "flex", flexDirection: "column", gap: `${isMobile ? 3 : 6}px` }}>
              {Object.entries(mockVariants).map(([name, data]) => {
                const displayType = getDisplayType(name);
                return (
                  <div key={name} className="flex items-center flex-wrap" style={{ gap: `${isMobile ? 4 : 8}px` }}>
                    {config.variantShowLabels !== false && (
                      <span style={{ fontSize: `${Math.max(baseFontSize - 1, 7)}px`, color: config.variantTextColor, fontWeight: 500, whiteSpace: "nowrap" }}>
                        {name}:
                      </span>
                    )}
                    {renderVariantControl(name, data.values, data.active, displayType)}
                  </div>
                );
              })}
            </div>
          );
        }
        case "quantity":
          const quantityBorderRadius = Math.round(config.quantityBorderRadius * mobileScale);
          return (
            <div key={el.id} className={`shrink-0 ${isVertical ? "mx-auto" : ""}`}>
              {config.quantityStyle === "dropdown" ? (
                <div
                  className="flex items-center border"
                  style={{
                    gap: `${isMobile ? 2 : 4}px`,
                    padding: `${isMobile ? 3 : 6}px ${isMobile ? 6 : 8}px`,
                    fontSize: `${baseFontSize}px`,
                    borderColor: config.quantityBorderColor,
                    borderRadius: `${quantityBorderRadius}px`,
                    backgroundColor: config.quantityBgColor || "#FFFFFF",
                    color: config.quantityTextColor || "#374151",
                    minWidth: isMobile ? "30px" : "40px",
                  }}
                >
                  <span className="flex-1">1</span>
                  <span style={{ color: config.quantityButtonColor || "#9CA3AF" }}>
                    <Icons.ChevronDown size={isMobile ? 8 : 12} />
                  </span>
                </div>
              ) : config.quantityStyle === "input" ? (
                <div
                  className="border overflow-hidden"
                  style={{
                    borderColor: config.quantityBorderColor,
                    borderRadius: `${quantityBorderRadius}px`,
                    backgroundColor: config.quantityBgColor || "#FFFFFF",
                  }}
                >
                  <span
                    className="font-medium inline-block"
                    style={{
                      padding: `${isMobile ? 3 : 4}px ${isMobile ? 8 : 12}px`,
                      fontSize: `${baseFontSize}px`,
                      minWidth: isMobile ? "24px" : "30px",
                      textAlign: "center",
                      color: config.quantityTextColor || "#374151"
                    }}
                  >1</span>
                </div>
              ) : (
                <div
                  className="flex items-center border overflow-hidden"
                  style={{
                    borderColor: config.quantityBorderColor,
                    borderRadius: `${quantityBorderRadius}px`,
                    backgroundColor: config.quantityBgColor || "#FFFFFF",
                  }}
                >
                  <button
                    style={{
                      padding: `${isMobile ? 2 : 4}px ${isMobile ? 6 : 8}px`,
                      fontSize: `${baseFontSize}px`,
                      color: config.quantityButtonColor || "#9CA3AF",
                      background: "none",
                      border: "none"
                    }}
                  >−</button>
                  <span
                    className="font-medium"
                    style={{
                      padding: `${isMobile ? 2 : 4}px ${isMobile ? 8 : 12}px`,
                      fontSize: `${baseFontSize}px`,
                      color: config.quantityTextColor || "#374151",
                      borderLeft: `1px solid ${config.quantityBorderColor}`,
                      borderRight: `1px solid ${config.quantityBorderColor}`
                    }}
                  >1</span>
                  <button
                    style={{
                      padding: `${isMobile ? 2 : 4}px ${isMobile ? 6 : 8}px`,
                      fontSize: `${baseFontSize}px`,
                      color: config.quantityButtonColor || "#9CA3AF",
                      background: "none",
                      border: "none"
                    }}
                  >+</button>
                </div>
              )}
            </div>
          );
        case "button":
          const buttonText = config.buttonCustomText || "Add to Cart";
          const iconSize = Math.round(15 * mobileScale);
          return (
            <button
              key={el.id}
              className={`shrink-0 transition-all hover:opacity-90 flex items-center justify-center ${isVertical ? "w-full" : ""}`}
              style={{ ...getButtonStyle(), gap: `${isMobile ? 4 : 8}px` }}
            >
              {config.buttonShowIcon && <Icons.ShoppingCart size={iconSize} />}
              <span className="truncate" style={{ maxWidth: isMobile ? "80px" : "none" }}>
                {isMobile && buttonText.length > 10 ? buttonText.substring(0, 10) + "..." : buttonText}
              </span>
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

    const stickyBarContent = config.enabled ? (
      <div className="shrink-0">
        <div style={barContainerStyle} className={isMobile ? "mx-1" : "mx-1 sm:mx-0"}>
          <div className="relative" style={barStyle}>
            <div
              className={"flex-wrap"}
              style={{
                ...contentStyle,
                columnGap: isHorizontal && leftElements.length > 0 && rightElements.length > 0
                  ? `${Math.round((config.groupGap ?? 32) * mobileScale)}px`
                  : `${Math.round((config.elementGap || 12) * mobileScale)}px`,
                rowGap: isHorizontal ? `${Math.round((config.elementGap || 12) * mobileScale)}px` : undefined,
              }}
            >
              {isHorizontal && leftElements.length > 0 && rightElements.length > 0 ? (
                <>
                  <div
                    className={`flex items-center justify-center ${"flex-wrap"}`}
                    style={{ gap: `${Math.round((config.elementGap || 12) * mobileScale)}px`, minWidth: 0 }}
                  >
                    {leftElements.map((el: { id: string, visible: boolean }) => renderElement(el))}
                  </div>
                  <div
                    className={`flex items-center justify-center ${"flex-wrap"}`}
                    style={{ gap: `${Math.round((config.elementGap || 12) * mobileScale)}px` }}
                  >
                    {rightElements.map((el: { id: string, visible: boolean }) => renderElement(el))}
                  </div>
                </>
              ) : (
                visibleElements.map((el: { id: string, visible: boolean }) => renderElement(el))
              )}
            </div>
          </div>
        </div>
      </div>
    ) : null;

    return (
      <div className={`${containerWidth} mx-auto h-full flex flex-col overflow-y-auto`}>
        {/* Simulated Product Page */}
        <div className="relative bg-white rounded-lg sm:rounded-xl border border-gray-200 flex-1 min-h-[520px] sm:min-h-[520px] flex flex-col"
          style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>

          {/* Fake browser bar */}
          <div className="bg-gray-50 border-b border-gray-200 px-2 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 shrink-0">
            <div className="flex gap-1 sm:gap-1.5">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-400" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-400" />
            </div>
            <div className="flex-1 min-w-0 mx-2 sm:mx-4">
              <div className="bg-white rounded-md px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs text-gray-400 border border-gray-200 text-center truncate">
                yourstore.mybigcommerce.com/premium-wireless-headphones
              </div>
            </div>
          </div>

          {/* Sticky Bar - TOP (in-flow) */}
          {config.position === "top" && stickyBarContent}

          {/* Product page content */}
          <div className="pt-3 px-3 sm:pt-6 sm:px-6 flex-1">
            {/* Minimal product page mockup */}
            <div className={`flex gap-3 sm:gap-6 ${isMobile ? "flex-col" : ""}`}>
              {/* Product Image */}
              <div className={`${isMobile ? "w-full h-32 sm:h-40" : "w-1/2 h-40 sm:h-48"} bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg sm:rounded-xl flex items-center justify-center`}>
                <div className="text-gray-300">
                  <svg width="32" height="32" className="sm:w-12 sm:h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              </div>
              {/* Product Info */}
              <div className={`${isMobile ? "w-full" : "w-1/2"}`}>
                <div className="h-2.5 sm:h-3 w-20 sm:w-24 bg-gray-200 rounded mb-2 sm:mb-3" />
                <div className="h-4 sm:h-5 w-full bg-gray-100 rounded mb-1.5 sm:mb-2" />
                <div className="h-4 sm:h-5 w-3/4 bg-gray-100 rounded mb-3 sm:mb-4" />
                <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded mb-3 sm:mb-4" />
                <div className="flex items-center gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm ${i <= 4 ? "bg-yellow-300" : "bg-gray-200"}`} />
                  ))}
                  <div className="h-2.5 sm:h-3 w-10 sm:w-12 bg-gray-100 rounded ml-1 sm:ml-2" />
                </div>
                <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
                  <div className="h-2.5 sm:h-3 w-full bg-gray-100 rounded" />
                  <div className="h-2.5 sm:h-3 w-5/6 bg-gray-100 rounded" />
                  <div className="h-2.5 sm:h-3 w-4/6 bg-gray-100 rounded" />
                </div>
                {!isMobile && (
                  <>
                    <div className="flex gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {["S", "M", "L", "XL"].map((s) => (
                        <div key={s} className="w-8 h-7 sm:w-10 sm:h-8 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-400">{s}</div>
                      ))}
                    </div>
                    <div className="h-9 sm:h-10 w-full bg-gray-800 rounded-lg flex items-center justify-center text-white text-xs sm:text-sm font-medium opacity-40">
                      Add to Cart
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Bar - BOTTOM (in-flow) */}
          {config.position === "bottom" && stickyBarContent}
        </div>
  
        {/* Preview Status */}
        {/* <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 mt-3 px-2">
          <div className={`w-2 h-2 rounded-full ${config.enabled ? "bg-green-400 animate-pulse" : "bg-gray-300"}`} />
          <span className="text-[10px] sm:text-xs text-gray-500 text-center">
            {config.enabled ? "Sticky bar active" : "Sticky bar disabled"} · {config.position} position · {config.triggerMode === "scroll" ? "Shows on scroll" : config.triggerMode === "always" ? "Always visible" : `Shows after ${config.triggerDelay}s`}
            {config.showCloseButton && " · Dismissible"}
          </span>
        </div> */}
      </div>
    );
  }
