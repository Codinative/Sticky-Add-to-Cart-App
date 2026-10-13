// Stored at billing/{storeHash}. Kept separate from stores/{storeHash} so it survives
// uninstall: the Stripe customer is reused on reinstall and the free trial isn't
// granted twice.
export interface BillingRecord {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string | null;
    subscriptionStatus?: string | null;   // Stripe subscription status
    trialEnd?: number | null;             // unix seconds
    currentPeriodEnd?: number | null;     // unix seconds
    cancelAtPeriodEnd?: boolean;         // a cancellation is scheduled (either Stripe field)
    cancelAt?: number | null;             // unix seconds the subscription will end, if scheduled
    trialUsed?: boolean;                  // true once the store has had any subscription
    pendingCheckoutSessionId?: string | null;
    updatedAt?: number;                   // ms
}

// What the dashboard receives from GET /api/billing/status
export interface BillingStatus {
    status: string;                       // Stripe status, or "none"
    isActive: boolean;                    // bar is allowed on the storefront
    trialAvailable: boolean;
    trialDays: number;
    trialEnd: number | null;
    currentPeriodEnd: number | null;
    cancelAtPeriodEnd: boolean;
    cancelAt: number | null;
    hasCustomer: boolean;
    price: { amount: number; currency: string; interval: string } | null;
}
