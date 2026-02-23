'use client'

import { useEffect, useState } from "react";
import { DefaultStickyBarConfig } from "@/types/config";
import { Icons } from "@/components/common/icons";
import { flattenToNestedConfig } from "@/lib/configConverter";

// Mock product data injected into the iframe
const MOCK_PRODUCT = {
  isProductPage: true,
  product: {
    entityId: 1,
    name: "Premium Wireless Headphones",
    image: { url: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2056%2056%22%3E%3Crect%20width%3D%2256%22%20height%3D%2256%22%20fill%3D%22%23F3F4F6%22%20rx%3D%228%22%2F%3E%3Crect%20x%3D%2212%22%20y%3D%2212%22%20width%3D%2232%22%20height%3D%2232%22%20rx%3D%222%22%20fill%3D%22none%22%20stroke%3D%22%23D1D5DB%22%20stroke-width%3D%221.5%22%2F%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2221%22%20r%3D%222%22%20fill%3D%22%23D1D5DB%22%2F%3E%3Cpath%20d%3D%22m12%2036%208-8%205%205%203-3%2010%2010%22%20fill%3D%22none%22%20stroke%3D%22%23D1D5DB%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E", alt: "Product image" },
    prices: { price: 299.99, basePrice: 399.99, salePrice: 299.99 },
    variantLabels: { "Size": ["S", "M", "L", "XL"], "Color": ["Red", "Blue", "Green"] },
    variants: [
      { variantKey: "Size:S,Color:Red,", price: 299.99, optionsIds: { "Size": 101, "Color": 201 } },
      { variantKey: "Size:M,Color:Blue,", price: 299.99, optionsIds: { "Size": 102, "Color": 202 } },
      { variantKey: "Size:L,Color:Green,", price: 319.99, optionsIds: { "Size": 103, "Color": 203 } },
    ],
    options: [
      { id: 100, name: "Size", isVariantOption: true },
      { id: 200, name: "Color", isVariantOption: true },
    ],
  },
};

function buildSrcdoc(nestedConfig: object, isMobile: boolean, position: string): string {
  const configJSON = JSON.stringify(nestedConfig);
  const productJSON = JSON.stringify(MOCK_PRODUCT);
  const bottomPaddingMobile = position === "bottom" ? "160px" : "24px";
  const bottomPaddingDesktop = position === "bottom" ? "200px" : "32px";
  const bottomPaddingDesktopSm = position === "bottom" ? "180px" : "24px";

  const content = isMobile
    ? `<div style="padding-bottom:${bottomPaddingMobile};">
        <div style="aspect-ratio:1/1;background:linear-gradient(135deg,#f3f4f6,#e5e7eb);display:flex;align-items:center;justify-content:center;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
        <div style="display:flex;gap:8px;padding:8px 12px;border-bottom:1px solid #f3f4f6;">
          <div style="width:40px;height:40px;border-radius:6px;background:linear-gradient(135deg,#f3f4f6,#e5e7eb);border:2px solid #111;"></div>
          <div style="width:40px;height:40px;border-radius:6px;background:linear-gradient(135deg,#f3f4f6,#e5e7eb);border:2px solid transparent;"></div>
          <div style="width:40px;height:40px;border-radius:6px;background:linear-gradient(135deg,#f3f4f6,#e5e7eb);border:2px solid transparent;"></div>
        </div>
        <div style="padding:14px;">
          <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px;">Sony</p>
          <h1 style="font-size:17px;font-weight:700;color:#111827;margin-bottom:8px;line-height:1.3;">Premium Wireless Headphones</h1>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;">
            <span style="color:#FBBF24;font-size:14px;">★★★★</span><span style="color:#e5e7eb;font-size:14px;">★</span>
            <span style="font-size:11px;color:#6b7280;">(128)</span>
          </div>
          <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:14px;">
            <span style="font-size:20px;font-weight:700;color:#111;">$299.99</span>
            <span style="font-size:13px;color:#9ca3af;text-decoration:line-through;">$399.99</span>
            <span style="background:#FEF2F2;color:#DC2626;font-size:10px;font-weight:600;padding:1px 7px;border-radius:20px;">-25%</span>
          </div>
          <div style="margin-bottom:12px;">
            <p style="font-size:12px;font-weight:500;color:#374151;margin-bottom:6px;">Color: <span style="font-weight:400;color:#6b7280;">Midnight Black</span></p>
            <div style="display:flex;gap:6px;">
              <div style="width:24px;height:24px;border-radius:50%;background:#1F2937;border:2px solid #111;box-shadow:0 0 0 2px white inset;"></div>
              <div style="width:24px;height:24px;border-radius:50%;background:white;border:2px solid #e5e7eb;"></div>
              <div style="width:24px;height:24px;border-radius:50%;background:#1E3A5F;border:2px solid transparent;"></div>
            </div>
          </div>
          <div style="margin-bottom:14px;">
            <p style="font-size:12px;font-weight:500;color:#374151;margin-bottom:6px;">Size</p>
            <div style="display:flex;gap:6px;">
              <div style="padding:5px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:12px;color:#374151;">S</div>
              <div style="padding:5px 12px;border:2px solid #111;border-radius:6px;font-size:12px;background:#111;color:white;">M</div>
              <div style="padding:5px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:12px;color:#374151;">L</div>
              <div style="padding:5px 12px;border:1px solid #e5e7eb;border-radius:6px;font-size:12px;color:#374151;">XL</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:5px;font-size:12px;color:#16a34a;margin-bottom:14px;">
            <div>✓ Free shipping over $50</div>
            <div>✓ 30-day easy returns</div>
            <div>✓ 2-year warranty</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            <div style="height:10px;background:#f3f4f6;border-radius:4px;width:100%;"></div>
            <div style="height:10px;background:#f3f4f6;border-radius:4px;width:83%;"></div>
            <div style="height:10px;background:#f3f4f6;border-radius:4px;width:67%;"></div>
          </div>
        </div>
      </div>`
    : `<div class="page-wrap">
        <div class="breadcrumb">
          <span>Home</span><span>/</span><span>Headphones</span><span>/</span>
          <span style="color:#374151;">Premium Wireless Headphones</span>
        </div>
        <div class="prod-layout">
          <div class="prod-img-col">
            <div style="background:linear-gradient(135deg,#f3f4f6,#e5e7eb);border-radius:16px;aspect-ratio:1/1;display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;">
              <div style="width:64px;height:64px;border-radius:8px;background:linear-gradient(135deg,#f3f4f6,#e5e7eb);border:2px solid #111827;"></div>
              <div style="width:64px;height:64px;border-radius:8px;background:linear-gradient(135deg,#f3f4f6,#e5e7eb);border:2px solid transparent;"></div>
              <div style="width:64px;height:64px;border-radius:8px;background:linear-gradient(135deg,#f3f4f6,#e5e7eb);border:2px solid transparent;"></div>
              <div style="width:64px;height:64px;border-radius:8px;background:linear-gradient(135deg,#f3f4f6,#e5e7eb);border:2px solid transparent;"></div>
            </div>
          </div>
          <div class="prod-info-col">
            <p style="font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px;">Sony</p>
            <h1 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#111827;margin-bottom:10px;line-height:1.3;">Premium Wireless Headphones</h1>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
              <span style="color:#FBBF24;font-size:16px;">★★★★</span><span style="color:#e5e7eb;font-size:16px;">★</span>
              <span style="font-size:13px;color:#6b7280;">(128 reviews)</span>
            </div>
            <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
              <span style="font-size:clamp(22px,4vw,32px);font-weight:700;color:#111;">$299.99</span>
              <span style="font-size:clamp(14px,2vw,18px);color:#9ca3af;text-decoration:line-through;">$399.99</span>
              <span style="background:#FEF2F2;color:#DC2626;font-size:12px;font-weight:600;padding:2px 8px;border-radius:20px;">-25%</span>
            </div>
            <div style="margin-bottom:18px;">
              <p style="font-size:13px;font-weight:500;color:#374151;margin-bottom:8px;">Color: <span style="font-weight:400;color:#6b7280;">Midnight Black</span></p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <div style="width:30px;height:30px;border-radius:50%;background:#1F2937;border:2px solid #111827;box-shadow:0 0 0 2px white inset;cursor:pointer;"></div>
                <div style="width:30px;height:30px;border-radius:50%;background:white;border:2px solid #e5e7eb;cursor:pointer;"></div>
                <div style="width:30px;height:30px;border-radius:50%;background:#1E3A5F;border:2px solid transparent;cursor:pointer;"></div>
              </div>
            </div>
            <div style="margin-bottom:22px;">
              <p style="font-size:13px;font-weight:500;color:#374151;margin-bottom:8px;">Size</p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <div style="padding:8px 16px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;color:#374151;cursor:pointer;">S</div>
                <div style="padding:8px 16px;border:2px solid #111;border-radius:8px;font-size:13px;background:#111;color:white;cursor:pointer;">M</div>
                <div style="padding:8px 16px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;color:#374151;cursor:pointer;">L</div>
                <div style="padding:8px 16px;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;color:#374151;cursor:pointer;">XL</div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;font-size:13px;color:#16a34a;margin-bottom:20px;">
              <div>✓ Free shipping over $50</div>
              <div>✓ 30-day easy returns</div>
              <div>✓ 2-year warranty</div>
            </div>
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
              <button style="flex:1;min-width:140px;background:#111827;color:white;border:none;border-radius:12px;padding:14px 24px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;">Add to Cart</button>
              <button style="width:50px;height:50px;flex-shrink:0;border:1px solid #e5e7eb;border-radius:12px;background:white;cursor:pointer;font-size:20px;display:flex;align-items:center;justify-content:center;color:#6b7280;font-family:inherit;">♡</button>
            </div>
          </div>
        </div>
        <div class="desc-section">
          <h2 style="font-size:18px;font-weight:600;color:#111827;margin-bottom:16px;">Product Description</h2>
          <div style="display:flex;flex-direction:column;gap:8px;max-width:600px;">
            <div style="height:12px;background:#f3f4f6;border-radius:4px;width:100%;"></div>
            <div style="height:12px;background:#f3f4f6;border-radius:4px;width:83%;"></div>
            <div style="height:12px;background:#f3f4f6;border-radius:4px;width:67%;"></div>
            <div style="height:12px;background:#f3f4f6;border-radius:4px;width:100%;margin-top:4px;"></div>
            <div style="height:12px;background:#f3f4f6;border-radius:4px;width:75%;"></div>
          </div>
        </div>
      </div>`;

  return `<!DOCTYPE html>
<html><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { height: 100%; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: white; overflow-y: auto; min-height: 100%; }

    /* Desktop product page responsive layout */
    .page-wrap { max-width: 1200px; margin: 0 auto; padding: 32px 48px ${bottomPaddingDesktop}; }
    .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #9ca3af; margin-bottom: 24px; }
    .prod-layout { display: flex; gap: 48px; align-items: flex-start; }
    .prod-img-col { width: 50%; flex-shrink: 0; }
    .prod-info-col { flex: 1; min-width: 0; }
    .desc-section { margin-top: 48px; border-top: 1px solid #f3f4f6; padding-top: 32px; }
    @media (max-width: 720px) {
      .page-wrap { padding: 16px 16px ${bottomPaddingDesktopSm}; }
      .breadcrumb { display: none; }
      .prod-layout { flex-direction: column; gap: 20px; }
      .prod-img-col { width: 100%; }
      .desc-section { margin-top: 28px; padding-top: 20px; }
    }
    @media (min-width: 721px) and (max-width: 960px) {
      .page-wrap { padding: 24px 28px ${bottomPaddingDesktop}; }
      .prod-layout { gap: 28px; }
      .prod-img-col { width: 45%; }
    }
  </style>
  <script>
    var __cfg = ${configJSON};
    var __prod = ${productJSON};
    // Disable ATC button action in preview mode
    document.addEventListener('click', function(e) {
      var t = e.target;
      while (t) {
        if (t.id && t.id.indexOf('-atc-btn') !== -1) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        t = t.parentElement;
      }
    }, true);

    var _of = window.fetch;
    window.fetch = function(url, opts) {
      var u = String(url);
      if (u.indexOf('storefront/config') > -1) {
        return Promise.resolve({ ok: true, json: function() { return Promise.resolve({ config: __cfg }); } });
      }
      if (u.indexOf('storefront/product') > -1) {
        return Promise.resolve({ ok: true, json: function() { return Promise.resolve(__prod); } });
      }
      return _of ? _of.call(window, url, opts) : Promise.reject(new Error('no fetch'));
    };
  </script>
</head><body>
  ${content}
  <script src="/sticky-bar.min.js?sid=preview&app=https://preview.invalid"></script>
</body></html>`;
}

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
