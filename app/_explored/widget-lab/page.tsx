"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Mic, ArrowUp, X, ChevronLeft, Sparkles, Calendar, Headphones } from "lucide-react";

/* Widget Lab — prototyping a better on-site widget experience:
   proactive teaser → branded welcome card → live conversation.
   Standalone; kept out of /design. */

const ACCENT = "#632E9A";
const SOFT = "#F0E7FA";
const BORDER = "#C5A8E0";
const INK = "#4A1F77";
const PAPER = "#F9F3EA";
const LINE = "#E0DAD3";
const CANVAS = "#FFFDFA";
const SECONDARY = "#6E6E6E";
const MUTED = "#979797";

const PROMPTS = ["Check pricing and plans", "Get a product demo", "What is an AI agent?"];
const TEASER = "Hi 👋 Want help choosing a plan?";

type Msg = { from: "ai" | "user"; text: string };

function cannedReply(text: string): string {
  const t = text.toLowerCase();
  if (/(pric|plan|cost|tier)/.test(t))
    return "We have Studio and Enterprise plans — Studio for small teams, Enterprise adds SSO, analytics and priority support. Want a quick comparison?";
  if (/(demo|trial|book|call)/.test(t)) return "Love that — I can set up a live demo. What day works best for you?";
  if (/(human|agent|person|support)/.test(t)) return "Sure — connecting you with a teammate now. One moment! 👋";
  if (/(agent|ai|bot|work)/.test(t))
    return "An AI agent understands a goal and takes action to reach it — answering, qualifying leads and booking meetings, trained on your content.";
  return "Great question! Let me help with that. Could you share a little more about what you're looking for?";
}

function Words({ text }: { text: string }) {
  let idx = 0;
  return (
    <>
      {text.split(/(\s+)/).map((tok, i) =>
        tok === "" || /^\s+$/.test(tok) ? (
          tok
        ) : (
          <span key={i} className="inline-block" style={{ animation: `word-in 320ms cubic-bezier(0.2,0.6,0.2,1) ${idx++ * 34}ms both` }}>
            {tok}
          </span>
        ),
      )}
    </>
  );
}

export default function WidgetLab() {
  const [phase, setPhase] = useState<"closed" | "welcome" | "chat">("closed");
  const [teaser, setTeaser] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // proactive teaser — pops out of the launcher after a beat
  useEffect(() => {
    if (phase !== "closed") return;
    const id = setTimeout(() => setTeaser(true), 2400);
    return () => clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, thinking, phase]);

  const open = () => {
    setTeaser(false);
    setPhase(msgs.length ? "chat" : "welcome");
  };

  const send = (text: string) => {
    const msg = text.trim();
    if (!msg || thinking) return;
    setDraft("");
    setPhase("chat");
    setMsgs((m) => [...m, { from: "user", text: msg }]);
    setThinking(true);
    const reply = cannedReply(msg);
    const delay = Math.min(2600, Math.max(1400, reply.split(/\s+/).length * 70));
    setTimeout(() => {
      setThinking(false);
      setMsgs((m) => [...m, { from: "ai", text: reply }]);
    }, delay);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      <style>{`
        @keyframes wl-pop { from { opacity:0; transform: translateY(8px) scale(0.9); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes wl-open { from { opacity:0; transform: translateY(20px) scale(0.96); } to { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes wl-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(99,46,154,0.35); } 50% { box-shadow: 0 0 0 10px rgba(99,46,154,0); } }
      `}</style>

      {/* sample website backdrop */}
      <img src="/v4-landing-bg.png" alt="" aria-hidden className="absolute inset-0 z-0 h-full w-full object-cover object-top" />

      {/* docked widget — bottom-right */}
      <div className="absolute bottom-6 right-6 z-30 flex flex-col items-end">
        {phase === "closed" ? (
          <>
            {/* proactive teaser bubble */}
            {teaser && (
              <div
                className="mb-3 flex max-w-[280px] items-start gap-2.5 rounded-2xl border bg-white px-3.5 py-3 shadow-[0_8px_30px_-8px_rgba(40,30,90,0.3)]"
                style={{ borderColor: LINE, animation: "wl-pop 300ms cubic-bezier(0.2,0.6,0.2,1) both" }}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full" style={{ background: SOFT }}>
                  <Bot className="size-4" style={{ color: INK }} strokeWidth={2} />
                </span>
                <button onClick={open} className="text-left text-[14px] leading-snug text-[#333]">
                  {TEASER}
                </button>
                <button onClick={() => setTeaser(false)} aria-label="Dismiss" className="-mr-1 -mt-1 grid size-5 shrink-0 place-items-center rounded-full text-[#9A9A9A] hover:text-[#555]">
                  <X className="size-3.5" strokeWidth={2.5} />
                </button>
              </div>
            )}

            {/* launcher pill */}
            <button
              onClick={open}
              className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 text-left shadow-[0_8px_30px_-8px_rgba(40,30,90,0.3)]"
              style={{ width: 280, animation: teaser ? "wl-pulse 2s ease-in-out infinite" : undefined }}
            >
              <span className="flex-1 text-[14px]" style={{ color: MUTED }}>Ask me anything…</span>
              <span className="grid size-8 place-items-center rounded-full text-white" style={{ background: ACCENT }}>
                <Mic className="size-4" strokeWidth={2} />
              </span>
            </button>
          </>
        ) : (
          /* ── open panel ── */
          <div
            className="flex w-[384px] flex-col overflow-hidden rounded-[24px] shadow-[0_24px_70px_-16px_rgba(40,30,90,0.45)]"
            style={{ height: 600, background: CANVAS, animation: "wl-open 320ms cubic-bezier(0.2,0.6,0.2,1) both" }}
          >
            {/* header */}
            <div className="flex items-center gap-2.5 border-b px-4 py-3" style={{ borderColor: LINE }}>
              {phase === "chat" && (
                <button onClick={() => setPhase("welcome")} aria-label="Back" className="-ml-1 grid size-8 place-items-center rounded-full hover:bg-[#F0EBE0]" style={{ color: SECONDARY }}>
                  <ChevronLeft className="size-5" strokeWidth={2} />
                </button>
              )}
              <span className="grid size-9 shrink-0 place-items-center rounded-full" style={{ background: SOFT }}>
                <Bot className="size-[18px]" style={{ color: INK }} strokeWidth={2} />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[15px] font-semibold" style={{ color: "#333" }}>Tars</span>
                <span className="text-[12px]" style={{ color: SECONDARY }}>Virtual Assistant</span>
              </div>
              <button onClick={() => setPhase("closed")} aria-label="Close" className="ml-auto grid size-8 place-items-center rounded-full hover:bg-[#F0EBE0]" style={{ color: SECONDARY }}>
                <X className="size-[18px]" strokeWidth={2} />
              </button>
            </div>

            {/* body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5">
              {phase === "welcome" ? (
                <div style={{ animation: "wl-open 320ms ease-out both" }}>
                  <h2 className="text-[24px] font-semibold leading-tight tracking-tight" style={{ color: "#333" }}>
                    Hi there 👋
                  </h2>
                  <p className="mt-1 text-[15px]" style={{ color: SECONDARY }}>How can we help you today?</p>

                  {/* suggested prompt cards */}
                  <div className="mt-5 flex flex-col gap-2">
                    {PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        className="flex items-center justify-between rounded-2xl border bg-white px-4 py-3 text-left text-[14px] transition-colors hover:brightness-[0.99]"
                        style={{ borderColor: LINE, color: "#333" }}
                      >
                        <span className="flex items-center gap-2.5">
                          <Sparkles className="size-4 shrink-0" strokeWidth={2} style={{ color: ACCENT }} />
                          {p}
                        </span>
                        <ArrowUp className="size-4 rotate-45" style={{ color: MUTED }} />
                      </button>
                    ))}
                  </div>

                  {/* quick actions */}
                  <p className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Quick actions</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => send("Get a product demo")} className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium" style={{ borderColor: BORDER, background: SOFT, color: INK }}>
                      <Calendar className="size-3.5" strokeWidth={2} /> Book a demo
                    </button>
                    <button onClick={() => send("Talk to a human")} className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium" style={{ borderColor: BORDER, background: SOFT, color: INK }}>
                      <Headphones className="size-3.5" strokeWidth={2} /> Talk to a human
                    </button>
                  </div>
                </div>
              ) : (
                /* chat messages */
                <div className="flex flex-col gap-4">
                  {msgs.map((m, i) =>
                    m.from === "user" ? (
                      <div key={i} className="flex justify-end" style={{ animation: "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both" }}>
                        <div className="w-fit max-w-[80%] rounded-[12px] rounded-br-[4px] px-3.5 py-2 text-[14px] leading-relaxed" style={{ background: SOFT, boxShadow: `inset 0 0 0 1px ${BORDER}`, color: INK }}>
                          {m.text}
                        </div>
                      </div>
                    ) : (
                      <div key={i} className="flex flex-col items-start" style={{ animation: "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both" }}>
                        <p className="mb-1 ml-1 text-[11px] font-medium tracking-wide" style={{ color: SECONDARY }}>AI Agent</p>
                        <div className="w-fit max-w-[90%] rounded-[12px] rounded-bl-[4px] border px-3.5 py-2 text-[14px] leading-relaxed" style={{ background: PAPER, borderColor: LINE, color: "#333" }}>
                          <Words text={m.text} />
                        </div>
                      </div>
                    ),
                  )}
                  {thinking && (
                    <div className="flex items-center gap-2 px-1 text-[14px] font-medium" style={{ color: "#333" }}>
                      <Sparkles className="size-4" strokeWidth={1.75} style={{ color: ACCENT, animation: "event-spin 2.4s linear infinite" }} />
                      <span className="ai-shimmer">Thinking…</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* composer */}
            <div className="px-4 pb-4 pt-1">
              <div className="flex items-end gap-2 rounded-[14px] border px-3 py-2" style={{ background: PAPER, borderColor: LINE }}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(draft); } }}
                  placeholder="Ask anything…"
                  className="flex-1 bg-transparent py-[5px] text-[14px] outline-none placeholder:text-[#979797]"
                  style={{ color: "#333" }}
                />
                <button onClick={() => send(draft)} disabled={!draft.trim() || thinking} aria-label="Send" className="grid size-8 shrink-0 place-items-center rounded-full text-white transition-opacity disabled:opacity-40" style={{ background: ACCENT }}>
                  <ArrowUp className="size-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
