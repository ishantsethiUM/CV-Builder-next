"use client";
import Link from "next/link";
import { useState } from "react";
import { FileText, X, ArrowRight, Star, Check } from "lucide-react";

const TEMPLATES = [
  { id: "Executive", name: "Executive", badge: "Best ATS", ats: 96, stars: 4.9, uses: "48K", bg: "#1A3628", hdr: "#F8F7F2", accent: "#C9A96E", desc: "Dark header with gold accents. Polished and authoritative for senior roles." },
  { id: "Chicago",   name: "Chicago",   badge: "Trending", ats: 88, stars: 4.8, uses: "31K", bg: "#fff",    hdr: "#111110", accent: "#C9A96E", desc: "Oversized editorial name, gold left-border sections. Bold and distinctive." },
  { id: "Minimal",   name: "Minimal",   badge: "Most Hired", ats: 97, stars: 4.9, uses: "62K", bg: "#fff", hdr: "#1E1E18", accent: "#C9A96E", desc: "Ultra clean typography with a gold accent bar. Passes every ATS system." },
  { id: "Compact",   name: "Compact",   badge: "1-Page",   ats: 93, stars: 4.7, uses: "22K", bg: "#fff",   hdr: "#1E1E18", accent: "#C9A96E", desc: "Dense, information-rich layout. Fits everything on a single page." },
  { id: "Slate",     name: "Slate",     badge: "Popular",  ats: 86, stars: 4.8, uses: "24K", bg: "#1E293B", hdr: "#fff",   accent: "#3B82F6", desc: "Dark navy sidebar with skill pills and language bars. Great for tech roles." },
  { id: "Sidebar",   name: "Sidebar",   badge: "New",      ats: 88, stars: 4.8, uses: "9K",  bg: "#EBEBEB", hdr: "#1A1A1A", accent: "#1A1A1A", desc: "Two-column layout with photo placeholder and skill tick bars." },
];

const FILTERS = [
  { id: "All", label: "All Templates" },
  { id: "ATS", label: "ATS-Ready" },
  { id: "Dark", label: "Dark Theme" },
  { id: "OnePage", label: "1-Page" },
  { id: "Creative", label: "Creative" },
  { id: "Academic", label: "Academic" },
];

function MiniPreview({ t }: { t: typeof TEMPLATES[0] }) {
  const lines = [90, 68, 80, 60, 74, 64, 55, 72];

  // Two-column templates (Sidebar, Slate)
  if (t.id === "Sidebar" || t.id === "Slate") {
    const sideColor = t.id === "Slate" ? "#1E293B" : "#EBEBEB";
    const mainColor = "#fff";
    const dotColor  = t.id === "Slate" ? "#fff" : "#1A1A1A";
    return (
      <div style={{ display: "flex", height: 196, overflow: "hidden" }}>
        <div style={{ width: "34%", background: sideColor, padding: "12px 9px" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.id === "Slate" ? "rgba(255,255,255,.15)" : "#C8C8C8", margin: "0 auto 7px", border: `2px solid ${t.id === "Slate" ? "rgba(255,255,255,.2)" : "#fff"}` }} />
          <div style={{ width: "75%", height: 6, background: dotColor, borderRadius: 1, margin: "0 auto 3px", opacity: t.id === "Slate" ? 1 : 0.85 }} />
          <div style={{ width: "50%", height: 4, background: t.id === "Slate" ? "#3B82F6" : "#999", borderRadius: 1, margin: "0 auto 10px", opacity: .7 }} />
          {[70,85,60,75].map((w,i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <div style={{ width: `${w-32}%`, height: 4, background: dotColor, borderRadius: 1, opacity: .65 }} />
              <div style={{ display: "flex", gap: 1 }}>
                {[1,1,1,1,0,0,0].map((on,j) => <div key={j} style={{ width: 4, height: 5, borderRadius: 1, background: on ? dotColor : (t.id === "Slate" ? "rgba(255,255,255,.15)" : "#CCCCCC") }} />)}
              </div>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, background: mainColor, padding: "12px 9px" }}>
          <div style={{ height: 4, width: "90%", background: "#1A1A1A22", borderRadius: 1, marginBottom: 7 }} />
          {[88, 72, 95, 68, 82, 76, 88, 60].map((w, i) => (
            <div key={i} style={{ height: 4, width: `${w}%`, background: i % 3 === 0 ? "#1A1A1A33" : "#1A1A1A12", borderRadius: 1, marginBottom: 5 }} />
          ))}
        </div>
      </div>
    );
  }

  // Executive: dark header block
  if (t.id === "Executive") {
    return (
      <div style={{ height: 196, overflow: "hidden", background: "#fff" }}>
        <div style={{ background: "#1A3628", padding: "14px 14px 12px" }}>
          <div style={{ width: "55%", height: 9, background: "#F8F7F2", borderRadius: 1, marginBottom: 4 }} />
          <div style={{ width: "35%", height: 5, background: "#C9A96E", borderRadius: 1, marginBottom: 9, opacity: .85 }} />
          <div style={{ height: 1, background: "rgba(255,255,255,.15)", marginBottom: 7 }} />
          <div style={{ display: "flex", gap: 8 }}>
            {[45,35,50].map((w,i) => <div key={i} style={{ height: 4, width: `${w}%`, background: "rgba(255,255,255,.4)", borderRadius: 1 }} />)}
          </div>
        </div>
        <div style={{ padding: "10px 14px" }}>
          {lines.map((w, i) => (
            <div key={i} style={{ height: 4, width: `${w}%`, background: i === 2 ? "#1A362822" : "#1A362812", borderRadius: 1, marginBottom: 5 }} />
          ))}
        </div>
      </div>
    );
  }

  // Chicago: large name + gold left-border sections
  if (t.id === "Chicago") {
    return (
      <div style={{ height: 196, overflow: "hidden", background: "#fff", padding: "14px 14px" }}>
        <div style={{ width: "65%", height: 14, background: "#111110", borderRadius: 1, marginBottom: 4 }} />
        <div style={{ width: "40%", height: 5, background: "#74746A", borderRadius: 1, marginBottom: 5, opacity: .5 }} />
        <div style={{ height: 2, background: "#111110", marginBottom: 3 }} />
        <div style={{ height: 1, background: "#E2DFD6", marginBottom: 8 }} />
        {[0,1].map(s => (
          <div key={s} style={{ display: "flex", marginBottom: 8, gap: 7 }}>
            <div style={{ width: 3, background: "#C9A96E", borderRadius: 1, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              {[80,65,90,70].map((w,i) => <div key={i} style={{ height: 4, width: `${w}%`, background: i === 0 ? "#11111022" : "#11111010", borderRadius: 1, marginBottom: 4 }} />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Compact: centered header, dense rows
  if (t.id === "Compact") {
    return (
      <div style={{ height: 196, overflow: "hidden", background: "#fff", padding: "12px 14px" }}>
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <div style={{ width: "50%", height: 8, background: "#1E1E18", borderRadius: 1, margin: "0 auto 3px" }} />
          <div style={{ width: "30%", height: 4, background: "#74746A44", borderRadius: 1, margin: "0 auto 5px" }} />
          <div style={{ height: 2, background: "#1E1E18", marginBottom: 5 }} />
        </div>
        {[90, 75, 85, 65, 88, 70, 80, 60, 75, 68].map((w, i) => (
          <div key={i} style={{ height: 4, width: `${w}%`, background: i % 4 === 0 ? "#1E1E1820" : "#1E1E1810", borderRadius: 1, marginBottom: 4 }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ background: t.bg, padding: "16px", height: 196, position: "relative", overflow: "hidden" }}>
      <div style={{ width: "58%", height: 10, background: t.hdr, borderRadius: 2, marginBottom: 4, opacity: .9 }} />
      <div style={{ width: "36%", height: 3, background: t.accent, borderRadius: 1, marginBottom: 12 }} />
      <div style={{ height: 1, background: `${t.hdr}25`, marginBottom: 10 }} />
      {lines.map((w, i) => (
        <div key={i} style={{ height: 4, width: `${w}%`, background: i === 2 ? `${t.hdr}30` : `${t.hdr}14`, borderRadius: 1, marginBottom: 5 }} />
      ))}
    </div>
  );
}

export default function TemplatesPage() {
  const [filter, setFilter] = useState("All");
  const [preview, setPreview] = useState<typeof TEMPLATES[0] | null>(null);
  const [hov, setHov] = useState<string | null>(null);

  const filtered = TEMPLATES.filter(t => {
    if (filter === "All") return true;
    if (filter === "ATS") return t.ats >= 90;
    if (filter === "Dark") return ["Slate", "Executive"].includes(t.id);
    if (filter === "OnePage") return t.id === "Compact";
    if (filter === "Creative") return ["Chicago", "Sidebar"].includes(t.id);
    if (filter === "Academic") return ["Minimal", "Compact"].includes(t.id);
    return true;
  });

  const F = "var(--font-display)";
  const M = "var(--font-mono)";
  const B = "var(--font-body)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <nav style={{ background: "var(--white)", borderBottom: "1px solid var(--border)", padding: "0 clamp(16px,4vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 40, boxShadow: "var(--shadow-sm)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, background: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}><FileText size={14} color="var(--gold)" /></div>
          <span style={{ fontFamily: F, fontSize: 21, fontWeight: 700, color: "var(--forest)" }}>FitRezume</span>
        </Link>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
          <Link href="/builder" className="btn btn-forest btn-sm">Build my CV</Link>
        </div>
      </nav>

      <div className="page-pad">
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>8 Professional Templates</div>
          <h1 style={{ fontFamily: F, fontSize: "clamp(2.2rem,4vw,3.8rem)", fontWeight: 800, color: "var(--forest)", marginBottom: 14 }}>Choose Your Design</h1>
          <p style={{ fontFamily: B, fontSize: 16, color: "var(--muted)", maxWidth: 500, margin: "0 auto 30px" }}>
            Every template is crafted by professional designers and optimised to pass ATS systems at top companies.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            {FILTERS.map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: "8px 18px", borderRadius: 5, fontSize: 13.5, fontWeight: 500, border: "1.5px solid", borderColor: filter === f.id ? "var(--forest)" : "var(--border)", background: filter === f.id ? "var(--forest)" : "var(--white)", color: filter === f.id ? "var(--cream)" : "var(--muted)", cursor: "pointer", transition: "all .14s", fontFamily: B }}>{f.label}</button>
            ))}
          </div>
        </div>

        <div className="grid-4col">
          {filtered.map(t => (
            <div key={t.id} className="card-flat" style={{ overflow: "hidden", cursor: "pointer", transition: "all .2s", transform: hov === t.id ? "translateY(-5px)" : "none", boxShadow: hov === t.id ? "var(--shadow-lg)" : "var(--shadow-sm)" }}
              onMouseEnter={() => setHov(t.id)} onMouseLeave={() => setHov(null)}>
              <div style={{ position: "relative", overflow: "hidden" }}>
                <span style={{ position: "absolute", top: 10, left: 10, fontFamily: M, fontSize: 9.5, padding: "3px 8px", borderRadius: 3, background: t.hdr, color: "#fff", zIndex: 2 }}>{t.badge}</span>
                <span style={{ position: "absolute", top: 10, right: 10, fontFamily: M, fontSize: 9.5, padding: "3px 8px", borderRadius: 3, background: "rgba(45,122,79,.9)", color: "#fff", zIndex: 2 }}>ATS {t.ats}%</span>
                <MiniPreview t={t} />
                {hov === t.id && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,.82)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, animation: "fadeIn .15s ease" }}>
                    <button onClick={() => setPreview(t)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 16px", background: "var(--gold)", color: "#fff", border: "none", borderRadius: 5, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: B }}>Preview</button>
                    <Link href="/builder" style={{ display: "flex", alignItems: "center", gap: 5, padding: "9px 16px", background: "var(--white)", color: "var(--forest)", borderRadius: 5, fontSize: 12.5, fontWeight: 700, textDecoration: "none", fontFamily: B }}>Use <ArrowRight size={12} /></Link>
                  </div>
                )}
              </div>
              <div style={{ padding: "15px 17px 18px" }}>
                <h3 style={{ fontFamily: F, fontSize: 18, fontWeight: 700, color: "var(--forest)", marginBottom: 4 }}>{t.name}</h3>
                <p style={{ fontFamily: B, fontSize: 12.5, color: "var(--muted)", marginBottom: 10, lineHeight: 1.5 }}>{t.desc}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ display: "flex", gap: 1 }}>{[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill={s <= Math.floor(t.stars) ? "#2563EB" : "transparent"} color="#2563EB" />)}</div>
                    <span style={{ fontFamily: M, fontSize: 9.5, color: "var(--muted)" }}>{t.stars}</span>
                  </div>
                  <span style={{ fontFamily: M, fontSize: 9.5, color: "var(--muted)" }}>{t.uses} uses</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Feature comparison */}
        <div style={{ marginTop: 72, textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontFamily: F, fontSize: "clamp(1.8rem,3vw,2.8rem)", fontWeight: 700, color: "var(--forest)", marginBottom: 10 }}>All Templates Include</h2>
          <p style={{ fontFamily: B, fontSize: 15, color: "var(--muted)" }}>Every template comes with these features built-in.</p>
        </div>
        <div className="grid-3col">
          {[
            { icon: "📄", title: "One-click PDF Export", desc: "Download a pixel-perfect PDF in seconds." },
            { icon: "🤖", title: "ATS Optimised", desc: "Structured to pass automated screening systems." },
            { icon: "✏️", title: "Live Preview", desc: "See changes instantly as you type." },
            { icon: "✨", title: "AI Content Assist", desc: "Generate bullet points, summaries, and skills with AI." },
            { icon: "📱", title: "Mobile Friendly", desc: "Looks great on all screen sizes." },
            { icon: "🔒", title: "Private & Secure", desc: "Your data is never shared or sold." },
          ].map(f => (
            <div key={f.title} className="card-flat" style={{ padding: "20px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: 26, flexShrink: 0 }}>{f.icon}</span>
              <div>
                <p style={{ fontFamily: B, fontSize: 14, fontWeight: 600, color: "var(--forest)", marginBottom: 4 }}>{f.title}</p>
                <p style={{ fontFamily: B, fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(15,23,42,.82)", display: "flex", alignItems: "center", justifyContent: "center", padding: 40, animation: "fadeIn .2s ease" }} onClick={() => setPreview(null)}>
          <div style={{ background: "var(--white)", borderRadius: 10, overflow: "hidden", maxWidth: 660, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "var(--shadow-lg)" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid var(--border)", background: "var(--surface)" }}>
              <div>
                <h3 style={{ fontFamily: F, fontSize: 22, fontWeight: 700, color: "var(--forest)" }}>{preview.name}</h3>
                <p style={{ fontFamily: M, fontSize: 10, color: "var(--muted)", marginTop: 2 }}>ATS {preview.ats}% · {preview.stars}★ · {preview.uses} uses</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Link href="/builder" className="btn btn-gold btn-sm">Use This Template</Link>
                <button onClick={() => setPreview(null)} style={{ width: 36, height: 36, borderRadius: 5, background: "var(--surface)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={15} color="var(--muted)" /></button>
              </div>
            </div>
            <div style={{ background: preview.bg, padding: "44px 50px", minHeight: 380 }}>
              <div style={{ width: "60%", height: 18, background: preview.hdr, borderRadius: 2, marginBottom: 6 }} />
              <div style={{ width: "40%", height: 10, background: preview.hdr, borderRadius: 2, opacity: .5, marginBottom: 24 }} />
              <div style={{ height: 1, background: `${preview.hdr}40`, marginBottom: 14 }} />
              {[92, 70, 82, 96, 60, 76, 88, 66, 50, 74].map((w, i) => (
                <div key={i} style={{ height: 7, width: `${w}%`, background: i % 3 === 0 ? preview.hdr : `${preview.hdr}28`, borderRadius: 1, marginBottom: 7 }} />
              ))}
            </div>
            <div style={{ padding: "18px 22px", borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
              <p style={{ fontFamily: B, fontSize: 13.5, color: "var(--muted)", marginBottom: 12 }}>{preview.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["ATS Optimised", "PDF Export", "Live Preview", "AI Assist"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 4, background: "rgba(37,99,235,.07)", border: "1px solid rgba(37,99,235,.15)" }}>
                    <Check size={10} color="#2563EB" />
                    <span style={{ fontFamily: B, fontSize: 12, color: "var(--forest)" }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
