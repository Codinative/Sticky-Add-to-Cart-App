'use client'

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
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
import { flattenToNestedConfig, nestedToFlattenConfig } from "@/lib/configConverter";

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
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 py-5 sm:h-20">
              <div className="flex items-center w-full sm:w-auto justify-center sm:justify-start">
                <Image
                  src="/navbar-logo.png"
                  alt="Sticky Add to Cart"
                  width={240}
                  height={60}
                  className="h-12 sm:h-14 w-auto object-contain"
                  priority
                />
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${config?.enabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${config?.enabled ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {config?.enabled ? "Active" : "Inactive"}
                </div>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className={`
                    flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all flex-1 sm:flex-initial justify-center
                    ${hasChanges
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }
                  `}
                >
                  <Icons.Save size={15} />
                  <span className="hidden sm:inline">{saving ? "Saving..." : "Save Changes"}</span>
                  <span className="sm:hidden">{saving ? "Saving..." : "Save"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:h-[calc(100vh-128px)]">
            {/* Left: Config Panel */}
            <div className="w-full lg:w-[400px] lg:shrink-0 flex flex-col gap-4 lg:h-full">
              {/* Tab Navigation */}
              <div className="flex gap-1 p-1 bg-white rounded-lg border border-gray-200 shrink-0">
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
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-7 sm:pb-0">
                <div className="animate-[fadeIn_0.3s_ease-out]">
                  {config && activeTab === "style" && <StylePanel config={config} updateConfig={updateConfig} />}
                  {config && activeTab === "layout" && <LayoutPanel config={config} updateConfig={updateConfig} />}
                  {config && activeTab === "behavior" && <BehaviorPanel config={config} updateConfig={updateConfig} />}
                </div>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 min-h-0 lg:h-full">
              {/* Preview Toolbar */}
              <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 bg-white rounded-lg border border-gray-200 px-4 py-3 sm:py-2.5">
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
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Full page preview button */}
                  <button
                    onClick={() => {
                      if (config) {
                        const encoded = btoa(encodeURIComponent(JSON.stringify(config)));
                        window.open("/preview#config=" + encoded, "_blank");
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
                    title="Open full page preview in new tab"
                  >
                    <Icons.Maximize size={13} />
                    <span className="hidden sm:inline">Full Preview</span>
                  </button>
                <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg flex-1 sm:flex-initial">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex-1 sm:flex-initial p-2 rounded-md transition-all flex items-center justify-center ${previewDevice === "desktop" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"}`}
                  >
                    <Icons.Monitor size={16} />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`flex-1 sm:flex-initial p-2 rounded-md transition-all flex items-center justify-center ${previewDevice === "mobile" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"}`}
                  >
                    <Icons.Smartphone size={16} />
                  </button>
                </div>
              </div>
              </div>

              {/* Preview Area */}
              <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 sm:p-6 overflow-hidden min-h-[300px]"
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
