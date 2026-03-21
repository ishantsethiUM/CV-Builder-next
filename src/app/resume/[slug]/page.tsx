"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { FileText, Copy, Check, Eye, ExternalLink, AlertCircle } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

interface PublicCV {
  title: string;
  template?: string;
  data?: {
    personal?: { name?: string; email?: string; phone?: string; location?: string; linkedin?: string; summary?: string };
    experience?: { id: string; company: string; role: string; period: string; bullets: string[] }[];
    education?: { id: string; school: string; degree: string; field?: string; period: string; gpa?: string }[];
    skills?: { technical?: string; soft?: string; languages?: string; certifications?: string };
    projects?: { id: string; name: string; tech?: string; description: string }[];
    achievements?: { id: string; text: string }[];
  };
}

const FF = "'Inter', system-ui, sans-serif";
const FOREST = "#1A3628";
const GOLD = "#C9A96E";
const MUTED = "#74746A";
const BORDER = "#E2DFD6";

export default function PublicResumePage({ params }: { params: { slug: string } }) {
  const [cv, setCv] = useState<PublicCV | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/resumes/public/${params.slug}`)
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json(); })
      .then(setCv)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.slug]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const p = cv?.data?.personal;
  const displayName = p?.name || cv?.title || "Resume";

  return (
    <main style={{ minHeight: "100vh", background: "#F0EDE4", fontFamily: FF }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", height: 56, background: "rgba(26,54,40,.97)", backdropFilter: "blur(8px)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <div style={{ width: 26, height: 26, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4 }}>
            <FileText size={13} color={FOREST} />
          </div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 700, color: "#fff" }}>Folio</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!loading && !notFound && (
            <button onClick={handleCopy} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 4, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", color: "rgba(255,255,255,.7)", fontSize: 12, cursor: "pointer" }}>
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
          )}
          <Link href="/auth" style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 4, background: GOLD, color: FOREST, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            <FileText size={11} /> Build Yours Free
          </Link>
        </div>
      </header>

      <div style={{ display: "flex", justifyContent: "center", padding: "40px 22px 64px" }}>
        <div style={{ width: "100%", maxWidth: 720 }}>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ width: 32, height: 32, border: `3px solid ${BORDER}`, borderTopColor: FOREST, borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
              <p style={{ fontSize: 14, color: MUTED }}>Loading resume…</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* Not Found */}
          {notFound && (
            <div style={{ textAlign: "center", padding: "80px 24px", background: "#fff", borderRadius: 10, boxShadow: "0 4px 24px rgba(0,0,0,.07)" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(201,78,42,.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <AlertCircle size={24} color="#C94E2A" />
              </div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: FOREST, marginBottom: 8 }}>Resume not found</h2>
              <p style={{ fontSize: 14, color: MUTED, maxWidth: 320, margin: "0 auto 24px", lineHeight: 1.6 }}>
                This link may have expired or the resume was removed. Ask the owner for an updated link.
              </p>
              <Link href="/auth" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 20px", borderRadius: 6, background: FOREST, color: "#fff", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                Create your own CV <ExternalLink size={13} />
              </Link>
            </div>
          )}

          {/* Resume */}
          {!loading && cv && (
            <>
              <p style={{ textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", fontSize: 9.5, color: MUTED, marginBottom: 14 }}>
                {typeof window !== "undefined" ? window.location.href : ""}
              </p>

              <div style={{ background: "#fff", boxShadow: "0 8px 40px rgba(26,54,40,.12)", borderRadius: 6, overflow: "hidden", fontFamily: FF }}>

                {/* CV Header */}
                <div style={{ background: FOREST, padding: "32px 44px 28px" }}>
                  <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 30, fontWeight: 700, color: "#F8F7F2", margin: 0, letterSpacing: "-0.8px" }}>
                    {displayName}
                  </h1>
                  {cv.data?.experience?.[0]?.role && (
                    <p style={{ fontSize: 11, color: GOLD, margin: "5px 0 14px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      {cv.data.experience[0].role}
                    </p>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 16px", borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 12 }}>
                    {[p?.email, p?.phone, p?.location, p?.linkedin].filter(Boolean).map((v, i) => (
                      <span key={i} style={{ fontSize: 9.5, color: "rgba(248,247,242,.7)" }}>{v}</span>
                    ))}
                  </div>
                </div>

                {/* CV Body */}
                <div style={{ padding: "32px 44px" }}>

                  {p?.summary && (
                    <PubSection title="Profile">
                      <p style={{ fontSize: 10.5, color: "#444", lineHeight: 1.75 }}>{p.summary}</p>
                    </PubSection>
                  )}

                  {(cv.data?.experience?.length ?? 0) > 0 && (
                    <PubSection title="Experience">
                      {cv.data!.experience!.map(exp => (
                        <div key={exp.id} style={{ marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                            <div>
                              <strong style={{ fontSize: 11, color: FOREST }}>{exp.role}</strong>
                              {exp.company && <span style={{ fontSize: 10.5, color: "#555" }}> · {exp.company}</span>}
                            </div>
                            <span style={{ fontSize: 9.5, color: MUTED, fontStyle: "italic" }}>{exp.period}</span>
                          </div>
                          <ul style={{ margin: "5px 0 0", paddingLeft: 16 }}>
                            {exp.bullets?.filter(Boolean).map((b, i) => (
                              <li key={i} style={{ fontSize: 10.5, color: "#444", marginBottom: 3, lineHeight: 1.6 }}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </PubSection>
                  )}

                  {(cv.data?.education?.length ?? 0) > 0 && (
                    <PubSection title="Education">
                      {cv.data!.education!.map(edu => (
                        <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
                          <div>
                            <strong style={{ fontSize: 11, color: FOREST }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</strong>
                            <p style={{ fontSize: 10, color: MUTED, margin: "2px 0 0" }}>{edu.school}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</p>
                          </div>
                          <span style={{ fontSize: 9.5, color: MUTED, fontStyle: "italic", flexShrink: 0, marginLeft: 12 }}>{edu.period}</span>
                        </div>
                      ))}
                    </PubSection>
                  )}

                  {cv.data?.skills?.technical && (
                    <PubSection title="Skills">
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 7px", marginBottom: 6 }}>
                        {cv.data.skills.technical.split(",").filter(s => s.trim()).map((s, i) => (
                          <span key={i} style={{ fontSize: 9.5, background: "#F5F4EF", border: `1px solid ${BORDER}`, borderRadius: 3, padding: "3px 9px", color: "#333", fontWeight: 500 }}>{s.trim()}</span>
                        ))}
                      </div>
                      {cv.data.skills.soft && <p style={{ fontSize: 10, color: "#666", margin: "4px 0 0" }}><strong style={{ color: "#333" }}>Soft Skills:</strong> {cv.data.skills.soft}</p>}
                      {cv.data.skills.languages && <p style={{ fontSize: 10, color: "#666", margin: "3px 0 0" }}><strong style={{ color: "#333" }}>Languages:</strong> {cv.data.skills.languages}</p>}
                    </PubSection>
                  )}

                  {(cv.data?.projects?.length ?? 0) > 0 && (
                    <PubSection title="Projects">
                      {cv.data!.projects!.map(proj => (
                        <div key={proj.id} style={{ marginBottom: 11 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <strong style={{ fontSize: 11, color: FOREST }}>{proj.name}</strong>
                            {proj.tech && <span style={{ fontSize: 9, color: GOLD, fontWeight: 700 }}>{proj.tech}</span>}
                          </div>
                          <p style={{ fontSize: 10, color: "#555", margin: "3px 0 0", lineHeight: 1.6 }}>{proj.description}</p>
                        </div>
                      ))}
                    </PubSection>
                  )}

                  {cv.data?.achievements?.some(a => a.text) && (
                    <PubSection title="Achievements">
                      {cv.data!.achievements!.filter(a => a.text).map((a, i) => (
                        <p key={i} style={{ fontSize: 10.5, color: "#444", margin: "0 0 4px" }}>• {a.text}</p>
                      ))}
                    </PubSection>
                  )}
                </div>
              </div>

              {/* Viewer count + CTA */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, margin: "18px 0 10px" }}>
                <Eye size={12} color={MUTED} />
                <span style={{ fontSize: 11, color: MUTED, fontFamily: "'IBM Plex Mono', monospace" }}>Shared via Folio</span>
              </div>

              <div style={{ padding: "24px 28px", background: "#fff", borderRadius: 8, border: `1px solid ${BORDER}`, textAlign: "center" }}>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700, color: FOREST, marginBottom: 6 }}>Build your own AI-powered CV</p>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 18 }}>Join 250,000+ students who landed jobs using Folio.</p>
                <Link href="/auth" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 22px", borderRadius: 6, background: FOREST, color: "#F8F7F2", textDecoration: "none", fontSize: 13, fontWeight: 700 }}>
                  Get Started Free <ExternalLink size={13} />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function PubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: FOREST, whiteSpace: "nowrap" }}>{title}</span>
        <div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>
      {children}
    </div>
  );
}
