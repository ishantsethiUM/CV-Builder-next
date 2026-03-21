"use client";
import Link from "next/link";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createResume, updateResume, getResume, aiBullets, aiImprove } from "@/lib/api";
import { useCredits } from "@/contexts/CreditsContext";
import {
  FileText, ChevronLeft, Save, Download, Sparkles,
  BarChart2, Plus, Trash2, X, Check, AlertCircle,
  User, Briefcase, GraduationCap, Wrench, FolderOpen, Award,
  Eye, EyeOff, ChevronDown, ChevronUp, Layout, GripVertical
} from "lucide-react";

// Types
type CV = {
  personal: { name: string; email: string; phone: string; location: string; linkedin: string; github: string; website: string; summary: string };
  experience: { id: string; company: string; role: string; period: string; location: string; bullets: string[] }[];
  education: { id: string; school: string; degree: string; field: string; period: string; gpa: string; honors: string }[];
  skills: { technical: string; soft: string; languages: string; certifications: string };
  projects: { id: string; name: string; tech: string; url: string; description: string }[];
  achievements: { id: string; text: string }[];
};

const INIT: CV = {
  personal: { name: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "", summary: "" },
  experience: [], education: [],
  skills: { technical: "", soft: "", languages: "", certifications: "" },
  projects: [], achievements: [],
};

const TABS = [
  { id: "Personal", icon: User, label: "Personal Info" },
  { id: "Experience", icon: Briefcase, label: "Experience" },
  { id: "Education", icon: GraduationCap, label: "Education" },
  { id: "Skills", icon: Wrench, label: "Skills" },
  { id: "Projects", icon: FolderOpen, label: "Projects" },
  { id: "Achievements", icon: Award, label: "Achievements" },
];

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
  primary: "#1A3628",    // --forest
  gold: "#C9A96E",       // --gold
  darkBg: "#111110",     // --charcoal
  surface: "#FFFFFF",    // --white
  background: "#F8F7F2", // --cream
  border: "#E2DFD6",     // --border
  textMain: "#1E1E18",   // --ink
  textMuted: "#74746A",  // --muted
  danger: "#C94E2A",     // --ember
  success: "#2d7a4f",    // green
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
};

// ── Click-to-edit inline component ───────────────────────────────────────────
type SetCV = React.Dispatch<React.SetStateAction<CV>>;

function EditableSpan({
  value, onChange, style, placeholder = "Click to edit", multiline = false, className
}: {
  value: string; onChange: (v: string) => void; style?: React.CSSProperties;
  placeholder?: string; multiline?: boolean; className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const GOLD = "#C9A96E";

  const hoverStyle: React.CSSProperties = {
    cursor: "text",
    borderBottom: `1.5px dashed ${GOLD}66`,
    transition: "border-color .15s",
    minWidth: 20,
    display: "inline-block",
  };
  const baseInputStyle: React.CSSProperties = {
    ...style,
    border: `1.5px solid ${GOLD}`,
    borderRadius: 3,
    outline: "none",
    background: `${GOLD}0d`,
    boxShadow: `0 0 0 3px ${GOLD}22`,
    padding: "1px 4px",
    fontFamily: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
    color: "inherit",
    letterSpacing: "inherit",
    lineHeight: "inherit",
    width: "100%",
    resize: multiline ? "vertical" : undefined,
  };

  if (editing) {
    if (multiline) {
      return (
        <textarea autoFocus value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={e => { if (e.key === "Escape") setEditing(false); }}
          style={{ ...baseInputStyle, minHeight: 56, display: "block" }}
          className={className}
        />
      );
    }
    return (
      <input autoFocus value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditing(false); }}
        style={baseInputStyle}
        className={className}
      />
    );
  }

  return (
    <span
      role="button" tabIndex={0} title="Click to edit"
      onClick={() => setEditing(true)}
      onKeyDown={e => { if (e.key === "Enter") setEditing(true); }}
      style={{ ...style, ...hoverStyle }}
      onMouseEnter={e => (e.currentTarget.style.borderBottomColor = `${GOLD}cc`)}
      onMouseLeave={e => (e.currentTarget.style.borderBottomColor = `${GOLD}66`)}
      className={className}
    >
      {value || <span style={{ color: "#bbb", fontStyle: "italic", fontWeight: 400 }}>{placeholder}</span>}
    </span>
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

  // Deterministic tick level per skill (avoids re-render flicker)
  const tickLevel = (str: string, idx: number) =>
    ((str.charCodeAt(0) + str.length + idx) % 3) + 4; // 4-6 out of 7

  const TickBar = ({ label, level }: { label: string; level: number }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
      <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: ACCENT, flex: 1 }}>{label}</p>
      <div style={{ display: "flex", gap: 2 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} style={{ width: 6, height: 8, borderRadius: 1, background: i < level ? ACCENT : "#CCCCCC" }} />
        ))}
      </div>
    </div>
  );

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
              <TickBar key={i} label={skill} level={tickLevel(skill, i)} />
            ))}
          </>
        )}

        {/* Languages with tick bars */}
        {languages.length > 0 && (
          <>
            <SideHead title="Language" />
            {languages.map((lang, i) => (
              <TickBar key={i} label={lang} level={tickLevel(lang, i)} />
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
              return <TickBar key={i} label={sk} level={tickLevel(sk, i)} />;
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
function AIBox({ context, targetId, cv, setCV, onClose }: { context: string, targetId?: string, cv: CV, setCV: any, onClose: () => void }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!input.trim()) return;
    setLoading(true); setError(""); setSuggestions([]);
    try {
      let results = context === "skills" 
        ? (await aiImprove(input)).flatMap(r => r.split(",").map(s => s.trim())).filter(Boolean)
        : await aiBullets(input);
      setSuggestions(results.map((text: string) => ({ text, inserted: false })));
    } catch (e: any) { setError(e.message || "Request failed."); } 
    finally { setLoading(false); }
  };

  const toggle = (idx: number) => {
    const s = suggestions[idx];
    if (!s.inserted) {
      if (context === "experience-bullets" && targetId) setCV((c: CV) => ({ ...c, experience: c.experience.map(e => e.id === targetId ? { ...e, bullets: [...e.bullets.filter(b => b.trim()), s.text] } : e) }));
      else if (context === "skills") setCV((c: CV) => ({ ...c, skills: { ...c.skills, technical: [...c.skills.technical.split(",").map(x => x.trim()).filter(Boolean), s.text].join(", ") } }));
      else if (context === "projects-description" && targetId) setCV((c: CV) => ({ ...c, projects: c.projects.map(p => p.id === targetId ? { ...p, description: s.text } : p) }));
      else if (context === "summary") setCV((c: CV) => ({ ...c, personal: { ...c.personal, summary: s.text } }));
    } else {
      if (context === "experience-bullets" && targetId) setCV((c: CV) => ({ ...c, experience: c.experience.map(e => e.id === targetId ? { ...e, bullets: e.bullets.filter(b => b !== s.text) } : e) }));
      else if (context === "skills") setCV((c: CV) => ({ ...c, skills: { ...c.skills, technical: c.skills.technical.split(",").map(x => x.trim()).filter(x => x !== s.text).join(", ") } }));
      else if (context === "projects-description" && targetId) setCV((c: CV) => ({ ...c, projects: c.projects.map(p => p.id === targetId ? { ...p, description: "" } : p) }));
      else if (context === "summary") setCV((c: CV) => ({ ...c, personal: { ...c.personal, summary: "" } }));
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
      <button onClick={generate} disabled={loading || !input.trim()} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, padding: "8px 18px", borderRadius: "4px", background: loading || !input.trim() ? THEME.textMuted : THEME.primary, color: "#fff", border: "none", cursor: loading ? "default" : "pointer", fontSize: 13, fontWeight: 600, opacity: !input.trim() ? 0.6 : 1 }}>
        <Sparkles size={13} />{loading ? "Generating…" : "Generate Suggestions"}
      </button>
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
  const resumeId = searchParams.get("id");

  const [cv, setCV] = useState<CV>(INIT);
  const [tab, setTab] = useState("Personal");
  const [template, setTemplate] = useState("Minimal");
  const [showATS, setShowATS] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loadingCV, setLoadingCV] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [aiOpen, setAiOpen] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const previewRef = useRef<HTMLDivElement>(null);
  const { credits, openBuyModal, doTrackExport, deductExportCredit } = useCredits();
  const dragExpIdx = useRef(-1);
  const dragExpOverIdx = useRef(-1);
  const dragEduIdx = useRef(-1);
  const dragEduOverIdx = useRef(-1);
  const dragProjIdx = useRef(-1);
  const dragProjOverIdx = useRef(-1);
  const dragAchIdx = useRef(-1);
  const dragAchOverIdx = useRef(-1);

  useEffect(() => { setAiOpen(null); }, [tab]);

  useEffect(() => {
    if (!resumeId) return;
    setLoadingCV(true);
    getResume(resumeId).then(r => { if (r.data) setCV(r.data as unknown as CV); setTemplate(r.template || "Minimal"); }).catch(() => setLoadError(true)).finally(() => setLoadingCV(false));
  }, [resumeId]);

  const upP = (f: string, v: string) => setCV(c => ({ ...c, personal: { ...c.personal, [f]: v } }));

  const handleDownload = async () => {
    if (credits !== null && credits.exportCredits === 0) { openBuyModal(); return; }
    const el = previewRef.current;
    if (!el) return;
    const html = `<!DOCTYPE html><html><head>
      <meta charset="utf-8"/>
      <title>${cv.personal.name || "CV"}</title>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>
        @page { size: A4; margin: 0; }
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      </style>
    </head><body>${el.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) return;
    deductExportCredit();
    doTrackExport(resumeId ?? undefined).catch(() => null);
    setTimeout(() => { win.focus(); win.print(); URL.revokeObjectURL(url); }, 900);
  };

  const handleSave = async () => {
    setSaveState("saving");
    try {
      const payload = { data: cv as unknown as Record<string, unknown>, template, title: cv.personal.name || "My CV" };
      resumeId ? await updateResume(resumeId, payload) : await createResume(payload);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  const AITrigger = ({ id, label }: { id: string; label: string }) => (
    <button onClick={() => setAiOpen(prev => prev === id ? null : id)}
      style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: "4px", border: `1px solid ${aiOpen === id ? THEME.gold : THEME.border}`, background: aiOpen === id ? "rgba(201,169,110,.1)" : "transparent", color: aiOpen === id ? THEME.primary : THEME.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.5px", transition: "all 0.15s", fontFamily: "'IBM Plex Mono', monospace" }}>
      <Sparkles size={11} color={aiOpen === id ? THEME.gold : THEME.textMuted} />{label}
    </button>
  );

  const toggleCollapse = (id: string) => setCollapsed(prev => ({ ...prev, [id]: !prev[id] }));

  if (loadingCV) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: THEME.background, fontFamily: THEME.fontFamily }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${THEME.border}`, borderTopColor: THEME.gold, borderRadius: "50%", margin: "0 auto 16px" }} className="spin" />
        <p style={{ fontSize: 14, fontWeight: 600, color: THEME.textMuted }}>Loading your document…</p>
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
      
      {/* ── HEADER (Corporate Studio Style) ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 60, background: THEME.darkBg, borderBottom: `1px solid rgba(255,255,255,0.1)`, color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 6, color: "#94A3B8", textDecoration: "none", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            <ChevronLeft size={16} /> Dashboard
          </Link>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.2)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={18} color={THEME.gold} />
            <input value={cv.personal.name || "Untitled Document"} onChange={e => upP("name", e.target.value)}
              style={{ border: "none", background: "transparent", fontSize: 16, fontWeight: 600, color: "#fff", outline: "none", minWidth: 200, fontFamily: THEME.fontFamily }} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Template Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderRight: "1px solid rgba(255,255,255,0.12)", paddingRight: 16 }}>
            <Layout size={13} color="#94A3B8" />
            <div style={{ display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: "5px", padding: 2 }}>
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)}
                  style={{ padding: "5px 13px", borderRadius: "3px", fontSize: 11, fontWeight: 700, border: "none", background: template === t.id ? THEME.gold : "transparent", color: template === t.id ? THEME.darkBg : "#94A3B8", cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.3px" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setShowATS(a => !a)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: "4px", background: showATS ? "rgba(201,169,110,.18)" : "rgba(255,255,255,.06)", border: `1px solid ${showATS ? THEME.gold : "rgba(255,255,255,.2)"}`, color: showATS ? THEME.gold : "#94A3B8", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
            <BarChart2 size={15} /> ATS Check
          </button>

          <button onClick={() => setShowPreview(p => !p)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: "4px", background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />} {showPreview ? "Editor Mode" : "Split View"}
          </button>

          <button onClick={handleSave} disabled={saveState === "saving"} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: "4px", background: saveState === "saved" ? THEME.success : saveState === "error" ? THEME.danger : THEME.primary, color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? <><Check size={16} />Saved</> : saveState === "error" ? "Error" : <><Save size={16} />Save Progress</>}
          </button>

          <button onClick={handleDownload} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: "4px", background: "#fff", color: THEME.darkBg, fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}>
            <Download size={16} /> Export PDF
          </button>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── EDITOR PANEL ── */}
        <div style={{ width: showPreview ? 500 : "100%", maxWidth: 800, margin: showPreview ? 0 : "0 auto", background: THEME.surface, borderRight: `1px solid ${THEME.border}`, display: "flex", flexDirection: "column", overflowY: "auto", boxShadow: showPreview ? "none" : "0 0 20px rgba(0,0,0,0.05)" }}>
          
          {/* Horizontal Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${THEME.border}`, padding: "0 24px", overflowX: "auto", flexShrink: 0, background: THEME.surface }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "16px 4px", marginRight: 24, fontSize: 12, fontWeight: 700, border: "none", borderBottom: tab === t.id ? `2px solid ${THEME.gold}` : "2px solid transparent", background: "transparent", color: tab === t.id ? THEME.primary : THEME.textMuted, cursor: "pointer", whiteSpace: "nowrap", marginBottom: -1, textTransform: "uppercase", letterSpacing: "0.6px", transition: "color 0.15s", fontFamily: "'IBM Plex Mono', monospace" }}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: "32px 24px", flex: 1 }}>

            {/* ── PERSONAL ── */}
            {tab === "Personal" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div><label style={labelStyle}>Full Name</label><input style={inputStyle} value={cv.personal.name} onChange={e => upP("name", e.target.value)} onFocus={onFocus} onBlur={onBlur} /></div>
                  <div><label style={labelStyle}>Email Address</label><input style={inputStyle} type="email" value={cv.personal.email} onChange={e => upP("email", e.target.value)} onFocus={onFocus} onBlur={onBlur} /></div>
                  <div><label style={labelStyle}>Phone Number</label><input style={inputStyle} value={cv.personal.phone} onChange={e => upP("phone", e.target.value)} onFocus={onFocus} onBlur={onBlur} /></div>
                  <div><label style={labelStyle}>Location (City, Country)</label><input style={inputStyle} value={cv.personal.location} onChange={e => upP("location", e.target.value)} onFocus={onFocus} onBlur={onBlur} /></div>
                  <div><label style={labelStyle}>LinkedIn Profile</label><input style={inputStyle} value={cv.personal.linkedin} onChange={e => upP("linkedin", e.target.value)} onFocus={onFocus} onBlur={onBlur} /></div>
                  <div><label style={labelStyle}>GitHub / Portfolio</label><input style={inputStyle} value={cv.personal.github} onChange={e => upP("github", e.target.value)} onFocus={onFocus} onBlur={onBlur} /></div>
                </div>
                <div><label style={labelStyle}>Personal Website</label><input style={inputStyle} value={cv.personal.website} onChange={e => upP("website", e.target.value)} onFocus={onFocus} onBlur={onBlur} /></div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <label style={{ ...labelStyle, margin: 0 }}>Professional Summary</label>
                    <AITrigger id="summary" label="Auto-Write" />
                  </div>
                  <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 120 }} value={cv.personal.summary} onChange={e => upP("summary", e.target.value)} onFocus={onFocus} onBlur={onBlur} />
                  {aiOpen === "summary" && <AIBox context="summary" cv={cv} setCV={setCV} onClose={() => setAiOpen(null)} />}
                </div>
              </div>
            )}

            {/* ── EXPERIENCE ── */}
            {tab === "Experience" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {cv.experience.map((exp, ei) => (
                  <div key={exp.id}
                    draggable
                    onDragStart={() => { dragExpIdx.current = ei; }}
                    onDragEnter={() => { dragExpOverIdx.current = ei; }}
                    onDragEnd={() => {
                      const from = dragExpIdx.current; const to = dragExpOverIdx.current;
                      if (from >= 0 && to >= 0 && from !== to) setCV(c => { const arr = [...c.experience]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return { ...c, experience: arr }; });
                      dragExpIdx.current = -1; dragExpOverIdx.current = -1;
                    }}
                    onDragOver={e => e.preventDefault()}
                    style={{ borderRadius: "4px", border: `1px solid ${THEME.border}`, background: THEME.surface, cursor: "grab" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", borderBottom: collapsed[exp.id] ? "none" : `1px solid ${THEME.border}`, background: THEME.background }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain }}>
                        {exp.role || `Experience #${ei + 1}`}
                        {exp.company && <span style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 500, marginLeft: 8 }}>@ {exp.company}</span>}
                      </p>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <GripVertical size={16} color={THEME.textMuted} style={{ cursor: "grab" }} />
                        <button onClick={() => toggleCollapse(exp.id)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted }}>{collapsed[exp.id] ? <ChevronDown size={18} /> : <ChevronUp size={18} />}</button>
                        <button onClick={() => setCV(c => ({ ...c, experience: c.experience.filter(e => e.id !== exp.id) }))} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.danger }}><Trash2 size={18} /></button>
                      </div>
                    </div>
                    {!collapsed[exp.id] && (
                      <div style={{ padding: "20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                          {(["role", "company", "period", "location"] as const).map(f => (
                            <div key={f}><label style={labelStyle}>{f}</label><input style={inputStyle} value={exp[f] || ""} onChange={e => setCV(c => ({ ...c, experience: c.experience.map(ex => ex.id === exp.id ? { ...ex, [f]: e.target.value } : ex) }))} onFocus={onFocus} onBlur={onBlur} /></div>
                          ))}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                            <label style={{ ...labelStyle, margin: 0 }}>Key Responsibilities & Achievements</label>
                            <AITrigger id={`exp-${exp.id}`} label="Enhance Bullets" />
                          </div>
                          {exp.bullets.map((b, bi) => (
                            <div key={bi} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                              <input style={{ ...inputStyle, flex: 1 }} value={b} onChange={e => { const val = e.target.value; setCV(c => ({ ...c, experience: c.experience.map(ex => ex.id === exp.id ? { ...ex, bullets: ex.bullets.map((x, j) => j === bi ? val : x) } : ex) })); }} onFocus={onFocus} onBlur={onBlur} />
                              {exp.bullets.length > 1 && <button onClick={() => setCV(c => ({ ...c, experience: c.experience.map(e => e.id === exp.id ? { ...e, bullets: e.bullets.filter((_, j) => j !== bi) } : e) }))} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted }}><X size={18} /></button>}
                            </div>
                          ))}
                          <button onClick={() => setCV(c => ({ ...c, experience: c.experience.map(e => e.id === exp.id ? { ...e, bullets: [...e.bullets, ""] } : e) }))} style={{ fontSize: 13, color: THEME.primary, background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 6, fontWeight: 600, marginTop: 12 }}><Plus size={16} /> Add new bullet</button>
                        </div>
                        {aiOpen === `exp-${exp.id}` && <AIBox context="experience-bullets" targetId={exp.id} cv={cv} setCV={setCV} onClose={() => setAiOpen(null)} />}
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => setCV(c => ({ ...c, experience: [...c.experience, { id: `e${Date.now()}`, company: "", role: "", period: "", location: "", bullets: [""] }] }))} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px", borderRadius: "4px", border: `2px dashed ${THEME.border}`, color: THEME.textMuted, background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.5px" }}><Plus size={16} /> Add Experience Block</button>
              </div>
            )}

            {/* ── EDUCATION ── */}
            {tab === "Education" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {cv.education.map(edu => (
                  <div key={edu.id}
                    draggable
                    onDragStart={() => { dragEduIdx.current = cv.education.indexOf(edu); }}
                    onDragEnter={() => { dragEduOverIdx.current = cv.education.indexOf(edu); }}
                    onDragEnd={() => {
                      const from = dragEduIdx.current; const to = dragEduOverIdx.current;
                      if (from >= 0 && to >= 0 && from !== to) setCV(c => { const arr = [...c.education]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return { ...c, education: arr }; });
                      dragEduIdx.current = -1; dragEduOverIdx.current = -1;
                    }}
                    onDragOver={e => e.preventDefault()}
                    style={{ borderRadius: "4px", border: `1px solid ${THEME.border}`, cursor: "grab" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: THEME.background, borderBottom: collapsed[edu.id] ? "none" : `1px solid ${THEME.border}` }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain }}>{edu.degree || "Degree Title"}{edu.school && <span style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 500, marginLeft: 8 }}>@ {edu.school}</span>}</p>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <GripVertical size={16} color={THEME.textMuted} style={{ cursor: "grab" }} />
                        <button onClick={() => toggleCollapse(edu.id)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted }}>{collapsed[edu.id] ? <ChevronDown size={18} /> : <ChevronUp size={18} />}</button>
                        <button onClick={() => setCV(c => ({ ...c, education: c.education.filter(e => e.id !== edu.id) }))} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.danger }}><Trash2 size={18} /></button>
                      </div>
                    </div>
                    {!collapsed[edu.id] && (
                      <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {(["degree", "field", "school", "period", "gpa", "honors"] as const).map(f => (
                          <div key={f}><label style={labelStyle}>{f}</label><input style={inputStyle} value={edu[f] || ""} onChange={e => setCV(c => ({ ...c, education: c.education.map(ed => ed.id === edu.id ? { ...ed, [f]: e.target.value } : ed) }))} onFocus={onFocus} onBlur={onBlur} /></div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => setCV(c => ({ ...c, education: [...c.education, { id: `ed${Date.now()}`, school: "", degree: "", field: "", period: "", gpa: "", honors: "" }] }))} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px", borderRadius: "4px", border: `2px dashed ${THEME.border}`, color: THEME.textMuted, background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.5px" }}><Plus size={16} /> Add Education Block</button>
              </div>
            )}

            {/* ── SKILLS ── */}
            {tab === "Skills" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div style={{ borderRadius: "4px", border: `1px solid ${THEME.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", background: THEME.background, borderBottom: `1px solid ${THEME.border}` }}>
                    <label style={{ ...labelStyle, margin: 0 }}>Technical Skills</label>
                    <AITrigger id="skills" label="Recommend Skills" />
                  </div>
                  <div style={{ padding: "20px" }}>
                    <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 100 }} value={cv.skills.technical} onChange={e => setCV(c => ({ ...c, skills: { ...c.skills, technical: e.target.value } }))} placeholder="React, Node.js, Python, AWS (Comma separated)" onFocus={onFocus} onBlur={onBlur} />
                  </div>
                  {aiOpen === "skills" && <div style={{ borderTop: `1px solid ${THEME.border}`, padding: "0 20px 20px" }}><AIBox context="skills" cv={cv} setCV={setCV} onClose={() => setAiOpen(null)} /></div>}
                </div>
                {([["soft", "Soft Skills", "Leadership, Agile, Communication"], ["languages", "Languages", "English (Native), Spanish (C1)"], ["certifications", "Certifications", "AWS Certified Developer, Scrum Master"]] as const).map(([f, label, ph]) => (
                  <div key={f}><label style={labelStyle}>{label}</label><textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} value={cv.skills[f as keyof typeof cv.skills]} onChange={e => setCV(c => ({ ...c, skills: { ...c.skills, [f]: e.target.value } }))} placeholder={ph} onFocus={onFocus} onBlur={onBlur} /></div>
                ))}
              </div>
            )}

            {/* ── PROJECTS ── */}
            {tab === "Projects" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {cv.projects.map(p => (
                  <div key={p.id}
                    draggable
                    onDragStart={() => { dragProjIdx.current = cv.projects.indexOf(p); }}
                    onDragEnter={() => { dragProjOverIdx.current = cv.projects.indexOf(p); }}
                    onDragEnd={() => {
                      const from = dragProjIdx.current; const to = dragProjOverIdx.current;
                      if (from >= 0 && to >= 0 && from !== to) setCV(c => { const arr = [...c.projects]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return { ...c, projects: arr }; });
                      dragProjIdx.current = -1; dragProjOverIdx.current = -1;
                    }}
                    onDragOver={e => e.preventDefault()}
                    style={{ borderRadius: "4px", border: `1px solid ${THEME.border}`, cursor: "grab" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: THEME.background, borderBottom: collapsed[p.id] ? "none" : `1px solid ${THEME.border}` }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: THEME.textMain }}>{p.name || "Project Title"}{p.tech && <span style={{ fontSize: 13, color: THEME.textMuted, fontWeight: 500, marginLeft: 8 }}>| {p.tech}</span>}</p>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <GripVertical size={16} color={THEME.textMuted} style={{ cursor: "grab" }} />
                        <button onClick={() => toggleCollapse(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted }}>{collapsed[p.id] ? <ChevronDown size={18} /> : <ChevronUp size={18} />}</button>
                        <button onClick={() => setCV(c => ({ ...c, projects: c.projects.filter(pr => pr.id !== p.id) }))} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.danger }}><Trash2 size={18} /></button>
                      </div>
                    </div>
                    {!collapsed[p.id] && (
                      <div style={{ padding: "20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                          {(["name", "tech"] as const).map(f => (
                            <div key={f}><label style={labelStyle}>{f}</label><input style={inputStyle} value={p[f]} onChange={e => setCV(c => ({ ...c, projects: c.projects.map(pr => pr.id === p.id ? { ...pr, [f]: e.target.value } : pr) }))} onFocus={onFocus} onBlur={onBlur} /></div>
                          ))}
                        </div>
                        <div style={{ marginBottom: 16 }}><label style={labelStyle}>Live URL / Repository</label><input style={inputStyle} value={p.url} onChange={e => setCV(c => ({ ...c, projects: c.projects.map(pr => pr.id === p.id ? { ...pr, url: e.target.value } : pr) }))} onFocus={onFocus} onBlur={onBlur} /></div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                            <label style={{ ...labelStyle, margin: 0 }}>Project Description</label>
                            <AITrigger id={`proj-${p.id}`} label="Enhance Description" />
                          </div>
                          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 100 }} value={p.description} onChange={e => setCV(c => ({ ...c, projects: c.projects.map(pr => pr.id === p.id ? { ...pr, description: e.target.value } : pr) }))} onFocus={onFocus} onBlur={onBlur} />
                        </div>
                        {aiOpen === `proj-${p.id}` && <AIBox context="projects-description" targetId={p.id} cv={cv} setCV={setCV} onClose={() => setAiOpen(null)} />}
                      </div>
                    )}
                  </div>
                ))}
                <button onClick={() => setCV(c => ({ ...c, projects: [...c.projects, { id: `p${Date.now()}`, name: "", tech: "", url: "", description: "" }] }))} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px", borderRadius: "4px", border: `2px dashed ${THEME.border}`, color: THEME.textMuted, background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.5px" }}><Plus size={16} /> Add Project Block</button>
              </div>
            )}

            {/* ── ACHIEVEMENTS ── */}
            {tab === "Achievements" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <p style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 8 }}>Add awards, publications, volunteer work, or other notable milestones.</p>
                {cv.achievements.map((a, i) => (
                  <div key={a.id}
                    draggable
                    onDragStart={() => { dragAchIdx.current = i; }}
                    onDragEnter={() => { dragAchOverIdx.current = i; }}
                    onDragEnd={() => {
                      const from = dragAchIdx.current; const to = dragAchOverIdx.current;
                      if (from >= 0 && to >= 0 && from !== to) setCV(c => { const arr = [...c.achievements]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return { ...c, achievements: arr }; });
                      dragAchIdx.current = -1; dragAchOverIdx.current = -1;
                    }}
                    onDragOver={e => e.preventDefault()}
                    style={{ display: "flex", gap: 12, alignItems: "center", cursor: "grab" }}>
                    <GripVertical size={16} color={THEME.textMuted} style={{ flexShrink: 0 }} />
                    <input style={{ ...inputStyle, flex: 1 }} value={a.text} onChange={e => setCV(c => ({ ...c, achievements: c.achievements.map((x, j) => j === i ? { ...x, text: e.target.value } : x) }))} onFocus={onFocus} onBlur={onBlur} />
                    <button onClick={() => setCV(c => ({ ...c, achievements: c.achievements.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.danger }}><Trash2 size={20} /></button>
                  </div>
                ))}
                <button onClick={() => setCV(c => ({ ...c, achievements: [...c.achievements, { id: `a${Date.now()}`, text: "" }] }))} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "12px", borderRadius: "4px", border: `2px dashed ${THEME.border}`, color: THEME.textMuted, background: "transparent", cursor: "pointer", fontWeight: 600, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.5px" }}><Plus size={16} /> Add Item</button>
              </div>
            )}
          </div>
        </div>

        {/* ── ATS CHECK PANEL ── */}
        {showATS && (
          <div style={{ width: 320, background: THEME.surface, borderRight: `1px solid ${THEME.border}`, display: "flex", flexDirection: "column", flexShrink: 0, boxShadow: "5px 0 15px rgba(0,0,0,0.03)", zIndex: 10 }}>
            <div style={{ padding: "24px", borderBottom: `1px solid ${THEME.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: THEME.textMain, textTransform: "uppercase", letterSpacing: "0.5px" }}>ATS Analyzer</h3>
              <button onClick={() => setShowATS(false)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textMuted }}><X size={18} /></button>
            </div>
            
            {/* ATS Score Display */}
            <div style={{ padding: "28px 24px", textAlign: "center", borderBottom: `1px solid ${THEME.border}` }}>
              <p style={{ fontSize: 68, fontWeight: 800, lineHeight: 1, color: THEME.primary, letterSpacing: "-3px", marginBottom: 14, fontFamily: "'Playfair Display', serif" }}>75</p>
              <div style={{ height: 5, background: THEME.border, borderRadius: "3px", overflow: "hidden", marginBottom: 14 }}>
                <div style={{ height: "100%", width: `75%`, background: `linear-gradient(90deg, ${THEME.primary}, ${THEME.gold})`, borderRadius: "3px" }} />
              </div>
              <p style={{ fontSize: 12, fontWeight: 600, color: THEME.textMuted }}>Good foundation — see checklist below.</p>
            </div>
            
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
              {[
                ["Summary length (>50 words)", true],
                ["Experience listed", true],
                ["Measurable metrics used", false],
                ["Sufficient technical skills", true],
                ["Education details complete", true],
                ["LinkedIn profile attached", false]
              ].map(([label, ok], i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px", borderRadius: "4px", background: ok ? "rgba(25, 135, 84, 0.05)" : "rgba(220, 53, 69, 0.05)", border: `1px solid ${ok ? "rgba(25, 135, 84, 0.2)" : "rgba(220, 53, 69, 0.2)"}` }}>
                  <div style={{ marginTop: 2 }}>{ok ? <Check size={16} color={THEME.success} /> : <X size={16} color={THEME.danger} />}</div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: THEME.textMain, lineHeight: 1.4 }}>{label as string}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LIVE PREVIEW ── */}
        {showPreview && (
          <div style={{ flex: 1, background: "#E5E7EB", display: "flex", overflow: "hidden", position: "relative" }}>
            
            {/* Zoom / View controls mockup */}
            <div style={{ position: "absolute", bottom: 24, right: 24, background: THEME.darkBg, padding: "8px 16px", borderRadius: "30px", display: "flex", gap: 16, boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 20 }}>
              <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>100%</span>
            </div>

            <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", padding: "40px" }}>
              <div ref={previewRef} style={{ width: "210mm", minHeight: "297mm", background: "#fff", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)", overflow: "hidden" }}>
                <Preview cv={cv} template={template} setCV={setCV} />
              </div>
            </div>
          </div>
        )}
      </div>

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