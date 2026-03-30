"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { getCredits, purchaseCredits, trackExport, trackToolUse, CREDIT_PLANS, UserCredits } from "@/lib/api";
import { token } from "@/lib/api";

// ── localStorage helpers ──────────────────────────────────────────────────────
const CREDITS_KEY = "FitRezume_credits";
const DEFAULT_CREDITS: UserCredits = { cvCredits: 1, exportCredits: 2, toolCredits: 0 };

function readLocal(): UserCredits | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CREDITS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UserCredits>;
    // Back-fill toolCredits for existing sessions that pre-date this field
    return {
      cvCredits: parsed.cvCredits ?? 1,
      exportCredits: parsed.exportCredits ?? 2,
      toolCredits: parsed.toolCredits ?? 0,
    };
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
  deductToolCredit: () => void;
  doTrackToolUse: (tool: "roast" | "interview" | "job-match") => Promise<void>;
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
    const local = readLocal();
    if (local) {
      setCredits(local);
    } else if (token.get()) {
      update(DEFAULT_CREDITS);
    }

    if (!token.get()) return;
    setLoading(true);
    try {
      const api = await getCredits();
      update({
        cvCredits: api.cvCredits,
        exportCredits: api.exportCredits,
        toolCredits: api.toolCredits ?? 0,
      });
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

  const deductToolCredit = () =>
    setCredits(prev => {
      if (!prev) return prev;
      const next = { ...prev, toolCredits: Math.max(0, prev.toolCredits - 1) };
      writeLocal(next);
      return next;
    });

  // ── Purchase ────────────────────────────────────────────────────────────────
  const purchase = async (planId: string) => {
    const plan = CREDIT_PLANS.find(p => p.id === planId);
    if (!plan) throw new Error("Invalid plan");

    try {
      const result = await purchaseCredits(planId);
      update({
        cvCredits: result.cvCredits,
        exportCredits: result.exportCredits,
        toolCredits: result.toolCredits ?? (credits?.toolCredits ?? 0) + plan.toolCredits,
      });
    } catch {
      setCredits(prev => {
        const base = prev ?? DEFAULT_CREDITS;
        const next: UserCredits = {
          cvCredits: base.cvCredits + plan.cvCredits,
          exportCredits: base.exportCredits + plan.exportCredits,
          toolCredits: base.toolCredits + plan.toolCredits,
        };
        writeLocal(next);
        return next;
      });
    }
  };

  // ── Track export ─────────────────────────────────────────────────────────────
  const doTrackExport = async (resumeId?: string | number) => {
    try {
      const result = await trackExport(resumeId);
      if (result.exportCredits >= 0) {
        update({
          cvCredits: result.cvCredits,
          exportCredits: result.exportCredits,
          toolCredits: result.toolCredits ?? credits?.toolCredits ?? 0,
        });
      }
    } catch {
      // Already deducted locally
    }
  };

  // ── Track tool use ───────────────────────────────────────────────────────────
  const doTrackToolUse = async (tool: "roast" | "interview" | "job-match") => {
    try {
      const result = await trackToolUse(tool);
      if (result.toolCredits >= 0) {
        update({
          cvCredits: result.cvCredits,
          exportCredits: result.exportCredits,
          toolCredits: result.toolCredits,
        });
      }
    } catch {
      // Already deducted locally
    }
  };

  return (
    <CreditsContext.Provider value={{
      credits, loading, error, refresh,
      deductCvCredit, deductExportCredit, deductToolCredit,
      doTrackToolUse,
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
