import SectionCard from "../common/sectionCard";
import { Icons } from "../common/icons";
import ColorPicker from "../common/colorPicker";
import RangeSlider from "../common/rangeSlider";
import SelectField from "../common/selectField";
import Toggle from "../common/toggle";

export function StylePanel({ config, updateConfig }: { config: any, updateConfig: (key: string, value: any) => void }) {
    return (
      <div className="space-y-4">
        {/* ─── Bar Appearance ────────────────────────────────── */}
        <SectionCard title="Bar Appearance" icon={<Icons.Palette size={16} />}>
          <div className="space-y-5">
            <ColorPicker label="Background Color" value={config.barBgColor} onChange={(v) => updateConfig("barBgColor", v)} />
            
            {/* Gradient */}
            <div className="border-t border-gray-100 pt-4">
              <Toggle
                checked={config.barGradientEnabled}
                onChange={(v) => updateConfig("barGradientEnabled", v)}
                label="Enable Gradient"
                description="Apply a gradient background to the bar"
              />
            </div>
            {config.barGradientEnabled && (
              <div className="space-y-4 pl-1 border-l-2 border-blue-200 ml-1">
                <div className="pl-4 space-y-4">
                  <ColorPicker label="Gradient From" value={config.barGradientFrom} onChange={(v) => updateConfig("barGradientFrom", v)} />
                  <ColorPicker label="Gradient To" value={config.barGradientTo} onChange={(v) => updateConfig("barGradientTo", v)} />
                  <SelectField
                    label="Direction"
                    value={config.barGradientDirection}
                    onChange={(v) => updateConfig("barGradientDirection", v)}
                    options={[
                      { value: "horizontal", label: "Horizontal (Left → Right)" },
                      { value: "vertical", label: "Vertical (Top → Bottom)" },
                      { value: "diagonal", label: "Diagonal (Top-Left → Bottom-Right)" },
                    ]}
                  />
                  {/* Gradient Preview */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Preview</label>
                    <div 
                      className="h-8 rounded-lg border border-gray-200"
                      style={{
                        background: `linear-gradient(${
                          config.barGradientDirection === "horizontal" ? "to right" :
                          config.barGradientDirection === "vertical" ? "to bottom" : "135deg"
                        }, ${config.barGradientFrom}, ${config.barGradientTo})`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-4" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RangeSlider label="Border Radius" value={config.barBorderRadius} onChange={(v) => updateConfig("barBorderRadius", v)} max={30} />
              <RangeSlider label="Padding" value={config.barPadding} onChange={(v) => updateConfig("barPadding", v)} min={4} max={32} />
            </div>

            <SelectField
              label="Shadow"
              value={config.barShadow}
              onChange={(v) => updateConfig("barShadow", v)}
              options={[
                { value: "none", label: "None" },
                { value: "sm", label: "Small - Subtle depth" },
                { value: "md", label: "Medium - Standard depth" },
                { value: "lg", label: "Large - Prominent depth" },
                { value: "xl", label: "Extra Large - Maximum depth" },
              ]}
            />

            {/* Border */}
            <div className="border-t border-gray-100 pt-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RangeSlider label="Border Width" value={config.barBorderWidth} onChange={(v) => updateConfig("barBorderWidth", v)} max={5} />
              <RangeSlider label="Opacity" value={config.barOpacity} onChange={(v) => updateConfig("barOpacity", v)} min={20} max={100} suffix="%" />
            </div>
            {config.barBorderWidth > 0 && (
              <ColorPicker label="Border Color" value={config.barBorderColor} onChange={(v) => updateConfig("barBorderColor", v)} />
            )}
          </div>
        </SectionCard>
  
        {/* ─── Typography & Colors ───────────────────────────── */}
        <SectionCard title="Typography & Colors" icon={<Icons.Type size={16} />}>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorPicker label="Title Color" value={config.titleColor} onChange={(v) => updateConfig("titleColor", v)} />
              <SelectField
                label="Title Weight"
                value={config.titleFontWeight}
                onChange={(v) => updateConfig("titleFontWeight", v)}
                options={[
                  { value: "300", label: "Light" },
                  { value: "400", label: "Normal" },
                  { value: "500", label: "Medium" },
                  { value: "600", label: "Semibold" },
                  { value: "700", label: "Bold" },
                  { value: "800", label: "Extra Bold" },
                ]}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorPicker label="Price Color" value={config.priceColor} onChange={(v) => updateConfig("priceColor", v)} />
              <SelectField
                label="Price Weight"
                value={config.priceFontWeight}
                onChange={(v) => updateConfig("priceFontWeight", v)}
                options={[
                  { value: "400", label: "Normal" },
                  { value: "500", label: "Medium" },
                  { value: "600", label: "Semibold" },
                  { value: "700", label: "Bold" },
                  { value: "800", label: "Extra Bold" },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorPicker label="Compare Price" value={config.discountedPriceColor} onChange={(v) => updateConfig("discountedPriceColor", v)} />
              <SelectField
                label="Compare Style"
                value={config.comparePriceStyle}
                onChange={(v) => updateConfig("comparePriceStyle", v)}
                options={[
                  { value: "strikethrough", label: "Strikethrough" },
                  { value: "badge", label: "Sale Badge" },
                ]}
              />
            </div>
            
            <div className="border-t border-gray-100 pt-4" />

            <SelectField
              label="Font Family"
              value={config.fontFamily}
              onChange={(v) => updateConfig("fontFamily", v)}
              options={[
                { value: "inherit", label: "Store Default" },
                { value: "system-ui, -apple-system, sans-serif", label: "System UI" },
                { value: "'Inter', sans-serif", label: "Inter" },
                { value: "'Roboto', sans-serif", label: "Roboto" },
                { value: "'Open Sans', sans-serif", label: "Open Sans" },
                { value: "'Lato', sans-serif", label: "Lato" },
                { value: "'Montserrat', sans-serif", label: "Montserrat" },
                { value: "'Poppins', sans-serif", label: "Poppins" },
                { value: "Georgia, serif", label: "Georgia (Serif)" },
                { value: "'Playfair Display', serif", label: "Playfair Display" },
                { value: "'Segoe UI', Tahoma, sans-serif", label: "Segoe UI" },
                { value: "'Arial', sans-serif", label: "Arial" },
              ]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Font Size"
                value={config.fontSize}
                onChange={(v) => updateConfig("fontSize", v)}
                options={[
                  { value: 11, label: "XS (11px)" },
                  { value: 12, label: "Small (12px)" },
                  { value: 13, label: "Default (13px)" },
                  { value: 14, label: "Medium (14px)" },
                  { value: 16, label: "Large (16px)" },
                  { value: 18, label: "XL (18px)" },
                  { value: 20, label: "XXL (20px)" },
                ]}
              />
              <SelectField
                label="Text Transform"
                value={config.textTransform}
                onChange={(v) => updateConfig("textTransform", v)}
                options={[
                  { value: "none", label: "None" },
                  { value: "uppercase", label: "UPPERCASE" },
                  { value: "lowercase", label: "lowercase" },
                  { value: "capitalize", label: "Capitalize" },
                ]}
              />
            </div>

            <RangeSlider label="Letter Spacing" value={config.titleLetterSpacing} onChange={(v) => updateConfig("titleLetterSpacing", v)} min={-1} max={5} />
          </div>
        </SectionCard>
  
        {/* ─── Button Styling ────────────────────────────────── */}
        <SectionCard title="Button Styling" icon={<Icons.MousePointer size={16} />}>
          <div className="space-y-5">
            <SelectField
              label="Button Style"
              value={config.buttonStyle}
              onChange={(v) => updateConfig("buttonStyle", v)}
              options={[
                { value: "filled", label: "Filled (Solid)" },
                { value: "outline", label: "Outline" },
                { value: "pill", label: "Pill Shape" },
                { value: "ghost", label: "Ghost (Transparent)" },
              ]}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ColorPicker label="Background" value={config.buttonBgColor} onChange={(v) => updateConfig("buttonBgColor", v)} />
              <ColorPicker label="Hover Background" value={config.buttonHoverBgColor} onChange={(v) => updateConfig("buttonHoverBgColor", v)} />
            </div>
            
            <ColorPicker label="Text Color" value={config.buttonTextColor} onChange={(v) => updateConfig("buttonTextColor", v)} />

            {(config.buttonStyle === "outline" || config.buttonStyle === "ghost") && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ColorPicker label="Border Color" value={config.buttonBorderColor} onChange={(v) => updateConfig("buttonBorderColor", v)} />
                <RangeSlider label="Border Width" value={config.buttonBorderWidth} onChange={(v) => updateConfig("buttonBorderWidth", v)} max={5} />
              </div>
            )}

            <div className="border-t border-gray-100 pt-4" />

            <RangeSlider label="Border Radius" value={config.buttonBorderRadius} onChange={(v) => updateConfig("buttonBorderRadius", v)} max={30} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RangeSlider label="Padding X" value={config.buttonPaddingX} onChange={(v) => updateConfig("buttonPaddingX", v)} min={8} max={48} />
              <RangeSlider label="Padding Y" value={config.buttonPaddingY} onChange={(v) => updateConfig("buttonPaddingY", v)} min={4} max={24} />
            </div>

            <SelectField
              label="Font Weight"
              value={config.buttonFontWeight}
              onChange={(v) => updateConfig("buttonFontWeight", v)}
              options={[
                { value: "400", label: "Normal" },
                { value: "500", label: "Medium" },
                { value: "600", label: "Semibold" },
                { value: "700", label: "Bold" },
              ]}
            />

            <SelectField
              label="Shadow"
              value={config.buttonShadow}
              onChange={(v) => updateConfig("buttonShadow", v)}
              options={[
                { value: "none", label: "None" },
                { value: "sm", label: "Small" },
                { value: "md", label: "Medium" },
                { value: "lg", label: "Large" },
              ]}
            />

            <div className="border-t border-gray-100 pt-4" />

            {/* Button Content */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Button Text</label>
              <input
                type="text"
                value={config.buttonCustomText}
                onChange={(e) => updateConfig("buttonCustomText", e.target.value)}
                placeholder="Add to Cart"
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-gray-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-colors"
              />
            </div>
            
            <Toggle
              checked={config.buttonShowIcon}
              onChange={(v) => updateConfig("buttonShowIcon", v)}
              label="Show Cart Icon"
              description="Display a cart icon alongside the button text"
            />
          </div>
        </SectionCard>

        {/* ─── Product Image ─────────────────────────────────── */}
        <SectionCard title="Product Image" icon={<Icons.Image size={16} />} defaultOpen={false}>
          <div className="space-y-5">
            <RangeSlider label="Image Size" value={config.imageSize} onChange={(v) => updateConfig("imageSize", v)} min={24} max={80} />
            <RangeSlider label="Border Radius" value={config.imageBorderRadius} onChange={(v) => updateConfig("imageBorderRadius", v)} max={20} />
            <RangeSlider label="Border Width" value={config.imageBorderWidth} onChange={(v) => updateConfig("imageBorderWidth", v)} max={4} />
            {config.imageBorderWidth > 0 && (
              <ColorPicker label="Border Color" value={config.imageBorderColor} onChange={(v) => updateConfig("imageBorderColor", v)} />
            )}
          </div>
        </SectionCard>

        {/* ─── Variant Selector ──────────────────────────────── */}
        <SectionCard title="Variant Selector" icon={<Icons.Grid size={16} />} defaultOpen={false}>
          <div className="space-y-5">
            {/* Show Labels Toggle */}
            <Toggle
              label="Show Variant Labels"
              description="Display option names (e.g. Size, Color) next to variant controls"
              checked={config.variantShowLabels ?? true}
              onChange={(v) => updateConfig("variantShowLabels", v)}
            />

            <div className="border-t border-gray-100 pt-4" />

            {/* Per-Option Display Types */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Variant Option Types</label>
              <p className="text-xs text-gray-400 mb-2">
                Configure the display type for each variant option. Names must match your BigCommerce product option names exactly. Unconfigured options default to Dropdown.
              </p>
              <div className="space-y-2">
                {(config.variantOptions || []).map((opt: { name: string; displayType: string }, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt.name}
                      placeholder="Option name..."
                      onChange={(e) => {
                        const updated = [...config.variantOptions];
                        updated[idx] = { ...updated[idx], name: e.target.value };
                        updateConfig("variantOptions", updated);
                      }}
                      className="flex-1 min-w-0 px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                    />
                    <select
                      value={opt.displayType}
                      onChange={(e) => {
                        const updated = [...config.variantOptions];
                        updated[idx] = { ...updated[idx], displayType: e.target.value };
                        updateConfig("variantOptions", updated);
                      }}
                      className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
                    >
                      <option value="dropdown">Dropdown</option>
                      <option value="swatch">Swatch</option>
                      <option value="radioButtons">Radio Buttons</option>
                      <option value="rectangleList">Rectangle List</option>
                    </select>
                    <button
                      onClick={() => {
                        const updated = config.variantOptions.filter((_: any, i: number) => i !== idx);
                        updateConfig("variantOptions", updated);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Icons.X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  const updated = [...(config.variantOptions || []), { name: "", displayType: "dropdown" }];
                  updateConfig("variantOptions", updated);
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 mt-1 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors w-fit"
              >
                <Icons.Plus size={14} />
                Add Variant Option
              </button>
            </div>

            <div className="border-t border-gray-100 pt-4" />

            {/* Shared Variant Styling */}
            <ColorPicker label="Active / Selected Color" value={config.variantActiveColor} onChange={(v) => updateConfig("variantActiveColor", v)} />
            <ColorPicker label="Border Color" value={config.variantBorderColor} onChange={(v) => updateConfig("variantBorderColor", v)} />
            <ColorPicker label="Text Color" value={config.variantTextColor} onChange={(v) => updateConfig("variantTextColor", v)} />
            <RangeSlider label="Border Radius" value={config.variantBorderRadius} onChange={(v) => updateConfig("variantBorderRadius", v)} max={16} />
          </div>
        </SectionCard>

        {/* ─── Quantity Picker ───────────────────────────────── */}
        <SectionCard title="Quantity Picker" icon={<Icons.Hash size={16} />} defaultOpen={false}>
          <div className="space-y-5">
            <SelectField
              label="Picker Style"
              value={config.quantityStyle}
              onChange={(v) => updateConfig("quantityStyle", v)}
              options={[
                { value: "plusMinus", label: "Plus / Minus Buttons" },
                { value: "dropdown", label: "Dropdown Select" },
                { value: "input", label: "Number Input" },
              ]}
            />
            <ColorPicker label="Text Color" value={config.quantityTextColor} onChange={(v) => updateConfig("quantityTextColor", v)} />
            <ColorPicker label="Background Color" value={config.quantityBgColor} onChange={(v) => updateConfig("quantityBgColor", v)} />
            <ColorPicker label="Button / Icon Color" value={config.quantityButtonColor} onChange={(v) => updateConfig("quantityButtonColor", v)} />
            <ColorPicker label="Border Color" value={config.quantityBorderColor} onChange={(v) => updateConfig("quantityBorderColor", v)} />
            <RangeSlider label="Border Radius" value={config.quantityBorderRadius} onChange={(v) => updateConfig("quantityBorderRadius", v)} max={16} />
          </div>
        </SectionCard>
      </div>
    );
  }
