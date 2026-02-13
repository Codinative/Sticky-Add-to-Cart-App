import SectionCard from "../common/sectionCard";
import { Icons } from "../common/icons";
import Toggle from "../common/toggle";
import SelectField from "../common/selectField";
import NumberInput from "../common/numberInput";
import RangeSlider from "../common/rangeSlider";

export default function BehaviorPanel({ config, updateConfig }: { config: any, updateConfig: (key: string, value: any) => void }) {
    return (
      <div className="space-y-4">
        {/* ─── Display Settings ──────────────────────────────── */}
        <SectionCard title="Display Settings" icon={<Icons.Zap size={16} />}>
          <div className="space-y-5">
            <Toggle
              checked={config.enabled}
              onChange={(v) => updateConfig("enabled", v)}
              label="Enable Sticky Bar"
              description="Show the sticky add to cart bar on product pages"
            />
            <div className="border-t border-gray-100 pt-4" />
            <SelectField
              label="Trigger Mode"
              value={config.triggerMode}
              onChange={(v) => updateConfig("triggerMode", v)}
              options={[
                { value: "scroll", label: "Show on scroll (when Add to Cart leaves viewport)" },
                { value: "always", label: "Always visible on page load" },
                { value: "delay", label: "Show after time delay" },
              ]}
            />
            {config.triggerMode === "delay" && (
              <NumberInput
                label="Delay"
                value={config.triggerDelay}
                onChange={(v) => updateConfig("triggerDelay", v)}
                min={0}
                max={30}
                suffix="sec"
              />
            )}
            {config.triggerMode === "scroll" && (
              <RangeSlider
                label="Scroll Threshold"
                value={config.scrollThreshold}
                onChange={(v) => updateConfig("scrollThreshold", v)}
                min={10}
                max={100}
                suffix="%"
              />
            )}

            <div className="border-t border-gray-100 pt-4" />

            <Toggle
              checked={config.showCloseButton}
              onChange={(v) => updateConfig("showCloseButton", v)}
              label="Show Close Button"
              description="Allow visitors to dismiss the sticky bar"
            />
            {config.showCloseButton && (
              <div className="pl-1 border-l-2 border-blue-200 ml-1">
                <div className="pl-4">
                  <SelectField
                    label="Close Behavior"
                    value={config.closeBehavior}
                    onChange={(v) => updateConfig("closeBehavior", v)}
                    options={[
                      { value: "hideTemporary", label: "Hide temporarily (reappears on next scroll)" },
                      { value: "hideUntilScroll", label: "Hide until page is scrolled again" },
                      { value: "hideForever", label: "Hide for entire session" },
                    ]}
                  />
                </div>
              </div>
            )}
          </div>
        </SectionCard>
  
        {/* ─── Animation ─────────────────────────────────────── */}
        <SectionCard title="Animation" icon={<Icons.Zap size={16} />}>
          <div className="space-y-5">
            <SelectField
              label="Entry Animation"
              value={config.animation}
              onChange={(v) => updateConfig("animation", v)}
              options={[
                { value: "slide", label: "Slide In" },
                { value: "fade", label: "Fade In" },
                { value: "bounce", label: "Bounce In" },
                { value: "none", label: "No Animation (Instant)" },
              ]}
            />
            <SelectField
              label="Exit Animation"
              value={config.exitAnimation}
              onChange={(v) => updateConfig("exitAnimation", v)}
              options={[
                { value: "slide", label: "Slide Out" },
                { value: "fade", label: "Fade Out" },
                { value: "none", label: "No Animation (Instant)" },
              ]}
            />
            <RangeSlider
              label="Animation Duration"
              value={config.animationDuration}
              onChange={(v) => updateConfig("animationDuration", v)}
              min={100}
              max={1000}
              suffix="ms"
            />
            {/* Animation Preview Indicator */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Icons.Zap size={12} />
                <span>
                  Bar will {config.animation === "none" ? "appear instantly" : `${config.animation} in over ${config.animationDuration}ms`}
                  {" "}and {config.exitAnimation === "none" ? "disappear instantly" : `${config.exitAnimation} out`}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ─── Cart Behavior ─────────────────────────────────── */}
        <SectionCard title="Cart Behavior" icon={<Icons.ShoppingCart size={16} />}>
          <div className="space-y-5">

            <Toggle
              checked={config.showSuccessNotification}
              onChange={(v) => updateConfig("showSuccessNotification", v)}
              label="Show Success Notification"
              description="Display a notification after item is added to cart"
            />
            {config.showSuccessNotification && (
              <div className="pl-1 border-l-2 border-blue-200 ml-1">
                <div className="pl-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Success Message</label>
                    <input
                      type="text"
                      value={config.successMessage}
                      onChange={(e) => updateConfig("successMessage", e.target.value)}
                      placeholder="Added to cart successfully!"
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4" />

            <Toggle
              checked={config.autoHideAfterATC}
              onChange={(v) => updateConfig("autoHideAfterATC", v)}
              label="Auto-Hide After Add to Cart"
              description="Automatically hide the sticky bar after a successful add"
            />
            {config.autoHideAfterATC && (
              <div className="pl-1 border-l-2 border-blue-200 ml-1">
                <div className="pl-4">
                  <NumberInput
                    label="Hide After"
                    value={config.autoHideDelay}
                    onChange={(v) => updateConfig("autoHideDelay", v)}
                    min={1}
                    max={30}
                    suffix="sec"
                  />
                </div>
              </div>
            )}
          </div>
        </SectionCard>
  
        {/* ─── Mobile Settings ───────────────────────────────── */}
        <SectionCard title="Mobile Settings" icon={<Icons.Smartphone size={16} />} defaultOpen={false}>
          <div className="space-y-5">
            <Toggle
              checked={config.showOnMobile}
              onChange={(v) => updateConfig("showOnMobile", v)}
              label="Show on Mobile"
              description="Display the sticky bar on mobile devices"
            />
            <Toggle
              checked={config.mobileCompact}
              onChange={(v) => updateConfig("mobileCompact", v)}
              label="Compact Mobile Layout"
              description="Use a smaller, more compact bar on mobile"
            />
            <div className="border-t border-gray-100 pt-4" />
            <NumberInput
              label="Mobile Breakpoint"
              value={config.mobileBreakpoint}
              onChange={(v) => updateConfig("mobileBreakpoint", v)}
              min={320}
              max={1024}
              suffix="px"
            />
            <p className="text-xs text-gray-400">
              Screens narrower than this width will use the mobile layout.
            </p>
          </div>
        </SectionCard>

        {/* ─── Advanced ──────────────────────────────────────── */}
        <SectionCard title="Advanced" icon={<Icons.Code size={16} />} defaultOpen={false}>
          <div className="space-y-5">
            <NumberInput
              label="Z-Index"
              value={config.zIndex}
              onChange={(v) => updateConfig("zIndex", v)}
              min={1}
              max={99999}
              suffix=""
            />
            <p className="text-xs text-gray-400">
              Controls the stacking order. Higher values appear above other page elements.
            </p>

            <div className="border-t border-gray-100 pt-4" />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Custom CSS Class</label>
              <input
                type="text"
                value={config.customCssClass}
                onChange={(e) => updateConfig("customCssClass", e.target.value)}
                placeholder="e.g. my-sticky-bar"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-mono hover:border-gray-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-colors"
              />
              <p className="text-xs text-gray-400">
                Add a custom CSS class for additional styling via your theme&apos;s stylesheet.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }
