"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getResumes, deleteResume, uploadResume, logout, token, type ResumeItem } from "@/lib/api";
import { useCredits } from "@/contexts/CreditsContext";
import {
  FileText, Plus, Download, Edit3, Trash2,
  BarChart2, Sparkles, LogOut,
  Eye, Flame, Brain, Target,
  CheckCircle2, Layers, RefreshCcw, AlertCircle, Clock,
  Upload, X, ArrowRight, CreditCard
} from "lucide-react";

const FF = "'Inter', system-ui, -apple-system, sans-serif";
const C = {
  forest: "#0F172A",
  gold: "#2563EB",
  cream: "#F8FAFF",
  ink: "#0F172A",
  muted: "#64748B",
  white: "#FFFFFF",
  border: "#E2E8F0",
  ember: "#DC2626",
  charcoal: "#1E293B",
  surface: "#F8FAFF",
};

function AtsRing({ score, size = 40 }: { score: number; size?: number }) {
  const r = (size / 2) - 4;
  const circ = 2 * Math.PI * r;
  const off = circ - (score / 100) * circ;
  const col = score >= 80 ? C.forest : score >= 60 ? C.gold : C.ember;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth="2.5"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="2.5"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
          transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset 1s ease" }}/>
      </svg>
      <span style={{ color: col, fontSize: size > 50 ? 13 : 10, fontWeight: 700 }}>{score}</span>
    </div>
  );
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cvs, setCvs] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [deleting, setDeleting] = useState<string | number | null>(null);
  const [hour] = useState(() => new Date().getHours());
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const { credits, openBuyModal } = useCredits();

  const noCVCredits = credits !== null && credits.cvCredits === 0;
  const lowCVCredits = credits !== null && credits.cvCredits <= 1 && credits.cvCredits > 0;
  const lowExportCredits = credits !== null && credits.exportCredits <= 2 && credits.exportCredits > 0;

  useEffect(() => {
    if (!authLoading && !token.get()) router.replace("/auth");
  }, [authLoading, router]);

  const fetchCVs = useCallback(async () => {
    setLoading(true); setError("");
    try { setCvs(await getResumes()); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to load CVs"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (token.get()) fetchCVs(); }, [fetchCVs]);

  const handleDelete = async (id: string | number) => {
    if (!confirm("Delete this CV?")) return;
    setDeleting(id);
    try { await deleteResume(id); setCvs(prev => prev.filter(c => c.id !== id)); }
    catch (e: unknown) { alert(e instanceof Error ? e.message : "Delete failed"); }
    finally { setDeleting(null); }
  };

  const openUpload = () => { setUploadFile(null); setUploadError(""); setUploadOpen(true); };
  const closeUpload = () => { if (!uploading) { setUploadOpen(false); setUploadFile(null); setUploadError(""); } };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true); setUploadError("");
    try {
      const result = await uploadResume(uploadFile);
      setCvs(prev => [result, ...prev]);
      closeUpload();
      router.push(`/builder?id=${result.id}`);
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const onDropFile = (file: File) => {
    const ok = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"].includes(file.type)
      || file.name.endsWith(".pdf") || file.name.endsWith(".docx") || file.name.endsWith(".doc");
    if (!ok) { setUploadError("Please upload a PDF or Word document (.pdf, .docx, .doc)"); return; }
    if (file.size > 10 * 1024 * 1024) { setUploadError("File must be under 10 MB"); return; }
    setUploadError(""); setUploadFile(file);
  };

  const filtered = cvs.filter(r => r.title?.toLowerCase().includes(q.toLowerCase()));
  const avgATS = cvs.length ? Math.round(cvs.reduce((a, c) => a + (c.atsScore || 0), 0) / cvs.length) : 0;
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  const firstName = user?.name?.split(" ")[0] || "";

  return (
    <div style={{ minHeight: "100vh", background: C.cream, display: "flex", fontFamily: FF, color: C.ink }}>

      {/* ── SIDEBAR ─────────────────────────────────── */}
      <aside style={{
        position: "fixed", left: 0, top: 0, bottom: 0, width: 220,
        background: C.white, borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column",
        padding: "24px 0", zIndex: 50,
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, padding: "0 20px 22px", borderBottom: `1px solid ${C.border}`, marginBottom: 10 }}>
          <div style={{ width: 30, height: 30, background: C.forest, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 7 }}>
            <FileText size={14} color={C.gold} />
          </div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: "-0.3px" }}>FitRezume</span>
        </Link>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "4px 10px", display: "flex", flexDirection: "column", gap: 1 }}>
          <SideLink href="/dashboard" icon={<BarChart2 size={16}/>} active>Dashboard</SideLink>
          {noCVCredits
            ? <SideLink href="#" icon={<Plus size={16}/>} onClick={openBuyModal}>New CV</SideLink>
            : <SideLink href="/builder" icon={<Plus size={16}/>}>New CV</SideLink>}
          <SideLink href="/templates" icon={<Layers size={16}/>}>Templates</SideLink>

          <div style={{ height: 1, background: C.border, margin: "12px 4px" }} />
          <p style={{ fontSize: 10.5, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: ".07em", padding: "0 8px", marginBottom: 3 }}>Tools</p>

          <SideLink href="/tools/roast" icon={<Flame size={16}/>} accent="#C84B38">Roast my CV</SideLink>
          <SideLink href="/tools/interview" icon={<Brain size={16}/>} accent="#7C5CBF">Interview Sim</SideLink>
          <SideLink href="/tools/job-match" icon={<Target size={16}/>} accent={C.forest}>Job Matcher</SideLink>
        </nav>

        {/* User block */}
        <div style={{ padding: "14px 14px 0", borderTop: `1px solid ${C.border}` }}>
          {!authLoading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderRadius: 8, background: C.surface }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.forest, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: C.gold, flexShrink: 0 }}>
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Account"}</p>
                <p style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>{user?.plan || "Free"}</p>
              </div>
              <button onClick={async () => { await logout(); router.push("/auth"); }}
                style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", padding: 4, flexShrink: 0 }}
                title="Sign out">
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────── */}
      <main style={{ marginLeft: 220, flex: 1, minWidth: 0 }}>

        {/* ── PAGE HEADER ─────────────────────────────── */}
        <div style={{ padding: "44px 48px 0" }}>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: ".12em", color: C.muted, textTransform: "uppercase", marginBottom: 8 }}>
            Good {greeting}
          </p>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 34, fontWeight: 700, color: C.ink, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 32 }}>
            {firstName ? `${firstName}'s workspace` : "Your workspace"}
          </h1>

          {/* ── STATS STRIP ────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40 }}>
            {[
              { n: loading ? "—" : String(cvs.length), label: "CVs created", sub: "total" },
              { n: loading ? "—" : `${avgATS}`, label: "Avg ATS score", sub: "/ 100" },
              { n: credits ? String(credits.exportCredits) : "—", label: "Export credits", sub: "remaining" },
              { n: loading ? "—" : String(cvs.reduce((a, c) => a + (c.views || 0), 0)), label: "Profile views", sub: "total" },
            ].map((s) => (
              <div key={s.label} style={{ padding: "22px 24px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 700, color: C.ink, letterSpacing: "-1.5px", lineHeight: 1, marginBottom: 5 }}>
                  {s.n}
                  <span style={{ fontSize: 13, fontWeight: 400, color: C.muted, letterSpacing: 0, marginLeft: 5 }}>{s.sub}</span>
                </p>
                <p style={{ fontSize: 13, color: C.muted, fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BODY ─────────────────────────────────────── */}
        <div style={{ padding: "0 48px 64px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 32, alignItems: "start" }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>

            {/* ── YOUR CVs ────────────────────────────────── */}
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: "-0.5px" }}>Your CVs</h2>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: C.muted, background: C.border, padding: "2px 8px", borderRadius: 20 }}>
                    {filtered.length}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ position: "relative" }}>
                    <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filter…"
                      style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 13, width: 160, outline: "none", background: C.white, fontFamily: FF, color: C.ink }} />
                  </div>
                  <button onClick={fetchCVs} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 10px", color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                    <RefreshCcw size={12} /> Refresh
                  </button>
                  <button onClick={openUpload} style={{ display: "flex", alignItems: "center", gap: 6, background: C.white, color: C.forest, padding: "8px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: `1px solid ${C.forest}`, cursor: "pointer" }}>
                    <Upload size={14} /> Upload
                  </button>
                  {noCVCredits ? (
                    <button onClick={openBuyModal} style={{ display: "flex", alignItems: "center", gap: 6, background: C.forest, color: C.white, padding: "8px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
                      <Plus size={14} /> New CV
                    </button>
                  ) : (
                    <Link href="/builder" style={{ display: "flex", alignItems: "center", gap: 6, background: C.forest, color: C.white, padding: "8px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                      <Plus size={14} /> New CV
                    </Link>
                  )}
                </div>
              </div>

              {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "rgba(201,78,42,.07)", border: `1px solid rgba(201,78,42,.2)`, borderRadius: 6, marginBottom: 12 }}>
                  <AlertCircle size={14} color={C.ember} />
                  <p style={{ fontSize: 13, color: C.ember }}>{error}</p>
                </div>
              )}

              {!loading && filtered.length === 0 && (
                <div style={{ padding: "56px 24px", textAlign: "center", background: C.white, borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <FileText size={20} color={C.muted} />
                  </div>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 600, color: C.ink, marginBottom: 6 }}>No CVs yet</p>
                  <p style={{ fontSize: 13, color: C.muted, maxWidth: 280, margin: "0 auto 24px" }}>Build a new CV from scratch or upload an existing one to get started.</p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    {noCVCredits ? (
                      <button onClick={openBuyModal} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: C.forest, color: C.white, padding: "10px 18px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
                        <Plus size={14} /> Build from scratch
                      </button>
                    ) : (
                      <Link href="/builder" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: C.forest, color: C.white, padding: "10px 18px", borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                        <Plus size={14} /> Build from scratch
                      </Link>
                    )}
                    <button onClick={openUpload} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: C.white, color: C.forest, padding: "10px 18px", borderRadius: 6, fontSize: 13, fontWeight: 600, border: `1px solid ${C.forest}`, cursor: "pointer" }}>
                      <Upload size={14} /> Upload existing
                    </button>
                  </div>
                </div>
              )}

              {/* CV Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {!loading && filtered.map(r => (
                  <div key={r.id}
                    style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16, opacity: deleting === r.id ? 0.4 : 1, transition: "border-color .15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>

                    {/* Doc icon */}
                    <div style={{ width: 42, height: 52, background: C.cream, border: `1px solid ${C.border}`, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FileText size={18} color={C.forest} />
                    </div>

                    {/* Title + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.title}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: C.muted, background: C.cream, padding: "2px 6px", borderRadius: 3, border: `1px solid ${C.border}` }}>
                          {r.template || "General"}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: C.muted }}>
                          <Clock size={11} />
                          {timeAgo(r.updatedAt)}
                        </span>
                        {r.status === "active" && (
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: C.forest, fontWeight: 600 }}>
                            <CheckCircle2 size={11} /> Active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ATS */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                      <AtsRing score={r.atsScore || 0} />
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: C.muted }}>ATS</span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <Link href={`/builder?id=${r.id}`}
                        style={{ padding: "7px 10px", borderRadius: 5, border: `1px solid ${C.border}`, background: C.cream, color: C.ink, display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500, textDecoration: "none" }}>
                        <Edit3 size={13} /> Edit
                      </Link>
                      <button onClick={() => window.open(`/builder?id=${r.id}`, "_blank")} style={{ padding: "7px 10px", borderRadius: 5, border: `1px solid ${C.border}`, background: C.cream, color: C.ink, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 500 }}
                        title="Open in builder to export PDF">
                        <Download size={13} />
                      </button>
                      <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id}
                        style={{ padding: "7px 10px", borderRadius: 5, border: "1px solid rgba(201,78,42,.2)", background: "rgba(201,78,42,.06)", color: C.ember, cursor: "pointer", display: "flex", alignItems: "center" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── CAREER TOOLS ─────────────────────────────── */}
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Sparkles size={16} color={C.gold} />
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: "-0.5px" }}>Career Tools</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { href: "/tools/roast", icon: <Flame size={18}/>, label: "Roast my CV", sub: "Brutally honest AI feedback that shows exactly what to fix.", badge: "Viral", badgeColor: C.ember },
                  { href: "/tools/interview", icon: <Brain size={18}/>, label: "Interview Simulator", sub: "AI-generated questions tailored for grad and tech roles.", badge: "Popular", badgeColor: "#7c5cbf" },
                  { href: "/tools/job-match", icon: <Target size={18}/>, label: "Job Matcher", sub: "Paste a job description and get a keyword gap analysis.", badge: "New", badgeColor: C.forest },
                ].map(t => (
                  <Link key={t.label} href={t.href} style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, transition: "border-color .15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = t.badgeColor}
                      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: `${t.badgeColor}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: t.badgeColor }}>
                        {t.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 2 }}>{t.label}</p>
                        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.4 }}>{t.sub}</p>
                      </div>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fontWeight: 700, color: t.badgeColor, background: `${t.badgeColor}12`, padding: "3px 8px", borderRadius: 3, textTransform: "uppercase", flexShrink: 0 }}>
                        {t.badge}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* ── RIGHT ───────────────────────────────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Upgrade */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "22px", overflow: "hidden", position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: C.forest, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={13} color={C.gold} />
                </div>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".1em", color: C.muted, textTransform: "uppercase" }}>
                  {user?.plan || "Free"} plan
                </span>
              </div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: "-0.4px", marginBottom: 5 }}>Upgrade to Pro</p>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
                Unlimited CVs, exports, and premium templates.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
                {["Unlimited CVs & exports", "All premium templates", "Priority AI features"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle2 size={13} color={C.forest} />
                    <span style={{ fontSize: 13, color: C.ink }}>{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={openBuyModal} style={{ width: "100%", padding: "11px", borderRadius: 7, background: C.forest, color: C.white, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                <CreditCard size={14} /> Buy Credits
              </button>
            </div>

            {/* Tips */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 18px" }}>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".1em", color: C.muted, textTransform: "uppercase", marginBottom: 14 }}>
                Quick tips
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { dot: C.forest, t: "Quantify results — 'improved by 20%' scores higher in ATS filters." },
                  { dot: C.ember, t: "Use Job Matcher to close keyword gaps before you apply." },
                  { dot: C.gold, t: "One page for under 3 years experience. Always." },
                ].map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: tip.dot, marginTop: 5, flexShrink: 0 }} />
                    <p style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.5 }}>{tip.t}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Templates */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 18px" }}>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".1em", color: C.muted, textTransform: "uppercase", marginBottom: 14 }}>
                Browse templates
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {["Minimal", "Modern", "ATS Pro", "Sidebar"].map(t => (
                  <Link key={t} href="/templates" style={{ textDecoration: "none", padding: "10px 12px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, fontWeight: 500, color: C.ink, display: "block", background: C.cream, transition: "border-color .12s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = C.forest}
                    onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                    {t}
                  </Link>
                ))}
              </div>
            </div>

            {/* Credits */}
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: ".1em", color: C.muted, textTransform: "uppercase" }}>Credits</p>
                <Eye size={14} color={C.muted} />
              </div>
              {credits ? (
                <>
                  {[
                    { label: "CV credits", val: credits.cvCredits, low: lowCVCredits, empty: noCVCredits },
                    { label: "Export credits", val: credits.exportCredits, low: lowExportCredits, empty: credits.exportCredits === 0 },
                  ].map(u => (
                    <div key={u.label} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: C.ink }}>{u.label}</span>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: u.empty ? C.ember : u.low ? C.gold : C.muted, fontWeight: u.low || u.empty ? 700 : 400 }}>
                          {u.val} left{u.low && !u.empty ? " — low!" : u.empty ? " — out!" : ""}
                        </span>
                      </div>
                      <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: u.val > 0 ? "60%" : "0%", background: u.empty ? C.ember : u.low ? C.gold : C.forest, borderRadius: 2, transition: "width 1s ease" }} />
                      </div>
                    </div>
                  ))}
                  <button onClick={openBuyModal} style={{ width: "100%", padding: "8px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.surface, color: C.ink, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FF, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
                    <CreditCard size={12} /> Buy more credits
                  </button>
                </>
              ) : (
                <p style={{ fontSize: 12, color: C.muted }}>Sign in to view credits</p>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* ── UPLOAD MODAL ─────────────────────────────── */}
      {uploadOpen && (
        <div
          onClick={closeUpload}
          style={{ position: "fixed", inset: 0, background: "rgba(17,17,16,.55)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: C.white, borderRadius: 14, width: "100%", maxWidth: 480, padding: "32px", boxShadow: "0 24px 48px rgba(0,0,0,.18)", position: "relative" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: C.ink, letterSpacing: "-0.5px", marginBottom: 4 }}>Upload your resume</h2>
                <p style={{ fontSize: 13, color: C.muted }}>We'll parse it and open it in the editor for you to refine.</p>
              </div>
              <button onClick={closeUpload} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, padding: 4, marginLeft: 12 }}>
                <X size={18} />
              </button>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onDropFile(f); }}
              onClick={() => { const inp = document.getElementById("resume-file-input") as HTMLInputElement; inp?.click(); }}
              style={{
                border: `2px dashed ${dragOver ? C.forest : uploadFile ? C.gold : C.border}`,
                borderRadius: 10, padding: "36px 24px", textAlign: "center", cursor: "pointer",
                background: dragOver ? `${C.forest}06` : uploadFile ? `${C.gold}08` : C.cream,
                transition: "all .15s", marginBottom: 16,
              }}>
              <input id="resume-file-input" type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) onDropFile(f); }} />
              {uploadFile ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <FileText size={22} color={C.forest} />
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{uploadFile.name}</p>
                    <p style={{ fontSize: 12, color: C.muted }}>{(uploadFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); setUploadFile(null); setUploadError(""); }}
                    style={{ marginLeft: 8, background: "none", border: "none", cursor: "pointer", color: C.muted }}>
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.white, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <Upload size={20} color={C.muted} />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 4 }}>Drop your file here or click to browse</p>
                  <p style={{ fontSize: 12, color: C.muted }}>PDF, DOC, DOCX — up to 10 MB</p>
                </>
              )}
            </div>

            {/* Error */}
            {uploadError && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(201,78,42,.07)", border: "1px solid rgba(201,78,42,.2)", borderRadius: 6, marginBottom: 16 }}>
                <AlertCircle size={13} color={C.ember} />
                <p style={{ fontSize: 13, color: C.ember }}>{uploadError}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={closeUpload} disabled={uploading}
                style={{ flex: 1, padding: "11px", borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, color: C.ink, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FF }}>
                Cancel
              </button>
              <button onClick={handleUpload} disabled={!uploadFile || uploading}
                style={{ flex: 2, padding: "11px", borderRadius: 6, border: "none", background: uploadFile && !uploading ? C.forest : C.border, color: uploadFile && !uploading ? C.white : C.muted, fontSize: 13, fontWeight: 600, cursor: uploadFile && !uploading ? "pointer" : "not-allowed", fontFamily: FF, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background .15s" }}>
                {uploading
                  ? <><div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.3)", borderTopColor: C.white, borderRadius: "50%" }} className="spin" /> Uploading…</>
                  : <><ArrowRight size={14} /> Upload &amp; open in editor</>}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function SideLink({ href, icon, children, active, accent, onClick }: {
  href: string; icon: React.ReactNode; children: React.ReactNode; active?: boolean; accent?: string; onClick?: () => void;
}) {
  const activeColor = C.forest;
  const col = active ? activeColor : accent || C.muted;
  const handleClick = onClick ? (e: React.MouseEvent) => { e.preventDefault(); onClick(); } : undefined;
  return (
    <Link href={href} onClick={handleClick} style={{
      display: "flex", alignItems: "center", gap: 9,
      padding: "8px 12px", borderRadius: 7, textDecoration: "none",
      fontSize: 13.5, fontWeight: active ? 600 : 500,
      color: col,
      background: active ? `${C.forest}0f` : "transparent",
      transition: "background .13s, color .13s",
    }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.ink; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = col; } }}>
      <span style={{ opacity: active ? 1 : 0.75 }}>{icon}</span>
      {children}
    </Link>
  );
}
