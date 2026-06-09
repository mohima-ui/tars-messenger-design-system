"use client";

import { useState, useEffect, useRef, Fragment, isValidElement, cloneElement, type ReactNode, type ReactElement } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  AudioLines,
  ArrowUp,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Sparkles,
  Database,
  ExternalLink,
  Mic,
  Loader2,
  Square,
  Plus,
  RotateCcw,
  Download,
} from "lucide-react";

/* ── streams any content (text, bold, citations) in word-by-word ── */
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

/* ── design tokens + helpers ── */
const LINE = "rgba(0,0,0,0.10)";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT_INK = "#4348C7";
const SKEL_BG = "rgba(255,255,255,0.6)";

/* voice-input demo */
const DEMO_TRANSCRIPT = "Can you tell me more about the Studio plan?";
const WAVEFORM_HEIGHTS = Array.from({ length: 26 }, (_, i) => {
  const seed = Math.sin(i * 0.45) * 0.35 + Math.sin(i * 1.7 + 1.2) * 0.45 + 0.55;
  return Math.max(0.18, Math.min(1, seed));
});

/* ── conversation data + thinking events ── */
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
        <div key={i} className="flex items-center gap-2 text-[12px] font-medium" style={{ color: "#3A3A45" }}>
          <Check className="size-3 shrink-0" strokeWidth={2.5} stroke="url(#ind-grad)" />
          {label}
        </div>
      ))}
      {step < events.length && (
        <div className="flex items-center gap-2 text-[12px] font-medium" style={{ color: "#3A3A45" }}>
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

/* generic indicator — "AI is thinking" with a rotating sparkle */
function AiThinking() {
  return (
    <div className="flex items-center gap-2 px-1 text-[12px] font-medium" style={{ color: "#3A3A45" }}>
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

/* ── Reasoning / Tools-used disclosure strip ── */
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

/* ── inline citation chip + hover source card ── */
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
    const POPOVER_W = 280;
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
        className="pointer-events-none absolute bottom-full left-1/2 z-20 w-[280px] pb-2 opacity-0 transition-opacity duration-150 group-hover/cite:pointer-events-auto group-hover/cite:opacity-100"
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

const GLASS_PANEL = {
  backgroundColor: "rgba(255,255,255,0.5)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
} as const;

/* shared AI bubble style (kept from the mobile file) */
const AI_BUBBLE_STYLE = {
  backgroundColor: "rgba(255,255,255,0.82)",
  color: "#2B2B33",
  boxShadow: "0 6px 18px -8px rgba(40,40,60,0.18)",
} as const;
const USER_BUBBLE_STYLE = {
  background: "linear-gradient(120deg, #8466E8 0%, #4F86EE 52%, #3FBAD8 100%)",
  color: "white",
  maxWidth: 280,
  boxShadow: "0 6px 16px -6px rgba(80,100,230,0.45)",
} as const;

function AiBubble({ children }: { children: ReactNode }) {
  return (
    <div className="w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={AI_BUBBLE_STYLE}>
      {children}
    </div>
  );
}

/* maps a mobile STARTERS string to its v2 starter index */
function starterIndex(s: string | null): number {
  const i = COMPOSER_STARTERS.indexOf(s ?? "");
  return i >= 0 ? i : 0;
}

function GlassChat({ onClose, initialPicked = null, closing = false, onClosed }: { onClose: () => void; initialPicked?: string | null; closing?: boolean; onClosed?: () => void }) {
  // when a starter was picked outside the panel, seed turn 1 with it; otherwise show greeting + chips
  const [started, setStarted] = useState<boolean>(initialPicked != null);
  const [selectedStarter, setSelectedStarter] = useState(() => starterIndex(initialPicked));

  const [panelPhase, setPanelPhase] = useState<"thinking" | "done">("thinking");
  const [thinkingStep, setThinkingStep] = useState(0);
  const [, setHoveredTurn] = useState<null | 1 | 2 | 3 | 4 | 5 | 6>(null);
  const [revealedTurn, setRevealedTurn] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
  const transcribeTimer = useRef<number | null>(null);
  const [timeLabel] = useState(() =>
    new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
  );

  // auto-growing composer (caps height, then scrolls)
  const composerRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = composerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [inputText, started, recording, transcribing]);

  // keep the chat pinned to the latest message
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    const mo = new MutationObserver(() => { el.scrollTop = el.scrollHeight; });
    mo.observe(el, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, [started]);

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

  // turn 1 thinking
  useEffect(() => {
    if (!started || panelPhase !== "thinking") return;
    if (conversationTurn === 1) {
      const t = setTimeout(() => setPanelPhase("done"), 900);
      return () => clearTimeout(t);
    }
    if (thinkingStep >= THINKING_EVENTS.length) { setPanelPhase("done"); return; }
    const t = setTimeout(() => setThinkingStep(s => s + 1), 1000);
    return () => clearTimeout(t);
  }, [started, panelPhase, thinkingStep, conversationTurn]);

  useEffect(() => {
    if (conversationTurn !== 3 || turn3Phase !== "thinking") return;
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
    const OPT = HELP_OPTIONS.length * 70 + 280;
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
      duration = streamMs(msgSchedule(userName)) + 300;
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

  // ── message action buttons (Listen / Good / Bad / Copy) ──
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

  // on mobile, actions stay visible once a turn has revealed (no hover)
  const actionsRow = (turn: number, content: ReactNode, mt: string) => {
    const reaction = reactions[turn];
    const iconBtn = "flex size-7 items-center justify-center rounded-[5px] transition-colors";
    const visible = revealedTurn >= turn;
    return (
      <div className={`flex items-center gap-2 px-1 ${mt}`}
        style={{ opacity: visible ? 1 : 0, transition: "opacity 150ms ease", pointerEvents: visible ? "auto" : "none" }}>
        <button type="button" title="Listen" aria-label="Read aloud" className={iconBtn}
          style={{ color: speakingTurn === turn ? INK : "#555555", backgroundColor: speakingTurn === turn ? SKEL_BG : "transparent" }}
          onClick={() => handleSpeak(turn, content)}>
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
          onClick={() => handleReact(turn, "like")}>
          <ThumbsUp className="size-3.5" strokeWidth={reaction === "like" ? 2 : 1.75} stroke={reaction === "like" ? "url(#act-grad)" : "currentColor"} fill={reaction === "like" ? "#E9EAFC" : "none"} />
        </button>
        <button type="button" title="Bad" aria-label="Bad response" className={iconBtn}
          style={{ color: reaction === "dislike" ? "#4348C7" : "#555555" }}
          onClick={() => handleReact(turn, "dislike")}>
          <ThumbsDown className="size-3.5" strokeWidth={reaction === "dislike" ? 2 : 1.75} stroke={reaction === "dislike" ? "url(#act-grad)" : "currentColor"} fill={reaction === "dislike" ? "#E9EAFC" : "none"} />
        </button>
        <button type="button" title={copiedTurn === turn ? "Copied" : "Copy"} aria-label="Copy" className={iconBtn}
          style={{ color: copiedTurn === turn ? "#22A06B" : "#555555" }}
          onClick={() => handleCopy(turn, content)}>
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

  // voice input on the composer (mirrors v2)
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

  // begin the conversation once a starter is chosen from the in-panel chips
  const startFromStarter = (idx: number) => {
    setSelectedStarter(idx);
    setStarted(true);
  };

  return (
    <div
      data-chat-card
      className="absolute inset-0 z-20 flex flex-col"
      style={{ ...GLASS_PANEL, animation: closing ? "chat-fall 380ms cubic-bezier(0.4,0,0.7,0.2) forwards" : "chat-rise 460ms cubic-bezier(0.22,1,0.36,1)" }}
      onAnimationEnd={(e) => { if (closing && e.animationName === "chat-fall") onClosed?.(); }}
    >
      {/* local keyframes/defs used by the ported conversation */}
      <style>{`
        @keyframes cvc-sparkle-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes cal-slide { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      {/* header (kept from the mobile shell) */}
      <div className="flex shrink-0 items-center gap-2.5 px-4 pb-3 pt-9" style={{ backgroundColor: "rgba(255,255,255,0.45)" }}>
        <button onClick={onClose} aria-label="Back" className="-ml-1 flex size-8 shrink-0 items-center justify-center rounded-[8px]" style={{ color: "#3A3A42" }}>
          <ChevronLeft className="size-5" strokeWidth={2} />
        </button>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white" style={{ boxShadow: "0 3px 12px -3px rgba(40,40,70,0.22)" }}>
          <img src="/global-payments-avatar.png" alt="" className="size-7 object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold leading-tight" style={{ color: "#1F2024" }}>Global Payments</p>
          <p className="mt-0.5 truncate text-[12px] leading-tight" style={{ color: "#7C7C86" }}>Virtual Assistant</p>
        </div>
        <div ref={menuRef} className="relative shrink-0">
          <button aria-label="More" aria-expanded={menuOpen} onClick={() => setMenuOpen(o => !o)} className="flex size-8 items-center justify-center rounded-[8px]" style={{ color: "#3A3A42", backgroundColor: menuOpen ? "rgba(0,0,0,0.06)" : "transparent" }}>
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
        <button onClick={onClose} aria-label="Close" className="flex size-8 shrink-0 items-center justify-center rounded-[8px]" style={{ color: "#3A3A42" }}>
          <X className="size-[18px]" strokeWidth={2} />
        </button>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="scrollbar-subtle flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <defs>
            <linearGradient id="act-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8466E8" />
              <stop offset="52%" stopColor="#4F86EE" />
              <stop offset="100%" stopColor="#3FBAD8" />
            </linearGradient>
          </defs>
        </svg>

        {!started ? (
          <>
            <AiBubble>Hi! I&apos;m the Global Payments assistant. How can I help you today?</AiBubble>
            <div className="flex flex-col items-start gap-2">
              {COMPOSER_STARTERS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => startFromStarter(i)}
                  className="rounded-full px-4 py-2 text-left text-[14px]"
                  style={{ backgroundColor: "rgba(255,255,255,0.5)", backdropFilter: "blur(18px) saturate(1.3)", WebkitBackdropFilter: "blur(18px) saturate(1.3)", border: "1px solid rgba(255,255,255,0.6)", color: "#2B2B33", boxShadow: "0 8px 22px -10px rgba(30,25,60,0.25)" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* turn 1 — chosen starter */}
            <div className="flex justify-end">
              <div className="rounded-[12px] rounded-br-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={USER_BUBBLE_STYLE}>
                {COMPOSER_STARTERS[selectedStarter]}
              </div>
            </div>
            {conversationTurn === 1 && panelPhase === "thinking" && <AiThinking />}
            {(panelPhase === "done" || conversationTurn === 2) && (() => {
              const animated = conversationTurn === 1;
              const words = STARTER_RESPONSES[selectedStarter].split(" ");
              const wordsDelay = words.length * 42;
              return (
                <div onMouseEnter={() => setHoveredTurn(1)} onMouseLeave={() => setHoveredTurn(null)}>
                  <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: "#979797" }}>
                    AI Agent <span style={{ color: "#979797" }}>• {timeLabel}</span>
                  </p>
                  <div className="w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={AI_BUBBLE_STYLE}>
                    {words.map((word, i) => (
                      <span key={i} className="inline-block"
                        style={animated ? { animation: "word-in 320ms cubic-bezier(0.2,0.6,0.2,1) both", animationDelay: `${i * 42}ms` } : undefined}>
                        {word}&nbsp;
                      </span>
                    ))}
                  </div>
                  <div className="w-fit max-w-[88%] mt-2 rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed"
                    style={{ ...AI_BUBBLE_STYLE,
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

            {/* turn 2 */}
            {conversationTurn >= 2 && (
              <>
                <div className="flex justify-end">
                  <div className="rounded-[12px] rounded-br-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={USER_BUBBLE_STYLE}>{selectedHelp}</div>
                </div>
                {panelPhase === "thinking" && <ThinkingEvents step={thinkingStep} />}
                {panelPhase === "done" && (
                  <div onMouseEnter={() => setHoveredTurn(2)} onMouseLeave={() => setHoveredTurn(null)}>
                    <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: "#979797" }}>
                      AI Agent <span style={{ color: "#979797" }}>• {timeLabel}</span>
                    </p>
                    <div className="w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={AI_BUBBLE_STYLE}>
                      <Words>{MSG_THANK_YOU}</Words>
                    </div>
                    <div className="mt-2 w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={{ ...AI_BUBBLE_STYLE, animation: "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both", animationDelay: `${streamMs(MSG_THANK_YOU)}ms` }}>
                      <Words delay={streamMs(MSG_THANK_YOU)}>{MSG_FULL_NAME}</Words>
                    </div>
                    {actionsRow(2, <>{MSG_THANK_YOU} {MSG_FULL_NAME}</>, "mt-2.5")}
                  </div>
                )}
              </>
            )}

            {/* turn 3 */}
            {conversationTurn >= 3 && (
              <>
                <div className="flex justify-end">
                  <div className="rounded-[12px] rounded-br-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={USER_BUBBLE_STYLE}>{userName}</div>
                </div>
                {turn3Phase === "thinking" && <AiThinking />}
                {turn3Phase === "done" && (
                  <div onMouseEnter={() => setHoveredTurn(3)} onMouseLeave={() => setHoveredTurn(null)}>
                    <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: "#979797" }}>
                      AI Agent <span style={{ color: "#979797" }}>• {timeLabel}</span>
                    </p>
                    <div className="w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={AI_BUBBLE_STYLE}>
                      <Words>{MSG_COMPANY}</Words>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* turn 4 */}
            {conversationTurn >= 4 && (
              <>
                <div className="flex justify-end">
                  <div className="rounded-[12px] rounded-br-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={USER_BUBBLE_STYLE}>{company}</div>
                </div>
                {turn4Phase === "thinking" && <ThinkingEvents step={turn4Step} events={STUDIO_EVENTS} />}
                {turn4Phase === "done" && (
                  <div onMouseEnter={() => setHoveredTurn(4)} onMouseLeave={() => setHoveredTurn(null)}>
                    <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: "#979797" }}>
                      AI Agent <span style={{ color: "#979797" }}>• {timeLabel}</span>
                    </p>
                    <div className="w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={AI_BUBBLE_STYLE}>
                      <Words>{MSG_STUDIO}</Words>
                    </div>
                    <div className="mt-2 w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={{ ...AI_BUBBLE_STYLE, animation: "bubble-in 240ms cubic-bezier(0.2,0.6,0.2,1) both", animationDelay: `${streamMs(MSG_STUDIO)}ms` }}>
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

            {/* turn 5 — scheduler */}
            {conversationTurn === 5 && (
              <>
                <div className="flex justify-end">
                  <div className="rounded-[12px] rounded-br-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={USER_BUBBLE_STYLE}>Yes, schedule a call</div>
                </div>
                {turn5Phase === "thinking" && <ThinkingEvents step={turn5Step} events={SCHEDULE_EVENTS} />}
                {turn5Phase === "done" && (
                  <div onMouseEnter={() => setHoveredTurn(5)} onMouseLeave={() => setHoveredTurn(null)}>
                    <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: "#979797" }}>
                      AI Agent <span style={{ color: "#979797" }}>• {timeLabel}</span>
                    </p>
                    <div className="w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={AI_BUBBLE_STYLE}>
                      <Words>{msgSchedule(userName)}</Words>
                    </div>
                    {/* interactive scheduler card */}
                    <div className="mt-2 w-full max-w-[290px] overflow-hidden rounded-[14px] border p-3"
                      style={{ backgroundColor: "rgba(255,255,255,0.85)", borderColor: "rgba(0,0,0,0.08)", boxShadow: "0 6px 18px -8px rgba(40,40,60,0.18)", minHeight: 230 }}>
                      <div key={pickedDate === null ? "cal" : "time"} style={{ animation: "cal-slide 280ms cubic-bezier(0.22,1,0.36,1) both" }}>
                        {pickedDate === null ? (
                          <>
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

            {/* turn 6 — booked */}
            {conversationTurn === 6 && (
              <>
                <div className="flex justify-end">
                  <div className="rounded-[12px] rounded-br-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={USER_BUBBLE_STYLE}>{bookedSlot}</div>
                </div>
                {turn6Phase === "thinking" && <ThinkingEvents step={turn6Step} events={BOOK_EVENTS} />}
                {turn6Phase === "done" && (
                  <div onMouseEnter={() => setHoveredTurn(6)} onMouseLeave={() => setHoveredTurn(null)}>
                    <p className="ml-1 mb-1 text-[11px] font-medium tracking-wide" style={{ color: "#979797" }}>
                      AI Agent <span style={{ color: "#979797" }}>• {timeLabel}</span>
                    </p>
                    <div className="w-fit max-w-[88%] rounded-[12px] rounded-tl-[6px] px-3.5 py-2 text-[14px] leading-relaxed" style={AI_BUBBLE_STYLE}>
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
          </>
        )}
      </div>

      {/* composer — frosted liquid-glass-c pill, made functional */}
      <div className="flex flex-col gap-1.5 px-3 pb-4 pt-1 shrink-0">
        {inputText.trim() && !recording && !transcribing && (
          <div className="flex items-center justify-center gap-1 px-1 text-[10px] font-medium leading-4 text-white"
            style={{ animation: "fade-in 180ms ease-out both" }}>
            Press
            <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded-[3px] border border-white/60 bg-white/15 px-1 font-sans text-[10px] font-medium leading-none text-white">↵</kbd>
            to send
          </div>
        )}
        <div
          className="cpill-stroke relative flex w-full items-end gap-2"
          style={{
            borderRadius: 20,
            padding: "12px",
            backgroundColor: "rgba(255,255,255,0.6)",
            boxShadow: "0 6px 18px -8px rgba(40,40,60,0.18)",
          }}
        >
          {/* left button — upload, becomes cancel (X) while recording */}
          <button
            type="button"
            aria-label={recording ? "Cancel recording" : "Upload media"}
            onClick={recording ? handleCancelRecording : undefined}
            disabled={transcribing}
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-transparent text-[#6A6A75] transition-colors hover:bg-[rgba(255,255,255,0.92)] hover:text-[#2B2B33] disabled:opacity-40"
          >
            {recording ? <X className="size-4" strokeWidth={2} /> : <Plus className="size-4" strokeWidth={2} />}
          </button>

          {/* middle — recording waveform, otherwise the text field */}
          {recording ? (
            <div className="flex min-w-0 flex-1 items-center justify-center gap-[3px] overflow-hidden px-1 py-[5px]" style={{ minHeight: 31 }} aria-hidden>
              {WAVEFORM_HEIGHTS.map((h, i) => (
                <span key={i} className="block w-px origin-center rounded-full"
                  style={{ height: `${Math.round(h * 20)}px`, background: "#2E2E2E", animation: `wave-bar 1.6s ease-in-out ${i * 45}ms infinite` }} />
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
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
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

          {/* dynamic button — spinner while transcribing, stop while recording, else send / voice */}
          {transcribing ? (
            <button type="button" disabled aria-label="Transcribing" className="flex size-7 shrink-0 items-center justify-center text-[#6A6A75]">
              <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
            </button>
          ) : (
            <button
              type="button"
              aria-label={recording ? "Stop recording" : inputText.trim() ? "Send message" : "Voice input"}
              onClick={() => { if (recording) handleStopRecording(); else if (inputText.trim()) handleSend(); }}
              className="relative z-10 flex shrink-0 items-center justify-center transition-colors active:scale-95"
              style={{ width: 28, height: 28, borderRadius: 9999, backgroundColor: "rgba(255,255,255,0.92)", color: "#2B2B33" }}
            >
              {recording ? (
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
  );
}

export default function V2MobilePage() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [starter, setStarter] = useState<string | null>(null);

  const openChat = (s: string | null) => { setStarter(s); setFocused(false); setClosing(false); setOpen(true); };
  const requestClose = () => setClosing(true);
  const finalizeClose = () => { setOpen(false); setClosing(false); setStarter(null); };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#E8E8EC] py-10">
      <style>{`
        @property --lg-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
        @keyframes liquid-edge-orbit { to { --lg-angle: 360deg; } }
        /* chat composer border (v2) — subtle stroke that appears on hover/focus */
        .cpill-stroke::before {
          content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1px;
          background: linear-gradient(135deg,
            rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 45%,
            rgba(255,255,255,0.2) 60%, rgba(255,255,255,0.85) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          pointer-events: none; opacity: 0; transition: opacity 180ms ease;
        }
        .cpill-stroke:hover::before, .cpill-stroke:focus-within::before { opacity: 1; }
        /* animate position (not transform) so the pill's backdrop-filter isn't disabled by a transformed ancestor */
        @keyframes launcher-rise {
          from { opacity: 0; bottom: -90px; }
          to   { opacity: 1; bottom: 20px; }
        }
        @keyframes cpill-starter-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* chat panel slides up from the bottom; no fill-mode so no transform lingers (keeps inner backdrop-filters live) */
        @keyframes chat-rise {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        /* on close, slide back down and hold off-screen until unmount */
        @keyframes chat-fall {
          from { transform: translateY(0); }
          to   { transform: translateY(100%); }
        }
        .liquid-glass::before, .liquid-glass::after {
          content: ""; position: absolute; padding: 3px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
        }
        .liquid-glass::before {
          inset: -1.5px; border-radius: 21.5px;
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
        .liquid-glass::after {
          inset: -1.5px; border-radius: 21.5px;
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
        /* composer — independent copy of the v2 edge so launcher edits never touch it */
        .liquid-glass-c::before, .liquid-glass-c::after {
          content: ""; position: absolute; padding: 3px;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
        }
        .liquid-glass-c::before {
          inset: -1.5px; border-radius: 21.5px;
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
        .liquid-glass-c::after {
          inset: -1.5px; border-radius: 21.5px;
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
        /* option chip — shiny gradient stroke fades in on hover */
        .opt-chip::before {
          content: ""; position: absolute; inset: -2px; border-radius: inherit; padding: 1.5px;
          background: linear-gradient(120deg, rgba(180,140,255,1) 0%, rgba(120,200,250,1) 52%, rgba(150,225,240,1) 100%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
          opacity: 0; transition: opacity 160ms ease;
        }
        .opt-chip:hover::before { opacity: 1; }
      `}</style>

      {/* phone screen */}
      <div className="relative" style={{ width: 390, height: 844 }}>
        <div className="absolute overflow-hidden bg-white" style={{ inset: 0, boxShadow: "0 30px 80px -20px rgba(0,0,0,0.45)" }}>
          {/* host page (Global Payments mobile site) */}
          <img
            src="/gp-mobile-bg.jpg"
            alt="Global Payments"
            loading="eager"
            fetchPriority="high"
            onLoad={() => setBgLoaded(true)}
            ref={(el) => { if (el?.complete) setBgLoaded(true); }}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />

          {/* tap-away catcher to leave the focused state */}
          {!open && bgLoaded && focused && (
            <div className="absolute inset-0 z-[5]" onClick={() => setFocused(false)} />
          )}

          {/* launcher pill — exact v2 styling; only after bg paints so the glass never flashes over white */}
          {!open && bgLoaded && (
            <div
              className="absolute z-10 flex flex-col items-stretch gap-2"
              style={{
                left: "50%",
                bottom: 20,
                width: focused ? 280 : 200,
                marginLeft: focused ? -140 : -100,
                animation: "launcher-rise 760ms cubic-bezier(0.22,1,0.36,1) 200ms both",
                transition: "width 320ms cubic-bezier(0.22,1,0.36,1), margin-left 320ms cubic-bezier(0.22,1,0.36,1)",
              }}
            >
              {/* starters — appear above the pill when focused */}
              {focused && (
                <div className="flex flex-col items-start gap-2">
                  {COMPOSER_STARTERS.map((s, i) => (
                    <button
                      key={s}
                      onClick={(e) => { e.stopPropagation(); openChat(s); }}
                      className="rounded-full px-4 py-2 text-left text-[14px] whitespace-nowrap"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.72)",
                        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.66) 45%, rgba(255,255,255,0.58) 100%)",
                        backdropFilter: "blur(22px) saturate(1.4)",
                        WebkitBackdropFilter: "blur(22px) saturate(1.4)",
                        border: "1px solid rgba(255,255,255,0.6)",
                        color: "rgba(43,43,51,0.78)",
                        boxShadow: "0 8px 22px -10px rgba(30,25,60,0.25), inset 0 1px 1px rgba(255,255,255,0.6)",
                        animation: "cpill-starter-in 260ms cubic-bezier(0.22,1,0.36,1) both",
                        animationDelay: `${60 + i * 60}ms`,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => (focused ? openChat(null) : setFocused(true))}
                className="liquid-glass relative flex w-full cursor-text items-center"
                style={{
                  height: 52,
                  borderRadius: 20,
                  padding: "0 12px 0 16px",
                  backgroundColor: "rgba(255,255,255,0.72)",
                  backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.66) 45%, rgba(255,255,255,0.58) 100%)",
                  backdropFilter: "blur(22px) saturate(1.4)",
                  WebkitBackdropFilter: "blur(22px) saturate(1.4)",
                  boxShadow: "0 12px 30px -12px rgba(30,25,60,0.28), inset 0 1px 1px rgba(255,255,255,0.65)",
                }}
              >
                <span className="min-w-0 flex-1 truncate text-left text-[15px] tracking-tight" style={{ color: "rgba(43,43,51,0.45)" }}>Ask me anything…</span>
                <span className="relative z-10 flex shrink-0 items-center justify-center rounded-full" style={{ width: 28, height: 28, backgroundColor: "rgba(255,255,255,0.92)", color: "#2B2B33" }}>
                  {focused ? <ArrowUp className="size-4" strokeWidth={2.5} /> : <AudioLines className="size-4" strokeWidth={2} />}
                </span>
              </button>
            </div>
          )}

          {/* full-screen glass chat */}
          {open && <GlassChat onClose={requestClose} closing={closing} onClosed={finalizeClose} initialPicked={starter} />}
        </div>
      </div>
    </div>
  );
}
