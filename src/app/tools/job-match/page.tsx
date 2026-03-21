"use client";
import Link from "next/link";
import { useState } from "react";
import { jobMatch, type JobMatchResult } from "@/lib/api";
import { Target, ChevronLeft, Sparkles, Check, X, TrendingUp, AlertTriangle, Copy, AlertCircle } from "lucide-react";

export default function JobMatchPage() {
  const [cv, setCV] = useState("");
  const [jd, setJD] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobMatchResult|null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number|null>(null);

  const analyze = async () => {
    if (!cv.trim() || !jd.trim()) return;
    setLoading(true); setResult(null); setError("");
    try {
      const data = await jobMatch(cv, jd);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sc = result
    ? (result.matchScore>=75?"#2d7a4f":result.matchScore>=50?"var(--gold)":"#c84c2e")
    : "var(--muted)";

  return (
    <main style={{ minHeight:"100vh",background:"var(--cream)" }}>
      <nav style={{ background:"var(--white)",borderBottom:"1px solid var(--border)",padding:"0 28px",display:"flex",alignItems:"center",height:56,gap:12,position:"sticky",top:0,zIndex:40 }}>
        <Link href="/dashboard" className="btn btn-ghost btn-sm"><ChevronLeft size={12}/>Dashboard</Link>
        <div style={{ width:1,height:16,background:"var(--border)" }}/>
        <div style={{ display:"flex",alignItems:"center",gap:7 }}>
          <div style={{ width:26,height:26,borderRadius: 6,background:"#2d7a4f",display:"flex",alignItems:"center",justifyContent:"center" }}><Target size={13} color="#fff"/></div>
          <span style={{ fontFamily:"var(--font-display)",fontSize:17,fontWeight:700,color:"var(--forest)" }}>Job Match Analyzer</span>
        </div>
      </nav>

      <div style={{ maxWidth:980,margin:"0 auto",padding:"48px 36px 72px" }}>
        <div style={{ textAlign:"center",marginBottom:40 }}>
          <h1 style={{ fontFamily:"var(--font-display)",fontSize:"clamp(2rem,4vw,3.6rem)",fontWeight:700,color:"var(--forest)",marginBottom:9 }}>Match Your CV to Any Job</h1>
          <p style={{ fontSize:15,color:"var(--muted)",maxWidth:460,margin:"0 auto" }}>Paste your CV and a job description. AI analyses the gap and tells you exactly what to change.</p>
        </div>

        {!result?(
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:14 }}>
              {([["Your CV",cv,setCV,"Paste your CV content…"],["Job Description",jd,setJD,"Paste the full job description…"]] as const).map(([label,val,setter,ph],i)=>(
                <div key={i}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                    <label className="label">{label}</label>
                    <span style={{ fontFamily:"var(--font-mono)",fontSize:9,color:"var(--muted)" }}>{val.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                  <textarea className="field" rows={13} value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
                    style={{ minHeight:300,fontSize:13,lineHeight:1.6 }}/>
                </div>
              ))}
            </div>

            {error&&(
              <div style={{ display:"flex",gap:8,padding:"11px 14px",background:"rgba(200,76,46,.07)",border:"1px solid rgba(200,76,46,.22)",borderRadius: 6,marginBottom:14 }}>
                <AlertCircle size={14} color="#c84c2e" style={{ flexShrink:0 }}/>
                <p style={{ fontSize:13,color:"#c84c2e" }}>{error}</p>
              </div>
            )}

            <button onClick={analyze} disabled={loading||!cv.trim()||!jd.trim()}
              className="btn btn-forest" style={{ width:"100%",justifyContent:"center",padding:"12px",fontSize:14.5,opacity:(loading||!cv.trim()||!jd.trim())?.6:1 }}>
              {loading
                ? <><div style={{ width:17,height:17,border:"2px solid rgba(250,250,245,.3)",borderTopColor:"var(--cream)",borderRadius:"50%" }} className="spin"/>Analysing…</>
                : <><Target size={16}/>Analyse Job Match</>}
            </button>
          </div>
        ):(
          <div style={{ display:"flex",flexDirection:"column",gap:14 }} className="anim-in">
            {/* Score */}
            <div className="card-flat" style={{ padding:"22px 26px",border:`1.5px solid ${sc}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:22 }}>
                <div style={{ textAlign:"center",flexShrink:0 }}>
                  <p style={{ fontFamily:"var(--font-display)",fontSize:72,fontWeight:700,lineHeight:1,color:sc }}>{result.matchScore}</p>
                  <p style={{ fontFamily:"var(--font-mono)",fontSize:9.5,color:"var(--muted)" }}>/ 100 match</p>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ height:5,background:"var(--border)",borderRadius: 6,marginBottom:11 }}>
                    <div style={{ height:"100%",width:`${result.matchScore}%`,background:sc,borderRadius: 6,transition:"width 1.2s" }}/>
                  </div>
                  <p style={{ fontSize:14.5,color:"var(--muted)",lineHeight:1.72 }}>{result.summary}</p>
                </div>
              </div>
            </div>

            {/* Quick wins */}
            <div style={{ background:"rgba(200,169,110,.07)",border:"1px solid rgba(200,169,110,.2)",borderRadius: 6,padding:"15px 17px" }}>
              <h3 style={{ fontFamily:"var(--font-display)",fontSize:19,fontWeight:700,color:"var(--forest)",marginBottom:11,display:"flex",alignItems:"center",gap:7 }}>⚡ Quick Wins</h3>
              {result.quickWins.map((w,i)=>(
                <div key={i} style={{ display:"flex",gap:9,marginBottom:7 }}>
                  <div style={{ width:18,height:18,borderRadius:"50%",background:"rgba(200,169,110,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"var(--font-mono)",fontSize:9,color:"var(--gold)" }}>{i+1}</div>
                  <p style={{ fontSize:13.5,color:"var(--ink)" }}>{w}</p>
                </div>
              ))}
            </div>

            {/* Keywords */}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
              <div style={{ background:"rgba(45,122,79,.05)",border:"1px solid rgba(45,122,79,.2)",borderRadius: 6,padding:"14px 16px" }}>
                <h4 style={{ fontFamily:"var(--font-display)",fontSize:17,fontWeight:700,color:"var(--forest)",marginBottom:9,display:"flex",alignItems:"center",gap:5 }}>
                  <Check size={14} color="#2d7a4f"/>Matched <span style={{ marginLeft:"auto",fontFamily:"var(--font-mono)",fontSize:9,color:"#2d7a4f" }}>{result.matchedKeywords.length}</span>
                </h4>
                <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                  {result.matchedKeywords.map((k,i)=><span key={i} className="tag" style={{ background:"rgba(45,122,79,.1)",color:"#2d7a4f" }}>{k}</span>)}
                </div>
              </div>
              <div style={{ background:"rgba(200,76,46,.05)",border:"1px solid rgba(200,76,46,.2)",borderRadius: 6,padding:"14px 16px" }}>
                <h4 style={{ fontFamily:"var(--font-display)",fontSize:17,fontWeight:700,color:"var(--forest)",marginBottom:9,display:"flex",alignItems:"center",gap:5 }}>
                  <X size={14} color="#c84c2e"/>Missing <span style={{ marginLeft:"auto",fontFamily:"var(--font-mono)",fontSize:9,color:"#c84c2e" }}>{result.missingKeywords.length}</span>
                </h4>
                <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                  {result.missingKeywords.map((k,i)=><span key={i} className="tag" style={{ background:"rgba(200,76,46,.1)",color:"#c84c2e" }}>{k}</span>)}
                </div>
              </div>
            </div>

            {/* Weak sections */}
            {result.weakSections.length>0&&(
              <div>
                <h3 style={{ fontFamily:"var(--font-display)",fontSize:19,fontWeight:700,color:"var(--forest)",marginBottom:9,display:"flex",alignItems:"center",gap:7 }}>
                  <AlertTriangle size={15} color="#c84c2e"/>Sections to Improve
                </h3>
                {result.weakSections.map((s,i)=>(
                  <div key={i} style={{ marginBottom:9,borderRadius: 6,border:"1px solid var(--border)",overflow:"hidden" }}>
                    <div style={{ padding:"11px 14px",background:"var(--white)" }}>
                      <span className="tag" style={{ background:"rgba(200,76,46,.09)",color:"#c84c2e",marginBottom:6,display:"inline-block" }}>{s.section}</span>
                      <p style={{ fontSize:13.5,color:"var(--ink)" }}>{s.issue}</p>
                    </div>
                    <div style={{ padding:"11px 14px",background:"rgba(45,122,79,.04)",borderTop:"1px solid rgba(45,122,79,.12)" }}>
                      <p style={{ fontFamily:"var(--font-mono)",fontSize:9,color:"#2d7a4f",marginBottom:3 }}>✅ FIX:</p>
                      <p style={{ fontSize:13.5,color:"var(--ink)" }}>{s.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tailored bullets */}
            {result.tailoredBullets.length>0&&(
              <div>
                <h3 style={{ fontFamily:"var(--font-display)",fontSize:19,fontWeight:700,color:"var(--forest)",marginBottom:9,display:"flex",alignItems:"center",gap:7 }}>
                  <TrendingUp size={15} color="#7c5cbf"/>AI-Tailored Bullets
                </h3>
                {result.tailoredBullets.map((b,i)=>(
                  <div key={i} style={{ marginBottom:9,borderRadius: 6,border:"1px solid rgba(124,92,191,.2)",overflow:"hidden" }}>
                    <div style={{ padding:"11px 14px",background:"var(--white)" }}>
                      <p style={{ fontSize:11,color:"var(--muted)",fontStyle:"italic",textDecoration:"line-through" }}>{b.original}</p>
                    </div>
                    <div style={{ padding:"11px 14px",background:"rgba(124,92,191,.04)",borderTop:"1px solid rgba(124,92,191,.13)",display:"flex",gap:10,alignItems:"flex-start" }}>
                      <div style={{ flex:1 }}>
                        <p style={{ fontFamily:"var(--font-mono)",fontSize:9,color:"#7c5cbf",marginBottom:3,textTransform:"uppercase" }}>Improved (JD-Tailored)</p>
                        <p style={{ fontSize:13.5,color:"var(--ink)",lineHeight:1.65 }}>{b.improved}</p>
                      </div>
                      <button onClick={()=>{navigator.clipboard.writeText(b.improved);setCopied(i);setTimeout(()=>setCopied(null),2000);}}
                        style={{ background:"none",border:"none",cursor:"pointer",color:copied===i?"#2d7a4f":"var(--muted)",flexShrink:0 }}>
                        {copied===i?<Check size={13}/>:<Copy size={13}/>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:11 }}>
              <button onClick={()=>{setResult(null);setError("");}} className="btn btn-outline" style={{ justifyContent:"center" }}>Analyse Another</button>
              <Link href="/builder" className="btn btn-forest" style={{ justifyContent:"center" }}><Sparkles size={13}/>Update My CV</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
