"use client";

import { createContext, useContext, ReactNode } from "react";
import { useSearchParams } from "next/navigation";

interface SessionContextValue {
  context: string;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

const SessionProvider = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const context = searchParams.get("context") || "";

  return (
    <SessionContext.Provider value={{ context }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
};

export default SessionProvider;