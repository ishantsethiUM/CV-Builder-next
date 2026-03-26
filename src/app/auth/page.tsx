"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { login, register } from "@/lib/api";
import { FileText, Eye, EyeOff, ArrowRight, AlertCircle, Star } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const nameRef  = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const pwdRef   = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const email    = emailRef.current?.value.trim() ?? "";
    const password = pwdRef.current?.value ?? "";
    const name     = nameRef.current?.value.trim() ?? "";

    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (mode === "signup" && !name) { setError("Please enter your full name."); return; }
    if (mode === "signup" && name.trim().split(" ").length < 2) { setError("Please enter your first and last name."); return; }

    setLoading(true);
    setError("");
    try {
      if (mode === "login") { await login(email, password); }
      else { await register(name, email, password); }
      router.push("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--cream)", overflowX: "hidden" }}>

      {/* ── NAV (matches landing page) */}
      <nav style={{ borderBottom: "1px solid var(--border)", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 34, height: 34, background: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 3 }}>
              <FileText size={16} color="var(--gold)" />
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--forest)" }}>FitRezume</span>
          </Link>
          <div style={{ display: "flex", gap: 2 }}>
            {([["Templates", "/templates"], ["Tools", "/tools/roast"]] as const).map(([l, h]) => (
              <Link key={l} href={h} style={{ padding: "7px 13px", fontSize: 14, fontWeight: 500, color: "var(--muted)", textDecoration: "none", borderRadius: 3, transition: "color .15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--forest)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--muted)"}>{l}</Link>
            ))}
          </div>
          <Link href="/" style={{ fontSize: 13, fontWeight: 500, color: "var(--muted)", textDecoration: "none", transition: "color .15s" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--forest)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--muted)"}>
            ← Back to home
          </Link>
        </div>
      </nav>

      {/* ── CONTENT */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "52px 24px 80px" }}>
        <div style={{ width: "100%", maxWidth: 420 }} className="anim-in">

          {/* Brand mark */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
            <div style={{ width: 50, height: 50, background: "var(--forest)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, boxShadow: "var(--shadow)" }}>
              <FileText size={24} color="var(--gold)" />
            </div>
          </div>

          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--forest)", marginBottom: 7 }}>
              {mode === "login" ? "Welcome back" : "Start building"}
            </h1>
            <p style={{ fontSize: 14.5, color: "var(--muted)", lineHeight: 1.6 }}>
              {mode === "login" ? "Sign in to access your CVs and tools." : "Join 2,50,000+ Indian students building better CVs."}
            </p>
          </div>

          {/* Card */}
          <div className="card" style={{ padding: "30px 32px" }}>

            {/* Mode toggle */}
            <div style={{ display: "flex", padding: 3, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, marginBottom: 24 }}>
              {(["login", "signup"] as const).map(m => (
                <button key={m} onClick={() => { setMode(m); setError(""); }}
                  style={{ flex: 1, padding: "8px", borderRadius: 4, border: "none", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .18s", background: mode === m ? "var(--forest)" : "transparent", color: mode === m ? "var(--cream)" : "var(--muted)" }}>
                  {m === "login" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            {/* Error banner */}
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "11px 14px", background: "rgba(201,78,42,.07)", border: "1px solid rgba(201,78,42,.22)", borderRadius: 4, marginBottom: 18 }}>
                <AlertCircle size={14} color="var(--ember)" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: "var(--ember)", lineHeight: 1.4 }}>{error}</p>
              </div>
            )}

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {mode === "signup" && (
                <div>
                  <label className="label">Full Name</label>
                  <input ref={nameRef} className="field" type="text" placeholder="Rahul Sharma" onKeyDown={handleKey} />
                </div>
              )}
              <div>
                <label className="label">Email</label>
                <input ref={emailRef} className="field" type="email" placeholder="you@college.edu.in" onKeyDown={handleKey} />
              </div>
              <div>
                <label className="label">Password</label>
                <div style={{ position: "relative" }}>
                  <input ref={pwdRef} className="field" type={showPwd ? "text" : "password"} placeholder="••••••••" style={{ paddingRight: 42 }} onKeyDown={handleKey} />
                  <button onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: "100%", marginTop: 20, padding: "13px", borderRadius: 5, background: "var(--forest)", color: "var(--cream)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14.5, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.75 : 1, transition: "opacity .2s" }}>
              {loading
                ? <div style={{ width: 18, height: 18, border: "2px solid rgba(250,250,245,.3)", borderTopColor: "var(--cream)", borderRadius: "50%" }} className="spin" />
                : <>{mode === "login" ? "Sign in" : "Create account"}<ArrowRight size={15} /></>}
            </button>

            {mode === "signup" && (
              <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center", marginTop: 12 }}>
                By creating an account you agree to our Terms &amp; Privacy Policy
              </p>
            )}
          </div>

          {/* Mode switch link */}
          <p style={{ textAlign: "center", marginTop: 18, fontSize: 13.5, color: "var(--muted)" }}>
            {mode === "login"
              ? <>Don&apos;t have an account?{" "}<button onClick={() => { setMode("signup"); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--forest)", fontWeight: 600, fontSize: 13.5, fontFamily: "var(--font-body)" }}>Sign up free</button></>
              : <>Already have an account?{" "}<button onClick={() => { setMode("login"); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--forest)", fontWeight: 600, fontSize: 13.5, fontFamily: "var(--font-body)" }}>Sign in</button></>}
          </p>

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 36, paddingTop: 28, borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex" }}>
              {["47", "12", "32", "22", "8"].map((n, i) => (
                <img key={i} src={`https://i.pravatar.cc/32?img=${n}`} alt="" style={{ width: 26, height: 26, borderRadius: "50%", border: "2px solid var(--cream)", marginLeft: i ? -7 : 0, objectFit: "cover" }} />
              ))}
            </div>
            <div>
              <div style={{ display: "flex", gap: 2 }}>{[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill="#2563EB" color="#2563EB" />)}</div>
              <p style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>Loved by <strong style={{ color: "var(--forest)" }}>2,50,000+</strong> students across India</p>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
