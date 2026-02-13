import { useState } from "react";
import { Icons } from "./icons";

export default function SectionCard({ title, icon, children, defaultOpen = true }: { title: string, icon: React.ReactNode, children: React.ReactNode, defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
      <div className="bg-white rounded-lg border border-gray-200 transition-all hover:border-gray-300">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              {icon}
            </div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          </div>
          <div className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
            <Icons.ChevronDown />
          </div>
        </button>
        {isOpen && (
          <div className="px-5 pb-4 border-t border-gray-100 pt-4"
            style={{ animation: "slideDown 0.2s ease-out" }}>
            {children}
          </div>
        )}
      </div>
    );
  }