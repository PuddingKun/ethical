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
  id: number;
  role: "user" | "ai";
  text: string;
  score?: number;
  risk?: string;
  tone?: string;
  principles?: string[];
  category?: string;
  why?: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [dark, setDark] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "ai",
      text: "Hello! I'm EthicAI — your responsible AI assistant. Ask me anything! I can help with cyber ethics, digital safety, AI bias, privacy, academic integrity, or any general question.",
      score: 98,
      risk: "None",
      tone: "Helpful",
      principles: ["Non-harm", "Transparency", "Respect"],
      category: "General",
      why: "Welcome message aligned with helpful assistance principles.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("principles");
  const [activeMsg, setActiveMsg] = useState<Message>(messages[0]);
  const [flagged, setFlagged] = useState(0);
  const [scores, setScores] = useState([98]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const d = dark;
  const T = {
    bg0: d ? "#0a0c10" : "#f4f5f7",
    bg1: d ? "#111318" : "#ffffff",
    bg2: d ? "#181c24" : "#f0f2f7",
    bg3: d ? "#1f2433" : "#e8ebf4",
    border: d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    border2: d ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.13)",
    text1: d ? "#e8eaf0" : "#1a1d2e",
    text2: d ? "#8b91a8" : "#5a607a",
    text3: d ? "#555c72" : "#9ba3bf",
    accent: d ? "#4f8ef7" : "#2563eb",
    safe: d ? "#22d3a0" : "#059669",
    warn: d ? "#f0a030" : "#d97706",
    danger: d ? "#f05a5a" : "#dc2626",
    aiBubble: d ? "#181c24" : "#ffffff",
  };

  const sc = (s: number) => (s > 70 ? T.safe : s > 40 ? T.warn : T.danger);

  async function send(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setShowPanel(false);
    setShowSidebar(false);

    const userMsg: Message = { id: Date.now(), role: "user", text: msg };
    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          message: msg,
          history: messages.map((m) => ({
            role: m.role === "ai" ? "assistant" : "user",
            content: m.text,
          })),
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
      setMessages((p) => [...p, aiMsg]);
      setActiveMsg(aiMsg);
      setActiveTab("principles");
      setScores((p) => [...p, data.ethical_score]);
      if (data.category === "Harmful Request") setFlagged((p) => p + 1);
    } catch {
      setMessages((p) => [
        ...p,
        {
          id: Date.now() + 1,
          role: "ai",
          text: "⚠ Could not reach the backend. Make sure it is running on port 8000 and ngrok is active.",
        },
      ]);
    }
    setLoading(false);
  }

  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const circ = 201;
  const offset = circ - (circ * (activeMsg.score ?? 88)) / 100;

  const PanelBody = () => (
    <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
      {activeTab === "principles" && (
        <>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, marginBottom: 8 }}>Applied principles</div>
            <div>
              {(activeMsg.principles || []).map((p) => (
                <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 20, fontSize: 11, background: "rgba(79,142,247,0.1)", color: T.accent, border: "1px solid rgba(79,142,247,0.2)", margin: "0 4px 4px 0" }}>
                  ● {p}
                </span>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, marginBottom: 8 }}>Risk assessment</div>
            {[
              ["Toxicity", activeMsg.risk === "High" ? "Detected" : "None"],
              ["Harm intent", activeMsg.risk || "None"],
              ["Category", activeMsg.category || "General"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12, color: T.text2 }}>
                <span>{k}</span>
                <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: v === "High" || v === "Detected" ? "rgba(240,90,90,0.1)" : "rgba(34,211,160,0.1)", color: v === "High" || v === "Detected" ? T.danger : T.safe }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, marginBottom: 8 }}>Why this response?</div>
            <div style={{ fontSize: 12, color: T.text2, lineHeight: 1.65 }}>{activeMsg.why || "Tap any message score strip to see the explanation."}</div>
          </div>
        </>
      )}

      {activeTab === "score" && (
        <>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <svg width="90" height="90" viewBox="0 0 80 80" style={{ transform: "rotate(-90deg)", display: "block", margin: "0 auto 6px" }}>
              <circle cx="40" cy="40" r="32" fill="none" stroke={T.border} strokeWidth="7" />
              <circle cx="40" cy="40" r="32" fill="none" stroke={sc(activeMsg.score ?? 88)} strokeWidth="7" strokeDasharray="201" strokeDashoffset={offset} strokeLinecap="round" />
            </svg>
            <div style={{ fontSize: 22, fontWeight: 500, color: sc(activeMsg.score ?? 88) }}>{activeMsg.score ?? 88}</div>
            <div style={{ fontSize: 11, color: T.text3 }}>Ethical Score</div>
          </div>
          {[
            ["Messages", messages.filter((m) => m.role === "ai").length],
            ["Avg score", avg],
            ["Flagged", flagged],
            ["Category", activeMsg.category || "General"],
          ].map(([k, v]) => (
            <div key={String(k)} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 12, color: T.text2 }}>
              <span>{k}</span>
              <span style={{ fontWeight: 500, color: k === "Flagged" && Number(v) > 0 ? T.danger : k === "Avg score" ? sc(Number(v)) : T.text1 }}>{v}</span>
            </div>
          ))}
        </>
      )}

      {activeTab === "ask" && (
        <>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, marginBottom: 10 }}>Suggested topics</div>
          {QUICK.map((q) => (
            <div key={q.label} onClick={() => { send(q.q); }} style={{ padding: "9px 11px", background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12, color: q.label.includes("⚠") ? T.danger : T.text2, cursor: "pointer", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
              {q.label}
            </div>
          ))}
        </>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { overflow: hidden; }
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        .dot { width:7px; height:7px; border-radius:50%; display:inline-block; animation: bounce 1.2s infinite; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { border-radius: 2px; }
        textarea { -webkit-appearance: none; -webkit-tap-highlight-color: transparent; }
        button { -webkit-tap-highlight-color: transparent; }
        @media (min-width: 768px) {
          .sidebar-desktop { display: flex !important; }
          .panel-desktop { display: flex !important; }
          .mobile-only { display: none !important; }
          .hamburger { display: none !important; }
          .panel-btn { display: none !important; }
        }
        @media (max-width: 767px) {
          .sidebar-desktop { display: none !important; }
          .panel-desktop { display: none !important; }
        }
      `}</style>

      <div style={{ display: "flex", height: "100dvh", background: T.bg0, color: T.text1, fontFamily: "system-ui,-apple-system,sans-serif", fontSize: 14, overflow: "hidden", position: "relative" }}>

        {/* DESKTOP SIDEBAR */}
        <div className="sidebar-desktop" style={{ width: 220, background: T.bg1, borderRight: `1px solid ${T.border}`, flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "16px 14px 12px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, flexShrink: 0 }}>🤖</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>EthicAI</div>
                <div style={{ fontSize: 10, color: T.text2 }}>Responsible AI Assistant</div>
              </div>
            </div>
          </div>
          <button onClick={() => { setMessages([messages[0]]); setScores([98]); setFlagged(0); }} style={{ margin: "10px 12px", padding: "8px 10px", background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.22)", borderRadius: 8, color: T.accent, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
            + New conversation
          </button>
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            <div style={{ fontSize: 10, color: T.text3, padding: "4px 8px 4px", letterSpacing: "0.04em" }}>Today</div>
            {["Cyber ethics intro", "Privacy rights", "AI bias awareness"].map((t) => (
              <div key={t} style={{ padding: "7px 10px", borderRadius: 6, color: T.text2, fontSize: 12, cursor: "pointer" }}>{t}</div>
            ))}
          </div>
          <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>ST</div>
              <div>
                <div style={{ fontSize: 12, color: T.text1 }}>Student</div>
                <div style={{ fontSize: 10, color: T.text2 }}>Free plan</div>
              </div>
            </div>
            <button onClick={() => setDark(!d)} style={{ padding: "4px 8px", background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 6, color: T.text2, fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>
              {d ? "☀ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        {/* MAIN AREA */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

          {/* HEADER */}
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}`, background: T.bg1, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button className="hamburger" onClick={() => setShowSidebar(true)} style={{ background: "none", border: "none", color: T.text1, fontSize: 22, cursor: "pointer", padding: 0, lineHeight: 1, flexShrink: 0 }}>☰</button>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, flexShrink: 0 }}>🤖</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: T.text1, lineHeight: 1.2 }}>EthicAI</div>
                  <div style={{ fontSize: 10, color: T.text2, lineHeight: 1 }}>Responsible AI</div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <span style={{ padding: "3px 8px", borderRadius: 20, fontSize: 10, fontWeight: 500, background: flagged > 0 ? "rgba(240,90,90,0.1)" : "rgba(34,211,160,0.1)", color: flagged > 0 ? T.danger : T.safe, border: `1px solid ${flagged > 0 ? "rgba(240,90,90,0.2)" : "rgba(34,211,160,0.2)"}`, whiteSpace: "nowrap" }}>
                {flagged > 0 ? "⚠ Flagged" : "✓ Safe"}
              </span>
              <button onClick={() => setDark(!d)} className="mobile-only" style={{ background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 6, color: T.text2, fontSize: 12, cursor: "pointer", padding: "4px 7px", fontFamily: "inherit" }}>
                {d ? "☀" : "🌙"}
              </button>
              <button className="panel-btn" onClick={() => setShowPanel(true)} style={{ background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 6, color: T.accent, fontSize: 11, cursor: "pointer", padding: "4px 9px", fontFamily: "inherit" }}>
                Panel
              </button>
            </div>
          </div>

          {/* MESSAGES */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
            {messages.map((m) => (
              <div key={m.id} style={{ display: "flex", gap: 9, flexDirection: m.role === "user" ? "row-reverse" : "row", alignItems: "flex-start" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.role === "ai" ? T.accent : T.bg3, border: m.role === "user" ? `1px solid ${T.border2}` : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: m.role === "ai" ? "#fff" : T.text2, flexShrink: 0 }}>
                  {m.role === "ai" ? "🤖" : "U"}
                </div>
                <div style={{ maxWidth: "78%" }}>
                  <div style={{ padding: "10px 13px", borderRadius: m.role === "ai" ? "4px 14px 14px 14px" : "14px 4px 14px 14px", background: m.role === "ai" ? T.aiBubble : T.accent, border: m.role === "ai" ? `1px solid ${T.border}` : "none", color: m.role === "user" ? "#fff" : T.text1, fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {m.text}
                  </div>
                  {m.role === "ai" && m.score && (
                    <div onClick={() => { setActiveMsg(m); setActiveTab("principles"); setShowPanel(true); }} style={{ marginTop: 6, padding: "7px 11px", background: T.bg3, borderRadius: 9, border: `1px solid ${T.border}`, display: "flex", gap: 14, cursor: "pointer", flexWrap: "wrap", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: T.text3 }}>Score</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: sc(m.score) }}>{m.score}/100</div>
                        <div style={{ width: 52, height: 3, background: T.border, borderRadius: 2, marginTop: 2, overflow: "hidden" }}>
                          <div style={{ width: `${m.score}%`, height: "100%", background: sc(m.score), borderRadius: 2 }} />
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: T.text3 }}>Risk</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: m.risk === "High" ? T.danger : T.safe }}>{m.risk}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", color: T.text3 }}>Tone</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: T.accent }}>{m.tone}</div>
                      </div>
                      <div style={{ fontSize: 10, color: T.text3, marginLeft: "auto" }}>tap for details →</div>
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: T.text3, marginTop: 4, paddingLeft: 2, textAlign: m.role === "user" ? "right" : "left" }}>
                    {m.role === "ai" ? "EthicAI" : "You"} · just now
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", flexShrink: 0 }}>🤖</div>
                <div style={{ padding: "12px 14px", background: T.aiBubble, border: `1px solid ${T.border}`, borderRadius: "4px 14px 14px 14px" }}>
                  <div style={{ display: "flex", gap: 5 }}>
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="dot" style={{ background: T.text3, animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* INPUT */}
          <div style={{ padding: "8px 12px 14px", borderTop: `1px solid ${T.border}`, background: T.bg1, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 12, padding: "8px 10px" }}>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask me anything…" rows={1} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.text1, fontSize: 14, resize: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 100, minHeight: 22 }} />
              <button onClick={() => send()} style={{ width: 34, height: 34, borderRadius: 9, background: loading ? T.bg3 : T.accent, border: "none", cursor: loading ? "not-allowed" : "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.2s", fontFamily: "inherit" }}>
                ➤
              </button>
            </div>
            <div style={{ fontSize: 10, color: T.text3, textAlign: "center", marginTop: 6 }}>
              EthicAI · Powered by Groq LLaMA3 · Promotes responsible digital behavior
            </div>
          </div>
        </div>

        {/* DESKTOP RIGHT PANEL */}
        <div className="panel-desktop" style={{ width: 220, background: T.bg1, borderLeft: `1px solid ${T.border}`, flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
            {["principles", "score", "ask"].map((tab) => (
              <div key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "10px 2px", textAlign: "center", fontSize: 11, cursor: "pointer", color: activeTab === tab ? T.accent : T.text2, borderBottom: activeTab === tab ? `2px solid ${T.accent}` : "2px solid transparent", transition: "color 0.15s", textTransform: "capitalize" }}>
                {tab === "ask" ? "Quick Ask" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
            ))}
          </div>
          <PanelBody />
        </div>

        {/* MOBILE SIDEBAR DRAWER */}
        {showSidebar && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex" }}>
            <div onClick={() => setShowSidebar(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
            <div style={{ position: "relative", width: 270, height: "100%", background: T.bg1, display: "flex", flexDirection: "column", zIndex: 101, boxShadow: "4px 0 24px rgba(0,0,0,0.3)" }}>
              <div style={{ padding: "14px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14 }}>🤖</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.text1 }}>EthicAI</div>
                    <div style={{ fontSize: 10, color: T.text2 }}>Responsible AI Assistant</div>
                  </div>
                </div>
                <button onClick={() => setShowSidebar(false)} style={{ background: "none", border: "none", color: T.text2, fontSize: 22, cursor: "pointer", padding: 0 }}>✕</button>
              </div>
              <button onClick={() => { setMessages([messages[0]]); setScores([98]); setFlagged(0); setShowSidebar(false); }} style={{ margin: "10px 12px", padding: "8px 10px", background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.22)", borderRadius: 8, color: T.accent, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
                + New conversation
              </button>
              <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
                <div style={{ fontSize: 10, color: T.text3, padding: "4px 8px 4px" }}>Today</div>
                {["Cyber ethics intro", "Privacy rights", "AI bias awareness"].map((t) => (
                  <div key={t} style={{ padding: "8px 10px", borderRadius: 6, color: T.text2, fontSize: 13, cursor: "pointer" }}>{t}</div>
                ))}
              </div>
              <div style={{ padding: "12px", borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff" }}>ST</div>
                  <div>
                    <div style={{ fontSize: 13, color: T.text1 }}>Student</div>
                    <div style={{ fontSize: 11, color: T.text2 }}>Free plan</div>
                  </div>
                </div>
                <button onClick={() => { setDark(!d); }} style={{ padding: "5px 10px", background: T.bg2, border: `1px solid ${T.border2}`, borderRadius: 6, color: T.text2, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  {d ? "☀ Light" : "🌙 Dark"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MOBILE PANEL DRAWER */}
        {showPanel && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", justifyContent: "flex-end" }}>
            <div onClick={() => setShowPanel(false)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
            <div style={{ position: "relative", width: 290, height: "100%", background: T.bg1, display: "flex", flexDirection: "column", zIndex: 101, boxShadow: "-4px 0 24px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, alignItems: "center" }}>
                {["principles", "score", "ask"].map((tab) => (
                  <div key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: "11px 2px", textAlign: "center", fontSize: 12, cursor: "pointer", color: activeTab === tab ? T.accent : T.text2, borderBottom: activeTab === tab ? `2px solid ${T.accent}` : "2px solid transparent" }}>
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