"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getCredits, purchaseCredits, trackExport, CREDIT_PLANS, UserCredits } from "@/lib/api";
import { token } from "@/lib/api";

// ── localStorage helpers ──────────────────────────────────────────────────────
const CREDITS_KEY = "FitRezume_credits";
const DEFAULT_CREDITS: UserCredits = { cvCredits: 3, exportCredits: 5 };

function readLocal(): UserCredits | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CREDITS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserCredits;
  } catch { return null; }
}

function writeLocal(c: UserCredits) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CREDITS_KEY, JSON.stringify(c));
  }
}

// ── Context types ─────────────────────────────────────────────────────────────
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

  // ── Persist helper ──────────────────────────────────────────────────────────
  const update = useCallback((c: UserCredits) => {
    setCredits(c);
    writeLocal(c);
  }, []);

  // ── Load credits: localStorage first, then API ──────────────────────────────
  const refresh = useCallback(async () => {
    // Step 1: Load from localStorage immediately (fast, no flicker)
    const local = readLocal();
    if (local) {
      setCredits(local);
    } else if (token.get()) {
      // New user — initialize with free starter credits
      update(DEFAULT_CREDITS);
    }

    // Step 2: Try API in background — only adopt if API returns non-zero credits
    // (backend may return 0 for new users or may not implement credits at all)
    if (!token.get()) return;
    setLoading(true);
    try {
      const api = await getCredits();
      // Trust API if it returned meaningful data
      if (api.cvCredits > 0 || api.exportCredits > 0) {
        update(api);
      }
      // If API returns {0,0} but local has credits → backend doesn't track, keep local
      setError("");
    } catch {
      // API unavailable → local credits are the source of truth
    } finally {
      setLoading(false);
    }
  }, [update]);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Credit operations ───────────────────────────────────────────────────────
  const deductCvCredit = () =>
    setCredits(prev => {
      if (!prev) return prev;
      const next = { ...prev, cvCredits: Math.max(0, prev.cvCredits - 1) };
      writeLocal(next);
      return next;
    });

  const deductExportCredit = () =>
    setCredits(prev => {
      if (!prev) return prev;
      const next = { ...prev, exportCredits: Math.max(0, prev.exportCredits - 1) };
      writeLocal(next);
      return next;
    });

  // ── Purchase: try API, fall back to local credit addition ──────────────────
  const purchase = async (planId: string) => {
    const plan = CREDIT_PLANS.find(p => p.id === planId);
    if (!plan) throw new Error("Invalid plan");

    try {
      const result = await purchaseCredits(planId);
      update({ cvCredits: result.cvCredits, exportCredits: result.exportCredits });
    } catch {
      // API unavailable (no payment backend yet) — add credits locally so the
      // demo works end-to-end. In production, replace with real payment flow.
      setCredits(prev => {
        const base = prev ?? DEFAULT_CREDITS;
        const next = {
          cvCredits: base.cvCredits + plan.cvCredits,
          exportCredits: base.exportCredits + plan.exportCredits,
        };
        writeLocal(next);
        return next;
      });
    }
  };

  // ── Track export: try API, already deducted locally ─────────────────────────
  const doTrackExport = async (resumeId?: string | number) => {
    try {
      const result = await trackExport(resumeId);
      // Only adopt server result if it makes sense (non-negative)
      if (result.exportCredits >= 0) {
        update({ cvCredits: result.cvCredits, exportCredits: result.exportCredits });
      }
    } catch {
      // Already deducted locally — nothing to do
    }
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
