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

type Message = { id: number; role: "user" | "ai"; text: string; score?: number; risk?: string; tone?: string; principles?: string[]; category?: string; why?: string; };
type ChatSession = { id: string; title: string; messages: Message[]; time: string; };
type Screen = "landing" | "login" | "signup" | "chat";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  size: Math.random() * 3 + 1, dur: Math.random() * 8 + 6, delay: Math.random() * 4,
}));

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [dark, setDark] = useState(true);
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("principles");
  const [activeMsg, setActiveMsg] = useState<Message | null>(null);
  const [flagged, setFlagged] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [landingVisible, setLandingVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); setTimeout(() => setLandingVisible(true), 100); }, []);
  useEffect(() => { if (screen === "login" || screen === "signup") { setFormVisible(false); setTimeout(() => setFormVisible(true), 50); } }, [screen]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const d = dark;
  const T = {
    bg0: d ? "#080a0f" : "#f0f2f8", bg1: d ? "#0e1117" : "#ffffff",
    bg2: d ? "#161b25" : "#f0f2f7", bg3: d ? "#1c2333" : "#e4e8f4",
    border: d ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)",
    border2: d ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.13)",
    text1: d ? "#e8eaf2" : "#1a1d2e", text2: d ? "#8891aa" : "#5a607a",
    text3: d ? "#4a5168" : "#9ba3bf",
    accent: "#4f8ef7", accent2: "#7c5cfc",
    safe: d ? "#22d3a0" : "#059669", warn: "#f0a030", danger: "#f05a5a",
    aiBubble: d ? "#161b25" : "#ffffff",
    glow: d ? "rgba(79,142,247,0.15)" : "rgba(79,142,247,0.08)",
  };

  const sc = (s: number) => s > 70 ? T.safe : s > 40 ? T.warn : T.danger;
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 98;

  function startNewChat() {
    const welcomeMsg: Message = {
      id: 0, role: "ai",
      text: `Welcome back${user ? ", " + user.name.split(" ")[0] : ""}! I'm EthicAI — your responsible AI assistant. Ask me anything about cyber ethics, digital safety, AI bias, privacy, or any general question.`,
      score: 98, risk: "None", tone: "Helpful",
      principles: ["Non-harm", "Transparency", "Respect"],
      category: "General", why: "Welcome message aligned with helpful assistance principles.",
    };
    const sid = Date.now().toString();
    const session: ChatSession = { id: sid, title: "New conversation", messages: [welcomeMsg], time: "Just now" };
    setSessions(p => [session, ...p]);
    setActiveSessionId(sid);
    setMessages([welcomeMsg]);
    setActiveMsg(welcomeMsg);
    setScores([98]);
    setFlagged(0);
    setShowSidebar(false);
  }

  function loadSession(sid: string) {
    const s = sessions.find(x => x.id === sid);
    if (!s) return;
    setActiveSessionId(sid);
    setMessages(s.messages);
    setActiveMsg(s.messages.filter(m => m.role === "ai").slice(-1)[0] || null);
    setScores(s.messages.filter(m => m.score).map(m => m.score!));
    setShowSidebar(false);
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setTimeout(() => {
      if (!authForm.email || !authForm.password) { setAuthError("Please fill all fields."); setAuthLoading(false); return; }
      if (authForm.password.length < 4) { setAuthError("Password too short."); setAuthLoading(false); return; }
      setUser({ name: authForm.email.split("@")[0], email: authForm.email });
      setAuthLoading(false);
      setScreen("chat");
      setTimeout(startNewChat, 100);
    }, 1200);
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    setTimeout(() => {
      if (!authForm.name || !authForm.email || !authForm.password) { setAuthError("Please fill all fields."); setAuthLoading(false); return; }
      if (authForm.password.length < 4) { setAuthError("Password must be at least 4 characters."); setAuthLoading(false); return; }
      setUser({ name: authForm.name, email: authForm.email });
      setAuthLoading(false);
      setScreen("chat");
      setTimeout(startNewChat, 100);
    }, 1400);
  }

  async function send(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setShowPanel(false);
    setShowSidebar(false);
    const userMsg: Message = { id: Date.now(), role: "user", text: msg };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ message: msg, history: messages.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })) }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: Date.now() + 1, role: "ai", text: data.response,
        score: data.ethical_score, risk: data.risk_level, tone: data.sentiment,
        principles: data.principles, category: data.category, why: data.why,
      };
      const finalMsgs = [...newMsgs, aiMsg];
      setMessages(finalMsgs);
      setActiveMsg(aiMsg);
      setActiveTab("principles");
      setScores(p => [...p, data.ethical_score]);
      if (data.category === "Harmful Request") setFlagged(p => p + 1);
      if (activeSessionId) {
        const title = msg.length > 32 ? msg.slice(0, 32) + "…" : msg;
        setSessions(p => p.map(s => s.id === activeSessionId ? { ...s, messages: finalMsgs, title: s.title === "New conversation" ? title : s.title, time: "Just now" } : s));
      }
    } catch {
      setMessages(p => [...p, { id: Date.now() + 1, role: "ai", text: "⚠ Could not reach the backend. Make sure it is running and ngrok is active." }]);
    }
    setLoading(false);
  }

  const circ = 201;
  const offset = circ - (circ * (activeMsg?.score ?? 88)) / 100;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',system-ui,sans-serif;overflow:hidden;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-12px)}}
    @keyframes pulse{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:0.8;transform:scale(1.05)}}
    @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    @keyframes slideInLeft{from{opacity:0;transform:translateX(-30px)}to{opacity:1;transform:translateX(0)}}
    @keyframes slideInRight{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
    @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(79,142,247,0.3)}50%{box-shadow:0 0 40px rgba(79,142,247,0.6)}}
    @keyframes particleFloat{0%{transform:translateY(0px) translateX(0px);opacity:0.6}50%{transform:translateY(-20px) translateX(10px);opacity:1}100%{transform:translateY(0px) translateX(0px);opacity:0.6}}
    @keyframes typewriter{from{width:0}to{width:100%}}
    @keyframes borderGlow{0%,100%{border-color:rgba(79,142,247,0.3)}50%{border-color:rgba(79,142,247,0.8)}}
    .fadeUp{animation:fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards;}
    .fadeUp1{animation:fadeUp 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) both;}
    .fadeUp2{animation:fadeUp 0.7s 0.2s cubic-bezier(0.16,1,0.3,1) both;}
    .fadeUp3{animation:fadeUp 0.7s 0.35s cubic-bezier(0.16,1,0.3,1) both;}
    .fadeUp4{animation:fadeUp 0.7s 0.5s cubic-bezier(0.16,1,0.3,1) both;}
    .fadeUp5{animation:fadeUp 0.7s 0.65s cubic-bezier(0.16,1,0.3,1) both;}
    .scaleIn{animation:scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both;}
    .dot{width:7px;height:7px;border-radius:50%;display:inline-block;animation:bounce 1.2s infinite;}
    ::-webkit-scrollbar{width:3px;}
    ::-webkit-scrollbar-thumb{background:rgba(79,142,247,0.3);border-radius:2px;}
    textarea{-webkit-appearance:none;-webkit-tap-highlight-color:transparent;}
    button{-webkit-tap-highlight-color:transparent;cursor:pointer;}
    input{outline:none;}
    .btn-primary{background:linear-gradient(135deg,#4f8ef7,#7c5cfc);border:none;color:#fff;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s;font-family:inherit;}
    .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(79,142,247,0.4);}
    .btn-primary:active{transform:translateY(0);}
    .btn-ghost{background:transparent;border:1px solid rgba(79,142,247,0.3);color:#4f8ef7;padding:10px 22px;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;transition:all 0.2s;font-family:inherit;}
    .btn-ghost:hover{background:rgba(79,142,247,0.1);border-color:rgba(79,142,247,0.6);}
    .feature-card{padding:24px;border-radius:14px;border:1px solid rgba(79,142,247,0.15);transition:all 0.3s;position:relative;overflow:hidden;}
    .feature-card:hover{transform:translateY(-4px);border-color:rgba(79,142,247,0.4);box-shadow:0 12px 40px rgba(79,142,247,0.15);}
    .auth-input{width:100%;padding:12px 16px;border-radius:10px;font-size:14px;font-family:inherit;transition:all 0.25s;border:1px solid rgba(79,142,247,0.2);}
    .auth-input:focus{border-color:rgba(79,142,247,0.7);box-shadow:0 0 0 3px rgba(79,142,247,0.12);}
    .chat-item-hover:hover{background:rgba(79,142,247,0.08);}
    @media(min-width:768px){.hamburger{display:none!important;}.panel-btn-mob{display:none!important;}.sidebar-desk{display:flex!important;}.panel-desk{display:flex!important;}}
    @media(max-width:767px){.sidebar-desk{display:none!important;}.panel-desk{display:none!important;}}
  `;

  if (!mounted) return null;

  // ─── LANDING PAGE ───
  if (screen === "landing") return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100dvh", background: d ? "#080a0f" : "#f0f2f8", color: T.text1, overflowY: "auto", overflowX: "hidden", position: "relative" }}>

        {/* Animated background particles */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          {PARTICLES.map(p => (
            <div key={p.id} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: "50%", background: p.id % 3 === 0 ? "#4f8ef7" : p.id % 3 === 1 ? "#7c5cfc" : "#22d3a0", opacity: 0.4, animation: `particleFloat ${p.dur}s ${p.delay}s ease-in-out infinite` }} />
          ))}
          <div style={{ position: "absolute", top: "20%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(79,142,247,0.08) 0%,transparent 70%)", animation: "pulse 6s ease-in-out infinite" }} />
          <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 350, height: 350, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,92,252,0.08) 0%,transparent 70%)", animation: "pulse 8s 2s ease-in-out infinite" }} />
        </div>

        {/* NAV */}
        <nav style={{ position: "sticky", top: 0, zIndex: 50, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: d ? "rgba(8,10,15,0.8)" : "rgba(240,242,248,0.8)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#4f8ef7,#7c5cfc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, animation: "glow 3s ease-in-out infinite" }}>🤖</div>
            <span style={{ fontSize: 17, fontWeight: 700, background: "linear-gradient(135deg,#4f8ef7,#7c5cfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>EthicAI</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setDark(!d)} style={{ padding: "6px 12px", background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 8, color: T.text2, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>{d ? "☀ Light" : "🌙 Dark"}</button>
            <button className="btn-ghost" onClick={() => setScreen("login")}>Log in</button>
            <button className="btn-primary" onClick={() => setScreen("signup")}>Get started</button>
          </div>
        </nav>

        {/* HERO */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className={landingVisible ? "fadeUp1" : ""} style={{ opacity: landingVisible ? 1 : 0 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.25)", fontSize: 12, color: "#4f8ef7", marginBottom: 28, fontWeight: 500 }}>
              ✦ Powered by LLaMA3 · Built for Ethical AI
            </div>
          </div>
          <div className={landingVisible ? "fadeUp2" : ""} style={{ opacity: landingVisible ? 1 : 0 }}>
            <h1 style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: 700, lineHeight: 1.1, marginBottom: 24, letterSpacing: "-0.02em" }}>
              <span style={{ background: "linear-gradient(135deg,#4f8ef7 0%,#7c5cfc 50%,#22d3a0 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI that thinks</span>
              <br />
              <span style={{ color: T.text1 }}>about ethics first</span>
            </h1>
          </div>
          <div className={landingVisible ? "fadeUp3" : ""} style={{ opacity: landingVisible ? 1 : 0 }}>
            <p style={{ fontSize: "clamp(15px,2vw,19px)", color: T.text2, maxWidth: 580, margin: "0 auto 40px", lineHeight: 1.7 }}>
              EthicAI analyzes every conversation for ethical content, scores it in real time, and promotes responsible digital behavior — all powered by a free AI model.
            </p>
          </div>
          <div className={landingVisible ? "fadeUp4" : ""} style={{ opacity: landingVisible ? 1 : 0, display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={() => setScreen("signup")} style={{ padding: "14px 36px", fontSize: 15 }}>Start for free →</button>
            <button className="btn-ghost" onClick={() => setScreen("login")} style={{ padding: "14px 36px", fontSize: 15 }}>Sign in</button>
          </div>

          {/* FLOATING PREVIEW CARD */}
          <div className={landingVisible ? "fadeUp5" : ""} style={{ opacity: landingVisible ? 1 : 0, marginTop: 60, position: "relative" }}>
            <div style={{ background: d ? "rgba(14,17,23,0.9)" : "rgba(255,255,255,0.9)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 18, padding: 24, backdropFilter: "blur(20px)", animation: "float 6s ease-in-out infinite", boxShadow: "0 20px 60px rgba(79,142,247,0.15)" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#4f8ef7,#7c5cfc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>🤖</div>
                <div style={{ background: d ? "#1c2333" : "#f0f2f7", padding: "10px 14px", borderRadius: "4px 14px 14px 14px", fontSize: 13, color: T.text1, textAlign: "left", lineHeight: 1.6, maxWidth: 420 }}>
                  I cannot help with hacking. Unauthorized access violates privacy and is illegal. Instead, I can guide you through <strong style={{ color: "#4f8ef7" }}>ethical cybersecurity</strong> — try HackTheBox or TryHackMe for legal practice! 🛡
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, padding: "10px 14px", background: d ? "#1c2333" : "#e8ebf4", borderRadius: 10, marginLeft: 42 }}>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 9, color: T.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Score</div><div style={{ fontSize: 15, fontWeight: 600, color: "#f05a5a" }}>12/100</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 9, color: T.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Risk</div><div style={{ fontSize: 15, fontWeight: 600, color: "#f05a5a" }}>High</div></div>
                <div style={{ textAlign: "center" }}><div style={{ fontSize: 9, color: T.text3, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tone</div><div style={{ fontSize: 15, fontWeight: 600, color: "#4f8ef7" }}>Protective</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURES */}
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px 80px", position: "relative", zIndex: 1 }}>
          <h2 className={landingVisible ? "fadeUp3" : ""} style={{ textAlign: "center", fontSize: 28, fontWeight: 700, marginBottom: 10, color: T.text1 }}>Everything you need for ethical AI</h2>
          <p style={{ textAlign: "center", color: T.text2, marginBottom: 48, fontSize: 15 }}>Built with industry-standard tools. Designed for responsible use.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {[
              { icon: "🧠", title: "Smart Ethical Engine", desc: "Every response is analyzed for harm, sentiment, and ethical alignment using LLaMA3.", color: "#4f8ef7" },
              { icon: "📊", title: "Live Ethical Scoring", desc: "Real-time score from 0–100 with risk level, tone detection, and principle mapping.", color: "#7c5cfc" },
              { icon: "🛡", title: "Harmful Request Refusal", desc: "Hacking, harassment, and illegal requests are refused with clear ethical explanations.", color: "#22d3a0" },
              { icon: "💡", title: "Transparent Reasoning", desc: "See exactly why each response was generated and which ethical principles were applied.", color: "#f0a030" },
              { icon: "📱", title: "Fully Responsive", desc: "Seamless experience across desktop and mobile with smooth drawer navigation.", color: "#f05a5a" },
              { icon: "🔒", title: "Secure & Private", desc: "Your conversations stay in your session. No data stored without your consent.", color: "#4f8ef7" },
            ].map((f, i) => (
              <div key={i} className="feature-card" style={{ background: d ? "rgba(14,17,23,0.6)" : "rgba(255,255,255,0.8)", animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: T.text1, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: T.text2, lineHeight: 1.65 }}>{f.desc}</p>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${f.color},transparent)`, borderRadius: "0 0 14px 14px" }} />
              </div>
            ))}
          </div>

          {/* STATS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginTop: 60 }}>
            {[["LLaMA3 70B", "AI Model"], ["100%", "Free to use"], ["< 2s", "Response time"], ["Real-time", "Ethics scoring"]].map(([val, lbl], i) => (
              <div key={i} style={{ textAlign: "center", padding: "24px 16px", background: d ? "rgba(14,17,23,0.6)" : "rgba(255,255,255,0.8)", borderRadius: 14, border: "1px solid rgba(79,142,247,0.12)" }}>
                <div style={{ fontSize: 22, fontWeight: 700, background: "linear-gradient(135deg,#4f8ef7,#7c5cfc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{val}</div>
                <div style={{ fontSize: 12, color: T.text3, marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: "center", marginTop: 70, padding: "50px 30px", background: d ? "rgba(14,17,23,0.8)" : "rgba(255,255,255,0.9)", borderRadius: 20, border: "1px solid rgba(79,142,247,0.2)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 200, background: "radial-gradient(ellipse,rgba(79,142,247,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
            <h2 style={{ fontSize: 28, fontWeight: 700, color: T.text1, marginBottom: 12 }}>Ready to chat responsibly?</h2>
            <p style={{ color: T.text2, marginBottom: 28, fontSize: 15 }}>Join thousands exploring ethical AI — completely free.</p>
            <button className="btn-primary" onClick={() => setScreen("signup")} style={{ padding: "14px 40px", fontSize: 15 }}>Create free account →</button>
          </div>
        </div>
      </div>
    </>
  );

  // ─── AUTH PAGES ───
  if (screen === "login" || screen === "signup") {
    const isLogin = screen === "login";
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight: "100dvh", background: d ? "#080a0f" : "#f0f2f8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
          {PARTICLES.slice(0, 10).map(p => (
            <div key={p.id} style={{ position: "fixed", left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: "50%", background: p.id % 2 === 0 ? "#4f8ef7" : "#7c5cfc", opacity: 0.3, animation: `particleFloat ${p.dur}s ${p.delay}s ease-in-out infinite`, pointerEvents: "none" }} />
          ))}
          <div style={{ position: "fixed", top: "30%", left: "20%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(79,142,247,0.06) 0%,transparent 70%)", animation: "pulse 5s ease-in-out infinite", pointerEvents: "none" }} />
          <div style={{ position: "fixed", bottom: "20%", right: "15%", width: 250, height: 250, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,92,252,0.06) 0%,transparent 70%)", animation: "pulse 7s 1s ease-in-out infinite", pointerEvents: "none" }} />

          <div className={formVisible ? "scaleIn" : ""} style={{ opacity: formVisible ? 1 : 0, width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
            <button onClick={() => setScreen("landing")} style={{ background: "none", border: "none", color: T.text3, fontSize: 13, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", padding: 0 }}>
              ← Back to home
            </button>

            <div style={{ background: d ? "rgba(14,17,23,0.95)" : "rgba(255,255,255,0.97)", border: `1px solid rgba(79,142,247,0.2)`, borderRadius: 20, padding: "36px 32px", backdropFilter: "blur(20px)", boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}>

              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,#4f8ef7,#7c5cfc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px", animation: "glow 3s ease-in-out infinite" }}>🤖</div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text1, marginBottom: 6 }}>{isLogin ? "Welcome back" : "Create account"}</h1>
                <p style={{ fontSize: 13, color: T.text2 }}>{isLogin ? "Sign in to continue to EthicAI" : "Start your ethical AI journey"}</p>
              </div>

              <form onSubmit={isLogin ? handleLogin : handleSignup}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {!isLogin && (
                    <div>
                      <label style={{ fontSize: 12, color: T.text2, fontWeight: 500, marginBottom: 6, display: "block" }}>Full name</label>
                      <input className="auth-input" type="text" placeholder="Your name" value={authForm.name} onChange={e => setAuthForm(p => ({ ...p, name: e.target.value }))} style={{ background: d ? "#161b25" : "#f8f9fc", color: T.text1 }} />
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: 12, color: T.text2, fontWeight: 500, marginBottom: 6, display: "block" }}>Email address</label>
                    <input className="auth-input" type="email" placeholder="you@example.com" value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))} style={{ background: d ? "#161b25" : "#f8f9fc", color: T.text1 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: T.text2, fontWeight: 500, marginBottom: 6, display: "block" }}>Password</label>
                    <input className="auth-input" type="password" placeholder="••••••••" value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))} style={{ background: d ? "#161b25" : "#f8f9fc", color: T.text1 }} />
                  </div>
                  {authError && <div style={{ padding: "10px 14px", background: "rgba(240,90,90,0.1)", border: "1px solid rgba(240,90,90,0.2)", borderRadius: 8, fontSize: 12, color: "#f05a5a" }}>{authError}</div>}
                  <button type="submit" className="btn-primary" style={{ width: "100%", padding: "13px", fontSize: 14, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {authLoading ? <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> : isLogin ? "Sign in →" : "Create account →"}
                  </button>
                </div>
              </form>

              <div style={{ textAlign: "center", marginTop: 22, fontSize: 13, color: T.text3 }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => { setScreen(isLogin ? "signup" : "login"); setAuthError(""); setAuthForm({ name: "", email: "", password: "" }); }} style={{ background: "none", border: "none", color: "#4f8ef7", cursor: "pointer", fontWeight: 500, fontSize: 13, fontFamily: "inherit" }}>
                  {isLogin ? "Sign up free" : "Sign in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── CHAT PAGE ───
  const PanelBody = () => (
    <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
      {activeTab === "principles" && activeMsg && (
        <>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, marginBottom: 8 }}>Applied principles</div>
            <div>{(activeMsg.principles || []).map(p => <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 20, fontSize: 11, background: "rgba(79,142,247,0.1)", color: T.accent, border: "1px solid rgba(79,142,247,0.2)", margin: "0 3px 3px 0" }}>● {p}</span>)}</div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, marginBottom: 8 }}>Risk assessment</div>
            {[["Toxicity", activeMsg.risk === "High" ? "Detected" : "None"], ["Harm intent", activeMsg.risk || "None"], ["Category", activeMsg.category || "General"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12, color: T.text2 }}>
                <span>{k}</span>
                <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 500, background: v === "High" || v === "Detected" ? "rgba(240,90,90,0.1)" : "rgba(34,211,160,0.1)", color: v === "High" || v === "Detected" ? T.danger : T.safe }}>{v}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, marginBottom: 8 }}>Why this response?</div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.65 }}>{activeMsg.why || "Tap any message score to see explanation."}</div>
          </div>
        </>
      )}
      {activeTab === "score" && (
        <>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <svg width="90" height="90" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)", display: "block", margin: "0 auto 6px" }}>
              <circle cx="40" cy="40" r="32" fill="none" stroke={T.border} strokeWidth="7" />
              <circle cx="40" cy="40" r="32" fill="none" stroke={sc(activeMsg?.score ?? 88)} strokeWidth="7" strokeDasharray="201" strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
            </svg>
            <div style={{ fontSize: 24, fontWeight: 700, color: sc(activeMsg?.score ?? 88) }}>{activeMsg?.score ?? 88}</div>
            <div style={{ fontSize: 11, color: T.text3 }}>Ethical Score</div>
          </div>
          {[["Messages", messages.filter(m => m.role === "ai").length], ["Avg score", avg], ["Flagged", flagged], ["Category", activeMsg?.category || "General"]].map(([k, v]) => (
            <div key={String(k)} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12, color: T.text2 }}>
              <span>{k}</span>
              <span style={{ fontWeight: 500, color: k === "Flagged" && Number(v) > 0 ? T.danger : k === "Avg score" ? sc(Number(v)) : T.text1 }}>{v}</span>
            </div>
          ))}
        </>
      )}
      {activeTab === "ask" && (
        <>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, marginBottom: 10 }}>Suggested topics</div>
          {QUICK.map(q => (
            <div key={q.label} onClick={() => send(q.q)} style={{ padding: "9px 11px", background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12, color: q.label.includes("⚠") ? T.danger : T.text2, cursor: "pointer", marginBottom: 6, display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(79,142,247,0.4)"; (e.currentTarget as HTMLDivElement).style.background = T.bg3; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = T.border; (e.currentTarget as HTMLDivElement).style.background = T.bg2; }}>
              {q.label}
            </div>
          ))}
        </>
      )}
    </div>
  );

  const SidebarContent = ({ mobile = false }) => (
    <div style={{ width: mobile ? 270 : "100%", height: "100%", background: T.bg1, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px 14px 12px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg,#4f8ef7,#7c5cfc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🤖</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>EthicAI</div>
            <div style={{ fontSize: 10, color: T.text2 }}>Responsible AI</div>
          </div>
        </div>
        {mobile && <button onClick={() => setShowSidebar(false)} style={{ background: "none", border: "none", color: T.text2, fontSize: 20, cursor: "pointer", padding: 0 }}>✕</button>}
      </div>
      <button onClick={startNewChat} style={{ margin: "10px 12px", padding: "8px 10px", background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.22)", borderRadius: 8, color: T.accent, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit", transition: "all 0.2s" }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(79,142,247,0.18)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(79,142,247,0.1)"; }}>
        + New conversation
      </button>
      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {sessions.length === 0 ? (
          <div style={{ padding: "20px 10px", textAlign: "center", color: T.text3, fontSize: 12 }}>No conversations yet</div>
        ) : (
          <>
            <div style={{ fontSize: 10, color: T.text3, padding: "4px 8px 4px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Recent</div>
            {sessions.map(s => (
              <div key={s.id} onClick={() => loadSession(s.id)} className="chat-item-hover" style={{ padding: "8px 10px", borderRadius: 7, cursor: "pointer", marginBottom: 2, background: s.id === activeSessionId ? "rgba(79,142,247,0.1)" : "transparent", border: s.id === activeSessionId ? "1px solid rgba(79,142,247,0.2)" : "1px solid transparent", transition: "all 0.15s" }}>
                <div style={{ fontSize: 12, color: s.id === activeSessionId ? T.accent : T.text1, fontWeight: s.id === activeSessionId ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{s.time}</div>
              </div>
            ))}
          </>
        )}
      </div>
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#4f8ef7,#7c5cfc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 600 }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <div style={{ fontSize: 12, color: T.text1, fontWeight: 500 }}>{user?.name || "User"}</div>
            <div style={{ fontSize: 10, color: T.text2 }}>Free plan</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setDark(!d)} style={{ padding: "4px 8px", background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 6, color: T.text2, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{d ? "☀" : "🌙"}</button>
          <button onClick={() => { setScreen("landing"); setUser(null); setSessions([]); }} style={{ padding: "4px 8px", background: "rgba(240,90,90,0.08)", border: "1px solid rgba(240,90,90,0.2)", borderRadius: 6, color: T.danger, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Exit</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", height: "100dvh", background: T.bg0, color: T.text1, fontFamily: "'Inter',system-ui,sans-serif", fontSize: 14, overflow: "hidden", position: "relative" }}>

        {/* DESKTOP SIDEBAR */}
        <div className="sidebar-desk" style={{ width: 220, borderRight: `1px solid ${T.border}`, flexDirection: "column", flexShrink: 0 }}>
          <SidebarContent />
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border}`, background: T.bg1, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="hamburger" onClick={() => setShowSidebar(true)} style={{ background: "none", border: "none", color: T.text1, fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1, flexShrink: 0 }}>☰</button>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg,#4f8ef7,#7c5cfc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: T.text1 }}>EthicAI</div>
                  <div style={{ fontSize: 10, color: T.text2 }}>Responsible AI</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 500, background: flagged > 0 ? "rgba(240,90,90,0.1)" : "rgba(34,211,160,0.1)", color: flagged > 0 ? T.danger : T.safe, border: `1px solid ${flagged > 0 ? "rgba(240,90,90,0.2)" : "rgba(34,211,160,0.2)"}` }}>
                {flagged > 0 ? "⚠ Flagged" : "✓ Safe"}
              </span>
              <button className="panel-btn-mob" onClick={() => setShowPanel(true)} style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 7, color: T.accent, fontSize: 11, cursor: "pointer", padding: "5px 10px", fontFamily: "inherit" }}>Panel</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
            {messages.map((m, idx) => (
              <div key={m.id} className={idx === messages.length - 1 ? (m.role === "ai" ? "slideInLeft" : "slideInRight") : ""} style={{ display: "flex", gap: 9, flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.role === "ai" ? "linear-gradient(135deg,#4f8ef7,#7c5cfc)" : T.bg3, border: m.role === "user" ? `1px solid ${T.border2}` : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: m.role === "ai" ? "#fff" : T.text2, flexShrink: 0 }}>
                  {m.role === "ai" ? "🤖" : user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div style={{ maxWidth: "78%" }}>
                  <div style={{ padding: "10px 14px", borderRadius: m.role === "ai" ? "4px 14px 14px 14px" : "14px 4px 14px 14px", background: m.role === "ai" ? T.aiBubble : "linear-gradient(135deg,#4f8ef7,#7c5cfc)", border: m.role === "ai" ? `1px solid ${T.border}` : "none", color: m.role === "user" ? "#fff" : T.text1, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {m.text}
                  </div>
                  {m.role === "ai" && m.score && (
                    <div onClick={() => { setActiveMsg(m); setActiveTab("principles"); setShowPanel(true); }} style={{ marginTop: 6, padding: "7px 12px", background: T.bg3, borderRadius: 10, border: `1px solid ${T.border}`, display: "flex", gap: 14, cursor: "pointer", flexWrap: "wrap", alignItems: "center", transition: "all 0.2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(79,142,247,0.3)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = T.border; }}>
                      <div>
                        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: T.text3 }}>Score</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: sc(m.score) }}>{m.score}/100</div>
                        <div style={{ width: 52, height: 3, background: T.border, borderRadius: 2, marginTop: 2, overflow: "hidden" }}><div style={{ width: `${m.score}%`, height: "100%", background: sc(m.score), borderRadius: 2 }} /></div>
                      </div>
                      <div><div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: T.text3 }}>Risk</div><div style={{ fontSize: 13, fontWeight: 600, color: m.risk === "High" ? T.danger : T.safe }}>{m.risk}</div></div>
                      <div><div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: T.text3 }}>Tone</div><div style={{ fontSize: 13, fontWeight: 600, color: T.accent }}>{m.tone}</div></div>
                      <div style={{ fontSize: 10, color: T.text3, marginLeft: "auto" }}>tap for details →</div>
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: T.text3, marginTop: 4, paddingLeft: 2, textAlign: m.role === "user" ? "right" : "left" }}>{m.role === "ai" ? "EthicAI" : (user?.name || "You")} · just now</div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 9, alignItems: "flex-start", animation: "fadeIn 0.3s ease" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#4f8ef7,#7c5cfc)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>
                <div style={{ padding: "12px 16px", background: T.aiBubble, border: `1px solid ${T.border}`, borderRadius: "4px 14px 14px 14px" }}>
                  <div style={{ display: "flex", gap: 5 }}>{[0, 1, 2].map(i => <span key={i} className="dot" style={{ background: T.accent, animationDelay: `${i * 0.2}s`, opacity: 0.7 }} />)}</div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: "8px 14px 14px", borderTop: `1px solid ${T.border}`, background: T.bg1, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 14, padding: "8px 10px", transition: "border-color 0.2s", animation: "borderGlow 3s ease-in-out infinite" }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask me anything…" rows={1} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.text1, fontSize: 14, resize: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 100, minHeight: 22 }} />
              <button onClick={() => send()} style={{ width: 36, height: 36, borderRadius: 10, background: loading ? T.bg3 : "linear-gradient(135deg,#4f8ef7,#7c5cfc)", border: "none", cursor: loading ? "not-allowed" : "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", boxShadow: loading ? "none" : "0 4px 15px rgba(79,142,247,0.4)" }}>➤</button>
            </div>
            <div style={{ fontSize: 10, color: T.text3, textAlign: "center", marginTop: 6 }}>EthicAI · Powered by Groq LLaMA3 · Promotes responsible digital behavior</div>
          </div>
        </div>

        {/* DESKTOP PANEL */}
        <div className="panel-desk" style={{ width: 220, borderLeft: `1px solid ${T.border}`, flexDirection: "column", overflow: "hidden", background: T.bg1 }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
            {["principles", "score", "ask"].map(tab => (
              <div key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "10px 2px", textAlign: "center", fontSize: 11, cursor: "pointer", color: activeTab === tab ? T.accent : T.text2, borderBottom: activeTab === tab ? `2px solid ${T.accent}` : "2px solid transparent", transition: "all 0.2s", fontWeight: activeTab === tab ? 500 : 400 }}>
                {tab === "ask" ? "Quick Ask" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>
          <PanelBody />
        </div>

        {/* MOBILE SIDEBAR DRAWER */}
        {showSidebar && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
            <div onClick={() => setShowSidebar(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease" }} />
            <div style={{ position: "relative", zIndex: 101, animation: "slideInLeft 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
              <SidebarContent mobile />
            </div>
          </div>
        )}

        {/* MOBILE PANEL DRAWER */}
        {showPanel && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end" }}>
            <div onClick={() => setShowPanel(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease" }} />
            <div style={{ position: "relative", width: 290, height: "100%", background: T.bg1, display: "flex", flexDirection: "column", zIndex: 101, animation: "slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)" }}>
              <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
                {["principles", "score", "ask"].map(tab => (
                  <div key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "11px 2px", textAlign: "center", fontSize: 11, cursor: "pointer", color: activeTab === tab ? T.accent : T.text2, borderBottom: activeTab === tab ? `2px solid ${T.accent}` : "2px solid transparent" }}>
                    {tab === "ask" ? "Quick Ask" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </div>
                ))}
                <button onClick={() => setShowPanel(false)} style={{ background: "none", border: "none", color: T.text2, fontSize: 20, cursor: "pointer", padding: "0 14px", flexShrink: 0 }}>✕</button>
              </div>
              <PanelBody />
            </div>
          </div>
        )}
      </div>
    </>
  );
}