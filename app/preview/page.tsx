'use client'

import { useEffect, useState } from "react";
import { DefaultStickyBarConfig } from "@/types/config";
import { Icons } from "@/components/common/icons";
import { flattenToNestedConfig } from "@/lib/configConverter";
import { buildSrcdoc } from "@/lib/previewSrcdoc";

export default function PreviewPage() {
  const [config, setConfig] = useState<DefaultStickyBarConfig | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.startsWith("#config=")) {
        const decoded = decodeURIComponent(atob(hash.slice(8)));
        setConfig(JSON.parse(decoded));
      }
    } catch {}
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm">No preview config found.</p>
          <p className="text-gray-400 text-xs mt-1">Open this page from the dashboard.</p>
        </div>
      </div>
    );
  }

  const nestedConfig = flattenToNestedConfig(config);
  const isMobile = device === "mobile";
  const srcdoc = buildSrcdoc(nestedConfig, isMobile, config.position);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 shrink-0" style={{ height: "53px" }}>
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shrink-0">
            <Icons.Eye size={15} />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold text-slate-900 truncate hidden xs:inline sm:inline">Full Page Preview</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 shrink-0 hidden sm:inline">Preview Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded-md transition-all flex items-center justify-center ${device === "desktop" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`}
              title="Desktop view"
            >
              <Icons.Monitor size={15} />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded-md transition-all flex items-center justify-center ${device === "mobile" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`}
              title="Mobile view"
            >
              <Icons.Smartphone size={15} />
            </button>
          </div>
          <button
            onClick={() => window.close()}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
            title="Close preview"
          >
            <Icons.X size={16} />
          </button>
        </div>
      </div>

      {/* Preview area */}
      {isMobile ? (
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col items-center justify-start p-4 sm:p-6 min-w-max">
            <div className="bg-slate-900 rounded-[44px] p-3 shadow-2xl">
              <div className="rounded-[36px] overflow-hidden" style={{ width: "390px", height: "760px", display: "flex", flexDirection: "column" }}>
                {/* Mobile status bar — outside iframe so fixed bar in iframe starts below it */}
                <div style={{ background: "#fff", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#111" }}>9:41</span>
                  <div style={{ width: "18px", height: "11px", border: "2px solid #111", borderRadius: "3px", position: "relative" }}>
                    <div style={{ position: "absolute", left: "1px", top: "1px", bottom: "1px", right: "3px", background: "#111", borderRadius: "1px" }} />
                    <div style={{ position: "absolute", right: "-4px", top: "50%", transform: "translateY(-50%)", width: "2px", height: "5px", background: "#9ca3af", borderRadius: "0 1px 1px 0" }} />
                  </div>
                </div>
                {/* Mobile URL bar — outside iframe */}
                <div style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", padding: "6px 10px", flexShrink: 0 }}>
                  <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "5px 10px", fontSize: "11px", color: "#9ca3af", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    yourstore.mybigcommerce.com/product
                  </div>
                </div>
                {/* Website content iframe — fixed bar at top:0 lands correctly below the chrome above */}
                <iframe
                  srcDoc={srcdoc}
                  style={{ width: "100%", flex: 1, border: "none", display: "block", minHeight: 0 }}
                />
                <div style={{ height: "22px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <div style={{ width: "120px", height: "4px", background: "#d1d5db", borderRadius: "2px" }} />
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">iPhone 14 Pro · 390×844</p>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
          {/* Desktop fake browser chrome — outside iframe so fixed bar in iframe starts below it */}
          <div style={{ background: "#f3f4f6", borderBottom: "1px solid #e5e7eb", padding: "10px 16px", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#EF4444" }} />
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#F59E0B" }} />
              <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#22C55E" }} />
            </div>
            <div style={{ flex: 1, background: "white", border: "1px solid #e5e7eb", borderRadius: "6px", padding: "5px 12px", fontSize: "12px", color: "#9ca3af", textAlign: "center", maxWidth: "440px", margin: "0 auto", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              yourstore.mybigcommerce.com/premium-wireless-headphones
            </div>
          </div>
          {/* Website content iframe — fixed bar at top:0 lands correctly below the chrome above */}
          <iframe
            srcDoc={srcdoc}
            style={{ flex: 1, border: "none", width: "100%", display: "block", minHeight: 0 }}
          />
        </div>
      )}
    </div>
  );
}
