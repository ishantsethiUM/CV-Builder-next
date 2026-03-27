"use client";
import Link from "next/link";
import { useState, useRef, useCallback } from "react";
import { roastCV, type RoastResult } from "@/lib/api";
import { Flame, ChevronLeft, RotateCcw, Sparkles, Copy, Check, AlertCircle, FileText, Upload, X, Lock, CreditCard } from "lucide-react";
import { useCredits } from "@/contexts/CreditsContext";

const LEVELS = [
  { id: "mild",   label: "Mild 🌶️",  desc: "Polite but honest — some gentle critique" },
  { id: "medium", label: "Medium 🔥", desc: "Balanced — sharp feedback with humour" },
  { id: "savage", label: "Savage 💀", desc: "Absolutely no mercy — the full roast" },
];

const F = "var(--font-display)";
const B = "var(--font-body)";
const M = "var(--font-mono)";
const ACCEPT = ".pdf,.txt";

async function extractText(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/resumes/tools/parse-resume`, { method: "POST", body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to read file.");
  return json.text as string;
}

export default function RoastPage() {
  const { credits, openBuyModal, deductToolCredit, doTrackToolUse } = useCredits();
  const [level, setLevel] = useState("medium");
  const [file, setFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => { setFile(f); setError(""); }, []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  }, [handleFile]);

  const roast = async () => {
    if (!file) { setError("Please upload your CV first."); return; }
    setExtracting(true); setError("");
    let text: string;
    try { text = await extractText(file); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Could not read the file."); setExtracting(false); return; }
    if (!text.trim()) { setError("Could not extract any text. Try a different format."); setExtracting(false); return; }
    setExtracting(false); setLoading(true); setResult(null);
    try {
      const res = await roastCV(text, level);
      setResult(res);
      deductToolCredit();
      doTrackToolUse("roast");
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Roast request failed."); }
    finally { setLoading(false); }
  };

  const sc = result ? (result.score >= 60 ? "#2d7a4f" : result.score >= 40 ? "var(--gold)" : "#c84c2e") : "var(--muted)";
  const busy = extracting || loading;
  const noCredits = credits !== null && credits.toolCredits === 0;

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <nav style={{ background: "var(--white)", borderBottom: "1px solid var(--border)", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 40, boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard" className="btn btn-ghost btn-sm"><ChevronLeft size={12} />Dashboard</Link>
          <div style={{ width: 1, height: 18, background: "var(--border)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "#c84c2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flame size={14} color="#fff" />
            </div>
            <span style={{ fontFamily: F, fontSize: 18, fontWeight: 700, color: "var(--forest)" }}>Resume Roast</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {credits !== null && (
            <span style={{ fontFamily: M, fontSize: 11, color: credits.toolCredits <= 1 ? "#c84c2e" : "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 10px" }}>
              {credits.toolCredits} tool credit{credits.toolCredits !== 1 ? "s" : ""} left
            </span>
          )}
          <Link href="/builder" className="btn btn-forest btn-sm"><FileText size={12} />Build Better CV</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 740, margin: "0 auto", padding: "52px 36px 80px" }}>

        {/* ── CREDIT GATE ── */}
        {noCredits ? (
          <div style={{ textAlign: "center", padding: "72px 24px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(201,76,46,.08)", border: "1.5px solid rgba(201,76,46,.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Lock size={26} color="#c84c2e" />
            </div>
            <h2 style={{ fontFamily: F, fontSize: 26, fontWeight: 700, color: "var(--forest)", marginBottom: 10 }}>Tool Credits Required</h2>
            <p style={{ fontFamily: B, fontSize: 15, color: "var(--muted)", maxWidth: 380, margin: "0 auto 8px", lineHeight: 1.7 }}>
              You need <strong>1 tool credit</strong> to run Resume Roast. Buy a credit pack to continue.
            </p>
            <p style={{ fontFamily: M, fontSize: 11, color: "var(--muted)", marginBottom: 28 }}>Each pack gives you credits for Roast, Interview Sim &amp; Job Match.</p>
            <button onClick={openBuyModal} className="btn btn-forest" style={{ margin: "0 auto" }}>
              <CreditCard size={14} /> Buy Credits
            </button>
          </div>
        ) : !result ? (
          <>
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🔥</div>
              <h1 style={{ fontFamily: F, fontSize: "clamp(2rem,4vw,3.6rem)", fontWeight: 800, color: "var(--forest)", marginBottom: 10 }}>Resume Roast Mode</h1>
              <p style={{ fontFamily: B, fontSize: 16, color: "var(--muted)", maxWidth: 460, margin: "0 auto" }}>
                Brutally honest AI feedback — sharp, funny, and actually useful. Your CV won't know what hit it.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <p className="label" style={{ marginBottom: 12 }}>Roast Intensity</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {LEVELS.map(l => (
                    <button key={l.id} onClick={() => setLevel(l.id)}
                      style={{ padding: "15px 14px", borderRadius: 8, textAlign: "left", border: `1.5px solid ${level === l.id ? "#c84c2e" : "var(--border)"}`, background: level === l.id ? "rgba(201,76,46,.05)" : "var(--white)", cursor: "pointer", transition: "all .14s" }}>
                      <p style={{ fontFamily: F, fontSize: 17, fontWeight: 700, color: "var(--forest)", marginBottom: 4 }}>{l.label}</p>
                      <p style={{ fontFamily: B, fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5 }}>{l.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="label" style={{ marginBottom: 12 }}>Upload Your CV</p>
                <input ref={inputRef} type="file" accept={ACCEPT} style={{ display: "none" }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
                {file ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 20px", borderRadius: 10, border: "1.5px solid #c84c2e", background: "rgba(201,76,46,.04)" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 8, background: "rgba(201,76,46,.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FileText size={20} color="#c84c2e" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: B, fontSize: 14, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                      <p style={{ fontFamily: M, fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button onClick={() => { setFile(null); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div onClick={() => inputRef.current?.click()} onDrop={onDrop}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                    style={{ padding: "40px 24px", borderRadius: 10, border: `2px dashed ${dragOver ? "#c84c2e" : "var(--border)"}`, background: dragOver ? "rgba(201,76,46,.04)" : "var(--white)", cursor: "pointer", textAlign: "center", transition: "all .14s" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                      <Upload size={20} color="var(--muted)" />
                    </div>
                    <p style={{ fontFamily: B, fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
                      Drop your CV here or <span style={{ color: "#c84c2e", textDecoration: "underline" }}>browse</span>
                    </p>
                    <p style={{ fontFamily: M, fontSize: 11, color: "var(--muted)" }}>Supports PDF and plain text (.txt)</p>
                  </div>
                )}
                <p style={{ fontFamily: M, fontSize: 9.5, color: "var(--muted)", marginTop: 8 }}>🔒 Your CV is processed securely and never stored.</p>
              </div>

              {error && (
                <div style={{ display: "flex", gap: 9, padding: "12px 15px", background: "rgba(201,76,46,.07)", border: "1px solid rgba(201,76,46,.22)", borderRadius: 6 }}>
                  <AlertCircle size={15} color="#c84c2e" style={{ flexShrink: 0 }} />
                  <p style={{ fontFamily: B, fontSize: 13.5, color: "#c84c2e" }}>{error}</p>
                </div>
              )}

              <button onClick={roast} disabled={busy || !file}
                style={{ width: "100%", padding: "14px", borderRadius: 8, background: busy || !file ? "rgba(201,76,46,.45)" : "#c84c2e", color: "#fff", fontFamily: B, fontWeight: 700, fontSize: 15, border: "none", cursor: busy || !file ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all .18s" }}>
                {extracting
                  ? <><div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }} className="spin" />Reading your CV…</>
                  : loading
                  ? <><div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%" }} className="spin" />Roasting your CV…</>
                  : <><Flame size={18} />Roast My CV — 1 credit</>}
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="anim-in">
            <div style={{ background: "var(--white)", border: `2px solid ${sc}`, borderRadius: 10, padding: "28px", textAlign: "center", boxShadow: "var(--shadow)" }}>
              <p style={{ fontFamily: F, fontSize: 80, fontWeight: 800, lineHeight: 1, color: sc }}>{result.score}</p>
              <p style={{ fontFamily: M, fontSize: 10, color: "var(--muted)", marginBottom: 12 }}>/ 100 overall score</p>
              <p style={{ fontFamily: F, fontSize: 20, fontStyle: "italic", color: "var(--forest)", marginBottom: 16 }}>"{result.verdict}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--surface)", borderRadius: 6, border: "1px solid var(--border)" }}>
                <p style={{ flex: 1, fontFamily: B, fontSize: 13, color: "var(--muted)", textAlign: "left" }}>{result.shareQuote}</p>
                <button onClick={() => { navigator.clipboard.writeText(result.shareQuote + `\n\nGet roasted at ${window.location.origin} 🔥`); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#2d7a4f" : "var(--muted)" }}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <div className="card-flat" style={{ padding: "18px 20px" }}>
              <p style={{ fontFamily: M, fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--muted)", marginBottom: 14 }}>Score Breakdown</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                <div style={{ flex: result.score, height: 8, background: sc, borderRadius: 4 }} />
                <div style={{ flex: 100 - result.score, height: 8, background: "var(--border)", borderRadius: 4 }} />
              </div>
              <p style={{ fontFamily: B, fontSize: 12.5, color: "var(--muted)" }}>
                {result.score >= 60 ? "Solid foundation — a few tweaks will make it shine." : result.score >= 40 ? "Needs meaningful work before it impresses recruiters." : "Major overhaul needed. But that's what we're here for!"}
              </p>
            </div>
            <h3 style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: "var(--forest)" }}>The Roasts 🔥</h3>
            {result.roasts.map((r, i) => (
              <div key={i} style={{ borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden", cursor: "pointer", boxShadow: "var(--shadow-sm)" }} onClick={() => setOpen(open === i ? null : i)}>
                <div style={{ padding: "14px 16px", background: "var(--white)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span className="tag" style={{ background: "rgba(201,76,46,.1)", color: "#c84c2e" }}>{r.section}</span>
                    <span style={{ fontFamily: M, fontSize: 9.5, color: "var(--muted)" }}>{open === i ? "▲ hide fix" : "▼ see fix"}</span>
                  </div>
                  <p style={{ fontFamily: B, fontSize: 14.5, color: "var(--ink)", lineHeight: 1.6 }}>😬 {r.roast}</p>
                </div>
                {open === i && (
                  <div style={{ padding: "14px 16px", background: "rgba(45,122,79,.04)", borderTop: "1px solid rgba(45,122,79,.14)" }}>
                    <p style={{ fontFamily: M, fontSize: 9.5, color: "#2d7a4f", marginBottom: 5 }}>✅ THE FIX:</p>
                    <p style={{ fontFamily: B, fontSize: 14, color: "var(--ink)", lineHeight: 1.7 }}>{r.fix}</p>
                  </div>
                )}
              </div>
            ))}
            {result.good.length > 0 && (
              <div style={{ background: "rgba(45,122,79,.05)", border: "1px solid rgba(45,122,79,.2)", borderRadius: 8, padding: "16px 18px" }}>
                <h4 style={{ fontFamily: F, fontSize: 18, fontWeight: 700, color: "var(--forest)", marginBottom: 10 }}>🌟 What's Working</h4>
                {result.good.map((g, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <Check size={13} color="#2d7a4f" style={{ flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontFamily: B, fontSize: 14, color: "var(--muted)" }}>{g}</p>
                  </div>
                ))}
              </div>
            )}
            <div style={{ background: "rgba(201,169,110,.07)", border: "1px solid rgba(201,169,110,.22)", borderRadius: 8, padding: "16px 18px" }}>
              <h4 style={{ fontFamily: F, fontSize: 18, fontWeight: 700, color: "var(--forest)", marginBottom: 8, display: "flex", alignItems: "center", gap: 7 }}>
                <Sparkles size={15} color="var(--gold)" />Real Advice
              </h4>
              <p style={{ fontFamily: B, fontSize: 14.5, color: "var(--muted)", lineHeight: 1.75 }}>{result.advice}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button onClick={() => { setResult(null); setError(""); setFile(null); }} className="btn btn-outline" style={{ justifyContent: "center" }}>
                <RotateCcw size={13} />Roast Again
              </button>
              <Link href="/builder" className="btn btn-gold" style={{ justifyContent: "center" }}>
                <Sparkles size={13} />Fix My CV Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
