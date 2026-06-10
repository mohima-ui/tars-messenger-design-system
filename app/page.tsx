"use client";

import { useState, useEffect, useRef, useMemo, isValidElement, Fragment, cloneElement, type ReactNode, type ReactElement } from "react";
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Mic,
  ArrowUp,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  X,
  Plus,
  Sparkles,
  Database,
  ExternalLink,
  RotateCcw,
  Download,
  Maximize2,
  Minimize2,
  Loader2,
  Square,
  ArrowDown,
} from "lucide-react";

const DEMO_TRANSCRIPT = "Can you tell me more about the Studio plan?";
const WAVEFORM_HEIGHTS = Array.from({ length: 26 }, (_, i) => {
  const seed = Math.sin(i * 0.45) * 0.35 + Math.sin(i * 1.7 + 1.2) * 0.45 + 0.55;
  return Math.max(0.18, Math.min(1, seed));
});

/* ── word-by-word streaming (ported from v2) ── */
const WORD_STEP_MS = 38;
function splitNodeIntoWords(node: ReactNode, counter: { current: number }, keyPrefix: string, baseDelay: number): ReactNode {
  if (node === null || node === undefined || typeof node === "boolean") return node;
  if (typeof node === "string") {
    return node.split(/(\s+)/).map((tok, i) => {
      if (tok === "") return null;
      if (/^\s+$/.test(tok)) return tok;
      const idx = counter.current++;
      return (
        <span key={`${keyPrefix}-w-${idx}-${i}`} data-text-word-idx={idx} className="inline-block will-change-transform"
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
const streamMs = (node: ReactNode) => countWords(node) * WORD_STEP_MS + 360;

/* flatten a ReactNode to plain text (for TTS + copy) */
function getNodeText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
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
      @keyframes arc-fade { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
      .speaking-word { background-color: #E7DACC; border-radius: 3px; }
      @keyframes scroll-btn-in { from { opacity: 0; transform: translateX(-50%) translateY(8px) scale(0.9); } to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); } }
      .tooltip-host { position: relative; }
      .tooltip-host::after {
        content: attr(data-tooltip);
        position: absolute; bottom: calc(100% + 6px); left: 50%;
        transform: translateX(-50%) translateY(2px); z-index: 999;
        padding: 4px 8px; border-radius: 6px; background: #1a1a1a; color: #fff;
        font-size: 11px; font-weight: 500; line-height: 1.3; letter-spacing: -0.01em;
        white-space: nowrap; opacity: 0; pointer-events: none;
        transition: opacity 120ms ease-out, transform 120ms ease-out;
      }
      .tooltip-host:hover::after, .tooltip-host:focus-visible::after { opacity: 1; transform: translateX(-50%) translateY(0); transition-delay: 200ms; }
      .tooltip-host.tooltip-below::after { bottom: auto; top: calc(100% + 6px); transform: translateX(-50%) translateY(-2px); }
      .tooltip-host.tooltip-below:hover::after, .tooltip-host.tooltip-below:focus-visible::after { transform: translateX(-50%) translateY(0); }
      .tooltip-host.tooltip-left::after { left: 0; transform: translateX(0) translateY(2px); }
      .tooltip-host.tooltip-left:hover::after, .tooltip-host.tooltip-left:focus-visible::after { transform: translateX(0) translateY(0); }
      .tooltip-host.tooltip-right::after { left: auto; right: 0; transform: translateX(0) translateY(2px); }
      .tooltip-host.tooltip-right:hover::after, .tooltip-host.tooltip-right:focus-visible::after { transform: translateX(0) translateY(0); }
    `}</style>
  );
}

/* ── design tokens + skeleton helpers (copied from the launcher gallery) ── */
const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT = "#632E9A";     // purple brand (matches user bubble)
const ACCENT_INK = "#4A1F77"; // darker purple (hover/pressed)
const SUBTLE = "#F0EBE0";
// accent-derived tints — re-theming a tenant only needs ACCENT changed
const ACCENT_SOFT = `color-mix(in srgb, ${ACCENT} 10%, #fff)`;
const ACCENT_SOFT_HOVER = `color-mix(in srgb, ${ACCENT} 16%, #fff)`;
const ACCENT_SOFT_PRESSED = `color-mix(in srgb, ${ACCENT} 22%, #fff)`;
const ACCENT_BORDER = `color-mix(in srgb, ${ACCENT} 35%, #fff)`;

/* hover-row icon button background (subtle gray) */

/* ── corner-pill conversation data + thinking events ── */
const COMPOSER_STARTERS = [
  "Get a product demo",
  "Check pricing and plans",
  "What is an AI agent?",
];

const STARTER_RESPONSES = [
  "Happy to set that up! A 30-minute demo walks you through everything for your use case, live with a specialist. What's the best email to send the invite to?",
  "We offer three plans — Starter ($29/mo), Growth ($79/mo), and Enterprise (custom). Growth is most popular: full API access and priority support. Want a side-by-side comparison?",
  "An AI agent is software that understands a goal and takes actions to reach it — answering questions, looking things up, and completing tasks for you, not just replying with text. Ours can resolve support requests, pull data, and hand off to a human when needed.",
];

const THINKING_EVENTS = [
  "Reading your question",
  "Searching knowledge base",
  "Checking recent context",
  "Drafting response",
];

const EMAIL_ASK_EVENTS = [
  "Reading your request",
  "Preparing the handoff",
];

const SEND_EVENTS = [
  "Validating your email",
  "Generating setup link",
  "Sending the email",
];

const STARTER_OPTIONS = [
  ["Pick a time", "Compare plans", "Talk to sales"],
  ["Compare plans", "Start free trial", "Talk to sales"],
  ["See a demo", "Compare plans", "What can it do?"],
];

// opening AI greeting options (chat starts here) → mapped to a starter response path
const INTRO_OPTIONS = [
  { label: "Get a product demo", starter: 0 },
  { label: "Need support", starter: 2 },
  { label: "Pricing plans", starter: 1 },
];

const PLANS_FOLLOWUP = "What scale are you working at?";
const PLANS = [
  {
    title: "Starter",
    value: "$29/mo",
    features: ["2k conversations / mo", "1 agent", "Basic analytics", "Solid for small teams"],
    highlight: false,
  },
  {
    title: "Growth",
    value: "$79/mo",
    features: ["15k conversations / mo", "5 agents", "Full analytics", "API access"],
    highlight: true,
  },
  {
    title: "Enterprise",
    value: "Custom",
    features: ["Unlimited everything", "SSO", "Dedicated SLA", "Dedicated CSM"],
    highlight: false,
  },
];

function ThinkingEvents({ step, events = THINKING_EVENTS }: { step: number; events?: string[] }) {
  return (
    <div className="flex flex-col gap-1.5 px-1">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="ai-sparkle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E1F5E" />
            <stop offset="100%" stopColor="#9B6CF0" />
          </linearGradient>
        </defs>
      </svg>
      {events.slice(0, step).map((label, i) => (
        <div key={i} className="flex items-center gap-2 text-[12px]" style={{ color: MUTED }}>
          <Check className="size-3 shrink-0" strokeWidth={2.5} style={{ color: ACCENT }} />
          {label}
        </div>
      ))}
      {step < events.length && (
        <div className="flex items-center gap-2 text-[12px]" style={{ color: INK }}>
          <Sparkles
            className="size-3.5 shrink-0"
            strokeWidth={1.75}
            fill="none"
            stroke="url(#ai-sparkle)"
            style={{ animation: "event-spin 2.4s linear infinite" }}
          />
          {events[step]}
        </div>
      )}
    </div>
  );
}


/* simple single-line "AI is thinking" indicator (no stepped events) */
function AiThinking() {
  return (
    <div className="flex items-center gap-2 px-1 text-[12px] font-medium" style={{ color: INK }}>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="ai-sparkle2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E1F5E" />
            <stop offset="100%" stopColor="#9B6CF0" />
          </linearGradient>
        </defs>
      </svg>
      <Sparkles className="size-3.5 shrink-0" strokeWidth={1.75} fill="none" stroke="url(#ai-sparkle2)"
        style={{ animation: "event-spin 2.4s linear infinite" }} />
      AI is thinking
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
      className="inline-flex items-center gap-1 text-[11px] font-medium transition-colors hover:opacity-80"
      style={{ color: open ? ACCENT : MUTED }}>
      <Icon className="size-3 shrink-0" strokeWidth={1.75} style={{ color: ACCENT }} />
      {label}
      <ChevronRight className="size-2.5 transition-transform" strokeWidth={2}
        style={{ transform: open ? "rotate(90deg)" : "rotate(0)" }} />
    </button>
  );

  return (
    <div onClick={e => e.stopPropagation()}>
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
                  style={{ backgroundColor: "#F0E7FA", borderColor: "#C5A8E0", color: ACCENT_INK }}>
                  <Check className="size-2" strokeWidth={2.5} />
                </span>
                <span className="text-[11px] leading-[1.5]" style={{ color: MUTED }}>{s}</span>
              </div>
              {i < arr.length - 1 && (
                <span className="ml-[7px] h-4 w-px" style={{ backgroundColor: "#C5A8E0" }} aria-hidden />
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
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left bg-white rounded-[8px]">
                  <p className="text-[11px]" style={{ color: MUTED }}>
                    Called{" "}
                    <code className="mx-0.5 inline-flex items-center rounded-[4px] px-1 py-px align-baseline font-mono text-[10px] tracking-tight"
                      style={{ backgroundColor: "#F0E7FA", color: ACCENT_INK }}>{t.name}</code>
                  </p>
                  <ChevronRight className="size-3 shrink-0 transition-transform" strokeWidth={2}
                    style={{ color: MUTED, transform: isOpen ? "rotate(90deg)" : "rotate(0)" }} aria-hidden />
                </button>
                {isOpen && (
                  <div className="flex flex-col gap-1.5 border-t px-3 py-2 bg-white rounded-b-[8px]"
                    style={{ borderColor: "#E4E4E7", animation: "fade-in 180ms ease-out both" }}>
                    <div>
                      <span className="text-[10px]" style={{ color: "#A8A096" }}>Arguments</span>
                      <pre className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[10px] leading-[1.5]"
                        style={{ color: ACCENT_INK }}>{t.args}</pre>
                    </div>
                    <div>
                      <span className="text-[10px]" style={{ color: "#A8A096" }}>Result</span>
                      <pre className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[10px] leading-[1.5]"
                        style={{ color: ACCENT_INK }}>{t.result}</pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* separator between the strip and the message text below */}
      <div className="mt-1.5 mb-1.5 h-px" style={{ backgroundColor: LINE }} />
    </div>
  );
}


/* ── inline citation chip + hover source card (adapted from the home page) ── */
const CITATION_SOURCES = [
  {
    title: "What is an AI agent?",
    description:
      "How agents understand a goal, reason about it, and take real actions across your tools — beyond a scripted chatbot.",
    url: "tars.com/guides/ai-agents",
  },
  {
    title: "Agents vs. chatbots",
    description:
      "The difference between rule-based chatbots and tool-using agents that resolve tasks and hand off to humans.",
    url: "tars.com/guides/agents-vs-chatbots",
  },
  {
    title: "Pricing & plans overview",
    description:
      "A breakdown of Starter, Growth, and Enterprise — what's included, usage limits, and which fits your scale.",
    url: "tars.com/pricing",
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
        className="ml-0.5 inline-flex size-4 cursor-pointer items-center justify-center rounded-full align-middle text-[10px] font-semibold transition-colors group-hover/cite:!bg-[#F0E7FA] group-hover/cite:!text-[#4A1F77]"
        style={{ backgroundColor: "#E0DAD3", color: "#1a1a1a" }}
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

const MSG_PLANS_INTRO = (
  <>Great — here&apos;s a quick look at our plans. Each one scales with your usage, so you only pay for what you actually need<CitationSource n={3} source={CITATION_SOURCES[2]} />. Most teams start on Growth for the full API access and priority support, then move up as volume grows. If you&apos;re still weighing an agent against a basic chatbot<CitationSource n={1} source={CITATION_SOURCES[0]} />, the short version is that agents take real actions and hand off cleanly to a human<CitationSource n={2} source={CITATION_SOURCES[1]} />. Take a look below and pick whichever fits best.</>
);

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
  const [introChoice, setIntroChoice] = useState<number | null>(null);
  const [chosenLabel, setChosenLabel] = useState("");
  // when a launcher starter is picked, seed the chat to open straight on that starter
  const [pendingStarter, setPendingStarter] = useState<number | null>(null);
  const [panelPhase, setPanelPhase] = useState<"thinking" | "done">("thinking");
  const [thinkingStep, setThinkingStep] = useState(0);
  const [hoveredTurn, setHoveredTurn] = useState<null | 0 | 1 | 2 | 3 | 4 | 5>(null);
  const [conversationTurn, setConversationTurn] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [turn3Phase, setTurn3Phase] = useState<"thinking" | "done">("thinking");
  const [turn3Step, setTurn3Step] = useState(0);
  const [turn4Phase, setTurn4Phase] = useState<"thinking" | "done">("thinking");
  const [turn4Step, setTurn4Step] = useState(0);
  const [turn5Phase, setTurn5Phase] = useState<"thinking" | "done">("thinking");
  const [turn5Step, setTurn5Step] = useState(0);
  const [email, setEmail] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  // interactive action buttons (Listen / Good / Bad / Copy)
  const [speakingTurn, setSpeakingTurn] = useState<number | null>(null);
  const [reactions, setReactions] = useState<Record<number, "like" | "dislike" | null>>({});
  const [copiedTurn, setCopiedTurn] = useState<number | null>(null);
  const copyTimer = useRef<number | null>(null);
  const speakingWordElRef = useRef<HTMLElement | null>(null);
  const clearSpeakingHighlight = () => {
    if (speakingWordElRef.current) { speakingWordElRef.current.classList.remove("speaking-word"); speakingWordElRef.current = null; }
  };
  // header three-dot menu + expand
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [closing, setClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // close the chat by collapsing the panel down, then return to the launcher
  const closeChat = () => {
    setMenuOpen(false);
    setClosing(true);
    window.setTimeout(() => { setPhase("pill"); setClosing(false); }, 400);
  };
  // voice → text (STT) like v2
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const transcribeTimer = useRef<number | null>(null);
  const handleMicClick = () => { setInputText(""); setRecording(true); };
  const handleStopRecording = () => {
    setRecording(false);
    setTranscribing(true);
    transcribeTimer.current = window.setTimeout(() => { setInputText(DEMO_TRANSCRIPT); setTranscribing(false); }, 1400);
  };
  const handleCancelRecording = () => {
    setRecording(false);
    setTranscribing(false);
    if (transcribeTimer.current) window.clearTimeout(transcribeTimer.current);
  };
  const [timeLabel] = useState(() =>
    new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  );

  // auto-growing composer that reflows to multi-line as you type (like the home page)
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const composerMultiline = useMemo(() => {
    if (!inputText) return false;
    const lines = inputText.split("\n");
    const total = lines.reduce(
      (a, l) => a + Math.max(1, Math.ceil(l.length / 45)),
      0,
    );
    return total > 1;
  }, [inputText]);
  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [inputText]);

  // launcher pill input — grow up to 4 lines, then scroll
  const pillInputRef = useRef<HTMLTextAreaElement>(null);
  const PILL_MAX_H = 100; // ~4 lines at 15px / 1.5 line-height + padding
  const [pillMultiline, setPillMultiline] = useState(false);
  useEffect(() => {
    const el = pillInputRef.current;
    if (!el) return;
    el.style.height = "auto";
    const h = el.scrollHeight;
    el.style.height = Math.min(h, PILL_MAX_H) + "px";
    setPillMultiline(h > 40); // one line ≈ 32px; >40 means it wrapped
  }, [inputText, phase]);

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

  const [showScrollToLatest, setShowScrollToLatest] = useState(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollToLatest(el.scrollHeight - el.scrollTop - el.clientHeight > 120);
    el.addEventListener("scroll", onScroll);
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [phase]);
  const scrollToLatest = () => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const [entered, setEntered] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  // send button is disabled at rest, enabled once the pill is focused / chatting
  const sendEnabled = phase === "focused" || phase === "chatting";

  // slide the launcher in from the right 1s after the page loads / refreshes
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const resetConversation = () => {
    setView("chat");
    // if a launcher starter was picked, open straight on it; otherwise show the intro options
    if (pendingStarter !== null) {
      setSelectedStarter(pendingStarter);
      setChosenLabel(COMPOSER_STARTERS[pendingStarter]);
      setIntroChoice(pendingStarter);
      setPendingStarter(null);
    } else {
      setIntroChoice(null);
      setChosenLabel("");
    }
    setPanelPhase("thinking");
    setThinkingStep(0);
    setConversationTurn(1);
    setHoveredTurn(null);
    setSelectedPlan(null);
    setTurn3Phase("thinking");
    setTurn3Step(0);
    setTurn4Phase("thinking");
    setTurn4Step(0);
    setTurn5Phase("thinking");
    setTurn5Step(0);
    setEmail(null);
    setReactions({});
    setCopiedTurn(null);
    setSpeakingTurn(null);
    setInputText("");
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  };

  useEffect(() => {
    if (phase === "chatting") resetConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== "chatting" || panelPhase !== "thinking") return;
    if (conversationTurn === 1) {
      const t = setTimeout(() => setPanelPhase("done"), 650);
      return () => clearTimeout(t);
    }
    if (thinkingStep >= THINKING_EVENTS.length) { setPanelPhase("done"); return; }
    const t = setTimeout(() => setThinkingStep(s => s + 1), 1000);
    return () => clearTimeout(t);
  }, [phase, panelPhase, thinkingStep, conversationTurn]);

  useEffect(() => {
    if (conversationTurn !== 3 || turn3Phase !== "thinking") return;
    if (turn3Step >= THINKING_EVENTS.length) { setTurn3Phase("done"); return; }
    const t = setTimeout(() => setTurn3Step(s => s + 1), 1000);
    return () => clearTimeout(t);
  }, [conversationTurn, turn3Phase, turn3Step]);

  useEffect(() => {
    if (conversationTurn !== 4 || turn4Phase !== "thinking") return;
    if (turn4Step >= EMAIL_ASK_EVENTS.length) { setTurn4Phase("done"); return; }
    const t = setTimeout(() => setTurn4Step(s => s + 1), 700);
    return () => clearTimeout(t);
  }, [conversationTurn, turn4Phase, turn4Step]);

  useEffect(() => {
    if (conversationTurn !== 5 || turn5Phase !== "thinking") return;
    if (turn5Step >= SEND_EVENTS.length) { setTurn5Phase("done"); return; }
    const t = setTimeout(() => setTurn5Step(s => s + 1), 900);
    return () => clearTimeout(t);
  }, [conversationTurn, turn5Phase, turn5Step]);

  const handlePlanClick = (title: string) => {
    if (conversationTurn !== 2) return;
    setSelectedPlan(title);
    setConversationTurn(3);
    setTurn3Phase("thinking");
    setTurn3Step(0);
    setHoveredTurn(null);
  };

  const handleEmailLink = () => {
    if (conversationTurn !== 3) return;
    setConversationTurn(4);
    setTurn4Phase("thinking");
    setTurn4Step(0);
    setHoveredTurn(null);
  };

  const awaitingEmail = conversationTurn === 4 && turn4Phase === "done";

  const handleSend = () => {
    const val = inputText.trim();
    if (awaitingEmail && val) {
      setEmail(val);
      setConversationTurn(5);
      setTurn5Phase("thinking");
      setTurn5Step(0);
      setHoveredTurn(null);
    }
    setInputText("");
  };

  const handleComparePlans = () => {
    setConversationTurn(2);
    setPanelPhase("thinking");
    setThinkingStep(0);
    setHoveredTurn(null);
  };

  const handleStarterClick = (idx: number) => {
    setPressedIdx(idx);
    setSelectedStarter(idx);
    setPendingStarter(idx);
    setTimeout(() => { setPhase("chatting"); setPressedIdx(null); }, 120);
  };

  // pick one of the opening greeting options → becomes the first user turn, AI responds
  const chooseIntro = (i: number) => {
    const opt = INTRO_OPTIONS[i];
    setChosenLabel(opt.label);
    setSelectedStarter(opt.starter);
    setPanelPhase("thinking");
    setThinkingStep(0);
    setConversationTurn(1);
    setHoveredTurn(null);
    setIntroChoice(i);
  };

  // ── action buttons: TTS / react / copy ──
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
    clearSpeakingHighlight();
    if (speakingTurn === turn) { setSpeakingTurn(null); return; }
    const text = getNodeText(content);
    const u = new SpeechSynthesisUtterance(text);
    u.onboundary = (event) => {
      if (event.name !== "word") return;
      const before = text.substring(0, event.charIndex);
      const wordIdx = before.trim() ? before.trim().split(/\s+/).length : 0;
      const bubble = document.querySelector(`[data-message-id="m${turn}"]`);
      const wordEl = bubble?.querySelector<HTMLElement>(`[data-text-word-idx="${wordIdx}"]`);
      if (!wordEl) return;
      if (speakingWordElRef.current && speakingWordElRef.current !== wordEl) speakingWordElRef.current.classList.remove("speaking-word");
      wordEl.classList.add("speaking-word");
      speakingWordElRef.current = wordEl;
    };
    u.onend = () => { clearSpeakingHighlight(); setSpeakingTurn(null); };
    u.onerror = () => { clearSpeakingHighlight(); setSpeakingTurn(null); };
    window.speechSynthesis.speak(u);
    setSpeakingTurn(turn);
  };
  useEffect(() => () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
  }, []);

  const actionsRow = (turn: number, content: ReactNode, mt: string) => {
    const reaction = reactions[turn];
    const iconBtn = "tooltip-host tooltip-below tooltip-left flex items-center justify-center rounded-[5px] p-1 transition-colors";
    return (
      <div className={`flex items-center gap-2 px-1 ${mt}`}
        style={{ opacity: (hoveredTurn === turn || speakingTurn === turn) ? 1 : 0, transition: "opacity 150ms ease" }}>
        <button type="button" aria-label="Read aloud" data-tooltip="Read aloud" className={iconBtn}
          style={{ color: speakingTurn === turn ? INK : MUTED, backgroundColor: speakingTurn === turn ? SUBTLE : "transparent" }}
          onClick={() => handleSpeak(turn, content)}
          onMouseEnter={e => { if (speakingTurn !== turn) { e.currentTarget.style.color = INK; e.currentTarget.style.backgroundColor = SUBTLE; } }}
          onMouseLeave={e => { e.currentTarget.style.color = speakingTurn === turn ? INK : MUTED; e.currentTarget.style.backgroundColor = speakingTurn === turn ? SUBTLE : "transparent"; }}>
          {speakingTurn === turn ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
              <path d="M14 10a3 3 0 0 1 0 4" style={{ animation: "arc-fade 1800ms ease-in-out infinite" }} />
              <path d="M16.5 7.5a6 6 0 0 1 0 9" style={{ animation: "arc-fade 1800ms ease-in-out 350ms infinite" }} />
              <path d="M19.364 5.636a9 9 0 0 1 0 12.728" style={{ animation: "arc-fade 1800ms ease-in-out 700ms infinite" }} />
            </svg>
          ) : (
            <Volume2 className="size-3.5" strokeWidth={1.75} />
          )}
        </button>
        <button type="button" aria-label="Good response" data-tooltip="Good response" className={iconBtn}
          style={{ color: reaction === "like" ? ACCENT : MUTED }}
          onClick={() => handleReact(turn, "like")}
          onMouseEnter={e => { if (reaction !== "like") e.currentTarget.style.backgroundColor = SUBTLE; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
          <ThumbsUp className="size-3.5" strokeWidth={reaction === "like" ? 2 : 1.75} stroke={reaction === "like" ? ACCENT : "currentColor"} fill={reaction === "like" ? "#F0E7FA" : "none"} />
        </button>
        <button type="button" aria-label="Bad response" data-tooltip="Bad response" className={iconBtn}
          style={{ color: reaction === "dislike" ? ACCENT : MUTED }}
          onClick={() => handleReact(turn, "dislike")}
          onMouseEnter={e => { if (reaction !== "dislike") e.currentTarget.style.backgroundColor = SUBTLE; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
          <ThumbsDown className="size-3.5" strokeWidth={reaction === "dislike" ? 2 : 1.75} stroke={reaction === "dislike" ? ACCENT : "currentColor"} fill={reaction === "dislike" ? "#F0E7FA" : "none"} />
        </button>
        <button type="button" aria-label="Copy" data-tooltip={copiedTurn === turn ? "Copied" : "Copy"} className={iconBtn}
          style={{ color: copiedTurn === turn ? ACCENT : MUTED }}
          onClick={() => handleCopy(turn, content)}
          onMouseEnter={e => { if (copiedTurn !== turn) { e.currentTarget.style.color = INK; e.currentTarget.style.backgroundColor = SUBTLE; } }}
          onMouseLeave={e => { e.currentTarget.style.color = copiedTurn === turn ? ACCENT : MUTED; e.currentTarget.style.backgroundColor = "transparent"; }}>
          {copiedTurn === turn ? <Check className="size-3.5" strokeWidth={2.5} stroke={ACCENT} /> : <Copy className="size-3.5" strokeWidth={1.75} />}
        </button>
      </div>
    );
  };

  // close the three-dot menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const handleDownloadTranscript = () => {
    if (typeof window === "undefined") return;
    const L: string[] = ["Assistant: Hi there! I am Tars AI Agent. What can I help you with?"];
    if (introChoice !== null) {
      L.push(`You: ${chosenLabel}`);
      L.push(`Assistant: ${STARTER_RESPONSES[selectedStarter]}`);
    }
    if (conversationTurn >= 2) {
      L.push("You: Compare plans");
      L.push(`Assistant: ${PLANS.map(p => `${p.title} (${p.value})`).join(" | ")}`);
      L.push(`Assistant: ${PLANS_FOLLOWUP}`);
    }
    if (conversationTurn >= 3 && selectedPlan) {
      L.push(`You: ${selectedPlan}`);
      L.push("Assistant: Great pick! Want me to email you the setup link?");
    }
    if (conversationTurn >= 4) {
      L.push("You: Email me the link");
      L.push("Assistant: Sure! What's your email?");
    }
    if (conversationTurn >= 5 && email) {
      L.push(`You: ${email}`);
      L.push(`Assistant: Done! I've sent the setup link to ${email}. Check your inbox 🎉`);
    }
    const blob = new Blob([L.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat-transcript.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

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
        /* v2 "liquid-glass" gradient stroke — colored ring + gliding white glint */
        @property --lg-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes liquid-edge-orbit { to { --lg-angle: 360deg; } }
        .liquid-glass::before, .liquid-glass::after {
          content: "";
          position: absolute;
          padding: 1px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
        .liquid-glass::before {
          inset: 0;
          border-radius: 16px;
          background: conic-gradient(from var(--lg-angle),
            rgba(180,140,255,1) 0deg,
            rgba(150,200,255,1) 55deg,
            rgba(120,230,255,1) 110deg,
            rgba(220,255,255,1) 160deg,
            rgba(255,255,255,1) 180deg,
            rgba(220,255,255,1) 200deg,
            rgba(120,230,255,1) 250deg,
            rgba(150,200,255,1) 305deg,
            rgba(180,140,255,1) 360deg);
          animation: liquid-edge-orbit 5s linear infinite;
        }
        .liquid-glass::after {
          inset: 0;
          border-radius: 16px;
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
      `}</style>
      <div className="relative flex flex-col overflow-hidden" style={{ height: "100vh", width: "100%", backgroundColor: "#FFFFFF" }}>
        {/* landing-page background */}
        <img
          src="/v4-landing-bg.png"
          alt=""
          aria-hidden
          className="absolute inset-0 z-0 h-full w-full object-cover object-top"
        />

        {phase === "chatting" && (
          <div className="absolute inset-0 z-10 pointer-events-none"
            style={{ backgroundColor: "rgba(0,0,0,0.05)", animation: "cvc-bg-in 360ms ease-out both" }} />
        )}
        {phase === "focused" && (
          <div
            className="absolute inset-0 z-20"
            onClick={() => {
              if (recording || transcribing) handleCancelRecording();
              setPhase("pill");
            }}
          />
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
              "transform 1000ms cubic-bezier(0.22,1,0.36,1), opacity 600ms ease",
            pointerEvents: "none",
          }}
        >

          {/* starters */}
          {phase === "focused" && !recording && !transcribing && (
            <div className="flex flex-col items-end gap-2">
              {COMPOSER_STARTERS.map((s, i) => (
                <button key={s}
                  className="pointer-events-auto rounded-full border px-3.5 py-1.5 text-[14px] text-right whitespace-nowrap"
                  style={{
                    borderColor: ACCENT_BORDER,
                    backgroundColor: pressedIdx === i ? ACCENT_SOFT_PRESSED : ACCENT_SOFT,
                    color: ACCENT,
                    boxShadow: "0 2px 10px -2px rgba(0,0,0,0.10)",
                    animation: `cpill-starter-in 260ms cubic-bezier(0.22,1,0.36,1) both`,
                    animationDelay: `${60 + i * 60}ms`,
                    transition: "background-color 140ms ease-out",
                  }}
                  onMouseEnter={e => { if (pressedIdx !== i) e.currentTarget.style.backgroundColor = ACCENT_SOFT_HOVER; }}
                  onMouseLeave={e => { if (pressedIdx !== i) e.currentTarget.style.backgroundColor = ACCENT_SOFT; }}
                  onClick={e => { e.stopPropagation(); handleStarterClick(i); }}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* chat panel */}
          {phase === "chatting" && (
            <div data-chat-card className="pointer-events-auto relative rounded-[28px] border bg-[#FEFCF8] overflow-hidden flex flex-col"
              style={{
                width: panelExpanded ? 515 : 400, height: 680, borderColor: LINE,
                justifyContent: closing ? "flex-end" : undefined,
                transform: panelExpanded ? "scale(1.088)" : "scale(1)",
                transformOrigin: "bottom right",
                boxShadow: "0 12px 40px -8px rgba(0,0,0,0.18), 0 2px 10px rgba(0,0,0,0.06)",
                animation: closing
                  ? "cpill-panel-fall 400ms cubic-bezier(0.22,1,0.36,1) both"
                  : "cpill-panel-rise 520ms cubic-bezier(0.22,1,0.36,1) both",
                transition: "width 320ms cubic-bezier(0.22,1,0.36,1), transform 320ms cubic-bezier(0.22,1,0.36,1)",
              }}>
              {/* history overlay — slides in from the left */}
              <div className="absolute inset-0 z-40"
                style={{
                  transform: view === "history" ? "translateX(0)" : "translateX(-100%)",
                  opacity: view === "history" ? 1 : 0,
                  pointerEvents: view === "history" ? "auto" : "none",
                  transition: "transform 320ms cubic-bezier(0.22,1,0.36,1), opacity 220ms ease",
                }}>
                <HistoryView onBack={() => setView("chat")} onNew={resetConversation} onOpen={() => setView("chat")} />
              </div>
              <div className="flex w-full items-center gap-1 px-4 h-16 border-b shrink-0" style={{ borderColor: LINE }}>
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Chat history"
                    data-tooltip="History"
                    className="tooltip-host tooltip-below tooltip-left flex size-7 shrink-0 items-center justify-center rounded-[6px] transition-colors"
                    style={{ color: MUTED }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = SUBTLE; e.currentTarget.style.color = INK; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = MUTED; }}
                    onClick={() => setView("history")}
                  >
                    <ChevronLeft className="size-5" strokeWidth={1.5} />
                  </button>
                  <div className="ml-1 size-7 shrink-0 overflow-hidden rounded-[8px]">
                    <img src="/tars-avatar.png" alt="" className="size-full scale-105 object-cover" />
                  </div>
                  <div className="ml-1.5 flex min-w-0 items-center">
                    <p className="truncate text-[16px] font-semibold" style={{ color: "#333" }}>Tars Agent</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <div ref={menuRef} className="relative">
                    <button
                      className="tooltip-host tooltip-below flex size-7 items-center justify-center rounded-[6px] transition-colors"
                      style={{ color: menuOpen ? INK : MUTED, backgroundColor: menuOpen ? SUBTLE : "transparent" }}
                      aria-label="More options"
                      data-tooltip="More"
                      aria-expanded={menuOpen}
                      onClick={() => setMenuOpen(o => !o)}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = SUBTLE; e.currentTarget.style.color = INK; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = menuOpen ? SUBTLE : "transparent"; e.currentTarget.style.color = menuOpen ? INK : MUTED; }}
                    >
                      <MoreVertical className="size-4" strokeWidth={1.5} />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 top-[calc(100%+6px)] z-30 flex w-44 flex-col overflow-hidden rounded-[10px] border p-1"
                        style={{ backgroundColor: "#FEFCF8", borderColor: LINE, boxShadow: "0 10px 28px -8px rgba(0,0,0,0.22), 0 1px 2px rgba(0,0,0,0.05)", animation: "fade-in 160ms ease-out both" }}
                        role="menu">
                        <button type="button" role="menuitem"
                          onClick={() => { setMenuOpen(false); setPanelExpanded(e => !e); }}
                          className="flex w-full items-center gap-2 whitespace-nowrap rounded-[6px] px-2 py-1.5 text-left text-[12px] transition-colors hover:bg-[#F0EBE0]"
                          style={{ color: INK }}>
                          {panelExpanded
                            ? <Minimize2 className="size-3.5" strokeWidth={1.75} style={{ color: MUTED }} />
                            : <Maximize2 className="size-3.5" strokeWidth={1.75} style={{ color: MUTED }} />}
                          {panelExpanded ? "Collapse window" : "Expand window"}
                        </button>
                        <button type="button" role="menuitem"
                          onClick={() => { setMenuOpen(false); resetConversation(); }}
                          className="flex w-full items-center gap-2 whitespace-nowrap rounded-[6px] px-2 py-1.5 text-left text-[12px] transition-colors hover:bg-[#F0EBE0]"
                          style={{ color: INK }}>
                          <RotateCcw className="size-3.5" strokeWidth={1.75} style={{ color: MUTED }} />
                          Restart
                        </button>
                        <button type="button" role="menuitem"
                          onClick={() => { setMenuOpen(false); handleDownloadTranscript(); }}
                          className="flex w-full items-center gap-2 whitespace-nowrap rounded-[6px] px-2 py-1.5 text-left text-[12px] transition-colors hover:bg-[#F0EBE0]"
                          style={{ color: INK }}>
                          <Download className="size-3.5" strokeWidth={1.75} style={{ color: MUTED }} />
                          Download transcript
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    className="tooltip-host tooltip-below tooltip-right flex size-7 items-center justify-center rounded-[6px] transition-colors"
                    style={{ color: MUTED }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = SUBTLE; e.currentTarget.style.color = INK; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = MUTED; }}
                    onClick={closeChat}
                    aria-label="Close"
                    data-tooltip="Close"
                  >
                    <X className="size-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
              <div ref={scrollRef} className="flex flex-1 flex-col gap-3 px-4 py-4 overflow-y-auto scrollbar-subtle">
                {/* opening AI greeting — always the starting point */}
                <div onMouseEnter={() => setHoveredTurn(0)} onMouseLeave={() => setHoveredTurn(null)}>
                  <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: MUTED }}>
                    AI Agent <span style={{ color: "#A8A096" }}>• {timeLabel}</span>
                  </p>
                  <div className="w-fit max-w-[88%] rounded-[10px] rounded-bl-[3px] border px-3.5 py-2 text-[14px] leading-relaxed" data-message-id="m0" style={{ backgroundColor: "#F9F3EA", borderColor: "#E0DAD3", color: INK }}>
                    <Words>Hi there! I am Tars AI Agent.<br />What can I help you with?</Words>
                  </div>
                  {introChoice === null && (
                    <div className="flex flex-wrap gap-2 px-1 mt-3">
                      {INTRO_OPTIONS.map((opt, i) => (
                        <button key={opt.label} className="rounded-full border px-3.5 py-1.5 text-[14px]"
                          style={{ borderColor: "#E0DAD3", color: INK, backgroundColor: "#F9F3EA", transition: "background-color 150ms ease, border-color 150ms ease, color 150ms ease", animation: "option-in 280ms cubic-bezier(0.2,0.6,0.2,1) both", animationDelay: `${120 + i * 70}ms` }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#F0E7FA"; e.currentTarget.style.borderColor = "#C5A8E0"; e.currentTarget.style.color = "#4A1F77"; }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#F9F3EA"; e.currentTarget.style.borderColor = "#E0DAD3"; e.currentTarget.style.color = INK; }}
                          onClick={() => chooseIntro(i)}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {actionsRow(0, "Hi there! I am Tars AI Agent. What can I help you with?", "mt-2.5")}
                </div>
                {introChoice !== null && (
                  <>
                <div className="flex justify-end">
                  <div className="rounded-[10px] rounded-br-[3px] border px-3.5 py-2 text-[14px] leading-relaxed"
                    style={{ backgroundColor: "#F0E7FA", borderColor: "#C5A8E0", color: "#4A1F77", maxWidth: 260 }}>
                    {chosenLabel || COMPOSER_STARTERS[selectedStarter]}
                  </div>
                </div>
                {conversationTurn === 1 && panelPhase === "thinking" && <AiThinking />}
                {(panelPhase === "done" || conversationTurn === 2) && (() => {
                  const animated = conversationTurn === 1;
                  const isRichAnswer = selectedStarter === 2;
                  const richTokens = isRichAnswer ? buildAgentTokens(animated) : null;
                  const words = STARTER_RESPONSES[selectedStarter].split(" ");
                  const wordsDelay = (isRichAnswer ? richTokens!.length : words.length) * 42;
                  return (
                    <div onMouseEnter={() => setHoveredTurn(1)} onMouseLeave={() => setHoveredTurn(null)}>
                      <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: MUTED }}>
                        AI Agent <span style={{ color: "#A8A096" }}>• {timeLabel}</span>
                      </p>
                      <div className="w-fit max-w-[88%] rounded-[10px] rounded-bl-[3px] border px-3.5 py-2 text-[14px] leading-relaxed" data-message-id="m1" style={{ backgroundColor: "#F9F3EA", borderColor: "#E0DAD3", color: INK }}>
                        {isRichAnswer ? richTokens : (animated ? <Words>{STARTER_RESPONSES[selectedStarter]}</Words> : STARTER_RESPONSES[selectedStarter])}
                      </div>
                      {conversationTurn === 1 && (
                        <div className="flex flex-wrap gap-2 px-1 mt-3">
                          {STARTER_OPTIONS[selectedStarter].map((opt, i) => (
                            <button key={opt} className="rounded-full border px-3.5 py-1.5 text-[14px]"
                              style={{
                                borderColor: "#E0DAD3", color: INK, backgroundColor: "#F9F3EA",
                                transition: "background-color 150ms ease, border-color 150ms ease, color 150ms ease",
                                animation: "option-in 280ms cubic-bezier(0.2,0.6,0.2,1) both",
                                animationDelay: `${wordsDelay + 60 + i * 60}ms`,
                              }}
                              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#F0E7FA"; e.currentTarget.style.borderColor = "#C5A8E0"; e.currentTarget.style.color = "#4A1F77"; }}
                              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#F9F3EA"; e.currentTarget.style.borderColor = "#E0DAD3"; e.currentTarget.style.color = INK; }}
                              onClick={opt === "Compare plans" ? handleComparePlans : undefined}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                      {actionsRow(1, STARTER_RESPONSES[selectedStarter], "mt-2.5")}
                    </div>
                  );
                })()}
                {conversationTurn >= 2 && (
                  <>
                    <div className="flex justify-end">
                      <div className="rounded-[10px] rounded-br-[3px] border px-3.5 py-2 text-[14px] leading-relaxed"
                        style={{ backgroundColor: "#F0E7FA", borderColor: "#C5A8E0", color: "#4A1F77", maxWidth: 260 }}>Compare plans</div>
                    </div>
                    {panelPhase === "thinking" && <ThinkingEvents step={thinkingStep} />}
                    {panelPhase === "done" && (
                      <div onMouseEnter={() => setHoveredTurn(2)} onMouseLeave={() => setHoveredTurn(null)}>
                        <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: MUTED }}>
                          AI Agent <span style={{ color: "#A8A096" }}>• {timeLabel}</span>
                        </p>
                        <div className="w-fit max-w-[88%] rounded-[10px] rounded-bl-[3px] border px-3.5 py-2 text-[14px] leading-relaxed" data-message-id="m2" style={{ backgroundColor: "#F9F3EA", borderColor: "#E0DAD3", color: INK }}>
                          <Words>{MSG_PLANS_INTRO}</Words>
                        </div>
                        {/* plan cards — horizontal scroll */}
                        <div className="mt-2 flex gap-2 overflow-x-auto scrollbar-subtle px-0.5 pt-1 pb-1">
                          {PLANS.map((plan, i) => (
                            <div
                              key={plan.title}
                              className={`flex shrink-0 w-[190px] min-h-[120px] flex-col rounded-[12px] border p-2.5 ${conversationTurn === 2 ? "cursor-pointer" : "cursor-default"}`}
                              style={{
                                backgroundColor: "#F9F3EA",
                                borderColor: selectedPlan === plan.title ? ACCENT : "#E0DAD3",
                                transition: "border-color 150ms ease",
                                animation: "option-in 280ms cubic-bezier(0.2,0.6,0.2,1) both",
                                animationDelay: `${streamMs(MSG_PLANS_INTRO) + i * 90}ms`,
                              }}
                              onMouseEnter={(e) => {
                                if (conversationTurn === 2) e.currentTarget.style.borderColor = "#C5A8E0";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = selectedPlan === plan.title ? ACCENT : "#E0DAD3";
                              }}
                              onClick={() => handlePlanClick(plan.title)}
                            >
                              {/* title + badge */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-[13px] font-semibold" style={{ color: INK }}>{plan.title}</span>
                                {plan.highlight && (
                                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: "#F0E7FA", color: "#632E9A" }}>
                                    Popular
                                  </span>
                                )}
                              </div>
                              {/* features as bullet points */}
                              <ul className="mt-1.5 flex flex-col gap-1">
                                {plan.features.map((f) => (
                                  <li key={f} className="flex items-start gap-1.5 text-[12px] leading-[1.35]" style={{ color: MUTED }}>
                                    <span className="mt-[6px] size-[3px] shrink-0 rounded-full" style={{ backgroundColor: "#C5A8E0" }} />
                                    <span>{f}</span>
                                  </li>
                                ))}
                              </ul>
                              {/* footer: value */}
                              <div className="mt-3 border-t pt-2" style={{ borderColor: "#E0DAD3" }}>
                                <span className="text-[13px] font-bold" style={{ color: ACCENT }}>{plan.value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* follow-up question — appears after the intro streams */}
                        <div className="mt-2 w-fit max-w-[88%] rounded-[10px] rounded-bl-[3px] border px-3.5 py-2 text-[14px] leading-relaxed" style={{ backgroundColor: "#F9F3EA", borderColor: "#E0DAD3", color: INK, animation: "option-in 280ms cubic-bezier(0.2,0.6,0.2,1) both", animationDelay: `${streamMs(MSG_PLANS_INTRO) + PLANS.length * 90 + 200}ms` }}>
                          <Words delay={streamMs(MSG_PLANS_INTRO) + PLANS.length * 90 + 200}>{PLANS_FOLLOWUP}</Words>
                        </div>
                        {actionsRow(2, PLANS_FOLLOWUP, "mt-2.5")}
                      </div>
                    )}
                  </>
                )}
                {conversationTurn >= 3 && (
                  <>
                    <div className="flex justify-end">
                      <div className="rounded-[10px] rounded-br-[3px] border px-3.5 py-2 text-[14px] leading-relaxed"
                        style={{ backgroundColor: "#F0E7FA", borderColor: "#C5A8E0", color: "#4A1F77", maxWidth: 260 }}>
                        {selectedPlan}
                      </div>
                    </div>
                    {turn3Phase === "thinking" && <ThinkingEvents step={turn3Step} />}
                    {turn3Phase === "done" && (
                      <div onMouseEnter={() => setHoveredTurn(3)} onMouseLeave={() => setHoveredTurn(null)}>
                        <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: MUTED }}>
                          AI Agent <span style={{ color: "#A8A096" }}>• {timeLabel}</span>
                        </p>
                        <div className="w-fit max-w-[88%] rounded-[10px] rounded-bl-[3px] border px-3.5 py-2 text-[14px] leading-relaxed" data-message-id="m3" style={{ backgroundColor: "#F9F3EA", borderColor: "#E0DAD3", color: INK }}>
                          <Words>Great pick! Want me to email you the setup link?</Words>
                        </div>
                        {conversationTurn === 3 && (
                          <div className="flex flex-wrap gap-2 px-1 mt-3">
                            {["Email me the link", "Talk to sales"].map((opt, i) => (
                              <button key={opt} className="rounded-full border px-3.5 py-1.5 text-[14px]"
                                style={{
                                  borderColor: "#E0DAD3", color: INK, backgroundColor: "#F9F3EA",
                                  transition: "background-color 150ms ease, border-color 150ms ease, color 150ms ease",
                                  animation: "option-in 280ms cubic-bezier(0.2,0.6,0.2,1) both",
                                  animationDelay: `${60 + i * 60}ms`,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#F0E7FA"; e.currentTarget.style.borderColor = "#C5A8E0"; e.currentTarget.style.color = "#4A1F77"; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#F9F3EA"; e.currentTarget.style.borderColor = "#E0DAD3"; e.currentTarget.style.color = INK; }}
                                onClick={opt === "Email me the link" ? handleEmailLink : undefined}>
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                        {actionsRow(3, "Great pick! Want me to email you the setup link?", "mt-2.5")}
                      </div>
                    )}
                  </>
                )}
                {conversationTurn >= 4 && (
                  <>
                    <div className="flex justify-end">
                      <div className="rounded-[10px] rounded-br-[3px] border px-3.5 py-2 text-[14px] leading-relaxed"
                        style={{ backgroundColor: "#F0E7FA", borderColor: "#C5A8E0", color: "#4A1F77", maxWidth: 260 }}>
                        Email me the link
                      </div>
                    </div>
                    {turn4Phase === "thinking" && <ThinkingEvents step={turn4Step} events={EMAIL_ASK_EVENTS} />}
                    {turn4Phase === "done" && (
                      <div onMouseEnter={() => setHoveredTurn(4)} onMouseLeave={() => setHoveredTurn(null)}>
                        <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: MUTED }}>
                          AI Agent <span style={{ color: "#A8A096" }}>• {timeLabel}</span>
                        </p>
                        <div className="w-fit max-w-[88%] rounded-[10px] rounded-bl-[3px] border px-3.5 py-2 text-[14px] leading-relaxed" style={{ backgroundColor: "#F9F3EA", borderColor: "#E0DAD3", color: INK }}>
                          <Words>Sure! What&apos;s your email?</Words>
                        </div>
                      </div>
                    )}
                  </>
                )}
                {conversationTurn === 5 && (
                  <>
                    <div className="flex justify-end">
                      <div className="rounded-[10px] rounded-br-[3px] border px-3.5 py-2 text-[14px] leading-relaxed"
                        style={{ backgroundColor: "#F0E7FA", borderColor: "#C5A8E0", color: "#4A1F77", maxWidth: 260 }}>
                        {email}
                      </div>
                    </div>
                    {turn5Phase === "thinking" && <ThinkingEvents step={turn5Step} events={SEND_EVENTS} />}
                    {turn5Phase === "done" && (
                      <div onMouseEnter={() => setHoveredTurn(5)} onMouseLeave={() => setHoveredTurn(null)}>
                        <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: MUTED }}>
                          AI Agent <span style={{ color: "#A8A096" }}>• {timeLabel}</span>
                        </p>
                        <div className="w-fit max-w-[88%] rounded-[10px] rounded-bl-[3px] border px-3.5 py-2 text-[14px] leading-relaxed" data-message-id="m5" style={{ backgroundColor: "#F9F3EA", borderColor: "#E0DAD3", color: INK }}>
                          <ReasoningToolsStrip
                            reasoning={[
                              <>Validated <span className="font-medium">{email}</span> as a deliverable address</>,
                              <>
                                Called{" "}
                                <code className="mx-0.5 inline-flex items-center rounded-[4px] px-1 py-px font-mono text-[10px] tracking-tight"
                                  style={{ backgroundColor: "#F0E7FA", color: ACCENT_INK }}>send_SetupEmail</code>{" "}
                                to deliver the {selectedPlan} trial link
                              </>,
                              <>Scheduled a reminder in case the trial isn&apos;t activated within 24h</>,
                            ]}
                            tools={[
                              {
                                name: "validate_Email",
                                args: `{ "email": "${email}" }`,
                                result: `{ "valid": true, "deliverable": true }`,
                              },
                              {
                                name: "send_SetupEmail",
                                args: `{ "to": "${email}", "plan": "${selectedPlan}", "template": "trial_setup" }`,
                                result: `{ "message_id": "msg_7c2f9a", "status": "sent" }`,
                              },
                              {
                                name: "schedule_Reminder",
                                args: `{ "to": "${email}", "after_hours": 24, "condition": "not_activated" }`,
                                result: `{ "scheduled": true, "job_id": "job_4471" }`,
                              },
                            ]}
                          />
                          <Words>Done! I&apos;ve sent the setup link to <span className="font-semibold">{email}</span>. Check your inbox 🎉</Words>
                        </div>
                        {actionsRow(5, `Done! I've sent the setup link to ${email}. Check your inbox 🎉`, "mt-1")}
                      </div>
                    )}
                  </>
                )}
                  </>
                )}
              </div>
              {/* composer — docked inside the chat window, styled like v3 */}
              <div className="relative flex flex-col gap-1.5 px-3 pb-3 pt-2 shrink-0">
                {showScrollToLatest && (
                  <button type="button" onClick={scrollToLatest} aria-label="Scroll to latest message" data-tooltip="Scroll to latest"
                    className="tooltip-host absolute -top-9 left-[calc(50%+12px)] z-30 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border bg-white transition-transform hover:scale-110 active:scale-95"
                    style={{ borderColor: LINE, color: ACCENT, boxShadow: "0 4px 12px -2px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)", animation: "scroll-btn-in 220ms cubic-bezier(0.2,0.6,0.2,1) both" }}>
                    <ArrowDown className="size-4" strokeWidth={2} />
                  </button>
                )}
                {inputText.trim() && (
                  <div
                    className="flex items-center justify-center gap-1 px-1 text-[10px] leading-4"
                    style={{ color: "#A8A096", animation: "fade-in 180ms ease-out both" }}
                  >
                    Press
                    <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded-[3px] border bg-white px-1 font-sans text-[10px] leading-none" style={{ borderColor: "#C5A8E0", color: MUTED }}>
                      ↵
                    </kbd>
                    to send
                  </div>
                )}
                <div
                  className={`flex w-full rounded-[12px] border border-[var(--ds-border-line)] bg-[var(--ds-bg-paper)] transition-all duration-200 hover:border-[var(--ds-border-hover)] focus-within:!border-[#632E9A] focus-within:!ring-4 focus-within:!ring-[#632E9A]/15 ${
                    composerMultiline
                      ? "flex-wrap items-end gap-x-1.5 gap-y-1 px-3 py-1.5"
                      : "items-end gap-2 px-3 py-2"
                  }`}
                >
                  {/* left — attachment, becomes cancel (X) while recording */}
                  <button
                    type="button"
                    aria-label={recording ? "Cancel recording" : "Add attachment"}
                    data-tooltip={recording ? "Cancel" : "Attach"}
                    onClick={recording ? handleCancelRecording : undefined}
                    disabled={transcribing}
                    className={`tooltip-host tooltip-left flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)] active:bg-[var(--ds-bg-subtle)] disabled:opacity-40 ${
                      composerMultiline ? "order-2 mr-auto" : ""
                    }`}
                  >
                    {recording ? <X className="size-4" strokeWidth={2} /> : <Plus className="size-4" strokeWidth={1.5} />}
                  </button>
                  {/* middle — waveform while recording, otherwise the text field */}
                  {recording ? (
                    <div className="flex min-w-0 flex-1 items-center justify-center gap-[3px] overflow-hidden px-1 py-[5px]" style={{ minHeight: 28 }} aria-hidden>
                      {WAVEFORM_HEIGHTS.map((h, i) => (
                        <span key={i} className="block w-px origin-center rounded-full"
                          style={{ height: `${Math.round(h * 18)}px`, backgroundColor: "#632E9A", animation: `wave-bar 1.6s ease-in-out ${i * 45}ms infinite` }} />
                      ))}
                    </div>
                  ) : (
                    <textarea
                      ref={composerRef}
                      rows={1}
                      disabled={transcribing}
                      placeholder={transcribing ? "Transcribing…" : awaitingEmail ? "Enter your email…" : "Ask me anything..."}
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      className={`block min-w-0 resize-none bg-transparent text-[14px] leading-[1.5] text-[#333] outline-none placeholder:text-[#555] ${
                        composerMultiline ? "order-1 w-full basis-full px-2 pt-3 pb-1.5" : "flex-1 py-[5px]"
                      }`}
                      style={{ maxHeight: "140px", overflowY: "auto", boxSizing: "border-box" }}
                    />
                  )}
                  {/* right — stop / spinner / send / mic */}
                  {recording ? (
                    <button type="button" aria-label="Stop recording" onClick={handleStopRecording}
                      className={`flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-[#8456C9] text-white transition-colors hover:bg-[#744AB5] active:scale-95 ${composerMultiline ? "order-3" : ""}`}>
                      <Square className="size-3" strokeWidth={0} fill="currentColor" />
                    </button>
                  ) : transcribing ? (
                    <button type="button" disabled aria-label="Transcribing"
                      className={`flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--ds-text-secondary)] ${composerMultiline ? "order-3" : ""}`}>
                      <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
                    </button>
                  ) : inputText.trim() ? (
                    <button
                      type="button"
                      aria-label="Send message"
                      data-tooltip="Send"
                      onClick={handleSend}
                      className={`tooltip-host tooltip-right flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-[#8456C9] text-white transition-colors hover:bg-[#744AB5] active:bg-[#6A3FA0] ${
                        composerMultiline ? "order-3" : ""
                      }`}
                    >
                      <ArrowUp className="size-4" strokeWidth={2} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label="Voice input"
                      data-tooltip="Voice"
                      onClick={handleMicClick}
                      className={`tooltip-host tooltip-right flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)] active:bg-[var(--ds-bg-subtle)] ${
                        composerMultiline ? "order-3" : ""
                      }`}
                    >
                      <Mic className="size-4" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* bottom row — Corner Pill; collapses away once the chat window takes over */}
          <div
            className="pointer-events-auto relative flex items-center"
            style={{
              maxHeight: phase === "chatting" ? 0 : 120,
              opacity: phase === "chatting" ? 0 : 1,
              overflow: phase === "chatting" ? "hidden" : "visible",
              transition:
                "max-height 320ms cubic-bezier(0.22,1,0.36,1), opacity 220ms ease",
              pointerEvents: phase === "chatting" ? "none" : "auto",
            }}
          >
            {/* floating close badge — detached, sits just above the pill */}
            <button
              type="button"
              aria-label="Close composer"
              onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
              className="flex items-center justify-center rounded-full bg-white"
              style={{
                position: "absolute",
                left: 0,
                bottom: "100%",
                width: 19,
                height: 19,
                border: "1px solid #E3E3E3",
                color: "#979797",
                transform: "translate(-14px, 0px)",
                opacity: phase === "pill" ? 1 : 0,
                pointerEvents: phase === "pill" ? "auto" : "none",
                transition: "opacity 160ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = INK)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#979797")}
            >
              <X className="size-2.5" strokeWidth={2.5} />
            </button>

            {/* pill */}
            <div
              className={`liquid-glass relative flex gap-2.5 bg-white cursor-text ${pillMultiline ? "items-end" : "items-center"} ${phase === "focused" ? "lg-still" : ""}`}
              style={{
                width: phase === "pill" ? 280 : 380,
                minHeight: 52,
                borderRadius: 16,
                boxShadow: "0 2px 16px -4px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.06)",
                padding: pillMultiline ? "10px 8px 10px 16px" : "0 8px 0 16px",
                transition: "width 300ms cubic-bezier(0.22,1,0.36,1), padding 160ms ease-out",
              }}
              onClick={() => { if (phase === "pill") setPhase("focused"); }}
            >
              {recording ? (
                <>
                  {/* cancel */}
                  <button
                    type="button"
                    aria-label="Cancel recording"
                    onClick={(e) => { e.stopPropagation(); handleCancelRecording(); }}
                    className="size-7 flex items-center justify-center shrink-0 rounded-full transition-colors"
                    style={{ color: MUTED }}
                    onMouseEnter={e => (e.currentTarget.style.color = INK)}
                    onMouseLeave={e => (e.currentTarget.style.color = MUTED)}
                  >
                    <X className="size-4" strokeWidth={2} />
                  </button>
                  {/* waveform */}
                  <div className="flex min-w-0 flex-1 items-center justify-center gap-[3px] overflow-hidden px-1 py-[5px]" style={{ minHeight: 28 }} aria-hidden>
                    {WAVEFORM_HEIGHTS.map((h, i) => (
                      <span key={i} className="block w-px origin-center rounded-full"
                        style={{ height: `${Math.round(h * 18)}px`, backgroundColor: "#632E9A", animation: `wave-bar 1.6s ease-in-out ${i * 45}ms infinite` }} />
                    ))}
                  </div>
                  {/* stop */}
                  <button
                    type="button"
                    aria-label="Stop recording"
                    onClick={(e) => { e.stopPropagation(); handleStopRecording(); }}
                    className="size-7 flex items-center justify-center shrink-0 rounded-full text-white transition-colors"
                    style={{ backgroundColor: "#632E9A" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = ACCENT_INK)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#632E9A")}
                  >
                    <Square className="size-3" strokeWidth={0} fill="currentColor" />
                  </button>
                </>
              ) : (
                <>
                  <textarea
                    ref={pillInputRef}
                    rows={1}
                    disabled={transcribing}
                    className="scrollbar-subtle flex-1 min-w-0 resize-none bg-transparent text-[15px] leading-[1.5] tracking-tight outline-none placeholder:text-[14px] placeholder:text-[#979797] py-[5px]"
                    style={{ color: INK, maxHeight: PILL_MAX_H, overflowY: "auto", boxSizing: "border-box" }}
                    placeholder={transcribing ? "Transcribing…" : "Ask me anything…"}
                    readOnly={phase === "pill"}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onFocus={() => { if (phase === "pill") setPhase("focused"); }}
                  />
                  <button
                    type="button"
                    aria-label={transcribing ? "Transcribing" : sendEnabled ? "Send message" : "Voice input"}
                    className="size-7 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    style={{
                      borderRadius: 9999,
                      backgroundColor: "#632E9A",
                      color: "#FFFFFF",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = ACCENT_INK)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#632E9A")}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (transcribing) return;
                      if (sendEnabled) { if (inputText.trim()) handleSend(); }
                      else { setPhase("focused"); handleMicClick(); }
                    }}
                  >
                    {transcribing
                      ? <Loader2 className="size-3.5 animate-spin" strokeWidth={1.75} />
                      : sendEnabled
                        ? <ArrowUp className="size-3.5" strokeWidth={2.5} />
                        : <Mic className="size-3.5" strokeWidth={2} />}
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

const HISTORY_CHATS = [
  { id: "1", title: "Refund for Order #3081", preview: "You: thanks, all sorted", time: "Today", initial: "T", unread: false },
  { id: "2", title: "Upgrading to Studio plan", preview: "Tars: here are the differences…", time: "Yesterday", initial: "T", unread: true },
  { id: "3", title: "Custom domain setup", preview: "Priya: I've added the DNS…", time: "Mar 12", initial: "P", unread: false },
  { id: "4", title: "Welcome to Tars", preview: "Tars: Good morning. I'm…", time: "Mar 8", initial: "T", unread: false },
];

function HistoryView({ onBack, onNew, onOpen }: { onBack: () => void; onNew: () => void; onOpen: () => void }) {
  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: "#FEFCF8" }}>
      <header className="flex items-center justify-between border-b px-4 h-16 shrink-0" style={{ borderColor: LINE }}>
        <div className="flex items-center gap-2">
          <button onClick={onBack} aria-label="Back to chat" data-tooltip="Back"
            className="tooltip-host tooltip-below tooltip-left flex size-7 shrink-0 items-center justify-center rounded-[6px] transition-colors"
            style={{ color: MUTED }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = SUBTLE; e.currentTarget.style.color = INK; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = MUTED; }}>
            <ChevronLeft className="size-5" strokeWidth={1.5} />
          </button>
          <p className="text-[18px] leading-6 font-semibold" style={{ color: INK }}>History</p>
        </div>
        <button type="button" onClick={onNew}
          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors"
          style={{ borderColor: LINE, backgroundColor: "#FEFCF8", color: INK }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = SUBTLE; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#FEFCF8"; }}>
          <Plus className="size-3" strokeWidth={2.25} />
          New
        </button>
      </header>
      <div className="scrollbar-subtle flex-1 overflow-y-auto">
        {HISTORY_CHATS.map((c) => (
          <button key={c.id} type="button" onClick={onOpen}
            className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors"
            style={{ borderColor: LINE }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#F9F3EA"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; }}>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold"
              style={{ borderColor: LINE, backgroundColor: "#F4EFE5", color: ACCENT_INK }}>
              {c.initial}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[13px] font-medium" style={{ color: INK }}>{c.title}</p>
                <p className="shrink-0 text-[10px] font-medium" style={{ color: "#A8A096" }}>{c.time}</p>
              </div>
              <p className="truncate text-[12px]" style={{ color: MUTED }}>{c.preview}</p>
            </div>
            {c.unread && <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: ACCENT }} />}
          </button>
        ))}
      </div>
    </div>
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
