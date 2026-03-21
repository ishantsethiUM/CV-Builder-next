"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import useReveal from "@/components/Reveal";
import { ArrowRight, Check, Star, ChevronDown, FileText, MousePointer2 } from "lucide-react";

const MARQUEE = ["ATS Optimised","◆","8 Templates","◆","AI Writing","◆","Interview Sim","◆","Resume Roast","◆","Job Matching","◆","Free to Start","◆"];

const SERVICES = [
  { img:"https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80", title:"Template Design", desc:"8 professionally crafted templates. Switch instantly, preview live." },
  { img:"https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&auto=format&fit=crop&q=80", title:"AI CV Review", desc:"Our AI scores your CV like a recruiter — flags gaps, suggests precise improvements." },
  { img:"https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80", title:"Cover Letter AI", desc:"Generate a tailored cover letter for any role in seconds using your CV as context." },
];

const STEPS = [
  { n:"01", title:"Enter Your Details", desc:"Fill in experience, skills and education. AI enhances your descriptions automatically." },
  { n:"02", title:"Choose Your Design",  desc:"Pick from 8 templates. Switch instantly and watch your CV transform live." },
  { n:"03", title:"Download & Apply",    desc:"Export as PDF or share a live link. Start applying in minutes." },
];

const TOOLS = [
  { emoji:"🔥", title:"Resume Roast",     desc:"Brutal AI feedback with sharp humour — actually useful.",        href:"/tools/roast",     tag:"Viral" },
  { emoji:"🎙️", title:"Interview Sim",   desc:"Practice with AI questions tailored to your CV and role.",       href:"/tools/interview", tag:"Popular" },
  { emoji:"🎯", title:"Job Match",        desc:"Paste a JD — get match score, missing keywords, rewritten bullets.", href:"/tools/job-match", tag:"New" },
];

const TESTIMONIALS = [
  { name:"Aisha Rahman", role:"Software Engineer @ Google",  quote:"Rewrote my CV with Folio — got 4 interview requests the same week. AI suggestions are genuinely brilliant.", img:"https://i.pravatar.cc/60?img=47" },
  { name:"Marcus Adeyemi", role:"Product Manager @ Stripe", quote:"ATS scorer showed me exactly why my applications weren't getting through. Fixed it in 15 mins. Dream role 1 month later.", img:"https://i.pravatar.cc/60?img=12" },
  { name:"Priya Mehta", role:"UX Designer @ Figma",         quote:"Templates actually look designed by professionals. Hired within 3 weeks of using Folio.", img:"https://i.pravatar.cc/60?img=32" },
];

export default function Home() {
  useReveal();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <main style={{ background:"var(--cream)" }}>

      {/* ── NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:50, background: scrolled?"rgba(250,250,245,.96)":"var(--cream)", borderBottom:`1px solid ${scrolled?"var(--border)":"transparent"}`, backdropFilter: scrolled?"blur(12px)":"none", transition:"all .3s" }}>
        <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 40px", display:"flex", alignItems:"center", justifyContent:"space-between", height:66 }}>
          <Link href="/" className="btn" style={{ gap:9, padding:0, background:"none" }}>
            <div style={{ width:34,height:34,background:"var(--forest)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:3 }}>
              <FileText size={16} color="var(--gold)" />
            </div>
            <span style={{ fontFamily:"var(--font-display)", fontSize:22, fontWeight:700, color:"var(--forest)" }}>Folio</span>
          </Link>
          <div style={{ display:"flex", gap:2 }}>
            {[["Templates","/templates"],["Tools","/tools/roast"],["Pricing","#pricing"]].map(([l,h])=>(
              <Link key={l} href={h} style={{ padding:"7px 13px", fontSize:14, fontWeight:500, color:"var(--muted)", textDecoration:"none", borderRadius:3, transition:"color .15s" }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="var(--forest)"}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="var(--muted)"}>{l}</Link>
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Link href="/auth" className="btn btn-ghost btn-sm">Sign in</Link>
            <Link href="/auth" className="btn btn-forest btn-sm">Get started free <ArrowRight size={13}/></Link>
          </div>
        </div>
      </nav>

      {/* ── HERO */}
      <section style={{ position:"relative", minHeight:580, display:"flex", alignItems:"center", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1600&auto=format&fit=crop&q=70')", backgroundSize:"cover", backgroundPosition:"center 30%" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(105deg, rgba(250,250,245,.97) 44%, rgba(250,250,245,.55) 72%, rgba(250,250,245,.1) 100%)" }} />
        <div style={{ position:"relative", maxWidth:1180, margin:"0 auto", padding:"90px 40px 100px", zIndex:2 }}>
          <div style={{ maxWidth:560 }}>
            <div className="eyebrow anim-up" style={{ animationDelay:".1s" }}>AI-Powered · Free to Start</div>
            <h1 className="anim-up" style={{ fontFamily:"var(--font-display)", fontSize:"clamp(3rem,6vw,5.2rem)", fontWeight:700, color:"var(--forest)", lineHeight:1.03, marginBottom:18, animationDelay:".2s" }}>
              Craft the CV That<br/><span style={{ color:"var(--ember)" }}>Gets You Hired</span>
            </h1>
            <p className="anim-up" style={{ fontSize:16.5, color:"var(--muted)", lineHeight:1.8, maxWidth:440, marginBottom:34, animationDelay:".35s" }}>
              Built for ambitious students. Our AI writes, improves and optimises your CV — so you can focus on landing the interview.
            </p>
            <div className="anim-up" style={{ display:"flex", gap:13, flexWrap:"wrap", animationDelay:".5s" }}>
              <Link href="/builder" className="btn btn-gold btn-lg">Build my CV — free <ArrowRight size={16}/></Link>
              <Link href="/templates" className="btn btn-outline btn-lg">View templates</Link>
            </div>
            <div className="anim-up" style={{ display:"flex", alignItems:"center", gap:14, marginTop:30, animationDelay:".65s" }}>
              <div style={{ display:"flex" }}>
                {["47","12","32","22","8"].map((n,i)=>(
                  <img key={i} src={`https://i.pravatar.cc/36?img=${n}`} alt="" style={{ width:30,height:30,borderRadius:"50%",border:"2px solid var(--cream)",marginLeft:i?-7:0 }} />
                ))}
              </div>
              <div>
                <div style={{ display:"flex", gap:2 }}>{[1,2,3,4,5].map(i=><Star key={i} size={11} fill="#C8A96E" color="#C8A96E"/>)}</div>
                <p style={{ fontSize:12, color:"var(--muted)", marginTop:1 }}>Loved by <strong style={{ color:"var(--forest)" }}>250,000+</strong> students</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ position:"absolute", bottom:24, left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:5, opacity:.45 }}>
          <span style={{ fontFamily:"var(--font-mono)", fontSize:9, letterSpacing:".15em", textTransform:"uppercase", color:"var(--muted)" }}>scroll</span>
          <ChevronDown size={15} color="var(--muted)" />
        </div>
      </section>

      {/* ── MARQUEE */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...MARQUEE,...MARQUEE,...MARQUEE].map((item,i)=>(
            <span key={i} style={{ marginRight:36, fontFamily:"var(--font-mono)", fontSize:11, color:item==="◆"?"var(--gold)":"var(--muted)", letterSpacing:".07em", textTransform:"uppercase" }}>{item}</span>
          ))}
        </div>
      </div>

      {/* ── STATS */}
      <section style={{ padding:"76px 0", background:"var(--forest)" }}>
        <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 40px", display:"grid", gridTemplateColumns:"repeat(4,1fr)" }}>
          {[{n:"250K+",l:"CVs Created"},{n:"8",l:"Templates"},{n:"89%",l:"Interview Rate"},{n:"4.9★",l:"Student Rating"}].map((s,i)=>(
            <div key={i} className="reveal" style={{ textAlign:"center", padding:"0 20px", borderRight:i<3?"1px solid rgba(200,169,110,.18)":"none" }}>
              <p style={{ fontFamily:"var(--font-display)", fontSize:"clamp(2.8rem,4vw,4rem)", fontWeight:700, color:"var(--gold)", lineHeight:1 }}>{s.n}</p>
              <p style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"rgba(250,250,245,.45)", textTransform:"uppercase", letterSpacing:".1em", marginTop:7 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT */}
      <section style={{ padding:"96px 0" }}>
        <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 40px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"center" }}>
          <div className="reveal">
            <div className="eyebrow">About Folio</div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(2.2rem,3.5vw,3.4rem)", fontWeight:700, color:"var(--forest)", lineHeight:1.1, marginBottom:18 }}>
              Empowering Students<br/><span style={{ color:"var(--gold)" }}>for Career Success</span>
            </h2>
            <p style={{ fontSize:15.5, color:"var(--muted)", lineHeight:1.8, marginBottom:28 }}>
              Folio was built by students, for students. We know how overwhelming job applications feel — so we created a platform that takes the guesswork out of CV writing. AI handles the hard parts; you focus on your story.
            </p>
            <Link href="/auth" className="btn btn-outline">Start building free</Link>
          </div>
          <div className="reveal" style={{ position:"relative" }}>
            <div style={{ position:"absolute", top:-14, right:-14, width:"85%", height:"85%", background:"var(--gold)", opacity:.14, borderRadius:3 }} />
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=700&auto=format&fit=crop&q=80" alt="Students" style={{ position:"relative", zIndex:1, width:"100%", height:380, objectFit:"cover", borderRadius:3, display:"block" }} />
          </div>
        </div>
      </section>

      {/* ── SERVICES */}
      <section style={{ padding:"20px 0 96px" }}>
        <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 40px" }}>
          <div className="flourish reveal">✦ &nbsp; ✦ &nbsp; ✦</div>
          <div className="reveal" style={{ textAlign:"center", marginBottom:52 }}>
            <div className="eyebrow" style={{ justifyContent:"center" }}>Our Services</div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(2.2rem,3.5vw,3.4rem)", fontWeight:700, color:"var(--forest)" }}>Everything You Need to Get Hired</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {SERVICES.map((s,i)=>(
              <div key={i} className="card reveal" style={{ overflow:"hidden" }}>
                <div style={{ overflow:"hidden" }}>
                  <img src={s.img} alt={s.title} style={{ width:"100%", height:220, objectFit:"cover", display:"block", transition:"transform .5s" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLImageElement).style.transform="scale(1.04)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLImageElement).style.transform="scale(1)"} />
                </div>
                <div style={{ padding:"22px 26px 28px" }}>
                  <h3 style={{ fontFamily:"var(--font-display)", fontSize:24, fontWeight:700, color:"var(--ink)", marginBottom:9 }}>{s.title}</h3>
                  <p style={{ fontSize:14.5, color:"var(--muted)", lineHeight:1.7, marginBottom:20 }}>{s.desc}</p>
                  <Link href="/builder" className="btn btn-outline btn-sm">Get started</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONSULTATION BANNER */}
      <section style={{ background:"var(--forest)", padding:"76px 40px", textAlign:"center" }}>
        <div className="reveal" style={{ maxWidth:580, margin:"0 auto" }}>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(2.2rem,4vw,3.8rem)", fontWeight:700, color:"var(--cream)", marginBottom:14 }}>Build Your CV Today</h2>
          <p style={{ fontSize:16, color:"rgba(250,250,245,.65)", marginBottom:34, lineHeight:1.75 }}>Join 250,000+ students who've used Folio to land interviews at top companies. Takes less than 10 minutes.</p>
          <Link href="/auth" className="btn btn-gold btn-lg">Start for free — no card needed</Link>
        </div>
      </section>

      {/* ── HOW IT WORKS */}
      <section style={{ padding:"96px 0" }}>
        <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 40px" }}>
          <div className="reveal" style={{ textAlign:"center", marginBottom:58 }}>
            <div className="eyebrow" style={{ justifyContent:"center" }}>How It Works</div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(2.2rem,3.5vw,3.4rem)", fontWeight:700, color:"var(--forest)" }}>Your CV in 3 Steps</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:48 }}>
            {STEPS.map((s,i)=>(
              <div key={i} className="reveal" style={{ textAlign:"center" }}>
                <div style={{ width:68,height:68,border:"2px solid var(--gold)",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 22px",transition:"all .25s" }}
                  onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.background="var(--gold)";}}
                  onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.background="transparent";}}>
                  <span style={{ fontFamily:"var(--font-display)", fontSize:26, fontWeight:700, color:"var(--gold)" }}>{s.n}</span>
                </div>
                <h3 style={{ fontFamily:"var(--font-display)", fontSize:23, fontWeight:700, color:"var(--forest)", marginBottom:11 }}>{s.title}</h3>
                <p style={{ fontSize:14.5, color:"var(--muted)", lineHeight:1.78 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI TOOLS */}
      <section style={{ padding:"96px 0", background:"#F2F0E8" }}>
        <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 40px" }}>
          <div className="reveal" style={{ textAlign:"center", marginBottom:52 }}>
            <div className="eyebrow" style={{ justifyContent:"center" }}>AI Tools</div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(2.2rem,3.5vw,3.4rem)", fontWeight:700, color:"var(--forest)" }}>More Than a CV Builder</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:22 }}>
            {TOOLS.map((t,i)=>(
              <Link key={i} href={t.href} className="card reveal" style={{ padding:"30px 26px", textDecoration:"none" }}>
                <div style={{ fontSize:38, marginBottom:16 }}>{t.emoji}</div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <h3 style={{ fontFamily:"var(--font-display)", fontSize:23, fontWeight:700, color:"var(--forest)" }}>{t.title}</h3>
                  <span className="tag" style={{ background:"rgba(28,56,41,.08)", color:"var(--forest)" }}>{t.tag}</span>
                </div>
                <p style={{ fontSize:14.5, color:"var(--muted)", lineHeight:1.7, marginBottom:18 }}>{t.desc}</p>
                <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:13, fontWeight:600, color:"var(--forest)" }}>Try free <ArrowRight size={13}/></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS */}
      <section style={{ padding:"96px 0" }}>
        <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 40px" }}>
          <div className="flourish reveal">✦ &nbsp; ✦ &nbsp; ✦</div>
          <div className="reveal" style={{ textAlign:"center", marginBottom:52 }}>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(2.2rem,3.5vw,3.4rem)", fontWeight:700, color:"var(--forest)" }}>What Students Say</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:22 }}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className="card reveal" style={{ padding:"26px", transform:i===1?"translateY(14px)":"none" }}>
                <div style={{ display:"flex", gap:2, marginBottom:14 }}>{[1,2,3,4,5].map(s=><Star key={s} size={12} fill="#C8A96E" color="#C8A96E"/>)}</div>
                <p style={{ fontSize:14.5, color:"var(--muted)", lineHeight:1.75, fontStyle:"italic", marginBottom:20 }}>"{t.quote}"</p>
                <div style={{ display:"flex", alignItems:"center", gap:11 }}>
                  <img src={t.img} alt={t.name} style={{ width:40,height:40,borderRadius:"50%",objectFit:"cover" }}/>
                  <div><p style={{ fontSize:13.5, fontWeight:700, color:"var(--forest)" }}>{t.name}</p><p style={{ fontSize:12, color:"var(--muted)", marginTop:1 }}>{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING */}
      <section id="pricing" style={{ padding:"96px 0", background:"#F2F0E8" }}>
        <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 40px" }}>
          <div className="reveal" style={{ textAlign:"center", marginBottom:52 }}>
            <div className="eyebrow" style={{ justifyContent:"center" }}>Pricing</div>
            <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(2.2rem,3.5vw,3.4rem)", fontWeight:700, color:"var(--forest)" }}>Invest in Your Career</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22, maxWidth:740, margin:"0 auto" }}>
            {[
              { name:"Free", price:"£0",  period:"forever", features:["3 templates","PDF export","Basic AI suggestions","ATS score","Resume Roast (3/month)"], cta:"Start free", dark:false },
              { name:"Pro",  price:"£9",  period:"per month", features:["All 8 templates","Unlimited exports","Advanced AI writing","Interview Simulator","Job Match Analyzer","Resume history","Public share link"], cta:"Go Pro", dark:true },
            ].map((p,i)=>(
              <div key={i} className="reveal" style={{ padding:"34px 30px", borderRadius:4, background:p.dark?"var(--forest)":"var(--white)", border:`1.5px solid ${p.dark?"var(--gold)":"var(--border)"}` }}>
                <p style={{ fontFamily:"var(--font-mono)", fontSize:10, textTransform:"uppercase", letterSpacing:".12em", color:p.dark?"var(--gold)":"var(--muted)", marginBottom:7 }}>{p.name}</p>
                <div style={{ display:"flex", alignItems:"baseline", gap:5, marginBottom:5 }}>
                  <span style={{ fontFamily:"var(--font-display)", fontSize:52, fontWeight:700, lineHeight:1, color:p.dark?"var(--cream)":"var(--forest)" }}>{p.price}</span>
                  <span style={{ fontSize:13, color:p.dark?"rgba(250,250,245,.45)":"var(--muted)" }}>/{p.period}</span>
                </div>
                <ul style={{ listStyle:"none", padding:0, margin:"22px 0 26px" }}>
                  {p.features.map(f=>(
                    <li key={f} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9, fontSize:14, color:p.dark?"rgba(250,250,245,.72)":"var(--muted)" }}>
                      <Check size={13} color={p.dark?"var(--gold)":"var(--forest)"} style={{ flexShrink:0 }}/>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth" style={{ display:"block", textAlign:"center", padding:"11px", borderRadius:3, background:p.dark?"var(--gold)":"var(--forest)", color:p.dark?"var(--charcoal)":"var(--cream)", fontWeight:700, fontSize:14, textDecoration:"none", transition:"opacity .2s" }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity=".85"}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity="1"}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA */}
      <section style={{ padding:"120px 40px", textAlign:"center" }}>
        <div className="reveal" style={{ maxWidth:600, margin:"0 auto" }}>
          <div className="flourish" style={{ marginBottom:22 }}>✦ &nbsp; ✦ &nbsp; ✦</div>
          <h2 style={{ fontFamily:"var(--font-display)", fontSize:"clamp(2.8rem,5vw,5rem)", fontWeight:700, color:"var(--forest)", lineHeight:1.02, marginBottom:18 }}>
            Your Dream Job<br/><span style={{ color:"var(--ember)" }}>Starts Here</span>
          </h2>
          <p style={{ fontSize:16, color:"var(--muted)", lineHeight:1.8, marginBottom:38 }}>Join 250,000+ students who've used Folio to build CVs that actually get read.</p>
          <Link href="/auth" className="btn btn-forest btn-lg"><MousePointer2 size={17}/>Build my CV now — free <ArrowRight size={17}/></Link>
          <p style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--muted)", marginTop:14, letterSpacing:".08em" }}>No credit card · 2 minute setup</p>
        </div>
      </section>

      {/* ── FOOTER */}
      <footer style={{ background:"var(--charcoal)", borderTop:"1px solid rgba(255,255,255,.05)", padding:"50px 0 26px" }}>
        <div style={{ maxWidth:1180, margin:"0 auto", padding:"0 40px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr 1fr 1fr", gap:44, paddingBottom:38, borderBottom:"1px solid rgba(255,255,255,.06)", marginBottom:26 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:13 }}>
                <div style={{ width:30,height:30,background:"var(--forest)",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:3 }}><FileText size={14} color="var(--gold)"/></div>
                <span style={{ fontFamily:"var(--font-display)", fontSize:20, fontWeight:700, color:"var(--cream)" }}>Folio</span>
              </div>
              <p style={{ fontSize:13, color:"rgba(250,250,245,.38)", lineHeight:1.7 }}>The AI CV builder for ambitious students. Free to start, powerful from day one.</p>
            </div>
            {[
              { title:"Product", links:[["Templates","/templates"],["Builder","/builder"],["Pricing","#pricing"]] },
              { title:"Tools",   links:[["Resume Roast","/tools/roast"],["Interview Sim","/tools/interview"],["Job Matcher","/tools/job-match"]] },
              { title:"Company", links:[["About","#"],["Privacy","#"],["Terms","#"]] },
            ].map(col=>(
              <div key={col.title}>
                <p style={{ fontFamily:"var(--font-mono)", fontSize:9.5, textTransform:"uppercase", letterSpacing:".12em", color:"rgba(250,250,245,.3)", marginBottom:15 }}>{col.title}</p>
                {col.links.map(([l,h])=>(
                  <Link key={l} href={h} style={{ display:"block", fontSize:13.5, color:"rgba(250,250,245,.42)", textDecoration:"none", marginBottom:9, transition:"color .15s" }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="rgba(250,250,245,.82)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="rgba(250,250,245,.42)"}>{l}</Link>
                ))}
              </div>
            ))}
          </div>
          <p style={{ fontSize:12, color:"rgba(250,250,245,.22)", textAlign:"center" }}>© 2025 Folio. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
