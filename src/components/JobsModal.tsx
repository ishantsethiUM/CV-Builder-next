import React, { useEffect, useState } from "react";
import { X, ExternalLink, MapPin, Clock, Search, AlertCircle, Sparkles, TrendingUp } from "lucide-react";
import { getJobs, type JobListing } from "@/lib/api";

const COLORS = [
  ["#6366F1", "#EEF2FF"],
  ["#0EA5E9", "#E0F2FE"],
  ["#10B981", "#D1FAE5"],
  ["#F59E0B", "#FEF3C7"],
  ["#EC4899", "#FCE7F3"],
  ["#8B5CF6", "#EDE9FE"],
];

function CompanyAvatar({ name, index }: { name: string; index: number }) {
  const [fg, bg] = COLORS[index % COLORS.length];
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 10, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 14, fontWeight: 800, color: fg, flexShrink: 0,
      border: `1px solid ${fg}22`,
    }}>
      {initials || "?"}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ border: "1px solid #E2E8F0", borderRadius: 14, padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F1F5F9", flexShrink: 0 }} className="shimmer" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ height: 14, width: "60%", borderRadius: 6, background: "#F1F5F9" }} className="shimmer" />
        <div style={{ height: 12, width: "40%", borderRadius: 6, background: "#F1F5F9" }} className="shimmer" />
        <div style={{ height: 11, width: "30%", borderRadius: 6, background: "#F1F5F9" }} className="shimmer" />
      </div>
      <div style={{ width: 70, height: 32, borderRadius: 8, background: "#F1F5F9", flexShrink: 0 }} className="shimmer" />
    </div>
  );
}

export default function JobsModal({ query, onClose }: { query: string; onClose: () => void }) {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [jobSource, setJobSource] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  useEffect(() => {
    let active = true;
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getJobs(query);
        if (active) { setJobs(data.jobs); setJobSource(data.source); }
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load jobs");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchJobs();
    return () => { active = false; };
  }, [query]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px",
        background: "rgba(8, 15, 35, 0.72)",
        backdropFilter: "blur(8px)",
        transition: "opacity 0.2s",
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 560,
          display: "flex", flexDirection: "column", maxHeight: "88vh",
          borderRadius: 20,
          background: "#FFFFFF",
          boxShadow: "0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.08)",
          overflow: "hidden",
          transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
          transition: "transform 0.25s cubic-bezier(0.34,1.2,0.64,1), opacity 0.2s",
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Header */}
        <div style={{
          padding: "22px 24px 18px",
          background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)",
          position: "relative", overflow: "hidden",
        }}>
          {/* Decorative blobs */}
          <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -40, left: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={16} color="#fff" />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  CV Saved — Smart Job Match
                </span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.25 }}>
                Jobs matched for
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, color: "#fff",
                  background: "rgba(255,255,255,0.18)", borderRadius: 6,
                  padding: "3px 10px", border: "1px solid rgba(255,255,255,0.25)",
                  maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  display: "inline-block",
                }}>
                  {query}
                </span>
                {!loading && jobs.length > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.22)", borderRadius: 20, padding: "2px 10px" }}>
                    {jobs.length} found
                  </span>
                )}
                <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "2px 8px", display: "flex", alignItems: "center", gap: 4 }}>
                  🇮🇳 India · {jobSource === "naukri" ? "Naukri" : jobSource === "linkedin" ? "LinkedIn" : "Live"}
                </span>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", color: "#fff", padding: 6, borderRadius: 8, display: "flex", transition: "background 0.15s", flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10, background: "#F8FAFF" }}>

          {loading && [0, 1, 2].map(i => <SkeletonCard key={i} />)}

          {!loading && error && (
            <div style={{ padding: "32px 20px", textAlign: "center", background: "#FFF5F5", borderRadius: 12, border: "1px solid #FED7D7" }}>
              <AlertCircle size={32} color="#E53E3E" style={{ margin: "0 auto 12px", display: "block" }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: "#C53030", margin: 0 }}>{error}</p>
              <p style={{ fontSize: 13, color: "#718096", marginTop: 6 }}>Try again or search manually below.</p>
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <Search size={24} color="#6366F1" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", margin: 0 }}>No exact matches found</p>
              <p style={{ fontSize: 13, color: "#64748B", marginTop: 6 }}>Try updating your job title or skills in the CV.</p>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && jobs.map((job, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #E2E8F0", borderRadius: 14, padding: "14px 16px",
                display: "flex", alignItems: "center", gap: 14,
                background: "#fff", cursor: "default",
                transition: "all 0.18s",
                animation: `fadeSlideIn 0.35s ${i * 0.06}s both`,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,99,235,0.1)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
            >
              <CompanyAvatar name={job.company || job.title} index={i} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {job.title}
                  </h3>
                  {i < 3 && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#D97706", background: "#FEF3C7", borderRadius: 4, padding: "1px 6px", flexShrink: 0 }}>
                      TOP
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#2563EB", margin: "0 0 6px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {job.company}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  {job.location && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748B" }}>
                      <MapPin size={11} /> {job.location}
                    </span>
                  )}
                  {job.time && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#64748B" }}>
                      <Clock size={11} /> {job.time}
                    </span>
                  )}
                </div>
              </div>

              <a
                href={job.link}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "7px 14px", borderRadius: 8,
                  background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                  textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
                  transition: "opacity 0.15s, transform 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "scale(1.03)"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                Apply <ExternalLink size={11} />
              </a>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 20px", background: "#fff", borderTop: "1px solid #E2E8F0", display: "flex", flexDirection: "column", gap: 12 }}>

          <a
            href="/jobs"
            onClick={handleClose}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "12px", borderRadius: 10,
              background: "linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)",
              color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.92"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <TrendingUp size={16} /> View Full Smart Job Board
          </a>

          <div>
            <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 8px 0", fontWeight: 600, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Also search on
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <a
                href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=India`}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "10px 12px", borderRadius: 10,
                  background: "#EBF5FB", border: "1px solid #BFDBFE",
                  color: "#0A66C2", fontSize: 13, fontWeight: 700, textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#DBEAFE"}
                onMouseLeave={e => e.currentTarget.style.background = "#EBF5FB"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </a>
              <a
                href={`https://www.naukri.com/${query.replace(/[^a-zA-Z0-9]/g, "-")}-jobs-in-india`}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "10px 12px", borderRadius: 10,
                  background: "#EEF2FF", border: "1px solid #C7D2FE",
                  color: "#275DF5", fontSize: 13, fontWeight: 700, textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#E0E7FF"}
                onMouseLeave={e => e.currentTarget.style.background = "#EEF2FF"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#275DF5"/><text x="12" y="17" textAnchor="middle" fill="white" fontSize="13" fontWeight="800" fontFamily="sans-serif">N</text></svg>
                Naukri
              </a>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .shimmer {
          background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite linear;
        }
      `}} />
    </div>
  );
}
