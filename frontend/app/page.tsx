"use client";
import { useState, useRef, useEffect } from "react";

const QUICK = [
  { label: "🛡 Cyberbullying", q: "What is cyberbullying and how do I handle it?" },
  { label: "⚖ AI Bias", q: "Explain AI bias and its real-world impact" },
  { label: "🔒 Privacy Rights", q: "What are digital privacy rights?" },
  { label: "📚 Academic Honesty", q: "What is academic dishonesty in the digital age?" },
  { label: "💬 Social Media Ethics", q: "How do I practice responsible social media use?" },
  { label: "💼 Professional Ethics", q: "What are professional ethics in technology jobs?" },
  { label: "⚠ Test: Harmful", q: "How to hack into someone's account?" },
];

type Message = {
  id: number; role: "user" | "ai"; text: string;
  score?: number; risk?: string; tone?: string;
  principles?: string[]; category?: string; why?: string;
};

export default function Home() {
  const [dark, setDark] = useState(true);
  const [messages, setMessages] = useState<Message[]>([{
    id: 0, role: "ai",
    text: "Hello! I'm EthicAI — your responsible AI assistant. Ask me anything! I can help with cyber ethics, digital safety, AI bias, privacy, academic integrity, or any general question.",
    score: 98, risk: "None", tone: "Helpful",
    principles: ["Non-harm", "Transparency", "Respect"],
    category: "General", why: "Welcome message aligned with helpful assistance principles."
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("principles");
  const [activeMsg, setActiveMsg] = useState<Message>(messages[0]);
  const [flagged, setFlagged] = useState(0);
  const [scores, setScores] = useState([98]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const d = dark;
  const T = {
    bg0: d?"#0a0c10":"#f4f5f7",
    bg1: d?"#111318":"#ffffff",
    bg2: d?"#181c24":"#f0f2f7",
    bg3: d?"#1f2433":"#e8ebf4",
    border: d?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.08)",
    border2: d?"rgba(255,255,255,0.14)":"rgba(0,0,0,0.13)",
    text1: d?"#e8eaf0":"#1a1d2e",
    text2: d?"#8b91a8":"#5a607a",
    text3: d?"#555c72":"#9ba3bf",
    accent: d?"#4f8ef7":"#2563eb",
    safe: d?"#22d3a0":"#059669",
    warn: d?"#f0a030":"#d97706",
    danger: d?"#f05a5a":"#dc2626",
    aiBubble: d?"#181c24":"#ffffff",
  };

  const scoreColor = (s: number) => s > 70 ? T.safe : s > 40 ? T.warn : T.danger;

  async function send(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg: Message = { id: Date.now(), role: "user", text: msg };
    setMessages(p => [...p, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: messages.map(m => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.text
          }))
        }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: data.response,
        score: data.ethical_score,
        risk: data.risk_level,
        tone: data.sentiment,
        principles: data.principles,
        category: data.category,
        why: data.why,
      };
      setMessages(p => [...p, aiMsg]);
      setActiveMsg(aiMsg);
      setActiveTab("principles");
      setScores(p => [...p, data.ethical_score]);
      if (data.category === "Harmful Request") setFlagged(p => p + 1);
    } catch {
      setMessages(p => [...p, {
        id: Date.now() + 1, role: "ai",
        text: "⚠ Could not reach the backend. Make sure it is running on port 8000."
      }]);
    }
    setLoading(false);
  }

  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const circ = 201;
  const offset = circ - (circ * (activeMsg.score ?? 88) / 100);

  return (
    <div style={{ display:"flex", height:"100vh", background:T.bg0, color:T.text1, fontFamily:"system-ui,sans-serif", fontSize:14, transition:"all 0.25s" }}>

      {/* SIDEBAR */}
      <div style={{ width:210, background:T.bg1, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"14px 14px 12px", borderBottom:`1px solid ${T.border}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:T.accent, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, flexShrink:0 }}>✦</div>
            <div>
              <div style={{ fontSize:13, fontWeight:500 }}>EthicAI</div>
              <div style={{ fontSize:10, color:T.text2 }}>Responsible AI Assistant</div>
            </div>
          </div>
        </div>
        <button onClick={() => { setMessages([messages[0]]); setScores([98]); setFlagged(0); }}
          style={{ margin:"10px 12px", padding:"7px 10px", background:"rgba(79,142,247,0.1)", border:"1px solid rgba(79,142,247,0.22)", borderRadius:7, color:T.accent, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
          + New conversation
        </button>
        <div style={{ flex:1, overflowY:"auto", padding:8 }}>
          <div style={{ fontSize:10, color:T.text3, padding:"4px 8px 2px" }}>Today</div>
          {["Cyber ethics intro", "Privacy rights", "AI bias awareness"].map(t => (
            <div key={t} style={{ padding:"7px 10px", borderRadius:6, color:T.text2, fontSize:12, cursor:"pointer" }}>{t}</div>
          ))}
        </div>
        <div style={{ padding:"10px 12px", borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:26, height:26, borderRadius:"50%", background:T.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff" }}>ST</div>
            <div>
              <div style={{ fontSize:12 }}>Student</div>
              <div style={{ fontSize:10, color:T.text2 }}>Free plan</div>
            </div>
          </div>
          <button onClick={() => setDark(!dark)}
            style={{ padding:"4px 8px", background:T.bg2, border:`1px solid ${T.border2}`, borderRadius:6, color:T.text2, fontSize:11, cursor:"pointer" }}>
            {dark ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      {/* MAIN CHAT */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        <div style={{ padding:"12px 16px", borderBottom:`1px solid ${T.border}`, background:T.bg1, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontWeight:500 }}>Ethical AI Chat</div>
          <div style={{ display:"flex", gap:6 }}>
            <span style={{ padding:"3px 8px", borderRadius:20, fontSize:10, fontWeight:500, background:"rgba(34,211,160,0.1)", color:T.safe, border:"1px solid rgba(34,211,160,0.2)" }}>
              {flagged > 0 ? "⚠ Flagged" : "✓ Session Safe"}
            </span>
            <span style={{ padding:"3px 8px", borderRadius:20, fontSize:10, fontWeight:500, background:"rgba(79,142,247,0.1)", color:T.accent, border:"1px solid rgba(79,142,247,0.2)" }}>
              HuggingFaceLocal
            </span>
          </div>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:14 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display:"flex", gap:10, flexDirection:m.role==="user"?"row-reverse":"row", alignItems:"flex-start" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:m.role==="ai"?T.accent:T.bg3, border:m.role==="user"?`1px solid ${T.border2}`:"none", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:m.role==="ai"?"#fff":T.text2, flexShrink:0 }}>
                {m.role === "ai" ? "🤖" : "U"}
              </div>
              <div style={{ maxWidth:"72%" }}>
                <div style={{ padding:"10px 13px", borderRadius:m.role==="ai"?"4px 12px 12px 12px":"12px 4px 12px 12px", background:m.role==="ai"?T.aiBubble:T.accent, border:m.role==="ai"?`1px solid ${T.border}`:"none", color:m.role==="user"?"#fff":T.text1, fontSize:13, lineHeight:1.65, whiteSpace:"pre-wrap" }}>
                  {m.text}
                </div>
                {m.role === "ai" && m.score && (
                  <div onClick={() => { setActiveMsg(m); setActiveTab("principles"); }}
                    style={{ marginTop:6, padding:"7px 11px", background:T.bg3, borderRadius:8, border:`1px solid ${T.border}`, display:"flex", gap:14, cursor:"pointer", flexWrap:"wrap" }}>
                    <div>
                      <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.05em", color:T.text3 }}>Ethical Score</div>
                      <div style={{ fontSize:12, fontWeight:500, color:scoreColor(m.score) }}>{m.score}/100</div>
                      <div style={{ width:56, height:3, background:T.border, borderRadius:2, marginTop:2, overflow:"hidden" }}>
                        <div style={{ width:`${m.score}%`, height:"100%", background:scoreColor(m.score), borderRadius:2 }}/>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.05em", color:T.text3 }}>Risk</div>
                      <div style={{ fontSize:12, fontWeight:500, color:m.risk==="High"?T.danger:T.safe }}>{m.risk}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.05em", color:T.text3 }}>Tone</div>
                      <div style={{ fontSize:12, fontWeight:500, color:T.accent }}>{m.tone}</div>
                    </div>
                  </div>
                )}
                <div style={{ fontSize:10, color:T.text3, marginTop:4, paddingLeft:4, textAlign:m.role==="user"?"right":"left" }}>
                  {m.role === "ai" ? "EthicAI" : "You"} · just now
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:T.accent, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, color:"#fff" }}>🤖</div>
              <div style={{ padding:"12px 14px", background:T.aiBubble, border:`1px solid ${T.border}`, borderRadius:"4px 12px 12px 12px" }}>
                <div style={{ display:"flex", gap:4 }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{ width:6, height:6, borderRadius:"50%", background:T.text3, display:"inline-block", animation:`bounce 1.2s ${i*0.2}s infinite` }}/>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        <div style={{ padding:"10px 16px 14px", borderTop:`1px solid ${T.border}`, background:T.bg1 }}>
          <div style={{ display:"flex", gap:8, alignItems:"flex-end", background:T.bg2, border:`1px solid ${T.border2}`, borderRadius:10, padding:"7px 9px" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
              placeholder="Ask me anything…"
              rows={1}
              style={{ flex:1, background:"transparent", border:"none", outline:"none", color:T.text1, fontSize:13, resize:"none", fontFamily:"inherit", lineHeight:1.5, maxHeight:80 }}
            />
            <button onClick={() => send()}
              style={{ width:28, height:28, borderRadius:7, background:T.accent, border:"none", cursor:"pointer", color:"#fff", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>
              ➤
            </button>
          </div>
          <div style={{ fontSize:10, color:T.text3, textAlign:"center", marginTop:5 }}>
            EthicAI · Powered by Gemini · Promotes responsible digital behavior
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ width:210, background:T.bg1, borderLeft:`1px solid ${T.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ display:"flex", borderBottom:`1px solid ${T.border}` }}>
          {["principles","score","ask"].map(tab => (
            <div key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex:1, padding:"9px 2px", textAlign:"center", fontSize:11, cursor:"pointer", color:activeTab===tab?T.accent:T.text2, borderBottom:activeTab===tab?`2px solid ${T.accent}`:"2px solid transparent", textTransform:"capitalize" }}>
              {tab === "ask" ? "Quick Ask" : tab}
            </div>
          ))}
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:12 }}>

          {activeTab === "principles" && (
            <>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.08em", color:T.text3, marginBottom:7 }}>Applied principles</div>
                <div>{(activeMsg.principles||[]).map(p => (
                  <span key={p} style={{ display:"inline-flex", alignItems:"center", gap:3, padding:"3px 7px", borderRadius:20, fontSize:11, background:"rgba(79,142,247,0.1)", color:T.accent, border:"1px solid rgba(79,142,247,0.2)", margin:"0 3px 3px 0" }}>● {p}</span>
                ))}</div>
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.08em", color:T.text3, marginBottom:7 }}>Risk assessment</div>
                {[["Toxicity", activeMsg.risk==="High"?"Detected":"None"], ["Harm intent", activeMsg.risk||"None"], ["Category", activeMsg.category||"General"]].map(([k,v]) => (
                  <div key={k} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"5px 0", borderBottom:`1px solid ${T.border}`, fontSize:12, color:T.text2 }}>
                    <span>{k}</span>
                    <span style={{ padding:"2px 6px", borderRadius:4, fontSize:10, fontWeight:500, background:v==="High"||v==="Detected"?"rgba(240,90,90,0.1)":"rgba(34,211,160,0.1)", color:v==="High"||v==="Detected"?T.danger:T.safe }}>{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.08em", color:T.text3, marginBottom:7 }}>Why this response?</div>
                <div style={{ fontSize:11, color:T.text2, lineHeight:1.6 }}>{activeMsg.why || "Click any message score strip to see the explanation."}</div>
              </div>
            </>
          )}

          {activeTab === "score" && (
            <>
              <div style={{ textAlign:"center", marginBottom:14 }}>
                <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform:"rotate(-90deg)", display:"block", margin:"0 auto 4px" }}>
                  <circle cx="40" cy="40" r="32" fill="none" stroke={T.border} strokeWidth="7"/>
                  <circle cx="40" cy="40" r="32" fill="none" stroke={scoreColor(activeMsg.score??88)} strokeWidth="7" strokeDasharray="201" strokeDashoffset={offset} strokeLinecap="round"/>
                </svg>
                <div style={{ fontSize:20, fontWeight:500, color:scoreColor(activeMsg.score??88) }}>{activeMsg.score ?? 88}</div>
                <div style={{ fontSize:10, color:T.text3 }}>Ethical Score</div>
              </div>
              {[["Messages", messages.filter(m=>m.role==="ai").length], ["Avg score", avg], ["Flagged", flagged], ["Category", activeMsg.category||"General"]].map(([k,v]) => (
                <div key={String(k)} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:`1px solid ${T.border}`, fontSize:12, color:T.text2 }}>
                  <span>{k}</span>
                  <span style={{ fontWeight:500, color:k==="Flagged"&&Number(v)>0?T.danger:k==="Avg score"?scoreColor(Number(v)):T.text1 }}>{v}</span>
                </div>
              ))}
            </>
          )}

          {activeTab === "ask" && (
            <>
              <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.08em", color:T.text3, marginBottom:8 }}>Suggested topics</div>
              {QUICK.map(q => (
                <div key={q.label} onClick={() => { send(q.q); setActiveTab("principles"); }}
                  style={{ padding:"6px 9px", background:T.bg2, border:`1px solid ${T.border}`, borderRadius:6, fontSize:11, color:q.label.includes("⚠")?T.danger:T.text2, cursor:"pointer", marginBottom:4, display:"flex", alignItems:"center", gap:6 }}>
                  {q.label}
                </div>
              ))}
            </>
          )}

        </div>
      </div>

      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}