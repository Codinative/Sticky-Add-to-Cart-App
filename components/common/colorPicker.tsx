import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

export default function ColorPicker({ label, value, onChange }: { label: string, value: string, onChange: (value: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

    const updatePosition = useCallback(() => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownHeight = 260; // approximate height of the dropdown
        const spaceBelow = window.innerHeight - rect.bottom;
        const openAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

        setDropdownPos({
          top: openAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
          left: rect.left,
        });
      }
    }, []);

    useEffect(() => {
      if (!isOpen) return;
      updatePosition();

      // Listen for scroll on capture phase to catch all scroll containers
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }, [isOpen, updatePosition]);

    useEffect(() => {
      const handleClick = (e: MouseEvent) => {
        if (
          buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
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
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-700 uppercase tracking-wide">{label}</label>
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors w-full group"
          >
            <div
              className="w-6 h-6 rounded-md border border-gray-200 shadow-sm shrink-0"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm text-slate-700 font-mono uppercase">{value}</span>
          </button>
          {isOpen && createPortal(
            <div
              ref={dropdownRef}
              className="fixed z-[9999] bg-white rounded-lg shadow-lg border border-gray-200 p-3 w-[240px]"
              style={{
                top: dropdownPos.top,
                left: dropdownPos.left,
                animation: "fadeIn 0.15s ease-out",
              }}
            >
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
            </div>,
            document.body
          )}
        </div>
      </div>
    );
  }
