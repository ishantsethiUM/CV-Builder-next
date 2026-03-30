"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getToolHistory, type ToolHistoryEntry } from "@/lib/api";
import { ChevronLeft, Flame, Brain, Target, ChevronDown, ChevronUp, RotateCcw, AlertCircle } from "lucide-react";

type ToolFilter = "all" | "roast" | "interview" | "job-match";

const TOOL_META = {
  roast:      { label: "Resume Roast",      icon: "🔥", color: "#c84c2e", bg: "rgba(200,76,46,.08)",  border: "rgba(200,76,46,.2)"  },
  interview:  { label: "Interview Sim",     icon: "🎙️", color: "#7c5cbf", bg: "rgba(124,92,191,.08)", border: "rgba(124,92,191,.2)" },
  "job-match":{ label: "Job Match",         icon: "🎯", color: "#2d7a4f", bg: "rgba(45,122,79,.08)",  border: "rgba(45,122,79,.2)"  },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function RoastCard({ entry }: { entry: ToolHistoryEntry }) {
  const [open, setOpen] = useState(false);
  const r = entry.result as { score?: number; verdict?: string; advice?: string; roasts?: {section:string;roast:string;fix:string}[]; good?: string[] };
  const sc = (r.score ?? 0) >= 60 ? "#2d7a4f" : (r.score ?? 0) >= 40 ? "var(--gold)" : "#c84c2e";
  const inp = entry.input as { level?: string };

  return (
    <div style={{ borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden", background: "var(--white)" }}>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => setOpen(!open)}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(200,76,46,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Flame size={20} color="#c84c2e" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--forest)" }}>Resume Roast</span>
            {inp.level && <span className="tag" style={{ background: "rgba(200,76,46,.1)", color: "#c84c2e", fontSize: 9 }}>{inp.level}</span>}
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--muted)" }}>{formatDate(entry.createdAt)}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, lineHeight: 1, color: sc }}>{r.score ?? "—"}</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>/ 100</p>
        </div>
        <div style={{ color: "var(--muted)", marginLeft: 4 }}>{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</div>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {r.verdict && (
            <p style={{ fontFamily: "var(--font-display)", fontSize: 14, fontStyle: "italic", color: "var(--forest)" }}>"{r.verdict}"</p>
          )}
          {r.roasts && r.roasts.slice(0, 3).map((ro, i) => (
            <div key={i} style={{ padding: "10px 12px", background: "var(--surface)", borderRadius: 6, border: "1px solid var(--border)" }}>
              <span className="tag" style={{ background: "rgba(200,76,46,.1)", color: "#c84c2e", marginBottom: 5, display: "inline-block", fontSize: 9 }}>{ro.section}</span>
              <p style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.5 }}>😬 {ro.roast}</p>
            </div>
          ))}
          {r.advice && (
            <div style={{ padding: "10px 12px", background: "rgba(200,169,110,.06)", border: "1px solid rgba(200,169,110,.2)", borderRadius: 6 }}>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gold)", marginBottom: 4 }}>ADVICE</p>
              <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{r.advice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InterviewCard({ entry }: { entry: ToolHistoryEntry }) {
  const [open, setOpen] = useState(false);
  const inp = entry.input as { role?: string; company?: string; count?: number; hasCv?: boolean };
  const r = entry.result as { questions?: {id:string;question:string;category:string;difficulty:number}[] };
  const qs = r.questions ?? [];

  return (
    <div style={{ borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden", background: "var(--white)" }}>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => setOpen(!open)}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(124,92,191,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Brain size={20} color="#7c5cbf" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--forest)" }}>{inp.role ?? "Interview Session"}</span>
            {inp.company && <span className="tag" style={{ background: "rgba(124,92,191,.1)", color: "#7c5cbf", fontSize: 9 }}>{inp.company}</span>}
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--muted)" }}>{formatDate(entry.createdAt)} · {qs.length} questions{inp.hasCv ? " · CV used" : ""}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, lineHeight: 1, color: "#7c5cbf" }}>{qs.length}</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>questions</p>
        </div>
        <div style={{ color: "var(--muted)", marginLeft: 4 }}>{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</div>
      </div>

      {open && qs.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {qs.map((q, i) => (
            <div key={q.id ?? i} style={{ padding: "10px 12px", background: "var(--surface)", borderRadius: 6, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 7, marginBottom: 5 }}>
                <span className="tag" style={{ background: "rgba(124,92,191,.1)", color: "#7c5cbf", fontSize: 9 }}>{q.category}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>{"★".repeat(q.difficulty ?? 1)}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--ink)", lineHeight: 1.5 }}>{q.question}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JobMatchCard({ entry }: { entry: ToolHistoryEntry }) {
  const [open, setOpen] = useState(false);
  const r = entry.result as { matchScore?: number; summary?: string; quickWins?: string[]; matchedKeywords?: string[]; missingKeywords?: string[] };
  const inp = entry.input as { jobDescSnippet?: string };
  const sc = (r.matchScore ?? 0) >= 75 ? "#2d7a4f" : (r.matchScore ?? 0) >= 50 ? "var(--gold)" : "#c84c2e";

  return (
    <div style={{ borderRadius: 8, border: "1px solid var(--border)", overflow: "hidden", background: "var(--white)" }}>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => setOpen(!open)}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(45,122,79,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Target size={20} color="#2d7a4f" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 3 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--forest)" }}>Job Match</span>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {formatDate(entry.createdAt)}{inp.jobDescSnippet ? ` · "${inp.jobDescSnippet.slice(0, 40)}…"` : ""}
          </p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, lineHeight: 1, color: sc }}>{r.matchScore ?? "—"}</p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--muted)" }}>/ 100</p>
        </div>
        <div style={{ color: "var(--muted)", marginLeft: 4 }}>{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</div>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {r.summary && <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.65 }}>{r.summary}</p>}
          {r.quickWins && r.quickWins.length > 0 && (
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gold)", marginBottom: 6, textTransform: "uppercase" }}>Quick Wins</p>
              {r.quickWins.map((w, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--gold)", flexShrink: 0, marginTop: 2 }}>{i + 1}.</span>
                  <p style={{ fontSize: 13, color: "var(--ink)" }}>{w}</p>
                </div>
              ))}
            </div>
          )}
          {((r.matchedKeywords?.length ?? 0) > 0 || (r.missingKeywords?.length ?? 0) > 0) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#2d7a4f", marginBottom: 6, textTransform: "uppercase" }}>Matched ({r.matchedKeywords?.length ?? 0})</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {r.matchedKeywords?.slice(0, 6).map((k, i) => <span key={i} className="tag" style={{ background: "rgba(45,122,79,.1)", color: "#2d7a4f", fontSize: 10 }}>{k}</span>)}
                </div>
              </div>
              <div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#c84c2e", marginBottom: 6, textTransform: "uppercase" }}>Missing ({r.missingKeywords?.length ?? 0})</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {r.missingKeywords?.slice(0, 6).map((k, i) => <span key={i} className="tag" style={{ background: "rgba(200,76,46,.1)", color: "#c84c2e", fontSize: 10 }}>{k}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const [history, setHistory] = useState<ToolHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<ToolFilter>("all");

  useEffect(() => {
    getToolHistory()
      .then(setHistory)
      .catch(e => setError(e instanceof Error ? e.message : "Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? history : history.filter(h => h.tool === filter);

  const counts = {
    all: history.length,
    roast: history.filter(h => h.tool === "roast").length,
    interview: history.filter(h => h.tool === "interview").length,
    "job-match": history.filter(h => h.tool === "job-match").length,
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--cream)" }}>
      <nav style={{ background: "var(--white)", borderBottom: "1px solid var(--border)", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard" className="btn btn-ghost btn-sm"><ChevronLeft size={12} />Dashboard</Link>
          <div style={{ width: 1, height: 16, background: "var(--border)" }} />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--forest)" }}>Tool History</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/tools/roast" className="btn btn-ghost btn-sm"><Flame size={12} />Roast</Link>
          <Link href="/tools/interview" className="btn btn-ghost btn-sm"><Brain size={12} />Interview</Link>
          <Link href="/tools/job-match" className="btn btn-ghost btn-sm"><Target size={12} />Job Match</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 740, margin: "0 auto", padding: "48px 36px 72px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,3.5vw,3rem)", fontWeight: 700, color: "var(--forest)", marginBottom: 8 }}>Your Tool History</h1>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>All your roasts, interview sessions, and job match analyses in one place.</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {(["all", "roast", "interview", "job-match"] as ToolFilter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${filter === f ? "var(--forest)" : "var(--border)"}`, background: filter === f ? "var(--forest)" : "var(--white)", color: filter === f ? "var(--cream)" : "var(--muted)", fontFamily: "var(--font-mono)", fontSize: 11, cursor: "pointer", transition: "all .14s", display: "flex", alignItems: "center", gap: 5 }}>
              {f === "all" ? "All" : TOOL_META[f].icon} {f === "all" ? `All (${counts.all})` : `${TOOL_META[f].label} (${counts[f]})`}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTopColor: "var(--forest)", borderRadius: "50%", margin: "0 auto 16px" }} className="spin" />
            <p style={{ fontSize: 14, color: "var(--muted)" }}>Loading history…</p>
          </div>
        )}

        {error && (
          <div style={{ display: "flex", gap: 10, padding: "14px 16px", background: "rgba(200,76,46,.07)", border: "1px solid rgba(200,76,46,.2)", borderRadius: 8, marginBottom: 20 }}>
            <AlertCircle size={16} color="#c84c2e" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: 13.5, color: "#c84c2e" }}>{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "var(--white)", borderRadius: 12, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>{filter === "roast" ? "🔥" : filter === "interview" ? "🎙️" : filter === "job-match" ? "🎯" : "📋"}</div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--forest)", marginBottom: 8 }}>No history yet</h3>
            <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>
              {filter === "all"
                ? "Use Roast, Interview Simulator, or Job Match to start building your history."
                : `No ${TOOL_META[filter as keyof typeof TOOL_META]?.label} sessions yet.`}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/tools/roast" className="btn btn-outline btn-sm"><Flame size={12} />Try Roast</Link>
              <Link href="/tools/interview" className="btn btn-outline btn-sm"><Brain size={12} />Try Interview</Link>
              <Link href="/tools/job-match" className="btn btn-outline btn-sm"><Target size={12} />Try Job Match</Link>
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}>{filtered.length} session{filtered.length !== 1 ? "s" : ""}</p>
            {filtered.map(entry => {
              if (entry.tool === "roast") return <RoastCard key={entry.id} entry={entry} />;
              if (entry.tool === "interview") return <InterviewCard key={entry.id} entry={entry} />;
              if (entry.tool === "job-match") return <JobMatchCard key={entry.id} entry={entry} />;
              return null;
            })}
          </div>
        )}

        {!loading && history.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button onClick={() => { setLoading(true); getToolHistory().then(setHistory).catch(() => {}).finally(() => setLoading(false)); }}
              className="btn btn-ghost btn-sm">
              <RotateCcw size={12} />Refresh
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
