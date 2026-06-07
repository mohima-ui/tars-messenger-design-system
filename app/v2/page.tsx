"use client";

import { useState, useEffect, useRef, Fragment, isValidElement, cloneElement, type ReactNode, type ReactElement } from "react";
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Download,
  Maximize2,
  Minimize2,
  Plus,
  Mic,
  ArrowUp,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  X,
  Sparkles,
  Database,
  ExternalLink,
  AudioLines,
  Loader2,
  Square,
} from "lucide-react";

/* ── streams any content (text, bold, citations) in word-by-word, like the home page ── */
const WORD_STEP_MS = 38;
function splitNodeIntoWords(node: ReactNode, counter: { current: number }, keyPrefix: string, baseDelay: number): ReactNode {
  if (node === null || node === undefined || typeof node === "boolean") return node;
  if (typeof node === "string") {
    return node.split(/(\s+)/).map((tok, i) => {
      if (tok === "") return null;
      if (/^\s+$/.test(tok)) return tok;
      const idx = counter.current++;
      return (
        <span key={`${keyPrefix}-w-${idx}-${i}`} className="inline-block will-change-transform"
          style={{ animation: `word-in 320ms cubic-bezier(0.2,0.6,0.2,1) ${baseDelay + idx * WORD_STEP_MS}ms both` }}>
          {tok}
        </span>
      );
    });
  }
  if (typeof node === "number") return node;
  if (Array.isArray(node)) {
    return node.map((child, i) => (
      <Fragment key={`${keyPrefix}-${i}`}>{splitNodeIntoWords(child, counter, `${keyPrefix}-${i}`, baseDelay)}</Fragment>
    ));
  }
  if (isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    if (element.props.children === undefined) {
      const idx = counter.current++;
      return (
        <span key={`${keyPrefix}-el-${idx}`} className="inline-block will-change-transform"
          style={{ animation: `word-in 320ms cubic-bezier(0.2,0.6,0.2,1) ${baseDelay + idx * WORD_STEP_MS}ms both` }}>
          {element}
        </span>
      );
    }
    return cloneElement(element, undefined, splitNodeIntoWords(element.props.children, counter, `${keyPrefix}-el`, baseDelay));
  }
  return node;
}
function Words({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return <>{splitNodeIntoWords(children, { current: 0 }, "w", delay)}</>;
}

/* counts the tokens Words will animate (each word + each inline element = 1) */
function countWords(node: ReactNode): number {
  if (typeof node === "string") return node.split(/\s+/).filter(Boolean).length;
  if (typeof node === "number") return 1;
  if (Array.isArray(node)) return node.reduce<number>((a, c) => a + countWords(c), 0);
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    return el.props.children === undefined ? 1 : countWords(el.props.children);
  }
  return 0;
}
/* ms a message takes to finish streaming, + a small gap before the next thing appears */
const streamMs = (node: ReactNode) => countWords(node) * WORD_STEP_MS + 360;

/* flattens a node to plain text (for copy / read-aloud) */
function getNodeText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (isValidElement(node)) return getNodeText((node as ReactElement<{ children?: ReactNode }>).props.children);
  return "";
}

/* cvc-bg-in / cvc-sparkle-spin live in the gallery file outside CornerPill — re-declared here */
function V4Keyframes() {
  return (
    <style>{`
      @keyframes cvc-bg-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes cvc-sparkle-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes fade-in { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: translateY(0); } }
    `}</style>
  );
}

/* ── design tokens + skeleton helpers (copied from the launcher gallery) ── */
const LINE = "rgba(0,0,0,0.10)";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT_INK = "#4348C7"; // darker indigo (hover/pressed)

/* hover-row icon button background (subtle gray) */
const SKEL_BG = "rgba(255,255,255,0.6)";

/* voice-input demo (mirrors the home page) */
const DEMO_TRANSCRIPT = "Can you tell me more about the Studio plan?";
const WAVEFORM_HEIGHTS = Array.from({ length: 26 }, (_, i) => {
  const seed = Math.sin(i * 0.45) * 0.35 + Math.sin(i * 1.7 + 1.2) * 0.45 + 0.55;
  return Math.max(0.18, Math.min(1, seed));
});

/* ── corner-pill conversation data + thinking events ── */
const COMPOSER_STARTERS = [
  "I want to talk to sales",
  "I need support",
  "I want to become a partner",
];

const STARTER_RESPONSES = [
  "Great — happy to connect you with our sales team. They can walk you through everything for your use case, live with a specialist.",
  "Got it — I'll set you up with one of our support specialists who can help you directly.",
  "Love that! Our partnerships team can get you started and share everything you need.",
];
const HELP_QUESTION = "Which of these options best describes how we can help?";
const HELP_OPTIONS = [
  "I'm an Enterprise Business",
  "I'm looking for events payment",
  "I'm an Independent Business",
];

const THINKING_EVENTS = [
  "Reading your question",
  "Searching knowledge base",
  "Checking recent context",
  "Drafting response",
];


const STUDIO_EVENTS = [
  "Looking up your company",
  "Matching to plan tiers",
  "Comparing pricing options",
];

const SCHEDULE_EVENTS = [
  "Verifying your timezone",
  "Checking team calendar",
  "Filtering open slots",
];

const BOOK_EVENTS = [
  "Locking the slot",
  "Creating calendar event",
  "Generating Meet link",
  "Sending invites",
];


function ThinkingEvents({ step, events = THINKING_EVENTS }: { step: number; events?: string[] }) {
  return (
    <div className="flex flex-col gap-1.5 px-1">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="ind-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8466E8" />
            <stop offset="52%" stopColor="#4F86EE" />
            <stop offset="100%" stopColor="#3FBAD8" />
          </linearGradient>
        </defs>
      </svg>
      {events.slice(0, step).map((label, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px] font-medium" style={{ color: "#FFFFFF" }}>
          <Check className="size-3 shrink-0" strokeWidth={2.5} stroke="url(#ind-grad)" />
          {label}
        </div>
      ))}
      {step < events.length && (
        <div className="flex items-center gap-2 text-[12px] font-medium" style={{ color: "#FFFFFF" }}>
          <Sparkles
            className="size-3.5 shrink-0"
            strokeWidth={1.75}
            stroke="url(#ind-grad)"
            style={{ animation: "cvc-sparkle-spin 2.4s linear infinite" }}
          />
          {events[step]}
        </div>
      )}
    </div>
  );
}

/* generic indicator — "AI is thinking" with a rotating sparkle (no event steps) */
function AiThinking() {
  return (
    <div className="flex items-center gap-2 px-1 text-[12px] font-medium" style={{ color: "#FFFFFF" }}>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="ind-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8466E8" />
            <stop offset="52%" stopColor="#4F86EE" />
            <stop offset="100%" stopColor="#3FBAD8" />
          </linearGradient>
        </defs>
      </svg>
      <Sparkles className="size-3.5 shrink-0" strokeWidth={1.75} stroke="url(#ind-grad)"
        style={{ animation: "cvc-sparkle-spin 2.4s linear infinite" }} />
      AI is thinking
    </div>
  );
}

/* ── Full-panel voice agent (ported from the home page) ── */
function VoiceAgentOverlay() {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden"
      style={{ animation: "voice-agent-in 260ms cubic-bezier(0.2,0.6,0.2,1) both" }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes voice-agent-in { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
        @keyframes robot-march { from { transform: translateX(-230px); } to { transform: translateX(230px); } }
        @keyframes robot-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes robot-step-a { 0%,100% { transform: rotate(20deg); } 50% { transform: rotate(-20deg); } }
        @keyframes robot-step-b { 0%,100% { transform: rotate(-20deg); } 50% { transform: rotate(20deg); } }
        @keyframes robot-armswing { 0%,100% { transform: rotate(-16deg); } 50% { transform: rotate(16deg); } }
        @keyframes robot-nod { 0%,100% { transform: rotate(4deg); } 50% { transform: rotate(7.5deg); } }
        @keyframes robot-glow { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
      `}} />

      {/* side-profile robot walking to the right (à la Machinarium) */}
      <div style={{ animation: "robot-march 7s linear infinite" }}>
       <div style={{ animation: "robot-bob 0.35s ease-in-out infinite" }}>
        <svg width="132" height="210" viewBox="0 0 120 210" fill="none" aria-hidden>
          <defs>
            <linearGradient id="robot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8466E8" />
              <stop offset="52%" stopColor="#4F86EE" />
              <stop offset="100%" stopColor="#3FBAD8" />
            </linearGradient>
          </defs>

          {/* ground shadow */}
          <ellipse cx="60" cy="204" rx="36" ry="5.5" fill="#000000" opacity="0.15" />

          {/* back leg */}
          <g style={{ transformBox: "fill-box", transformOrigin: "50% 0%", animation: "robot-step-b 0.7s ease-in-out infinite" }}>
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
          <rect x="68" y="112" width="6" height="18" rx="2.5" fill="url(#robot-grad)" style={{ animation: "robot-glow 1.8s ease-in-out infinite" }} />
          {/* hip joint */}
          <circle cx="61" cy="150" r="8" fill="#34373E" />

          {/* front leg */}
          <g style={{ transformBox: "fill-box", transformOrigin: "50% 0%", animation: "robot-step-a 0.7s ease-in-out infinite" }}>
            <rect x="59" y="150" width="10" height="48" rx="5" fill="#646874" />
            <line x1="59.5" y1="162" x2="68.5" y2="162" stroke="#4C5059" strokeWidth="1.6" />
            <line x1="59.5" y1="171" x2="68.5" y2="171" stroke="#4C5059" strokeWidth="1.6" />
            <line x1="59.5" y1="180" x2="68.5" y2="180" stroke="#4C5059" strokeWidth="1.6" />
            <line x1="59.5" y1="189" x2="68.5" y2="189" stroke="#4C5059" strokeWidth="1.6" />
            <rect x="57" y="194" width="24" height="6" rx="3" fill="#3A3D44" />
          </g>

          {/* shoulder joint */}
          <circle cx="62" cy="92" r="6" fill="#34373E" />
          {/* arm — long coiled limb with a claw, swinging */}
          <g style={{ transformBox: "fill-box", transformOrigin: "50% 6%", animation: "robot-armswing 0.7s ease-in-out infinite" }}>
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

          {/* head + antenna — tilted forward, gently nodding */}
          <g style={{ transformBox: "fill-box", transformOrigin: "50% 100%", animation: "robot-nod 0.7s ease-in-out infinite" }}>
            {/* antenna */}
            <path d="M60 22 C 56 11, 67 10, 65 4" stroke="#4C5059" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <circle cx="65" cy="3.5" r="3.6" fill="url(#robot-grad)" style={{ animation: "robot-glow 1.5s ease-in-out infinite" }} />
            {/* head capsule */}
            <rect x="39" y="20" width="42" height="58" rx="20" fill="#646874" stroke="#4C5059" strokeWidth="1.5" />
            {/* top rim */}
            <line x1="45" y1="35" x2="75" y2="35" stroke="#4C5059" strokeWidth="1.6" />
            {/* eye */}
            <circle cx="69" cy="46" r="6" fill="#F1F1F5" />
            <circle cx="69" cy="46" r="6" fill="none" stroke="url(#robot-grad)" strokeWidth="1.4" />
            <circle cx="71" cy="44" r="2" fill="#FFFFFF" />
          </g>
        </svg>
       </div>
      </div>
    </div>
  );
}


/* ── Reasoning / Tools-used disclosure strip (adapted from the home page) ── */
type ToolEntry = { name: string; args: string; result: string };

function ReasoningToolsStrip({ reasoning, tools }: { reasoning: ReactNode[]; tools: ToolEntry[] }) {
  const [expanded, setExpanded] = useState<"reasoning" | "tools" | null>(null);
  const [openTools, setOpenTools] = useState<Set<string>>(new Set());
  const openReasoning = expanded === "reasoning";
  const openToolsPanel = expanded === "tools";
  const toggle = (w: "reasoning" | "tools") => setExpanded(p => (p === w ? null : w));
  const toggleTool = (n: string) =>
    setOpenTools(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });

  const link = (Icon: typeof Sparkles, label: string, open: boolean, onToggle: () => void) => (
    <button type="button" onClick={onToggle}
      className="inline-flex items-center gap-1 text-[11px] font-semibold transition-opacity hover:opacity-80">
      <Icon className="size-3 shrink-0" strokeWidth={1.75} stroke="url(#rt-grad)" />
      <span style={{ background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 52%, #3FBAD8 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{label}</span>
      <ChevronRight className="size-2.5 transition-transform" strokeWidth={2}
        style={{ transform: open ? "rotate(90deg)" : "rotate(0)", color: "#5A7BF0" }} />
    </button>
  );

  return (
    <div onClick={e => e.stopPropagation()}>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="rt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8466E8" />
            <stop offset="52%" stopColor="#4F86EE" />
            <stop offset="100%" stopColor="#3FBAD8" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex items-center gap-4">
        {link(Sparkles, "Reasoning", openReasoning, () => toggle("reasoning"))}
        {link(Database, "Tools used", openToolsPanel, () => toggle("tools"))}
      </div>

      {openReasoning && (
        <div className="mt-2 flex flex-col" style={{ animation: "fade-in 200ms ease-out both" }}>
          {reasoning.map((s, i, arr) => (
            <div key={i} className="flex flex-col">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border"
                  style={{ background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 52%, #3FBAD8 100%)", borderColor: "transparent", color: "white" }}>
                  <Check className="size-2" strokeWidth={2.5} />
                </span>
                <span className="text-[11px] leading-[1.5]" style={{ color: "var(--ds-text-secondary)" }}>{s}</span>
              </div>
              {i < arr.length - 1 && (
                <span className="ml-[7px] h-2 w-px" style={{ backgroundColor: "var(--ds-accent-border)" }} aria-hidden />
              )}
            </div>
          ))}
        </div>
      )}

      {openToolsPanel && (
        <div className="mt-2 flex flex-col gap-1.5" style={{ animation: "fade-in 200ms ease-out both" }}>
          {tools.map(t => {
            const isOpen = openTools.has(t.name);
            return (
              <div key={t.name} className="rounded-[8px] border" style={{ borderColor: "#E4E4E7" }}>
                <button type="button" onClick={() => toggleTool(t.name)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-[#FAFAFA]">
                  <p className="text-[11px]" style={{ color: "var(--ds-text-secondary)" }}>
                    Called{" "}
                    <code className="mx-0.5 inline-flex items-center rounded-[4px] px-1 py-px align-baseline font-mono text-[10px] tracking-tight"
                      style={{ background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 52%, #3FBAD8 100%)", color: "white" }}>{t.name}</code>
                  </p>
                  <ChevronRight className="size-3 shrink-0 transition-transform" strokeWidth={2}
                    style={{ color: "var(--ds-text-muted)", transform: isOpen ? "rotate(90deg)" : "rotate(0)" }} aria-hidden />
                </button>
                {isOpen && (
                  <div className="flex flex-col gap-1.5 border-t px-3 py-2"
                    style={{ borderColor: "#E4E4E7", animation: "fade-in 180ms ease-out both" }}>
                    <div>
                      <span className="text-[10px]" style={{ color: "var(--ds-text-muted)" }}>Arguments</span>
                      <pre className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[10px] leading-[1.5]"
                        style={{ color: "var(--ds-accent-ink)" }}>{t.args}</pre>
                    </div>
                    <div>
                      <span className="text-[10px]" style={{ color: "var(--ds-text-muted)" }}>Result</span>
                      <pre className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[10px] leading-[1.5]"
                        style={{ color: "var(--ds-accent-ink)" }}>{t.result}</pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* separator between the strip and the message text below */}
      <div className="mt-1.5 mb-1.5 h-px" style={{ backgroundColor: "var(--ds-border-line)" }} />
    </div>
  );
}


/* ── inline citation chip + hover source card (adapted from the home page) ── */
const CITATION_SOURCES = [
  {
    title: "Studio plan tier details",
    description:
      "Full breakdown of monthly and annual pricing for the Studio tier, including auto-renewal terms.",
    url: "tars.com/plans/studio",
  },
  {
    title: "Annual discount terms",
    description:
      "Conditions for the 20% annual discount — eligibility, refund window, and prorated billing.",
    url: "tars.com/legal/discounts",
  },
];

function CitationSource({ n, source }: { n: number; source: { title: string; description: string; url: string } }) {
  const chipRef = useRef<HTMLSpanElement>(null);
  const [transformX, setTransformX] = useState("-50%");

  const recalc = () => {
    const chip = chipRef.current;
    if (!chip) return;
    const card = chip.closest<HTMLElement>("[data-chat-card]");
    if (!card) return;
    const chipRect = chip.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const POPOVER_W = 300;
    const PAD = 8;
    const chipCenter = chipRect.left + chipRect.width / 2;
    let popoverLeft = chipCenter - POPOVER_W / 2;
    const minLeft = cardRect.left + PAD;
    const maxLeft = cardRect.right - POPOVER_W - PAD;
    if (popoverLeft < minLeft) popoverLeft = minLeft;
    if (popoverLeft > maxLeft) popoverLeft = maxLeft;
    const newCenter = popoverLeft + POPOVER_W / 2;
    setTransformX(`calc(-50% + ${newCenter - chipCenter}px)`);
  };

  return (
    <span className="group/cite relative inline-block align-baseline" onMouseEnter={recalc} onFocus={recalc}>
      <span
        ref={chipRef}
        className="ml-0.5 inline-flex size-4 cursor-pointer items-center justify-center rounded-full align-middle text-[10px] font-semibold transition-transform group-hover/cite:scale-110"
        style={{ background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 52%, #3FBAD8 100%)", color: "white", boxShadow: "0 1px 4px -1px rgba(80,100,230,0.5)" }}
      >
        {n}
      </span>
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-20 w-[300px] pb-2 opacity-0 transition-opacity duration-150 group-hover/cite:pointer-events-auto group-hover/cite:opacity-100"
        style={{ transform: `translateX(${transformX})` }}
      >
        <span className="block rounded-[10px] border bg-white p-3"
          style={{ borderColor: LINE, boxShadow: "0 4px 14px -3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.04)" }}>
          <span className="block text-[12px] font-semibold leading-[1.35]" style={{ color: INK }}>{source.title}</span>
          <span className="mt-1 block text-[11px] leading-[1.45]" style={{ color: MUTED }}>{source.description}</span>
          <a href={`https://${source.url}`} target="_blank" rel="noopener noreferrer"
            className="mt-1.5 inline-flex max-w-full items-center gap-1 font-mono text-[11px] hover:underline"
            style={{ color: ACCENT_INK }}>
            <span className="truncate">{source.url}</span>
            <ExternalLink className="size-3 shrink-0" strokeWidth={2} aria-hidden />
          </a>
        </span>
      </span>
    </span>
  );
}

/* AI message contents — defined once so timing can be derived from their word count */
const MSG_THANK_YOU = "Thank you for your interest! Kindly provide your contact details, and our team will connect with you as soon as possible.";
const MSG_FULL_NAME = (<>Please type in your <span className="font-semibold">full name</span>.</>);
const MSG_STUDIO = (
  <>Got it — thanks for sharing those details. Based on businesses similar to yours, the <span className="font-semibold">Studio plan</span> tends to be the best fit. It&apos;s $49/month and includes unlimited AI conversations, advanced analytics, and dedicated support<CitationSource n={1} source={CITATION_SOURCES[0]} />. Going annual saves you <span className="font-semibold">20%</span> and unlocks the new audit log<CitationSource n={2} source={CITATION_SOURCES[1]} />, which gives you full visibility into every customer interaction.</>
);
const MSG_WALKTHROUGH = (<>Want me to set up a quick walkthrough with one of our specialists? They can show you exactly how it would <span className="font-semibold">work for your team</span>.</>);
const MSG_COMPANY = (<>And your <span className="font-semibold">company name</span>?</>);
const msgSchedule = (name: string | null) => (<>Thanks{name ? `, ${name}` : ""}. Let&apos;s find a convenient time for a quick conversation with our team.</>);
const MSG_BOOKED = (<>Perfect — you&apos;re booked! I&apos;ve added it to your <span className="font-semibold">Google Calendar</span> and created a <span className="font-semibold">Google Meet</span> link. A confirmation email is on its way, and your specialist will join you at the scheduled time.</>);

/* "what is an AI agent" answer as ordered parts, so it can animate word-by-word with inline source chips */
type AgentPart =
  | { text: string }
  | { bold: string }
  | { cite: 1 | 2; after?: string };

const AI_AGENT_PARTS: AgentPart[] = [
  { text: "An" },
  { bold: "AI agent" },
  { text: "is software that understands a goal and takes actions to reach it — not just replying with text, but actually doing the work" },
  { cite: 1, after: "." },
  { text: "Unlike a scripted chatbot, it can reason, use your tools, and adapt. Ours can resolve support requests, pull live data, and hand off to a human when needed" },
  { cite: 2, after: "." },
];

function buildAgentTokens(animated: boolean) {
  const tokens: { node: ReactNode; hugRight: boolean }[] = [];
  AI_AGENT_PARTS.forEach((part, pi) => {
    const nextIsCite = !!AI_AGENT_PARTS[pi + 1] && "cite" in AI_AGENT_PARTS[pi + 1];
    if ("cite" in part) {
      tokens.push({
        node: (
          <>
            <CitationSource n={part.cite} source={CITATION_SOURCES[part.cite - 1]} />
            {part.after}
          </>
        ),
        hugRight: false,
      });
    } else {
      const str = "text" in part ? part.text : part.bold;
      const bold = "bold" in part;
      const words = str.split(" ");
      words.forEach((w, wi) => {
        const isLast = wi === words.length - 1;
        tokens.push({
          node: bold ? <span className="font-semibold">{w}</span> : w,
          hugRight: isLast && nextIsCite,
        });
      });
    }
  });
  return tokens.map((t, k) => (
    <span
      key={k}
      className="inline-block"
      style={animated ? { animation: "word-in 320ms cubic-bezier(0.2,0.6,0.2,1) both", animationDelay: `${k * 42}ms` } : undefined}
    >
      {t.node}{t.hugRight ? null : <>&nbsp;</>}
    </span>
  ));
}


/* ── the Corner Pill launcher (copied verbatim) ── */
function CornerPillVariant() {
  type Phase = "pill" | "focused" | "chatting";
  const [phase, setPhase] = useState<Phase>("pill");
  const [pressedIdx, setPressedIdx] = useState<number | null>(null);
  const [selectedStarter, setSelectedStarter] = useState(0);
  const [panelPhase, setPanelPhase] = useState<"thinking" | "done">("thinking");
  const [thinkingStep, setThinkingStep] = useState(0);
  const [hoveredTurn, setHoveredTurn] = useState<null | 1 | 2 | 3 | 4 | 5 | 6>(null);
  const [revealedTurn, setRevealedTurn] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // close the chat by sliding the panel down, then switch back to the pill
  const closeChat = () => {
    setMenuOpen(false);
    setClosing(true);
    window.setTimeout(() => {
      setPhase("pill");
      setClosing(false);
    }, 520);
  };
  const [speakingTurn, setSpeakingTurn] = useState<number | null>(null);
  const [reactions, setReactions] = useState<Record<number, "like" | "dislike" | null>>({});
  const [copiedTurn, setCopiedTurn] = useState<number | null>(null);
  const copyTimer = useRef<number | null>(null);
  const [conversationTurn, setConversationTurn] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [selectedHelp, setSelectedHelp] = useState<string | null>(null);
  const [turn3Phase, setTurn3Phase] = useState<"thinking" | "done">("thinking");
  const [turn4Phase, setTurn4Phase] = useState<"thinking" | "done">("thinking");
  const [turn4Step, setTurn4Step] = useState(0);
  const [turn5Phase, setTurn5Phase] = useState<"thinking" | "done">("thinking");
  const [turn5Step, setTurn5Step] = useState(0);
  const [pickedDate, setPickedDate] = useState<number | null>(null);
  const [pickedTime, setPickedTime] = useState<string | null>(null);
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);
  const [turn6Phase, setTurn6Phase] = useState<"thinking" | "done">("thinking");
  const [turn6Step, setTurn6Step] = useState(0);
  const [userName, setUserName] = useState<string | null>(null);
  const [company, setCompany] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceAgentOpen, setVoiceAgentOpen] = useState(false);
  const transcribeTimer = useRef<number | null>(null);
  const [timeLabel] = useState(() =>
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  );

  // auto-growing composer (caps height, then scrolls)
  const composerRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [inputText]);

  // keep the chat pinned to the latest message
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    const mo = new MutationObserver(() => {
      el.scrollTop = el.scrollHeight;
    });
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, [phase]);
  const [entered, setEntered] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // slide the composer in from the right shortly after the page loads / refreshes
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 250);
    return () => clearTimeout(t);
  }, []);

  const resetConversation = () => {
    setPanelPhase("thinking");
    setThinkingStep(0);
    setConversationTurn(1);
    setHoveredTurn(null);
    setRevealedTurn(0);
    setReactions({});
    setCopiedTurn(null);
    setSpeakingTurn(null);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setSelectedHelp(null);
    setTurn3Phase("thinking");
    setTurn4Phase("thinking");
    setTurn4Step(0);
    setTurn5Phase("thinking");
    setTurn5Step(0);
    setPickedDate(null);
    setPickedTime(null);
    setBookedSlot(null);
    setTurn6Phase("thinking");
    setTurn6Step(0);
    setUserName(null);
    setCompany(null);
    setInputText("");
  };

  useEffect(() => {
    if (phase === "chatting") resetConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // close the header menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const handleDownloadTranscript = () => {
    const L: string[] = ["Global Payments — Virtual Assistant", ""];
    L.push(`You: ${COMPOSER_STARTERS[selectedStarter]}`);
    L.push(`Assistant: ${STARTER_RESPONSES[selectedStarter]}`);
    L.push(`Assistant: ${HELP_QUESTION}`);
    if (conversationTurn >= 2 && selectedHelp) {
      L.push(`You: ${selectedHelp}`);
      L.push(`Assistant: ${MSG_THANK_YOU}`);
      L.push(`Assistant: ${getNodeText(MSG_FULL_NAME)}`);
    }
    if (conversationTurn >= 3 && userName) {
      L.push(`You: ${userName}`);
      L.push(`Assistant: ${getNodeText(MSG_COMPANY)}`);
    }
    if (conversationTurn >= 4 && company) {
      L.push(`You: ${company}`);
      L.push(`Assistant: ${getNodeText(MSG_STUDIO)}`);
      L.push(`Assistant: ${getNodeText(MSG_WALKTHROUGH)}`);
    }
    if (conversationTurn >= 5) {
      L.push("You: Yes, schedule a call");
      L.push(`Assistant: ${getNodeText(msgSchedule(userName))}`);
    }
    if (conversationTurn >= 6 && bookedSlot) {
      L.push(`You: ${bookedSlot}`);
      L.push(`Assistant: ${getNodeText(MSG_BOOKED)}`);
    }
    const blob = new Blob([L.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (phase !== "chatting" || panelPhase !== "thinking") return;
    // turn 1 (first message) shows a brief generic "AI is thinking" rather than stepped events
    if (conversationTurn === 1) {
      const t = setTimeout(() => setPanelPhase("done"), 900);
      return () => clearTimeout(t);
    }
    if (thinkingStep >= THINKING_EVENTS.length) { setPanelPhase("done"); return; }
    const t = setTimeout(() => setThinkingStep(s => s + 1), 1000);
    return () => clearTimeout(t);
  }, [phase, panelPhase, thinkingStep, conversationTurn]);

  useEffect(() => {
    if (conversationTurn !== 3 || turn3Phase !== "thinking") return;
    // "And your company name?" — brief generic thinking, no stepped events
    const t = setTimeout(() => setTurn3Phase("done"), 900);
    return () => clearTimeout(t);
  }, [conversationTurn, turn3Phase]);

  useEffect(() => {
    if (conversationTurn !== 4 || turn4Phase !== "thinking") return;
    if (turn4Step >= STUDIO_EVENTS.length) { setTurn4Phase("done"); return; }
    const t = setTimeout(() => setTurn4Step(s => s + 1), 900);
    return () => clearTimeout(t);
  }, [conversationTurn, turn4Phase, turn4Step]);

  useEffect(() => {
    if (conversationTurn !== 5 || turn5Phase !== "thinking") return;
    if (turn5Step >= SCHEDULE_EVENTS.length) { setTurn5Phase("done"); return; }
    const t = setTimeout(() => setTurn5Step(s => s + 1), 1150);
    return () => clearTimeout(t);
  }, [conversationTurn, turn5Phase, turn5Step]);

  useEffect(() => {
    if (conversationTurn !== 6 || turn6Phase !== "thinking") return;
    if (turn6Step >= BOOK_EVENTS.length) { setTurn6Phase("done"); return; }
    const t = setTimeout(() => setTurn6Step(s => s + 1), 850);
    return () => clearTimeout(t);
  }, [conversationTurn, turn6Phase, turn6Step]);

  // reveal a turn's action buttons only after all of its content has finished animating in
  useEffect(() => {
    const OPT = HELP_OPTIONS.length * 70 + 280; // option chips stagger + their animation
    let duration: number | null = null;
    if (conversationTurn === 1 && panelPhase === "done") {
      duration = STARTER_RESPONSES[selectedStarter].split(" ").length * 42 + 520 + OPT;
    } else if (conversationTurn === 2 && panelPhase === "done") {
      duration = streamMs(MSG_THANK_YOU) + streamMs(MSG_FULL_NAME);
    } else if (conversationTurn === 3 && turn3Phase === "done") {
      duration = streamMs(MSG_COMPANY);
    } else if (conversationTurn === 4 && turn4Phase === "done") {
      duration = streamMs(MSG_STUDIO) + streamMs(MSG_WALKTHROUGH) + OPT;
    } else if (conversationTurn === 5 && turn5Phase === "done") {
      duration = streamMs(msgSchedule(userName)) + 300; // + scheduler card
    } else if (conversationTurn === 6 && turn6Phase === "done") {
      duration = streamMs(MSG_BOOKED);
    }
    if (duration === null) return;
    const t = setTimeout(() => setRevealedTurn(conversationTurn), duration);
    return () => clearTimeout(t);
  }, [conversationTurn, panelPhase, turn3Phase, turn4Phase, turn5Phase, turn6Phase, selectedStarter, userName]);

  const handleHelpClick = (opt: string) => {
    if (conversationTurn !== 1) return;
    setSelectedHelp(opt);
    setConversationTurn(2);
    setPanelPhase("thinking");
    setThinkingStep(0);
    setHoveredTurn(null);
  };

  const handleScheduleClick = () => {
    if (conversationTurn !== 4) return;
    setConversationTurn(5);
    setTurn5Phase("thinking");
    setTurn5Step(0);
    setHoveredTurn(null);
  };

  // ── message action buttons (Listen / Good / Bad / Copy) — same behavior as the home page ──
  const handleCopy = (turn: number, content: ReactNode) => {
    if (typeof navigator === "undefined") return;
    void navigator.clipboard?.writeText(getNodeText(content));
    setCopiedTurn(turn);
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopiedTurn(null), 1500);
  };
  const handleReact = (turn: number, kind: "like" | "dislike") =>
    setReactions(prev => ({ ...prev, [turn]: prev[turn] === kind ? null : kind }));
  const handleSpeak = (turn: number, content: ReactNode) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (speakingTurn === turn) { setSpeakingTurn(null); return; }
    const u = new SpeechSynthesisUtterance(getNodeText(content));
    u.onend = () => setSpeakingTurn(null);
    u.onerror = () => setSpeakingTurn(null);
    window.speechSynthesis.speak(u);
    setSpeakingTurn(turn);
  };
  useEffect(() => () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
  }, []);

  const actionsRow = (turn: number, content: ReactNode, mt: string) => {
    const reaction = reactions[turn];
    const iconBtn = "flex size-7 items-center justify-center rounded-[5px] transition-colors";
    return (
      <div className={`flex items-center gap-2 px-1 ${mt}`}
        style={{ opacity: (revealedTurn >= turn && (hoveredTurn === turn || speakingTurn === turn)) ? 1 : 0, transition: "opacity 150ms ease", pointerEvents: revealedTurn >= turn ? "auto" : "none" }}>
        <button type="button" title="Listen" aria-label="Read aloud" className={iconBtn}
          style={{ color: speakingTurn === turn ? INK : "#555555", backgroundColor: speakingTurn === turn ? SKEL_BG : "transparent" }}
          onClick={() => handleSpeak(turn, content)}
          onMouseEnter={e => { if (speakingTurn !== turn) { e.currentTarget.style.color = INK; e.currentTarget.style.backgroundColor = SKEL_BG; } }}
          onMouseLeave={e => { e.currentTarget.style.color = speakingTurn === turn ? INK : "#555555"; e.currentTarget.style.backgroundColor = speakingTurn === turn ? SKEL_BG : "transparent"; }}>
          {speakingTurn === turn ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="url(#act-grad)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
              <path d="M14 10a3 3 0 0 1 0 4" style={{ animation: "arc-fade 1800ms ease-in-out infinite" }} />
              <path d="M16.5 7.5a6 6 0 0 1 0 9" style={{ animation: "arc-fade 1800ms ease-in-out 350ms infinite" }} />
              <path d="M19.364 5.636a9 9 0 0 1 0 12.728" style={{ animation: "arc-fade 1800ms ease-in-out 700ms infinite" }} />
            </svg>
          ) : (
            <Volume2 className="size-3.5" strokeWidth={1.75} />
          )}
        </button>
        <button type="button" title="Good" aria-label="Good response" className={iconBtn}
          style={{ color: reaction === "like" ? "#4348C7" : "#555555" }}
          onClick={() => handleReact(turn, "like")}
          onMouseEnter={e => { if (reaction !== "like") e.currentTarget.style.backgroundColor = SKEL_BG; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
          <ThumbsUp className="size-3.5" strokeWidth={reaction === "like" ? 2 : 1.75} stroke={reaction === "like" ? "url(#act-grad)" : "currentColor"} fill={reaction === "like" ? "#E9EAFC" : "none"} />
        </button>
        <button type="button" title="Bad" aria-label="Bad response" className={iconBtn}
          style={{ color: reaction === "dislike" ? "#4348C7" : "#555555" }}
          onClick={() => handleReact(turn, "dislike")}
          onMouseEnter={e => { if (reaction !== "dislike") e.currentTarget.style.backgroundColor = SKEL_BG; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
          <ThumbsDown className="size-3.5" strokeWidth={reaction === "dislike" ? 2 : 1.75} stroke={reaction === "dislike" ? "url(#act-grad)" : "currentColor"} fill={reaction === "dislike" ? "#E9EAFC" : "none"} />
        </button>
        <button type="button" title={copiedTurn === turn ? "Copied" : "Copy"} aria-label="Copy" className={iconBtn}
          style={{ color: copiedTurn === turn ? "#22A06B" : "#555555" }}
          onClick={() => handleCopy(turn, content)}
          onMouseEnter={e => { if (copiedTurn !== turn) { e.currentTarget.style.color = INK; e.currentTarget.style.backgroundColor = SKEL_BG; } }}
          onMouseLeave={e => { e.currentTarget.style.color = copiedTurn === turn ? "#22A06B" : "#555555"; e.currentTarget.style.backgroundColor = "transparent"; }}>
          {copiedTurn === turn ? <Check className="size-3.5" strokeWidth={2.5} stroke="url(#act-grad)" /> : <Copy className="size-3.5" strokeWidth={1.75} />}
        </button>
      </div>
    );
  };

  const awaitingName = conversationTurn === 2 && panelPhase === "done";
  const awaitingCompany = conversationTurn === 3 && turn3Phase === "done";
  const awaitingSchedule = conversationTurn === 5 && turn5Phase === "done";

  const handleSend = () => {
    const val = inputText.trim();
    if (awaitingName && val) {
      setUserName(val);
      setConversationTurn(3);
      setTurn3Phase("thinking");
      setHoveredTurn(null);
    } else if (awaitingCompany && val) {
      setCompany(val);
      setConversationTurn(4);
      setTurn4Phase("thinking");
      setTurn4Step(0);
      setHoveredTurn(null);
    } else if (awaitingSchedule && val) {
      setBookedSlot(val);
      setConversationTurn(6);
      setTurn6Phase("thinking");
      setTurn6Step(0);
      setHoveredTurn(null);
    }
    setInputText("");
  };


  const handleStarterClick = (idx: number) => {
    setPressedIdx(idx);
    setSelectedStarter(idx);
    setTimeout(() => { setPhase("chatting"); setPressedIdx(null); }, 120);
  };

  // voice input on the launcher composer (mirrors the home page)
  const handleMicClick = () => { setInputText(""); setRecording(true); };
  const handleStopRecording = () => {
    setRecording(false);
    setTranscribing(true);
    transcribeTimer.current = window.setTimeout(() => {
      setInputText(DEMO_TRANSCRIPT);
      setTranscribing(false);
    }, 1500);
  };
  const handleCancelRecording = () => {
    setRecording(false);
    setTranscribing(false);
    if (transcribeTimer.current) { window.clearTimeout(transcribeTimer.current); transcribeTimer.current = null; }
  };
  useEffect(() => () => { if (transcribeTimer.current) window.clearTimeout(transcribeTimer.current); }, []);


  return (
    <>
      <style>{`
        @keyframes cpill-starter-in {
          from { opacity: 0; transform: translateX(14px) translateY(4px); }
          to   { opacity: 1; transform: translateX(0) translateY(0); }
        }
        @keyframes cpill-panel-rise {
          from { opacity: 0; height: 220px; }
          to   { opacity: 1; height: 680px; }
        }
        @keyframes cpill-panel-fall {
          from { height: 680px; }
          to   { height: 0px; }
        }
        /* liquid-glass edge glow — light embedded inside the edge, no hard border */
        @property --lg-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes liquid-edge-orbit {
          to { --lg-angle: 360deg; }
        }
        /* shared edge geometry + border mask */
        .liquid-glass::before, .liquid-glass::after, .liquid-glass-panel::before {
          content: "";
          position: absolute;
          padding: 3px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        /* launcher: stable, subtle base edge (does not move) */
        .liquid-glass::before {
          inset: -1.5px;
          border-radius: 21.5px;
          background: conic-gradient(from var(--lg-angle),
            rgba(180,140,255,1) 0deg,
            rgba(140,175,255,1) 60deg,
            rgba(120,200,250,1) 120deg,
            rgba(215,250,255,1) 180deg,
            rgba(120,200,250,1) 240deg,
            rgba(140,175,255,1) 300deg,
            rgba(180,140,255,1) 360deg);
          animation: liquid-edge-orbit 5s linear infinite;
        }
        /* launcher: a narrow specular highlight that glides around the edge */
        .liquid-glass::after {
          inset: -1.5px;
          border-radius: 21.5px;
          background: conic-gradient(from var(--lg-angle),
            transparent 0deg 8deg,
            rgba(175,205,255,0) 14deg,
            rgba(175,205,255,0.32) 26deg,
            rgba(220,235,255,0.7) 38deg,
            rgba(248,251,255,0.95) 45deg,
            rgba(255,255,255,1) 49deg,
            rgba(248,251,255,0.95) 53deg,
            rgba(215,200,255,0.7) 60deg,
            rgba(190,205,255,0.32) 72deg,
            rgba(175,205,255,0) 84deg,
            transparent 90deg 360deg);
          animation: liquid-edge-orbit 7s linear infinite;
        }
        .liquid-glass.lg-still::before, .liquid-glass.lg-still::after { animation-play-state: paused; }
        /* panel: orbiting gradient ring */
        .liquid-glass-panel::before {
          inset: 0;
          border-radius: inherit;
          z-index: 5;
          padding: 1px;
          background: linear-gradient(135deg,
            rgba(255,255,255,0.9) 0%,
            rgba(255,255,255,0.3) 42%,
            rgba(255,255,255,0.18) 58%,
            rgba(255,255,255,0.8) 100%);
        }
        /* option chip — shiny gradient stroke fades in on hover (no bg change) */
        .opt-chip::before {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          padding: 1.5px;
          background: linear-gradient(120deg,
            rgba(180,140,255,1) 0%,
            rgba(120,200,250,1) 52%,
            rgba(150,225,240,1) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 160ms ease;
        }
        .opt-chip:hover::before { opacity: 1; }
        /* composer pill — thin white linear stroke fades in on hover / focus */
        .cpill-stroke::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg,
            rgba(255,255,255,0.95) 0%,
            rgba(255,255,255,0.35) 45%,
            rgba(255,255,255,0.2) 60%,
            rgba(255,255,255,0.85) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 180ms ease;
        }
        .cpill-stroke:hover::before, .cpill-stroke:focus-within::before { opacity: 1; }
        /* composer pill (voice mode) — soft glow blooming from behind + crisp moving edge */
        .cpill-voice::before {
          content: "";
          position: absolute;
          inset: -6px;
          border-radius: 26px;
          z-index: -1;
          background: conic-gradient(from var(--lg-angle),
            #8466E8 0deg, #4F86EE 90deg, #3FBAD8 180deg, #C06BFF 270deg, #8466E8 360deg);
          filter: blur(12px);
          opacity: 0.85;
          pointer-events: none;
          animation: liquid-edge-orbit 4s linear infinite;
        }
        .cpill-voice::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1.6px;
          background: conic-gradient(from var(--lg-angle),
            #8466E8 0deg, #4F86EE 90deg, #3FBAD8 180deg, #C06BFF 270deg, #8466E8 360deg);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          animation: liquid-edge-orbit 4s linear infinite;
        }
        @keyframes cal-slide { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
      <div className="relative flex flex-col overflow-hidden" style={{ height: "100vh", width: "100%", backgroundColor: "#FFFFFF" }}>
        {/* landing-page background */}
        <img
          src="/v2-gp-bg.png"
          alt=""
          aria-hidden
          className="absolute inset-0 z-0 h-full w-full object-cover object-top"
        />

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
          style={{
            bottom: 20,
            right: 20,
            gap: phase === "chatting" ? 0 : 12,
            opacity: entered && !dismissed ? 1 : 0,
            transform: entered && !dismissed ? "translateX(0)" : "translateX(140%)",
            transition:
              "transform 650ms cubic-bezier(0.22,1,0.36,1), opacity 420ms ease",
            pointerEvents: dismissed ? "none" : "auto",
          }}
        >

          {/* starters */}
          {phase === "focused" && (
            <div className="flex flex-col items-end gap-2">
              {COMPOSER_STARTERS.map((s, i) => (
                <button key={s}
                  className="rounded-full px-4 py-2 text-[14px] text-right whitespace-nowrap"
                  style={{
                    backgroundColor: pressedIdx === i ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.34)",
                    backdropFilter: "blur(18px) saturate(1.3)",
                    WebkitBackdropFilter: "blur(18px) saturate(1.3)",
                    border: "1px solid rgba(255,255,255,0.5)",
                    color: "white",
                    boxShadow: "0 8px 22px -10px rgba(30,25,60,0.25), inset 0 1px 1px rgba(255,255,255,0.4)",
                    animation: `cpill-starter-in 260ms cubic-bezier(0.22,1,0.36,1) both`,
                    animationDelay: `${60 + i * 60}ms`,
                    transition: "background-color 140ms ease-out",
                  }}
                  onMouseEnter={e => { if (pressedIdx !== i) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.46)"; }}
                  onMouseLeave={e => { if (pressedIdx !== i) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.34)"; }}
                  onClick={e => { e.stopPropagation(); handleStarterClick(i); }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* chat panel */}
          {phase === "chatting" && (
            <div data-chat-card className="liquid-glass-panel relative rounded-[28px] overflow-hidden flex flex-col"
              style={{
                width: expanded ? 515 : 400, height: 680,
                justifyContent: closing ? "flex-end" : undefined,
                transform: expanded ? "scale(1.088)" : "scale(1)",
                transformOrigin: "bottom right",
                backgroundColor: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow: "0 24px 64px -12px rgba(40,40,70,0.32), 0 4px 16px rgba(40,40,70,0.10)",
                animation: closing
                  ? "cpill-panel-fall 520ms cubic-bezier(0.22,1,0.36,1) both"
                  : "cpill-panel-rise 520ms cubic-bezier(0.22,1,0.36,1) both",
                transition: "width 320ms cubic-bezier(0.22,1,0.36,1), transform 320ms cubic-bezier(0.22,1,0.36,1)",
              }}>
              <div
                className="flex w-full items-center gap-3 px-5 py-3.5 shrink-0"
                style={{ backgroundColor: "rgba(255,255,255,0.45)" }}
              >
                {/* back */}
                <button
                  type="button"
                  aria-label="Back"
                  onClick={closeChat}
                  className="flex size-8 shrink-0 items-center justify-center rounded-[8px] transition-colors -ml-1"
                  style={{ color: "#3A3A42" }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <ChevronLeft className="size-5" strokeWidth={2} />
                </button>
                {/* avatar */}
                <div className="-ml-2.5 flex size-12 shrink-0 items-center justify-center rounded-full bg-white"
                  style={{ boxShadow: "0 3px 12px -3px rgba(40,40,70,0.22)" }}>
                  <img src="/global-payments-avatar.png" alt="" className="size-7 object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-bold leading-tight" style={{ color: "#1F2024" }}>Global Payments</p>
                  <p className="truncate text-[12px] leading-tight mt-0.5" style={{ color: "#7C7C86" }}>Virtual Assistant</p>
                </div>
                {/* menu + close (icon-only, no fill) */}
                <div className="flex shrink-0 items-center gap-0.5">
                  <div ref={menuRef} className="relative">
                    <button
                      type="button"
                      aria-label="More options"
                      aria-expanded={menuOpen}
                      onClick={() => setMenuOpen(o => !o)}
                      className="flex size-8 items-center justify-center rounded-[8px] transition-colors"
                      style={{ color: "#3A3A42", backgroundColor: menuOpen ? "rgba(0,0,0,0.06)" : "transparent" }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.06)"; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = menuOpen ? "rgba(0,0,0,0.06)" : "transparent"; }}
                    >
                      <MoreVertical className="size-[18px]" strokeWidth={2} />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 top-[calc(100%+6px)] z-30 flex w-44 flex-col overflow-hidden rounded-[10px] border p-1"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.85)",
                          backdropFilter: "blur(20px) saturate(1.6)",
                          WebkitBackdropFilter: "blur(20px) saturate(1.6)",
                          borderColor: "rgba(255,255,255,0.55)",
                          boxShadow: "0 10px 28px -8px rgba(40,40,70,0.28), 0 1px 2px rgba(0,0,0,0.05)",
                          animation: "fade-in 160ms ease-out both",
                        }}
                        role="menu">
                        <button type="button" role="menuitem"
                          onClick={() => { setMenuOpen(false); setExpanded(e => !e); }}
                          className="flex w-full items-center gap-2 whitespace-nowrap rounded-[6px] px-2 py-1.5 text-left text-[12px] transition-colors hover:bg-[rgba(255,255,255,0.7)]"
                          style={{ color: "#333" }}>
                          {expanded
                            ? <Minimize2 className="size-3.5" strokeWidth={1.75} style={{ color: MUTED }} />
                            : <Maximize2 className="size-3.5" strokeWidth={1.75} style={{ color: MUTED }} />}
                          {expanded ? "Collapse window" : "Expand window"}
                        </button>
                        <button type="button" role="menuitem"
                          onClick={() => { setMenuOpen(false); resetConversation(); }}
                          className="flex w-full items-center gap-2 whitespace-nowrap rounded-[6px] px-2 py-1.5 text-left text-[12px] transition-colors hover:bg-[rgba(255,255,255,0.7)]"
                          style={{ color: "#333" }}>
                          <RotateCcw className="size-3.5" strokeWidth={1.75} style={{ color: MUTED }} />
                          Restart
                        </button>
                        <button type="button" role="menuitem"
                          onClick={() => { setMenuOpen(false); handleDownloadTranscript(); }}
                          className="flex w-full items-center gap-2 whitespace-nowrap rounded-[6px] px-2 py-1.5 text-left text-[12px] transition-colors hover:bg-[rgba(255,255,255,0.7)]"
                          style={{ color: "#333" }}>
                          <Download className="size-3.5" strokeWidth={1.75} style={{ color: MUTED }} />
                          Download transcript
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={closeChat}
                    className="flex size-8 items-center justify-center rounded-[8px] transition-colors"
                    style={{ color: "#3A3A42" }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.06)"; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    <X className="size-[18px]" strokeWidth={2.25} />
                  </button>
                </div>
              </div>
              {voiceAgentOpen ? (
                <VoiceAgentOverlay />
              ) : (
              <div ref={scrollRef} className="flex flex-1 flex-col gap-3 px-4 py-4 overflow-y-auto scrollbar-subtle">
                <svg width="0" height="0" className="absolute" aria-hidden="true">
                  <defs>
                    <linearGradient id="act-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8466E8" />
                      <stop offset="52%" stopColor="#4F86EE" />
                      <stop offset="100%" stopColor="#3FBAD8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="flex justify-end">
                  <div className="rounded-[12px] rounded-br-[6px] px-3.5 py-2 text-[14px] leading-relaxed"
                    style={{ background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 52%, #3FBAD8 100%)", color: "white", maxWidth: 280, boxShadow: "0 6px 16px -6px rgba(80,100,230,0.45)" }}>
                    {COMPOSER_STARTERS[selectedStarter]}
                  </div>
                </div>
                {conversationTurn === 1 && panelPhase === "thinking" && <AiThinking />}
                {(panelPhase === "done" || conversationTurn === 2) && (() => {
                  const animated = conversationTurn === 1;
                  const isRichAnswer = false;
                  const richTokens = isRichAnswer ? buildAgentTokens(animated) : null;
                  const words = STARTER_RESPONSES[selectedStarter].split(" ");
                  const wordsDelay = (isRichAnswer ? richTokens!.length : words.length) * 42;
                  return (
                    <div onMouseEnter={() => setHoveredTurn(1)} onMouseLeave={() => setHoveredTurn(null)}>
                      <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: "#979797" }}>
                        AI Agent <span style={{ color: "#979797" }}>• {timeLabel}</span>
                      </p>
                      <div className="w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={{ backgroundColor: "rgba(255,255,255,0.82)", color: "#2B2B33", boxShadow: "0 6px 18px -8px rgba(40,40,60,0.18)" }}>
                        {isRichAnswer ? richTokens : (
                          words.map((word, i) => (
                            <span key={i} className="inline-block"
                              style={animated ? { animation: "word-in 320ms cubic-bezier(0.2,0.6,0.2,1) both", animationDelay: `${i * 42}ms` } : undefined}>
                              {word}&nbsp;
                            </span>
                          ))
                        )}
                      </div>
                      {/* second bubble — the "how can we help" question */}
                      <div className="w-fit max-w-[88%] mt-2 rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed"
                        style={{ backgroundColor: "rgba(255,255,255,0.82)", color: "#2B2B33", boxShadow: "0 6px 18px -8px rgba(40,40,60,0.18)",
                          animation: animated ? "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both" : undefined,
                          animationDelay: animated ? `${wordsDelay + 120}ms` : undefined }}>
                        {HELP_QUESTION}
                      </div>
                      {conversationTurn === 1 && (
                        <div className="flex flex-wrap gap-2 px-1 mt-3">
                          {HELP_OPTIONS.map((opt, i) => (
                            <button key={opt} className="opt-chip relative rounded-full border px-3.5 py-1.5 text-[14px]"
                              style={{
                                borderColor: "rgba(0,0,0,0.10)", color: INK, backgroundColor: "rgba(255,255,255,0.72)",
                                animation: animated ? "option-in 280ms cubic-bezier(0.2,0.6,0.2,1) both" : undefined,
                                animationDelay: animated ? `${wordsDelay + 520 + i * 70}ms` : undefined,
                              }}
                              onClick={() => handleHelpClick(opt)}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                      {actionsRow(1, <>{STARTER_RESPONSES[selectedStarter]} {HELP_QUESTION}</>, "mt-2.5")}
                    </div>
                  );
                })()}
                {conversationTurn >= 2 && (
                  <>
                    <div className="flex justify-end">
                      <div className="rounded-[12px] rounded-br-[6px] px-3.5 py-2 text-[14px] leading-relaxed"
                        style={{ background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 52%, #3FBAD8 100%)", color: "white", maxWidth: 280, boxShadow: "0 6px 16px -6px rgba(80,100,230,0.45)" }}>{selectedHelp}</div>
                    </div>
                    {panelPhase === "thinking" && <ThinkingEvents step={thinkingStep} />}
                    {panelPhase === "done" && (
                      <div onMouseEnter={() => setHoveredTurn(2)} onMouseLeave={() => setHoveredTurn(null)}>
                        <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: "#979797" }}>
                          AI Agent <span style={{ color: "#979797" }}>• {timeLabel}</span>
                        </p>
                        <div className="w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={{ backgroundColor: "rgba(255,255,255,0.82)", color: "#2B2B33", boxShadow: "0 6px 18px -8px rgba(40,40,60,0.18)" }}>
                          <Words>{MSG_THANK_YOU}</Words>
                        </div>
                        <div className="mt-2 w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={{ backgroundColor: "rgba(255,255,255,0.82)", color: "#2B2B33", boxShadow: "0 6px 18px -8px rgba(40,40,60,0.18)", animation: "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both", animationDelay: `${streamMs(MSG_THANK_YOU)}ms` }}>
                          <Words delay={streamMs(MSG_THANK_YOU)}>{MSG_FULL_NAME}</Words>
                        </div>
                        {actionsRow(2, <>{MSG_THANK_YOU} {MSG_FULL_NAME}</>, "mt-2.5")}
                      </div>
                    )}
                  </>
                )}
                {conversationTurn >= 3 && (
                  <>
                    <div className="flex justify-end">
                      <div className="rounded-[12px] rounded-br-[6px] px-3.5 py-2 text-[14px] leading-relaxed"
                        style={{ background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 52%, #3FBAD8 100%)", color: "white", maxWidth: 280, boxShadow: "0 6px 16px -6px rgba(80,100,230,0.45)" }}>
                        {userName}
                      </div>
                    </div>
                    {turn3Phase === "thinking" && <AiThinking />}
                    {turn3Phase === "done" && (
                      <div onMouseEnter={() => setHoveredTurn(3)} onMouseLeave={() => setHoveredTurn(null)}>
                        <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: "#979797" }}>
                          AI Agent <span style={{ color: "#979797" }}>• {timeLabel}</span>
                        </p>
                        <div className="w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={{ backgroundColor: "rgba(255,255,255,0.82)", color: "#2B2B33", boxShadow: "0 6px 18px -8px rgba(40,40,60,0.18)" }}>
                          <Words>{MSG_COMPANY}</Words>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {conversationTurn >= 4 && (
                  <>
                    <div className="flex justify-end">
                      <div className="rounded-[12px] rounded-br-[6px] px-3.5 py-2 text-[14px] leading-relaxed"
                        style={{ background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 52%, #3FBAD8 100%)", color: "white", maxWidth: 280, boxShadow: "0 6px 16px -6px rgba(80,100,230,0.45)" }}>
                        {company}
                      </div>
                    </div>
                    {turn4Phase === "thinking" && <ThinkingEvents step={turn4Step} events={STUDIO_EVENTS} />}
                    {turn4Phase === "done" && (
                      <div onMouseEnter={() => setHoveredTurn(4)} onMouseLeave={() => setHoveredTurn(null)}>
                        <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: "#979797" }}>
                          AI Agent <span style={{ color: "#979797" }}>• {timeLabel}</span>
                        </p>
                        <div className="w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={{ backgroundColor: "rgba(255,255,255,0.82)", color: "#2B2B33", boxShadow: "0 6px 18px -8px rgba(40,40,60,0.18)" }}>
                          <Words>{MSG_STUDIO}</Words>
                        </div>
                        <div className="mt-2 w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={{ backgroundColor: "rgba(255,255,255,0.82)", color: "#2B2B33", boxShadow: "0 6px 18px -8px rgba(40,40,60,0.18)", animation: "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both", animationDelay: `${streamMs(MSG_STUDIO)}ms` }}>
                          <Words delay={streamMs(MSG_STUDIO)}>{MSG_WALKTHROUGH}</Words>
                        </div>
                        {conversationTurn === 4 && (
                          <div className="flex flex-wrap gap-2 px-1 mt-3">
                            {["Yes, schedule a call", "Send me more details", "I'll think about it"].map((opt, i) => (
                              <button key={opt} className="opt-chip relative rounded-full border px-3.5 py-1.5 text-[14px]"
                                style={{
                                  borderColor: "rgba(0,0,0,0.10)", color: INK, backgroundColor: "rgba(255,255,255,0.72)",
                                  animation: "option-in 280ms cubic-bezier(0.2,0.6,0.2,1) both",
                                  animationDelay: `${streamMs(MSG_STUDIO) + streamMs(MSG_WALKTHROUGH) + i * 70}ms`,
                                }}
                                onClick={opt === "Yes, schedule a call" ? handleScheduleClick : undefined}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                        {actionsRow(4, <>{MSG_STUDIO} {MSG_WALKTHROUGH}</>, "mt-2.5")}
                      </div>
                    )}
                  </>
                )}
                {conversationTurn === 5 && (
                  <>
                    <div className="flex justify-end">
                      <div className="rounded-[12px] rounded-br-[6px] px-3.5 py-2 text-[14px] leading-relaxed"
                        style={{ background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 52%, #3FBAD8 100%)", color: "white", maxWidth: 280, boxShadow: "0 6px 16px -6px rgba(80,100,230,0.45)" }}>
                        Yes, schedule a call
                      </div>
                    </div>
                    {turn5Phase === "thinking" && <ThinkingEvents step={turn5Step} events={SCHEDULE_EVENTS} />}
                    {turn5Phase === "done" && (
                      <div onMouseEnter={() => setHoveredTurn(5)} onMouseLeave={() => setHoveredTurn(null)}>
                        <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: "#979797" }}>
                          AI Agent <span style={{ color: "#979797" }}>• {timeLabel}</span>
                        </p>
                        <div className="w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={{ backgroundColor: "rgba(255,255,255,0.82)", color: "#2B2B33", boxShadow: "0 6px 18px -8px rgba(40,40,60,0.18)" }}>
                          <Words>{msgSchedule(userName)}</Words>
                        </div>
                        {/* interactive scheduler card (demo) */}
                        <div className="mt-2 w-full max-w-[290px] overflow-hidden rounded-[14px] border p-3"
                          style={{ backgroundColor: "rgba(255,255,255,0.85)", borderColor: "rgba(0,0,0,0.08)", boxShadow: "0 6px 18px -8px rgba(40,40,60,0.18)", minHeight: 230 }}>
                          <div key={pickedDate === null ? "cal" : "time"} style={{ animation: "cal-slide 280ms cubic-bezier(0.22,1,0.36,1) both" }}>
                          {pickedDate === null ? (
                            <>
                              {/* calendar */}
                              <div className="mb-2 flex items-center justify-between">
                                <button type="button" className="flex size-6 items-center justify-center rounded-md" style={{ color: MUTED }}>
                                  <ChevronRight className="size-4 rotate-180" strokeWidth={2} />
                                </button>
                                <span className="text-[13px] font-semibold" style={{ color: INK }}>June 2026</span>
                                <button type="button" className="flex size-6 items-center justify-center rounded-md" style={{ color: MUTED }}>
                                  <ChevronRight className="size-4" strokeWidth={2} />
                                </button>
                              </div>
                              <div className="grid grid-cols-7 gap-1">
                                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                                  <span key={i} className="text-center text-[10px] font-medium" style={{ color: "#979797" }}>{d}</span>
                                ))}
                              </div>
                              <div className="mt-1 grid grid-cols-7 gap-1">
                                {[...Array(new Date(2026, 5, 1).getDay()).fill(null), ...Array.from({ length: new Date(2026, 6, 0).getDate() }, (_, i) => i + 1)].map((day, i) => day === null ? <span key={i} /> : (
                                  <button key={i} type="button"
                                    disabled={![10, 11, 12, 16, 18, 19].includes(day)}
                                    onClick={() => { setPickedDate(day); setPickedTime(null); setInputText(`June ${day}, 2026`); }}
                                    className="flex h-7 items-center justify-center rounded-[7px] text-[12px] transition-transform active:scale-95 disabled:cursor-default"
                                    style={[10, 11, 12, 16, 18, 19].includes(day)
                                      ? { color: "white", background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 100%)", fontWeight: 600 }
                                      : { color: "#9A9AA5" }}>
                                    {day}
                                  </button>
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              {/* time picker */}
                              <div className="mb-2 flex items-center justify-between">
                                <button type="button" onClick={() => setPickedDate(null)} className="flex size-6 items-center justify-center rounded-md" style={{ color: MUTED }}>
                                  <ChevronRight className="size-4 rotate-180" strokeWidth={2} />
                                </button>
                                <span className="text-[13px] font-semibold" style={{ color: INK }}>June {pickedDate}, 2026</span>
                                <span className="size-6" />
                              </div>
                              <div className="grid grid-cols-3 gap-1.5">
                                {["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM", "2:00 PM"].map((t) => {
                                  const sel = pickedTime === t;
                                  return (
                                    <button key={t} type="button"
                                      onClick={() => { setPickedTime(t); setInputText(`June ${pickedDate}, 2026 at ${t}`); }}
                                      className="flex h-8 items-center justify-center rounded-[8px] border text-[11px] font-medium transition-colors active:scale-95"
                                      style={sel
                                        ? { color: "white", background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 100%)", borderColor: "transparent" }
                                        : { color: "#3A3A45", borderColor: "rgba(0,0,0,0.10)", backgroundColor: "rgba(255,255,255,0.6)" }}>
                                      {t}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                          </div>
                        </div>
                        {actionsRow(5, msgSchedule(userName), "mt-2.5")}
                      </div>
                    )}
                  </>
                )}
                {conversationTurn === 6 && (
                  <>
                    <div className="flex justify-end">
                      <div className="rounded-[12px] rounded-br-[6px] px-3.5 py-2 text-[14px] leading-relaxed"
                        style={{ background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 52%, #3FBAD8 100%)", color: "white", maxWidth: 280, boxShadow: "0 6px 16px -6px rgba(80,100,230,0.45)" }}>
                        {bookedSlot}
                      </div>
                    </div>
                    {turn6Phase === "thinking" && <ThinkingEvents step={turn6Step} events={BOOK_EVENTS} />}
                    {turn6Phase === "done" && (
                      <div onMouseEnter={() => setHoveredTurn(6)} onMouseLeave={() => setHoveredTurn(null)}>
                        <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: "#979797" }}>
                          AI Agent <span style={{ color: "#979797" }}>• {timeLabel}</span>
                        </p>
                        <div className="w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={{ backgroundColor: "rgba(255,255,255,0.82)", color: "#2B2B33", boxShadow: "0 6px 18px -8px rgba(40,40,60,0.18)" }}>
                          <ReasoningToolsStrip
                            reasoning={[
                              <>Locked in the slot you picked so no one else can book it</>,
                              <>
                                Called{" "}
                                <code className="mx-0.5 inline-flex items-center rounded-[4px] px-1 py-px font-mono text-[10px] tracking-tight"
                                  style={{ background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 52%, #3FBAD8 100%)", color: "white" }}>create_CalendarEvent</code>{" "}
                                to add the meeting to your Google Calendar
                              </>,
                              <>
                                Generated a Google Meet link with{" "}
                                <code className="mx-0.5 inline-flex items-center rounded-[4px] px-1 py-px font-mono text-[10px] tracking-tight"
                                  style={{ background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 52%, #3FBAD8 100%)", color: "white" }}>create_MeetLink</code>{" "}
                                and attached it to the invite
                              </>,
                              <>Sent calendar invites to both you and the specialist</>,
                            ]}
                            tools={[
                              { name: "verify_SlotAvailable", args: `{ "slot": "${bookedSlot}" }`, result: `{ "available": true, "locked_until": "+5min" }` },
                              { name: "create_CalendarEvent", args: `{ "calendar": "google", "title": "Global Payments walkthrough", "attendees": ["${userName ?? "you"}", "specialist@globalpayments.com"] }`, result: `{ "event_id": "evt_8f3a2c", "status": "confirmed" }` },
                              { name: "create_MeetLink", args: `{ "event_id": "evt_8f3a2c" }`, result: `{ "url": "meet.google.com/abc-defg-hij" }` },
                              { name: "send_CalendarInvite", args: `{ "event_id": "evt_8f3a2c", "to": ["${userName ?? "you"}", "specialist@globalpayments.com"] }`, result: `{ "sent": 2, "delivered": 2 }` },
                            ]}
                          />
                          <Words>{MSG_BOOKED}</Words>
                        </div>
                        {actionsRow(6, MSG_BOOKED, "mt-1")}
                      </div>
                    )}
                  </>
                )}
              </div>
              )}
              {/* composer — single white pill with "+" inside */}
              <div className="flex flex-col gap-1.5 px-4 pb-5 pt-1 shrink-0">
                {inputText.trim() && !recording && !transcribing && (
                  <div
                    className="flex items-center justify-center gap-1 px-1 text-[10px] font-medium leading-4 text-white"
                    style={{ animation: "fade-in 180ms ease-out both" }}
                  >
                    Press
                    <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded-[3px] border border-white/60 bg-white/15 px-1 font-sans text-[10px] font-medium leading-none text-white">
                      ↵
                    </kbd>
                    to send
                  </div>
                )}
                <div
                  className={`${voiceAgentOpen ? "cpill-voice" : "cpill-stroke"} relative flex w-full items-end gap-2`}
                  style={{
                    borderRadius: 20,
                    padding: "12px",
                    backgroundColor: "rgba(255,255,255,0.6)",
                    boxShadow: "0 6px 18px -8px rgba(40,40,60,0.18)",
                  }}
                >
                  {/* left button — media upload, becomes cancel (X) while recording; hidden in voice mode */}
                  {!voiceAgentOpen && (
                    <button
                      type="button"
                      aria-label={recording ? "Cancel recording" : "Upload media"}
                      onClick={recording ? handleCancelRecording : undefined}
                      disabled={transcribing}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-transparent text-[#6A6A75] transition-colors hover:bg-[rgba(255,255,255,0.92)] hover:text-[#2B2B33] disabled:opacity-40"
                    >
                      {recording ? <X className="size-4" strokeWidth={2} /> : <Plus className="size-4" strokeWidth={2} />}
                    </button>
                  )}

                  {/* middle — listening/recording waveform, otherwise the text field */}
                  {recording || voiceAgentOpen ? (
                    <div className="flex min-w-0 flex-1 items-center justify-center gap-[3px] overflow-hidden px-1 py-[5px]" style={{ minHeight: 31 }} aria-hidden>
                      {WAVEFORM_HEIGHTS.map((h, i) => (
                        <span
                          key={i}
                          className="block w-px origin-center rounded-full"
                          style={{
                            height: `${Math.round(h * 20)}px`,
                            background: voiceAgentOpen ? "linear-gradient(180deg, #8466E8 0%, #4F86EE 50%, #3FBAD8 100%)" : "#2E2E2E",
                            animation: `wave-bar 1.6s ease-in-out ${i * 45}ms infinite`,
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <textarea
                      ref={composerRef}
                      rows={1}
                      disabled={transcribing}
                      placeholder={transcribing ? "Transcribing…" : awaitingName ? "Type your full name…" : awaitingCompany ? "Type your company name…" : "Chat here.."}
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      className="block min-w-0 flex-1 resize-none bg-transparent py-[5px] pl-1 text-[15px] leading-[1.4] text-[#2B2B33] outline-none placeholder:text-[#9A9AA5]"
                      style={{ maxHeight: "120px", overflowY: "auto", boxSizing: "border-box" }}
                    />
                  )}

                  {/* mic — starts recording; hidden while recording / transcribing */}
                  {!recording && !transcribing && (
                    <button
                      type="button"
                      aria-label="Voice input"
                      onClick={handleMicClick}
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-transparent text-[#6A6A75] transition-colors hover:bg-[rgba(255,255,255,0.92)] hover:text-[#2B2B33]"
                    >
                      <Mic className="size-4" strokeWidth={2} />
                    </button>
                  )}

                  {/* dynamic button — stop while recording, spinner while transcribing, else send / voice */}
                  {transcribing ? (
                    <button
                      type="button"
                      disabled
                      aria-label="Transcribing"
                      className="flex size-7 shrink-0 items-center justify-center text-[#6A6A75]"
                    >
                      <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={voiceAgentOpen ? "Stop voice" : recording ? "Stop recording" : inputText.trim() ? "Send message" : "Voice input"}
                      onClick={() => { if (voiceAgentOpen) setVoiceAgentOpen(false); else if (recording) handleStopRecording(); else if (inputText.trim()) handleSend(); else setVoiceAgentOpen(true); }}
                      className="relative z-10 flex shrink-0 items-center justify-center transition-colors active:scale-95"
                      style={{
                        width: 28, height: 28, borderRadius: 9999,
                        backgroundColor: voiceAgentOpen ? "#1F2024" : "rgba(255,255,255,0.92)",
                        color: voiceAgentOpen ? "#FFFFFF" : "#2B2B33",
                      }}
                    >
                      {voiceAgentOpen || recording ? (
                        <Square className="size-[11px]" strokeWidth={0} fill="currentColor" style={{ borderRadius: 2 }} />
                      ) : inputText.trim() ? (
                        <ArrowUp className="size-4" strokeWidth={2.5} />
                      ) : (
                        <AudioLines className="size-4" strokeWidth={2} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* composer pill — collapses away once the chat window takes over */}
          <div
            className="relative"
            style={{
              maxHeight: phase === "chatting" ? 0 : 64,
              opacity: phase === "chatting" ? 0 : 1,
              overflow: phase === "chatting" ? "hidden" : "visible",
              transition:
                "max-height 320ms cubic-bezier(0.22,1,0.36,1), opacity 220ms ease",
              pointerEvents: phase === "chatting" ? "none" : "auto",
            }}
          >
            {/* floating close badge — detached, sits just above the composer */}
            <button
              type="button"
              aria-label="Close composer"
              onClick={(e) => {
                e.stopPropagation();
                setDismissed(true);
              }}
              className="flex items-center justify-center rounded-full bg-white"
              style={{
                position: "absolute",
                left: 0,
                bottom: "100%",
                width: 19,
                height: 19,
                border: `1px solid ${LINE}`,
                boxShadow: "0 3px 8px -2px rgba(0,0,0,0.18)",
                color: MUTED,
                transform: "translate(-14px, 6px)",
                opacity: phase === "pill" ? 1 : 0,
                pointerEvents: phase === "pill" ? "auto" : "none",
                transition: "opacity 160ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = INK)}
              onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
            >
              <X className="size-2.5" strokeWidth={2.5} />
            </button>

            {/* single liquid-glass pill — edge glow + blur define the shape, no border */}
            <div
              className={`liquid-glass relative flex items-center cursor-text ${phase === "focused" ? "lg-still" : ""}`}
              style={{
                width: phase === "focused" ? 380 : 280,
                height: 52,
                borderRadius: 20,
                padding: "0 12px 0 16px",
                backgroundColor: "rgba(255,255,255,0.34)",
                backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.14) 100%)",
                backdropFilter: "blur(22px) saturate(1.4)",
                WebkitBackdropFilter: "blur(22px) saturate(1.4)",
                boxShadow:
                  "0 12px 30px -12px rgba(30,25,60,0.28), inset 0 1px 1px rgba(255,255,255,0.5)",
                transition: "width 300ms cubic-bezier(0.22,1,0.36,1)",
              }}
              onClick={() => { if (phase === "pill") setPhase("focused"); }}
            >
              <input
                className="flex-1 min-w-0 bg-transparent text-[15px] tracking-tight outline-none placeholder:text-white"
                style={{ color: "white" }}
                placeholder={phase === "chatting" ? "Message…" : "Ask me anything…"}
                readOnly={phase === "pill"}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onFocus={() => { if (phase === "pill") setPhase("focused"); }}
              />
              <button
                type="button"
                aria-label={(phase === "focused" || inputText.trim()) ? "Send message" : "Voice"}
                onClick={(e) => { e.stopPropagation(); if (phase === "pill") setPhase("focused"); else if (inputText.trim()) handleSend(); }}
                className="relative z-10 flex shrink-0 items-center justify-center transition-colors"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  backgroundColor: "rgba(255,255,255,0.92)",
                  color: "#2B2B33",
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,1)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.92)")}
              >
                {(phase === "focused" || inputText.trim())
                  ? <ArrowUp className="size-4" strokeWidth={2.5} />
                  : <AudioLines className="size-4" strokeWidth={2} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function V4Page() {
  return (
    <main style={{ minHeight: "100vh", width: "100%" }}>
      <V4Keyframes />
      <CornerPillVariant />
    </main>
  );
}
