"use client";
import { useState } from "react";
import { X, Zap, Star, Crown, Check } from "lucide-react";
import { CREDIT_PLANS, createRazorpayOrder, verifyRazorpayPayment, reportPaymentFailed } from "@/lib/api";
import { useCredits } from "@/contexts/CreditsContext";

const ICONS = [Zap, Star, Crown];

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BuyCreditsModal() {
  const { buyModalOpen, closeBuyModal, refresh } = useCredits();
  const [selected, setSelected] = useState("pro");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!buyModalOpen) return null;

  async function handlePurchase() {
    setLoading(true);
    setError("");

    try {
      // 1. Load Razorpay SDK
      const ok = await loadRazorpayScript();
      if (!ok) {
        setError("Could not load payment gateway. Check your connection and try again.");
        setLoading(false);
        return;
      }

      // 2. Create order on backend
      const order = await createRazorpayOrder(selected);
      const plan = CREDIT_PLANS.find(p => p.id === selected)!;

      // 3. Open Razorpay checkout
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
          key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount:      order.amount,
          currency:    order.currency,
          name:        "FitRezume",
          description: `${plan.name} — ${plan.cvCredits} CV · ${plan.exportCredits} Exports · ${plan.toolCredits} Tool credits`,
          order_id:    order.orderId,
          theme:       { color: "#2563EB" },
          prefill: {
            name:  "",
            email: "",
          },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            // 4. Verify on backend and add credits
            try {
              await verifyRazorpayPayment({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                plan:                selected,
              });
              await refresh();
              setSuccess(`Payment successful! ${plan.cvCredits} CV, ${plan.exportCredits} Export, and ${plan.toolCredits} Tool credits have been added.`);
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          modal: {
            ondismiss: () => {
              // User closed the popup without paying
              reportPaymentFailed(order.orderId).catch(() => null);
              reject(new Error("cancelled"));
            },
          },
        });
        rzp.on("payment.failed", (response: { error: { description: string } }) => {
          reportPaymentFailed(order.orderId).catch(() => null);
          reject(new Error(response.error.description || "Payment failed"));
        });
        rzp.open();
      });
    } catch (e) {
      if (e instanceof Error && e.message !== "cancelled") {
        setError(e.message || "Payment failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
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
            <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
              CV credits to build · Export credits to download · Tool credits for AI tools
            </p>
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
                  borderRadius: "var(--radius)", background: isSelected ? "rgba(37,99,235,.06)" : "var(--white)",
                  cursor: "pointer", textAlign: "left", transition: "all .15s", position: "relative",
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: isSelected ? "var(--gold)" : "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background .15s" }}>
                  <Icon size={18} color={isSelected ? "#fff" : "var(--muted)"} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{plan.name}</span>
                    {plan.popular && (
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 600, background: "var(--forest)", color: "#fff", padding: "2px 7px", borderRadius: 4, letterSpacing: ".05em" }}>POPULAR</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 5, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", background: "rgba(15,23,42,.06)", color: "var(--ink)", padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>
                      {plan.cvCredits} CV
                    </span>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", background: "rgba(15,23,42,.06)", color: "var(--ink)", padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>
                      {plan.exportCredits} Exports
                    </span>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", background: "rgba(37,99,235,.1)", color: "var(--accent)", padding: "2px 7px", borderRadius: 4, fontWeight: 600 }}>
                      {plan.toolCredits} Tool credits
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: isSelected ? "var(--accent)" : "var(--ink)" }}>
                    ₹{plan.price}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>one-time</div>
                </div>
                {isSelected && (
                  <div style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={11} strokeWidth={3} color="#fff" />
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
              style={{ width: "100%", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading
                ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }} /> Processing…</>
                : `Pay ₹${CREDIT_PLANS.find(p => p.id === selected)?.price} — ${CREDIT_PLANS.find(p => p.id === selected)?.name}`}
            </button>
          )}
          <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 10 }}>
            Secured by Razorpay · UPI / Card / Net Banking · Credits added instantly
          </p>
        </div>
      </div>
    </div>
  );
}
