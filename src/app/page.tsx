"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import amanSir from "../assets/AmanSir.png"; // adjust path
import SecondImage from "../assets/SecondImage.png"; // adjust path

/* ─────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  "ATS Optimised","◆","8 Templates","◆","AI Writing","◆",
  "Interview Sim","◆","Resume Roast","◆","Job Matching","◆","Free to Start","◆",
];

const TEMPLATES = [
  { id:"classic", label:"Classic",  tag:"Most Popular", tagColor:"#166534", desc:"Clean, ATS-friendly single-column layout trusted across MNCs and campus placements." },
  { id:"modern",  label:"Modern",   tag:"ATS Friendly", tagColor:"#1d4ed8", desc:"Two-column sidebar design — stands out while staying fully recruiter-approved." },
  { id:"minimal", label:"Minimal",  tag:"New",          tagColor:"#7c3aed", desc:"Whitespace-first layout with sharp typographic hierarchy. Ideal for design and finance." },
];

const STEPS = [
  { n:"01", title:"Enter Your Details", desc:"Fill in experience, skills and education. AI enhances your descriptions automatically as you type." },
  { n:"02", title:"Choose Your Design", desc:"Pick from 8 templates. Switch instantly and watch your CV transform live in front of you." },
  { n:"03", title:"Download & Apply",   desc:"Export as PDF or share a live link. Start applying to your dream roles in minutes, not hours." },
];

const TOOLS = [
  { title:"Resume Roast",  desc:"Brutal AI feedback with sharp humour — actually useful. Find out exactly what's killing your applications.", href:"/tools/roast",     tag:"Viral" },
  { title:"Interview Sim", desc:"Practice with AI questions tailored to your CV and target role. Get scored and coached in real time.",      href:"/tools/interview", tag:"Popular" },
  { title:"Job Match",     desc:"Paste a job description — get match score, missing keywords, and rewritten bullets to close the gap.",      href:"/tools/job-match", tag:"New" },
];

const TESTIMONIALS = [
  { name:"Arjun Sharma",    role:"Software Engineer @ Infosys", quote:"FitRezume se CV banaya — ek hi hafte mein 4 interview calls aayi. AI suggestions bilkul sahi jagah kaam aaye.", img:"https://i.pravatar.cc/60?img=47" },
  { name:"Rohan Verma",     role:"Product Manager @ Razorpay",  quote:"ATS scorer ne bataya ki applications kyun reject ho rahi thi. 15 minute mein fix kiya. Dream role 1 mahine mein mil gayi.", img:"https://i.pravatar.cc/60?img=12" },
  { name:"Priya Patel",     role:"UX Designer @ Flipkart",       quote:"Templates ekdum professional lagte hain. FitRezume use karne ke 3 hafte mein placement confirm ho gayi.", img:"https://i.pravatar.cc/60?img=32" },
];

const PRICING = [
  { name:"Free", price:"₹0",   period:"forever",   featured:false, cta:"Start free", features:["3 templates","PDF export","Basic AI suggestions","ATS score","Resume Roast (3/month)"] },
  { name:"Pro",  price:"₹499", period:"per month", featured:true,  cta:"Go Pro",     features:["All 8 templates","Unlimited exports","Advanced AI writing","Interview Simulator","Job Match Analyzer","Resume history","Public share link"] },
];

/* ─────────────────────────────────────────────────────────
   FONT ALIASES  (drop-in for next/font CSS variables)
───────────────────────────────────────────────────────── */
const F = "var(--font-display)"; // Outfit
const B = "var(--font-body)";    // Inter
const M = "var(--font-mono)";    // IBM Plex Mono

/* ─────────────────────────────────────────────────────────
   INLINE SVG ICONS
───────────────────────────────────────────────────────── */
const ArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const CheckIcon = ({ gold }: { gold?: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={gold ? "var(--accent)" : "var(--ink)"} strokeWidth="2.5" style={{ flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const Star = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent)">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────────────────── */
export default function Home() {
  const navRef        = useRef<HTMLElement>(null);
  const heroBgRef     = useRef<HTMLDivElement>(null);
  const heroBadgeRef  = useRef<HTMLDivElement>(null);
  const heroTitleRef  = useRef<HTMLHeadingElement>(null);
  const heroDescRef   = useRef<HTMLParagraphElement>(null);
  const heroCtaRef    = useRef<HTMLDivElement>(null);
  const heroSocialRef = useRef<HTMLDivElement>(null);
  const floatCardRef  = useRef<HTMLDivElement>(null);
  const fb1Ref        = useRef<HTMLDivElement>(null);
  const fb2Ref        = useRef<HTMLDivElement>(null);
  const atsFillRef    = useRef<HTMLDivElement>(null);
  const atsNumRef     = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    /* 1. Inject CSS variable aliases so F/B/M resolve to layout fonts */
    if (!document.getElementById("fr-font-vars")) {
      const style = document.createElement("style");
      style.id = "fr-font-vars";
      style.textContent = `
        :root {
          --font-display: 'Outfit', system-ui, sans-serif;
          --font-body:    'Inter', system-ui, sans-serif;
          --font-mono:    'IBM Plex Mono', monospace;
        }
      `;
      document.head.appendChild(style);
    }

    document.body.style.overflowX = "hidden";

    let killed = false;
    (async () => {
      try {
        const { gsap }          = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        if (killed) return;
        gsap.registerPlugin(ScrollTrigger);

        /* Sticky nav */
        const onScroll = () => navRef.current?.classList.toggle("fr-scrolled", window.scrollY > 60);
        window.addEventListener("scroll", onScroll, { passive: true });

        /* Hero entrance */
        const heroEls = [heroBadgeRef, heroTitleRef, heroDescRef, heroCtaRef, heroSocialRef, floatCardRef, fb1Ref, fb2Ref];
        heroEls.forEach(r => r.current && gsap.set(r.current, { autoAlpha: 0 }));

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.to(heroBadgeRef.current,   { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.25 })
          .fromTo(heroTitleRef.current, { y: 55, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.0 }, "-=.35")
          .to(heroDescRef.current,     { autoAlpha: 1, duration: 0.85 }, "-=.65")
          .to(heroCtaRef.current,      { autoAlpha: 1, duration: 0.8  }, "-=.6")
          .to(heroSocialRef.current,   { autoAlpha: 1, duration: 0.8  }, "-=.5")
          .to(floatCardRef.current,    { autoAlpha: 1, duration: 1.0, ease: "back.out(1.4)" }, "-=.75")
          .fromTo(fb1Ref.current,      { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=.2")
          .fromTo(fb2Ref.current,      { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.6 }, "-=.3");

        /* ATS bar */
        gsap.delayedCall(1.4, () => {
          if (atsFillRef.current) atsFillRef.current.style.width = "87%";
          const obj = { v: 0 };
          gsap.to(obj, {
            v: 87, duration: 1.6, ease: "power2.out",
            onUpdate: () => { if (atsNumRef.current) atsNumRef.current.textContent = Math.round(obj.v) + "%"; },
          });
        });

        /* Parallax hero bg */
        gsap.to(heroBgRef.current, {
          yPercent: 22, ease: "none",
          scrollTrigger: { trigger: "#fr-hero", start: "top top", end: "bottom top", scrub: true },
        });

        /* Floating card bob */
        gsap.to(floatCardRef.current, { y: -12, duration: 3,   repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1.6 });
        gsap.to(fb1Ref.current,       { y: -6,  duration: 2.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.4 });
        gsap.to(fb2Ref.current,       { y:  8,  duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.8 });

        /* Scroll reveals */
        document.querySelectorAll<HTMLElement>(".fr-reveal").forEach(el => {
          gsap.from(el, { autoAlpha: 0, y: 32, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" } });
        });

        /* Stat counters */
        document.querySelectorAll<HTMLElement>(".fr-stat-num").forEach(el => {
          const target  = parseFloat(el.dataset.target ?? "0");
          const suffix  = el.dataset.suffix ?? "";
          const isFloat = target % 1 !== 0;
          const isLarge = target >= 1000;
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target, duration: 2.2, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
            onUpdate: () => {
              el.textContent = isLarge ? Math.round(obj.v / 1000) + suffix
                : isFloat ? obj.v.toFixed(1) + suffix
                : Math.round(obj.v) + suffix;
            },
          });
        });

        /* Card stagger */
        gsap.utils.toArray<HTMLElement>(".fr-card").forEach((c, i) => {
          gsap.from(c, { autoAlpha: 0, y: 44, rotation: 1.2, duration: 0.9, delay: i * 0.12, ease: "power3.out",
            scrollTrigger: { trigger: c, start: "top 90%" } });
        });

        /* Tool cards */
        gsap.utils.toArray<HTMLElement>(".fr-tool").forEach((c, i) => {
          gsap.from(c, { autoAlpha: 0, x: i % 2 === 0 ? -28 : 28, y: 16, duration: 0.9, delay: i * 0.1, ease: "power3.out",
            scrollTrigger: { trigger: c, start: "top 88%" } });
        });

        /* Pricing */
        gsap.utils.toArray<HTMLElement>(".fr-price").forEach((c, i) => {
          gsap.from(c, { autoAlpha: 0, scale: 0.94, y: 28, duration: 1, delay: i * 0.15, ease: "back.out(1.5)",
            scrollTrigger: { trigger: c, start: "top 88%" } });
        });

        /* About image wipe */
        gsap.from(".fr-about-img", { clipPath: "inset(0 100% 0 0)", duration: 1.3, ease: "power4.inOut",
          scrollTrigger: { trigger: ".fr-about-img", start: "top 80%" } });

        /* Step circles */
        gsap.utils.toArray<HTMLElement>(".fr-step-circle").forEach((el, i) => {
          gsap.from(el, { scale: 0, rotation: -15, autoAlpha: 0, duration: 0.7, delay: i * 0.15, ease: "back.out(2)",
            scrollTrigger: { trigger: el, start: "top 88%" } });
        });

        /* Magnetic CTAs */
        document.querySelectorAll<HTMLElement>(".fr-magnetic").forEach(btn => {
          btn.addEventListener("mousemove", (e) => {
            const r = btn.getBoundingClientRect();
            gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.22, duration: 0.4, ease: "power2.out" });
          });
          btn.addEventListener("mouseleave", () => gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,.5)" }));
        });

        return () => {
          killed = true;
          window.removeEventListener("scroll", onScroll);
          ScrollTrigger.getAll().forEach(t => t.kill());
        };
      } catch (err) {
        console.warn("GSAP unavailable:", err);
      }
    })();

    return () => {
      killed = true;
      document.body.style.overflowX = "";
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ══════════ NAV ══════════ */}
      <nav className="fr-nav" ref={navRef}>
        <Link href="/" className="fr-logo">
          <span className="fr-logo-icon"><DocIcon /></span>
          <span className="fr-logo-text" style={{ fontFamily: F }}>FitRezume</span>
        </Link>
        <div className="fr-nav-links">
          {([["Templates","/templates"],["Tools","/tools/roast"],["Pricing","#pricing"]] as [string,string][]).map(([l,h]) => (
            <Link key={l} href={h} className="fr-nav-link" style={{ fontFamily: B }}>{l}</Link>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <Link href="/auth" className="fr-btn fr-btn-ghost fr-btn-sm" style={{ fontFamily: B }}>Sign in</Link>
          <Link href="/auth" className="fr-btn fr-btn-forest fr-btn-sm fr-magnetic" style={{ fontFamily: B }}>
            Get started free <ArrowRight size={13}/>
          </Link>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section id="fr-hero">
        {/* <div ref={heroBgRef} className="fr-hero-bg"
          style={{ backgroundImage:"url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1800&auto=format&fit=crop&q=80')" }}
        /> */}
        <div
          ref={heroBgRef} className="fr-hero-bg" style={{ backgroundImage: `url(${amanSir.src})` }}
        />
        <div className="fr-hero-overlay" />

        <div className="fr-hero-content">
          <div>
            <div className="fr-badge" ref={heroBadgeRef} style={{ fontFamily: M }}>
              <span className="fr-badge-dot" /> AI-Powered Platform
            </div>
            <h1 className="fr-hero-title" ref={heroTitleRef} style={{ fontFamily: F }}>
              Craft the CV<br/>That <em className="fr-hero-accent">Gets You<br/>Hired</em>
            </h1>
            <p className="fr-hero-desc" ref={heroDescRef} style={{ fontFamily: B }}>
              Built for ambitious Indian students. Our AI writes, improves and optimises your CV for top MNCs, startups and campus placements — so you focus on the interview, not the format.
            </p>
            <div className="fr-hero-cta" ref={heroCtaRef}>
              <Link href="/builder"   className="fr-btn fr-btn-gold   fr-btn-lg fr-magnetic" style={{ fontFamily: B }}>Build my CV — free <ArrowRight size={16}/></Link>
              <Link href="/templates" className="fr-btn fr-btn-outline fr-btn-lg"             style={{ fontFamily: B }}>View templates</Link>
            </div>
            <div className="fr-social-proof" ref={heroSocialRef}>
              <div className="fr-avatars">
                {["47","12","32","22","8"].map((n,i) => <img key={i} src={`https://i.pravatar.cc/36?img=${n}`} alt="" />)}
              </div>
              <div>
                <div className="fr-stars">{[1,2,3,4,5].map(i => <Star key={i}/>)}</div>
                <p className="fr-social-text" style={{ fontFamily: B }}>Loved by <strong>2,50,000+</strong> students across India</p>
              </div>
            </div>
          </div>

          {/* Resume document mockup */}
          <div className="fr-hero-right">
            <div className="fr-resume-mock" ref={floatCardRef}>
              <div className="fr-float-badge fr-fb1" ref={fb1Ref} style={{ fontFamily: B }}>
               Interview booked!
              </div>

              <div className="fr-mock-header">
                <div className="fr-mock-avatar" style={{ fontFamily: F }}>AM</div>
                <div className="fr-mock-info">
                  <div className="fr-mock-name" style={{ fontFamily: B }}>Aarav Mehta</div>
                  <div className="fr-mock-role" style={{ fontFamily: B }}>Software Engineer · Mumbai</div>
                  <div className="fr-mock-meta" style={{ fontFamily: M }}>aarav@email.com · linkedin.com/in/aarav</div>
                </div>
                <div className="fr-mock-ats-pill" style={{ fontFamily: M }}>
                  <span>ATS</span>
                  <strong ref={atsNumRef}>0%</strong>
                </div>
              </div>

              <div className="fr-ats-bar">
                <div className="fr-ats-fill" ref={atsFillRef} style={{ width:"0%" }} />
              </div>

              <div className="fr-mock-section">
                <div className="fr-mock-section-label" style={{ fontFamily: M }}>Experience</div>
                <div className="fr-mock-line fr-mock-line-full" />
                <div className="fr-mock-line fr-mock-line-80" />
                <div className="fr-mock-line fr-mock-line-65" />
              </div>

              <div className="fr-mock-section">
                <div className="fr-mock-section-label" style={{ fontFamily: M }}>Education</div>
                <div className="fr-mock-line fr-mock-line-full" />
                <div className="fr-mock-line fr-mock-line-70" />
              </div>

              <div className="fr-mock-skills">
                {["Python","React","Node.js","AWS","Agile"].map((s,i) => (
                  <span key={s} className={`fr-mock-skill${i===1?" fr-mock-skill-gold":""}`} style={{ fontFamily: M }}>{s}</span>
                ))}
              </div>

              <div className="fr-mock-ai-bar">
                <span className="fr-mock-ai-text" style={{ fontFamily: B }}>AI optimising your bullets...</span>
                <div className="fr-mock-ai-dots"><span /><span /><span /></div>
              </div>
            </div>

            <div className="fr-float-badge fr-fb2" ref={fb2Ref} style={{ fontFamily: B }}>
               AI optimised
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ MARQUEE ══════════ */}
      <div className="fr-marquee-wrap">
        <div className="fr-marquee-track">
          {[...MARQUEE_ITEMS,...MARQUEE_ITEMS,...MARQUEE_ITEMS].map((item,i) => (
            <span key={i} className={`fr-marquee-item${item==="◆"?" fr-diamond":""}`} style={{ fontFamily: M }}>{item}</span>
          ))}
        </div>
      </div>

      {/* ══════════ STATS ══════════ */}
      <section className="fr-stats-section">
        <div className="fr-stats-grid">
          {[
            { label:"CVs Created",    target:250000, suffix:"K+", display:"250K+" },
            { label:"Templates",      target:8,      suffix:"",   display:"8"     },
            { label:"Interview Rate", target:89,     suffix:"%",  display:"89%"   },
            { label:"Student Rating", target:4.9,    suffix:"★",  display:"4.9★"  },
          ].map((s,i) => (
            <div key={i} className="fr-stat-item fr-reveal">
              <span className="fr-stat-num" data-target={s.target} data-suffix={s.suffix} style={{ fontFamily: F }}>{s.display}</span>
              <span className="fr-stat-label" style={{ fontFamily: M }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ ABOUT ══════════ */}
      <section className="fr-section">
        <div className="fr-container">
          <div className="fr-about-grid">
            <div className="fr-reveal">
              <div className="fr-eyebrow" style={{ fontFamily: M }}>About FitRezume</div>
              <h2 className="fr-section-title" style={{ textAlign:"left", marginBottom:20, fontFamily: F }}>
                Empowering Students<br/>for <em style={{ color:"var(--primary)", fontStyle:"normal" }}>Career Success</em>
              </h2>
              <p style={{ fontSize:15.5, color:"var(--muted)", lineHeight:1.85, marginBottom:28, fontFamily: B }}>
                FitRezume was built by Indian students, for Indian students. We know how overwhelming placements and job applications feel — so we created a platform that takes the guesswork out of CV writing. AI handles the hard parts; you focus on your story.
              </p>
              <Link href="/auth" className="fr-btn fr-btn-outline" style={{ fontFamily: B }}>Start building free</Link>
            </div>
            <div className="fr-about-img-wrap fr-reveal">
              <div className="fr-about-decor1" />
              <div className="fr-about-decor2" />
              <img className="fr-about-img"
                src={SecondImage.src}
                alt="Students collaborating" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ TEMPLATES ══════════ */}
      <section className="fr-section fr-bg-warm">
        <div className="fr-container">
          <p className="fr-flourish fr-reveal">✦ &nbsp; ✦ &nbsp; ✦</p>
          <div className="fr-section-header fr-reveal">
            <div className="fr-eyebrow" style={{ justifyContent:"center", fontFamily: M }}>Resume Templates</div>
            <h2 className="fr-section-title" style={{ fontFamily: F }}>Professional Templates, Ready to Use</h2>
          </div>
          <div className="fr-cards-grid">
            {TEMPLATES.map((t) => (
              <div key={t.id} className="fr-card">
                {/* Template preview */}
                <div className="fr-tpl-preview">
                  <span className="fr-tpl-tag" style={{ background: t.tagColor, fontFamily: M }}>{t.tag}</span>

                  {t.id === "classic" && (
                    <div className="fr-tpl-classic">
                      <div className="fr-tpl-center-header">
                        <div className="fr-tpl-name-bar" />
                        <div className="fr-tpl-role-bar" />
                        <div className="fr-tpl-contact-bar" />
                      </div>
                      <div className="fr-tpl-hdivider" />
                      <div className="fr-tpl-section">
                        <div className="fr-tpl-slabel" style={{ background:"#166534" }} />
                        <div className="fr-tpl-line fr-tpl-l100" /><div className="fr-tpl-line fr-tpl-l80" /><div className="fr-tpl-line fr-tpl-l65" />
                      </div>
                      <div className="fr-tpl-section">
                        <div className="fr-tpl-slabel" style={{ background:"#166534" }} />
                        <div className="fr-tpl-line fr-tpl-l100" /><div className="fr-tpl-line fr-tpl-l70" />
                      </div>
                      <div className="fr-tpl-chips">
                        <div className="fr-tpl-chip" /><div className="fr-tpl-chip" /><div className="fr-tpl-chip" />
                      </div>
                    </div>
                  )}

                  {t.id === "modern" && (
                    <div className="fr-tpl-modern">
                      <div className="fr-tpl-sidebar">
                        <div className="fr-tpl-sb-avatar" />
                        <div className="fr-tpl-sb-line fr-tpl-sb-l80" />
                        <div className="fr-tpl-sb-line fr-tpl-sb-l60" />
                        <div className="fr-tpl-sb-divider" />
                        <div className="fr-tpl-sb-label" />
                        <div className="fr-tpl-sb-line fr-tpl-sb-l100" /><div className="fr-tpl-sb-line fr-tpl-sb-l80" />
                        <div className="fr-tpl-sb-divider" />
                        <div className="fr-tpl-sb-label" />
                        <div className="fr-tpl-chip fr-tpl-chip-sb" /><div className="fr-tpl-chip fr-tpl-chip-sb" />
                      </div>
                      <div className="fr-tpl-main-col">
                        <div className="fr-tpl-section">
                          <div className="fr-tpl-slabel" style={{ background:"#1d4ed8" }} />
                          <div className="fr-tpl-line fr-tpl-l100" /><div className="fr-tpl-line fr-tpl-l85" /><div className="fr-tpl-line fr-tpl-l70" />
                        </div>
                        <div className="fr-tpl-section">
                          <div className="fr-tpl-slabel" style={{ background:"#1d4ed8" }} />
                          <div className="fr-tpl-line fr-tpl-l100" /><div className="fr-tpl-line fr-tpl-l65" />
                        </div>
                      </div>
                    </div>
                  )}

                  {t.id === "minimal" && (
                    <div className="fr-tpl-minimal">
                      <div className="fr-tpl-min-name" />
                      <div className="fr-tpl-min-accent" />
                      <div className="fr-tpl-min-role" />
                      <div className="fr-tpl-min-divider" />
                      <div className="fr-tpl-section">
                        <div className="fr-tpl-slabel" style={{ background:"#7c3aed" }} />
                        <div className="fr-tpl-line fr-tpl-l100" /><div className="fr-tpl-line fr-tpl-l85" /><div className="fr-tpl-line fr-tpl-l70" />
                      </div>
                      <div className="fr-tpl-section">
                        <div className="fr-tpl-slabel" style={{ background:"#7c3aed" }} />
                        <div className="fr-tpl-line fr-tpl-l100" /><div className="fr-tpl-line fr-tpl-l55" />
                      </div>
                      <div className="fr-tpl-chips">
                        <div className="fr-tpl-chip" /><div className="fr-tpl-chip" /><div className="fr-tpl-chip" /><div className="fr-tpl-chip" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="fr-card-body">
                  <h3 className="fr-card-title" style={{ fontFamily: F }}>{t.label}</h3>
                  <p className="fr-card-desc" style={{ fontFamily: B }}>{t.desc}</p>
                  <Link href="/builder" className="fr-btn fr-btn-outline fr-btn-sm" style={{ fontFamily: B }}>Use template</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ BANNER ══════════ */}
      <div className="fr-banner">
        <div className="fr-reveal" style={{ position:"relative", zIndex:1 }}>
          <h2 className="fr-banner-title" style={{ fontFamily: F }}>Build Your CV Today</h2>
          <p className="fr-banner-desc" style={{ fontFamily: B }}>Join 2,50,000+ students across India who've used FitRezume to land interviews at top companies. Takes less than 10 minutes.</p>
          <Link href="/auth" className="fr-btn fr-btn-gold fr-btn-lg fr-magnetic" style={{ fontFamily: B }}>Start for free — no card needed</Link>
        </div>
      </div>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="fr-section">
        <div className="fr-container">
          <div className="fr-section-header fr-reveal">
            <div className="fr-eyebrow" style={{ justifyContent:"center", fontFamily: M }}>How It Works</div>
            <h2 className="fr-section-title" style={{ fontFamily: F }}>Your CV in 3 Steps</h2>
          </div>
          <div className="fr-steps-grid">
            {STEPS.map((s,i) => (
              <div key={i} className="fr-step fr-reveal">
                <div className="fr-step-circle"><span className="fr-step-num" style={{ fontFamily: F }}>{s.n}</span></div>
                <h3 className="fr-step-title" style={{ fontFamily: F }}>{s.title}</h3>
                <p className="fr-step-desc"   style={{ fontFamily: B }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ AI TOOLS ══════════ */}
      <section className="fr-section fr-bg-warm">
        <div className="fr-container">
          <div className="fr-section-header fr-reveal">
            <div className="fr-eyebrow" style={{ justifyContent:"center", fontFamily: M }}>AI Tools</div>
            <h2 className="fr-section-title" style={{ fontFamily: F }}>More Than a CV Builder</h2>
          </div>
          <div className="fr-tools-list">
            {TOOLS.map((t,i) => (
              <Link key={i} href={t.href} className="fr-tool-row">
                <span className="fr-tool-row-num" style={{ fontFamily: M }}>0{i+1}</span>
                <div className="fr-tool-row-body">
                  <div className="fr-tool-row-header">
                    <h3 className="fr-tool-row-title" style={{ fontFamily: F }}>{t.title}</h3>
                    <span className="fr-tool-badge" style={{ fontFamily: M }}>{t.tag}</span>
                  </div>
                  <p className="fr-tool-row-desc" style={{ fontFamily: B }}>{t.desc}</p>
                </div>
                <div className="fr-tool-row-arrow"><ArrowRight size={20}/></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="fr-section">
        <div className="fr-container">
          <p className="fr-flourish fr-reveal">✦ &nbsp; ✦ &nbsp; ✦</p>
          <div className="fr-section-header fr-reveal">
            <h2 className="fr-section-title" style={{ fontFamily: F }}>What Students Say</h2>
          </div>
          <div className="fr-test-asymmetric">
            <div className="fr-test-big">
              <div className="fr-test-stars">{[1,2,3,4,5].map(s=><Star key={s}/>)}</div>
              <p className="fr-test-big-quote" style={{ fontFamily: F }}>{TESTIMONIALS[0].quote}</p>
              <div className="fr-test-author">
                <img src={TESTIMONIALS[0].img} alt={TESTIMONIALS[0].name}/>
                <div>
                  <div className="fr-test-name fr-test-name-light" style={{ fontFamily: B }}>{TESTIMONIALS[0].name}</div>
                  <div className="fr-test-role fr-test-role-light" style={{ fontFamily: B }}>{TESTIMONIALS[0].role}</div>
                </div>
              </div>
            </div>
            <div className="fr-test-small-stack">
              {TESTIMONIALS.slice(1).map((t,i) => (
                <div key={i} className="fr-test-small-card">
                  <div className="fr-test-stars">{[1,2,3,4,5].map(s=><Star key={s}/>)}</div>
                  <p className="fr-test-small-quote" style={{ fontFamily: F }}>{t.quote}</p>
                  <div className="fr-test-author">
                    <img src={t.img} alt={t.name}/>
                    <div>
                      <div className="fr-test-name" style={{ fontFamily: B }}>{t.name}</div>
                      <div className="fr-test-role" style={{ fontFamily: B }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ PRICING ══════════ */}
      <section className="fr-section fr-bg-warm" id="pricing">
        <div className="fr-container">
          <div className="fr-section-header fr-reveal">
            <div className="fr-eyebrow" style={{ justifyContent:"center", fontFamily: M }}>Pricing</div>
            <h2 className="fr-section-title" style={{ fontFamily: F }}>Invest in Your Career</h2>
          </div>
          <div className="fr-pricing-grid">
            {PRICING.map((p,i) => (
              <div key={i} className={`fr-price${p.featured?" fr-price-featured":""}`}>
                <span className="fr-price-plan"   style={{ fontFamily: M }}>{p.name}</span>
                <div style={{ display:"flex", alignItems:"baseline", gap:5, marginBottom:6 }}>
                  <span className="fr-price-num"    style={{ fontFamily: F }}>{p.price}</span>
                  <span className="fr-price-period" style={{ fontFamily: B }}>/ {p.period}</span>
                </div>
                <ul className="fr-price-features">
                  {p.features.map(f => (
                    <li key={f} className="fr-price-feat" style={{ fontFamily: B }}><CheckIcon gold={p.featured}/>{f}</li>
                  ))}
                </ul>
                <Link href="/auth" style={{ fontFamily: B }} className={`fr-price-cta${p.featured?" fr-price-cta-gold":" fr-price-cta-plain"}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="fr-final-cta">
        <div style={{ position:"relative", zIndex:1 }}>
          <p className="fr-flourish" style={{ marginBottom:24 }}>✦ &nbsp; ✦ &nbsp; ✦</p>
          <h2 className="fr-final-title" style={{ fontFamily: F }}>
            Your Dream Job<br/><em style={{ color:"var(--primary)", fontStyle:"normal" }}>Starts Here</em>
          </h2>
          <p className="fr-final-desc" style={{ fontFamily: B }}>
            Join 2,50,000+ students across India who've used FitRezume to build CVs that actually get read and calls that actually come.
          </p>
          <Link href="/auth" className="fr-btn fr-btn-forest fr-btn-lg fr-magnetic" style={{ fontFamily: B }}>
            Build my CV now — free <ArrowRight size={17}/>
          </Link>
          <p className="fr-final-hint" style={{ fontFamily: M }}>No credit card · 2 minute setup</p>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="fr-footer">
        <div className="fr-container">
          <div className="fr-footer-grid">
            <div>
              <div className="fr-logo">
                <span className="fr-logo-icon"><DocIcon /></span>
                <span className="fr-logo-text" style={{ color:"#FFFFFF", fontSize:20, fontFamily: F }}>FitRezume</span>
              </div>
              <p style={{ fontSize:13, color:"rgba(255,255,255,.6)", lineHeight:1.75, marginTop:14, maxWidth:220, fontFamily: B }}>
                The AI CV builder for ambitious students. Free to start, powerful from day one.
              </p>
            </div>
            {[
              { title:"Product",  links:[["Templates","/templates"],["Builder","/builder"],["Pricing","#pricing"]] as [string,string][] },
              { title:"Tools",    links:[["Resume Roast","/tools/roast"],["Interview Sim","/tools/interview"],["Job Matcher","/tools/job-match"]] as [string,string][] },
              { title:"Company",  links:[["About","#"],["Privacy","#"],["Terms","#"]] as [string,string][] },
            ].map(col => (
              <div key={col.title}>
                <div className="fr-footer-col-title" style={{ fontFamily: M }}>{col.title}</div>
                {col.links.map(([l,h]) => <Link key={l} href={h} className="fr-footer-link" style={{ fontFamily: B }}>{l}</Link>)}
              </div>
            ))}
          </div>
          <p className="fr-footer-copy" style={{ fontFamily: B }}>© 2025 FitRezume. Made in India 🇮🇳 · All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   ALL CSS
───────────────────────────────────────────────────────── */
const STYLES = `
/* ── FONT VARIABLES ── */
:root {
  --font-display: 'Outfit', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'IBM Plex Mono', monospace;

  /* ── PROFESSIONAL PALETTE ── */
  --bg-main:      #FFFFFF;   /* page background */
  --bg-surface:   #F8FAFF;   /* surface / section bg */
  --ink:          #0F172A;   /* primary text */
  --muted:        #4B5563;   /* secondary text */
  --border:       #E2E8F0;   /* borders */
  --accent:       #2563EB;   /* professional blue accent */
  --accent-hover: #3B82F6;   /* blue hover */
  --accent-dark:  #1D4ED8;   /* blue dark / eyebrow */
  --accent-subtle: rgba(37,99,235,.1); /* tinted fills */
  --white:        #FFFFFF;   /* cards */
  --primary:      #0F172A;   /* deep navy / main CTA */
  --primary-hover:#1E293B;   /* navy hover */
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }

::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: var(--bg-main); }
::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 3px; }

/* Subtle noise overlay */
body::before {
  content: '';
  position: fixed; inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  opacity: .025; pointer-events: none; z-index: 999;
}

/* ── NAV ── */
.fr-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 500;
  padding: 0 60px; height: 70px;
  display: flex; align-items: center; justify-content: space-between;
  transition: all .5s cubic-bezier(.16,1,.3,1);
}
.fr-nav.fr-scrolled {
  background: rgba(255,255,255,.96);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--border);
  height: 62px;
  box-shadow: 0 2px 24px rgba(17,24,39,.06);
}
.fr-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.fr-logo-icon {
  width: 36px; height: 36px;
  background: var(--primary); border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
}
.fr-logo-text { font-size: 22px; font-weight: 700; color: var(--ink); letter-spacing: -.3px; }
.fr-nav-links { display: flex; gap: 4px; }
.fr-nav-link {
  padding: 7px 14px; font-size: 13.5px; font-weight: 500;
  color: var(--muted); text-decoration: none; border-radius: 4px;
  transition: all .2s;
}
.fr-nav-link:hover { color: var(--ink); background: rgba(17,24,39,.06); }

/* ── BUTTONS ── */
.fr-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 22px; font-size: 14px; font-weight: 600; border-radius: 6px;
  text-decoration: none; transition: all .25s cubic-bezier(.16,1,.3,1);
  border: none; position: relative; overflow: hidden; cursor: pointer;
}
.fr-btn::before {
  content: ''; position: absolute; inset: 0;
  background: rgba(255,255,255,.2);
  transform: translateX(-100%) skewX(-10deg);
  transition: transform .4s cubic-bezier(.16,1,.3,1);
}
.fr-btn:hover::before { transform: translateX(110%) skewX(-10deg); }

.fr-btn-ghost   { background: transparent; color: var(--ink); border: 1.5px solid var(--border); }
.fr-btn-ghost:hover { border-color: var(--ink); background: rgba(17,24,39,.06); }

.fr-btn-forest  { background: var(--primary); color: #FFFFFF; }
.fr-btn-forest:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 8px 28px rgba(15,23,42,.25); }

.fr-btn-gold    { background: var(--accent); color: #FFFFFF; }
.fr-btn-gold:hover { background: var(--accent-hover); transform: translateY(-2px); box-shadow: 0 10px 32px rgba(37,99,235,.4); }

.fr-btn-outline { background: transparent; color: var(--ink); border: 2px solid var(--ink); }
.fr-btn-outline:hover { background: var(--ink); color: #FFFFFF; transform: translateY(-1px); }

.fr-btn-lg { padding: 15px 32px; font-size: 15px; border-radius: 8px; }
.fr-btn-sm { padding: 8px 16px; font-size: 13px; }

/* ── EYEBROW ── */
.fr-eyebrow {
  display: flex; align-items: center; gap: 9px;
  font-size: 10.5px; text-transform: uppercase; letter-spacing: .14em;
  color: var(--accent-dark); margin-bottom: 16px; font-weight: 600;
}
.fr-eyebrow::before, .fr-eyebrow::after { content: ''; width: 28px; height: 1px; background: var(--accent); opacity: .6; }

/* ── HERO ── */
#fr-hero {
  min-height: 100vh; display: flex; align-items: center;
  position: relative; overflow: hidden; background: var(--bg-main);
}
.fr-hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center 30%; }
.fr-hero-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(105deg, rgba(255,255,255,.98) 36%, rgba(255,255,255,.84) 60%, rgba(255,255,255,.08) 100%);
}
.fr-hero-content {
  position: relative; z-index: 2; max-width: 1240px; margin: 0 auto;
  padding: 130px 60px 110px; width: 100%;
  display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center;
}

.fr-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 7px 15px;
  background: var(--accent-subtle);
  border: 1px solid rgba(37,99,235,.25);
  border-radius: 100px; font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
  color: var(--accent-dark); margin-bottom: 24px;
}
.fr-badge-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
  animation: frPulse 2s infinite;
}
@keyframes frPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:.5} }

.fr-hero-title {
  font-size: clamp(3rem,5.5vw,5.8rem); font-weight: 900;
  line-height: 1.01; color: var(--ink); margin-bottom: 24px; letter-spacing: -.02em;
}
.fr-hero-accent { color: var(--primary); font-style: normal; }

.fr-hero-desc {
  font-size: 16.5px; line-height: 1.85; color: var(--muted);
  max-width: 430px; margin-bottom: 38px;
}
.fr-hero-cta { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 40px; }
.fr-social-proof { display: flex; align-items: center; gap: 16px; }
.fr-avatars { display: flex; }
.fr-avatars img {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2.5px solid var(--bg-main); margin-left: -8px;
}
.fr-avatars img:first-child { margin-left: 0; }
.fr-stars { display: flex; gap: 2px; }
.fr-social-text { font-size: 12.5px; color: var(--muted); margin-top: 4px; }
.fr-social-text strong { color: var(--ink); }

/* Resume Mock */
.fr-hero-right { position: relative; display: flex; justify-content: center; align-items: center; }
.fr-resume-mock {
  background: var(--white); border-radius: 16px; padding: 24px;
  box-shadow: 0 40px 100px rgba(17,24,39,.13), 0 0 0 1px var(--border);
  width: 340px; position: relative;
}
.fr-mock-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; padding-bottom: 16px; border-bottom: 1.5px solid var(--border); }
.fr-mock-avatar {
  width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #fff;
}
.fr-mock-info  { flex: 1; min-width: 0; }
.fr-mock-name  { font-weight: 700; font-size: 14px; color: var(--ink); }
.fr-mock-role  { font-size: 11.5px; color: var(--primary); font-weight: 600; margin-top: 2px; }
.fr-mock-meta  { font-size: 9.5px; color: var(--muted); margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fr-mock-ats-pill {
  flex-shrink: 0; background: var(--primary); color: #fff;
  border-radius: 10px; padding: 5px 9px; text-align: center; line-height: 1.2;
  font-size: 9px; text-transform: uppercase; letter-spacing: .04em;
}
.fr-mock-ats-pill strong { display: block; font-size: 18px; font-weight: 800; line-height: 1; margin-top: 2px; }
.fr-ats-bar  { height: 6px; background: var(--border); border-radius: 100px; overflow: hidden; margin-bottom: 16px; }
.fr-ats-fill { height: 100%; border-radius: 100px; background: linear-gradient(90deg, var(--primary), var(--accent)); transition: width 1.6s ease; }
.fr-mock-section { margin-bottom: 14px; }
.fr-mock-section-label { font-size: 9px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: .1em; margin-bottom: 8px; }
.fr-mock-line {
  height: 7px; border-radius: 100px; margin-bottom: 6px;
  background: linear-gradient(90deg, var(--border) 25%, rgba(17,24,39,.05) 50%, var(--border) 75%);
  background-size: 200% 100%; animation: fr-shimmer 2.2s ease-in-out infinite;
}
.fr-mock-line-full { width: 100%; }
.fr-mock-line-80   { width: 80%; animation-delay: .3s; }
.fr-mock-line-70   { width: 70%; animation-delay: .15s; }
.fr-mock-line-65   { width: 65%; animation-delay: .5s; }
@keyframes fr-shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
.fr-mock-skills { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
.fr-mock-skill { padding: 4px 10px; border-radius: 100px; font-size: 10px; font-weight: 600; background: rgba(17,24,39,.07); color: var(--ink); }
.fr-mock-skill-gold { background: var(--accent-subtle); color: var(--accent-dark); }
.fr-mock-ai-bar {
  display: flex; align-items: center; gap: 8px;
  background: rgba(22,101,52,.06); border: 1px solid rgba(22,101,52,.18);
  border-radius: 9px; padding: 9px 12px;
}
.fr-mock-ai-icon { color: var(--primary); font-size: 12px; flex-shrink: 0; }
.fr-mock-ai-text { font-size: 11px; color: var(--primary); font-weight: 500; flex: 1; }
.fr-mock-ai-dots { display: flex; gap: 3px; }
.fr-mock-ai-dots span { width: 4px; height: 4px; border-radius: 50%; background: var(--primary); animation: fr-dot 1.2s ease-in-out infinite; }
.fr-mock-ai-dots span:nth-child(2) { animation-delay: .2s; }
.fr-mock-ai-dots span:nth-child(3) { animation-delay: .4s; }
@keyframes fr-dot { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-4px);opacity:1} }
.fr-float-badge {
  position: absolute; background: var(--primary); color: #FFFFFF;
  font-size: 11.5px; font-weight: 600; padding: 10px 14px; border-radius: 12px;
  box-shadow: 0 12px 32px rgba(15,23,42,.22); white-space: nowrap;
  display: flex; align-items: center; gap: 7px;
}
.fr-fb1 { top: -18px; right: -28px; }
.fr-fb2 { bottom: 30px; left: -36px; }

/* ── MARQUEE ── */
.fr-marquee-wrap {
  background: var(--primary); overflow: hidden; padding: 14px 0;
  border-top: 1px solid rgba(37,99,235,.15);
  border-bottom: 1px solid rgba(37,99,235,.15);
}
.fr-marquee-track { display: flex; animation: frMarquee 22s linear infinite; width: max-content; }
@keyframes frMarquee { from{transform:translateX(0)} to{transform:translateX(-33.33%)} }
.fr-marquee-item {
  padding: 0 28px; font-size: 10.5px; text-transform: uppercase;
  letter-spacing: .1em; color: rgba(255,255,255,.6); white-space: nowrap;
}
.fr-diamond { color: var(--accent); opacity: .85; }

/* ── STATS ── */
.fr-stats-section {
  background: var(--primary);
  padding: 80px 0; position: relative; overflow: hidden;
}
.fr-stats-section::before {
  content: ''; position: absolute; top: -40%; right: -10%;
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(37,99,235,.08) 0%, transparent 70%);
  border-radius: 50%;
}
.fr-stats-grid {
  max-width: 1240px; margin: 0 auto; padding: 0 60px;
  display: grid; grid-template-columns: repeat(4,1fr);
}
.fr-stat-item { text-align: center; padding: 0 30px; border-right: 1px solid rgba(37,99,235,.14); }
.fr-stat-item:last-child { border-right: none; }
.fr-stat-num   { font-size: clamp(3rem,4.5vw,4.5rem); font-weight: 700; color: var(--accent); line-height: 1; display: block; }
.fr-stat-label { font-size: 9.5px; text-transform: uppercase; letter-spacing: .14em; color: rgba(255,255,255,.6); margin-top: 8px; display: block; }

/* ── LAYOUT ── */
.fr-section    { padding: 110px 0; background: var(--bg-main); }
.fr-bg-warm    { background: var(--bg-surface); }
.fr-container  { max-width: 1240px; margin: 0 auto; padding: 0 60px; }
.fr-section-header { text-align: center; margin-bottom: 64px; }
.fr-section-title  { font-size: clamp(2.2rem,3.5vw,3.6rem); font-weight: 700; color: var(--ink); line-height: 1.1; }
.fr-flourish   { text-align: center; color: var(--accent); letter-spacing: 8px; font-size: 12px; margin-bottom: 16px; opacity: .7; }

/* ── ABOUT ── */
.fr-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 90px; align-items: center; }
.fr-about-img-wrap { position: relative; }
.fr-about-decor1 { position: absolute; top: -20px; right: -20px; width: 80%; height: 80%; border: 1.5px solid var(--accent); border-radius: 8px; opacity: .2; }
.fr-about-decor2 { position: absolute; bottom: -16px; left: -16px; width: 55%; height: 55%; background: var(--primary); border-radius: 8px; opacity: .07; }
.fr-about-img  { position: relative; z-index: 1; width: 100%; height: 420px; object-fit: cover; border-radius: 10px; display: block; }

/* ── TEMPLATE CARDS ── */
.fr-cards-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; align-items: stretch; }
.fr-card {
  background: var(--white); border-radius: 14px; border: 1.5px solid var(--border);
  overflow: hidden; transition: all .4s cubic-bezier(.16,1,.3,1); position: relative;
  display: flex; flex-direction: column;
}
.fr-card::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--accent));
  transform: scaleX(0); transform-origin: left;
  transition: transform .4s cubic-bezier(.16,1,.3,1);
}
.fr-card:hover { transform: translateY(-8px); box-shadow: 0 32px 64px rgba(17,24,39,.10); border-color: transparent; }
.fr-card:hover::after { transform: scaleX(1); }
.fr-card-body  { padding: 24px 26px 30px; flex: 1; display: flex; flex-direction: column; }
.fr-card-title { font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 8px; }
.fr-card-desc  { font-size: 14px; color: var(--muted); line-height: 1.65; margin-bottom: 20px; flex: 1; }

/* Template preview area */
.fr-tpl-preview {
  height: 230px; overflow: hidden; position: relative;
  background: #f8fafc; border-bottom: 1.5px solid var(--border);
  padding: 22px 20px 16px;
}
.fr-tpl-tag {
  position: absolute; top: 12px; right: 12px;
  color: #fff; font-size: 9.5px; font-weight: 700; letter-spacing: .06em;
  text-transform: uppercase; padding: 3px 9px; border-radius: 100px;
}

/* Shared lines & chips */
.fr-tpl-line { height: 5px; border-radius: 100px; background: #e2e8f0; margin-bottom: 5px; }
.fr-tpl-l100 { width:100%; } .fr-tpl-l85 { width:85%; } .fr-tpl-l80 { width:80%; }
.fr-tpl-l70  { width:70%;  } .fr-tpl-l65 { width:65%; } .fr-tpl-l55 { width:55%; }
.fr-tpl-section { margin-bottom: 11px; }
.fr-tpl-slabel  { height: 5px; width: 28%; border-radius: 2px; margin-bottom: 7px; opacity:.8; }
.fr-tpl-chips   { display:flex; gap:5px; flex-wrap:wrap; margin-top:4px; }
.fr-tpl-chip    { height:13px; width:36px; border-radius:100px; background:#e2e8f0; }

/* Classic template */
.fr-tpl-classic { }
.fr-tpl-center-header { text-align:center; margin-bottom:10px; }
.fr-tpl-name-bar    { height:10px; width:50%; background:#1e293b; border-radius:3px; margin:0 auto 6px; }
.fr-tpl-role-bar    { height:6px;  width:36%; background:#94a3b8; border-radius:3px; margin:0 auto 5px; }
.fr-tpl-contact-bar { height:4px;  width:58%; background:#cbd5e1; border-radius:3px; margin:0 auto; }
.fr-tpl-hdivider    { height:1.5px; background:#1e293b; margin:10px 0 12px; opacity:.15; }

/* Modern template (sidebar) */
.fr-tpl-modern    { display:flex; height:100%; margin:-22px -20px -16px; }
.fr-tpl-sidebar   { width:36%; background:#1d4ed8; padding:18px 12px; display:flex; flex-direction:column; gap:6px; flex-shrink:0; }
.fr-tpl-sb-avatar { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,.3); margin-bottom:8px; }
.fr-tpl-sb-line   { height:4px; border-radius:100px; background:rgba(255,255,255,.35); }
.fr-tpl-sb-l100 { width:100%; } .fr-tpl-sb-l80 { width:80%; } .fr-tpl-sb-l60 { width:60%; }
.fr-tpl-sb-divider { height:1px; background:rgba(255,255,255,.18); margin:5px 0; }
.fr-tpl-sb-label   { height:4px; width:55%; border-radius:2px; background:rgba(255,255,255,.55); }
.fr-tpl-chip-sb    { height:11px; width:44px; border-radius:100px; background:rgba(255,255,255,.2); }
.fr-tpl-main-col   { flex:1; background:#fff; padding:18px 14px; }

/* Minimal template */
.fr-tpl-minimal { }
.fr-tpl-min-name   { height:11px; width:48%; background:#0f172a; border-radius:3px; margin-bottom:6px; }
.fr-tpl-min-accent { height:3px; width:38px; background:#7c3aed; border-radius:100px; margin-bottom:7px; }
.fr-tpl-min-role   { height:5px; width:34%; background:#94a3b8; border-radius:3px; margin-bottom:14px; }
.fr-tpl-min-divider{ height:1px; background:#e2e8f0; margin-bottom:12px; }

/* ── BANNER ── */
.fr-banner {
  background: var(--primary);
  padding: 90px 60px; text-align: center; position: relative; overflow: hidden;
}
.fr-banner::before {
  content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 700px; height: 700px;
  background: radial-gradient(circle, rgba(37,99,235,.07) 0%, transparent 65%);
  border-radius: 50%;
}
.fr-banner-title { font-size: clamp(2.4rem,4.5vw,4.2rem); font-weight: 700; color: #FFFFFF; margin-bottom: 16px; position: relative; }
.fr-banner-desc  { font-size: 16px; color: rgba(255,255,255,.7); line-height: 1.8; margin-bottom: 36px; max-width: 520px; margin-left: auto; margin-right: auto; }

/* ── STEPS ── */
.fr-steps-grid {
  display: grid; grid-template-columns: repeat(3,1fr); gap: 0; position: relative;
}
.fr-steps-grid::before {
  content: ''; position: absolute; top: 54px; left: 15%; right: 15%; height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: .4;
}
.fr-step       { text-align: center; padding: 0 30px; }
.fr-step-circle {
  width: 78px; height: 78px; border: 2px solid var(--border); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 26px; position: relative;
  transition: all .35s cubic-bezier(.16,1,.3,1); background: var(--bg-main);
}
.fr-step-circle::before {
  content: ''; position: absolute; inset: -7px;
  border: 1px solid rgba(37,99,235,.2); border-radius: 50%;
}
.fr-step:hover .fr-step-circle { background: var(--primary); border-color: var(--primary); box-shadow: 0 12px 32px rgba(15,23,42,.18); }
.fr-step:hover .fr-step-num    { color: #FFFFFF; }
.fr-step-num   { font-size: 28px; font-weight: 700; color: var(--accent-dark); transition: color .3s; }
.fr-step-title { font-size: 22px; font-weight: 700; color: var(--ink); margin-bottom: 12px; }
.fr-step-desc  { font-size: 14.5px; color: var(--muted); line-height: 1.8; }

/* ── TOOLS (list rows) ── */
.fr-tools-list { border: 1.5px solid var(--border); border-radius: 16px; overflow: hidden; }
.fr-tool-row {
  display: flex; align-items: center; gap: 28px; padding: 28px 36px;
  text-decoration: none; border-bottom: 1.5px solid var(--border);
  transition: background .22s ease; background: var(--white);
}
.fr-tool-row:last-child { border-bottom: none; }
.fr-tool-row:hover { background: var(--bg-warm); }
.fr-tool-row-num   { font-size: 12px; font-weight: 700; color: var(--accent); opacity: .6; min-width: 26px; flex-shrink: 0; }
.fr-tool-row-body  { flex: 1; }
.fr-tool-row-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.fr-tool-row-title  { font-size: 22px; font-weight: 700; color: var(--ink); }
.fr-tool-badge  {
  padding: 3px 9px; border-radius: 100px; font-size: 9px;
  letter-spacing: .08em; text-transform: uppercase;
  background: var(--accent-subtle); color: var(--accent-dark); font-weight: 600;
}
.fr-tool-row-desc  { font-size: 14px; color: var(--muted); line-height: 1.65; }
.fr-tool-row-arrow { color: var(--muted); flex-shrink: 0; transition: transform .3s ease, color .25s ease; }
.fr-tool-row:hover .fr-tool-row-arrow { transform: translateX(6px); color: var(--ink); }

/* ── TESTIMONIALS (asymmetric) ── */
.fr-test-asymmetric { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 22px; align-items: start; }
.fr-test-big {
  background: var(--primary); border-radius: 16px; padding: 44px 40px;
}
.fr-test-big-quote {
  font-size: 19px; color: rgba(255,255,255,.9); line-height: 1.75;
  font-style: italic; margin: 18px 0 30px;
}
.fr-test-big-quote::before {
  content: '\\201C'; font-size: 2.4em; color: var(--accent); opacity: .7;
  line-height: 0; vertical-align: -0.55em; margin-right: 4px;
}
.fr-test-small-stack { display: flex; flex-direction: column; gap: 20px; }
.fr-test-small-card {
  background: var(--white); border-radius: 14px; border: 1.5px solid var(--border);
  padding: 26px; transition: all .35s cubic-bezier(.16,1,.3,1);
}
.fr-test-small-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(17,24,39,.07); border-color: transparent; }
.fr-test-small-quote {
  font-size: 13.5px; color: var(--muted); line-height: 1.78; font-style: italic; margin: 12px 0 18px;
}
.fr-test-small-quote::before {
  content: '\\201C'; font-size: 2em; color: var(--accent); opacity: .4;
  line-height: 0; vertical-align: -0.5em; margin-right: 3px;
}
.fr-test-stars     { display: flex; gap: 3px; margin-bottom: 4px; }
.fr-test-author    { display: flex; align-items: center; gap: 12px; }
.fr-test-author img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.fr-test-name      { font-size: 13px; font-weight: 700; color: var(--ink); }
.fr-test-name-light { color: var(--accent-hover); }
.fr-test-role      { font-size: 11.5px; color: var(--muted); margin-top: 2px; }
.fr-test-role-light { color: rgba(255,255,255,.6); }

/* ── PRICING ── */
.fr-pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; max-width: 760px; margin: 0 auto; }
.fr-price {
  padding: 36px 32px; border-radius: 14px; border: 2px solid var(--border);
  background: var(--white); transition: all .35s cubic-bezier(.16,1,.3,1);
}
.fr-price:hover { transform: translateY(-5px); box-shadow: 0 22px 50px rgba(17,24,39,.08); }
.fr-price-featured {
  background: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 24px 64px rgba(15,23,42,.28);
}
.fr-price-plan           { font-size: 10px; text-transform: uppercase; letter-spacing: .15em; color: var(--muted); margin-bottom: 8px; display: block; }
.fr-price-featured .fr-price-plan { color: rgba(37,99,235,.8); }
.fr-price-num            { font-size: 56px; font-weight: 700; color: var(--ink); line-height: 1; }
.fr-price-featured .fr-price-num  { color: #FFFFFF; }
.fr-price-period         { font-size: 13px; color: var(--muted); }
.fr-price-featured .fr-price-period { color: rgba(255,255,255,.6); }
.fr-price-features       { list-style: none; margin: 24px 0 28px; }
.fr-price-feat           { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--muted); margin-bottom: 10px; }
.fr-price-featured .fr-price-feat { color: rgba(255,255,255,.8); }
.fr-price-cta            { display: block; text-align: center; padding: 13px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; transition: all .25s; }
.fr-price-cta-plain      { background: var(--ink); color: #FFFFFF; }
.fr-price-cta-plain:hover { background: #000000; }
.fr-price-cta-gold       { background: var(--accent); color: #FFFFFF; }
.fr-price-cta-gold:hover { background: var(--accent-hover); box-shadow: 0 8px 28px rgba(37,99,235,.38); }

/* ── FINAL CTA ── */
.fr-final-cta {
  padding: 130px 40px; text-align: center; position: relative; overflow: hidden;
  background: var(--bg-main);
}
.fr-final-cta::before {
  content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(37,99,235,.07) 0%, transparent 65%);
  border-radius: 50%; pointer-events: none;
}
.fr-final-title  { font-size: clamp(3rem,5.5vw,5.5rem); font-weight: 900; color: var(--ink); line-height: 1.02; margin-bottom: 20px; letter-spacing: -.02em; }
.fr-final-desc   { font-size: 16px; color: var(--muted); line-height: 1.85; margin-bottom: 40px; max-width: 480px; margin-left: auto; margin-right: auto; }
.fr-final-hint   { font-size: 10px; color: var(--muted); letter-spacing: .1em; text-transform: uppercase; margin-top: 16px; opacity: .65; }

/* ── FOOTER ── */
.fr-footer       { background: var(--primary); border-top: 1px solid rgba(255,255,255,.05); padding: 60px 0 28px; }
.fr-footer-grid  { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 50px; padding-bottom: 44px; border-bottom: 1px solid rgba(255,255,255,.06); margin-bottom: 28px; }
.fr-footer-col-title { font-size: 9.5px; text-transform: uppercase; letter-spacing: .14em; color: rgba(255,255,255,.4); margin-bottom: 16px; }
.fr-footer-link  { display: block; font-size: 13.5px; color: rgba(255,255,255,.6); text-decoration: none; margin-bottom: 10px; transition: color .2s; }
.fr-footer-link:hover { color: #FFFFFF; }
.fr-footer-copy  { text-align: center; font-size: 12px; color: rgba(255,255,255,.3); }

/* ══════════ RESPONSIVE ══════════ */

/* ── Tablet (≤1024px) ── */
@media (max-width: 1024px) {
  .fr-nav { padding: 0 28px; }
  .fr-hero-content { padding: 110px 28px 80px; gap: 36px; }
  .fr-container { padding: 0 28px; }
  .fr-stats-grid { padding: 0 28px; }
  .fr-cards-grid { grid-template-columns: repeat(2,1fr); }
  .fr-test-asymmetric { grid-template-columns: 1fr; }
  .fr-footer-grid { gap: 28px; }
  .fr-about-grid { gap: 48px; }
}

/* ── Mobile (≤768px) ── */
@media (max-width: 768px) {
  /* Nav */
  .fr-nav { padding: 0 20px; height: 60px; }
  .fr-nav-links { display: none; }
  .fr-logo-text { font-size: 18px; }

  /* Hero */
  .fr-hero-content {
    padding: 90px 20px 60px;
    grid-template-columns: 1fr;
    gap: 0;
  }
  .fr-hero-right { display: none; }
  .fr-hero-title { font-size: clamp(2.4rem,9vw,3.6rem); }
  .fr-hero-desc { font-size: 15px; max-width: 100%; }
  .fr-hero-cta { flex-direction: column; gap: 10px; }
  .fr-hero-cta .fr-btn-lg { text-align: center; justify-content: center; }
  .fr-badge { font-size: 9px; padding: 6px 12px; }

  /* Marquee */
  .fr-marquee-item { padding: 0 18px; font-size: 9.5px; }

  /* Stats */
  .fr-stats-section { padding: 50px 0; }
  .fr-stats-grid {
    padding: 0 20px;
    grid-template-columns: repeat(2,1fr);
    gap: 0;
  }
  .fr-stat-item { padding: 20px 16px; border-right: none; border-bottom: 1px solid rgba(37,99,235,.14); }
  .fr-stat-item:nth-child(1), .fr-stat-item:nth-child(2) { border-right: 1px solid rgba(37,99,235,.14); }
  .fr-stat-item:nth-child(3), .fr-stat-item:nth-child(4) { border-bottom: none; }
  .fr-stat-num { font-size: clamp(2.2rem,9vw,3rem); }

  /* Sections */
  .fr-section { padding: 64px 0; }
  .fr-container { padding: 0 20px; }
  .fr-section-title { font-size: clamp(1.8rem,7vw,2.6rem); }
  .fr-section-header { margin-bottom: 36px; }

  /* About */
  .fr-about-grid { grid-template-columns: 1fr; gap: 32px; }
  .fr-about-img  { height: 260px; }

  /* Service cards */
  .fr-cards-grid { grid-template-columns: 1fr; gap: 16px; }

  /* Banner */
  .fr-banner { padding: 60px 20px; }
  .fr-banner-title { font-size: clamp(1.9rem,7vw,3rem); }
  .fr-banner-desc { font-size: 14.5px; }

  /* Steps */
  .fr-steps-grid { grid-template-columns: 1fr; gap: 36px; }
  .fr-steps-grid::before { display: none; }
  .fr-step { padding: 0; }

  /* Tools */
  .fr-tool-row { padding: 20px 20px; gap: 16px; }
  .fr-tool-row-title { font-size: 18px; }

  /* Testimonials */
  .fr-test-asymmetric { grid-template-columns: 1fr; }
  .fr-test-big { padding: 30px 26px; }
  .fr-test-big-quote { font-size: 16px; }

  /* Pricing */
  .fr-pricing-grid { grid-template-columns: 1fr; max-width: 400px; }

  /* Final CTA */
  .fr-final-cta { padding: 80px 20px; }
  .fr-final-title { font-size: clamp(2.2rem,8vw,3.5rem); }

  /* Footer */
  .fr-footer { padding: 44px 0 24px; }
  .fr-footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
    padding: 0 20px 32px;
  }

  /* Buttons full-width in hero */
  .fr-btn-lg { width: 100%; text-align: center; justify-content: center; }
}

/* ── Small mobile (≤480px) ── */
@media (max-width: 480px) {
  .fr-hero-title { font-size: clamp(2rem,10vw,2.8rem); }
  .fr-resume-mock { width: 300px; }
  .fr-footer-grid { grid-template-columns: 1fr; }
  .fr-stats-grid { grid-template-columns: 1fr; }
  .fr-stat-item { border-right: none !important; border-bottom: 1px solid rgba(37,99,235,.14); }
  .fr-stat-item:last-child { border-bottom: none; }
}
`;