'use client'

import { useState, useCallback, useEffect } from "react";
import { Icons } from "../../components/common/icons";
import TabButton from "../../components/common/tabButton";
import { LivePreview } from "../../components/dashboard/livePreview";
import { StylePanel } from "../../components/dashboard/stylePanel";
import { LayoutPanel } from "../../components/dashboard/layoutPanel";
import BehaviorPanel from "../../components/dashboard/behaviorPanel";
import { StatusBar } from "../../components/dashboard/statusBar";
import Toast from "../../components/common/toast";
import { defaultStickyBarConfig } from "@/lib/defaultConfig";
import { useSession } from "@/context/session";
import StickyBarDashboardSkeleton from "./loading";
import { DefaultStickyBarConfig, StickyBarConfig } from "@/types/config";

export default function StickyBarDashboard() {
  const [config, setConfig] = useState<DefaultStickyBarConfig | null>(null);
  const [savedConfig, setSavedConfig] = useState<DefaultStickyBarConfig | null>(null);
  const [activeTab, setActiveTab] = useState("style");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" }>({ visible: false, message: "", type: "success" });
  const [loading, setLoading] = useState(true);
  const hasChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);
  const encodedContext = useSession()?.context || "";

  const flattenToNestedConfig = (config: DefaultStickyBarConfig): StickyBarConfig => {
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
          displayStyle: config.variantDisplayStyle,
          activeColor: config.variantActiveColor,
          borderColor: config.variantBorderColor,
          textColor: config.variantTextColor,
          borderRadius: config.variantBorderRadius,
        },
        quantityStyling: {
          style: config.quantityStyle,
          borderColor: config.quantityBorderColor,
          borderRadius: config.quantityBorderRadius,
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
          contentAlignment: config.contentAlignment,
          verticalAlignment: config.verticalAlignment,
        },
        spacing: {
          elementGap: config.elementGap,
          barOffset: config.barOffset,
        },
      },
      behavior: {
        display: {
          enabled: config.enabled,
          triggerMode: config.triggerMode,
          triggerDelay: config.triggerDelay,
          scrollThreshold: config.scrollThreshold,
          showCloseButton: config.showCloseButton,
          closeBehavior: config.closeBehavior,
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
          autoHideAfterATC: config.autoHideAfterATC,
          autoHideDelay: config.autoHideDelay,
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
  };

  const nestedToFlattenConfig = (nested: StickyBarConfig): DefaultStickyBarConfig => {
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
      variantDisplayStyle: nested.styling?.variantStyling?.displayStyle ?? d.variantDisplayStyle,
      variantActiveColor: nested.styling?.variantStyling?.activeColor ?? d.variantActiveColor,
      variantBorderColor: nested.styling?.variantStyling?.borderColor ?? d.variantBorderColor,
      variantTextColor: nested.styling?.variantStyling?.textColor ?? d.variantTextColor,
      variantBorderRadius: nested.styling?.variantStyling?.borderRadius ?? d.variantBorderRadius,

      // Quantity Styling
      quantityStyle: nested.styling?.quantityStyling?.style ?? d.quantityStyle,
      quantityBorderColor: nested.styling?.quantityStyling?.borderColor ?? d.quantityBorderColor,
      quantityBorderRadius: nested.styling?.quantityStyling?.borderRadius ?? d.quantityBorderRadius,

      // Layout
      position: nested.layout?.position?.position ?? d.position,
      elements: nested.layout?.elementArrangement?.elements ?? d.elements,
      elementGap: nested.layout?.spacing?.elementGap ?? d.elementGap,
      barOffset: nested.layout?.spacing?.barOffset ?? d.barOffset,
      barWidthMode: nested.layout?.barWidth?.mode ?? d.barWidthMode,
      barMaxWidth: nested.layout?.barWidth?.maxWidth ?? d.barMaxWidth,
      contentAlignment: nested.layout?.barWidth?.contentAlignment ?? d.contentAlignment,
      verticalAlignment: nested.layout?.barWidth?.verticalAlignment ?? d.verticalAlignment,

      // Behavior - Display
      triggerMode: nested.behavior?.display?.triggerMode ?? d.triggerMode,
      triggerDelay: nested.behavior?.display?.triggerDelay ?? d.triggerDelay,
      scrollThreshold: nested.behavior?.display?.scrollThreshold ?? d.scrollThreshold,
      showCloseButton: nested.behavior?.display?.showCloseButton ?? d.showCloseButton,
      closeBehavior: nested.behavior?.display?.closeBehavior ?? d.closeBehavior,

      // Behavior - Animation
      animation: nested.behavior?.animation?.type ?? d.animation,
      animationDuration: nested.behavior?.animation?.duration ?? d.animationDuration,
      exitAnimation: nested.behavior?.animation?.exitType ?? d.exitAnimation,

      // Behavior - Cart
      cartAction: nested.behavior?.cartBehavior?.action ?? d.cartAction,
      showSuccessNotification: nested.behavior?.cartBehavior?.showSuccessNotification ?? d.showSuccessNotification,
      successMessage: nested.behavior?.cartBehavior?.successMessage ?? d.successMessage,
      autoHideAfterATC: nested.behavior?.cartBehavior?.autoHideAfterATC ?? d.autoHideAfterATC,
      autoHideDelay: nested.behavior?.cartBehavior?.autoHideDelay ?? d.autoHideDelay,

      // Behavior - Mobile
      showOnMobile: nested.behavior?.mobile?.enabled ?? d.showOnMobile,
      mobileCompact: nested.behavior?.mobile?.compactMode ?? d.mobileCompact,
      mobileBreakpoint: nested.behavior?.mobile?.breakpoint ?? d.mobileBreakpoint,

      // Advanced
      zIndex: nested.behavior?.advanced?.zIndex ?? d.zIndex,
      customCssClass: nested.behavior?.advanced?.customCssClass ?? d.customCssClass,
    };
  };

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/config?context=${encodeURIComponent(encodedContext)}`);
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.statusText}`);
      }

      const data = await response.json();
      const flattenedConfig = nestedToFlattenConfig(data?.data as StickyBarConfig);

      setConfig(flattenedConfig || defaultStickyBarConfig);
      setSavedConfig(flattenedConfig || defaultStickyBarConfig);
    } catch (error: any) {
      console.error('error loading config:', error.message);
      setConfig(defaultStickyBarConfig);
      setSavedConfig(defaultStickyBarConfig);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    
    try {
      setSaving(true);
      const nestedConfig = flattenToNestedConfig(config);
      const response = await fetch(`/api/config?context=${encodeURIComponent(encodedContext)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: nestedConfig })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to save config: ${errorData.message || response.statusText}`);
      }

      setSavedConfig(config);

      // Install/update the storefront script on the merchant's store
      try {
        const scriptResponse = await fetch(`/api/bc-scripts?context=${encodeURIComponent(encodedContext)}`, {
          method: 'POST',
        });
        if (!scriptResponse.ok) {
          console.warn('Script installation warning:', await scriptResponse.text());
        }
      } catch (scriptError: any) {
        console.warn('Script installation warning:', scriptError.message);
      }

      showToast('Settings saved successfully', 'success');
    } catch (error: any) {
      console.error('Error saving config:', error.message);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadConfig();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateConfig = useCallback((key: string, value: any) => {
    setConfig((prev) => prev ? ({ ...prev, [key]: value }) : null);
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  const handleSave = async () => {
    await saveConfig();
  };

  const handleReset = () => {
    if (savedConfig) {
      setConfig(savedConfig);
      showToast("Changes discarded", "success");
    }
  };

  const tabs = [
    { id: "style", label: "Styling", icon: <Icons.Palette size={16} /> },
    { id: "layout", label: "Layout", icon: <Icons.Layout size={16} /> },
    { id: "behavior", label: "Behavior", icon: <Icons.Settings size={16} /> },
  ];

  if (loading) {
    return <StickyBarDashboardSkeleton />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 1000px; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F8F9FA; border-radius: 10px; }
        ::-webkit-scrollbar-thumb { 
          background: #CBD5E1; 
          border-radius: 10px; 
        }
        ::-webkit-scrollbar-thumb:hover { 
          background: #94A3B8; 
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #0F172A;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.15s;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          background: #1E293B;
        }
      `}</style>

      <div className="min-h-screen bg-[#F8F9FA] overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                  <Icons.ShoppingCart size={18} />
                </div>
                <div>
                  <h1 className="text-base font-semibold text-slate-900 tracking-tight">Sticky Add to Cart</h1>
                  <p className="text-xs text-slate-500 -mt-0.5">Configure your sticky bar settings</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${config?.enabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${config?.enabled ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {config?.enabled ? "Active" : "Inactive"}
                </div>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className={`
                    flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all
                    ${hasChanges
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }
                  `}
                >
                  <Icons.Save size={15} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <div className="flex gap-6" style={{ minHeight: "calc(100vh - 120px)" }}>
            {/* Left: Config Panel */}
            <div className="w-[400px] shrink-0 flex flex-col gap-4">
              {/* Tab Navigation */}
              <div className="flex gap-1 p-1 bg-white rounded-lg border border-gray-200">
                {tabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    active={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    icon={tab.icon}
                    label={tab.label}
                  />
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto pr-1 pb-20" style={{ maxHeight: "calc(100vh - 200px)" }}>
                <div className="animate-[fadeIn_0.3s_ease-out]">
                  {config && activeTab === "style" && <StylePanel config={config} updateConfig={updateConfig} />}
                  {config && activeTab === "layout" && <LayoutPanel config={config} updateConfig={updateConfig} />}
                  {config && activeTab === "behavior" && <BehaviorPanel config={config} updateConfig={updateConfig} />}
                </div>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-y-auto">
              {/* Preview Toolbar */}
              <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-600">
                    <Icons.Eye size={16} />
                  </span>
                  <span className="text-sm font-semibold text-slate-900">Live Preview</span>
                  {hasChanges && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-semibold uppercase tracking-wider border border-amber-200">
                      Unsaved
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-2 rounded-md transition-all ${previewDevice === "desktop" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"}`}
                  >
                    <Icons.Monitor size={16} />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-2 rounded-md transition-all ${previewDevice === "mobile" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"}`}
                  >
                    <Icons.Smartphone size={16} />
                  </button>
                </div>
              </div>

              {/* Preview Area */}
              <div className="flex-1 bg-white rounded-lg border border-gray-200 p-6 overflow-hidden"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, #E2E8F0 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                }}>
                {config && <LivePreview config={config} previewDevice={previewDevice} />}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Bar */}
        <StatusBar
          hasChanges={hasChanges}
          onSave={handleSave}
          onReset={handleReset}
          saving={saving}
        />

        {/* Toast */}
        <Toast {...toast} />
      </div>
    </>
  );
}
