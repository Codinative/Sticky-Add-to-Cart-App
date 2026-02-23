"use client";

import { createContext, useContext, ReactNode, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface SessionContextValue {
  context: string;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const SessionProviderInner = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const context = searchParams.get("context") || "";

  return (
    <SessionContext.Provider value={{ context }}>
      {children}
    </SessionContext.Provider>
  );
};

const SessionProvider = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={<div></div>}>
      <SessionProviderInner>{children}</SessionProviderInner>
    </Suspense>
  );
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
};

export default SessionProvider;