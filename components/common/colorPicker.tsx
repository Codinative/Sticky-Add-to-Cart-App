import { useEffect, useRef, useState } from "react";

export default function ColorPicker({ label, value, onChange }: { label: string, value: string, onChange: (value: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }, []);
  
    const presets = [
      "#1F2937", "#374151", "#6B7280", "#3B82F6", "#2563EB",
      "#8B5CF6", "#EC4899", "#EF4444", "#F59E0B", "#10B981",
      "#14B8A6", "#06B6D4", "#FFFFFF", "#F3F4F6", "#000000",
    ];
  
    return (
      <div className="flex flex-col gap-1.5" ref={ref}>
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">{label}</label>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors w-full group"
          >
            <div
              className="w-6 h-6 rounded-md border border-gray-200 shadow-sm shrink-0"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm text-slate-700 font-mono uppercase">{value}</span>
          </button>
          {isOpen && (
            <div className="absolute z-50 top-full mt-2 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-[240px]"
              style={{ animation: "fadeIn 0.15s ease-out" }}>
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {presets.map((c) => (
                  <button
                    key={c}
                    onClick={() => { onChange(c); }}
                    className={`w-9 h-9 rounded-lg border-2 transition-all hover:scale-105 ${value === c ? "border-slate-900 shadow-sm" : "border-gray-200"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-sm font-mono border border-gray-200 rounded-md uppercase focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }