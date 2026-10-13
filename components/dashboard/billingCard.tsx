'use client'

import { useCallback, useEffect, useState } from "react";
import { BillingStatus } from "@/types/billing";

const DAY_MS = 24 * 60 * 60 * 1000;

function formatDate(unixSeconds: number | null) {
  if (!unixSeconds) return "";
  return new Date(unixSeconds * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function daysLeft(unixSeconds: number | null) {
  if (!unixSeconds) return 0;
  return Math.max(0, Math.ceil((unixSeconds * 1000 - Date.now()) / DAY_MS));
}

/**
 * Plan / subscription card. Stripe Checkout and the Customer Portal open in a new
 * tab (they refuse to load inside the BigCommerce admin iframe); status refreshes
 * when the merchant comes back to this tab.
 */
export function BillingCard({ context }: { context: string }) {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/billing/status?context=${encodeURIComponent(context)}`);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setBilling(data.data);
    } catch (e: any) {
      console.error("Error loading billing status:", e.message);
    }
  }, [context]);

  useEffect(() => {
    loadStatus();
    const onVisible = () => { if (document.visibilityState === "visible") loadStatus(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", loadStatus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", loadStatus);
    };
  }, [loadStatus]);

  // Open the tab synchronously on click (async window.open gets popup-blocked),
  // then point it at the Stripe URL once the server returns it.
  const openStripe = async (endpoint: "checkout" | "portal") => {
    setError("");
    const tab = window.open("", "_blank");
    if (tab) tab.opener = null; // the Stripe page must not reach back into the dashboard
    setBusy(true);
    try {
      const res = await fetch(`/api/billing/${endpoint}?context=${encodeURIComponent(context)}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.message || "Something went wrong");
      if (tab) tab.location.href = data.url;
      else window.open(data.url, "_blank", "noopener");
    } catch (e: any) {
      tab?.close();
      setError(e.message);
      loadStatus();
    } finally {
      setBusy(false);
    }
  };

  if (!billing) return null;

  const price = billing.price ? `$${billing.price.amount}/${billing.price.interval}` : "";
  const { status } = billing;

  let tone = "bg-amber-50 border-amber-200 text-amber-800";
  let title = "";
  let detail = "";
  let action: { label: string; endpoint: "checkout" | "portal" };

  if (status === "trialing") {
    tone = "bg-emerald-50 border-emerald-200 text-emerald-800";
    title = `Free trial · ${daysLeft(billing.trialEnd)} days left`;
    detail = billing.cancelAtPeriodEnd
      ? `Cancelled — the bar stops on ${formatDate(billing.cancelAt ?? billing.trialEnd)}.`
      : `Then ${price}, starting ${formatDate(billing.trialEnd)}.`;
    action = { label: "Manage billing", endpoint: "portal" };
  } else if (status === "active") {
    tone = "bg-emerald-50 border-emerald-200 text-emerald-800";
    title = `Active · ${price}`;
    detail = billing.cancelAtPeriodEnd
      ? `Cancelled — the bar stops on ${formatDate(billing.cancelAt ?? billing.currentPeriodEnd)}.`
      : `Renews on ${formatDate(billing.currentPeriodEnd)}.`;
    action = { label: "Manage billing", endpoint: "portal" };
  } else if (status === "past_due") {
    title = "Payment failed";
    detail = "Update your card to keep the bar live on your store.";
    action = { label: "Update card", endpoint: "portal" };
  } else if (status === "incomplete" || status === "unpaid") {
    title = "Payment required";
    detail = "The bar is hidden on your store until payment is completed.";
    action = { label: "Manage billing", endpoint: "portal" };
  } else {
    // none / canceled / incomplete_expired / paused
    title = "No active plan";
    detail = "The bar is hidden on your store until you subscribe.";
    action = {
      label: billing.trialAvailable ? `Start ${billing.trialDays}-day free trial` : `Subscribe · ${price}`,
      endpoint: "checkout",
    };
  }

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border px-4 py-3 ${tone}`}>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs opacity-80">{detail}</p>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
      <button
        onClick={() => openStripe(action.endpoint)}
        disabled={busy}
        className="shrink-0 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors"
      >
        {busy ? "Opening…" : action.label}
      </button>
    </div>
  );
}
