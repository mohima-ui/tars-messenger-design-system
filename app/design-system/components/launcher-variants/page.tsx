"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageCircle, X, HelpCircle,
  ChevronDown, Sparkles,
  Send, Check,
  RotateCcw, Bot, Mic, ArrowUp, Volume2, ThumbsUp, ThumbsDown, Copy,
} from "lucide-react";

/* ─── design tokens ─────────────────────────────────────── */
const LINE = "#E0DAD3";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT = "#2E2E2E";
const ACCENT_SOFT = "#EFEFEF";
const ACCENT_INK = "#1A1A1A";
const SUBTLE = "#F0EBE0";
const CANVAS = "#FFFDFA";

/* ─── skeleton helpers ───────────────────────────────────── */
const SKEL = "#E2E2E2";
const SKEL_BG = "#F5F5F5";

function Skel({ w, h = 12, r = 6 }: { w?: number | string; h?: number; r?: number }) {
  return (
    <div
      className="animate-pulse shrink-0"
      style={{ width: w, height: h, borderRadius: r, backgroundColor: SKEL }}
    />
  );
}

/* shared marketing-page hero skeleton */
function SkeletonHero() {
  return (
    <div className="flex items-start gap-10 px-10 pt-10 pb-6 flex-1 overflow-hidden">
      {/* left: copy */}
      <div className="flex flex-col w-[400px] shrink-0">
        {/* badge pill */}
        <Skel w={116} h={22} r={11} />
        {/* H1 — 3 chunky lines, tapering */}
        <div className="flex flex-col gap-2.5 mt-5">
          <Skel w="100%" h={44} r={7} />
          <Skel w="86%" h={44} r={7} />
          <Skel w="58%" h={44} r={7} />
        </div>
        {/* body text */}
        <div className="flex flex-col gap-2 mt-5">
          <Skel w="96%" h={13} r={4} />
          <Skel w="83%" h={13} r={4} />
          <Skel w="66%" h={13} r={4} />
        </div>
        {/* CTA buttons */}
        <div className="flex gap-3 mt-6">
          <Skel w={148} h={42} r={8} />
          <Skel w={128} h={42} r={8} />
        </div>
        {/* social proof row */}
        <div className="flex items-center gap-3 mt-7">
          <div className="flex -space-x-2 shrink-0">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse size-7 rounded-full border-2"
                style={{ backgroundColor: SKEL, borderColor: SKEL_BG }}
              />
            ))}
          </div>
          <Skel w={104} h={12} r={4} />
        </div>
      </div>
      {/* right: hero visual block */}
      <div className="flex-1 self-stretch min-h-[240px]">
        <div
          className="animate-pulse w-full h-full rounded-[14px]"
          style={{ backgroundColor: SKEL, minHeight: 240 }}
        />
      </div>
    </div>
  );
}

/* shared pricing-page skeleton header + toggle */
function SkeletonPricingHeader() {
  return (
    <div className="flex flex-col items-center gap-3 pt-8 pb-6 px-10">
      {/* page label */}
      <Skel w={80} h={20} r={10} />
      {/* title */}
      <Skel w={260} h={34} r={7} />
      {/* subtitle */}
      <Skel w={196} h={13} r={4} />
      {/* toggle tabs */}
      <div className="mt-2 flex items-center gap-1 rounded-full p-1" style={{ backgroundColor: SKEL }}>
        <div className="animate-pulse rounded-full px-5 py-1.5" style={{ width: 88, height: 28, backgroundColor: "white" }} />
        <div className="animate-pulse rounded-full px-5 py-1.5" style={{ width: 80, height: 28, backgroundColor: "transparent" }} />
      </div>
    </div>
  );
}

/* ─── browser chrome wrapper ─────────────────────────────── */
function BrowserFrame({
  url,
  height = 560,
  children,
}: {
  url: string;
  height?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[14px] overflow-hidden"
      style={{
        border: `1px solid ${LINE}`,
        boxShadow:
          "0 16px 56px -8px rgba(0,0,0,0.14), 0 4px 16px -4px rgba(0,0,0,0.07)",
      }}
    >
      {/* chrome bar */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 border-b"
        style={{ backgroundColor: "#EDE8DE", borderColor: LINE }}
      >
        <div className="flex gap-1.5 shrink-0">
          <div className="size-3 rounded-full bg-[#FF5F57]" />
          <div className="size-3 rounded-full bg-[#FEBC2E]" />
          <div className="size-3 rounded-full bg-[#28C840]" />
        </div>
        <div className="flex flex-1 justify-center">
          <div
            className="flex items-center gap-1.5 rounded-[6px] border px-3 py-1.5 font-mono text-[11px]"
            style={{
              backgroundColor: "white",
              borderColor: LINE,
              color: MUTED,
              width: 300,
              maxWidth: "100%",
            }}
          >
            <span className="text-[10px]">🔒</span>
            {url}
          </div>
        </div>
        <div className="w-[60px]" />
      </div>
      {/* viewport */}
      <div
        className="relative overflow-hidden"
        style={{ height, backgroundColor: CANVAS }}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── skeleton nav (shared) ──────────────────────────────── */
function SkeletonNav() {
  return (
    <nav
      className="flex items-center justify-between px-10 py-4 border-b shrink-0"
      style={{ borderColor: "#EBEBEB", backgroundColor: "white" }}
    >
      {/* logo */}
      <Skel w={80} h={24} r={6} />
      {/* nav links */}
      <div className="flex items-center gap-6">
        {[56, 64, 52, 68, 48].map((w, i) => <Skel key={i} w={w} h={12} />)}
      </div>
      {/* actions */}
      <div className="flex items-center gap-2">
        <Skel w={120} h={36} r={8} />
        <Skel w={80} h={36} r={8} />
      </div>
    </nav>
  );
}

/* ══════════════════════════════════════════════════════════
   VARIANT 2 — Contextual Inline Trigger
   ══════════════════════════════════════════════════════════ */
const PLANS = [
  {
    name: "Starter",
    price: "$29",
    note: "Great for small teams",
    color: "#6E6E6E",
    features: ["2,000 conversations/mo", "1 agent", "Basic analytics", "Email support"],
    cta: "Start free trial",
    highlight: false,
    q: "Is Starter enough for a 5-person support team?",
    a: "Starter works well for teams under 10 with moderate volume. 2k conversations/month is roughly 65/day — if you need more, Growth unlocks 15k.",
  },
  {
    name: "Growth",
    price: "$79",
    note: "Most popular for scaling teams",
    color: ACCENT_INK,
    features: ["15,000 conversations/mo", "5 agents", "Full analytics", "API access", "Priority support"],
    cta: "Start free trial",
    highlight: true,
    q: "Is Growth right for a fast-scaling startup?",
    a: "Growth is built for exactly that. 15k conversations/month, 5 agents, and full API access so your devs can build custom workflows.",
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "Tailored for large organisations",
    color: INK,
    features: ["Unlimited conversations", "Unlimited agents", "SSO + SAML", "SLA guarantee", "Dedicated CSM"],
    cta: "Talk to sales",
    highlight: false,
    q: "What does the Enterprise SLA actually guarantee?",
    a: "Enterprise SLA covers 99.9% uptime with a 1-hour response time for critical incidents. Your CSM can customise the terms.",
  },
];

function ContextualVariant() {
  const [openCard, setOpenCard] = useState<number | null>(null);

  return (
    <BrowserFrame url="acme.com/pricing" height={580}>
      <div className="h-full overflow-y-auto" style={{ backgroundColor: SKEL_BG }}>
        {/* nav */}
        <div className="sticky top-0 z-10">
          <SkeletonNav />
        </div>

        <SkeletonPricingHeader />

        {/* pricing cards */}
        <div className="grid grid-cols-3 gap-5 px-10 pb-10 relative">
          {PLANS.map((plan, idx) => (
            <div key={plan.name} className="relative flex flex-col">
              <div
                className="rounded-[16px] border flex flex-col flex-1 p-6"
                style={{
                  borderColor: plan.highlight ? ACCENT : LINE,
                  backgroundColor: "white",
                  boxShadow: plan.highlight
                    ? "0 0 0 2px " + ACCENT + ", 0 8px 24px -4px rgba(46,46,46,0.14)"
                    : undefined,
                }}
              >
                {plan.highlight && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-semibold text-white"
                    style={{ backgroundColor: ACCENT }}
                  >
                    Most popular
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-[14px] font-semibold" style={{ color: plan.color }}>
                    {plan.name}
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: MUTED }}>
                    {plan.note}
                  </p>
                  <p className="mt-3 text-[34px] font-bold tracking-tight leading-none" style={{ color: INK }}>
                    {plan.price}
                    {plan.price !== "Custom" && (
                      <span className="text-[14px] font-normal" style={{ color: MUTED }}>
                        /mo
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col gap-2 mb-5 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <Check
                        className="size-3.5 shrink-0 mt-0.5"
                        style={{ color: plan.highlight ? ACCENT : "#16A34A" }}
                        strokeWidth={2.5}
                      />
                      <span className="text-[12px]" style={{ color: MUTED }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full rounded-[9px] py-2.5 text-[13px] font-semibold mb-3"
                  style={{
                    backgroundColor: plan.highlight ? ACCENT : "white",
                    color: plan.highlight ? "white" : INK,
                    border: plan.highlight ? "none" : `1.5px solid ${LINE}`,
                  }}
                >
                  {plan.cta}
                </button>

                {/* contextual trigger + popover */}
                <div className="relative flex justify-center">
                  <button
                    className="flex items-center gap-1.5 text-[12px] font-medium transition-opacity"
                    style={{ color: ACCENT }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenCard(openCard === idx ? null : idx);
                    }}
                  >
                    <HelpCircle className="size-3.5" strokeWidth={2} />
                    Is this right for me?
                  </button>

                  {/* popover */}
                  {openCard === idx && (
                    <div
                      className="absolute rounded-[14px] border bg-white p-4 z-20"
                      style={{
                        bottom: "calc(100% + 10px)",
                        left: "50%",
                        transform: "translateX(-80%)",
                        width: 260,
                        borderColor: LINE,
                        boxShadow: "0 8px 32px -6px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)",
                      }}
                    >
                      <div
                        className="absolute -bottom-2 left-[75%] -translate-x-1/2 size-4 rotate-45 border-r border-b bg-white"
                        style={{ borderColor: LINE }}
                      />
                  <div className="flex items-start gap-2.5 mb-3">
                    <img
                      src="/global-payments-avatar.png"
                      alt=""
                      className="size-6 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-[11px] font-semibold mb-1" style={{ color: INK }}>
                        Tars
                      </p>
                      <p className="text-[12px] leading-relaxed" style={{ color: "#555" }}>
                        {plan.a}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      className="rounded-full border px-3 py-1 text-[11px] transition-colors"
                      style={{ borderColor: LINE, color: MUTED }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SUBTLE)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      Tell me more
                    </button>
                    <button
                      className="rounded-full border px-3 py-1 text-[11px] transition-colors"
                      style={{ borderColor: LINE, color: MUTED }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SUBTLE)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      Compare all plans
                    </button>
                    <button
                      className="ml-auto flex items-center justify-center size-5 rounded-[4px] transition-colors"
                      style={{ color: MUTED }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SUBTLE)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      onClick={() => setOpenCard(null)}
                    >
                      <X className="size-3" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BrowserFrame>
  );
}

/* ══════════════════════════════════════════════════════════
   VARIANT 3 — Proactive Nudge Card
   ══════════════════════════════════════════════════════════ */
type NudgeState = "waiting" | "visible" | "chatting" | "dismissed";

function NudgeVariant() {
  const [nudgeState, setNudgeState] = useState<NudgeState>("waiting");
  const [countdown, setCountdown] = useState(1);

  useEffect(() => {
    if (nudgeState !== "waiting") return;
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setNudgeState("visible");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [nudgeState]);

  const reset = () => {
    setNudgeState("waiting");
    setCountdown(4);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* reset control */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[12px]" style={{ color: MUTED }}>
          {nudgeState === "waiting" && (
            <>
              <span
                className="size-4 rounded-full border-2 border-current border-t-transparent inline-block animate-spin"
                style={{ borderColor: ACCENT, borderTopColor: "transparent" }}
              />
              Nudge appears in {countdown}s…
            </>
          )}
          {nudgeState === "visible" && (
            <span style={{ color: "#16A34A" }}>● Nudge is showing</span>
          )}
          {nudgeState === "chatting" && (
            <span style={{ color: "#16A34A" }}>● Chat opened from nudge</span>
          )}
          {nudgeState === "dismissed" && (
            <span>Nudge was dismissed</span>
          )}
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-[7px] border px-3 py-1.5 text-[12px] transition-colors"
          style={{ borderColor: LINE, color: MUTED }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SUBTLE)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <RotateCcw className="size-3.5" strokeWidth={2} />
          Replay nudge
        </button>
      </div>

      <BrowserFrame url="acme.com" height={580}>
        <div className="h-full flex flex-col" style={{ backgroundColor: SKEL_BG }}>
          <SkeletonNav />

          <SkeletonHero />

          {/* ── NUDGE CARD ─────────────────────────────────────── */}
          {(nudgeState === "visible" || nudgeState === "chatting") && (
            <div className="absolute bottom-6 right-6" style={{ width: 320 }}>
              {nudgeState === "visible" ? (
                <div
                  className="rounded-[16px] border bg-white p-5"
                  style={{
                    borderColor: LINE,
                    boxShadow:
                      "0 8px 32px -6px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="/global-payments-avatar.png"
                        alt=""
                        className="size-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: INK }}>
                          Tars
                        </p>
                        <p className="flex items-center gap-1 text-[11px]" style={{ color: "#16A34A" }}>
                          <span className="size-1.5 rounded-full bg-[#16A34A] inline-block" />
                          Online now
                        </p>
                      </div>
                    </div>
                    <button
                      className="size-6 flex items-center justify-center rounded-[6px] transition-colors shrink-0"
                      style={{ color: MUTED }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SUBTLE)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      onClick={() => setNudgeState("dismissed")}
                    >
                      <X className="size-3.5" strokeWidth={2.5} />
                    </button>
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#555" }}>
                    Looks like you&apos;ve been exploring for a bit. Have questions about
                    pricing or features? I can help you figure out what&apos;s the right fit.
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      className="flex-1 rounded-[9px] py-2.5 text-[13px] font-semibold text-white"
                      style={{ backgroundColor: ACCENT }}
                      onClick={() => setNudgeState("chatting")}
                    >
                      Yes, help me choose
                    </button>
                  </div>
                </div>
              ) : (
                /* chat opened from nudge */
                <div
                  className="rounded-[16px] border bg-white overflow-hidden flex flex-col"
                  style={{
                    borderColor: LINE,
                    boxShadow: "0 8px 32px -6px rgba(0,0,0,0.16)",
                    height: 500,
                  }}
                >
                  {/* chat header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 border-b shrink-0"
                    style={{ borderColor: LINE, backgroundColor: "white" }}
                  >
                    <div className="flex items-center gap-2">
                      <img src="/tars-avatar.png" alt="" className="size-7 rounded-full object-cover" />
                      <div>
                        <p className="text-[13px] font-semibold" style={{ color: INK }}>Tars</p>
                        <p className="text-[10px]" style={{ color: MUTED }}>● Online</p>
                      </div>
                    </div>
                    <button onClick={() => setNudgeState("dismissed")}>
                      <X className="size-4" style={{ color: MUTED }} strokeWidth={2} />
                    </button>
                  </div>
                  {/* messages */}
                  <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4">
                    <div className="flex items-start gap-2">
                      <div
                        className="rounded-[10px] rounded-tl-[3px] px-3 py-2.5 text-[12px] leading-relaxed"
                        style={{ backgroundColor: PAPER, border: `1px solid ${LINE}`, color: INK, maxWidth: 220 }}
                      >
                        Great! To find the best fit, how many conversations do you handle per month?
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {["Under 1k", "1k–10k", "10k+"].map((o) => (
                        <button key={o} className="rounded-full border px-3 py-1 text-[11px]" style={{ borderColor: LINE, backgroundColor: PAPER, color: INK }}>
                          {o}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* composer */}
                  <div className="px-4 pb-4 shrink-0">
                    <div className="flex items-center gap-2 rounded-[9px] border px-3 py-2.5" style={{ borderColor: LINE, backgroundColor: "#FFFDFA" }}>
                      <span className="flex-1 text-[12px]" style={{ color: "#C4B9A8" }}>Type a message…</span>
                      <button className="size-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: ACCENT }}>
                        <Send className="size-3" strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </BrowserFrame>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   VARIANT 4 — Edge Tab
   ══════════════════════════════════════════════════════════ */

function EdgeTabVariant() {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <BrowserFrame url="acme.com" height={580}>
      <div className="h-full flex flex-col relative overflow-hidden" style={{ backgroundColor: SKEL_BG }}>
        <SkeletonNav />
        <SkeletonHero />

        {/* ── EDGE TAB ────────────────────────────────────────── */}
        {!panelOpen && (
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 rounded-l-[10px] py-4 px-3 text-white"
            style={{
              backgroundColor: ACCENT,
              boxShadow: "-4px 0 20px -4px rgba(158,99,219,0.40)",
            }}
            onClick={() => setPanelOpen(true)}
          >
            <Bot className="size-5" strokeWidth={1.75} />
            <span
              className="text-[9px] font-bold tracking-widest uppercase"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: "0.1em" }}
            >
              AI Help
            </span>
          </button>
        )}

        {/* ── SLIDE PANEL ─────────────────────────────────────── */}
        <div
          className="absolute top-0 right-0 bottom-0 flex flex-col border-l"
          style={{
            width: 300,
            borderColor: LINE,
            backgroundColor: "white",
            transform: panelOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 280ms cubic-bezier(0.4,0,0.2,1)",
            boxShadow: "-8px 0 32px -8px rgba(0,0,0,0.12)",
          }}
        >
          {/* panel header */}
          <div
            className="flex items-center justify-between px-4 py-3.5 border-b shrink-0"
            style={{ borderColor: LINE, backgroundColor: "white" }}
          >
            <div className="flex items-center gap-2.5">
              <img src="/tars-avatar.png" alt="" className="size-7 rounded-full object-cover" />
              <div>
                <p className="text-[13px] font-semibold" style={{ color: INK }}>Tars</p>
                <p className="text-[10px]" style={{ color: MUTED }}>● Online</p>
              </div>
            </div>
            <button onClick={() => setPanelOpen(false)}>
              <X className="size-4" style={{ color: MUTED }} strokeWidth={2} />
            </button>
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4">
            <div className="flex items-start gap-2">
              <div
                className="rounded-[10px] rounded-tl-[3px] px-3 py-2.5 text-[12px] leading-relaxed"
                style={{ backgroundColor: PAPER, border: `1px solid ${LINE}`, color: INK }}
              >
                Hi Priya! I can help you work through conversations, suggest replies, or look up contact history. What do you need?
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["Draft a reply", "Summarise thread", "Look up contact", "Escalation help"].map((o) => (
                <button
                  key={o}
                  className="rounded-full border px-2.5 py-1 text-[11px] transition-colors"
                  style={{ borderColor: LINE, backgroundColor: PAPER, color: INK }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SUBTLE)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PAPER)}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          {/* composer */}
          <div className="px-4 py-3.5 border-t shrink-0" style={{ borderColor: LINE }}>
            <div
              className="flex items-center gap-2 rounded-[10px] border px-3 py-2.5"
              style={{ borderColor: LINE, backgroundColor: "#FFFDFA" }}
            >
              <input
                placeholder="Ask anything…"
                className="flex-1 bg-transparent text-[12px] outline-none"
                style={{ color: INK }}
              />
              <button
                className="size-6 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: ACCENT }}
              >
                <Send className="size-3" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

/* ══════════════════════════════════════════════════════════
   VARIANT 5 — Centered Floating Composer
   ══════════════════════════════════════════════════════════ */
type ComposerFlowState = "idle" | "focused" | "chatting";

const COMPOSER_STARTERS = [
  "What can the AI assistant help with?",
  "How does pricing work?",
  "Can I try before I buy?",
];

const STARTER_RESPONSES = [
  "I can help with product questions, pricing, onboarding, and troubleshooting. What would you like to know?",
  "We offer three plans — Starter ($29/mo), Growth ($79/mo), and Enterprise (custom). Growth is most popular: full API access and priority support. Want a side-by-side comparison?",
  "Yes! Our 14-day free trial gives you full access to all features. No credit card required to get started.",
];

const THINKING_EVENTS = [
  "Reading your question",
  "Searching knowledge base",
  "Checking recent context",
  "Drafting response",
];

const STARTER_OPTIONS = [
  ["Tell me more", "See a demo", "Get started"],
  ["Compare plans", "Start free trial", "Talk to sales"],
  ["Start free trial", "See pricing", "Ask a question"],
];

const COMPARE_PLANS_RESPONSE = "Here's a quick side-by-side: Starter ($29/mo) covers 2k conversations and 1 agent — solid for small teams. Growth ($79/mo) gives you 15k conversations, 5 agents, full analytics, and API access — our most popular. Enterprise is fully custom: unlimited everything, SSO, dedicated SLA, and a CSM. What scale are you working at?";

function ThinkingEvents({ step }: { step: number }) {
  return (
    <div className="flex flex-col gap-1.5 px-1">
      {THINKING_EVENTS.slice(0, step).map((label, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px]" style={{ color: MUTED }}>
          <Check className="size-3 shrink-0" strokeWidth={2.5} style={{ color: "#16A34A" }} />
          {label}
        </div>
      ))}
      {step < THINKING_EVENTS.length && (
        <div className="flex items-center gap-2 text-[12px]" style={{ color: INK }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" className="shrink-0"
            style={{ animation: "cvc-sparkle-spin 1.8s linear infinite" }}>
            <defs>
              <linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2E2E2E" />
                <stop offset="100%" stopColor="#9E63DB" />
              </linearGradient>
            </defs>
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" stroke="url(#sg)" />
            <path d="M20 3v4" stroke="url(#sg)" />
            <path d="M22 5h-4" stroke="url(#sg)" />
            <path d="M4 17v2" stroke="url(#sg)" />
            <path d="M5 18H3" stroke="url(#sg)" />
          </svg>
          {THINKING_EVENTS[step]}
        </div>
      )}
    </div>
  );
}

/* composer widths: compact default → gently expands on focus */
const CW_IDLE = 360;
const CW_ACTIVE = 480;

function CenteredComposerVariant() {
  const [flow, setFlow] = useState<ComposerFlowState>("idle");
  const [pressedIdx, setPressedIdx] = useState<number | null>(null);
  const [selectedStarter, setSelectedStarter] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [panelPhase, setPanelPhase] = useState<"thinking" | "done">("thinking");
  const [thinkingStep, setThinkingStep] = useState(0);
  const [hoveredTurn, setHoveredTurn] = useState<null | 1 | 2>(null);
  const [conversationTurn, setConversationTurn] = useState<1 | 2>(1);

  /* reset all state each time chat opens */
  useEffect(() => {
    if (flow === "chatting") {
      setPanelPhase("thinking");
      setThinkingStep(0);
      setConversationTurn(1);
      setHoveredTurn(null);
    }
  }, [flow]);

  const handleComparePlans = () => {
    setConversationTurn(2);
    setPanelPhase("thinking");
    setThinkingStep(0);
    setHoveredTurn(null);
  };

  /* advance one event per second; after all 4 fire → show response */
  useEffect(() => {
    if (flow !== "chatting" || panelPhase !== "thinking") return;
    if (thinkingStep >= THINKING_EVENTS.length) {
      setPanelPhase("done");
      return;
    }
    const t = setTimeout(() => setThinkingStep((s) => s + 1), 1000);
    return () => clearTimeout(t);
  }, [flow, panelPhase, thinkingStep]);

  const isActive = flow !== "idle";
  const composerW = isActive ? CW_ACTIVE : CW_IDLE;

  const handleStarterClick = (idx: number) => {
    setPressedIdx(idx);
    setSelectedStarter(idx);
    setTimeout(() => {
      setFlow("chatting");
      setPressedIdx(null);
    }, 120);
  };

  return (
    <BrowserFrame url="acme.com" height={580}>
      {/* keyframes scoped to this variant */}
      <style>{`
        @keyframes cvc-starter-in {
          from { opacity: 0; transform: translateX(-18px) translateY(6px); }
          to   { opacity: 1; transform: translateX(0) translateY(0); }
        }
        @keyframes cvc-panel-rise {
          from { opacity: 0; transform: translateY(28px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes cvc-bg-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cvc-sparkle-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="h-full flex flex-col relative overflow-hidden"
        style={{ backgroundColor: SKEL_BG }}
      >
        <SkeletonNav />
        <SkeletonHero />

        {/* soft background dim when chat is open */}
        {flow === "chatting" && (
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              backgroundColor: "rgba(0,0,0,0.05)",
              animation: "cvc-bg-in 360ms ease-out both",
            }}
          />
        )}

        {/* click-outside backdrop for focused state */}
        {flow === "focused" && (
          <div
            className="absolute inset-0 z-10"
            onClick={() => setFlow("idle")}
          />
        )}

        {/* ── launcher group: starters / panel / composer ─────── */}
        {/* Single centred container — width transition keeps everything aligned */}
        <div
          className="absolute bottom-4 left-1/2 z-30 flex flex-col"
          style={{
            width: composerW,
            transform: "translateX(-50%)",
            transition: "width 220ms ease-out",
          }}
        >
          {/* starters: left-aligned with composer, staggered in from left */}
          {flow === "focused" && (
            <div className="flex flex-col gap-2 mb-3">
              {COMPOSER_STARTERS.map((s, i) => (
                <button
                  key={s}
                  className="rounded-full border bg-white px-5 py-2.5 text-[13px] text-left self-start"
                  style={{
                    borderColor: ACCENT,
                    backgroundColor: pressedIdx === i ? ACCENT_INK : ACCENT,
                    color: "white",
                    boxShadow: "0 2px 10px -2px rgba(0,0,0,0.10)",
                    /* appear from left, staggered */
                    animation: `cvc-starter-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both`,
                    animationDelay: `${80 + i * 70}ms`,
                    /* instant pressed feedback */
                    transition:
                      "background-color 140ms ease-out, border-color 140ms ease-out",
                  }}
                  onMouseEnter={(e) => {
                    if (pressedIdx !== i)
                      e.currentTarget.style.backgroundColor = ACCENT_INK;
                  }}
                  onMouseLeave={(e) => {
                    if (pressedIdx !== i)
                      e.currentTarget.style.backgroundColor = ACCENT;
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStarterClick(i);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* chat panel: rises from below, transform-origin bottom */}
          {flow === "chatting" && (
            <div
              className="w-full mb-3 rounded-[16px] border overflow-hidden"
              style={{
                backgroundColor: "white",
                borderColor: LINE,
                boxShadow:
                  "0 12px 40px -8px rgba(0,0,0,0.18), 0 2px 10px rgba(0,0,0,0.06)",
                transformOrigin: "bottom center",
                animation:
                  "cvc-panel-rise 460ms cubic-bezier(0.22, 1, 0.36, 1) both",
              }}
            >
              {/* header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: LINE }}
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src="/tars-avatar.png"
                    alt=""
                    className="size-7 rounded-full object-cover"
                  />
                  <p
                    className="text-[14px] font-semibold"
                    style={{ color: INK }}
                  >
                    AI Assistant
                  </p>
                </div>
                <button
                  className="rounded-[6px] p-1 transition-colors"
                  style={{ color: MUTED }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = SUBTLE)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  onClick={() => setFlow("idle")}
                >
                  <ChevronDown className="size-4" strokeWidth={2} />
                </button>
              </div>

              {/* messages — scrollable */}
              <div
                className="flex flex-col gap-3 px-4 py-4 overflow-y-auto scrollbar-subtle"
                style={{ maxHeight: 320 }}
              >
                {/* ── Turn 1 ───────────────────────────────────── */}

                {/* T1 user message */}
                <div className="flex justify-end">
                  <div
                    className="rounded-[12px] rounded-br-[3px] px-3.5 py-2.5 text-[13px] leading-relaxed text-white"
                    style={{ backgroundColor: ACCENT, maxWidth: 280 }}
                  >
                    {COMPOSER_STARTERS[selectedStarter]}
                  </div>
                </div>

                {/* T1 thinking */}
                {conversationTurn === 1 && panelPhase === "thinking" && (
                  <ThinkingEvents step={thinkingStep} />
                )}

                {/* T1 AI response — no word animation once turn 2 starts */}
                {(panelPhase === "done" || conversationTurn === 2) && (() => {
                  const animated = conversationTurn === 1;
                  const words = STARTER_RESPONSES[selectedStarter].split(" ");
                  const wordsDelay = words.length * 42;
                  return (
                    <div
                      onMouseEnter={() => setHoveredTurn(1)}
                      onMouseLeave={() => setHoveredTurn(null)}
                    >
                      <p className="text-[13px] leading-relaxed px-1 w-full" style={{ color: INK }}>
                        {words.map((word, i) => (
                          <span
                            key={i}
                            className="inline-block"
                            style={animated ? {
                              animation: "word-in 320ms cubic-bezier(0.2, 0.6, 0.2, 1) both",
                              animationDelay: `${i * 42}ms`,
                            } : undefined}
                          >
                            {word}&nbsp;
                          </span>
                        ))}
                      </p>

                      {/* options — only in turn 1 */}
                      {conversationTurn === 1 && (
                        <div className="flex flex-wrap gap-2 px-1 mt-3">
                          {STARTER_OPTIONS[selectedStarter].map((opt, i) => (
                            <button
                              key={opt}
                              className="rounded-full border px-3.5 py-1.5 text-[12px]"
                              style={{
                                borderColor: ACCENT,
                                color: INK,
                                backgroundColor: "white",
                                animation: "option-in 280ms cubic-bezier(0.2, 0.6, 0.2, 1) both",
                                animationDelay: `${wordsDelay + 60 + i * 60}ms`,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = SKEL_BG;
                                e.currentTarget.style.borderColor = ACCENT;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "white";
                                e.currentTarget.style.borderColor = ACCENT;
                              }}
                              onClick={opt === "Compare plans" ? handleComparePlans : undefined}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* action icons */}
                      <div
                          className="flex items-center gap-3 px-1 mt-2.5"
                          style={{ opacity: hoveredTurn === 1 ? 1 : 0, transition: "opacity 150ms ease" }}
                        >
                          {[
                            { icon: Volume2, label: "Listen" },
                            { icon: ThumbsUp, label: "Good" },
                            { icon: ThumbsDown, label: "Bad" },
                            { icon: Copy, label: "Copy" },
                          ].map(({ icon: Icon, label }) => (
                            <button
                              key={label}
                              title={label}
                              className="rounded-[5px] p-1 transition-colors"
                              style={{ color: MUTED }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = INK;
                                e.currentTarget.style.backgroundColor = SKEL_BG;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = MUTED;
                                e.currentTarget.style.backgroundColor = "transparent";
                              }}
                            >
                              <Icon className="size-3.5" strokeWidth={1.75} />
                            </button>
                          ))}
                        </div>
                      </div>
                  );
                })()}

                {/* ── Turn 2 ───────────────────────────────────── */}
                {conversationTurn === 2 && (
                  <>
                    {/* T2 user message */}
                    <div className="flex justify-end">
                      <div
                        className="rounded-[12px] rounded-br-[3px] px-3.5 py-2.5 text-[13px] leading-relaxed text-white"
                        style={{ backgroundColor: ACCENT, maxWidth: 280 }}
                      >
                        Compare plans
                      </div>
                    </div>

                    {/* T2 thinking */}
                    {panelPhase === "thinking" && (
                      <ThinkingEvents step={thinkingStep} />
                    )}

                    {/* T2 AI response */}
                    {panelPhase === "done" && (() => {
                      const words = COMPARE_PLANS_RESPONSE.split(" ");
                      return (
                        <div
                          onMouseEnter={() => setHoveredTurn(2)}
                          onMouseLeave={() => setHoveredTurn(null)}
                        >
                          <p className="text-[13px] leading-relaxed px-1 w-full" style={{ color: INK }}>
                            {words.map((word, i) => (
                              <span
                                key={i}
                                className="inline-block"
                                style={{
                                  animation: "word-in 320ms cubic-bezier(0.2, 0.6, 0.2, 1) both",
                                  animationDelay: `${i * 42}ms`,
                                }}
                              >
                                {word}&nbsp;
                              </span>
                            ))}
                          </p>

                          {/* action icons */}
                          <div
                            className="flex items-center gap-3 px-1 mt-2.5"
                            style={{ opacity: hoveredTurn === 2 ? 1 : 0, transition: "opacity 150ms ease" }}
                          >
                            {[
                              { icon: Volume2, label: "Listen" },
                              { icon: ThumbsUp, label: "Good" },
                              { icon: ThumbsDown, label: "Bad" },
                              { icon: Copy, label: "Copy" },
                            ].map(({ icon: Icon, label }) => (
                              <button
                                key={label}
                                title={label}
                                className="rounded-[5px] p-1 transition-colors"
                                style={{ color: MUTED }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = INK;
                                  e.currentTarget.style.backgroundColor = SKEL_BG;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = MUTED;
                                  e.currentTarget.style.backgroundColor = "transparent";
                                }}
                              >
                                <Icon className="size-3.5" strokeWidth={1.75} />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ── composer bar ───────────────────────────────────── */}
          <div
            className="w-full flex items-center gap-2.5 border bg-white px-4 py-2.5"
            style={{
              borderRadius: 14,
              borderColor: flow === "focused" ? ACCENT : LINE,
              boxShadow: isActive
                ? "0 6px 24px -4px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)"
                : "0 2px 10px -3px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.04)",
              /* shadow + border animate with composer width */
              transition:
                "box-shadow 220ms ease-out, border-color 180ms ease-out",
            }}
          >
            <input
              className="flex-1 bg-transparent text-[14px] outline-none"
              style={{ color: INK }}
              placeholder={
                flow === "chatting" ? "Message…" : "Ask anything…"
              }
              onFocus={() => {
                setInputFocused(true);
                if (flow === "idle") setFlow("focused");
              }}
              onBlur={() => setInputFocused(false)}
            />
            <button
              className="size-8 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: ACCENT }}
              onClick={() => {
                if (flow === "idle") setFlow("focused");
                else setFlow("chatting");
              }}
            >
              {inputFocused || flow === "chatting"
                ? <ArrowUp className="size-3.5" strokeWidth={2.5} />
                : <Mic className="size-3.5" strokeWidth={2} />
              }
            </button>
          </div>

        </div>
      </div>
    </BrowserFrame>
  );
}

/* ══════════════════════════════════════════════════════════
   VARIANT — Corner Pill Composer
   ══════════════════════════════════════════════════════════ */
function CornerPillVariant() {
  type Phase = "avatar" | "pill" | "focused" | "chatting";
  const [phase, setPhase] = useState<Phase>("avatar");
  const [pressedIdx, setPressedIdx] = useState<number | null>(null);
  const [selectedStarter, setSelectedStarter] = useState(0);
  const [panelPhase, setPanelPhase] = useState<"thinking" | "done">("thinking");
  const [thinkingStep, setThinkingStep] = useState(0);
  const [hoveredTurn, setHoveredTurn] = useState<null | 1 | 2>(null);
  const [conversationTurn, setConversationTurn] = useState<1 | 2>(1);
  const [inputText, setInputText] = useState("");

  /* avatar → pill after 2s */
  useEffect(() => {
    const t = setTimeout(() => setPhase(p => p === "avatar" ? "pill" : p), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === "chatting") {
      setPanelPhase("thinking");
      setThinkingStep(0);
      setConversationTurn(1);
      setHoveredTurn(null);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "chatting" || panelPhase !== "thinking") return;
    if (thinkingStep >= THINKING_EVENTS.length) { setPanelPhase("done"); return; }
    const t = setTimeout(() => setThinkingStep(s => s + 1), 1000);
    return () => clearTimeout(t);
  }, [phase, panelPhase, thinkingStep]);

  const handleComparePlans = () => {
    setConversationTurn(2);
    setPanelPhase("thinking");
    setThinkingStep(0);
    setHoveredTurn(null);
  };

  const handleStarterClick = (idx: number) => {
    setPressedIdx(idx);
    setSelectedStarter(idx);
    setTimeout(() => { setPhase("chatting"); setPressedIdx(null); }, 120);
  };

  const pillActive = phase === "focused" || phase === "chatting";

  return (
    <BrowserFrame url="acme.com" height={580}>
      <style>{`
        @keyframes cpill-starter-in {
          from { opacity: 0; transform: translateX(14px) translateY(4px); }
          to   { opacity: 1; transform: translateX(0) translateY(0); }
        }
        @keyframes cpill-panel-rise {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div className="h-full flex flex-col relative overflow-hidden" style={{ backgroundColor: SKEL_BG }}>
        <SkeletonNav />
        <SkeletonHero />

        {phase === "chatting" && (
          <div className="absolute inset-0 z-10 pointer-events-none"
            style={{ backgroundColor: "rgba(0,0,0,0.05)", animation: "cvc-bg-in 360ms ease-out both" }} />
        )}
        {phase === "focused" && (
          <div className="absolute inset-0 z-10" onClick={() => setPhase("pill")} />
        )}

        {/* Single anchor — pill column + FAB share one flex-col so the bottom row is truly items-center */}
        <div
          className="absolute z-30 flex flex-col items-end"
          style={{ bottom: 20, right: 20, gap: phase === "chatting" ? 0 : 8 }}
        >

          {/* starters */}
          {phase === "focused" && (
            <div className="flex flex-col items-end gap-2">
              {COMPOSER_STARTERS.map((s, i) => (
                <button key={s}
                  className="rounded-full border px-4 py-2 text-[12.5px] text-right whitespace-nowrap"
                  style={{
                    borderColor: ACCENT,
                    backgroundColor: pressedIdx === i ? ACCENT_INK : ACCENT,
                    color: "white",
                    boxShadow: "0 2px 10px -2px rgba(0,0,0,0.10)",
                    animation: `cpill-starter-in 260ms cubic-bezier(0.22,1,0.36,1) both`,
                    animationDelay: `${60 + i * 60}ms`,
                    transition: "background-color 140ms ease-out",
                  }}
                  onMouseEnter={e => { if (pressedIdx !== i) e.currentTarget.style.backgroundColor = ACCENT_INK; }}
                  onMouseLeave={e => { if (pressedIdx !== i) e.currentTarget.style.backgroundColor = ACCENT; }}
                  onClick={e => { e.stopPropagation(); handleStarterClick(i); }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* chat panel */}
          {phase === "chatting" && (
            <div className="rounded-[16px] border bg-white overflow-hidden"
              style={{
                width: 340, borderColor: LINE,
                boxShadow: "0 12px 40px -8px rgba(0,0,0,0.18), 0 2px 10px rgba(0,0,0,0.06)",
                animation: "cpill-panel-rise 400ms cubic-bezier(0.22,1,0.36,1) both",
              }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: LINE }}>
                <div className="flex items-center gap-2.5">
                  <img src="/tars-avatar.png" alt="" className="size-7 rounded-full object-cover" />
                  <p className="text-[14px] font-semibold" style={{ color: INK }}>AI Assistant</p>
                </div>
                <button className="rounded-[6px] p-1 transition-colors" style={{ color: MUTED }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = SUBTLE)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  onClick={() => setPhase("pill")}>
                  <ChevronDown className="size-4" strokeWidth={2} />
                </button>
              </div>
              <div className="flex flex-col gap-3 px-4 py-4 overflow-y-auto scrollbar-subtle" style={{ maxHeight: 300 }}>
                <div className="flex justify-end">
                  <div className="rounded-[12px] rounded-br-[3px] px-3.5 py-2.5 text-[13px] leading-relaxed text-white"
                    style={{ backgroundColor: ACCENT, maxWidth: 260 }}>
                    {COMPOSER_STARTERS[selectedStarter]}
                  </div>
                </div>
                {conversationTurn === 1 && panelPhase === "thinking" && <ThinkingEvents step={thinkingStep} />}
                {(panelPhase === "done" || conversationTurn === 2) && (() => {
                  const animated = conversationTurn === 1;
                  const words = STARTER_RESPONSES[selectedStarter].split(" ");
                  const wordsDelay = words.length * 42;
                  return (
                    <div onMouseEnter={() => setHoveredTurn(1)} onMouseLeave={() => setHoveredTurn(null)}>
                      <p className="text-[13px] leading-relaxed px-1 w-full" style={{ color: INK }}>
                        {words.map((word, i) => (
                          <span key={i} className="inline-block"
                            style={animated ? { animation: "word-in 320ms cubic-bezier(0.2,0.6,0.2,1) both", animationDelay: `${i * 42}ms` } : undefined}>
                            {word}&nbsp;
                          </span>
                        ))}
                      </p>
                      {conversationTurn === 1 && (
                        <div className="flex flex-wrap gap-2 px-1 mt-3">
                          {STARTER_OPTIONS[selectedStarter].map((opt, i) => (
                            <button key={opt} className="rounded-full border px-3.5 py-1.5 text-[12px]"
                              style={{
                                borderColor: ACCENT, color: INK, backgroundColor: "white",
                                animation: "option-in 280ms cubic-bezier(0.2,0.6,0.2,1) both",
                                animationDelay: `${wordsDelay + 60 + i * 60}ms`,
                              }}
                              onMouseEnter={e => { e.currentTarget.style.backgroundColor = SKEL_BG; }}
                              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}
                              onClick={opt === "Compare plans" ? handleComparePlans : undefined}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-3 px-1 mt-2.5"
                        style={{ opacity: hoveredTurn === 1 ? 1 : 0, transition: "opacity 150ms ease" }}>
                        {[{ icon: Volume2, label: "Listen" }, { icon: ThumbsUp, label: "Good" }, { icon: ThumbsDown, label: "Bad" }, { icon: Copy, label: "Copy" }].map(({ icon: Icon, label }) => (
                          <button key={label} title={label} className="rounded-[5px] p-1 transition-colors" style={{ color: MUTED }}
                            onMouseEnter={e => { e.currentTarget.style.color = INK; e.currentTarget.style.backgroundColor = SKEL_BG; }}
                            onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.backgroundColor = "transparent"; }}>
                            <Icon className="size-3.5" strokeWidth={1.75} />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                {conversationTurn === 2 && (
                  <>
                    <div className="flex justify-end">
                      <div className="rounded-[12px] rounded-br-[3px] px-3.5 py-2.5 text-[13px] leading-relaxed text-white"
                        style={{ backgroundColor: ACCENT, maxWidth: 260 }}>Compare plans</div>
                    </div>
                    {panelPhase === "thinking" && <ThinkingEvents step={thinkingStep} />}
                    {panelPhase === "done" && (() => {
                      const words = COMPARE_PLANS_RESPONSE.split(" ");
                      return (
                        <div onMouseEnter={() => setHoveredTurn(2)} onMouseLeave={() => setHoveredTurn(null)}>
                          <p className="text-[13px] leading-relaxed px-1 w-full" style={{ color: INK }}>
                            {words.map((word, i) => (
                              <span key={i} className="inline-block"
                                style={{ animation: "word-in 320ms cubic-bezier(0.2,0.6,0.2,1) both", animationDelay: `${i * 42}ms` }}>
                                {word}&nbsp;
                              </span>
                            ))}
                          </p>
                          <div className="flex items-center gap-3 px-1 mt-2.5"
                            style={{ opacity: hoveredTurn === 2 ? 1 : 0, transition: "opacity 150ms ease" }}>
                            {[{ icon: Volume2, label: "Listen" }, { icon: ThumbsUp, label: "Good" }, { icon: ThumbsDown, label: "Bad" }, { icon: Copy, label: "Copy" }].map(({ icon: Icon, label }) => (
                              <button key={label} title={label} className="rounded-[5px] p-1 transition-colors" style={{ color: MUTED }}
                                onMouseEnter={e => { e.currentTarget.style.color = INK; e.currentTarget.style.backgroundColor = SKEL_BG; }}
                                onMouseLeave={e => { e.currentTarget.style.color = MUTED; e.currentTarget.style.backgroundColor = "transparent"; }}>
                                <Icon className="size-3.5" strokeWidth={1.75} />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
              {/* composer — now docked inside the chat window so panel + input read as one chatbot */}
              <div className="px-3 pb-3 pt-2 border-t shrink-0" style={{ borderColor: LINE }}>
                <div className="flex items-center gap-2.5 rounded-[12px] border px-3 py-2" style={{ borderColor: LINE, backgroundColor: CANVAS }}>
                  <input
                    className="flex-1 min-w-0 bg-transparent text-[13px] outline-none"
                    style={{ color: INK }}
                    placeholder="Message…"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                  />
                  <button
                    className="size-7 flex items-center justify-center shrink-0 transition-colors"
                    style={{ borderRadius: 8, backgroundColor: ACCENT, color: "white" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = ACCENT_INK)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = ACCENT)}
                  >
                    <ArrowUp className="size-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* bottom row — pill + FAB; collapses away once the chat window takes over */}
          <div
            className="flex items-center"
            style={{
              maxHeight: phase === "chatting" ? 0 : 64,
              opacity: phase === "chatting" ? 0 : 1,
              overflow: "hidden",
              transition:
                "max-height 320ms cubic-bezier(0.22,1,0.36,1), opacity 220ms ease",
              pointerEvents: phase === "chatting" ? "none" : "auto",
            }}
          >
            {/* pill */}
            <div
              className="flex items-center gap-2.5 bg-white cursor-text"
              style={{
                width: phase === "pill" ? 230 : 340,
                height: 48,
                borderRadius: 14,
                border: `1.5px solid ${phase === "focused" ? ACCENT : LINE}`,
                boxShadow: "0 2px 16px -4px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)",
                padding: "0 8px 0 16px",
                opacity: phase === "avatar" ? 0 : 1,
                transform: phase === "avatar" ? "translateX(24px)" : "translateX(0)",
                transition: "width 300ms cubic-bezier(0.22,1,0.36,1), border-color 180ms ease-out, opacity 400ms ease-in-out, transform 400ms ease-in-out",
                pointerEvents: phase === "avatar" ? "none" : "auto",
              }}
              onClick={() => { if (phase === "pill") setPhase("focused"); }}
            >
              <input
                className="flex-1 min-w-0 bg-transparent text-[13px] outline-none"
                style={{ color: INK }}
                placeholder={phase === "chatting" ? "Message…" : "Write a message…"}
                readOnly={phase === "pill" || phase === "avatar"}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onFocus={() => { if (phase === "pill") setPhase("focused"); }}
              />
              <button
                className="size-7 flex items-center justify-center shrink-0 transition-colors"
                style={{ borderRadius: 8, backgroundColor: ACCENT, color: "white" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = ACCENT_INK)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = ACCENT)}
              >
                {(phase === "focused" || phase === "chatting") ? <ArrowUp className="size-3.5" strokeWidth={2.5} /> : <Mic className="size-3.5" strokeWidth={2} />}
              </button>
            </div>

            {/* FAB — rounded square with inline Tars logo SVG */}
            <button
              style={{
                width: pillActive ? 0 : 42,
                height: 42,
                marginLeft: pillActive ? 0 : 10,
                borderRadius: 14,
                overflow: "hidden",
                padding: 0,
                flexShrink: 0,
                backgroundColor: "transparent",
                boxShadow: pillActive ? "none" : "0 4px 18px -4px rgba(0,0,0,0.36)",
                opacity: pillActive ? 0 : 1,
                transform: pillActive ? "scale(0.5)" : "scale(1)",
                transition: "width 320ms cubic-bezier(0.22,1,0.36,1), margin-left 320ms cubic-bezier(0.22,1,0.36,1), opacity 280ms ease, transform 300ms cubic-bezier(0.22,1,0.36,1), box-shadow 280ms ease",
                pointerEvents: pillActive ? "none" : "auto",
              }}
              onClick={() => phase === "pill" && setPhase("focused")}
            >
              <img src="/tars-logo-primary.png" alt="Tars" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </button>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

/* ══════════════════════════════════════════════════════════
   CONCEPT A — Sonar Orb
   ══════════════════════════════════════════════════════════ */
const SONAR_MSG = "Exploring pricing? I can walk you through which plan fits your team best.";
const SONAR_OPTS = ["Help me choose a plan", "What's in Enterprise?", "Ask something else"];

function SonarOrbVariant() {
  const [phase, setPhase] = useState<"idle" | "typing" | "done" | "chat">("idle");
  const [typed, setTyped] = useState(0);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [panelDone, setPanelDone] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase("typing"), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "typing") return;
    if (typed >= SONAR_MSG.length) { setPhase("done"); return; }
    const t = setTimeout(() => setTyped(n => n + 1), 28);
    return () => clearTimeout(t);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== "chat") return;
    if (thinkingStep >= THINKING_EVENTS.length) { setPanelDone(true); return; }
    const t = setTimeout(() => setThinkingStep(s => s + 1), 900);
    return () => clearTimeout(t);
  }, [phase, thinkingStep]);

  const openChat = (idx: number) => {
    setSelectedOpt(idx);
    setPhase("chat");
    setThinkingStep(0);
    setPanelDone(false);
  };

  return (
    <BrowserFrame url="acme.com/pricing" height={580}>
      <style>{`
        @keyframes sonar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes sonar-bubble { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes sonar-chip { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes sonar-panel { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes sonar-cursor { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
      <div className="h-full flex flex-col relative overflow-hidden" style={{ backgroundColor: SKEL_BG }}>
        <SkeletonNav />
        <SkeletonPricingHeader />
        {/* skeleton cards */}
        <div className="grid grid-cols-3 gap-5 px-10">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-[16px] border bg-white p-5 flex flex-col gap-3"
              style={{ borderColor: i === 1 ? ACCENT : LINE, boxShadow: i === 1 ? `0 0 0 2px ${ACCENT}` : undefined }}>
              <Skel w={60} h={16} />
              <Skel w={80} h={32} />
              {[90, 75, 85, 60].map((w, j) => <Skel key={j} w={`${w}%`} h={12} />)}
              <Skel w="100%" h={36} r={8} />
            </div>
          ))}
        </div>

        {/* chat panel */}
        {phase === "chat" && (
          <div className="absolute z-40 rounded-[16px] border bg-white overflow-hidden flex flex-col"
            style={{ bottom: 88, right: 24, width: 320, borderColor: LINE, boxShadow: "0 12px 40px -8px rgba(0,0,0,0.18)", animation: "sonar-panel 380ms cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: LINE }}>
              <div className="flex items-center gap-2.5">
                <img src="/tars-avatar.png" alt="" className="size-7 rounded-full object-cover" />
                <p className="text-[14px] font-semibold" style={{ color: INK }}>AI Assistant</p>
              </div>
              <button className="rounded-[6px] p-1" style={{ color: MUTED }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = SUBTLE)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => { setPhase("done"); }}>
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>
            <div className="flex flex-col gap-3 px-4 py-4 overflow-y-auto scrollbar-subtle" style={{ maxHeight: 260 }}>
              <div className="flex justify-end">
                <div className="rounded-[12px] rounded-br-[3px] px-3.5 py-2.5 text-[13px] leading-relaxed text-white"
                  style={{ backgroundColor: ACCENT, maxWidth: 240 }}>
                  {SONAR_OPTS[selectedOpt]}
                </div>
              </div>
              <ThinkingEvents step={thinkingStep} />
              {panelDone && (
                <p className="text-[13px] leading-relaxed px-1" style={{ color: INK }}>
                  {STARTER_RESPONSES[0].split(" ").map((w, i) => (
                    <span key={i} className="inline-block"
                      style={{ animation: "word-in 320ms cubic-bezier(0.2,0.6,0.2,1) both", animationDelay: `${i * 40}ms` }}>
                      {w}&nbsp;
                    </span>
                  ))}
                </p>
              )}
            </div>
            <div className="px-4 pb-4 shrink-0">
              <div className="flex items-center gap-2 rounded-[9px] border px-3 py-2.5" style={{ borderColor: LINE }}>
                <input placeholder="Reply…" className="flex-1 bg-transparent text-[12px] outline-none" style={{ color: INK }} readOnly />
                <button className="size-6 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: ACCENT }}>
                  <ArrowUp className="size-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* sonar group */}
        <div className="absolute bottom-6 right-6 z-30 flex items-end gap-3">
          {/* bubble */}
          {(phase === "typing" || phase === "done") && (
            <div className="rounded-[14px] rounded-br-[4px] border bg-white p-4 flex flex-col gap-2.5"
              style={{ width: 252, borderColor: LINE, boxShadow: "0 8px 28px -6px rgba(0,0,0,0.14)", animation: "sonar-bubble 300ms cubic-bezier(0.22,1,0.36,1) both" }}>
              <div className="flex items-center gap-2">
                <img src="/tars-avatar.png" alt="" className="size-5 rounded-full object-cover" />
                <p className="text-[11px] font-semibold" style={{ color: INK }}>Tars</p>
              </div>
              <p className="text-[12.5px] leading-relaxed" style={{ color: INK, minHeight: 54 }}>
                {SONAR_MSG.slice(0, typed)}
                {phase === "typing" && <span style={{ animation: "sonar-cursor 1s step-end infinite" }}>|</span>}
              </p>
              {phase === "done" && (
                <div className="flex flex-col gap-1.5 mt-0.5">
                  {SONAR_OPTS.map((opt, i) => (
                    <button key={opt}
                      className="rounded-full border text-left px-3 py-1.5 text-[12px]"
                      style={{ borderColor: i < 2 ? ACCENT : LINE, color: i < 2 ? ACCENT_INK : MUTED, backgroundColor: "white", animation: `sonar-chip 220ms ease both`, animationDelay: `${i * 70}ms` }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = SKEL_BG; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "white"; }}
                      onClick={() => openChat(i)}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* orb */}
          <div className="relative flex items-center justify-center shrink-0" style={{ width: 52, height: 52 }}>
            {/* spinning arc */}
            <div className="absolute inset-0 rounded-full"
              style={{ background: "conic-gradient(from 0deg, transparent 0deg, #2E2E2E 50deg, transparent 100deg)", animation: "sonar-spin 2.8s linear infinite", borderRadius: "50%" }} />
            {/* gap ring */}
            <div className="absolute rounded-full" style={{ inset: 2, backgroundColor: SKEL_BG, borderRadius: "50%" }} />
            {/* avatar */}
            <button className="relative z-10 size-11 rounded-full overflow-hidden"
              style={{ boxShadow: "0 3px 12px -3px rgba(0,0,0,0.22)" }}
              onClick={() => phase === "chat" ? setPhase("done") : openChat(0)}>
              <img src="/tars-avatar.png" alt="Tars" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
      </div>
    </BrowserFrame>
  );
}

/* ══════════════════════════════════════════════════════════
   CONCEPT B — Live Prompt Rotator
   ══════════════════════════════════════════════════════════ */
const ROTATOR_PROMPTS = ["Comparing plans?", "Need help choosing?", "Got questions?", "Curious about pricing?"];

function LivePromptVariant() {
  const [promptIdx, setPromptIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [flow, setFlow] = useState<"idle" | "chatting">("idle");
  const [thinkingStep, setThinkingStep] = useState(0);
  const [panelDone, setPanelDone] = useState(false);

  useEffect(() => {
    if (flow !== "idle") return;
    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPromptIdx(i => (i + 1) % ROTATOR_PROMPTS.length);
        setVisible(true);
      }, 400);
    }, 2800);
    return () => clearInterval(cycle);
  }, [flow]);

  useEffect(() => {
    if (flow !== "chatting") return;
    if (thinkingStep >= THINKING_EVENTS.length) { setPanelDone(true); return; }
    const t = setTimeout(() => setThinkingStep(s => s + 1), 900);
    return () => clearTimeout(t);
  }, [flow, thinkingStep]);

  const openChat = () => {
    setFlow("chatting");
    setThinkingStep(0);
    setPanelDone(false);
  };

  return (
    <BrowserFrame url="acme.com/pricing" height={580}>
      <style>{`
        @keyframes prompt-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes prompt-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-5px); } }
        @keyframes rotator-panel { from { opacity: 0; transform: translateY(14px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      <div className="h-full flex flex-col relative overflow-hidden" style={{ backgroundColor: SKEL_BG }}>
        <SkeletonNav />
        <SkeletonPricingHeader />
        <div className="grid grid-cols-3 gap-5 px-10">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-[16px] border bg-white p-5 flex flex-col gap-3"
              style={{ borderColor: i === 1 ? ACCENT : LINE, boxShadow: i === 1 ? `0 0 0 2px ${ACCENT}` : undefined }}>
              <Skel w={60} h={16} />
              <Skel w={80} h={32} />
              {[90, 75, 85, 60].map((w, j) => <Skel key={j} w={`${w}%`} h={12} />)}
              <Skel w="100%" h={36} r={8} />
            </div>
          ))}
        </div>

        {/* chat panel */}
        {flow === "chatting" && (
          <div className="absolute z-40 rounded-[16px] border bg-white overflow-hidden flex flex-col"
            style={{ bottom: 72, right: 24, width: 320, borderColor: LINE, boxShadow: "0 12px 40px -8px rgba(0,0,0,0.18)", animation: "rotator-panel 380ms cubic-bezier(0.22,1,0.36,1) both" }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: LINE }}>
              <div className="flex items-center gap-2.5">
                <img src="/tars-avatar.png" alt="" className="size-7 rounded-full object-cover" />
                <p className="text-[14px] font-semibold" style={{ color: INK }}>AI Assistant</p>
              </div>
              <button className="rounded-[6px] p-1" style={{ color: MUTED }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = SUBTLE)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => setFlow("idle")}>
                <ChevronDown className="size-4" strokeWidth={2} />
              </button>
            </div>
            <div className="flex flex-col gap-3 px-4 py-4 overflow-y-auto scrollbar-subtle" style={{ maxHeight: 280 }}>
              <div className="flex justify-end">
                <div className="rounded-[12px] rounded-br-[3px] px-3.5 py-2.5 text-[13px] leading-relaxed text-white"
                  style={{ backgroundColor: ACCENT, maxWidth: 240 }}>
                  {ROTATOR_PROMPTS[promptIdx]}
                </div>
              </div>
              <ThinkingEvents step={thinkingStep} />
              {panelDone && (
                <p className="text-[13px] leading-relaxed px-1" style={{ color: INK }}>
                  {STARTER_RESPONSES[0].split(" ").map((w, i) => (
                    <span key={i} className="inline-block"
                      style={{ animation: "word-in 320ms cubic-bezier(0.2,0.6,0.2,1) both", animationDelay: `${i * 40}ms` }}>
                      {w}&nbsp;
                    </span>
                  ))}
                </p>
              )}
            </div>
            <div className="px-4 pb-4 shrink-0">
              <div className="flex items-center gap-2 rounded-[9px] border px-3 py-2.5" style={{ borderColor: LINE }}>
                <input placeholder="Reply…" className="flex-1 bg-transparent text-[12px] outline-none" style={{ color: INK }} readOnly />
                <button className="size-6 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: ACCENT }}>
                  <ArrowUp className="size-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* rotator pill */}
        {flow === "idle" && (
          <button
            className="absolute z-30 bottom-6 right-6 flex items-center gap-2.5 rounded-full border bg-white px-5 py-3"
            style={{ borderColor: LINE, boxShadow: "0 4px 18px -4px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)", minWidth: 200 }}
            onClick={openChat}
            onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.boxShadow = "0 6px 22px -4px rgba(0,0,0,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = LINE; e.currentTarget.style.boxShadow = "0 4px 18px -4px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)"; }}
          >
            <Sparkles className="size-3.5 shrink-0" style={{ color: ACCENT }} strokeWidth={1.75} />
            <span className="text-[13px] font-medium flex-1 text-left overflow-hidden"
              style={{ color: INK, animation: visible ? "prompt-in 320ms ease both" : "prompt-out 320ms ease both" }}>
              {ROTATOR_PROMPTS[promptIdx]}
            </span>
            <span className="text-[13px] shrink-0" style={{ color: MUTED }}>›</span>
          </button>
        )}
      </div>
    </BrowserFrame>
  );
}



/* ══════════════════════════════════════════════════════════
   VARIANT 5 — FAB Greeting
   ══════════════════════════════════════════════════════════ */
const FAB_OPTIONS = ["General Assistance", "Request a service", "Connect with representative", "Other questions"];

function FABGreetingVariant() {
  const [phase, setPhase] = useState<"idle" | "open" | "chatting">("idle");

  useEffect(() => {
    const t = setTimeout(() => setPhase("open"), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <BrowserFrame url="acme.com" height={580}>
      <div className="h-full flex flex-col relative overflow-hidden" style={{ backgroundColor: SKEL_BG }}>
        <SkeletonNav />
        <SkeletonHero />

        {/* FAB + overlay */}
        <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3">

          {/* greeting + options */}
          {phase === "open" && (
            <>
              {/* greeting card */}
              <div
                className="rounded-[16px] bg-white px-4 py-3.5 text-[14px] leading-snug"
                style={{
                  color: INK,
                  maxWidth: 230,
                  boxShadow: "0 4px 20px -4px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                  animation: "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both",
                }}
              >
                Hello, how can we assist you today? 👋
              </div>

              {/* staggered option buttons */}
              <div className="flex flex-col gap-2 items-end">
                {FAB_OPTIONS.map((opt, i) => (
                  <button
                    key={opt}
                    className="rounded-full border bg-white px-4 py-2 text-[12px] font-medium whitespace-nowrap"
                    style={{
                      borderColor: ACCENT,
                      color: INK,
                      animation: "option-in 280ms cubic-bezier(0.2,0.6,0.2,1) both",
                      animationDelay: `${80 + i * 60}ms`,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = SKEL_BG; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "white"; }}
                    onClick={() => setPhase("chatting")}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* chat panel */}
          {phase === "chatting" && (
            <div
              className="rounded-[16px] border bg-white overflow-hidden flex flex-col"
              style={{
                width: 320,
                height: 420,
                borderColor: LINE,
                boxShadow: "0 8px 32px -6px rgba(0,0,0,0.16)",
                animation: "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both",
              }}
            >
              {/* header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b shrink-0"
                style={{ borderColor: LINE }}
              >
                <div className="flex items-center gap-2.5">
                  <img src="/tars-avatar.png" alt="" className="size-7 rounded-full object-cover" />
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: INK }}>Tars</p>
                    <p className="text-[10px]" style={{ color: MUTED }}>● Online</p>
                  </div>
                </div>
                <button onClick={() => setPhase("open")}>
                  <X className="size-4" style={{ color: MUTED }} strokeWidth={2} />
                </button>
              </div>
              {/* messages */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4">
                <div
                  className="rounded-[10px] rounded-tl-[3px] px-3 py-2.5 text-[12px] leading-relaxed"
                  style={{ backgroundColor: PAPER, border: `1px solid ${LINE}`, color: INK, maxWidth: 240 }}
                >
                  Sure! I'm here to help. What would you like to know?
                </div>
              </div>
              {/* composer */}
              <div className="px-4 pb-4 shrink-0">
                <div
                  className="flex items-center gap-2 rounded-[9px] border px-3 py-2.5"
                  style={{ borderColor: LINE, backgroundColor: "#FFFDFA" }}
                >
                  <input
                    placeholder="Type a message…"
                    className="flex-1 bg-transparent text-[12px] outline-none"
                    style={{ color: INK }}
                  />
                  <button
                    className="size-6 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: ACCENT }}
                  >
                    <Send className="size-3" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FAB */}
          <button
            className="size-14 rounded-full flex items-center justify-center text-white shrink-0"
            style={{
              backgroundColor: ACCENT,
              boxShadow: "0 4px 20px -4px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.12)",
            }}
            onClick={() => setPhase((p) => p === "idle" || p === "chatting" ? "open" : "idle")}
          >
            {phase === "open"
              ? <X className="size-5" strokeWidth={2} />
              : <MessageCircle className="size-6" strokeWidth={1.75} />
            }
          </button>
        </div>
      </div>
    </BrowserFrame>
  );
}

/* ══════════════════════════════════════════════════════════
   VARIANT 6 — Ghost Typing
   ══════════════════════════════════════════════════════════ */
const GHOST_MSG = "Need help finding the right plan?";

function GhostTypingVariant() {
  const [phase, setPhase] = useState<"cursor" | "typing" | "done" | "chat">("cursor");
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPhase("typing"), 1800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "typing") return;
    if (typed >= GHOST_MSG.length) { setPhase("done"); return; }
    const t = setTimeout(() => setTyped((n) => n + 1), 55);
    return () => clearTimeout(t);
  }, [phase, typed]);

  return (
    <BrowserFrame url="acme.com" height={580}>
      <style>{`
        @keyframes ghost-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .ghost-cursor { animation: ghost-blink 1s step-end infinite; font-weight: 300; }
        @keyframes ghost-cta-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <div className="h-full flex flex-col relative overflow-hidden" style={{ backgroundColor: SKEL_BG, userSelect: "none" }}>
        <SkeletonNav />
        <SkeletonHero />

        {/* ghost element */}
        {phase !== "chat" && (
          <div className="absolute flex flex-col items-end gap-2" style={{ right: 32, bottom: 40 }}>
            {/* text + cursor */}
            <div style={{ minHeight: 28 }}>
              {phase === "cursor" && (
                <span className="ghost-cursor text-[17px] font-light" style={{ color: INK }}>|</span>
              )}
              {(phase === "typing" || phase === "done") && (
                <p className="text-[15px] font-medium leading-snug text-right" style={{ color: INK, maxWidth: 240 }}>
                  {GHOST_MSG.slice(0, typed)}
                  {phase === "typing" && <span className="ghost-cursor" style={{ color: ACCENT }}>|</span>}
                </p>
              )}
            </div>

            {/* CTA — appears after typing */}
            {phase === "done" && (
              <button
                className="text-[13px] font-semibold"
                style={{ color: ACCENT, animation: "ghost-cta-in 300ms ease both" }}
                onClick={() => setPhase("chat")}
              >
                Chat with us →
              </button>
            )}

          </div>
        )}

        {/* chat panel — appears after CTA click */}
        {phase === "chat" && (
          <div
            className="absolute rounded-[16px] border bg-white overflow-hidden flex flex-col"
            style={{
              right: 32,
              bottom: 32,
              width: 300,
              height: 380,
              borderColor: LINE,
              boxShadow: "0 8px 32px -6px rgba(0,0,0,0.16)",
              animation: "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both",
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: LINE }}>
              <div className="flex items-center gap-2.5">
                <img src="/tars-avatar.png" alt="" className="size-7 rounded-full object-cover" />
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: INK }}>Tars</p>
                  <p className="text-[10px]" style={{ color: MUTED }}>● Online</p>
                </div>
              </div>
              <button onClick={() => { setPhase("done"); }}>
                <X className="size-4" style={{ color: MUTED }} strokeWidth={2} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4">
              <div className="rounded-[10px] rounded-tl-[3px] px-3 py-2.5 text-[12px] leading-relaxed"
                style={{ backgroundColor: PAPER, border: `1px solid ${LINE}`, color: INK, maxWidth: 220 }}>
                Hi! 👋 Happy to help you find the right plan. What matters most to you?
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Pricing", "Features", "Enterprise"].map((o) => (
                  <button key={o} className="rounded-full border px-3 py-1 text-[11px]"
                    style={{ borderColor: LINE, backgroundColor: PAPER, color: INK }}>{o}</button>
                ))}
              </div>
            </div>
            <div className="px-4 pb-4 shrink-0">
              <div className="flex items-center gap-2 rounded-[9px] border px-3 py-2.5"
                style={{ borderColor: LINE, backgroundColor: "#FFFDFA" }}>
                <input placeholder="Type a message…" className="flex-1 bg-transparent text-[12px] outline-none" style={{ color: INK }} />
                <button className="size-6 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: ACCENT }}>
                  <Send className="size-3" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BrowserFrame>
  );
}

/* ══════════════════════════════════════════════════════════
   VARIANT 7 — Draggable FAB
   ══════════════════════════════════════════════════════════ */
function DraggableFABVariant() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabPos, setFabPos] = useState({ x: 640, y: 460 });
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const dragRef = useRef({ active: false, mouseX: 0, mouseY: 0, fabX: 0, fabY: 0, moved: false });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.mouseX;
      const dy = e.clientY - dragRef.current.mouseY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const R = 28;
      setFabPos({
        x: Math.max(R, Math.min(rect.width - R, dragRef.current.fabX + dx)),
        y: Math.max(R, Math.min(rect.height - R, dragRef.current.fabY + dy)),
      });
    };
    const onUp = () => { dragRef.current.active = false; setIsDragging(false); };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { active: true, mouseX: e.clientX, mouseY: e.clientY, fabX: fabPos.x, fabY: fabPos.y, moved: false };
    setIsDragging(true);
    setHovered(false);
  };

  const onFABClick = () => {
    if (dragRef.current.moved) return;
    setChatOpen((v) => !v);
  };

  const showAbove = fabPos.y > 200;
  const popupStyle = showAbove
    ? { bottom: "calc(100% + 12px)" }
    : { top: "calc(100% + 12px)" };

  return (
    <BrowserFrame url="acme.com" height={580}>
      <div
        ref={containerRef}
        className="h-full flex flex-col relative overflow-hidden"
        style={{ backgroundColor: SKEL_BG, userSelect: "none" }}
      >
        <SkeletonNav />
        <SkeletonHero />

        {/* FAB + popup anchor */}
        <div
          className="absolute"
          style={{ left: fabPos.x - 28, top: fabPos.y - 28, zIndex: 50 }}
        >
          {/* hover preview */}
          {hovered && !isDragging && !chatOpen && (
            <div
              className="absolute right-0 rounded-[14px] border bg-white p-4"
              style={{
                ...popupStyle,
                width: 220,
                borderColor: LINE,
                boxShadow: "0 8px 24px -6px rgba(0,0,0,0.14)",
                animation: "bubble-in 200ms cubic-bezier(0.2,0.6,0.2,1) both",
              }}
            >
              <p className="text-[13px] font-semibold mb-1" style={{ color: INK }}>👋 Hi there!</p>
              <p className="text-[12px] mb-3" style={{ color: MUTED }}>How can I help you today?</p>
              <button
                className="w-full rounded-[8px] py-2 text-[12px] font-semibold text-white"
                style={{ backgroundColor: ACCENT }}
                onClick={() => { setChatOpen(true); setHovered(false); }}
              >
                Start chat →
              </button>
            </div>
          )}

          {/* chat panel */}
          {chatOpen && (
            <div
              className="absolute right-0 rounded-[16px] border bg-white overflow-hidden flex flex-col"
              style={{
                ...popupStyle,
                width: 300,
                height: 380,
                borderColor: LINE,
                boxShadow: "0 8px 32px -6px rgba(0,0,0,0.16)",
                animation: "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both",
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: LINE }}>
                <div className="flex items-center gap-2.5">
                  <img src="/tars-avatar.png" alt="" className="size-7 rounded-full object-cover" />
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: INK }}>Tars</p>
                    <p className="text-[10px]" style={{ color: MUTED }}>● Online</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)}>
                  <X className="size-4" style={{ color: MUTED }} strokeWidth={2} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 px-4 py-4">
                <div
                  className="rounded-[10px] rounded-tl-[3px] px-3 py-2.5 text-[12px] leading-relaxed"
                  style={{ backgroundColor: PAPER, border: `1px solid ${LINE}`, color: INK, maxWidth: 220 }}
                >
                  Hi! 👋 How can I help you today?
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["General Assistance", "Request a service", "Other questions"].map((o) => (
                    <button key={o} className="rounded-full border px-3 py-1 text-[11px]" style={{ borderColor: LINE, backgroundColor: PAPER, color: INK }}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div className="px-4 pb-4 shrink-0">
                <div className="flex items-center gap-2 rounded-[9px] border px-3 py-2.5" style={{ borderColor: LINE, backgroundColor: "#FFFDFA" }}>
                  <input placeholder="Type a message…" className="flex-1 bg-transparent text-[12px] outline-none" style={{ color: INK }} />
                  <button className="size-6 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: ACCENT }}>
                    <Send className="size-3" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FAB */}
          <button
            className="size-14 rounded-full flex items-center justify-center text-white"
            style={{
              backgroundColor: ACCENT,
              cursor: "pointer",
              boxShadow: isDragging
                ? "0 12px 32px -4px rgba(0,0,0,0.32)"
                : "0 4px 20px -4px rgba(0,0,0,0.28), 0 2px 8px rgba(0,0,0,0.12)",
              transition: isDragging ? "none" : "box-shadow 150ms ease",
            }}
            onMouseEnter={() => { if (!isDragging) setHovered(true); }}
            onMouseLeave={() => setHovered(false)}
            onClick={onFABClick}
          >
            <div className="flex flex-col items-center gap-1.5">
              {chatOpen
                ? <X className="size-5" strokeWidth={2} />
                : <MessageCircle className="size-5" strokeWidth={1.75} />}
              {/* 6-dot drag handle inside FAB */}
              <div
                title="Drag to reposition"
                style={{ cursor: isDragging ? "grabbing" : "grab", opacity: 0.55, lineHeight: 0 }}
                onMouseDown={(e) => { e.stopPropagation(); onMouseDown(e); }}
              >
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  {[0, 5].map((y) =>
                    [0, 5, 10].map((x) => (
                      <circle key={`${x}-${y}`} cx={x + 2} cy={y + 2} r="1.5" fill="white" />
                    ))
                  )}
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </BrowserFrame>
  );
}

/* ══════════════════════════════════════════════════════════
   VARIANT — Walking Buddy
   ══════════════════════════════════════════════════════════ */
const ROBO_SHELL = "#C4A1E8";   // light-purple shell (head, hands, feet)
const ROBO_DARK = "#3B2E5A";    // joints, legs, frames, antenna
const ROBO_SCREEN = "#2A2147";  // face screen
const ROBO_YELLOW = "#FFD23F";  // eyes
const ROBO_SILVER = "#CFC6DD";  // ear discs
const ROBO_BALL = "#2B2B2B";    // antenna tip

/* a tiny robot head — reused as the chat-panel avatar */
function BuddyFace({ size = 28 }: { size?: number }) {
  const s = size;
  return (
    <div className="relative shrink-0" style={{ width: s, height: s }}>
      {/* antenna */}
      <span style={{ position: "absolute", top: 0, left: "50%", marginLeft: -1, width: 2, height: s * 0.18, backgroundColor: ROBO_DARK }} />
      <span style={{ position: "absolute", top: -1, left: "50%", marginLeft: -2.5, width: 5, height: 5, borderRadius: "50%", backgroundColor: ROBO_BALL }} />
      {/* ear discs */}
      <span style={{ position: "absolute", top: "52%", left: 0, width: s * 0.12, height: s * 0.22, borderRadius: 2, backgroundColor: ROBO_SILVER }} />
      <span style={{ position: "absolute", top: "52%", right: 0, width: s * 0.12, height: s * 0.22, borderRadius: 2, backgroundColor: ROBO_SILVER }} />
      {/* head */}
      <div style={{ position: "absolute", bottom: 0, left: "50%", marginLeft: -(s * 0.45), width: s * 0.9, height: s * 0.78, borderRadius: s * 0.24, backgroundColor: ROBO_SHELL }}>
        {/* face screen */}
        <div style={{ position: "absolute", top: "20%", left: "16%", right: "16%", bottom: "16%", borderRadius: s * 0.14, backgroundColor: ROBO_SCREEN }}>
          <span style={{ position: "absolute", top: "26%", left: "20%", width: s * 0.15, height: s * 0.15, borderRadius: "50%", backgroundColor: ROBO_YELLOW }} />
          <span style={{ position: "absolute", top: "26%", right: "20%", width: s * 0.15, height: s * 0.15, borderRadius: "50%", backgroundColor: ROBO_YELLOW }} />
        </div>
      </div>
    </div>
  );
}

const BUDDY_CHIPS = ["Help me choose a plan", "Talk to a human", "Just browsing"];

function WalkingBuddyVariant() {
  const [phase, setPhase] = useState<"walking" | "chatting">("walking");
  const [hovered, setHovered] = useState(false);

  const isChatting = phase === "chatting";
  // locomotion (glide, bob, shadow) freezes when you hover or open chat…
  const play: "paused" | "running" = isChatting || hovered ? "paused" : "running";
  // …but blinking / glancing stay alive so a paused buddy still feels awake.
  const idlePlay: "paused" | "running" = isChatting ? "paused" : "running";

  // Position + facing are driven from one rAF loop so the face ALWAYS leads the
  // direction of travel (two independent CSS timelines were drifting out of sync).
  const walkerRef = useRef<HTMLDivElement>(null);
  const facerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  useEffect(() => {
    pausedRef.current = isChatting || hovered;
  }, [isChatting, hovered]);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    let x = 0;
    let dir = -1; // +1 = moving right (face right), -1 = moving left (face left)
    let started = false;
    const SPEED = 30; // px per second
    const tick = (ts: number) => {
      const el = walkerRef.current;
      const facer = facerRef.current;
      const frame = el?.parentElement;
      if (el && facer && frame) {
        const pw = frame.clientWidth;
        const right = pw - 74; // right end of the patrol band
        const left = pw - 300; // left end of the patrol band
        if (!started) {
          x = right;
          dir = -1;
          started = true;
        }
        // set every frame so a React re-render (e.g. asset onError) can't re-hide it
        el.style.visibility = "visible";
        const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
        last = ts;
        if (!pausedRef.current) {
          x += dir * SPEED * dt;
          if (x <= left) {
            x = left;
            dir = 1;
          } else if (x >= right) {
            x = right;
            dir = -1;
          }
        }
        el.style.transform = `translateX(${x}px)`;
        // the character art faces right by default; mirror it when heading left
        facer.style.transform = `scaleX(${dir > 0 ? 1 : -1})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <BrowserFrame url="acme.com" height={580}>
      <style>{`
        /* calm float — gentle continuous bob, then an occasional little hop (anticipate → stretch → squash land) */
        @keyframes wb-floaty    { 0% { transform: translateY(0) scaleY(1); } 12% { transform: translateY(-3px) scaleY(1); } 25% { transform: translateY(0) scaleY(1); } 37% { transform: translateY(-3px) scaleY(1); } 50% { transform: translateY(0) scaleY(1); } 62% { transform: translateY(-3px) scaleY(1); } 72% { transform: translateY(1px) scaleY(0.96); } 80% { transform: translateY(-11px) scaleY(1.06); } 89% { transform: translateY(0) scaleY(0.92); } 94% { transform: translateY(0) scaleY(1.01); } 100% { transform: translateY(0) scaleY(1); } }
        /* loose idle sway for dangling limbs */
        @keyframes wb-dangle    { 0%,100% { transform: rotate(6deg); } 50% { transform: rotate(-6deg); } }
        /* walk cycle: legs alternate (opposite phase), arms inverted-sign for a contralateral gait */
        @keyframes wb-step-a    { 0%,100% { transform: rotate(24deg); } 50% { transform: rotate(-24deg); } }
        @keyframes wb-step-b    { 0%,100% { transform: rotate(-24deg); } 50% { transform: rotate(24deg); } }
        @keyframes wb-arm-swing { 0%,100% { transform: rotate(-20deg); } 50% { transform: rotate(20deg); } }
        /* gentle walk bob — two contacts per stride */
        @keyframes wb-walkbob   { 0%,100% { transform: translateY(0) scaleY(1); } 25% { transform: translateY(-2px) scaleY(1.02); } 50% { transform: translateY(0) scaleY(0.99); } 75% { transform: translateY(-2px) scaleY(1.02); } }
        @keyframes wb-walkshadow{ 0%,100% { transform: translateX(-50%) scaleX(1); opacity: .2; } 25% { transform: translateX(-50%) scaleX(0.86); opacity: .14; } 50% { transform: translateX(-50%) scaleX(1); opacity: .2; } 75% { transform: translateX(-50%) scaleX(0.86); opacity: .14; } }
        /* every 5s the head squashes thin, swaps to a front-facing face, holds, then turns back */
        @keyframes wb-headturn  { 0%,34% { transform: scaleX(1); } 41% { transform: scaleX(0.5); } 46%,60% { transform: scaleX(1); } 65% { transform: scaleX(0.5); } 70%,100% { transform: scaleX(1); } }
        @keyframes wb-faceside  { 0%,40% { opacity: 1; } 43%,63% { opacity: 0; } 66%,100% { opacity: 1; } }
        @keyframes wb-facefront { 0%,40% { opacity: 0; } 43%,63% { opacity: 1; } 66%,100% { opacity: 0; } }
        @keyframes wb-wave-hi   { 0% { transform: rotate(150deg); } 50% { transform: rotate(178deg); } 100% { transform: rotate(150deg); } }
        /* occasional blink + idle glance */
        @keyframes wb-blink     { 0%,93%,100% { transform: scaleY(1); } 96% { transform: scaleY(0.12); } }
        @keyframes wb-look      { 0%,34% { transform: translateX(0); } 46%,66% { transform: translateX(1.6px); } 80%,100% { transform: translateX(0); } }
        @keyframes wb-shadow    { 0%,70%,100% { transform: translateX(-50%) scaleX(1); opacity: .2; } 80% { transform: translateX(-50%) scaleX(0.66); opacity: .1; } 90% { transform: translateX(-50%) scaleX(1.06); opacity: .24; } }
        @keyframes wb-bubble  { from { opacity: 0; transform: translate(-50%, 6px) scale(0.92); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
        @keyframes wb-panel   { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes robot-nod  { 0%,100% { transform: rotate(4deg); } 50% { transform: rotate(7.5deg); } }
        @keyframes robot-glow { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
      `}</style>

      <div className="h-full flex flex-col relative overflow-hidden" style={{ backgroundColor: SKEL_BG }}>
        <SkeletonNav />
        <SkeletonHero />

        {/* ── WALKING CHARACTER ───────────────────────────────── */}
        <div
          ref={walkerRef}
          style={{
            position: "absolute",
            bottom: 16,
            left: 0,
            width: 58,
            height: 84,
            zIndex: 30,
          }}
        >
          {/* hover speech bubble — sibling of the flip wrapper so text never mirrors */}
          {hovered && phase === "walking" && (
            <div
              className="rounded-[12px] border bg-white px-3 py-1.5 text-[12px] font-medium"
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "50%",
                whiteSpace: "nowrap",
                color: INK,
                borderColor: LINE,
                boxShadow: "0 6px 18px -6px rgba(0,0,0,0.18)",
                animation: "wb-bubble 200ms ease both",
              }}
            >
              Hi! Chat with me 🤖
            </div>
          )}

          {/* facing-flip wrapper — the clickable character (scaleX set from JS) */}
          <div
            ref={facerRef}
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
              transformOrigin: "center",
              cursor: "pointer",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => setPhase("chatting")}
          >
            {/* ground shadow */}
            <div
              style={{
                position: "absolute",
                bottom: 1,
                left: "50%",
                width: 40,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#000",
                animation: "wb-walkshadow 0.7s ease-in-out infinite",
                animationPlayState: play,
              }}
            />

            {/* body — gentle float + occasional hop (side profile, faces right) */}
            <div
              style={{
                position: "absolute",
                bottom: 2,
                left: 0,
                width: "100%",
                height: 78,
                transformOrigin: "bottom center",
                animation: "wb-walkbob 0.7s ease-in-out infinite",
                animationPlayState: play,
              }}
            >
              {/* v2 walking robot — side profile, faces right (facer mirrors it when heading left) */}
              <svg width="58" height="84" viewBox="0 0 120 210" fill="none" preserveAspectRatio="xMidYMax meet"
                style={{ position: "absolute", left: 0, bottom: 0, overflow: "visible" }} aria-hidden>
                <defs>
                  <linearGradient id="wb-robot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8466E8" />
                    <stop offset="52%" stopColor="#4F86EE" />
                    <stop offset="100%" stopColor="#3FBAD8" />
                  </linearGradient>
                </defs>

                {/* back leg */}
                <g style={{ transformBox: "fill-box", transformOrigin: "50% 0%", animation: "wb-step-b 0.7s ease-in-out infinite", animationPlayState: play }}>
                  <rect x="53" y="150" width="10" height="48" rx="5" fill="#4C5059" />
                  <line x1="53.5" y1="162" x2="62.5" y2="162" stroke="#3A3D44" strokeWidth="1.6" />
                  <line x1="53.5" y1="171" x2="62.5" y2="171" stroke="#3A3D44" strokeWidth="1.6" />
                  <line x1="53.5" y1="180" x2="62.5" y2="180" stroke="#3A3D44" strokeWidth="1.6" />
                  <line x1="53.5" y1="189" x2="62.5" y2="189" stroke="#3A3D44" strokeWidth="1.6" />
                  <rect x="47" y="194" width="22" height="6" rx="3" fill="#34373E" />
                </g>

                {/* torso */}
                <rect x="45" y="82" width="32" height="70" rx="15" fill="#646874" stroke="#4C5059" strokeWidth="1.5" />
                <line x1="47" y1="106" x2="75" y2="106" stroke="#4C5059" strokeWidth="1.6" />
                <rect x="68" y="112" width="6" height="18" rx="2.5" fill="url(#wb-robot-grad)" style={{ animation: "robot-glow 1.8s ease-in-out infinite", animationPlayState: idlePlay }} />
                <circle cx="61" cy="150" r="8" fill="#34373E" />

                {/* front leg */}
                <g style={{ transformBox: "fill-box", transformOrigin: "50% 0%", animation: "wb-step-a 0.7s ease-in-out infinite", animationPlayState: play }}>
                  <rect x="59" y="150" width="10" height="48" rx="5" fill="#646874" />
                  <line x1="59.5" y1="162" x2="68.5" y2="162" stroke="#4C5059" strokeWidth="1.6" />
                  <line x1="59.5" y1="171" x2="68.5" y2="171" stroke="#4C5059" strokeWidth="1.6" />
                  <line x1="59.5" y1="180" x2="68.5" y2="180" stroke="#4C5059" strokeWidth="1.6" />
                  <line x1="59.5" y1="189" x2="68.5" y2="189" stroke="#4C5059" strokeWidth="1.6" />
                  <rect x="57" y="194" width="24" height="6" rx="3" fill="#3A3D44" />
                </g>

                {/* shoulder + arm (coiled limb with a claw) */}
                <circle cx="62" cy="92" r="6" fill="#34373E" />
                <g style={{ transformBox: "fill-box", transformOrigin: "50% 6%", animation: "wb-arm-swing 0.7s ease-in-out infinite", animationPlayState: play }}>
                  <rect x="58" y="94" width="8" height="44" rx="4" fill="#585C67" />
                  <line x1="58.5" y1="104" x2="65.5" y2="104" stroke="#3F424A" strokeWidth="1.5" />
                  <line x1="58.5" y1="111" x2="65.5" y2="111" stroke="#3F424A" strokeWidth="1.5" />
                  <line x1="58.5" y1="118" x2="65.5" y2="118" stroke="#3F424A" strokeWidth="1.5" />
                  <line x1="58.5" y1="125" x2="65.5" y2="125" stroke="#3F424A" strokeWidth="1.5" />
                  <line x1="58.5" y1="132" x2="65.5" y2="132" stroke="#3F424A" strokeWidth="1.5" />
                  <circle cx="62" cy="138" r="3.5" fill="#34373E" />
                  <path d="M59 140 q-4 4 -3 9 M62 142 q-1 4 -1 8 M65 140 q4 4 3 9" stroke="#34373E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
                </g>

                {/* neck */}
                <rect x="55" y="74" width="12" height="12" rx="3.5" fill="#34373E" />

                {/* head + antenna — gentle nod */}
                <g style={{ transformBox: "fill-box", transformOrigin: "50% 100%", animation: "robot-nod 0.7s ease-in-out infinite", animationPlayState: play }}>
                  <path d="M60 22 C 56 11, 67 10, 65 4" stroke="#4C5059" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                  <circle cx="65" cy="3.5" r="3.6" fill="url(#wb-robot-grad)" style={{ animation: "robot-glow 1.5s ease-in-out infinite", animationPlayState: idlePlay }} />
                  <rect x="39" y="20" width="42" height="58" rx="20" fill="#646874" stroke="#4C5059" strokeWidth="1.5" />
                  <line x1="45" y1="35" x2="75" y2="35" stroke="#4C5059" strokeWidth="1.6" />
                  <circle cx="69" cy="46" r="6" fill="#F1F1F5" />
                  <circle cx="69" cy="46" r="6" fill="none" stroke="url(#wb-robot-grad)" strokeWidth="1.4" />
                  <circle cx="71" cy="44" r="2" fill="#FFFFFF" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* ── CHAT PANEL ──────────────────────────────────────── */}
        {phase === "chatting" && (
          <div
            className="absolute z-40 rounded-[16px] border bg-white overflow-hidden flex flex-col"
            style={{
              bottom: 20,
              right: 20,
              width: 320,
              borderColor: LINE,
              boxShadow: "0 12px 40px -8px rgba(0,0,0,0.18)",
              animation: "wb-panel 380ms cubic-bezier(0.22,1,0.36,1) both",
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: LINE }}>
              <div className="flex items-center gap-2.5">
                <BuddyFace size={28} />
                <div>
                  <p className="text-[14px] font-semibold leading-tight" style={{ color: INK }}>Buddy</p>
                  <p className="text-[10px]" style={{ color: "#16A34A" }}>● Online</p>
                </div>
              </div>
              <button
                className="rounded-[6px] p-1 transition-colors"
                style={{ color: MUTED }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = SUBTLE)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                onClick={() => setPhase("walking")}
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>

            <div className="flex flex-col gap-3 px-4 py-4 overflow-y-auto scrollbar-subtle" style={{ maxHeight: 280 }}>
              <div
                className="rounded-[12px] rounded-tl-[3px] px-3.5 py-2.5 text-[13px] leading-relaxed self-start"
                style={{ backgroundColor: "#E8F5FD", border: `1px solid ${ROBO_SHELL}`, color: INK, maxWidth: 240 }}
              >
                Hi! I&apos;m Buddy 🤖 I was just strolling by — need a hand with anything?
              </div>
              <div className="flex flex-wrap gap-1.5">
                {BUDDY_CHIPS.map((o) => (
                  <button
                    key={o}
                    className="rounded-full border px-3 py-1 text-[11px] transition-colors"
                    style={{ borderColor: ROBO_SHELL, backgroundColor: "white", color: INK }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E8F5FD")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 pb-4 pt-1 shrink-0">
              <div className="flex items-center gap-2 rounded-[12px] border px-3 py-2.5" style={{ borderColor: LINE, backgroundColor: CANVAS }}>
                <input placeholder="Say hi…" className="flex-1 min-w-0 bg-transparent text-[12px] outline-none" style={{ color: INK }} />
                <button
                  className="size-7 rounded-[8px] flex items-center justify-center text-white shrink-0 transition-colors"
                  style={{ backgroundColor: ROBO_DARK }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ROBO_SCREEN)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ROBO_DARK)}
                >
                  <ArrowUp className="size-3.5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BrowserFrame>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════ */
const VARIANTS: {
  id: string;
  label: string;
  tagline: string;
  description: string;
  interactions: string[];
  notes: string;
  component: () => React.JSX.Element;
}[] = [
  {
    id: "walking-buddy",
    label: "Walking Buddy",
    tagline: "Cute character · paces the right side",
    description:
      "A small light-purple character paces back and forth along the right side of the page with a real walk cycle — swinging legs, bobbing body, turning its body to face whichever way it's heading. It IS the launcher: hover to pause it and read a friendly nudge, click to stop it in its tracks and open a chat window.",
    interactions: [
      "Watch the character pace along the right side",
      "Hover the character to pause it and see its speech bubble",
      "Click the character to open the chat window",
      "Close the chat (×) to send it strolling again",
    ],
    notes:
      "High-personality, playful entry point. Best for consumer, kids, or brand-forward sites where charm beats efficiency. Give it an idle timeout and a way to tuck into a corner so it never blocks content.",
    component: WalkingBuddyVariant,
  },
  {
    id: "centered-composer",
    label: "Centered Composer",
    tagline: "Floating search bar · center-bottom",
    description:
      "A pill-shaped composer bar floats at the bottom center of the page — like a persistent search bar, not a chat button. Clicking it surfaces 3 quick-start suggestions. Selecting one (or pressing send) opens a floating chat panel anchored above the bar.",
    interactions: [
      "Click the composer bar to reveal quick-start suggestions",
      "Click a suggestion to open the chat panel",
      "Click the chevron in the panel header to close it",
      "Click anywhere on the page to dismiss suggestions",
    ],
    notes: "Best for product marketing pages where you want chat always visible without a FAB. Works especially well on full-bleed hero sections.",
    component: CenteredComposerVariant,
  },
  {
    id: "corner-pill",
    label: "Corner Pill",
    tagline: "Compact pill · bottom-right",
    description:
      "A small pill-shaped composer bar floats in the bottom-right corner — like a persistent inline prompt. Clicking it surfaces quick-start suggestions. Selecting one opens a chat panel that rises above the pill, staying anchored to the right edge.",
    interactions: [
      "Click the pill to reveal quick-start suggestions",
      "Click a suggestion to open the chat panel",
      "Click the chevron in the panel header to close it",
      "Click anywhere on the page to dismiss suggestions",
    ],
    notes: "Great for product pages where a FAB feels too intrusive but you still want always-on access. The compact footprint keeps it out of the way.",
    component: CornerPillVariant,
  },
  {
    id: "sonar-orb",
    label: "Sonar Orb",
    tagline: "Proactive · spinning arc · context-aware",
    description:
      "A Tars avatar with a spinning arc halo sits in the corner. After 1.5s the AI proactively types a contextual message in a bubble beside it, then surfaces option chips to start a conversation.",
    interactions: ["Wait 1.5s for the AI bubble to appear", "Watch the message type out", "Click an option chip to open chat", "Click the orb to open chat directly"],
    notes: "Feels alive without being intrusive. The spinning arc signals AI presence without a blinking badge or notification dot.",
    component: SonarOrbVariant,
  },
  {
    id: "live-prompt",
    label: "Live Prompt Rotator",
    tagline: "Cycling questions · always relevant",
    description:
      "A compact pill in the bottom-right corner cycles through contextual questions with a smooth fade animation — 'Comparing plans?', 'Need help choosing?', 'Got questions?' — on a loop. Click to instantly open chat with that question.",
    interactions: ["Watch the pill cycle through questions", "Click the pill to open chat with the current question", "Click the chevron to close"],
    notes: "Great for pages where the user's intent is ambiguous. The rotating prompts act as gentle reminders without occupying permanent space.",
    component: LivePromptVariant,
  },
  {
    id: "fab-greeting",
    label: "FAB Greeting",
    tagline: "Floating button · greeting + options",
    description:
      "A round FAB in the bottom-right corner auto-reveals a greeting card and staggered quick-start options after 1 second. Selecting an option opens a full chat panel. The FAB toggles the panel open/closed.",
    interactions: ["Wait 1s for the greeting to appear", "Click an option to open chat", "Click the × or FAB to close"],
    notes: "Classic pattern for marketing and support sites. Pair with exit-intent rules to re-surface after dismiss.",
    component: FABGreetingVariant,
  },
  {
    id: "ghost-typing",
    label: "Ghost Typing",
    tagline: "No button · text appears directly on page",
    description:
      "A blinking cursor sits quietly in a corner. After a brief pause, the AI begins typing a message directly onto the page — no bubble, no widget chrome. Clicking 'Chat with us' opens a panel.",
    interactions: ["Wait ~2s for the cursor to start typing", "Click 'Chat with us →' after the message appears", "Drag the 6-dot handle to reposition"],
    notes: "High novelty, low ambient noise. Best on editorial or product pages where a FAB would feel out of place.",
    component: GhostTypingVariant,
  },
  {
    id: "draggable-fab",
    label: "Draggable FAB",
    tagline: "Drag anywhere · hover to preview",
    description:
      "A floating chat button the user can drag to any position on the page. Hovering reveals a mini greeting card with a 'Start chat' CTA. Clicking opens a compact chat panel anchored to the button.",
    interactions: ["Drag the button anywhere on the page", "Hover the button to see the greeting preview", "Click 'Start chat' or the button to open chat"],
    notes: "Useful when the default FAB position conflicts with page content. Persists position in sessionStorage in production.",
    component: DraggableFABVariant,
  },
  {
    id: "contextual",
    label: "Contextual Trigger",
    tagline: "Inline · anchored to content",
    description:
      "A small \"Is this right for me?\" link lives inside specific content blocks — pricing cards, feature rows, spec tables. Clicking opens a popover anchored to that element. Zero ambient presence; shows up exactly where intent peaks.",
    interactions: ['Click "Is this right for me?" on any pricing card', "Dismiss with the × in the popover corner", "Try all three cards — each gives a different answer"],
    notes: "Opt-in per component. No global widget required. Best for docs, feature tables, and pricing pages.",
    component: ContextualVariant,
  },
  {
    id: "nudge",
    label: "Proactive Nudge",
    tagline: "Rule-triggered · one-shot",
    description:
      "A toast-shaped card that slides in after a rule fires (time on page, scroll depth, or exit intent). Richer than the tease bubble — carries a contextual message, two CTAs, and a dismiss. One-shot per session.",
    interactions: ["Wait for the nudge to auto-appear (1s timer)", 'Click "Yes, help me choose" to open chat', "Use Replay to re-trigger"],
    notes: "Best for marketing and landing pages. Never replay after dismiss — it trains users to ignore it.",
    component: NudgeVariant,
  },
  {
    id: "edge-tab",
    label: "Edge Tab",
    tagline: "Fixed right edge · side panel",
    description:
      "A vertical pill tab fixed to the right edge of the viewport. On click, a 300px panel slides in from the right — the tab disappears and the panel's header becomes the close handle. Common in SaaS dashboards where a FAB would cover content.",
    interactions: ["Click the AI Help tab on the right edge to open the panel", "Click the × in the panel header to close it", "Try the quick-reply chips inside the panel"],
    notes: "Ideal for authenticated app contexts (dashboards, admin panels). Swap to footer-bar on mobile — the tab is too narrow to tap.",
    component: EdgeTabVariant,
  },
];

export default function LauncherVariantsPage() {
  const [activeId, setActiveId] = useState("walking-buddy");
  const active = VARIANTS.find((v) => v.id === activeId)!;
  const ActiveComponent = active.component;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFDFA" }}>
      {/* page header */}
      <header
        className="sticky top-0 z-20 border-b backdrop-blur"
        style={{ borderColor: LINE, backgroundColor: "rgba(255,253,250,0.92)" }}
      >
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <div className="flex items-baseline gap-3">
            <a
              href="/design-system/components/launcher"
              className="text-[12px] transition-colors"
              style={{ color: MUTED }}
              onMouseEnter={(e) => (e.currentTarget.style.color = INK)}
              onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
            >
              ← Launcher
            </a>
            <span style={{ color: "#D9D5CC" }}>/</span>
            <span className="text-[12px] font-semibold" style={{ color: INK }}>
              Entry-Point Variants
            </span>
          </div>
          <p className="text-[11px]" style={{ color: MUTED }}>
            Click inside any preview to interact
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-10">
        {/* title */}
        <div className="mb-8 max-w-[640px]">
          <p
            className="text-[11px] font-medium tracking-wider uppercase"
            style={{ color: MUTED }}
          >
            Exploration
          </p>
          <h1
            className="mt-2 text-[32px] font-semibold leading-tight tracking-tight"
            style={{ color: INK }}
          >
            Entry-Point Variants
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "#555" }}>
            Five alternatives to the floating chat bubble — each rendered at real website scale with live interactions.
            Pick one to take into the full component spec.
          </p>
        </div>

        {/* variant tabs */}
        <div
          className="flex items-center gap-1 rounded-[12px] border p-1 mb-8"
          style={{ borderColor: LINE, backgroundColor: "white" }}
        >
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              className="flex-1 rounded-[9px] px-4 py-2.5 text-[13px] font-medium transition-all"
              style={{
                backgroundColor: activeId === v.id ? ACCENT : "transparent",
                color: activeId === v.id ? "white" : MUTED,
                fontWeight: activeId === v.id ? 600 : 400,
              }}
              onClick={() => setActiveId(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* variant header */}
        <div className="mb-5 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-[20px] font-semibold" style={{ color: INK }}>
                {active.label}
              </h2>
              <span
                className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                style={{ backgroundColor: ACCENT_SOFT, color: ACCENT_INK }}
              >
                {active.tagline}
              </span>
            </div>
            <p className="text-[14px] leading-relaxed max-w-[680px]" style={{ color: MUTED }}>
              {active.description}
            </p>
          </div>
        </div>

        {/* live preview */}
        <ActiveComponent />

        {/* interaction guide + notes */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div
            className="rounded-[12px] border bg-white p-5"
            style={{ borderColor: LINE }}
          >
            <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: MUTED }}>
              What to click
            </p>
            <ul className="flex flex-col gap-2">
              {active.interactions.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[13px]" style={{ color: "#555" }}>
                  <span
                    className="size-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                    style={{ backgroundColor: ACCENT }}
                  >
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-[12px] border bg-white p-5"
            style={{ borderColor: LINE }}
          >
            <p className="text-[11px] font-semibold tracking-wider uppercase mb-3" style={{ color: MUTED }}>
              Guidance
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: "#555" }}>
              {active.notes}
            </p>
          </div>
        </div>
      </main>

      <footer
        className="mt-12 border-t py-8 mx-auto max-w-[1080px] px-8 flex items-center justify-between text-[12px]"
        style={{ borderColor: LINE, color: "#979797" }}
      >
        <a href="/design-system/components/launcher" className="transition-colors hover:text-[#333333]">
          ← Launcher
        </a>
        <a href="/design-system" className="transition-colors hover:text-[#333333]">
          Foundation →
        </a>
      </footer>
    </div>
  );
}
