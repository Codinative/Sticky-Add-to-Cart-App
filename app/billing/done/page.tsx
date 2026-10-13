'use client'

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Landing page after Stripe Checkout / Customer Portal (opened in a separate tab).
// Purely informational — subscription state is set by the Stripe webhook, not here.
const MESSAGES: Record<string, { title: string; body: string }> = {
  success: {
    title: "You're all set",
    body: "Your subscription is being activated. Close this tab and return to the app in your BigCommerce admin.",
  },
  cancelled: {
    title: "Checkout cancelled",
    body: "No payment was taken. Close this tab and return to the app whenever you're ready.",
  },
  portal: {
    title: "Billing updated",
    body: "Close this tab and return to the app in your BigCommerce admin.",
  },
};

function BillingDoneContent() {
  const result = useSearchParams().get("result") || "portal";
  const message = MESSAGES[result] || MESSAGES.portal;

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl border border-gray-200 p-8 text-center">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">{message.title}</h1>
        <p className="text-sm text-slate-600 mb-6">{message.body}</p>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Close this tab
        </button>
      </div>
    </div>
  );
}

export default function BillingDonePage() {
  return (
    <Suspense fallback={null}>
      <BillingDoneContent />
    </Suspense>
  );
}
