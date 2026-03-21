"use client";
import { useState } from "react";
import { X, Zap, Star, Crown, Check } from "lucide-react";
import { CREDIT_PLANS } from "@/lib/api";
import { useCredits } from "@/contexts/CreditsContext";

const ICONS = [Zap, Star, Crown];

export default function BuyCreditsModal() {
  const { buyModalOpen, closeBuyModal, purchase } = useCredits();
  const [selected, setSelected] = useState("pro");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!buyModalOpen) return null;

  async function handlePurchase() {
    setLoading(true);
    setError("");
    try {
      await purchase(selected);
      setSuccess("Credits added! Your balance has been updated.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Purchase failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setSuccess("");
    setError("");
    closeBuyModal();
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{ background: "var(--white)", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 520, boxShadow: "var(--shadow-lg)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div className="eyebrow">Credits</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--ink)", margin: 0 }}>
              Buy Credits
            </h2>
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>CV credits to create, export credits to download</p>
          </div>
          <button onClick={handleClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "var(--muted)", borderRadius: 6 }}>
            <X size={20} />
          </button>
        </div>

        {/* Plans */}
        <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
          {CREDIT_PLANS.map((plan, i) => {
            const Icon = ICONS[i];
            const isSelected = selected === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelected(plan.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "14px 16px",
                  border: isSelected ? "2px solid var(--gold)" : "2px solid var(--border)",
                  borderRadius: "var(--radius)", background: isSelected ? "rgba(201,169,110,.06)" : "var(--white)",
                  cursor: "pointer", textAlign: "left", transition: "all .15s", position: "relative",
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: isSelected ? "var(--gold)" : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" }}>
                  <Icon size={18} color={isSelected ? "var(--ink)" : "var(--muted)"} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{plan.name}</span>
                    {plan.popular && (
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, background: "var(--forest)", color: "#fff", padding: "2px 7px", borderRadius: 4, letterSpacing: ".05em" }}>POPULAR</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    {plan.cvCredits} CV credits · {plan.exportCredits} export credits
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 17, color: isSelected ? "var(--forest)" : "var(--ink)" }}>
                    {plan.currency === "GBP" ? "£" : "$"}{plan.price}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>one-time</div>
                </div>
                {isSelected && (
                  <div style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={11} strokeWidth={3} color="var(--ink)" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "0 28px 24px" }}>
          {success ? (
            <div style={{ padding: "12px 16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "var(--radius-sm)", color: "#166534", fontSize: 14, marginBottom: 12 }}>
              {success}
            </div>
          ) : error ? (
            <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--radius-sm)", color: "#991b1b", fontSize: 14, marginBottom: 12 }}>
              {error}
            </div>
          ) : null}

          {success ? (
            <button className="btn btn-forest" style={{ width: "100%", justifyContent: "center" }} onClick={handleClose}>
              Done
            </button>
          ) : (
            <button
              className="btn btn-gold"
              style={{ width: "100%", justifyContent: "center", opacity: loading ? .7 : 1 }}
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? "Processing…" : `Buy ${CREDIT_PLANS.find(p => p.id === selected)?.name} — £${CREDIT_PLANS.find(p => p.id === selected)?.price}`}
            </button>
          )}
          <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 10 }}>
            Secure payment · Credits never expire
          </p>
        </div>
      </div>
    </div>
  );
}
