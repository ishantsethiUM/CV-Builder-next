"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createResume, updateResume, getResume, aiBullets, aiImprove, aiATS } from "@/lib/api";
import { useCredits } from "@/contexts/CreditsContext";
import {
  FileText, ChevronLeft, Save, Download, Sparkles,
  BarChart2, Plus, Trash2, X, Check, AlertCircle,
  Eye, EyeOff, ChevronDown, ChevronUp, Layout, GripVertical
} from "lucide-react";

// Types
type CV = {
  personal: { name: string; email: string; phone: string; location: string; linkedin: string; github: string; website: string; summary: string };
  experience: { id: string; company: string; role: string; period: string; location: string; bullets: string[] }[];
  education: { id: string; school: string; degree: string; field: string; period: string; gpa: string; honors: string }[];
  skills: { technical: string; soft: string; languages: string; certifications: string };
  skillLevels: Record<string, number>; // skill name → 1-5 stars
  projects: { id: string; name: string; tech: string; url: string; description: string }[];
  achievements: { id: string; text: string }[];
};

const INIT: CV = {
  personal: { name: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "", summary: "" },
  experience: [], education: [],
  skills: { technical: "", soft: "", languages: "", certifications: "" },
  skillLevels: {},
  projects: [], achievements: [],
};


const TEMPLATES = [
  { id: "Minimal",   label: "Minimal"   },
  { id: "Nova",      label: "Nova"      },
  { id: "Classic",   label: "Classic"   },
  { id: "Executive", label: "Executive" },
  { id: "Chicago",   label: "Chicago"   },
  { id: "Compact",   label: "Compact"   },
  { id: "Slate",     label: "Slate"     },
  { id: "Sidebar",   label: "Sidebar"   },
];

// Brand-aligned theme constants
const THEME = {
  primary: "#0F172A",    // --forest (deep navy)
  gold: "#2563EB",       // --gold (royal blue)
  darkBg: "#1E293B",     // --charcoal
  surface: "#FFFFFF",    // --white
  background: "#F8FAFF", // --cream
  border: "#E2E8F0",     // --border
  textMain: "#0F172A",   // --ink
  textMuted: "#64748B",  // --muted
  danger: "#DC2626",     // --ember
  success: "#10B981",    // green
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
};

// ── Click-to-edit inline component ───────────────────────────────────────────
type SetCV = React.Dispatch<React.SetStateAction<CV>>;

function EditableSpan({
  value, style, placeholder = "", className
}: {
  value: string; onChange?: (v: string) => void; style?: React.CSSProperties;
  placeholder?: string; multiline?: boolean; className?: string;
}) {
  // Read-only — editing is done through the left panel only
  return (
    <span style={{ ...style }} className={className}>
      {value || (placeholder ? <span style={{ color: "#bbb", fontStyle: "italic", fontWeight: 400 }}>{placeholder}</span> : null)}
    </span>
  );
}

// ── Tag input component (individual chips, no commas) ────────────────────────
function TagInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [draft, setDraft] = React.useState("");
  const tags = value.split(",").map(s => s.trim()).filter(Boolean);

  const addTag = (raw: string) => {
    const t = raw.trim().replace(/,/g, "");
    if (!t || tags.includes(t)) { setDraft(""); return; }
    onChange([...tags, t].join(", "));
    setDraft("");
  };

  const removeTag = (tag: string) => onChange(tags.filter(t => t !== tag).join(", "));

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(draft); }
    if (e.key === "Backspace" && !draft && tags.length) removeTag(tags[tags.length - 1]);
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "8px 10px", border: "1px solid #D1D5DB", borderRadius: 6, background: "#fff", minHeight: 42, alignItems: "center", cursor: "text" }}
      onClick={e => (e.currentTarget.querySelector("input") as HTMLInputElement)?.focus()}>
      {tags.map(tag => (
        <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", background: "#EDE9FE", color: "#5B21B6", borderRadius: 99, fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>
          {tag}
          <button onClick={e => { e.stopPropagation(); removeTag(tag); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, color: "#7C3AED", fontSize: 14 }}>×</button>
        </span>
      ))}
      <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={handleKey} onBlur={() => { if (draft.trim()) addTag(draft); }}
        placeholder={tags.length ? "" : placeholder} style={{ border: "none", outline: "none", fontSize: 13, color: "#374151", background: "transparent", minWidth: 120, flex: 1 }} />
    </div>
  );
}

// ── Shared section heading helpers used across templates ─────────────────────
function RuleHead({ title, color = "#1A3628", line = "#E2DFD6" }: { title: string; color?: string; line?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
      <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color, whiteSpace: "nowrap" }}>{title}</span>
      <div style={{ flex: 1, height: 1, background: line }} />
    </div>
  );
}

// ── 1. EXECUTIVE ─────────────────────────────────────────────────────────────
function ExecutivePreview({ cv, setCV }: { cv: CV; setCV: SetCV }) {
  const p = cv.personal;
  const role = cv.experience[0]?.role || "";
  const upP = (f: keyof CV["personal"], v: string) => setCV(c => ({ ...c, personal: { ...c.personal, [f]: v } }));
  return (
    <div style={{ background: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 10.5, lineHeight: 1.5 }}>
      {/* Dark header */}
      <div style={{ background: "#1A3628", padding: "30px 44px 26px" }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 30, fontWeight: 700, color: "#F8F7F2", margin: 0, letterSpacing: "-0.8px" }}>
          <EditableSpan value={p.name} onChange={v => upP("name", v)} placeholder="Your Name" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 30, fontWeight: 700, color: "#F8F7F2", letterSpacing: "-0.8px" }} />
        </h1>
        {role && <p style={{ fontSize: 11, color: "#C9A96E", margin: "5px 0 14px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>{role}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 20px", borderTop: "1px solid rgba(255,255,255,.15)", paddingTop: 12 }}>
          {(["email","phone","location","linkedin","github","website"] as const).filter(f => p[f]).map((f,i) => (
            <EditableSpan key={i} value={p[f]} onChange={v => upP(f, v)} style={{ fontSize: 9, color: "rgba(248,247,242,.7)" }} />
          ))}
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: "28px 44px" }}>
        {p.summary !== undefined && <div style={{ marginBottom: 18 }}><RuleHead title="Profile" /><EditableSpan value={p.summary} onChange={v => upP("summary", v)} multiline placeholder="Write a brief professional summary…" style={{ fontSize: 10.5, color: "#444", lineHeight: 1.75, display: "block", width: "100%" }} /></div>}

        {cv.experience.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <RuleHead title="Experience" />
            {cv.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <strong style={{ fontSize: 11, color: "#1A3628" }}>{exp.role}</strong>
                    {exp.company && <span style={{ fontSize: 10.5, color: "#555", fontWeight: 400 }}> · {exp.company}</span>}
                    {exp.location && <span style={{ fontSize: 10, color: "#888" }}> · {exp.location}</span>}
                  </div>
                  <span style={{ fontSize: 9.5, color: "#888", fontStyle: "italic", flexShrink: 0, marginLeft: 10 }}>{exp.period}</span>
                </div>
                <ul style={{ margin: "5px 0 0", paddingLeft: 16 }}>
                  {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: 10, color: "#444", marginBottom: 3, lineHeight: 1.6 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {cv.education.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <RuleHead title="Education" />
            {cv.education.map(edu => (
              <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}>
                <div>
                  <strong style={{ fontSize: 11, color: "#1A3628" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</strong>
                  <p style={{ fontSize: 10, color: "#666", margin: "2px 0 0" }}>{edu.school}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}{edu.honors ? ` · ${edu.honors}` : ""}</p>
                </div>
                <span style={{ fontSize: 9.5, color: "#888", fontStyle: "italic", flexShrink: 0, marginLeft: 10 }}>{edu.period}</span>
              </div>
            ))}
          </div>
        )}

        {cv.skills.technical && (
          <div style={{ marginBottom: 18 }}>
            <RuleHead title="Skills" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px", marginBottom: 6 }}>
              {cv.skills.technical.split(",").filter(s => s.trim()).map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, color: "#333" }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#C9A96E", flexShrink: 0 }} />
                  {s.trim()}
                </div>
              ))}
            </div>
            {cv.skills.soft && <p style={{ fontSize: 10, color: "#666", margin: "4px 0 0" }}><strong style={{ color: "#333" }}>Soft:</strong> {cv.skills.soft}</p>}
            {cv.skills.languages && <p style={{ fontSize: 10, color: "#666", margin: "3px 0 0" }}><strong style={{ color: "#333" }}>Languages:</strong> {cv.skills.languages}</p>}
            {cv.skills.certifications && <p style={{ fontSize: 10, color: "#666", margin: "3px 0 0" }}><strong style={{ color: "#333" }}>Certifications:</strong> {cv.skills.certifications}</p>}
          </div>
        )}

        {cv.projects.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <RuleHead title="Projects" />
            {cv.projects.map(proj => (
              <div key={proj.id} style={{ marginBottom: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: 11, color: "#1A3628" }}>{proj.name}</strong>
                  {proj.tech && <span style={{ fontSize: 9, color: "#C9A96E", fontWeight: 700, letterSpacing: "0.05em" }}>{proj.tech}</span>}
                </div>
                {proj.url && <p style={{ fontSize: 9, color: "#888", margin: "1px 0 2px" }}>{proj.url}</p>}
                <p style={{ fontSize: 10, color: "#555", margin: "3px 0 0", lineHeight: 1.6 }}>{proj.description}</p>
              </div>
            ))}
          </div>
        )}

        {cv.achievements.some(a => a.text) && (
          <div style={{ marginBottom: 18 }}>
            <RuleHead title="Achievements" />
            {cv.achievements.filter(a => a.text).map((a, i) => (
              <p key={i} style={{ fontSize: 10, color: "#444", margin: "0 0 4px" }}>• {a.text}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 2. CHICAGO ───────────────────────────────────────────────────────────────
function ChicagoPreview({ cv, setCV }: { cv: CV; setCV: SetCV }) {
  const p = cv.personal;
  const upP = (f: keyof CV["personal"], v: string) => setCV(c => ({ ...c, personal: { ...c.personal, [f]: v } }));
  return (
    <div style={{ background: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 10.5, lineHeight: 1.5, padding: "38px 46px" }}>
      {/* Header */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: "#111110", margin: 0, letterSpacing: "-2px", lineHeight: 1 }}>
          <EditableSpan value={p.name} onChange={v => upP("name", v)} placeholder="YOUR NAME" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: "#111110", letterSpacing: "-2px" }} />
        </h1>
        {cv.experience[0]?.role && (
          <p style={{ fontSize: 12, color: "#74746A", margin: "6px 0 0", fontWeight: 400, letterSpacing: "0" }}>{cv.experience[0].role}</p>
        )}
        <div style={{ margin: "12px 0", height: 2, background: "#111110" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 18px", paddingBottom: 10, borderBottom: "1px solid #E2DFD6" }}>
          {(["email","phone","location","linkedin","github","website"] as const).filter(f => p[f]).map((f, i) => (
            <EditableSpan key={i} value={p[f]} onChange={v => upP(f, v)} style={{ fontSize: 9.5, color: "#74746A" }} />
          ))}
        </div>
      </div>

      {/* Sections — left gold border accent */}
      {p.summary && (
        <ChiSection title="Profile">
          <EditableSpan value={p.summary} onChange={v => upP("summary", v)} multiline placeholder="Write a brief professional summary…" style={{ fontSize: 10.5, color: "#444", lineHeight: 1.75, display: "block", width: "100%" }} />
        </ChiSection>
      )}

      {cv.experience.length > 0 && (
        <ChiSection title="Experience">
          {cv.experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <strong style={{ fontSize: 11.5, color: "#111110" }}>{exp.role}</strong>
                  {exp.company && <span style={{ fontSize: 10.5, color: "#C9A96E", fontWeight: 600 }}> — {exp.company}</span>}
                </div>
                <span style={{ fontSize: 9.5, color: "#74746A", fontStyle: "italic", flexShrink: 0 }}>{exp.period}</span>
              </div>
              {exp.location && <p style={{ fontSize: 9.5, color: "#888", margin: "1px 0 3px" }}>{exp.location}</p>}
              <ul style={{ margin: "5px 0 0", paddingLeft: 16 }}>
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: 10.5, color: "#444", marginBottom: 3, lineHeight: 1.6 }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </ChiSection>
      )}

      {cv.education.length > 0 && (
        <ChiSection title="Education">
          {cv.education.map(edu => (
            <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
              <div>
                <strong style={{ fontSize: 11, color: "#111110" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</strong>
                <p style={{ fontSize: 10, color: "#666", margin: "2px 0 0" }}>{edu.school}{edu.gpa ? ` · ${edu.gpa}` : ""}{edu.honors ? ` · ${edu.honors}` : ""}</p>
              </div>
              <span style={{ fontSize: 9.5, color: "#74746A", fontStyle: "italic", flexShrink: 0, marginLeft: 12 }}>{edu.period}</span>
            </div>
          ))}
        </ChiSection>
      )}

      {cv.skills.technical && (
        <ChiSection title="Skills">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 8px", marginBottom: 5 }}>
            {cv.skills.technical.split(",").filter(s => s.trim()).map((s, i) => (
              <span key={i} style={{ fontSize: 9.5, background: "#F5F4EF", border: "1px solid #E2DFD6", borderRadius: 3, padding: "3px 9px", color: "#333", fontWeight: 500 }}>{s.trim()}</span>
            ))}
          </div>
          {cv.skills.soft && <p style={{ fontSize: 10, color: "#666", margin: "5px 0 2px" }}><strong style={{ color: "#333" }}>Soft Skills:</strong> {cv.skills.soft}</p>}
          {cv.skills.languages && <p style={{ fontSize: 10, color: "#666", margin: "2px 0" }}><strong style={{ color: "#333" }}>Languages:</strong> {cv.skills.languages}</p>}
          {cv.skills.certifications && <p style={{ fontSize: 10, color: "#666", margin: "2px 0" }}><strong style={{ color: "#333" }}>Certifications:</strong> {cv.skills.certifications}</p>}
        </ChiSection>
      )}

      {cv.projects.length > 0 && (
        <ChiSection title="Projects">
          {cv.projects.map(proj => (
            <div key={proj.id} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ fontSize: 11, color: "#111110" }}>{proj.name}</strong>
                {proj.tech && <span style={{ fontSize: 9, color: "#C9A96E", fontWeight: 700 }}>{proj.tech}</span>}
              </div>
              <p style={{ fontSize: 10, color: "#555", margin: "3px 0 0", lineHeight: 1.6 }}>{proj.description}</p>
            </div>
          ))}
        </ChiSection>
      )}

      {cv.achievements.some(a => a.text) && (
        <ChiSection title="Achievements">
          {cv.achievements.filter(a => a.text).map((a, i) => (
            <p key={i} style={{ fontSize: 10.5, color: "#444", margin: "0 0 4px" }}>• {a.text}</p>
          ))}
        </ChiSection>
      )}
    </div>
  );
}
function ChiSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18, paddingLeft: 14, borderLeft: "3px solid #C9A96E" }}>
      <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#1A3628", marginBottom: 8 }}>{title}</p>
      {children}
    </div>
  );
}

// ── 3. MINIMAL ───────────────────────────────────────────────────────────────
function MinimalPreview({ cv, setCV }: { cv: CV; setCV: SetCV }) {
  const p = cv.personal;
  const upP = (f: keyof CV["personal"], v: string) => setCV(c => ({ ...c, personal: { ...c.personal, [f]: v } }));
  return (
    <div style={{ background: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 10.5, lineHeight: 1.5, padding: "44px 52px" }}>
      {/* Name block */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 700, color: "#1E1E18", margin: "0 0 4px", letterSpacing: "-0.8px" }}>
          <EditableSpan value={p.name} onChange={v => upP("name", v)} placeholder="YOUR NAME" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 700, color: "#1E1E18", letterSpacing: "-0.8px" }} />
        </h1>
        <div style={{ width: 36, height: 3, background: "#C9A96E", marginBottom: 10 }} />
        <p style={{ fontSize: 9.5, color: "#74746A", margin: 0 }}>
          {(["email","phone","location","linkedin","github","website"] as const).filter(f => p[f]).map((f, i, arr) => (
            <span key={f}><EditableSpan value={p[f]} onChange={v => upP(f, v)} style={{ fontSize: 9.5, color: "#74746A" }} />{i < arr.length - 1 ? "  ·  " : ""}</span>
          ))}
        </p>
      </div>

      {p.summary && (
        <MinSection title="Summary">
          <EditableSpan value={p.summary} onChange={v => upP("summary", v)} multiline placeholder="Write a brief professional summary…" style={{ fontSize: 10.5, color: "#444", lineHeight: 1.75, display: "block", width: "100%" }} />
        </MinSection>
      )}

      {cv.experience.length > 0 && (
        <MinSection title="Experience">
          {cv.experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <strong style={{ fontSize: 11, color: "#1E1E18" }}>{exp.role}</strong>
                  {exp.company && <span style={{ fontSize: 10, color: "#74746A" }}> · {exp.company}</span>}
                </div>
                <span style={{ fontSize: 9.5, color: "#74746A", flexShrink: 0, marginLeft: 12 }}>{exp.period}</span>
              </div>
              {exp.location && <p style={{ fontSize: 9.5, color: "#999", margin: "1px 0 3px" }}>{exp.location}</p>}
              <ul style={{ margin: "5px 0 0", paddingLeft: 15 }}>
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: 10.5, color: "#444", marginBottom: 3, lineHeight: 1.6 }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </MinSection>
      )}

      {cv.education.length > 0 && (
        <MinSection title="Education">
          {cv.education.map(edu => (
            <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
              <div>
                <strong style={{ fontSize: 11, color: "#1E1E18" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</strong>
                <p style={{ fontSize: 10, color: "#74746A", margin: "2px 0 0" }}>{edu.school}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}{edu.honors ? ` · ${edu.honors}` : ""}</p>
              </div>
              <span style={{ fontSize: 9.5, color: "#74746A", flexShrink: 0, marginLeft: 12 }}>{edu.period}</span>
            </div>
          ))}
        </MinSection>
      )}

      {cv.skills.technical && (
        <MinSection title="Skills">
          <p style={{ fontSize: 10.5, color: "#333", lineHeight: 1.7, marginBottom: 3 }}>{cv.skills.technical}</p>
          {cv.skills.soft && <p style={{ fontSize: 10, color: "#666", margin: "3px 0 0" }}><strong style={{ color: "#333" }}>Soft:</strong> {cv.skills.soft}</p>}
          {cv.skills.languages && <p style={{ fontSize: 10, color: "#666", margin: "2px 0 0" }}><strong style={{ color: "#333" }}>Languages:</strong> {cv.skills.languages}</p>}
          {cv.skills.certifications && <p style={{ fontSize: 10, color: "#666", margin: "2px 0 0" }}><strong style={{ color: "#333" }}>Certs:</strong> {cv.skills.certifications}</p>}
        </MinSection>
      )}

      {cv.projects.length > 0 && (
        <MinSection title="Projects">
          {cv.projects.map(proj => (
            <div key={proj.id} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ fontSize: 11, color: "#1E1E18" }}>{proj.name}{proj.url ? <span style={{ fontWeight: 400, fontSize: 9, color: "#999" }}> — {proj.url}</span> : ""}</strong>
                {proj.tech && <span style={{ fontSize: 9, color: "#74746A" }}>{proj.tech}</span>}
              </div>
              <p style={{ fontSize: 10, color: "#555", margin: "3px 0 0", lineHeight: 1.6 }}>{proj.description}</p>
            </div>
          ))}
        </MinSection>
      )}

      {cv.achievements.some(a => a.text) && (
        <MinSection title="Achievements">
          {cv.achievements.filter(a => a.text).map((a, i) => (
            <p key={i} style={{ fontSize: 10.5, color: "#444", margin: "0 0 4px" }}>– {a.text}</p>
          ))}
        </MinSection>
      )}
    </div>
  );
}
function MinSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: "#74746A", marginBottom: 8, borderBottom: "1px solid #E2DFD6", paddingBottom: 5 }}>{title}</p>
      {children}
    </div>
  );
}

// ── 4. COMPACT ───────────────────────────────────────────────────────────────
function CompactPreview({ cv, setCV }: { cv: CV; setCV: SetCV }) {
  const p = cv.personal;
  const upP = (f: keyof CV["personal"], v: string) => setCV(c => ({ ...c, personal: { ...c.personal, [f]: v } }));
  return (
    <div style={{ background: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 10, lineHeight: 1.45, padding: "32px 40px" }}>
      {/* Compact header */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: "#1E1E18", margin: 0, letterSpacing: "-0.5px" }}>
          <EditableSpan value={p.name} onChange={v => upP("name", v)} placeholder="YOUR NAME" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 700, color: "#1E1E18", letterSpacing: "-0.5px" }} />
        </h1>
        {cv.experience[0]?.role && <p style={{ fontSize: 10.5, color: "#74746A", margin: "3px 0 6px" }}>{cv.experience[0].role}</p>}
        <p style={{ fontSize: 9, color: "#74746A", margin: 0 }}>
          {[p.email, p.phone, p.location, p.linkedin, p.github].filter(Boolean).join(" | ")}
        </p>
      </div>
      <div style={{ height: 2, background: "#1E1E18", marginBottom: 14 }} />

      {p.summary && (
        <CompSection title="Summary">
          <EditableSpan value={p.summary} onChange={v => upP("summary", v)} multiline placeholder="Write a brief professional summary…" style={{ fontSize: 10, color: "#444", lineHeight: 1.65, display: "block", width: "100%" }} />
        </CompSection>
      )}

      {cv.experience.length > 0 && (
        <CompSection title="Experience">
          {cv.experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, fontSize: 10.5, color: "#1E1E18" }}>{exp.role}</span>
                <span style={{ fontSize: 9, color: "#74746A", flexShrink: 0 }}>{exp.period}</span>
              </div>
              {exp.company && <p style={{ fontSize: 9.5, color: "#C9A96E", margin: "1px 0 3px", fontWeight: 600 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>}
              <ul style={{ margin: "3px 0 0", paddingLeft: 14 }}>
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: 10, color: "#444", marginBottom: 2, lineHeight: 1.5 }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </CompSection>
      )}

      {cv.education.length > 0 && (
        <CompSection title="Education">
          {cv.education.map(edu => (
            <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 10.5, color: "#1E1E18" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</span>
                <span style={{ fontSize: 9.5, color: "#74746A" }}> · {edu.school}{edu.gpa ? ` · ${edu.gpa}` : ""}</span>
              </div>
              <span style={{ fontSize: 9, color: "#74746A", flexShrink: 0 }}>{edu.period}</span>
            </div>
          ))}
        </CompSection>
      )}

      {cv.skills.technical && (
        <CompSection title="Technical Skills">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 6px" }}>
            {cv.skills.technical.split(",").filter(s => s.trim()).map((s, i) => (
              <span key={i} style={{ fontSize: 9, background: "#F5F4EF", border: "1px solid #E2DFD6", borderRadius: 2, padding: "2px 7px", color: "#1E1E18", fontWeight: 500 }}>{s.trim()}</span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 16px", marginTop: 6 }}>
            {cv.skills.soft && <p style={{ fontSize: 9.5, color: "#555", margin: 0 }}><strong>Soft:</strong> {cv.skills.soft}</p>}
            {cv.skills.languages && <p style={{ fontSize: 9.5, color: "#555", margin: 0 }}><strong>Languages:</strong> {cv.skills.languages}</p>}
            {cv.skills.certifications && <p style={{ fontSize: 9.5, color: "#555", margin: 0 }}><strong>Certs:</strong> {cv.skills.certifications}</p>}
          </div>
        </CompSection>
      )}

      {cv.projects.length > 0 && (
        <CompSection title="Projects">
          {cv.projects.map(proj => (
            <div key={proj.id} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: 10.5, color: "#1E1E18" }}>{proj.name}</span>
                {proj.tech && <span style={{ fontSize: 9, color: "#C9A96E", fontWeight: 700 }}>{proj.tech}</span>}
              </div>
              <p style={{ fontSize: 10, color: "#555", margin: "2px 0 0", lineHeight: 1.5 }}>{proj.description}</p>
            </div>
          ))}
        </CompSection>
      )}

      {cv.achievements.some(a => a.text) && (
        <CompSection title="Achievements">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 20px" }}>
            {cv.achievements.filter(a => a.text).map((a, i) => (
              <p key={i} style={{ fontSize: 10, color: "#444", margin: 0 }}>• {a.text}</p>
            ))}
          </div>
        </CompSection>
      )}
    </div>
  );
}
function CompSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <p style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "#1E1E18", margin: "0 0 6px", paddingBottom: 4, borderBottom: "0.5px solid #E2DFD6" }}>{title}</p>
      {children}
    </div>
  );
}

// ── 5. SLATE ─────────────────────────────────────────────────────────────────
function SlatePreview({ cv, setCV }: { cv: CV; setCV: SetCV }) {
  const p = cv.personal;
  const SLATE = "#1E293B";
  const BLUE  = "#3B82F6";
  const skillList = cv.skills.technical.split(",").map(s => s.trim()).filter(Boolean);
  const langList  = cv.skills.languages.split(",").map(s => s.trim()).filter(Boolean);
  const certList  = cv.skills.certifications.split(",").map(s => s.trim()).filter(Boolean);
  const upP = (f: keyof CV["personal"], v: string) => setCV(c => ({ ...c, personal: { ...c.personal, [f]: v } }));

  return (
    <div style={{ display: "flex", minHeight: "100%", fontFamily: "'Inter', sans-serif", fontSize: 10.5 }}>
      {/* Sidebar */}
      <div style={{ width: "33%", background: SLATE, padding: "32px 18px", flexShrink: 0, boxSizing: "border-box" }}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "2px solid rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,.15)" }} />
        </div>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", textAlign: "center", margin: "0 0 4px", letterSpacing: "-0.3px", lineHeight: 1.15 }}>
          <EditableSpan value={p.name} onChange={v => upP("name", v)} placeholder="Your Name" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }} />
        </h1>
        {cv.experience[0]?.role && (
          <p style={{ fontSize: 9.5, color: BLUE, textAlign: "center", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 16px" }}>{cv.experience[0].role}</p>
        )}

        {/* Contact */}
        <SlateSubHead title="Contact" />
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
          {[["✉", p.email], ["📞", p.phone], ["📍", p.location], ["in", p.linkedin], ["⚡", p.github]].filter(([, v]) => v).map(([icon, v], i) => (
            <p key={i} style={{ fontSize: 9, color: "rgba(255,255,255,.7)", margin: 0, wordBreak: "break-all" }}>{icon} {v}</p>
          ))}
        </div>

        {skillList.length > 0 && (
          <>
            <SlateSubHead title="Skills" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 5px", marginBottom: 14 }}>
              {skillList.map((s, i) => (
                <span key={i} style={{ fontSize: 8.5, background: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.85)", padding: "2px 7px", borderRadius: 2, border: "1px solid rgba(255,255,255,.15)" }}>{s}</span>
              ))}
            </div>
          </>
        )}

        {langList.length > 0 && (
          <>
            <SlateSubHead title="Languages" />
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
              {langList.map((lang, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,.8)" }}>{lang}</span>
                  <div style={{ display: "flex", gap: 2 }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} style={{ width: 8, height: 4, borderRadius: 1, background: j < 4 ? BLUE : "rgba(255,255,255,.15)" }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {certList.length > 0 && (
          <>
            <SlateSubHead title="Certifications" />
            {certList.map((c, i) => <p key={i} style={{ fontSize: 9, color: "rgba(255,255,255,.75)", margin: "0 0 4px", fontWeight: 500 }}>— {c}</p>)}
          </>
        )}

        {cv.skills.soft && (
          <>
            <SlateSubHead title="Soft Skills" />
            {cv.skills.soft.split(",").filter(s => s.trim()).map((s, i) => (
              <p key={i} style={{ fontSize: 9, color: "rgba(255,255,255,.7)", margin: "0 0 3px" }}>· {s.trim()}</p>
            ))}
          </>
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, background: "#fff", padding: "28px 28px 28px 24px" }}>
        {p.summary && (
          <SlateSection title="About" slate={SLATE}>
            <EditableSpan value={p.summary} onChange={v => upP("summary", v)} multiline placeholder="Write a brief professional summary…" style={{ fontSize: 10.5, color: "#444", lineHeight: 1.75, display: "block", width: "100%" }} />
          </SlateSection>
        )}

        {cv.experience.length > 0 && (
          <SlateSection title="Experience" slate={SLATE}>
            {cv.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: 11, color: SLATE }}>{exp.role}</strong>
                  <span style={{ fontSize: 9, color: "#888", fontStyle: "italic", flexShrink: 0 }}>{exp.period}</span>
                </div>
                {exp.company && <p style={{ fontSize: 10, color: BLUE, margin: "1px 0 3px", fontWeight: 600 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>}
                <ul style={{ margin: "4px 0 0", paddingLeft: 14 }}>
                  {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: 10, color: "#444", marginBottom: 3, lineHeight: 1.6 }}>{b}</li>)}
                </ul>
              </div>
            ))}
          </SlateSection>
        )}

        {cv.education.length > 0 && (
          <SlateSection title="Education" slate={SLATE}>
            {cv.education.map(edu => (
              <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
                <div>
                  <strong style={{ fontSize: 11, color: SLATE }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</strong>
                  <p style={{ fontSize: 10, color: "#666", margin: "2px 0 0" }}>{edu.school}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}{edu.honors ? ` · ${edu.honors}` : ""}</p>
                </div>
                <span style={{ fontSize: 9, color: "#888", fontStyle: "italic", flexShrink: 0, marginLeft: 10 }}>{edu.period}</span>
              </div>
            ))}
          </SlateSection>
        )}

        {cv.projects.length > 0 && (
          <SlateSection title="Projects" slate={SLATE}>
            {cv.projects.map(proj => (
              <div key={proj.id} style={{ marginBottom: 11 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 11, color: SLATE }}>{proj.name}</strong>
                  {proj.tech && <span style={{ fontSize: 9, color: BLUE, fontWeight: 700 }}>{proj.tech}</span>}
                </div>
                {proj.url && <p style={{ fontSize: 9, color: "#888", margin: "1px 0 2px" }}>{proj.url}</p>}
                <p style={{ fontSize: 10, color: "#555", margin: "3px 0 0", lineHeight: 1.6 }}>{proj.description}</p>
              </div>
            ))}
          </SlateSection>
        )}

        {cv.achievements.some(a => a.text) && (
          <SlateSection title="Achievements" slate={SLATE}>
            {cv.achievements.filter(a => a.text).map((a, i) => (
              <p key={i} style={{ fontSize: 10.5, color: "#444", margin: "0 0 4px" }}>• {a.text}</p>
            ))}
          </SlateSection>
        )}
      </div>
    </div>
  );
}
function SlateSubHead({ title }: { title: string }) {
  return <p style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(255,255,255,.45)", margin: "0 0 7px" }}>{title}</p>;
}
function SlateSection({ title, children, slate }: { title: string; children: React.ReactNode; slate: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: slate, margin: 0, whiteSpace: "nowrap" }}>{title}</p>
        <div style={{ flex: 1, height: 1, background: "#E2DFD6" }} />
      </div>
      {children}
    </div>
  );
}

// ── Sidebar Two-Column Preview ─────────────────────────────────────────────
function SidebarPreview({ cv, setCV }: { cv: CV; setCV: SetCV }) {
  const p = cv.personal;
  const SIDEBAR_BG  = "#EBEBEB";
  const ACCENT      = "#1A1A1A";
  const MUTED       = "#666666";
  const FONT        = "'Inter', system-ui, sans-serif";
  const upP = (f: keyof CV["personal"], v: string) => setCV(c => ({ ...c, personal: { ...c.personal, [f]: v } }));

  // Use skillLevels from CV data, fallback to 4 stars
  const getSkillLevel = (str: string) => cv.skillLevels?.[str] ?? 4;

  const TickBar = ({ label }: { label: string }) => {
    const level = Math.min(5, Math.max(1, getSkillLevel(label)));
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: ACCENT, flex: 1 }}>{label}</p>
        <div style={{ display: "flex", gap: 3 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: i < level ? ACCENT : "#CCCCCC" }} />
          ))}
        </div>
      </div>
    );
  };

  const SideHead = ({ title }: { title: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "18px 0 9px" }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
      <p style={{ fontFamily: FONT, fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.13em", color: ACCENT, margin: 0 }}>{title}</p>
    </div>
  );

  const RightHead = ({ title }: { title: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "16px 0 9px" }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
      <p style={{ fontFamily: FONT, fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.13em", color: ACCENT, margin: 0 }}>{title}</p>
    </div>
  );

  const technicalSkills = cv.skills.technical.split(",").map(s => s.trim()).filter(Boolean);
  const languages       = cv.skills.languages.split(",").map(s => s.trim()).filter(Boolean);

  return (
    <div style={{ display: "flex", minHeight: "100%", fontFamily: FONT, fontSize: 10.5, lineHeight: 1.5 }}>

      {/* ── LEFT SIDEBAR */}
      <div style={{ width: "34%", background: SIDEBAR_BG, padding: "32px 18px 32px 20px", flexShrink: 0, boxSizing: "border-box" }}>

        {/* Profile photo placeholder */}
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#D4D4D4,#B8B8B8)", border: "3px solid #fff", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#9E9E9E" }} />
        </div>

        {/* Name + title */}
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <EditableSpan value={p.name} onChange={v => upP("name", v)} placeholder="YOUR NAME" style={{ fontSize: 17, fontWeight: 800, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.04em" }} />
          {cv.experience[0]?.role && (
            <p style={{ fontSize: 8.5, color: MUTED, marginTop: 5, textTransform: "uppercase", letterSpacing: "0.09em" }}>{cv.experience[0].role}</p>
          )}
        </div>

        {/* Contact */}
        {(p.phone || p.location || p.email || p.linkedin || p.github) && (
          <>
            <SideHead title="About Me" />
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {p.phone    && <p style={{ fontSize: 9.5, color: "#444", margin: 0 }}>📞 {p.phone}</p>}
              {p.location && <p style={{ fontSize: 9.5, color: "#444", margin: 0 }}>📍 {p.location}</p>}
              {p.email    && <p style={{ fontSize: 9.5, color: "#444", margin: 0 }}>✉ {p.email}</p>}
              {p.linkedin && <p style={{ fontSize: 9.5, color: "#444", margin: 0 }}>in {p.linkedin}</p>}
              {p.github   && <p style={{ fontSize: 9.5, color: "#444", margin: 0 }}>⚡ {p.github}</p>}
            </div>
          </>
        )}

        {/* Technical Skills with tick bars */}
        {technicalSkills.length > 0 && (
          <>
            <SideHead title="Skills" />
            {technicalSkills.map((skill, i) => (
              <TickBar key={i} label={skill} />
            ))}
          </>
        )}

        {/* Languages with tick bars */}
        {languages.length > 0 && (
          <>
            <SideHead title="Language" />
            {languages.map((lang, i) => (
              <TickBar key={i} label={lang} />
            ))}
          </>
        )}

        {/* Certifications */}
        {cv.skills.certifications && (
          <>
            <SideHead title="Certifications" />
            {cv.skills.certifications.split(",").map((c, i) => (
              <p key={i} style={{ fontSize: 9.5, color: "#444", margin: "0 0 4px", fontWeight: 600 }}>{c.trim()}</p>
            ))}
          </>
        )}
      </div>

      {/* ── RIGHT PANEL */}
      <div style={{ flex: 1, background: "#fff", padding: "32px 24px 32px 18px", position: "relative" }}>

        {p.summary && (
          <>
            <RightHead title="About Me" />
            <EditableSpan value={p.summary} onChange={v => upP("summary", v)} multiline placeholder="Write a brief professional summary…" style={{ fontSize: 10, color: "#555", lineHeight: 1.75, display: "block", width: "100%" }} />
          </>
        )}

        {cv.education.length > 0 && (
          <>
            <RightHead title="Education" />
            {cv.education.map(edu => (
              <div key={edu.id} style={{ marginBottom: 10 }}>
                <strong style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.04em", color: ACCENT }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</strong>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 1 }}>
                  <p style={{ fontSize: 10, color: MUTED, margin: 0 }}>{edu.school}{edu.honors ? ` · ${edu.honors}` : ""}</p>
                  <span style={{ fontSize: 9.5, color: "#999", fontWeight: 600 }}>{edu.period}</span>
                </div>
              </div>
            ))}
          </>
        )}

        {cv.experience.length > 0 && (
          <>
            <RightHead title="Experience" />
            {cv.experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.04em", color: ACCENT }}>{exp.role}</strong>
                  <span style={{ fontSize: 9.5, color: "#999", fontWeight: 600 }}>{exp.period}</span>
                </div>
                {exp.company && <p style={{ fontSize: 10, color: MUTED, margin: "1px 0 3px" }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>}
                {exp.bullets.filter(Boolean).length > 0 && (
                  <p style={{ fontSize: 10, color: "#555", lineHeight: 1.65, margin: 0 }}>{exp.bullets.filter(Boolean).join(" • ")}</p>
                )}
              </div>
            ))}
          </>
        )}

        {cv.skills.soft && (
          <>
            <RightHead title="Skills" />
            {cv.skills.soft.split(",").map((s, i) => {
              const sk = s.trim(); if (!sk) return null;
              return <TickBar key={i} label={sk} />;
            })}
          </>
        )}

        {cv.projects.length > 0 && (
          <>
            <RightHead title="Projects" />
            {cv.projects.map(proj => (
              <div key={proj.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <strong style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.04em", color: ACCENT }}>{proj.name}</strong>
                  <span style={{ fontSize: 9.5, color: ACCENT, fontWeight: 700 }}>{proj.tech}</span>
                </div>
                <p style={{ fontSize: 10, color: "#555", lineHeight: 1.65, margin: "2px 0 0" }}>{proj.description}</p>
              </div>
            ))}
          </>
        )}

        {cv.achievements.some(a => a.text) && (
          <>
            <RightHead title="Achievements" />
            {cv.achievements.filter(a => a.text).map((a, i) => (
              <p key={i} style={{ fontSize: 10, color: "#555", lineHeight: 1.65, margin: "0 0 3px" }}>• {a.text}</p>
            ))}
          </>
        )}

        {p.website && (
          <p style={{ marginTop: 20, fontSize: 9.5, color: "#AAAAAA", textAlign: "right", fontStyle: "italic" }}>{p.website}</p>
        )}
      </div>
    </div>
  );
}

// ── 7. NOVA ───────────────────────────────────────────────────────────────────
// Clean modern template: indigo accent, generous whitespace, pill skill tags
function NovaPreview({ cv, setCV }: { cv: CV; setCV: SetCV }) {
  const p = cv.personal;
  const upP = (f: keyof CV["personal"], v: string) => setCV(c => ({ ...c, personal: { ...c.personal, [f]: v } }));
  const INDIGO = "#4F46E5";
  const LIGHT  = "#EEF2FF";
  return (
    <div style={{ background: "#fff", fontFamily: "'Inter', sans-serif", fontSize: 10.5, lineHeight: 1.6 }}>
      {/* Header strip */}
      <div style={{ background: INDIGO, padding: "34px 44px 28px" }}>
        <EditableSpan value={p.name} onChange={v => upP("name", v)} placeholder="Your Name"
          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", display: "block" }} />
        {cv.experience[0]?.role && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,.75)", marginTop: 4, fontWeight: 500, letterSpacing: "0.03em" }}>{cv.experience[0].role}</p>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 16px", marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.2)" }}>
          {(["email","phone","location","linkedin","github"] as const).filter(f => p[f]).map((f,i) => (
            <EditableSpan key={i} value={p[f]} onChange={v => upP(f, v)} style={{ fontSize: 9, color: "rgba(255,255,255,.8)" }} />
          ))}
        </div>
      </div>

      <div style={{ padding: "28px 44px", display: "grid", gridTemplateColumns: "1fr 200px", gap: 28 }}>
        {/* LEFT: experience, education */}
        <div>
          {p.summary && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: INDIGO, marginBottom: 7 }}>About</p>
              <EditableSpan value={p.summary} onChange={v => upP("summary", v)} multiline
                style={{ fontSize: 10.5, color: "#444", lineHeight: 1.75, display: "block", width: "100%" }} />
            </div>
          )}

          {cv.experience.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: INDIGO, marginBottom: 10 }}>Experience</p>
              {cv.experience.map(exp => (
                <div key={exp.id} style={{ marginBottom: 14, paddingLeft: 12, borderLeft: `2px solid ${LIGHT}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <strong style={{ fontSize: 11, color: "#111" }}>{exp.role}</strong>
                    <span style={{ fontSize: 9, color: "#999", fontStyle: "italic" }}>{exp.period}</span>
                  </div>
                  {exp.company && <p style={{ fontSize: 10, color: INDIGO, fontWeight: 600, margin: "2px 0" }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>}
                  <ul style={{ margin: "4px 0 0", paddingLeft: 14 }}>
                    {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: 10, color: "#555", marginBottom: 2, lineHeight: 1.55 }}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {cv.education.length > 0 && (
            <div>
              <p style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: INDIGO, marginBottom: 10 }}>Education</p>
              {cv.education.map(edu => (
                <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div>
                    <strong style={{ fontSize: 11, color: "#111" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</strong>
                    <p style={{ fontSize: 10, color: "#666", margin: "1px 0 0" }}>{edu.school}{edu.gpa ? ` · GPA ${edu.gpa}` : ""}</p>
                  </div>
                  <span style={{ fontSize: 9, color: "#999", fontStyle: "italic", flexShrink: 0, marginLeft: 8 }}>{edu.period}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: skills, projects, achievements */}
        <div>
          {cv.skills.technical && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: INDIGO, marginBottom: 8 }}>Skills</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 5px" }}>
                {cv.skills.technical.split(",").filter(s => s.trim()).map((s, i) => (
                  <span key={i} style={{ fontSize: 9, background: LIGHT, color: INDIGO, padding: "3px 8px", borderRadius: 20, fontWeight: 600 }}>{s.trim()}</span>
                ))}
              </div>
              {cv.skills.languages && <p style={{ fontSize: 9.5, color: "#666", marginTop: 6 }}><strong style={{ color: "#333" }}>Languages:</strong> {cv.skills.languages}</p>}
              {cv.skills.certifications && <p style={{ fontSize: 9.5, color: "#666", marginTop: 4 }}><strong style={{ color: "#333" }}>Certs:</strong> {cv.skills.certifications}</p>}
            </div>
          )}

          {cv.projects.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: INDIGO, marginBottom: 8 }}>Projects</p>
              {cv.projects.map(proj => (
                <div key={proj.id} style={{ marginBottom: 10, padding: "8px 10px", background: LIGHT, borderRadius: 6 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#111" }}>{proj.name}</p>
                  {proj.tech && <p style={{ fontSize: 9, color: INDIGO, fontWeight: 600, margin: "2px 0" }}>{proj.tech}</p>}
                  <p style={{ fontSize: 9.5, color: "#555", marginTop: 3, lineHeight: 1.5 }}>{proj.description}</p>
                </div>
              ))}
            </div>
          )}

          {cv.achievements.some(a => a.text) && (
            <div>
              <p style={{ fontSize: 8.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: INDIGO, marginBottom: 8 }}>Achievements</p>
              {cv.achievements.filter(a => a.text).map((a, i) => (
                <p key={i} style={{ fontSize: 10, color: "#555", margin: "0 0 4px" }}>✦ {a.text}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 8. CLASSIC ────────────────────────────────────────────────────────────────
// Traditional single-column, finance/consulting style with serif-inspired hierarchy
function ClassicPreview({ cv, setCV }: { cv: CV; setCV: SetCV }) {
  const p = cv.personal;
  const upP = (f: keyof CV["personal"], v: string) => setCV(c => ({ ...c, personal: { ...c.personal, [f]: v } }));
  return (
    <div style={{ background: "#fff", fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: 10.5, lineHeight: 1.65, padding: "40px 52px" }}>
      {/* Centred header */}
      <div style={{ textAlign: "center", marginBottom: 18, paddingBottom: 14, borderBottom: "2px solid #111" }}>
        <EditableSpan value={p.name} onChange={v => upP("name", v)} placeholder="Your Name"
          style={{ fontFamily: "'Georgia', serif", fontSize: 22, fontWeight: 700, color: "#111", letterSpacing: "0.04em", display: "block", textTransform: "uppercase" }} />
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "2px 14px", marginTop: 8 }}>
          {(["email","phone","location","linkedin","github"] as const).filter(f => p[f]).map((f, i) => (
            <EditableSpan key={i} value={p[f]} onChange={v => upP(f, v)} style={{ fontSize: 9.5, color: "#444", fontFamily: "'Inter', sans-serif" }} />
          ))}
        </div>
      </div>

      {p.summary && (
        <ClassicSection title="Professional Summary">
          <EditableSpan value={p.summary} onChange={v => upP("summary", v)} multiline
            style={{ fontSize: 10.5, color: "#333", lineHeight: 1.75, display: "block", width: "100%", fontFamily: "'Georgia', serif" }} />
        </ClassicSection>
      )}

      {cv.experience.length > 0 && (
        <ClassicSection title="Professional Experience">
          {cv.experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <strong style={{ fontSize: 11, color: "#111", fontFamily: "'Inter', sans-serif", fontWeight: 700 }}>{exp.role}</strong>
                <span style={{ fontSize: 9.5, color: "#555", fontStyle: "italic" }}>{exp.period}</span>
              </div>
              {exp.company && (
                <p style={{ fontSize: 10.5, color: "#444", margin: "1px 0 4px", fontStyle: "italic" }}>
                  {exp.company}{exp.location ? `, ${exp.location}` : ""}
                </p>
              )}
              <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
                {exp.bullets.filter(Boolean).map((b, i) => <li key={i} style={{ fontSize: 10.5, color: "#333", marginBottom: 3, lineHeight: 1.6 }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </ClassicSection>
      )}

      {cv.education.length > 0 && (
        <ClassicSection title="Education">
          {cv.education.map(edu => (
            <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9 }}>
              <div>
                <strong style={{ fontSize: 11, color: "#111", fontFamily: "'Inter', sans-serif" }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</strong>
                <p style={{ fontSize: 10.5, color: "#555", margin: "2px 0 0", fontStyle: "italic" }}>{edu.school}{edu.honors ? ` · ${edu.honors}` : ""}{edu.gpa ? ` · GPA: ${edu.gpa}` : ""}</p>
              </div>
              <span style={{ fontSize: 9.5, color: "#555", fontStyle: "italic", flexShrink: 0, marginLeft: 12 }}>{edu.period}</span>
            </div>
          ))}
        </ClassicSection>
      )}

      {cv.skills.technical && (
        <ClassicSection title="Skills & Competencies">
          <p style={{ fontSize: 10.5, color: "#333", lineHeight: 1.7 }}><strong style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "#111" }}>Technical:</strong> {cv.skills.technical}</p>
          {cv.skills.soft && <p style={{ fontSize: 10.5, color: "#333", margin: "4px 0 0" }}><strong style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "#111" }}>Soft Skills:</strong> {cv.skills.soft}</p>}
          {cv.skills.languages && <p style={{ fontSize: 10.5, color: "#333", margin: "4px 0 0" }}><strong style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "#111" }}>Languages:</strong> {cv.skills.languages}</p>}
          {cv.skills.certifications && <p style={{ fontSize: 10.5, color: "#333", margin: "4px 0 0" }}><strong style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, color: "#111" }}>Certifications:</strong> {cv.skills.certifications}</p>}
        </ClassicSection>
      )}

      {cv.projects.length > 0 && (
        <ClassicSection title="Projects">
          {cv.projects.map(proj => (
            <div key={proj.id} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ fontSize: 11, color: "#111", fontFamily: "'Inter', sans-serif" }}>{proj.name}</strong>
                {proj.tech && <span style={{ fontSize: 9.5, color: "#555", fontStyle: "italic" }}>{proj.tech}</span>}
              </div>
              <p style={{ fontSize: 10.5, color: "#444", margin: "3px 0 0", lineHeight: 1.6 }}>{proj.description}</p>
            </div>
          ))}
        </ClassicSection>
      )}

      {cv.achievements.some(a => a.text) && (
        <ClassicSection title="Honours & Achievements">
          {cv.achievements.filter(a => a.text).map((a, i) => (
            <p key={i} style={{ fontSize: 10.5, color: "#333", margin: "0 0 4px" }}>• {a.text}</p>
          ))}
        </ClassicSection>
      )}
    </div>
  );
}
function ClassicSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "#111", marginBottom: 6, paddingBottom: 4, borderBottom: "1px solid #ccc" }}>{title}</p>
      {children}
    </div>
  );
}

// ── CV Preview Dispatcher ─────────────────────────────────────────────────
function Preview({ cv, template, setCV }: { cv: CV; template: string; setCV: SetCV }) {
  switch (template) {
    case "Executive": return <ExecutivePreview cv={cv} setCV={setCV} />;
    case "Chicago":   return <ChicagoPreview cv={cv} setCV={setCV} />;
    case "Compact":   return <CompactPreview cv={cv} setCV={setCV} />;
    case "Slate":     return <SlatePreview cv={cv} setCV={setCV} />;
    case "Sidebar":   return <SidebarPreview cv={cv} setCV={setCV} />;
    case "Nova":      return <NovaPreview cv={cv} setCV={setCV} />;
    case "Classic":   return <ClassicPreview cv={cv} setCV={setCV} />;
    default:          return <MinimalPreview cv={cv} setCV={setCV} />;
  }
}

// ── Shared Styling Helpers ──────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 13px",
  border: `1.5px solid ${THEME.border}`,
  borderRadius: "5px",
  fontSize: "13.5px",
  color: THEME.textMain,
  background: THEME.surface,
  outline: "none",
  fontFamily: THEME.fontFamily,
  lineHeight: 1.5,
  transition: "border-color 0.18s, box-shadow 0.18s"
};

const labelStyle: React.CSSProperties = {
  fontSize: "10.5px",
  fontWeight: 600,
  color: THEME.textMuted,
  marginBottom: "6px",
  display: "block",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  fontFamily: "'IBM Plex Mono', monospace"
};

const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = THEME.gold;
  e.target.style.boxShadow = `0 0 0 3px rgba(201,169,110,.15)`;
};
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.target.style.borderColor = THEME.border;
  e.target.style.boxShadow = "none";
};

// ── AI Suggestion Box ───────────────────────────────────────────────────────
function AIBox({ context, targetId, setCV, onClose, onUsed, alreadyUsed }: { context: string, targetId?: string, cv: CV, setCV: any, onClose: () => void, onUsed: () => void, alreadyUsed?: boolean }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(alreadyUsed ?? false);

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(""); setSuggestions([]);
    try {
      let results = context === "skills"
        ? (await aiImprove(input)).flatMap(r => r.split(",").map(s => s.trim())).filter(Boolean)
        : await aiBullets(input);
      setSuggestions(results.map((text: string) => ({ text, inserted: false })));
      if (!generated) { setGenerated(true); onUsed(); }
    } catch (e: any) { setError(e.message || "Request failed."); }
    finally { setLoading(false); }
  };

  const toggle = (idx: number) => {
    const s = suggestions[idx];
    if (!s.inserted) {
      if (context === "experience-bullets" && targetId) setCV((c: CV) => ({ ...c, experience: c.experience.map(e => e.id === targetId ? { ...e, bullets: [...e.bullets.filter(b => b.trim()), s.text] } : e) }));
      else if (context === "skills") setCV((c: CV) => ({ ...c, skills: { ...c.skills, technical: [...c.skills.technical.split(",").map(x => x.trim()).filter(Boolean), s.text].join(", ") } }));
      else if (context === "projects-description" && targetId) setCV((c: CV) => ({ ...c, projects: c.projects.map(p => p.id === targetId ? { ...p, description: s.text } : p) }));
      else if (context === "summary") {
        // Append to existing summary instead of replacing
        setCV((c: CV) => {
          const existing = c.personal.summary.trim();
          return { ...c, personal: { ...c.personal, summary: existing ? `${existing} ${s.text}` : s.text } };
        });
      }
    } else {
      if (context === "experience-bullets" && targetId) setCV((c: CV) => ({ ...c, experience: c.experience.map(e => e.id === targetId ? { ...e, bullets: e.bullets.filter(b => b !== s.text) } : e) }));
      else if (context === "skills") setCV((c: CV) => ({ ...c, skills: { ...c.skills, technical: c.skills.technical.split(",").map(x => x.trim()).filter(x => x !== s.text).join(", ") } }));
      else if (context === "projects-description" && targetId) setCV((c: CV) => ({ ...c, projects: c.projects.map(p => p.id === targetId ? { ...p, description: "" } : p) }));
      else if (context === "summary") setCV((c: CV) => ({ ...c, personal: { ...c.personal, summary: c.personal.summary.replace(s.text, "").replace(/\s+/g, " ").trim() } }));
    }
    setSuggestions(prev => prev.map((item, i) => i === idx ? { ...item, inserted: !item.inserted } : item));
  };

  return (
    <div style={{ marginTop: 12, padding: "16px", borderRadius: "6px", background: "rgba(201,169,110,.06)", border: `1px solid rgba(201,169,110,.25)` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Sparkles size={13} color={THEME.gold} />
          <span style={{ fontSize: 11, fontWeight: 700, color: THEME.primary, textTransform: "uppercase", letterSpacing: "0.6px", fontFamily: "'IBM Plex Mono', monospace" }}>AI Assistant</span>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 2 }}><X size={15} /></button>
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Describe what you did or want to improve…" style={{ ...inputStyle, minHeight: 64, resize: "vertical" }} onFocus={onFocus} onBlur={onBlur} />
      {error && <p style={{ fontSize: 12, color: THEME.danger, marginTop: 6 }}>{error}</p>}
      <button onClick={generate} disabled={loading || !input.trim() || generated} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, padding: "8px 18px", borderRadius: "4px", background: generated ? THEME.border : loading || !input.trim() ? THEME.textMuted : THEME.primary, color: generated ? THEME.textMuted : "#fff", border: "none", cursor: generated ? "not-allowed" : loading ? "default" : "pointer", fontSize: 13, fontWeight: 600, opacity: !input.trim() && !generated ? 0.6 : 1 }}>
        <Sparkles size={13} />{loading ? "Generating…" : generated ? "Already Generated" : "Generate Suggestions"}
      </button>
      {generated && <p style={{ fontSize: 11, color: THEME.textMuted, marginTop: 5, fontFamily: "'IBM Plex Mono', monospace" }}>AI used once for this section — click suggestions above to apply them.</p>}
      {suggestions.length > 0 && (
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {suggestions.map((s, i) => (
            <div key={i} onClick={() => toggle(i)} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: "5px", border: `1.5px solid ${s.inserted ? THEME.gold : THEME.border}`, background: s.inserted ? "rgba(201,169,110,.08)" : THEME.surface, cursor: "pointer", transition: "border-color 0.15s, background 0.15s" }}>
              <div style={{ marginTop: 2, flexShrink: 0 }}>{s.inserted ? <Check size={15} color={THEME.gold} /> : <Plus size={15} color={THEME.primary} />}</div>
              <p style={{ fontSize: 13, color: THEME.textMain, lineHeight: 1.55 }}>{s.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Builder Component ──────────────────────────────────────────────────
function BuilderInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumeId = searchParams.get("id");

  const [cv, setCV] = useState<CV>(INIT);
  // tab state removed — sections are now always-visible accordion cards
  const [template, setTemplate] = useState("Minimal");
  const [showATS, setShowATS] = useState(false);
  const [atsResult, setAtsResult] = useState<{ score: number; keywords_found: string[]; missing_keywords: string[]; suggestions: string[]; strongPoints: string[] } | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loadingCV, setLoadingCV] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [aiOpen, setAiOpen] = useState<string | null>(null);
  const [usedAI, setUsedAI] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const previewRef = useRef<HTMLDivElement>(null);
  const { credits, openBuyModal, doTrackExport, deductExportCredit, deductCvCredit } = useCredits();
  const dragExpIdx = useRef(-1);
  const dragExpOverIdx = useRef(-1);
  const dragEduIdx = useRef(-1);
  const dragEduOverIdx = useRef(-1);
  const dragProjIdx = useRef(-1);
  const dragProjOverIdx = useRef(-1);
  const dragAchIdx = useRef(-1);
  const dragAchOverIdx = useRef(-1);
  const [isMobile, setIsMobile] = useState(false);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowPreview(false);
        // Auto-fit A4 width (794px) to screen with some padding
        setZoom(Math.max(30, Math.round((window.innerWidth - 32) / 794 * 100)));
      } else {
        setZoom(100);
      }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);


  useEffect(() => {
    if (!resumeId) return;
    setLoadingCV(true);
    getResume(resumeId).then(r => { if (r.data) setCV(r.data as unknown as CV); setTemplate(r.template || "Minimal"); }).catch(() => setLoadError(true)).finally(() => setLoadingCV(false));
  }, [resumeId]);

  const upP = (f: string, v: string) => setCV(c => ({ ...c, personal: { ...c.personal, [f]: v } }));

  const cvToText = () => {
    const lines: string[] = [];
    const p = cv.personal;
    if (p.name) lines.push(p.name);
    if (p.summary) lines.push(p.summary);
    cv.experience.forEach(e => { lines.push(`${e.role} at ${e.company} (${e.period})`); e.bullets.forEach(b => b && lines.push(b)); });
    cv.education.forEach(e => lines.push(`${e.degree}${e.field ? " in " + e.field : ""} at ${e.school}`));
    if (cv.skills.technical) lines.push(`Skills: ${cv.skills.technical}`);
    cv.projects.forEach(proj => lines.push(`${proj.name}: ${proj.description}`));
    cv.achievements.forEach(a => a.text && lines.push(a.text));
    return lines.join("\n");
  };

  const runATS = async () => {
    const text = cvToText();
    if (!text.trim()) return;
    setAtsLoading(true);
    try {
      const r = await aiATS(text);
      setAtsResult(r);
    } catch { /* ignore */ }
    finally { setAtsLoading(false); }
  };

  const AI_USED_KEY = resumeId ? `FitRezume_aiUsed_${resumeId}` : null;

  useEffect(() => {
    if (!AI_USED_KEY) { setUsedAI(new Set()); return; }
    try {
      const raw = localStorage.getItem(AI_USED_KEY);
      setUsedAI(raw ? new Set(JSON.parse(raw)) : new Set());
    } catch { setUsedAI(new Set()); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  const markAIUsed = (id: string) => {
    setUsedAI(prev => {
      const next = new Set(prev);
      next.add(id);
      if (AI_USED_KEY) localStorage.setItem(AI_USED_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const handleDownload = async () => {
    if (credits !== null && credits.exportCredits === 0) { openBuyModal(); return; }
    const el = previewRef.current;
    if (!el) return;

    // Deduct credit first (optimistic)
    deductExportCredit();
    doTrackExport(resumeId ?? undefined).catch(() => null);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // Temporarily ensure element is fully rendered at natural width
      const prevTransform = (el.parentElement as HTMLElement)?.style.transform;
      if (el.parentElement) (el.parentElement as HTMLElement).style.transform = "none";

      // Inject a style tag to hide dashed edit underlines and blue page-break lines during capture
      const cleanStyle = document.createElement("style");
      cleanStyle.id = "__cv-export-clean";
      cleanStyle.textContent = `
        [data-previewref] span[role="button"],
        [data-previewref] span[tabindex="0"] { border-bottom: none !important; }
      `;
      // Mark the element so the selector matches
      el.setAttribute("data-previewref", "true");
      document.head.appendChild(cleanStyle);

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        // Ignore the page-break overlay sibling
        ignoreElements: (node) => node.id === "__cv-export-clean",
      });

      // Restore
      el.removeAttribute("data-previewref");
      cleanStyle.remove();
      if (el.parentElement) (el.parentElement as HTMLElement).style.transform = prevTransform || "";

      const imgData = canvas.toDataURL("image/png");
      // A4 dimensions in mm
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageW = 210;
      const pageH = 297;

      // px per mm at this canvas scale (canvas.width corresponds to 210mm)
      const pxPerMm = canvas.width / pageW;
      const pageHeightPx = Math.round(pageH * pxPerMm);
      const totalHeightMm = canvas.height / pxPerMm;

      if (totalHeightMm <= pageH) {
        // Fits on one page — use actual height, no blank space at bottom
        pdf.addImage(imgData, "PNG", 0, 0, pageW, totalHeightMm);
      } else {
        // Multi-page: slice canvas into A4 pages, fill each page fully
        let yOffset = 0;
        while (yOffset < canvas.height) {
          const sliceH = Math.min(pageHeightPx, canvas.height - yOffset);
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = pageHeightPx; // always full A4 height
          const ctx = pageCanvas.getContext("2d")!;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
          const pageImgData = pageCanvas.toDataURL("image/png");
          if (yOffset > 0) pdf.addPage();
          pdf.addImage(pageImgData, "PNG", 0, 0, pageW, pageH);
          yOffset += pageHeightPx;
        }
      }

      pdf.save(`${cv.personal.name || "CV"}.pdf`);
    } catch {
      // Fallback: browser print dialog
      const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"/><style>@page{size:A4;margin:0}body{margin:0;width:210mm}</style></head><body>${el.innerHTML}</body></html>`], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:210mm;height:297mm;border:none;";
      iframe.src = url;
      iframe.onload = () => { iframe.contentWindow?.print(); setTimeout(() => { iframe.remove(); URL.revokeObjectURL(url); }, 3000); };
      document.body.appendChild(iframe);
    }
  };

  const handleSave = async () => {
    // Block new CV creation if out of CV credits
    if (!resumeId && credits !== null && credits.cvCredits === 0) {
      openBuyModal();
      return;
    }
    setSaveState("saving");
    try {
      const payload = { data: cv as unknown as Record<string, unknown>, template, title: cv.personal.name || "My CV" };
      if (resumeId) {
        await updateResume(resumeId, payload);
      } else {
        const created = await createResume(payload);
        deductCvCredit();
        // Update URL so subsequent saves update the same resume (not create duplicates)
        router.replace(`/builder?id=${created.id}`);
      }
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  const AITrigger = ({ id, label }: { id: string; label: string }) => {
    const used = usedAI.has(id);
    return (
      <button
        onClick={() => setAiOpen(prev => prev === id ? null : id)}
        style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: "4px", border: `1px solid ${used ? THEME.border : aiOpen === id ? THEME.gold : THEME.border}`, background: used ? "transparent" : aiOpen === id ? "rgba(201,169,110,.1)" : "transparent", color: used ? THEME.textMuted : aiOpen === id ? THEME.primary : THEME.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.5px", transition: "all 0.15s", fontFamily: "'IBM Plex Mono', monospace", opacity: used ? 0.6 : 1 }}
        title={used ? "AI already used — click to view suggestions" : "Open AI assistant"}
      >
        {used
          ? <Check size={11} color={THEME.success} />
          : <Sparkles size={11} color={aiOpen === id ? THEME.gold : THEME.textMuted} />}
        {used ? "AI Used" : label}
      </button>
    );
  };

  const toggleCollapse = (id: string) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  if (loadingCV) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: THEME.background, fontFamily: THEME.fontFamily }}>
      <div style={{ textAlign: "center", padding: "0 24px" }}>
        {/* Animated document icon */}
        <div style={{ position: "relative", width: 72, height: 72, margin: "0 auto 28px" }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, background: THEME.darkBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={32} color={THEME.gold} />
          </div>
          {/* Orbiting dot */}
          <div style={{ position: "absolute", inset: -6, borderRadius: "50%", border: `2px solid transparent`, borderTopColor: THEME.gold, animation: "spin .9s linear infinite" }} />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: THEME.textMain, letterSpacing: "-0.5px", marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>
          Opening your CV
        </h2>
        <p style={{ fontSize: 14, color: THEME.textMuted, marginBottom: 28, lineHeight: 1.6 }}>
          Parsing your document and setting up the editor…
        </p>
        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 260, margin: "0 auto", textAlign: "left" }}>
          {[
            { label: "Reading document structure", done: true },
            { label: "Mapping fields to editor", done: true },
            { label: "Preparing live preview", done: false },
          ].map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: step.done ? THEME.gold : "transparent", border: step.done ? "none" : `2px solid ${THEME.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .3s" }}>
                {step.done
                  ? <Check size={11} color={THEME.primary} strokeWidth={3} />
                  : <div style={{ width: 6, height: 6, borderRadius: "50%", border: `2px solid ${THEME.gold}`, borderTopColor: "transparent", animation: "spin .7s linear infinite" }} />}
              </div>
              <span style={{ fontSize: 13, color: step.done ? THEME.textMain : THEME.textMuted, fontWeight: step.done ? 500 : 400 }}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loadError) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: THEME.background, fontFamily: THEME.fontFamily }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(201,78,42,.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <AlertCircle size={24} color={THEME.danger} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: THEME.textMain, marginBottom: 8 }}>Couldn&apos;t load CV</h2>
        <p style={{ fontSize: 14, color: THEME.textMuted, marginBottom: 24, lineHeight: 1.6 }}>This document couldn&apos;t be loaded. It may have been deleted or you may not have permission to view it.</p>
        <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 6, background: THEME.primary, color: "#fff", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: THEME.background, fontFamily: THEME.fontFamily }}>
      
      {/* ── HEADER ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px", height: 56,
        background: THEME.darkBg, borderBottom: "1px solid rgba(255,255,255,0.1)",
        color: "#fff", gap: 12, overflow: "hidden",
      }}>

        {/* LEFT: Back + doc name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, minWidth: 0 }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 4, color: "#94A3B8", textDecoration: "none", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap", flexShrink: 0 }}>
            <ChevronLeft size={14} /> Back
          </Link>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.18)", flexShrink: 0 }} />
          <FileText size={15} color={THEME.gold} style={{ flexShrink: 0 }} />
          <input
            value={cv.personal.name || "Untitled"}
            onChange={e => upP("name", e.target.value)}
            style={{ border: "none", background: "transparent", fontSize: 14, fontWeight: 600, color: "#fff", outline: "none", width: isMobile ? 90 : 160, minWidth: 60, fontFamily: THEME.fontFamily }}
          />
        </div>

        {/* RIGHT: controls — all compact */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>

          {/* Template dropdown — replaces 8-button row */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Layout size={13} color="#94A3B8" />
            <select
              value={template}
              onChange={e => setTemplate(e.target.value)}
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", borderRadius: 4, padding: "5px 6px", fontSize: 12, fontWeight: 600, cursor: "pointer", outline: "none", fontFamily: THEME.fontFamily }}
            >
              {TEMPLATES.map(t => (
                <option key={t.id} value={t.id} style={{ background: "#1E293B", color: "#fff" }}>{t.label}</option>
              ))}
            </select>
          </div>

          <div style={{ width: 1, height: 18, background: "rgba(255,255,255,0.12)" }} />

          {/* ATS — hidden on mobile */}
          {!isMobile && (
            <button onClick={() => setShowATS(a => !a)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 4, background: showATS ? "rgba(37,99,235,.22)" : "rgba(255,255,255,.06)", border: `1px solid ${showATS ? THEME.gold : "rgba(255,255,255,.18)"}`, color: showATS ? THEME.gold : "#94A3B8", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              <BarChart2 size={13} /> ATS
            </button>
          )}

          {/* Preview toggle — hidden on mobile (bottom bar handles it) */}
          {!isMobile && (
            <button onClick={() => setShowPreview(p => !p)} title={showPreview ? "Editor only" : "Split view"} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "5px 8px", borderRadius: 4, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,0.18)", color: "#94A3B8", cursor: "pointer" }}>
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          )}

          {/* Credits badge — hidden on mobile */}
          {credits !== null && !isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", borderRadius: 4, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", whiteSpace: "nowrap" }}>
              <span style={{ color: credits.cvCredits === 0 ? "#F87171" : credits.cvCredits <= 1 ? "#FCD34D" : "#6EE7B7" }}>CV:{credits.cvCredits}</span>
              <span style={{ color: "rgba(255,255,255,.25)" }}>|</span>
              <span style={{ color: credits.exportCredits === 0 ? "#F87171" : credits.exportCredits <= 1 ? "#FCD34D" : "#6EE7B7" }}>Ex:{credits.exportCredits}</span>
            </div>
          )}

          {/* Save */}
          <button onClick={handleSave} disabled={saveState === "saving"} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 4, background: saveState === "saved" ? THEME.success : saveState === "error" ? THEME.danger : THEME.primary, color: "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? <><Check size={13} />{!isMobile && "Saved"}</> : saveState === "error" ? "Error!" : <><Save size={13} />{!isMobile && "Save"}</>}
          </button>

          {/* Export */}
          <button
            onClick={credits !== null && credits.exportCredits === 0 ? openBuyModal : handleDownload}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 4, background: credits !== null && credits.exportCredits === 0 ? "#374151" : "#fff", color: credits !== null && credits.exportCredits === 0 ? "#9CA3AF" : THEME.darkBg, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
            title={credits !== null && credits.exportCredits === 0 ? "No export credits — click to buy" : "Download CV"}>
            <Download size={13} /> {isMobile ? "" : (credits !== null && credits.exportCredits === 0 ? "Buy Credits" : "Export PDF")}
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── EDITOR PANEL (accordion cards, 50% width) ── */}
        <div style={{ width: isMobile ? "100%" : "50%", background: THEME.surface, borderRight: `1px solid ${THEME.border}`, display: isMobile && showPreview ? "none" : "flex", flexDirection: "column", overflowY: "auto", paddingBottom: isMobile ? 52 : 0 }}>

          <div style={{ padding: "14px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>

            {/* ── PERSONAL INFO CARD ── */}
            {(() => {
              const open = !collapsed["__personal"];
              return (
                <div style={{ borderRadius: 8, border: `1px solid ${THEME.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                  <button onClick={() => toggleCollapse("__personal")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: open ? THEME.darkBg : THEME.background, border: "none", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 4, height: 16, borderRadius: 2, background: "#2563EB" }} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: open ? "#fff" : THEME.textMain, letterSpacing: "0.3px", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase" }}>Personal Info</span>
                    </div>
                    {open ? <ChevronUp size={15} color={open ? "#94A3B8" : THEME.textMuted} /> : <ChevronDown size={15} color={THEME.textMuted} />}
                  </button>
                  {open && (
                    <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <div><label style={labelStyle}>Full Name</label><input style={inputStyle} value={cv.personal.name} onChange={e => upP("name", e.target.value)} onFocus={onFocus} onBlur={onBlur} /></div>
                        <div><label style={labelStyle}>Email</label><input style={inputStyle} type="email" value={cv.personal.email} onChange={e => upP("email", e.target.value)} onFocus={onFocus} onBlur={onBlur} /></div>
                        <div><label style={labelStyle}>Phone</label><input style={inputStyle} value={cv.personal.phone} onChange={e => upP("phone", e.target.value)} onFocus={onFocus} onBlur={onBlur} /></div>
                        <div><label style={labelStyle}>Location</label><input style={inputStyle} value={cv.personal.location} onChange={e => upP("location", e.target.value)} onFocus={onFocus} onBlur={onBlur} /></div>
                        <div><label style={labelStyle}>LinkedIn</label><input style={inputStyle} value={cv.personal.linkedin} onChange={e => upP("linkedin", e.target.value)} onFocus={onFocus} onBlur={onBlur} /></div>
                        <div><label style={labelStyle}>GitHub</label><input style={inputStyle} value={cv.personal.github} onChange={e => upP("github", e.target.value)} onFocus={onFocus} onBlur={onBlur} /></div>
                        <div style={{ gridColumn: "1/-1" }}><label style={labelStyle}>Website</label><input style={inputStyle} value={cv.personal.website} onChange={e => upP("website", e.target.value)} onFocus={onFocus} onBlur={onBlur} /></div>
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <label style={{ ...labelStyle, margin: 0 }}>Professional Summary</label>
                          <AITrigger id="summary" label="Auto-Write" />
                        </div>
                        <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 100 }} value={cv.personal.summary} onChange={e => upP("summary", e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                        {aiOpen === "summary" && <AIBox context="summary" cv={cv} setCV={setCV} onClose={() => setAiOpen(null)} onUsed={() => { markAIUsed("summary"); }} alreadyUsed={usedAI.has("summary")} />}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── EXPERIENCE CARD ── */}
            {(() => {
              const open = !collapsed["__experience"];
              return (
                <div style={{ borderRadius: 8, border: `1px solid ${THEME.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                  <button onClick={() => toggleCollapse("__experience")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: open ? THEME.darkBg : THEME.background, border: "none", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 4, height: 16, borderRadius: 2, background: "#10B981" }} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: open ? "#fff" : THEME.textMain, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase" }}>Experience</span>
                    </div>
                    {open ? <ChevronUp size={15} color={open ? "#94A3B8" : THEME.textMuted} /> : <ChevronDown size={15} color={THEME.textMuted} />}
                  </button>
                  {open && (
                    <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {cv.experience.map((exp, ei) => (
                        <div key={exp.id} draggable onDragStart={() => { dragExpIdx.current = ei; }} onDragEnter={() => { dragExpOverIdx.current = ei; }} onDragEnd={() => { const from = dragExpIdx.current; const to = dragExpOverIdx.current; if (from >= 0 && to >= 0 && from !== to) setCV(c => { const arr = [...c.experience]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return { ...c, experience: arr }; }); dragExpIdx.current = -1; dragExpOverIdx.current = -1; }} onDragOver={e => e.preventDefault()} style={{ borderRadius: 6, border: `1px solid ${THEME.border}`, background: THEME.surface }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: THEME.background, borderBottom: collapsed[exp.id] ? "none" : `1px solid ${THEME.border}`, borderRadius: collapsed[exp.id] ? 6 : "6px 6px 0 0" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: THEME.textMain }}>
                              {exp.role || `Experience #${ei + 1}`}{exp.company && <span style={{ fontWeight: 400, color: THEME.textMuted, marginLeft: 6 }}>@ {exp.company}</span>}
                            </p>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <GripVertical size={14} color={THEME.textMuted} style={{ cursor: "grab" }} />
                              <button onClick={() => toggleCollapse(exp.id)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 2 }}>{collapsed[exp.id] ? <ChevronDown size={15} /> : <ChevronUp size={15} />}</button>
                              <button onClick={() => setCV(c => ({ ...c, experience: c.experience.filter(e => e.id !== exp.id) }))} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.danger, padding: 2 }}><Trash2 size={15} /></button>
                            </div>
                          </div>
                          {!collapsed[exp.id] && (
                            <div style={{ padding: "14px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                                {(["role", "company", "period", "location"] as const).map(f => (<div key={f}><label style={labelStyle}>{f}</label><input style={inputStyle} value={exp[f] || ""} onChange={e => setCV(c => ({ ...c, experience: c.experience.map(ex => ex.id === exp.id ? { ...ex, [f]: e.target.value } : ex) }))} onFocus={onFocus} onBlur={onBlur} /></div>))}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                <label style={{ ...labelStyle, margin: 0 }}>Responsibilities</label>
                                <AITrigger id={`exp-${exp.id}`} label="Enhance" />
                              </div>
                              {exp.bullets.map((b, bi) => (
                                <div key={bi} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                                  <input style={{ ...inputStyle, flex: 1 }} value={b} onChange={e => { const val = e.target.value; setCV(c => ({ ...c, experience: c.experience.map(ex => ex.id === exp.id ? { ...ex, bullets: ex.bullets.map((x, j) => j === bi ? val : x) } : ex) })); }} onFocus={onFocus} onBlur={onBlur} />
                                  {exp.bullets.length > 1 && <button onClick={() => setCV(c => ({ ...c, experience: c.experience.map(e => e.id === exp.id ? { ...e, bullets: e.bullets.filter((_, j) => j !== bi) } : e) }))} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 2 }}><X size={16} /></button>}
                                </div>
                              ))}
                              <button onClick={() => setCV(c => ({ ...c, experience: c.experience.map(e => e.id === exp.id ? { ...e, bullets: [...e.bullets, ""] } : e) }))} style={{ fontSize: 12, color: THEME.primary, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 5, fontWeight: 600, marginTop: 6 }}><Plus size={14} /> Add bullet</button>
                              {aiOpen === `exp-${exp.id}` && <AIBox context="experience-bullets" targetId={exp.id} cv={cv} setCV={setCV} onClose={() => setAiOpen(null)} onUsed={() => { markAIUsed(`exp-${exp.id}`); }} alreadyUsed={usedAI.has(`exp-${exp.id}`)} />}
                            </div>
                          )}
                        </div>
                      ))}
                      <button onClick={() => setCV(c => ({ ...c, experience: [...c.experience, { id: `e${Date.now()}`, company: "", role: "", period: "", location: "", bullets: [""] }] }))} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "10px", borderRadius: 6, border: `2px dashed ${THEME.border}`, color: THEME.textMuted, background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>+ Add Experience</button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── EDUCATION CARD ── */}
            {(() => {
              const open = !collapsed["__education"];
              return (
                <div style={{ borderRadius: 8, border: `1px solid ${THEME.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                  <button onClick={() => toggleCollapse("__education")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: open ? THEME.darkBg : THEME.background, border: "none", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 4, height: 16, borderRadius: 2, background: "#F59E0B" }} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: open ? "#fff" : THEME.textMain, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase" }}>Education</span>
                    </div>
                    {open ? <ChevronUp size={15} color={open ? "#94A3B8" : THEME.textMuted} /> : <ChevronDown size={15} color={THEME.textMuted} />}
                  </button>
                  {open && (
                    <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {cv.education.map(edu => (
                        <div key={edu.id} draggable onDragStart={() => { dragEduIdx.current = cv.education.indexOf(edu); }} onDragEnter={() => { dragEduOverIdx.current = cv.education.indexOf(edu); }} onDragEnd={() => { const from = dragEduIdx.current; const to = dragEduOverIdx.current; if (from >= 0 && to >= 0 && from !== to) setCV(c => { const arr = [...c.education]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return { ...c, education: arr }; }); dragEduIdx.current = -1; dragEduOverIdx.current = -1; }} onDragOver={e => e.preventDefault()} style={{ borderRadius: 6, border: `1px solid ${THEME.border}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: THEME.background, borderBottom: collapsed[edu.id] ? "none" : `1px solid ${THEME.border}`, borderRadius: collapsed[edu.id] ? 6 : "6px 6px 0 0" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: THEME.textMain }}>{edu.degree || "Degree"}{edu.school && <span style={{ fontWeight: 400, color: THEME.textMuted, marginLeft: 6 }}>@ {edu.school}</span>}</p>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <GripVertical size={14} color={THEME.textMuted} style={{ cursor: "grab" }} />
                              <button onClick={() => toggleCollapse(edu.id)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 2 }}>{collapsed[edu.id] ? <ChevronDown size={15} /> : <ChevronUp size={15} />}</button>
                              <button onClick={() => setCV(c => ({ ...c, education: c.education.filter(e => e.id !== edu.id) }))} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.danger, padding: 2 }}><Trash2 size={15} /></button>
                            </div>
                          </div>
                          {!collapsed[edu.id] && (
                            <div style={{ padding: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                              {(["degree", "field", "school", "period", "gpa", "honors"] as const).map(f => (<div key={f}><label style={labelStyle}>{f}</label><input style={inputStyle} value={edu[f] || ""} onChange={e => setCV(c => ({ ...c, education: c.education.map(ed => ed.id === edu.id ? { ...ed, [f]: e.target.value } : ed) }))} onFocus={onFocus} onBlur={onBlur} /></div>))}
                            </div>
                          )}
                        </div>
                      ))}
                      <button onClick={() => setCV(c => ({ ...c, education: [...c.education, { id: `ed${Date.now()}`, school: "", degree: "", field: "", period: "", gpa: "", honors: "" }] }))} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "10px", borderRadius: 6, border: `2px dashed ${THEME.border}`, color: THEME.textMuted, background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>+ Add Education</button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── SKILLS CARD ── */}
            {(() => {
              const open = !collapsed["__skills"];
              return (
                <div style={{ borderRadius: 8, border: `1px solid ${THEME.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                  <button onClick={() => toggleCollapse("__skills")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: open ? THEME.darkBg : THEME.background, border: "none", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 4, height: 16, borderRadius: 2, background: "#8B5CF6" }} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: open ? "#fff" : THEME.textMain, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase" }}>Skills</span>
                    </div>
                    {open ? <ChevronUp size={15} color={open ? "#94A3B8" : THEME.textMuted} /> : <ChevronDown size={15} color={THEME.textMuted} />}
                  </button>
                  {open && (
                    <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ borderRadius: 6, border: `1px solid ${THEME.border}` }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: THEME.background, borderBottom: `1px solid ${THEME.border}` }}>
                          <label style={{ ...labelStyle, margin: 0, fontSize: 12 }}>Technical Skills</label>
                          <AITrigger id="skills" label="Suggest" />
                        </div>
                        <div style={{ padding: "12px 14px" }}>
                          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} value={cv.skills.technical} onChange={e => setCV(c => ({ ...c, skills: { ...c.skills, technical: e.target.value } }))} placeholder="React, Node.js, Python, AWS" onFocus={onFocus} onBlur={onBlur} />
                        </div>
                        {aiOpen === "skills" && <div style={{ borderTop: `1px solid ${THEME.border}`, padding: "0 14px 14px" }}><AIBox context="skills" cv={cv} setCV={setCV} onClose={() => setAiOpen(null)} onUsed={() => { markAIUsed("skills"); }} alreadyUsed={usedAI.has("skills")} /></div>}
                      </div>
                      {template === "Sidebar" && cv.skills.technical.trim() && (
                        <div style={{ borderRadius: 6, border: `1px solid ${THEME.border}`, overflow: "hidden" }}>
                          <div style={{ padding: "8px 14px", background: THEME.background, borderBottom: `1px solid ${THEME.border}` }}>
                            <label style={{ ...labelStyle, margin: 0, fontSize: 11 }}>Skill Levels (stars shown in preview)</label>
                          </div>
                          <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                            {cv.skills.technical.split(",").map(s => s.trim()).filter(Boolean).map(skill => (
                              <div key={skill} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: 12, color: THEME.textMain, fontWeight: 500 }}>{skill}</span>
                                <div style={{ display: "flex", gap: 4 }}>
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} onClick={() => setCV(c => ({ ...c, skillLevels: { ...c.skillLevels, [skill]: star } }))}
                                      style={{ background: "none", border: "none", cursor: "pointer", padding: 2, fontSize: 16, color: star <= (cv.skillLevels?.[skill] ?? 4) ? "#8B5CF6" : "#D1D5DB" }}>★</button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {([["soft", "Soft Skills", "Leadership, Agile, Communication"], ["languages", "Languages", "English (Native), Hindi"], ["certifications", "Certifications", "AWS Developer, Scrum Master"]] as const).map(([f, label, ph]) => (
                        <div key={f}><label style={labelStyle}>{label}</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={cv.skills[f as keyof typeof cv.skills]} onChange={e => setCV(c => ({ ...c, skills: { ...c.skills, [f]: e.target.value } }))} placeholder={ph} onFocus={onFocus} onBlur={onBlur} /></div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── PROJECTS CARD ── */}
            {(() => {
              const open = !collapsed["__projects"];
              return (
                <div style={{ borderRadius: 8, border: `1px solid ${THEME.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                  <button onClick={() => toggleCollapse("__projects")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: open ? THEME.darkBg : THEME.background, border: "none", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 4, height: 16, borderRadius: 2, background: "#EC4899" }} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: open ? "#fff" : THEME.textMain, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase" }}>Projects</span>
                    </div>
                    {open ? <ChevronUp size={15} color={open ? "#94A3B8" : THEME.textMuted} /> : <ChevronDown size={15} color={THEME.textMuted} />}
                  </button>
                  {open && (
                    <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
                      {cv.projects.map(p => (
                        <div key={p.id} draggable onDragStart={() => { dragProjIdx.current = cv.projects.indexOf(p); }} onDragEnter={() => { dragProjOverIdx.current = cv.projects.indexOf(p); }} onDragEnd={() => { const from = dragProjIdx.current; const to = dragProjOverIdx.current; if (from >= 0 && to >= 0 && from !== to) setCV(c => { const arr = [...c.projects]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return { ...c, projects: arr }; }); dragProjIdx.current = -1; dragProjOverIdx.current = -1; }} onDragOver={e => e.preventDefault()} style={{ borderRadius: 6, border: `1px solid ${THEME.border}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: THEME.background, borderBottom: collapsed[p.id] ? "none" : `1px solid ${THEME.border}`, borderRadius: collapsed[p.id] ? 6 : "6px 6px 0 0" }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: THEME.textMain }}>{p.name || "Project"}{p.tech && <span style={{ fontWeight: 400, color: THEME.textMuted, marginLeft: 6 }}>| {p.tech}</span>}</p>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <GripVertical size={14} color={THEME.textMuted} style={{ cursor: "grab" }} />
                              <button onClick={() => toggleCollapse(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted, padding: 2 }}>{collapsed[p.id] ? <ChevronDown size={15} /> : <ChevronUp size={15} />}</button>
                              <button onClick={() => setCV(c => ({ ...c, projects: c.projects.filter(pr => pr.id !== p.id) }))} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.danger, padding: 2 }}><Trash2 size={15} /></button>
                            </div>
                          </div>
                          {!collapsed[p.id] && (
                            <div style={{ padding: "14px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                                {(["name", "tech"] as const).map(f => (<div key={f}><label style={labelStyle}>{f}</label><input style={inputStyle} value={p[f]} onChange={e => setCV(c => ({ ...c, projects: c.projects.map(pr => pr.id === p.id ? { ...pr, [f]: e.target.value } : pr) }))} onFocus={onFocus} onBlur={onBlur} /></div>))}
                              </div>
                              <div style={{ marginBottom: 12 }}><label style={labelStyle}>URL</label><input style={inputStyle} value={p.url} onChange={e => setCV(c => ({ ...c, projects: c.projects.map(pr => pr.id === p.id ? { ...pr, url: e.target.value } : pr) }))} onFocus={onFocus} onBlur={onBlur} /></div>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                  <label style={{ ...labelStyle, margin: 0 }}>Description</label>
                                  <AITrigger id={`proj-${p.id}`} label="Enhance" />
                                </div>
                                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} value={p.description} onChange={e => setCV(c => ({ ...c, projects: c.projects.map(pr => pr.id === p.id ? { ...pr, description: e.target.value } : pr) }))} onFocus={onFocus} onBlur={onBlur} />
                              </div>
                              {aiOpen === `proj-${p.id}` && <AIBox context="projects-description" targetId={p.id} cv={cv} setCV={setCV} onClose={() => setAiOpen(null)} onUsed={() => { markAIUsed(`proj-${p.id}`); }} alreadyUsed={usedAI.has(`proj-${p.id}`)} />}
                            </div>
                          )}
                        </div>
                      ))}
                      <button onClick={() => setCV(c => ({ ...c, projects: [...c.projects, { id: `p${Date.now()}`, name: "", tech: "", url: "", description: "" }] }))} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "10px", borderRadius: 6, border: `2px dashed ${THEME.border}`, color: THEME.textMuted, background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>+ Add Project</button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── ACHIEVEMENTS CARD ── */}
            {(() => {
              const open = !collapsed["__achievements"];
              return (
                <div style={{ borderRadius: 8, border: `1px solid ${THEME.border}`, background: "#fff", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
                  <button onClick={() => toggleCollapse("__achievements")} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: open ? THEME.darkBg : THEME.background, border: "none", cursor: "pointer", textAlign: "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 4, height: 16, borderRadius: 2, background: "#F97316" }} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: open ? "#fff" : THEME.textMain, fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase" }}>Achievements</span>
                    </div>
                    {open ? <ChevronUp size={15} color={open ? "#94A3B8" : THEME.textMuted} /> : <ChevronDown size={15} color={THEME.textMuted} />}
                  </button>
                  {open && (
                    <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {cv.achievements.map((a, i) => (
                        <div key={a.id} draggable onDragStart={() => { dragAchIdx.current = i; }} onDragEnter={() => { dragAchOverIdx.current = i; }} onDragEnd={() => { const from = dragAchIdx.current; const to = dragAchOverIdx.current; if (from >= 0 && to >= 0 && from !== to) setCV(c => { const arr = [...c.achievements]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return { ...c, achievements: arr }; }); dragAchIdx.current = -1; dragAchOverIdx.current = -1; }} onDragOver={e => e.preventDefault()} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <GripVertical size={14} color={THEME.textMuted} style={{ flexShrink: 0, cursor: "grab" }} />
                          <input style={{ ...inputStyle, flex: 1 }} value={a.text} onChange={e => setCV(c => ({ ...c, achievements: c.achievements.map((x, j) => j === i ? { ...x, text: e.target.value } : x) }))} onFocus={onFocus} onBlur={onBlur} />
                          <button onClick={() => setCV(c => ({ ...c, achievements: c.achievements.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.danger, padding: 2 }}><Trash2 size={16} /></button>
                        </div>
                      ))}
                      <button onClick={() => setCV(c => ({ ...c, achievements: [...c.achievements, { id: `a${Date.now()}`, text: "" }] }))} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "10px", borderRadius: 6, border: `2px dashed ${THEME.border}`, color: THEME.textMuted, background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>+ Add Achievement</button>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        </div>

        {/* ── ATS CHECK PANEL ── */}
        {showATS && (
          <div style={{ width: 320, background: THEME.surface, borderRight: `1px solid ${THEME.border}`, display: "flex", flexDirection: "column", flexShrink: 0, boxShadow: "5px 0 15px rgba(0,0,0,0.03)", zIndex: 10 }}>
            <div style={{ padding: "24px", borderBottom: `1px solid ${THEME.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: THEME.textMain, textTransform: "uppercase", letterSpacing: "0.5px" }}>ATS Analyzer</h3>
              <button onClick={() => setShowATS(false)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted }}><X size={18} /></button>
            </div>

            {!atsResult && (
              <div style={{ padding: "28px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 16 }}>Run the ATS check to see how well your CV will pass automated screening.</p>
                <button onClick={runATS} disabled={atsLoading} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 6, background: atsLoading ? THEME.textMuted : THEME.primary, color: "#fff", border: "none", cursor: atsLoading ? "default" : "pointer", fontSize: 13, fontWeight: 600 }}>
                  <BarChart2 size={14} />{atsLoading ? "Analyzing…" : "Run ATS Check"}
                </button>
              </div>
            )}

            {atsResult && (
              <>
                {/* Score */}
                <div style={{ padding: "28px 24px", textAlign: "center", borderBottom: `1px solid ${THEME.border}` }}>
                  <p style={{ fontSize: 68, fontWeight: 800, lineHeight: 1, color: atsResult.score >= 70 ? THEME.success : atsResult.score >= 40 ? "#F59E0B" : THEME.danger, letterSpacing: "-3px", marginBottom: 14 }}>{atsResult.score}</p>
                  <div style={{ height: 5, background: THEME.border, borderRadius: "3px", overflow: "hidden", marginBottom: 10 }}>
                    <div style={{ height: "100%", width: `${atsResult.score}%`, background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.gold})`, borderRadius: "3px", transition: "width 0.6s ease" }} />
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: THEME.textMuted }}>{atsResult.score >= 70 ? "Good foundation — keep improving!" : atsResult.score >= 40 ? "Needs improvement — check suggestions." : "Significant gaps — see suggestions."}</p>
                  <button onClick={runATS} disabled={atsLoading} style={{ marginTop: 10, fontSize: 11, color: THEME.textMuted, background: "none", border: `1px solid ${THEME.border}`, borderRadius: 4, padding: "4px 10px", cursor: "pointer" }}>{atsLoading ? "Re-analyzing…" : "Re-run"}</button>
                </div>

                <div style={{ overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {atsResult.strongPoints.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: THEME.success, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Strong Points</p>
                      {atsResult.strongPoints.map((pt, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, padding: "8px 10px", borderRadius: 4, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", marginBottom: 6 }}>
                          <Check size={13} color={THEME.success} style={{ flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: 12, color: THEME.textMain, lineHeight: 1.45 }}>{pt}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {atsResult.missing_keywords.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: THEME.danger, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Missing Keywords</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {atsResult.missing_keywords.map((kw, i) => (
                          <span key={i} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 12, background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)", color: THEME.danger }}>{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {atsResult.suggestions.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 700, color: THEME.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Suggestions</p>
                      {atsResult.suggestions.map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, padding: "8px 10px", borderRadius: 4, background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.15)", marginBottom: 6 }}>
                          <AlertCircle size={13} color={THEME.gold} style={{ flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: 12, color: THEME.textMain, lineHeight: 1.45 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── LIVE PREVIEW ── */}
        {showPreview && (
          <div style={{ flex: 1, width: isMobile ? "100%" : undefined, background: "#E5E7EB", display: "flex", overflow: "hidden", position: "relative", paddingBottom: isMobile ? 52 : 0 }}>

            {/* ── Zoom controls (real) ── */}
            <div style={{ position: "fixed", bottom: isMobile ? 60 : 24, right: 20, background: THEME.darkBg, padding: "6px 10px", borderRadius: "30px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.22)", zIndex: 60 }}>
              <button
                onClick={() => setZoom(z => Math.max(30, z - 10))}
                disabled={zoom <= 30}
                style={{ background: "none", border: "none", cursor: zoom > 30 ? "pointer" : "default", color: zoom > 30 ? "#fff" : "#64748B", fontSize: 20, lineHeight: 1, padding: "0 3px", display: "flex", alignItems: "center", fontWeight: 300 }}>
                −
              </button>
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 600, minWidth: 38, textAlign: "center", fontFamily: "'IBM Plex Mono', monospace" }}>{zoom}%</span>
              <button
                onClick={() => setZoom(z => Math.min(150, z + 10))}
                disabled={zoom >= 150}
                style={{ background: "none", border: "none", cursor: zoom < 150 ? "pointer" : "default", color: zoom < 150 ? "#fff" : "#64748B", fontSize: 20, lineHeight: 1, padding: "0 3px", display: "flex", alignItems: "center", fontWeight: 300 }}>
                +
              </button>
              <div style={{ width: 1, height: 16, background: "rgba(255,255,255,.18)" }} />
              <button
                onClick={() => setZoom(isMobile ? Math.max(30, Math.round((window.innerWidth - 32) / 794 * 100)) : 100)}
                title="Reset zoom"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8", fontSize: 11, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace", padding: "0 2px" }}>
                ↺
              </button>
            </div>

            <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", padding: isMobile ? "16px 0" : "40px" }}>
              {/* Sizing wrapper: occupies the visual space of the scaled A4 page (794×1123 px at 96dpi) */}
              <div style={{
                width: `${Math.round(794 * zoom / 100)}px`,
                minHeight: `${Math.round(1123 * zoom / 100)}px`,
                position: "relative",
                flexShrink: 0,
              }}>
                {/* Scale wrapper — transform lives here, NOT on previewRef, so download HTML is clean */}
                <div style={{
                  transformOrigin: "top left",
                  transform: `scale(${zoom / 100})`,
                  width: "210mm",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}>
                  <div ref={previewRef} style={{ width: "210mm", minHeight: "297mm", background: "#fff", boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
                    <Preview cv={cv} template={template} setCV={setCV} />
                  </div>
                  {/* Page-break indicator lines */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", backgroundImage: "repeating-linear-gradient(transparent 0, transparent calc(297mm - 2px), rgba(59,130,246,0.35) calc(297mm - 2px), rgba(59,130,246,0.35) calc(297mm))", backgroundSize: "100% 297mm", zIndex: 10 }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE BOTTOM BAR ── */}
      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: THEME.darkBg, borderTop: "1px solid rgba(255,255,255,.12)", display: "flex", height: 52 }}>
          <button onClick={() => setShowPreview(false)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: !showPreview ? "rgba(255,255,255,.1)" : "none", color: !showPreview ? "#fff" : "#64748B", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", borderRight: "1px solid rgba(255,255,255,.08)" }}>
            <FileText size={15} /> Edit
          </button>
          <button onClick={() => setShowPreview(true)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: showPreview ? "rgba(255,255,255,.1)" : "none", color: showPreview ? "#fff" : "#64748B", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <Eye size={15} /> Preview
          </button>
        </div>
      )}

    </div>
  );
}

export default function Builder() {
  return (
    <Suspense>
      <BuilderInner />
    </Suspense>
  );
}