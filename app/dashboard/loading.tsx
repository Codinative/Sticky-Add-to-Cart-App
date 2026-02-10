'use client';

import { useState, useEffect } from "react";

/**
 * StickyBarDashboardSkeleton
 * 
 * A loading skeleton that mirrors the exact layout of the v1 Sticky Add to Cart
 * dashboard. Drop this in as a loading state before the real dashboard mounts.
 * 
 * Usage:
 *   const [loading, setLoading] = useState(true);
 *   useEffect(() => { fetchConfig().then(() => setLoading(false)); }, []);
 *   if (loading) return <StickyBarDashboardSkeleton />;
 *   return <StickyBarDashboard />;
 */

/* ─── Shimmer Block ─── */
function Shimmer({ className = "", style = {}, rounded = "rounded-lg" }) {
  return (
    <div
      className={`relative overflow-hidden bg-gray-200/70 ${rounded} ${className}`}
      style={style}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "skeletonShimmer 1.8s ease-in-out infinite",
        }}
      />
    </div>
  );
}

/* ─── Skeleton Section Card ─── */
function SkeletonSectionCard({ rows = 3, defaultOpen = true }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <Shimmer className="w-8 h-8 shrink-0" rounded="rounded-lg" />
        <Shimmer className="h-4 w-32" />
        <div className="ml-auto">
          <Shimmer className="w-4 h-4" rounded="rounded" />
        </div>
      </div>
      {/* Body */}
      {defaultOpen && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-5">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonFieldRow key={i} type={i % 3 === 0 ? "color" : i % 3 === 1 ? "slider" : "select"} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Skeleton Field Rows ─── */
function SkeletonFieldRow({ type = "slider" }) {
  if (type === "color") {
    return (
      <div className="flex flex-col gap-1.5">
        <Shimmer className="h-[10px] w-20" rounded="rounded" />
        <div className="flex items-center gap-2.5 px-3 py-2 border border-gray-200 rounded-lg">
          <Shimmer className="w-6 h-6 shrink-0" rounded="rounded-md" />
          <Shimmer className="h-3.5 w-20" rounded="rounded" />
        </div>
      </div>
    );
  }
  if (type === "slider") {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <Shimmer className="h-[10px] w-24" rounded="rounded" />
          <Shimmer className="h-5 w-10" rounded="rounded" />
        </div>
        <div className="relative h-1.5">
          <Shimmer className="h-1.5 w-full" rounded="rounded-full" />
        </div>
      </div>
    );
  }
  /* select */
  return (
    <div className="flex flex-col gap-1.5">
      <Shimmer className="h-[10px] w-16" rounded="rounded" />
      <Shimmer className="h-[42px] w-full" rounded="rounded-lg" />
    </div>
  );
}

/* ─── Skeleton Preview ─── */
function SkeletonPreview() {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden flex-1 min-h-[520px]">
        {/* Fake browser bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          </div>
          <div className="flex-1 mx-4">
            <Shimmer className="h-6 w-full max-w-md mx-auto" rounded="rounded-md" />
          </div>
        </div>
        {/* Product page mockup */}
        <div className="p-6">
          <div className="flex gap-6">
            {/* Product Image */}
            <div className="w-1/2">
              <Shimmer className="w-full h-48" rounded="rounded-xl" />
              {/* Thumbnail row */}
              <div className="flex gap-2 mt-3">
                {[1,2,3,4].map(i => (
                  <Shimmer key={i} className="w-12 h-12" rounded="rounded-lg" />
                ))}
              </div>
            </div>
            {/* Product Info */}
            <div className="w-1/2 space-y-3">
              <Shimmer className="h-3 w-20" rounded="rounded" />
              <Shimmer className="h-5 w-full" rounded="rounded" />
              <Shimmer className="h-5 w-3/4" rounded="rounded" />
              <Shimmer className="h-7 w-24" rounded="rounded" />
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <Shimmer key={i} className="w-4 h-4" rounded="rounded-sm" />
                ))}
                <Shimmer className="h-3 w-14 ml-2" rounded="rounded" />
              </div>
              <div className="space-y-2 pt-1">
                <Shimmer className="h-3 w-full" rounded="rounded" />
                <Shimmer className="h-3 w-5/6" rounded="rounded" />
                <Shimmer className="h-3 w-4/6" rounded="rounded" />
              </div>
              {/* Variants */}
              <div className="flex gap-2 pt-2">
                {["S","M","L","XL"].map(s => (
                  <Shimmer key={s} className="w-10 h-8" rounded="rounded-md" />
                ))}
              </div>
              {/* ATC Button */}
              <Shimmer className="h-11 w-full mt-2" rounded="rounded-lg" />
            </div>
          </div>
        </div>
        {/* Sticky bar skeleton at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center gap-3">
            <Shimmer className="w-14 h-14 shrink-0" rounded="rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Shimmer className="h-4 w-40" rounded="rounded" />
              <Shimmer className="h-3 w-20" rounded="rounded" />
            </div>
            <div className="flex gap-1.5">
              {["S","M","L"].map(s => <Shimmer key={s} className="w-8 h-7" rounded="rounded-md" />)}
            </div>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <Shimmer className="w-8 h-8" rounded="rounded-none" />
              <Shimmer className="w-10 h-8" rounded="rounded-none" />
              <Shimmer className="w-8 h-8" rounded="rounded-none" />
            </div>
            <Shimmer className="h-10 w-32 shrink-0" rounded="rounded-lg" />
          </div>
        </div>
      </div>
      {/* Status line */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <Shimmer className="w-2 h-2" rounded="rounded-full" />
        <Shimmer className="h-3 w-48" rounded="rounded" />
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   MAIN SKELETON COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function StickyBarDashboardSkeleton() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        
        * { font-family: 'DM Sans', system-ui, -apple-system, sans-serif; }

        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @keyframes skeletonFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .skeleton-stagger > * {
          animation: skeletonFadeIn 0.4s ease-out both;
        }
        .skeleton-stagger > *:nth-child(1) { animation-delay: 0.05s; }
        .skeleton-stagger > *:nth-child(2) { animation-delay: 0.1s; }
        .skeleton-stagger > *:nth-child(3) { animation-delay: 0.15s; }
        .skeleton-stagger > *:nth-child(4) { animation-delay: 0.2s; }
        .skeleton-stagger > *:nth-child(5) { animation-delay: 0.25s; }
        .skeleton-stagger > *:nth-child(6) { animation-delay: 0.3s; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 10px; }
      `}</style>

      <div className="min-h-screen bg-[#F7F8FA]" style={{ animation: "skeletonFadeIn 0.3s ease-out" }}>

        {/* ─── Header ─── */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Shimmer className="w-9 h-9" rounded="rounded-xl" />
                <div className="flex flex-col gap-1">
                  <Shimmer className="h-4 w-36" rounded="rounded" />
                  <Shimmer className="h-3 w-52" rounded="rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shimmer className="h-7 w-20" rounded="rounded-full" />
                <Shimmer className="h-9 w-20" rounded="rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* ─── Main Content ─── */}
        <div className="max-w-[1440px] mx-auto px-6 py-6">
          <div className="flex gap-6" style={{ minHeight: "calc(100vh - 120px)" }}>

            {/* ─── Left: Config Panel Skeleton ─── */}
            <div className="w-[400px] shrink-0 flex flex-col gap-4">

              {/* Tab Navigation */}
              <div className="flex gap-1 p-1 bg-white rounded-xl border border-gray-200">
                {["Styling", "Layout", "Behavior"].map((label, i) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg flex-1 justify-center ${
                      i === 0 ? "bg-gray-100" : ""
                    }`}
                  >
                    <Shimmer className="w-4 h-4" rounded="rounded" />
                    <Shimmer className="h-3.5 w-14" rounded="rounded" />
                  </div>
                ))}
              </div>

              {/* Config Sections */}
              <div className="flex-1 overflow-y-auto pr-1 pb-20 space-y-4 skeleton-stagger" style={{ maxHeight: "calc(100vh - 200px)" }}>
                {/* Bar Appearance */}
                <SkeletonSectionCard rows={3} />

                {/* Typography & Colors */}
                <SkeletonSectionCard rows={3} />

                {/* Button Styling */}
                <SkeletonSectionCard rows={4} />
              </div>
            </div>

            {/* ─── Right: Live Preview Skeleton ─── */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">

              {/* Preview Toolbar */}
              <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Shimmer className="w-4 h-4" rounded="rounded" />
                  <Shimmer className="h-4 w-24" rounded="rounded" />
                </div>
                <div className="flex items-center gap-1 p-0.5 bg-gray-100 rounded-lg">
                  <Shimmer className="w-8 h-8" rounded="rounded-md" />
                  <Shimmer className="w-8 h-8" rounded="rounded-md" />
                </div>
              </div>

              {/* Preview Area */}
              <div
                className="flex-1 bg-white rounded-xl border border-gray-200 p-6 overflow-hidden"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)",
                  backgroundSize: "20px 20px",
                }}
              >
                <SkeletonPreview />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


/**
 * Optional: A wrapper that shows the skeleton for a given duration or until
 * a loading prop becomes false, then cross-fades to children.
 * 
 * Usage:
 *   <SkeletonLoader loading={isLoading}>
 *     <StickyBarDashboard />
 *   </SkeletonLoader>
 */
export function SkeletonLoader({ loading = true, minDuration = 800, children }: { loading: boolean, minDuration: number, children: React.ReactNode }) {
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setShowSkeleton(false), 400);
      }, minDuration);
      return () => clearTimeout(timer);
    }
  }, [loading, minDuration]);

  if (!showSkeleton) return <>{children}</>;

  return (
    <div className="relative">
      <div
        className="transition-opacity duration-400"
        style={{ opacity: fadeOut ? 0 : 1 }}
      >
        <StickyBarDashboardSkeleton />
      </div>
      {fadeOut && (
        <div
          className="absolute inset-0"
          style={{ animation: "skeletonFadeIn 0.4s ease-out both" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}