"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DefaultStickyBarConfig } from "@/types/config";
import { flattenToNestedConfig } from "@/lib/configConverter";
import { buildSrcdoc } from "@/lib/previewSrcdoc";

// Viewport widths the storefront script is rendered at. The iframe is laid out at
// this real width (so the script's breakpoints behave exactly as on a store) and
// then scaled down to fit the preview panel.
const VIEWPORT_WIDTH = { desktop: 1280, mobile: 390 } as const;
// The mobile frame is also scaled to show at least this much phone height, so a
// short panel (laptop at 100–125% zoom) shrinks the whole phone instead of
// cropping it to a stubby window.
const MOBILE_MIN_HEIGHT = 700;

/**
 * Live preview that runs the real storefront script (public/sticky-bar.min.js)
 * in an iframe against a mock product page. Settings changes are posted into the
 * iframe and re-rendered in place, so the preview always matches the storefront.
 */
export function LivePreview({ config, previewDevice }: { config: DefaultStickyBarConfig, previewDevice: "mobile" | "desktop" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const [box, setBox] = useState({ width: 0, height: 0 });

  // Track the panel size so the scaled iframe always fits it
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setBox({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const position = config.position;
  const isMobile = previewDevice === "mobile";

  // Rebuild the document only when the device (or bar position, which changes the
  // mock page's bottom spacing) changes — every other setting is posted live.
  const srcdoc = useMemo(
    () => buildSrcdoc(flattenToNestedConfig(configRef.current), isMobile, position, { livePreview: true }),
    [isMobile, position]
  );

  // Send the current settings into the iframe; the script re-renders the bar in place
  const postConfig = () => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    // srcdoc iframes share this page's origin
    win.postMessage({ type: "satc:config", config: flattenToNestedConfig(configRef.current) }, window.location.origin);
  };

  useEffect(() => {
    postConfig();
  }, [config]);

  const viewportWidth = VIEWPORT_WIDTH[previewDevice];
  const scale = box.width > 0
    ? Math.min(1, box.width / viewportWidth, isMobile && box.height > 0 ? box.height / MOBILE_MIN_HEIGHT : 1)
    : 1;
  const frameHeight = box.height > 0 ? box.height / scale : 0;

  return (
    // Fills the panel on wide screens (lg); stacked below it, the panel has no height of its own
    <div ref={containerRef} className="w-full h-[560px] lg:h-full lg:min-h-0 flex justify-center">
      {box.width > 0 && (
        <div
          className={`relative overflow-hidden bg-white border border-gray-200 ${isMobile ? "rounded-[28px]" : "rounded-lg sm:rounded-xl"}`}
          style={{
            width: viewportWidth * scale,
            height: box.height,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <iframe
            ref={iframeRef}
            title="Sticky bar live preview"
            srcDoc={srcdoc}
            onLoad={postConfig}
            style={{
              width: viewportWidth,
              height: frameHeight,
              border: "none",
              display: "block",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
        </div>
      )}
    </div>
  );
}
