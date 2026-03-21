"use client";
import Link from "next/link";
import { useState } from "react";
import { FileText, Copy, Check, Eye, ExternalLink } from "lucide-react";

// This page renders a public shareable CV
// In production: fetch CV data from your API using the slug
export default function PublicResumePage({ params }: { params: { slug: string } }) {
  const [copied, setCopied] = useState(false);
  const [views] = useState(Math.floor(Math.random() * 200) + 42);

  const handleCopy = () => {
    navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "");
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  // TODO: Replace MOCK_CV with data fetched from your API using params.slug
  // e.g. const cv = await fetch(`/api/resume/${params.slug}`).then(r => r.json());

  return (
    <main style={{ minHeight:"100vh", background:"#F0EDE4", fontFamily:"'DM Sans',sans-serif" }}>
      <header style={{ position:"sticky",top:0,zIndex:40,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",height:56,background:"rgba(28,56,41,.97)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:9 }}>
          <div style={{ width:26,height:26,background:"var(--gold)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:3 }}><FileText size={13} color="var(--charcoal)"/></div>
          <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:700,color:"var(--cream)" }}>Jane Smith</span>
          <span style={{ fontFamily:"'JetBrains Mono'",fontSize:9.5,color:"rgba(250,250,245,.38)" }}>Software Engineer</span>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:9 }}>
          <div style={{ display:"flex",alignItems:"center",gap:4,fontFamily:"'JetBrains Mono'",fontSize:9.5,color:"rgba(250,250,245,.38)" }}><Eye size={11}/>{views} views</div>
          <button onClick={handleCopy} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 11px",borderRadius:3,background:"rgba(250,250,245,.08)",border:"1px solid rgba(250,250,245,.12)",color:"rgba(250,250,245,.65)",fontSize:12,cursor:"default" }}>
            {copied?<Check size={11}/>:<Copy size={11}/>}{copied?"Copied!":"Copy Link"}
          </button>
          <Link href="/auth" style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 13px",borderRadius:3,background:"var(--gold)",color:"var(--charcoal)",fontSize:12,fontWeight:700,textDecoration:"none",cursor:"default" }}>
            <FileText size={11}/>Build Yours Free
          </Link>
        </div>
      </header>
      <div style={{ display:"flex",justifyContent:"center",padding:"36px 22px 56px" }}>
        <div>
          <p style={{ textAlign:"center",fontFamily:"'JetBrains Mono'",fontSize:9.5,color:"var(--muted)",marginBottom:14 }}>folio.app/resume/{params.slug}</p>
          {/* CV Preview */}
          <div style={{ width:700,maxWidth:"100%",background:"#fff",boxShadow:"0 20px 60px rgba(28,56,41,.14)",borderRadius:3,padding:"38px 46px",fontFamily:"Georgia,serif" }}>
            <div style={{ borderBottom:"2.5px solid #1C3829",paddingBottom:14,marginBottom:18 }}>
              <h1 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:"#1C3829",margin:0 }}>Jane Smith</h1>
              <p style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:9.5,color:"#666",marginTop:5 }}>jane@university.ac.uk · +44 7700 000000 · London, UK · linkedin.com/in/janesmith</p>
            </div>
            {[
              ["Summary","Motivated CS graduate with full-stack experience and a passion for building scalable products that solve real problems."],
              ["Experience","Software Engineer Intern — Tech Startup Ltd (Jun–Sep 2024)\n• Developed RESTful APIs using Node.js, reducing latency by 40%\n• Built React components improving user engagement by 25%\n• Collaborated in agile sprints delivering 8 features per fortnight"],
              ["Education","BSc Computer Science — University of London (2021–2024) — First Class (78%)"],
              ["Skills","TypeScript, React, Next.js, Node.js, Python, PostgreSQL, Docker, Git"],
            ].map(([t,c])=>(
              <div key={t as string} style={{ marginBottom:16 }}>
                <h2 style={{ fontFamily:"'JetBrains Mono',monospace",fontSize:8,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",borderBottom:"1px solid #e4e2da",paddingBottom:5,marginBottom:9,color:"#1C3829" }}>{t as string}</h2>
                <p style={{ fontSize:12,lineHeight:1.72,color:"#444",whiteSpace:"pre-line" }}>{c as string}</p>
              </div>
            ))}
          </div>
          {/* CTA */}
          <div style={{ marginTop:24,padding:"22px 26px",background:"#fff",borderRadius:3,border:"1px solid var(--border)",maxWidth:700,textAlign:"center" }}>
            <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:21,fontWeight:700,color:"var(--forest)",marginBottom:7 }}>Build your own AI-powered CV</p>
            <p style={{ fontSize:13,color:"var(--muted)",marginBottom:16 }}>Join 250,000+ students who've landed jobs at top companies using Folio.</p>
            <Link href="/auth" style={{ display:"inline-flex",alignItems:"center",gap:7,padding:"10px 22px",borderRadius:3,background:"var(--forest)",color:"var(--cream)",textDecoration:"none",fontSize:13,fontWeight:700,cursor:"default" }}>
              Get Started Free <ExternalLink size={13}/>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
