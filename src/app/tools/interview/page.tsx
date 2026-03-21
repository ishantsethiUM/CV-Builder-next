"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { getInterviewQuestions, getInterviewFeedback, type InterviewQuestion, type InterviewFeedback } from "@/lib/api";
import { Brain, ChevronLeft, Sparkles, ChevronRight, RotateCcw, Star, Clock, AlertCircle } from "lucide-react";

const CAT_COLOR: Record<string,string> = {behavioral:"var(--gold)",technical:"#2d7a4f",situational:"#c84c2e",motivation:"#7c5cbf"};

export default function InterviewPage() {
  const [step, setStep] = useState<"setup"|"session"|"review">("setup");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [cvText, setCvText] = useState("");
  const [count, setCount] = useState(5);
  const [qs, setQs] = useState<InterviewQuestion[]>([]);
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string,InterviewFeedback>>({});
  const [loadQ, setLoadQ] = useState(false);
  const [loadFB, setLoadFB] = useState(false);
  const [qError, setQError] = useState("");
  const [fbError, setFbError] = useState("");
  const [showSample, setShowSample] = useState(false);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout|null>(null);

  useEffect(() => {
    if (running) { timerRef.current = setInterval(()=>setTimer(t=>t+1),1000); }
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running]);

  const fmt = (s:number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const start = async () => {
    setLoadQ(true); setQError("");
    try {
      const questions = await getInterviewQuestions({ role: role||"Software Engineer", company, cvText, count });
      setQs(questions);
      setStep("session"); setTimer(0); setRunning(true);
    } catch (e: unknown) {
      setQError(e instanceof Error ? e.message : "Failed to generate questions");
    } finally {
      setLoadQ(false);
    }
  };

  const getFeedback = async (qid:string, question:string, answer:string) => {
    if (!answer.trim() || feedbacks[qid]) return;
    setLoadFB(true); setFbError("");
    try {
      const fb = await getInterviewFeedback({ question, answer });
      setFeedbacks(p=>({...p,[qid]:fb}));
    } catch (e: unknown) {
      setFbError(e instanceof Error ? e.message : "Feedback request failed");
    } finally {
      setLoadFB(false);
    }
  };

  const q = qs[cur];
  const avgScore = Object.values(feedbacks).length>0
    ? Math.round(Object.values(feedbacks).reduce((a,b)=>a+b.score,0)/Object.values(feedbacks).length*10) : 0;

  return (
    <main style={{ minHeight:"100vh",background:"var(--cream)" }}>
      <nav style={{ background:"var(--white)",borderBottom:"1px solid var(--border)",padding:"0 28px",display:"flex",alignItems:"center",justifyContent:"space-between",height: 60, position:"sticky",top:0,zIndex:40 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <Link href="/dashboard" className="btn btn-ghost btn-sm"><ChevronLeft size={12}/>Dashboard</Link>
          <div style={{ width:1,height:16,background:"var(--border)" }}/>
          <div style={{ display:"flex",alignItems:"center",gap:7 }}>
            <div style={{ width:26,height:26,borderRadius: 6,background:"#7c5cbf",display:"flex",alignItems:"center",justifyContent:"center" }}><Brain size={13} color="#fff"/></div>
            <span style={{ fontFamily:"var(--font-display)",fontSize:17,fontWeight:700,color:"var(--forest)" }}>Interview Simulator</span>
          </div>
        </div>
        {step==="session"&&(
          <div style={{ display:"flex",alignItems:"center",gap:5,fontFamily:"var(--font-mono)",fontSize:12.5,color:timer>1800?"#c84c2e":"var(--gold)" }}>
            <Clock size={13}/>{fmt(timer)}
          </div>
        )}
      </nav>

      <div style={{ maxWidth:700,margin:"0 auto",padding:"48px 36px 72px" }}>

        {/* SETUP */}
        {step==="setup"&&(
          <div className="anim-in">
            <div style={{ textAlign:"center",marginBottom:40 }}>
              <div style={{ fontSize:44,marginBottom:10 }}>🎙️</div>
              <h1 style={{ fontFamily:"var(--font-display)",fontSize:"clamp(2rem,4vw,3.4rem)",fontWeight:700,color:"var(--forest)",marginBottom:9 }}>Interview Simulator</h1>
              <p style={{ fontSize:15,color:"var(--muted)",maxWidth:420,margin:"0 auto" }}>Practice with AI questions tailored to your role. Get instant feedback on every answer.</p>
            </div>
            <div className="card-flat" style={{ padding:"26px",display:"flex",flexDirection:"column",gap:14 }}>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <div><label className="label">Target Role *</label><input className="field" value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Software Engineer"/></div>
                <div><label className="label">Company (optional)</label><input className="field" value={company} onChange={e=>setCompany(e.target.value)} placeholder="e.g. Google, Stripe…"/></div>
              </div>
              <div>
                <label className="label">Your CV (optional — improves relevance)</label>
                <textarea className="field" rows={4} value={cvText} onChange={e=>setCvText(e.target.value)} placeholder="Paste CV text for personalised questions…" style={{ minHeight:80 }}/>
              </div>
              <div>
                <label className="label" style={{ marginBottom:9 }}>Number of Questions</label>
                <div style={{ display:"flex",gap:9 }}>
                  {[3,5,8,10].map(n=>(
                    <button key={n} onClick={()=>setCount(n)}
                      style={{ width:46,height:46,borderRadius: 6,border:`1.5px solid ${count===n?"var(--forest)":"var(--border)"}`,background:count===n?"var(--forest)":"transparent",color:count===n?"var(--cream)":"var(--muted)",fontFamily:"var(--font-display)",fontSize:20,fontWeight:700,cursor:"pointer",transition:"all .14s" }}>{n}</button>
                  ))}
                </div>
              </div>
              {qError&&(
                <div style={{ display:"flex",gap:8,padding:"10px 14px",background:"rgba(200,76,46,.07)",border:"1px solid rgba(200,76,46,.2)",borderRadius:3 }}>
                  <AlertCircle size={13} color="#c84c2e" style={{ flexShrink:0 }}/>
                  <p style={{ fontSize:12.5,color:"#c84c2e" }}>{qError}</p>
                </div>
              )}
              <button onClick={start} disabled={loadQ} className="btn btn-forest" style={{ justifyContent:"center",padding:"12px",opacity:loadQ?.7:1 }}>
                {loadQ?<><div style={{ width:15,height:15,border:"2px solid rgba(250,250,245,.3)",borderTopColor:"var(--cream)",borderRadius:"50%" }} className="spin"/>Generating questions…</>
                :<><Brain size={14}/>Start Session</>}
              </button>
            </div>
          </div>
        )}

        {/* SESSION */}
        {step==="session"&&q&&(
          <div className="anim-in">
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
              <div style={{ display:"flex",gap:4 }}>
                {qs.map((_,i)=><div key={i} style={{ height:3.5,borderRadius:2,background:i<cur?"#2d7a4f":i===cur?"var(--gold)":"var(--border)",transition:"all .3s",width:i===cur?26:13 }}/>)}
              </div>
              <span style={{ fontFamily:"var(--font-mono)",fontSize:9.5,color:"var(--muted)" }}>{cur+1} / {qs.length}</span>
            </div>

            <div className="card-flat" style={{ padding:"22px",marginBottom:13 }}>
              <div style={{ display:"flex",gap:7,marginBottom:13 }}>
                <span className="tag" style={{ background:(CAT_COLOR[q.category]||"var(--gold)")+"18",color:CAT_COLOR[q.category]||"var(--gold)" }}>{q.category}</span>
                <div style={{ display:"flex",gap:1.5 }}>{[1,2,3].map(d=><Star key={d} size={9} fill={d<=q.difficulty?"var(--gold)":"transparent"} color="var(--gold)"/>)}</div>
              </div>
              <h2 style={{ fontFamily:"var(--font-display)",fontSize:21,fontWeight:700,color:"var(--forest)",lineHeight:1.2,marginBottom:13 }}>{q.question}</h2>
              <div style={{ padding:"9px 13px",background:"var(--cream)",borderRadius: 6,border:"1px solid var(--border)",display:"flex",gap:7 }}>
                <Brain size={11} color="#7c5cbf" style={{ flexShrink:0,marginTop:1.5 }}/>
                <p style={{ fontSize:12.5,color:"var(--muted)",lineHeight:1.55 }}>💡 {q.tip}</p>
              </div>
            </div>

            <textarea className="field" rows={7} value={answers[q.id]||""} onChange={e=>setAnswers(p=>({...p,[q.id]:e.target.value}))} placeholder="Type your answer…" style={{ marginBottom:9 }}/>

            <button onClick={()=>setShowSample(!showSample)}
              style={{ fontSize:12,color:showSample?"var(--gold)":"var(--muted)",background:"none",border:"none",cursor:"pointer",marginBottom:showSample?0:9,display:"block" }}>
              {showSample?"Hide":"Show"} sample answer {showSample?"▲":"▼"}
            </button>
            {showSample&&(
              <div style={{ padding:"13px",background:"rgba(200,169,110,.06)",border:"1px solid rgba(200,169,110,.18)",borderRadius: 6,marginBottom:11 }}>
                <p style={{ fontFamily:"var(--font-mono)",fontSize:9,color:"var(--gold)",marginBottom:5,textTransform:"uppercase" }}>Sample Answer</p>
                <p style={{ fontSize:13,color:"var(--muted)",lineHeight:1.65 }}>{q.sample}</p>
              </div>
            )}

            {fbError&&(
              <div style={{ display:"flex",gap:7,padding:"9px 12px",background:"rgba(200,76,46,.06)",border:"1px solid rgba(200,76,46,.18)",borderRadius: 6,marginBottom:10 }}>
                <AlertCircle size={12} color="#c84c2e" style={{ flexShrink:0 }}/>
                <p style={{ fontSize:12,color:"#c84c2e" }}>{fbError}</p>
              </div>
            )}

            {feedbacks[q.id]&&(
              <div className="card-flat" style={{ overflow:"hidden",marginBottom:13 }}>
                <div style={{ display:"flex",gap:11,alignItems:"center",padding:"13px 15px",borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontFamily:"var(--font-display)",fontSize:34,fontWeight:700,color:feedbacks[q.id].score>=8?"#2d7a4f":feedbacks[q.id].score>=6?"var(--gold)":"#c84c2e" }}>
                    {feedbacks[q.id].score}/10
                  </span>
                  <div><p style={{ fontSize:13,fontWeight:600,color:"var(--forest)" }}>AI Feedback</p></div>
                </div>
                <div style={{ padding:"13px 15px",display:"flex",flexDirection:"column",gap:7 }}>
                  {feedbacks[q.id].strengths.map((s,i)=><p key={i} style={{ fontSize:13,color:"var(--ink)",display:"flex",gap:6 }}><span style={{ color:"#2d7a4f",flexShrink:0 }}>✓</span>{s}</p>)}
                  {feedbacks[q.id].improve.map((s,i)=><p key={i} style={{ fontSize:13,color:"var(--ink)",display:"flex",gap:6 }}><span style={{ color:"#c84c2e",flexShrink:0 }}>△</span>{s}</p>)}
                  <div style={{ padding:"9px 13px",background:"rgba(200,169,110,.06)",border:"1px solid rgba(200,169,110,.16)",borderRadius:3 }}>
                    <p style={{ fontFamily:"var(--font-mono)",fontSize:9,color:"var(--gold)",marginBottom:3,textTransform:"uppercase" }}>Stronger version</p>
                    <p style={{ fontSize:13,color:"var(--muted)",lineHeight:1.65 }}>{feedbacks[q.id].better}</p>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display:"flex",gap:9,justifyContent:"flex-end" }}>
              <button onClick={()=>getFeedback(q.id,q.question,answers[q.id]||"")}
                disabled={loadFB||!answers[q.id]?.trim()||!!feedbacks[q.id]}
                className="btn btn-outline btn-sm">
                {loadFB?<div style={{ width:13,height:13,border:"1.5px solid var(--forest)",borderTopColor:"transparent",borderRadius:"50%" }} className="spin"/>:<Sparkles size={12}/>} Feedback
              </button>
              {cur<qs.length-1
                ? <button onClick={()=>{setCur(c=>c+1);setShowSample(false);setFbError("");}} className="btn btn-forest btn-sm">Next <ChevronRight size={12}/></button>
                : <button onClick={()=>{setRunning(false);setStep("review");}} className="btn btn-gold btn-sm">Finish <ChevronRight size={12}/></button>}
            </div>
          </div>
        )}

        {/* REVIEW */}
        {step==="review"&&(
          <div className="anim-in" style={{ textAlign:"center" }}>
            <div style={{ fontSize:44,marginBottom:11 }}>🎉</div>
            <h2 style={{ fontFamily:"var(--font-display)",fontSize:"clamp(2rem,3.5vw,3rem)",fontWeight:700,color:"var(--forest)",marginBottom:5 }}>Session Complete!</h2>
            <p style={{ fontSize:14,color:"var(--muted)",marginBottom:22 }}>{qs.length} questions · {fmt(timer)}</p>
            <p style={{ fontFamily:"var(--font-display)",fontSize:72,fontWeight:700,lineHeight:1,color:avgScore>=70?"#2d7a4f":avgScore>=50?"var(--gold)":"#c84c2e",marginBottom:4 }}>{avgScore}</p>
            <p style={{ fontFamily:"var(--font-mono)",fontSize:10,color:"var(--muted)",marginBottom:34 }}>/ 100 average</p>
            <div style={{ display:"flex",gap:11,justifyContent:"center" }}>
              <button onClick={()=>{setStep("setup");setQs([]);setAnswers({});setFeedbacks({});setCur(0);setTimer(0);}} className="btn btn-outline">
                <RotateCcw size={13}/>New Session
              </button>
              <Link href="/builder" className="btn btn-forest"><Sparkles size={13}/>Improve My CV</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
