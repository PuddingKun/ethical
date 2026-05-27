"use client";
import { useState, useRef, useEffect, useCallback } from "react";


const LOGO_SRC = "/aether-logo.jpg";

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
  id: number; role: "user" | "ai"; text: string; displayText?: string;
  score?: number; risk?: string; tone?: string;
  principles?: string[]; category?: string; why?: string;
};
type ChatSession = { id: string; title: string; messages: Message[]; time: string; };
type Screen = "landing" | "login" | "signup" | "chat";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const DEVS = ["Shreedeep Patra", "Siddhartha Singh", "Priyota khatua", "Riteca Mandal", "Kankana Kanrar", "Tamanna Dey", "Debraj Debnath", "Samvedna kumari", "Rohan Debnath"];

export default function Home() {

 const [isMobile, setIsMobile] =
useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(
      window.innerWidth <= 768
    );
  };

  checkMobile();

  window.addEventListener(
    "resize",
    checkMobile
  );

  return () =>
    window.removeEventListener(
      "resize",
      checkMobile
    );
}, []);

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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const d = dark;
  const T = {
    bg0: d ? "#0c0b12" : "#faf9ff",
    bg1: d ? "#120f1e" : "#ffffff",
    bg2: d ? "#1a1630" : "#f3f0ff",
    bg3: d ? "#231d3d" : "#e9e3ff",
    border: d ? "rgba(139,92,246,0.18)" : "rgba(139,92,246,0.15)",
    border2: d ? "rgba(167,139,250,0.3)" : "rgba(139,92,246,0.25)",
    text1: d ? "#f0eeff" : "#1e1b4b",
    text2: d ? "#9b91c4" : "#5b21b6",
    text3: d ? "#5a5180" : "#8b5cf6",
    accent: d ? "#a78bfa" : "#7c3aed",
    accent2: d ? "#f9a8d4" : "#db2777",
    safe: d ? "#34d399" : "#059669",
    warn: "#f59e0b",
    danger: "#f87171",
    aiBubble: d ? "#1a1630" : "#f8f5ff",
    grad: "linear-gradient(135deg,#8b5cf6,#ec4899)",
    gradSoft: d ? "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(236,72,153,0.1))" : "linear-gradient(135deg,rgba(139,92,246,0.08),rgba(236,72,153,0.05))",
  };

  const sc = (s: number) => s > 70 ? T.safe : s > 40 ? T.warn : T.danger;
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 98;
  const offset = 201 - (201 * (activeMsg?.score ?? 88)) / 100;

  const typeMessage = useCallback((msg: Message) => {
    const full = msg.text;
    let i = 0;
    const iv = setInterval(() => {
      i += 4;
      if (i >= full.length) {
        clearInterval(iv);
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, displayText: full } : m));
        setActiveMsg({ ...msg, displayText: full });
      } else {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, displayText: full.slice(0, i) } : m));
      }
    }, 14);
  }, []);

  function startNewChat() {
    const welcome: Message = {
      id: 0, role: "ai",
      text: `Welcome back${user ? ", " + user.name.split(" ")[0] : ""}! I'm Aether — your responsible AI guide. Ask me anything about cyber ethics, digital safety, AI bias, privacy, or any topic you're curious about.`,
      score: 98, risk: "None", tone: "Helpful",
      principles: ["Non-harm", "Transparency", "Respect"],
      category: "General", why: "Welcome message aligned with helpful assistance principles.",
    };
    welcome.displayText = welcome.text;
    const sid = Date.now().toString();
    const session: ChatSession = { id: sid, title: "New conversation", messages: [welcome], time: "Just now" };
    setSessions(p => [session, ...p]);
    setActiveSessionId(sid);
    setMessages([welcome]);
    setActiveMsg(welcome);
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

  function handleAuth(e: React.FormEvent, isLogin: boolean) {
    e.preventDefault();
    setAuthLoading(true); setAuthError("");
    setTimeout(() => {
      if (!authForm.email || !authForm.password || (!isLogin && !authForm.name)) {
        setAuthError("Please fill all fields."); setAuthLoading(false); return;
      }
      if (authForm.password.length < 4) {
        setAuthError("Password must be at least 4 characters."); setAuthLoading(false); return;
      }
      setUser({ name: isLogin ? authForm.email.split("@")[0] : authForm.name, email: authForm.email });
      setAuthLoading(false);
      setScreen("chat");
      setTimeout(startNewChat, 100);
    }, 1200);
  }

  async function send(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput(""); setShowPanel(false); setShowSidebar(false);
    const userMsg: Message = { id: Date.now(), role: "user", text: msg, displayText: msg };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({
          message: msg,
          history: messages.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }))
        }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: Date.now() + 1, role: "ai", text: data.response, displayText: "",
        score: data.ethical_score, risk: data.risk_level, tone: data.sentiment,
        principles: data.principles, category: data.category, why: data.why,
      };
      const withAi = [...newMsgs, aiMsg];
      setMessages(withAi);
      setLoading(false);
      setActiveTab("principles");
      setScores(p => [...p, data.ethical_score]);
      if (data.category === "Harmful Request") setFlagged(p => p + 1);
      typeMessage(aiMsg);
      const title = msg.length > 32 ? msg.slice(0, 32) + "…" : msg;
      if (activeSessionId) {
        setSessions(p => p.map(s => s.id === activeSessionId
          ? { ...s, messages: withAi, title: s.title === "New conversation" ? title : s.title, time: "Just now" }
          : s));
      }
    } catch {
      setLoading(false);
      setMessages(p => [...p, {
        id: Date.now() + 1, role: "ai",
        text: "⚠ Could not reach backend. Make sure it's running and ngrok is active.",
        displayText: "⚠ Could not reach backend. Make sure it's running and ngrok is active."
      }]);
    }
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    html,body{height:100%;}
    body{font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
    @keyframes scaleIn{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}
    @keyframes slideL{from{opacity:0;transform:translateX(-26px)}to{opacity:1;transform:translateX(0)}}
    @keyframes slideR{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:translateX(0)}}
    @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes glow{0%,100%{box-shadow:0 0 18px rgba(139,92,246,0.35)}50%{box-shadow:0 0 42px rgba(139,92,246,0.75),0 0 70px rgba(236,72,153,0.25)}}
    @keyframes dot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
    @keyframes cursor{0%,100%{opacity:0}50%{opacity:1}}
    @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
    .fu1{animation:fadeUp 0.7s 0.1s cubic-bezier(.16,1,.3,1) both}
    .fu2{animation:fadeUp 0.75s 0.22s cubic-bezier(.16,1,.3,1) both}
    .fu3{animation:fadeUp 0.75s 0.36s cubic-bezier(.16,1,.3,1) both}
    .scIn{animation:scaleIn 0.45s cubic-bezier(.16,1,.3,1) both}
    .slL{animation:slideL 0.38s cubic-bezier(.16,1,.3,1) both}
    .slR{animation:slideR 0.38s cubic-bezier(.16,1,.3,1) both}
    .dot{width:7px;height:7px;border-radius:50%;display:inline-block;}
    ::-webkit-scrollbar{width:3px;}
    ::-webkit-scrollbar-thumb{background:rgba(139,92,246,0.35);border-radius:4px;}
    textarea,input{-webkit-appearance:none;font-family:inherit;}
    button{cursor:pointer;font-family:inherit;}
    .btn-p{background:linear-gradient(135deg,#8b5cf6,#ec4899);border:none;color:#fff;border-radius:12px;font-weight:600;transition:all 0.22s;}
    .btn-p:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(139,92,246,0.45);}
    .btn-p:active{transform:translateY(0);}
    .btn-g{background:transparent;border:1.5px solid rgba(255,255,255,0.4);color:rgba(255,255,255,0.9);border-radius:12px;font-weight:500;transition:all 0.22s;}
    .btn-g:hover{background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.7);}
    .btn-gd{background:transparent;border:1.5px solid rgba(139,92,246,0.35);color:#8b5cf6;border-radius:12px;font-weight:500;transition:all 0.22s;}
    .btn-gd:hover{background:rgba(139,92,246,0.1);border-color:rgba(139,92,246,0.7);}
    .card{padding:26px 24px;border-radius:18px;position:relative;overflow:hidden;transition:all 0.4s cubic-bezier(.16,1,.3,1);cursor:default;}
.card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(139,92,246,0.08),rgba(236,72,153,0.04));opacity:0;transition:opacity 0.4s;}
.card:hover::before{opacity:1;}
.card:hover{transform:translateY(-10px) scale(1.02);box-shadow:0 24px 60px rgba(139,92,246,0.22),0 0 0 1px rgba(139,92,246,0.25),inset 0 1px 0 rgba(255,255,255,0.1);}
.card:hover .card-icon{animation:iconFloat 0.6s ease forwards;}
@keyframes iconFloat{0%{transform:scale(1) rotate(0deg)}50%{transform:scale(1.3) rotate(-8deg) translateY(-4px)}100%{transform:scale(1.2) rotate(0deg) translateY(-3px)}}
.card-shine{position:absolute;top:-50%;left:-60%;width:40%;height:200%;background:linear-gradient(105deg,transparent,rgba(255,255,255,0.06),transparent);transform:rotate(25deg);transition:left 0.6s ease;pointer-events:none;}
.card:hover .card-shine{left:120%;}
.stat-card{border-radius:16px;transition:all 0.35s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden;cursor:default;}
.stat-card:hover{transform:translateY(-8px) scale(1.04);box-shadow:0 20px 50px rgba(139,92,246,0.25);}
.stat-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#8b5cf6,#ec4899);transform:scaleX(0);transition:transform 0.4s ease;transform-origin:left;}
.stat-card:hover::after{transform:scaleX(1);}
@keyframes antigravity{0%,100%{transform:translateY(0px) rotate(0deg)}25%{transform:translateY(-8px) rotate(1deg)}75%{transform:translateY(-5px) rotate(-1deg)}}
@keyframes antigravity2{0%,100%{transform:translateY(0px) rotate(0deg)}25%{transform:translateY(-12px) rotate(-1.5deg)}75%{transform:translateY(-6px) rotate(1.5deg)}}
@keyframes antigravity3{0%,100%{transform:translateY(0px)}25%{transform:translateY(-6px)}75%{transform:translateY(-10px)}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0)}50%{box-shadow:0 0 30px 4px rgba(139,92,246,0.2)}}
@keyframes shimmerText{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes orbFloat1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(20px,-15px) scale(1.05)}66%{transform:translate(-10px,10px) scale(0.97)}}
@keyframes orbFloat2{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(-18px,12px) scale(1.03)}66%{transform:translate(14px,-8px) scale(0.98)}}
@keyframes counterUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.ci:hover{background:rgba(139,92,246,0.08)!important;}
    @media(min-width:768px){.hb{display:none!important}.pb{display:none!important}.sd{display:flex!important}.pd{display:flex!important}}
    @media(max-width:767px){.sd{display:none!important}.pd{display:none!important}}
  `;

  if (!mounted) return null;

  // ───────────── LANDING ─────────────
  if (screen === "landing") return (
    <>
      <style>{css}</style>
      <div style={{ height: "100dvh", overflowY: "auto", overflowX: "hidden", background: "#000", fontFamily: "'Inter',system-ui,sans-serif" }}>

        {/* FIXED NAVBAR — translucent over video */}
        <nav style={{
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 100,

  padding: isMobile
    ? "10px 14px"
    : "14px 32px",

  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",

  gap: isMobile ? 8 : 16,

  background:"rgba(255,255,255,0.15)",
  backdropFilter:"blur(20px)",
  WebkitBackdropFilter:"blur(20px)",
}}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={LOGO_SRC} alt="Aether" style={{ width: 34, height: 34, borderRadius: 9, objectFit: "cover", animation: "glow 3s ease-in-out infinite" }} />
            <span style={{ fontSize: 18, fontWeight: 800, background: "linear-gradient(135deg,#a78bfa,#f9a8d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Aether</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button className="btn-g" style={{ padding: "8px 20px", fontSize: 13 }} onClick={() => setScreen("login")}>Sign in</button>
            <button className="btn-p" style={{ padding: "8px 20px", fontSize: 13 }} onClick={() => setScreen("signup")}>Get started</button>
          </div>
        </nav>

        {/* SECTION 1 — Full screen video, nothing in the middle */}
        <section style={{ position: "relative", width: "100%", height: "100dvh", overflow: "hidden" }}>


<video
    key={isMobile ? "mobile" : "desktop"}
  autoPlay
  muted
  loop
  playsInline
  preload="auto"
  style={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",

    objectFit: "cover",

    objectPosition:
      isMobile
        ? "center center"
        : "center center",

    zIndex: 0
  }}
>
  <source
    src={
      isMobile
        ? "/aether-intro-mobile.mp4"
        : "/aether-intro.mp4"
    }
    type="video/mp4"
  />
</video>
          {/* Very subtle bottom fade so next section blends in */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "22%", background: "linear-gradient(to bottom, transparent, rgba(12,11,18,0.95))", zIndex: 1, pointerEvents: "none" }} />

          {/* Only bottom label — minimal, non-intrusive */}
          <div style={{ position: "absolute", bottom: 36, left: 0, right: 0, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500 }}>Scroll to explore</span>
            <span style={{ fontSize: 20, color: "rgba(255,255,255,0.4)", animation: "bounce 2s ease-in-out infinite" }}>↓</span>
          </div>
        </section>

        {/* SECTION 2 — Hero text after video */}
        <section style={{ background: d ? "#0c0b12" : "#faf9ff", padding: "80px 24px 70px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <div className="fu1" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 20, background: d ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.08)", border: `1px solid ${d ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.2)"}`, fontSize: 12, color: d ? "#a78bfa" : "#7c3aed", marginBottom: 28, fontWeight: 500 }}>
              ✦ Ethical AI · Powered by LLaMA3
            </div>
            <h1 className="fu2" style={{ fontSize: "clamp(38px,6.5vw,74px)", fontWeight: 800, lineHeight: 1.08, marginBottom: 22, letterSpacing: "-0.03em", color: d ? "#f0eeff" : "#1e1b4b" }}>
              <span style={{ background: "linear-gradient(135deg,#8b5cf6,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Think ethically.</span><br />
              <span>Act responsibly.</span>
            </h1>
            <p className="fu2" style={{ fontSize: "clamp(15px,2vw,19px)", color: d ? "#9b91c4" : "#5b21b6", maxWidth: 540, margin: "0 auto 40px", lineHeight: 1.7 }}>
              Aether analyzes every conversation for ethical content, scores it in real time, and guides responsible digital behavior — completely free.
            </p>
            <div className="fu3" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-p" style={{ padding: "14px 42px", fontSize: 15 }} onClick={() => setScreen("signup")}>Start for free </button>
              <button className="btn-gd" style={{ padding: "14px 42px", fontSize: 15 }} onClick={() => setScreen("login")}>Log in</button>
            </div>
          </div>
        </section>

        {/* SECTION 3 — Features */}
        <section style={{ background: d ? "#0c0b12" : "#faf9ff", padding: "0 24px 80px" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <h2 style={{ fontSize: "clamp(26px,4vw,40px)", fontWeight: 800, color: d ? "#f0eeff" : "#1e1b4b", marginBottom: 12, letterSpacing: "-0.02em" }}>Everything you need for ethical AI</h2>
              <p style={{ fontSize: 15, color: d ? "#9b91c4" : "#5b21b6" }}>Built with industry-standard tools. Designed for responsible use.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
              {[
                { icon: "🧠", title: "Smart Ethical Engine", desc: "Every response analyzed for harm, sentiment, and ethical alignment using LLaMA3 70B.", c: "#a78bfa" },
                { icon: "📊", title: "Live Ethical Scoring", desc: "Real-time score 0–100 with risk level, tone detection, and principle mapping.", c: "#f9a8d4" },
                { icon: "🛡", title: "Harmful Request Refusal", desc: "Hacking, harassment, and illegal requests refused with clear ethical explanations.", c: "#34d399" },
                { icon: "💡", title: "Transparent Reasoning", desc: "See exactly why each response was generated and which principles applied.", c: "#fbbf24" },
                { icon: "📱", title: "Fully Responsive", desc: "Seamless experience across desktop and mobile with smooth animated drawers.", c: "#a78bfa" },
                { icon: "🔒", title: "Secure & Private", desc: "Your conversations stay in your session. No data stored without your consent.", c: "#f9a8d4" },
              ].map((f, i) => (
                <div key={i} className="card" style={{ background: d ? "rgba(18,15,30,0.75)" : "#ffffff", border: `1px solid ${d ? "rgba(139,92,246,0.14)" : "rgba(139,92,246,0.12)"}` }}>
                  <div style={{ fontSize: 30, marginBottom: 14 }}>{f.icon}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: d ? "#f0eeff" : "#1e1b4b", marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 13, color: d ? "#9b91c4" : "#5b21b6", lineHeight: 1.7 }}>{f.desc}</p>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${f.c},transparent)`, borderRadius: "0 0 18px 18px" }} />
                </div>
              ))}
            </div>

            {/* STATS */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 16, marginTop: 52 }}>
              {[["LLaMA3 70B", "AI Model"], ["100%", "Free to use"], ["< 2s", "Response time"], ["Real-time", "Ethics scoring"]].map(([val, lbl], i) => (
                <div key={i} style={{ textAlign: "center", padding: "26px 16px", background: d ? "rgba(18,15,30,0.75)" : "#ffffff", borderRadius: 16, border: `1px solid ${d ? "rgba(139,92,246,0.14)" : "rgba(139,92,246,0.12)"}` }}>
                  <div style={{ fontSize: 22, fontWeight: 800, background: "linear-gradient(135deg,#8b5cf6,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{val}</div>
                  <div style={{ fontSize: 12, color: d ? "#5a5180" : "#8b5cf6", marginTop: 5 }}>{lbl}</div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ textAlign: "center", marginTop: 72, padding: "56px 32px", background: d ? "rgba(18,15,30,0.8)" : "#ffffff", borderRadius: 24, border: `1px solid ${d ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.15)"}`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 200, background: "radial-gradient(ellipse,rgba(139,92,246,0.08) 0%,transparent 70%)", pointerEvents: "none" }} />
              <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, color: d ? "#f0eeff" : "#1e1b4b", marginBottom: 12 }}>Ready to chat responsibly?</h2>
              <p style={{ color: d ? "#9b91c4" : "#5b21b6", marginBottom: 28, fontSize: 15 }}>Join students exploring ethical AI — completely free.</p>
              <button className="btn-p" style={{ padding: "14px 44px", fontSize: 15 }} onClick={() => setScreen("signup")}>Create free account </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: `1px solid ${d ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.12)"}`, padding: "48px 32px 36px", background: d ? "rgba(8,6,16,0.98)" : "#f3f0ff" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
              <img src={LOGO_SRC} alt="Aether" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
              <span style={{ fontSize: 16, fontWeight: 800, background: "linear-gradient(135deg,#8b5cf6,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Aether</span>
            </div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: d ? "#5a5180" : "#8b5cf6", marginBottom: 16, fontWeight: 600 }}>Developed by</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {DEVS.map((dev, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: d ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.07)", border: `1px solid ${d ? "rgba(139,92,246,0.18)" : "rgba(139,92,246,0.14)"}`, borderRadius: 30 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#8b5cf6,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff", fontWeight: 700 }}>{i + 1}</div>
                    <span style={{ fontSize: 13, color: d ? "#f0eeff" : "#1e1b4b", fontWeight: 500 }}>{dev}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 20, borderTop: `1px solid ${d ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.1)"}`, flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: 12, color: d ? "#5a5180" : "#8b5cf6" }}>© 2025 Aether. Ethical AI for everyone.</span>
              <span style={{ fontSize: 12, color: d ? "#5a5180" : "#8b5cf6" }}>Powered by LLaMA3 · Built with Next.js</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );

  // ───────────── AUTH ─────────────
  if (screen === "login" || screen === "signup") {
    const isLogin = screen === "login";
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight: "100dvh", background: d ? "#0c0b12" : "#faf9ff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "'Inter',system-ui,sans-serif", position: "relative", overflow: "hidden" }}>
          {/* Background glow */}
          <div style={{ position: "fixed", top: "20%", left: "15%", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "fixed", bottom: "20%", right: "10%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(236,72,153,0.06) 0%,transparent 70%)", pointerEvents: "none" }} />

          <div className="scIn" style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
            <button onClick={() => setScreen("landing")} style={{ background: "none", border: "none", color: d ? "#5a5180" : "#8b5cf6", fontSize: 13, cursor: "pointer", marginBottom: 22, display: "flex", alignItems: "center", gap: 6, padding: 0 }}>← Back to home</button>
            <div style={{ background: d ? "rgba(18,15,30,0.97)" : "#ffffff", border: `1.5px solid ${d ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.2)"}`, borderRadius: 22, padding: "38px 32px", backdropFilter: "blur(24px)", boxShadow: d ? "0 28px 70px rgba(0,0,0,0.4)" : "0 20px 60px rgba(139,92,246,0.1)" }}>
              <div style={{ textAlign: "center", marginBottom: 30 }}>
                <img src={LOGO_SRC} alt="Aether" style={{ width: 54, height: 54, borderRadius: 14, objectFit: "cover", margin: "0 auto 14px", display: "block", animation: "glow 3s ease-in-out infinite" }} />
                <h1 style={{ fontSize: 22, fontWeight: 800, color: d ? "#f0eeff" : "#1e1b4b", marginBottom: 6 }}>{isLogin ? "Welcome back" : "Create account"}</h1>
                <p style={{ fontSize: 13, color: d ? "#9b91c4" : "#5b21b6" }}>{isLogin ? "Sign in to continue to Aether" : "Start your ethical AI journey"}</p>
              </div>
              <form onSubmit={e => handleAuth(e, isLogin)}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {!isLogin && (
                    <div>
                      <label style={{ fontSize: 12, color: d ? "#9b91c4" : "#5b21b6", fontWeight: 500, marginBottom: 6, display: "block" }}>Full name</label>
                      <input className="inp" type="text" placeholder="Your name" value={authForm.name} onChange={e => setAuthForm(p => ({ ...p, name: e.target.value }))} style={{ background: d ? "#1a1630" : "#f3f0ff", color: d ? "#f0eeff" : "#1e1b4b", borderColor: d ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.2)" }} />
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: 12, color: d ? "#9b91c4" : "#5b21b6", fontWeight: 500, marginBottom: 6, display: "block" }}>Email address</label>
                    <input className="inp" type="email" placeholder="you@example.com" value={authForm.email} onChange={e => setAuthForm(p => ({ ...p, email: e.target.value }))} style={{ background: d ? "#1a1630" : "#f3f0ff", color: d ? "#f0eeff" : "#1e1b4b", borderColor: d ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.2)" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: d ? "#9b91c4" : "#5b21b6", fontWeight: 500, marginBottom: 6, display: "block" }}>Password</label>
                    <input className="inp" type="password" placeholder="••••••••" value={authForm.password} onChange={e => setAuthForm(p => ({ ...p, password: e.target.value }))} style={{ background: d ? "#1a1630" : "#f3f0ff", color: d ? "#f0eeff" : "#1e1b4b", borderColor: d ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.2)" }} />
                  </div>
                  {authError && <div style={{ padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 9, fontSize: 12, color: "#f87171" }}>{authError}</div>}
                  <button type="submit" className="btn-p" style={{ width: "100%", padding: "13px", fontSize: 14, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {authLoading
                      ? <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                      : isLogin ? "Log in " : "Create account →"}
                  </button>
                </div>
              </form>
              <div style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: d ? "#5a5180" : "#8b5cf6" }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => { setScreen(isLogin ? "signup" : "login"); setAuthError(""); setAuthForm({ name: "", email: "", password: "" }); }} style={{ background: "none", border: "none", color: d ? "#a78bfa" : "#7c3aed", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                  {isLogin ? "Sign up free" : "Sign in"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ───────────── CHAT ─────────────
  const PanelBody = () => (
    <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
      {activeTab === "principles" && activeMsg && <>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, marginBottom: 8, fontWeight: 600 }}>Applied principles</div>
          <div>{(activeMsg.principles || []).map(p => <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 20, fontSize: 11, background: d ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.07)", color: T.accent, border: `1px solid ${T.border2}`, margin: "0 4px 4px 0", fontWeight: 500 }}>● {p}</span>)}</div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, marginBottom: 8, fontWeight: 600 }}>Risk assessment</div>
          {[["Toxicity", activeMsg.risk === "High" ? "Detected" : "None"], ["Harm intent", activeMsg.risk || "None"], ["Category", activeMsg.category || "General"]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12, color: T.text2 }}>
              <span>{k}</span>
              <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 10, fontWeight: 600, background: v === "High" || v === "Detected" ? "rgba(248,113,113,0.1)" : "rgba(52,211,153,0.1)", color: v === "High" || v === "Detected" ? T.danger : T.safe }}>{v}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, marginBottom: 8, fontWeight: 600 }}>Why this response?</div>
          <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.7 }}>{activeMsg.why || "Tap any message score to see explanation."}</div>
        </div>
      </>}

      {activeTab === "score" && <>
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <svg width="90" height="90" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)", display: "block", margin: "0 auto 8px" }}>
            <circle cx="40" cy="40" r="32" fill="none" stroke={T.border} strokeWidth="7" />
            <circle cx="40" cy="40" r="32" fill="none" stroke={sc(activeMsg?.score ?? 88)} strokeWidth="7" strokeDasharray="201" strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(.16,1,.3,1)" }} />
          </svg>
          <div style={{ fontSize: 26, fontWeight: 800, color: sc(activeMsg?.score ?? 88) }}>{activeMsg?.score ?? 88}</div>
          <div style={{ fontSize: 11, color: T.text3 }}>Ethical Score</div>
        </div>
        {[["Messages", messages.filter(m => m.role === "ai").length], ["Avg score", avg], ["Flagged", flagged], ["Category", activeMsg?.category || "General"]].map(([k, v]) => (
          <div key={String(k)} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12, color: T.text2 }}>
            <span>{k}</span>
            <span style={{ fontWeight: 600, color: k === "Flagged" && Number(v) > 0 ? T.danger : k === "Avg score" ? sc(Number(v)) : T.text1 }}>{v}</span>
          </div>
        ))}
      </>}

      {activeTab === "ask" && <>
        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, marginBottom: 10, fontWeight: 600 }}>Suggested topics</div>
        {QUICK.map(q => (
          <div key={q.label} onClick={() => send(q.q)} style={{ padding: "9px 12px", background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 9, fontSize: 12, color: q.label.includes("⚠") ? T.danger : T.text2, cursor: "pointer", marginBottom: 6, display: "flex", alignItems: "center", gap: 8, transition: "all 0.18s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = T.border2; (e.currentTarget as HTMLDivElement).style.background = T.bg3; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = T.border; (e.currentTarget as HTMLDivElement).style.background = T.bg2; }}>
            {q.label}
          </div>
        ))}
      </>}
    </div>
  );

  const Sidebar = ({ mobile = false }) => (
    <div style={{ width: mobile ? 272 : "100%", height: "100%", background: T.bg1, display: "flex", flexDirection: "column", borderRight: mobile ? "none" : `1px solid ${T.border}` }}>
      <div style={{ padding: "16px 14px 12px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <img src={LOGO_SRC} alt="Aether" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Aether</div>
            <div style={{ fontSize: 10, color: T.text3 }}>Ethical AI</div>
          </div>
        </div>
        {mobile && <button onClick={() => setShowSidebar(false)} style={{ background: "none", border: "none", color: T.text2, fontSize: 22, cursor: "pointer", padding: 0 }}>✕</button>}
      </div>
      <button onClick={startNewChat} style={{ margin: "10px 12px", padding: "9px 12px", background: d ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.07)", border: `1px solid ${T.border2}`, borderRadius: 10, color: T.accent, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontWeight: 600, transition: "all 0.2s" }}
        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = d ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.14)"}
        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = d ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.07)"}>
        + New conversation
      </button>
      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {sessions.length === 0
          ? <div style={{ padding: "28px 12px", textAlign: "center", color: T.text3, fontSize: 12 }}>No conversations yet</div>
          : <>
            <div style={{ fontSize: 9, color: T.text3, padding: "4px 8px 6px", letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 600 }}>Recent</div>
            {sessions.map(s => (
              <div key={s.id} onClick={() => loadSession(s.id)} className="ci" style={{ padding: "8px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2, background: s.id === activeSessionId ? (d ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.08)") : "transparent", border: s.id === activeSessionId ? `1px solid ${T.border2}` : "1px solid transparent", transition: "all 0.15s" }}>
                <div style={{ fontSize: 12, color: s.id === activeSessionId ? T.accent : T.text1, fontWeight: s.id === activeSessionId ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 2 }}>{s.time}</div>
              </div>
            ))}
          </>}
      </div>
      <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0 }}>
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: T.text1, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name || "User"}</div>
            <div style={{ fontSize: 10, color: T.text3 }}>Free plan</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button onClick={() => setDark(!d)} style={{ padding: "4px 8px", background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 6, color: T.text2, fontSize: 11, cursor: "pointer" }}>{d ? "☀" : "🌙"}</button>
          <button onClick={() => { setScreen("landing"); setUser(null); setSessions([]); }} style={{ padding: "4px 8px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 6, color: T.danger, fontSize: 11, cursor: "pointer" }}>Exit</button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", height: "100dvh", background: T.bg0, color: T.text1, fontFamily: "'Inter',system-ui,sans-serif", fontSize: 14, overflow: "hidden" }}>

        {/* DESKTOP SIDEBAR */}
        <div className="sd" style={{ width: 224, flexDirection: "column", flexShrink: 0 }}><Sidebar /></div>

        {/* MAIN CHAT */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

          {/* HEADER */}
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border}`, background: T.bg1, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="hb" onClick={() => setShowSidebar(true)} style={{ background: "none", border: "none", color: T.text1, fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1, flexShrink: 0 }}>☰</button>
              <img src={LOGO_SRC} alt="Aether" style={{ width: 28, height: 28, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, background: T.grad, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Aether</div>
                <div style={{ fontSize: 10, color: T.text3 }}>Ethical AI</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: flagged > 0 ? "rgba(248,113,113,0.1)" : "rgba(52,211,153,0.1)", color: flagged > 0 ? T.danger : T.safe, border: `1px solid ${flagged > 0 ? "rgba(248,113,113,0.2)" : "rgba(52,211,153,0.2)"}` }}>
                {flagged > 0 ? "⚠ Flagged" : "✓ Safe"}
              </span>
              <button className="pb" onClick={() => setShowPanel(true)} style={{ background: d ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.07)", border: `1px solid ${T.border2}`, borderRadius: 7, color: T.accent, fontSize: 11, cursor: "pointer", padding: "5px 11px", fontWeight: 600 }}>Panel</button>
            </div>
          </div>

          {/* MESSAGES */}
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
            {messages.map((m, idx) => (
              <div key={m.id} className={idx === messages.length - 1 ? (m.role === "ai" ? "slL" : "slR") : ""} style={{ display: "flex", gap: 10, flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, overflow: "hidden", border: m.role === "user" ? `1px solid ${T.border2}` : "none" }}>
                  {m.role === "ai"
                    ? <img src={LOGO_SRC} alt="Aether" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ width: "100%", height: "100%", background: T.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{user?.name?.charAt(0)?.toUpperCase() || "U"}</div>}
                </div>
                <div style={{ maxWidth: "76%" }}>
                  <div style={{ padding: "11px 14px", borderRadius: m.role === "ai" ? "4px 16px 16px 16px" : "16px 4px 16px 16px", background: m.role === "ai" ? T.aiBubble : T.grad, border: m.role === "ai" ? `1px solid ${T.border}` : "none", color: m.role === "user" ? "#fff" : T.text1, fontSize: 13, lineHeight: 1.72, whiteSpace: "pre-wrap", wordBreak: "break-word", boxShadow: m.role === "user" ? "0 4px 18px rgba(139,92,246,0.3)" : "none" }}>
                    {m.displayText ?? m.text}
                    {m.role === "ai" && m.displayText !== undefined && m.displayText.length < m.text.length && (
                      <span style={{ display: "inline-block", width: 2, height: 14, background: T.accent, marginLeft: 2, animation: "cursor 0.6s ease-in-out infinite", verticalAlign: "middle", borderRadius: 1 }} />
                    )}
                  </div>
                  {m.role === "ai" && m.score && m.displayText === m.text && (
                    <div onClick={() => { setActiveMsg(m); setActiveTab("principles"); setShowPanel(true); }}
                      style={{ marginTop: 7, padding: "8px 13px", background: T.bg3, borderRadius: 11, border: `1px solid ${T.border}`, display: "flex", gap: 14, cursor: "pointer", flexWrap: "wrap", alignItems: "center", transition: "all 0.2s" }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = T.border2}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = T.border}>
                      <div>
                        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: T.text3 }}>Score</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: sc(m.score) }}>{m.score}/100</div>
                        <div style={{ width: 54, height: 3, background: T.border, borderRadius: 2, marginTop: 3, overflow: "hidden" }}>
                          <div style={{ width: `${m.score}%`, height: "100%", background: sc(m.score), borderRadius: 2, transition: "width 0.9s ease" }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: T.text3 }}>Risk</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: m.risk === "High" ? T.danger : T.safe }}>{m.risk}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: T.text3 }}>Tone</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>{m.tone}</div>
                      </div>
                      <div style={{ fontSize: 10, color: T.text3, marginLeft: "auto" }}>tap for details →</div>
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: T.text3, marginTop: 5, paddingLeft: 2, textAlign: m.role === "user" ? "right" : "left" }}>
                    {m.role === "ai" ? "Aether" : (user?.name || "You")} · just now
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start", animation: "fadeIn 0.3s ease" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
                  <img src={LOGO_SRC} alt="Aether" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ padding: "13px 16px", background: T.aiBubble, border: `1px solid ${T.border}`, borderRadius: "4px 16px 16px 16px" }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    {[0, 1, 2].map(i => <span key={i} className="dot" style={{ background: T.accent, animation: `dot 1.2s ${i * 0.2}s ease-in-out infinite` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div style={{ padding: "10px 16px 16px", borderTop: `1px solid ${T.border}`, background: T.bg1, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 9, alignItems: "flex-end", background: T.bg2, border: `1.5px solid ${T.border2}`, borderRadius: 15, padding: "9px 11px" }}>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask Aether anything…" rows={1}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.text1, fontSize: 14, resize: "none", fontFamily: "inherit", lineHeight: 1.55, maxHeight: 100, minHeight: 22 }} />
              <button onClick={() => send()} style={{ width: 38, height: 38, borderRadius: 11, background: loading ? T.bg3 : T.grad, border: "none", cursor: loading ? "not-allowed" : "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.22s", boxShadow: loading ? "none" : "0 4px 18px rgba(139,92,246,0.4)" }}>➤</button>
            </div>
            <div style={{ fontSize: 10, color: T.text3, textAlign: "center", marginTop: 7 }}>Aether · Powered by Groq LLaMA3 · Promoting responsible AI</div>
          </div>
        </div>

        {/* DESKTOP RIGHT PANEL */}
        <div className="pd" style={{ width: 222, borderLeft: `1px solid ${T.border}`, flexDirection: "column", overflow: "hidden", background: T.bg1 }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
            {["principles", "score", "ask"].map(tab => (
              <div key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "10px 2px", textAlign: "center", fontSize: 11, cursor: "pointer", color: activeTab === tab ? T.accent : T.text2, borderBottom: activeTab === tab ? `2px solid ${T.accent}` : "2px solid transparent", transition: "all 0.2s", fontWeight: activeTab === tab ? 700 : 400 }}>
                {tab === "ask" ? "Quick Ask" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>
          <PanelBody />
        </div>

        {/* MOBILE SIDEBAR DRAWER */}
        {showSidebar && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
            <div onClick={() => setShowSidebar(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(5px)", animation: "fadeIn 0.22s ease" }} />
            <div style={{ position: "relative", zIndex: 201, animation: "slideL 0.32s cubic-bezier(.16,1,.3,1)", boxShadow: "4px 0 30px rgba(0,0,0,0.3)" }}>
              <Sidebar mobile />
            </div>
          </div>
        )}

        {/* MOBILE PANEL DRAWER */}
        {showPanel && (
          <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", justifyContent: "flex-end" }}>
            <div onClick={() => setShowPanel(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(5px)", animation: "fadeIn 0.22s ease" }} />
            <div style={{ position: "relative", width: 292, height: "100%", background: T.bg1, display: "flex", flexDirection: "column", zIndex: 201, animation: "slideR 0.32s cubic-bezier(.16,1,.3,1)", boxShadow: "-4px 0 30px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
                {["principles", "score", "ask"].map(tab => (
                  <div key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "11px 2px", textAlign: "center", fontSize: 11, cursor: "pointer", color: activeTab === tab ? T.accent : T.text2, borderBottom: activeTab === tab ? `2px solid ${T.accent}` : "2px solid transparent", fontWeight: activeTab === tab ? 700 : 400 }}>
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
