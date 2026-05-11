"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getResumes, getResume, getJobs, type ResumeItem, type JobListing } from "@/lib/api";
import {
  Briefcase, MapPin, Clock, Search, ChevronLeft,
  ExternalLink, AlertCircle, FileText, Sparkles, Zap,
} from "lucide-react";

// ── Premium card palettes ─────────────────────────────────────────────────
const PALETTES = [
  { accent: "#4F46E5", light: "#EEF2FF", shadow: "rgba(79,70,229,0.22)",  ring: "#C7D2FE" },
  { accent: "#0EA5E9", light: "#E0F2FE", shadow: "rgba(14,165,233,0.22)", ring: "#BAE6FD" },
  { accent: "#10B981", light: "#D1FAE5", shadow: "rgba(16,185,129,0.22)", ring: "#A7F3D0" },
  { accent: "#F59E0B", light: "#FEF3C7", shadow: "rgba(245,158,11,0.22)", ring: "#FDE68A" },
  { accent: "#EC4899", light: "#FCE7F3", shadow: "rgba(236,72,153,0.22)", ring: "#FBCFE8" },
  { accent: "#8B5CF6", light: "#EDE9FE", shadow: "rgba(139,92,246,0.22)", ring: "#DDD6FE" },
];

// ── 3D Job Card ───────────────────────────────────────────────────────────
function JobCard3D({ job, index }: { job: JobListing; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);
  const pal = PALETTES[index % PALETTES.length];

  const initials = (job.company || "?")
    .split(" ").slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("") || "?";

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setTilt({
      x: -((e.clientY - (r.top  + r.height / 2)) / (r.height / 2)) * 14,
      y:  ((e.clientX - (r.left + r.width  / 2)) / (r.width  / 2)) * 14,
    });
    setGlare({
      x: ((e.clientX - r.left) / r.width)  * 100,
      y: ((e.clientY - r.top)  / r.height) * 100,
    });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(${hovered ? 24 : 0}px)`,
        transition: hovered
          ? "transform 0.08s ease, box-shadow 0.2s ease"
          : "transform 0.6s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease",
        transformStyle: "preserve-3d",
        position: "relative",
        background: "#FFFFFF",
        borderRadius: 24,
        padding: "28px 24px 22px",
        display: "flex",
        flexDirection: "column",
        border: `1.5px solid ${hovered ? pal.ring : "rgba(0,0,0,0.07)"}`,
        boxShadow: hovered
          ? `0 28px 64px ${pal.shadow}, 0 8px 24px rgba(0,0,0,0.06), inset 0 1px 0 #FFFFFF`
          : "0 2px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 #FFFFFF",
        overflow: "hidden",
        willChange: "transform",
        cursor: "default",
        minHeight: 220,
      }}
    >
      {/* Gradient top stripe */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${pal.accent}, ${pal.ring})`,
        opacity: hovered ? 1 : 0.5,
        transition: "opacity 0.3s",
      }} />

      {/* Sheen overlay */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: 24, pointerEvents: "none",
        background: `radial-gradient(ellipse at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.65) 0%, transparent 55%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.25s",
      }} />

      {/* Side glow bar */}
      <div style={{
        position: "absolute", left: 0, top: "20%", bottom: "20%", width: 3,
        background: `linear-gradient(180deg, transparent, ${pal.accent}, transparent)`,
        opacity: hovered ? 0.8 : 0,
        transition: "opacity 0.3s",
        borderRadius: "0 2px 2px 0",
      }} />

      {/* Avatar */}
      <div style={{
        width: 52, height: 52, borderRadius: 16, flexShrink: 0,
        background: `linear-gradient(135deg, ${pal.light}, ${pal.ring}55)`,
        border: `1.5px solid ${pal.ring}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 17, fontWeight: 800, color: pal.accent,
        marginBottom: 16,
        transform: "translateZ(12px)",
        boxShadow: hovered ? `0 8px 24px ${pal.shadow}` : `0 2px 8px ${pal.shadow}`,
        transition: "box-shadow 0.3s",
        position: "relative", zIndex: 1,
      }}>
        {initials}
      </div>

      {/* Title + company */}
      <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
        <h3 style={{
          fontSize: 15.5, fontWeight: 700, color: "#111827",
          margin: "0 0 5px", lineHeight: 1.35,
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any,
        }}>
          {job.title}
        </h3>
        <p style={{ fontSize: 13, fontWeight: 600, color: pal.accent, margin: "0 0 14px", opacity: 0.9 }}>
          {job.company}
        </p>

        {/* Chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
          {job.location && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11.5, fontWeight: 600, color: "#6B7280",
              background: "#F3F4F6", borderRadius: 20,
              padding: "4px 10px",
            }}>
              <MapPin size={11} /> {job.location}
            </span>
          )}
          {job.time && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 11.5, fontWeight: 600, color: "#6B7280",
              background: "#F3F4F6", borderRadius: 20,
              padding: "4px 10px",
            }}>
              <Clock size={11} /> {job.time}
            </span>
          )}
        </div>
      </div>

      {/* CTA */}
      <a
        href={job.link} target="_blank" rel="noreferrer"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "11px 0",
          background: `linear-gradient(135deg, ${pal.accent}, ${pal.accent}CC)`,
          borderRadius: 14,
          color: "#fff",
          fontSize: 13, fontWeight: 700,
          textDecoration: "none",
          transform: "translateZ(8px)",
          position: "relative", zIndex: 1,
          boxShadow: hovered ? `0 6px 20px ${pal.shadow}` : `0 2px 8px ${pal.shadow}`,
          transition: "all 0.2s",
          letterSpacing: "0.01em",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateZ(8px) scale(1.02)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.transform = "translateZ(8px) scale(1)";
        }}
      >
        Apply Now <ExternalLink size={13} />
      </a>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function JobsPage() {
  const { user, loading: authLoading } = useAuth();

  const [resumes, setResumes]           = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedId] = useState<string>("");
  const [jobs, setJobs]                 = useState<JobListing[]>([]);
  const [jobSource, setJobSource]       = useState<string>("");
  const [loadingJobs, setLoadingJobs]   = useState(false);
  const [error, setError]               = useState("");
  const [searchQuery, setSearchQuery]   = useState("");
  const [location, setLocation]         = useState("India");
  const [inputFocused, setInputFocused] = useState(false);
  const [locFocused, setLocFocused]     = useState(false);

  useEffect(() => {
    if (user) {
      getResumes().then(data => {
        setResumes(data);
        if (data.length > 0) setSelectedId(String(data[0].id));
      }).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedResumeId) return;
    let active = true;
    (async () => {
      try {
        setLoadingJobs(true);
        setError("");
        const cv = await getResume(selectedResumeId);
        let query = "Software Engineer";
        if (cv.data) {
          const d = cv.data as any;
          const role = d.experience?.[0]?.role;
          if (role) {
            query = role;
            const top = d.skills?.technical?.split(",")[0]?.trim();
            if (top && !role.toLowerCase().includes(top.toLowerCase())) query += ` ${top}`;
          } else if (d.personal?.name) query = d.personal.name;
        } else if (cv.title) query = cv.title;
        if (active) {
          setSearchQuery(query);
          const r = await getJobs(query, location);
          setJobs(r.jobs);
          setJobSource(r.source);
        }
      } catch (e: any) {
        if (active) setError(e.message || "Failed to find matching jobs.");
      } finally {
        if (active) setLoadingJobs(false);
      }
    })();
    return () => { active = false; };
  }, [selectedResumeId]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoadingJobs(true);
    setError("");
    try {
      const r = await getJobs(searchQuery, location);
      setJobs(r.jobs);
      setJobSource(r.source);
    } catch (e: any) {
      setError(e.message || "Search failed.");
    } finally {
      setLoadingJobs(false);
    }
  };

  if (authLoading) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F7F9FF",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      color: "#111827",
    }}>

      {/* ── Background depth layers ── */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.07) 1px, transparent 0)",
        backgroundSize: "32px 32px",
      }} />
      <div style={{
        position: "fixed", top: "-200px", right: "-100px",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "-200px", left: "-100px",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* ── Sticky nav ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(247,249,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "0 32px",
        height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 0 rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/dashboard" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 34, height: 34, borderRadius: 10,
            background: "#FFFFFF",
            border: "1.5px solid #E5E7EB",
            color: "#6B7280", textDecoration: "none",
            boxShadow: "0 1px 4px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
            transition: "all 0.18s",
          }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#C7D2FE";
              el.style.background = "#EEF2FF";
              el.style.color = "#4F46E5";
              el.style.boxShadow = "0 2px 8px rgba(79,70,229,0.15), inset 0 1px 0 rgba(255,255,255,0.9)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "#E5E7EB";
              el.style.background = "#FFFFFF";
              el.style.color = "#6B7280";
              el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)";
            }}
          >
            <ChevronLeft size={17} />
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(79,70,229,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}>
              <Briefcase size={16} color="#fff" />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#111827", letterSpacing: "-0.3px" }}>
              Smart Job Match
            </span>
          </div>
        </div>

      </header>

      {/* ── Hero ── */}
      <div style={{
        background: "linear-gradient(135deg, #FFFFFF 0%, #F0F4FF 100%)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "48px 32px 40px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Hero background glow */}
        <div style={{
          position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)",
          width: 800, height: 300,
          background: "radial-gradient(ellipse, rgba(79,70,229,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Label */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#EEF2FF", border: "1.5px solid #C7D2FE",
            borderRadius: 20, padding: "5px 14px",
            fontSize: 12, fontWeight: 700, color: "#4F46E5",
            marginBottom: 16, letterSpacing: "0.04em",
          }}>
            <Zap size={11} fill="#4F46E5" /> AI-POWERED · LIVE LISTINGS
          </div>

          <h1 style={{
            fontSize: 36, fontWeight: 900, color: "#111827",
            margin: "0 0 10px", letterSpacing: "-0.8px", lineHeight: 1.15,
          }}>
            Jobs matched to{" "}
            <span style={{
              background: "linear-gradient(135deg, #4F46E5, #7C3AED)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              your CV
            </span>
          </h1>
          <p style={{ fontSize: 15, color: "#6B7280", margin: 0, maxWidth: 520, lineHeight: 1.6 }}>
            We analyse your CV, extract your top skills and role, then surface the best live opportunities near you.
          </p>
        </div>
      </div>

      <main style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "36px 24px 80px",
        display: "flex", flexDirection: "column", gap: 28,
        position: "relative", zIndex: 1,
      }}>

        {/* ── Search Panel ── */}
        <div style={{
          background: "#FFFFFF",
          borderRadius: 24,
          border: "1.5px solid rgba(0,0,0,0.07)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 #FFFFFF",
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Top accent */}
          <div style={{
            height: 3,
            background: "linear-gradient(90deg, #4F46E5, #7C3AED, #EC4899)",
          }} />

          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 18 }}>
              <Sparkles size={13} color="#A5B4FC" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.09em" }}>
                Search Configuration
              </span>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>

              {/* CV picker */}
              <div style={{ flex: "1 1 220px" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  Base On CV
                </label>
                <div style={{ position: "relative" }}>
                  <FileText size={14} color="#9CA3AF" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                  <select
                    value={selectedResumeId}
                    onChange={e => setSelectedId(e.target.value)}
                    style={{
                      width: "100%", padding: "11px 12px 11px 34px",
                      borderRadius: 12, border: "1.5px solid #E5E7EB",
                      fontSize: 13.5, fontWeight: 500, color: "#111827",
                      appearance: "none", background: "#FAFAFA",
                      outline: "none", cursor: "pointer",
                      boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
                      transition: "border-color 0.18s, box-shadow 0.18s",
                    }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = "#A5B4FC";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1), inset 0 1px 3px rgba(0,0,0,0.04)";
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = "#E5E7EB";
                      e.currentTarget.style.boxShadow = "inset 0 1px 3px rgba(0,0,0,0.04)";
                    }}
                  >
                    {resumes.length === 0 && <option value="">No CVs found</option>}
                    {resumes.map(r => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role search */}
              <form onSubmit={handleSearch} style={{ flex: "2 1 380px", display: "flex", gap: 10, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    Role & Skills <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "#C4B5FD" }}>(auto-extracted)</span>
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="e.g. Frontend Developer React"
                    style={{
                      width: "100%", padding: "11px 14px",
                      borderRadius: 12,
                      border: `1.5px solid ${inputFocused ? "#A5B4FC" : "#E5E7EB"}`,
                      fontSize: 13.5, fontWeight: 500, color: "#111827",
                      background: "#FAFAFA", outline: "none",
                      boxShadow: inputFocused
                        ? "0 0 0 3px rgba(79,70,229,0.1), inset 0 1px 3px rgba(0,0,0,0.03)"
                        : "inset 0 1px 3px rgba(0,0,0,0.03)",
                      transition: "border-color 0.18s, box-shadow 0.18s",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Location input */}
                <div style={{ flex: "0 0 130px" }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    onFocus={() => setLocFocused(true)}
                    onBlur={() => setLocFocused(false)}
                    placeholder="e.g. India"
                    style={{
                      width: "100%", padding: "11px 14px",
                      borderRadius: 12,
                      border: `1.5px solid ${locFocused ? "#A5B4FC" : "#E5E7EB"}`,
                      fontSize: 13.5, fontWeight: 500, color: "#111827",
                      background: "#FAFAFA", outline: "none",
                      boxShadow: locFocused
                        ? "0 0 0 3px rgba(79,70,229,0.1), inset 0 1px 3px rgba(0,0,0,0.03)"
                        : "inset 0 1px 3px rgba(0,0,0,0.03)",
                      transition: "border-color 0.18s, box-shadow 0.18s",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingJobs}
                  style={{
                    height: 42, padding: "0 24px", flexShrink: 0,
                    borderRadius: 12,
                    background: loadingJobs
                      ? "#C7D2FE"
                      : "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                    color: "#fff", border: "none",
                    fontSize: 13.5, fontWeight: 700,
                    cursor: loadingJobs ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 7,
                    boxShadow: loadingJobs
                      ? "none"
                      : "0 4px 16px rgba(79,70,229,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                    transition: "all 0.18s",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={e => {
                    if (!loadingJobs) {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.transform = "translateY(-1px)";
                      el.style.boxShadow = "0 8px 24px rgba(79,70,229,0.45), inset 0 1px 0 rgba(255,255,255,0.2)";
                    }
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.transform = "";
                    el.style.boxShadow = loadingJobs ? "none" : "0 4px 16px rgba(79,70,229,0.4), inset 0 1px 0 rgba(255,255,255,0.2)";
                  }}
                >
                  <Search size={15} />
                  {loadingJobs ? "Searching..." : "Search"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Results header ── */}
        {!loadingJobs && (jobs.length > 0 || error) && (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {jobs.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: jobSource === "linkedin" ? "#4F46E5" : "#10B981",
                    boxShadow: jobSource === "linkedin" ? "0 0 0 3px rgba(79,70,229,0.2)" : "0 0 0 3px rgba(16,185,129,0.2)",
                    animation: "pulse 2s ease-in-out infinite",
                  }} />
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#111827" }}>
                    {jobs.length} opportunities{location ? ` in ${location}` : ""}
                  </span>
                </div>
                <div style={{ height: 16, width: 1, background: "#E5E7EB" }} />
                <span style={{ fontSize: 12.5, color: "#9CA3AF", fontWeight: 500 }}>
                  via {jobSource === "linkedin" ? "LinkedIn" : jobSource === "naukri" ? "Naukri" : "Live"}
                </span>
              </>
            )}
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #E5E7EB, transparent)", marginLeft: 4 }} />
          </div>
        )}

        {/* ── Loading ── */}
        {loadingJobs && (
          <div style={{
            textAlign: "center", padding: "90px 20px",
            background: "#FFFFFF",
            borderRadius: 24,
            border: "1.5px solid rgba(0,0,0,0.07)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}>
            {/* 3-ring orbital loader */}
            <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 30px" }}>
              <div style={{
                position: "absolute", inset: 0,
                border: "2.5px solid #E0E7FF",
                borderTopColor: "#4F46E5",
                borderRadius: "50%",
                animation: "spin 0.9s linear infinite",
              }} />
              <div style={{
                position: "absolute", inset: 11,
                border: "2px solid #EDE9FE",
                borderBottomColor: "#7C3AED",
                borderRadius: "50%",
                animation: "spin 1.4s linear infinite reverse",
              }} />
              <div style={{
                position: "absolute", inset: 22,
                border: "1.5px solid #FCE7F3",
                borderLeftColor: "#EC4899",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 8px", letterSpacing: "-0.2px" }}>
              Finding your perfect roles
            </p>
            <p style={{ fontSize: 13.5, color: "#9CA3AF", margin: 0 }}>
              Analysing your CV · Searching India job boards
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {!loadingJobs && error && (
          <div style={{
            padding: "32px", textAlign: "center",
            background: "#FFF5F5",
            borderRadius: 20,
            border: "1.5px solid #FED7D7",
            boxShadow: "0 4px 20px rgba(239,68,68,0.08)",
          }}>
            <AlertCircle size={30} color="#EF4444" style={{ margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: "#DC2626", margin: "0 0 4px" }}>Something went wrong</p>
            <p style={{ fontSize: 13, color: "#F87171", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* ── Empty ── */}
        {!loadingJobs && !error && jobs.length === 0 && resumes.length > 0 && (
          <div style={{
            textAlign: "center", padding: "90px 20px",
            background: "#FFFFFF", borderRadius: 24,
            border: "1.5px solid rgba(0,0,0,0.07)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: "#F3F4F6",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <Search size={28} color="#D1D5DB" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>No matches found</p>
            <p style={{ fontSize: 13.5, color: "#9CA3AF", margin: 0 }}>
              Try broadening your role or skills query above.
            </p>
          </div>
        )}

        {/* ── 3D Card Grid ── */}
        {!loadingJobs && !error && jobs.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}>
            {jobs.map((job, i) => (
              <JobCard3D key={i} job={job} index={i} />
            ))}
          </div>
        )}

        {/* ── Explore more ── */}
        {!loadingJobs && !error && (
          <div style={{
            padding: "28px 32px",
            background: "#FFFFFF",
            borderRadius: 22,
            border: "1.5px solid rgba(0,0,0,0.07)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16,
            position: "relative", overflow: "hidden",
          }}>
            {/* Subtle bottom gradient accent */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
              background: "linear-gradient(90deg, #4F46E5, #EC4899, #F59E0B)",
              opacity: 0.4,
            }} />

            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
                Want to search more?
              </p>
              <p style={{ fontSize: 12.5, color: "#9CA3AF", margin: 0 }}>
                Your smart query is pre-filled on India's top boards.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                {
                  href: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(searchQuery)}&location=India&geoId=102713980`,
                  label: "LinkedIn India",
                  badge: "in", badgeColor: "#0A66C2",
                  bg: "#EFF6FF", border: "#BFDBFE", text: "#1D4ED8",
                  hoverBg: "#DBEAFE", hoverShadow: "rgba(37,99,235,0.2)",
                },
                {
                  href: `https://www.naukri.com/${searchQuery.replace(/[^a-zA-Z0-9]/g, "-")}-jobs-in-india`,
                  label: "Naukri",
                  badge: "N", badgeColor: "#275DF5",
                  bg: "#EEF2FF", border: "#C7D2FE", text: "#4338CA",
                  hoverBg: "#E0E7FF", hoverShadow: "rgba(99,102,241,0.2)",
                },
                {
                  href: `https://internshala.com/jobs/keywords-${encodeURIComponent(searchQuery)}`,
                  label: "Internshala",
                  badge: "i", badgeColor: "#059669",
                  bg: "#F0FDF4", border: "#A7F3D0", text: "#065F46",
                  hoverBg: "#DCFCE7", hoverShadow: "rgba(16,185,129,0.2)",
                },
              ].map(btn => (
                <a
                  key={btn.label}
                  href={btn.href}
                  target="_blank" rel="noreferrer"
                  style={{
                    display: "flex", alignItems: "center", gap: 7,
                    padding: "9px 18px", borderRadius: 12,
                    border: `1.5px solid ${btn.border}`,
                    background: btn.bg,
                    color: btn.text, textDecoration: "none",
                    fontWeight: 600, fontSize: 13,
                    transition: "all 0.18s",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = btn.hoverBg;
                    el.style.transform = "translateY(-1px)";
                    el.style.boxShadow = `0 6px 18px ${btn.hoverShadow}`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.background = btn.bg;
                    el.style.transform = "";
                    el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
                  }}
                >
                  <span style={{ fontWeight: 900, color: btn.badgeColor, fontSize: 15 }}>{btn.badge}</span>
                  {btn.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100% { opacity:.5; } 50% { opacity:1; } }
        * { box-sizing: border-box; }
        ::placeholder { color: #D1D5DB; }
        -webkit-line-clamp { -webkit-line-clamp: 2; }
      `}} />
    </div>
  );
}
