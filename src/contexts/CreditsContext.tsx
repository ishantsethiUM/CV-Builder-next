"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getCredits, purchaseCredits, trackExport, UserCredits } from "@/lib/api";
import { token } from "@/lib/api";

interface CreditsContextType {
  credits: UserCredits | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  deductCvCredit: () => void;
  deductExportCredit: () => void;
  purchase: (planId: string) => Promise<void>;
  doTrackExport: (resumeId?: string | number) => Promise<void>;
  buyModalOpen: boolean;
  openBuyModal: () => void;
  closeBuyModal: () => void;
}

const CreditsContext = createContext<CreditsContextType | null>(null);

export function CreditsProvider({ children }: { children: ReactNode }) {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buyModalOpen, setBuyModalOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!token.get()) return;
    setLoading(true);
    try {
      setCredits(await getCredits());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load credits");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const deductCvCredit = () =>
    setCredits(c => c ? { ...c, cvCredits: Math.max(0, c.cvCredits - 1) } : c);

  const deductExportCredit = () =>
    setCredits(c => c ? { ...c, exportCredits: Math.max(0, c.exportCredits - 1) } : c);

  const purchase = async (planId: string) => {
    const result = await purchaseCredits(planId);
    setCredits({ cvCredits: result.cvCredits, exportCredits: result.exportCredits });
  };

  const doTrackExport = async (resumeId?: string | number) => {
    const result = await trackExport(resumeId);
    setCredits({ cvCredits: result.cvCredits, exportCredits: result.exportCredits });
  };

  return (
    <CreditsContext.Provider value={{
      credits, loading, error, refresh,
      deductCvCredit, deductExportCredit,
      purchase, doTrackExport,
      buyModalOpen,
      openBuyModal: () => setBuyModalOpen(true),
      closeBuyModal: () => setBuyModalOpen(false),
    }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error("useCredits must be used within CreditsProvider");
  return ctx;
}
