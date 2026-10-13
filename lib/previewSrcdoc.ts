// ─── Storefront preview document ────────────────────────────────
// Builds the srcdoc for an iframe that runs the real public/sticky-bar.min.js
// against a mock product page. Shared by the dashboard live preview and /preview,
// so what merchants see is exactly what the storefront script renders.

// Mock product data injected into the iframe
export const MOCK_PRODUCT = {
  isProductPage: true,
  product: {
    entityId: 1,
    name: "Premium Wireless Headphones",
    image: { url: "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2056%2056%22%3E%3Crect%20width%3D%2256%22%20height%3D%2256%22%20fill%3D%22%23F3F4F6%22%20rx%3D%228%22%2F%3E%3Crect%20x%3D%2212%22%20y%3D%2212%22%20width%3D%2232%22%20height%3D%2232%22%20rx%3D%222%22%20fill%3D%22none%22%20stroke%3D%22%23D1D5DB%22%20stroke-width%3D%221.5%22%2F%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2221%22%20r%3D%222%22%20fill%3D%22%23D1D5DB%22%2F%3E%3Cpath%20d%3D%22m12%2036%208-8%205%205%203-3%2010%2010%22%20fill%3D%22none%22%20stroke%3D%22%23D1D5DB%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E", alt: "Product image" },
    prices: { price: 299.99, basePrice: 399.99, salePrice: 299.99 },
    variantLabels: { "Size": ["S", "M", "L", "XL"], "Color": ["Red", "Blue", "Green"], "Gift Wrap": ["No", "Yes"] },
    variants: [
      { variantKey: "Size:S,Color:Red,", price: 299.99, optionsIds: { "Size": 101, "Color": 201 } },
      { variantKey: "Size:M,Color:Blue,", price: 299.99, optionsIds: { "Size": 102, "Color": 202 } },
      { variantKey: "Size:L,Color:Green,", price: 319.99, optionsIds: { "Size": 103, "Color": 203 } },
    ],
    options: [
      { id: 100, name: "Size", isVariantOption: true },
      { id: 200, name: "Color", isVariantOption: true },
      // Modifier (customization) — shown in the variants row, not part of the variant
      {
        id: 300, name: "Gift Wrap", isVariantOption: false, isRequired: false,
        values: [{ id: 301, label: "No", isDefault: true }, { id: 302, label: "Yes", isDefault: false }],
      },
    ],
  },
};

export function buildSrcdoc(
  nestedConfig: object,
  isMobile: boolean,
  position: string,
  { livePreview = false }: { livePreview?: boolean } = {},
): string {
  // Escape "<" so merchant text such as "</script>" can't break out of the inline script
  const configJSON = JSON.stringify(nestedConfig).replace(/</g, "\\u003c");
  const productJSON = JSON.stringify(MOCK_PRODUCT).replace(/</g, "\\u003c");
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
    ${livePreview ? "window.__SATC_PREVIEW__ = true; // re-render on postMessage, skip triggers" : ""}
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
