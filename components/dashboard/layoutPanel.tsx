import SectionCard from "../common/sectionCard";
import { Icons } from "../common/icons";
import ElementArranger from "../common/elementArranger";
import PositionSelector from "../common/positionSelector";
import NumberInput from "../common/numberInput";
import SelectField from "../common/selectField";
import RangeSlider from "../common/rangeSlider";

export function LayoutPanel({ config, updateConfig }: { config: any, updateConfig: (key: string, value: any) => void }) {
    return (
      <div className="space-y-4">
        {/* ─── Element Arrangement ───────────────────────────── */}
        <SectionCard title="Element Arrangement" icon={<Icons.Move size={16} />}>
          <div className="space-y-3">
            <p className="text-xs text-gray-500">Drag to reorder elements. Toggle visibility with the eye icon.</p>
            <ElementArranger
              elements={config.elements}
              onChange={(v) => updateConfig("elements", v)}
            />
          </div>
        </SectionCard>
  
        {/* ─── Position on Page ──────────────────────────────── */}
        <SectionCard title="Position on Page" icon={<Icons.Layout size={16} />}>
          <PositionSelector
            value={config.position}
            onChange={(v) => updateConfig("position", v)}
          />
        </SectionCard>

        {/* ─── Bar Width & Alignment ─────────────────────────── */}
        <SectionCard title="Width & Alignment" icon={<Icons.Maximize size={16} />}>
          <div className="space-y-5">
            {/* Width Mode Toggle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Bar Width</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "full", label: "Full Width", desc: "Edge to edge" },
                  { value: "contained", label: "Contained", desc: "With max width" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateConfig("barWidthMode", option.value)}
                    className={`flex flex-col items-center gap-1 px-3 py-3 rounded-lg border-2 transition-all text-center ${
                      config.barWidthMode === option.value
                        ? "border-slate-900 bg-slate-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span className={`text-sm font-medium ${config.barWidthMode === option.value ? "text-slate-900" : "text-gray-600"}`}>
                      {option.label}
                    </span>
                    <span className="text-[10px] text-gray-400">{option.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {config.barWidthMode === "contained" && (
              <RangeSlider 
                label="Bar Max Width" 
                value={config.barMaxWidth} 
                onChange={(v) => updateConfig("barMaxWidth", v)} 
                min={600} 
                max={1800} 
              />
            )}

            <RangeSlider
              label="Content Max Width"
              value={config.contentMaxWidth ?? 0}
              onChange={(v) => updateConfig("contentMaxWidth", v)}
              min={0}
              max={1800}
            />
            <p className="text-xs text-gray-400 -mt-3">
              Constrains the inner content width within the bar. Set to 0 for no limit (content stretches to fill the bar).
            </p>

            <div className="border-t border-gray-100 pt-4" />

            {/* Justify Content */}
            <SelectField
              label="Justify Content"
              value={config.contentAlignment}
              onChange={(v) => updateConfig("contentAlignment", v)}
              options={[
                { value: "left", label: "Start (flex-start)" },
                { value: "center", label: "Center" },
                { value: "right", label: "End (flex-end)" },
                { value: "spaceBetween", label: "Space Between" },
                { value: "spaceAround", label: "Space Around" },
                { value: "spaceEvenly", label: "Space Evenly" },
              ]}
            />

            {/* Vertical Alignment */}
            <SelectField
              label="Vertical Alignment"
              value={config.verticalAlignment}
              onChange={(v) => updateConfig("verticalAlignment", v)}
              options={[
                { value: "top", label: "Top" },
                { value: "center", label: "Center" },
                { value: "bottom", label: "Bottom" },
              ]}
            />
          </div>
        </SectionCard>
  
        {/* ─── Spacing ──────────────────────────────────────── */}
        <SectionCard title="Spacing" icon={<Icons.Columns size={16} />} defaultOpen={false}>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <NumberInput label="Element Gap" value={config.elementGap} onChange={(v) => updateConfig("elementGap", v)} max={40} />
              <NumberInput label="Bar Offset" value={config.barOffset} onChange={(v) => updateConfig("barOffset", v)} max={50} />
            </div>
            <RangeSlider 
              label="Group Gap" 
              value={config.groupGap ?? 32} 
              onChange={(v) => updateConfig("groupGap", v)} 
              min={0} 
              max={400} 
            />
            <p className="text-xs text-gray-400">
              Element Gap controls the space between items within each group. Group Gap controls the space between the left group (image, title, price) and the right group (variants, quantity, button). Bar Offset adjusts the distance from the viewport edge.
            </p>
          </div>
        </SectionCard>
      </div>
    );
  }
