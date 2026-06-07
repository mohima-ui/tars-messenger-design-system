"use client";

import {
  ArrowRight,
  ArrowUp,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Database,
  Download,
  ExternalLink,
  Eye,
  Link as LinkIcon,
  Maximize2,
  Mic,
  Minimize2,
  MoreVertical,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  X,
} from "lucide-react";
import React, {
  Fragment,
  useEffect,
  useRef,
  useState,
} from "react";

const AI_BUBBLE = "var(--ds-bg-paper)";
const USER_BUBBLE = "var(--ds-accent-soft)";
const USER_BUBBLE_BORDER = "var(--ds-accent-border)";
const USER_TEXT = "var(--ds-accent-ink)";
const INK = "var(--ds-text-ink)";
const LINE = "var(--ds-border-line)";
const SURFACE = "#FFFFFF";
const SECONDARY = "var(--ds-text-secondary)";
const MUTED = "var(--ds-text-muted)";
const ACCENT_SOFT = "var(--ds-accent-soft)";
const ACCENT_BORDER = "var(--ds-accent-border)";
const ACCENT_INK = "var(--ds-accent-ink)";

const WORD_STEP_MS = 38;

type ToolEntry = {
  name: string;
  args: string;
  result: string;
};

type EventKind =
  | "search"
  | "lookup"
  | "tool"
  | "verify"
  | "match"
  | "create"
  | "send"
  | "view";

type ConversationEvent = {
  kind: EventKind;
  label: string;
};

const EVENT_DURATION_MS = 750;

const EVENT_ICONS: Record<EventKind, typeof Search> = {
  search: Search,
  lookup: Eye,
  tool: Database,
  verify: Check,
  match: Sparkles,
  create: Calendar,
  send: Send,
  view: LinkIcon,
};

type AiStep = {
  content: React.ReactNode;
  options?: string[];
  awaitsInput?: boolean;
  reasoning?: React.ReactNode[];
  tools?: ToolEntry[];
  events?: ConversationEvent[];
};

function ReasoningToolsStrip({
  reasoning,
  tools,
}: {
  reasoning?: React.ReactNode[];
  tools?: ToolEntry[];
}) {
  const [expanded, setExpanded] = useState<"reasoning" | "tools" | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const interacted = useRef(false);
  const openReasoning = expanded === "reasoning";
  const openTools = expanded === "tools";
  const toggle = (which: "reasoning" | "tools") => {
    interacted.current = true;
    setExpanded((prev) => (prev === which ? null : which));
  };

  useEffect(() => {
    if (!interacted.current) return;
    const el = stripRef.current;
    if (!el) return;
    const scrollContainer = el.closest<HTMLElement>("[data-scroll-container]");
    if (!scrollContainer) return;

    // Wait for the DOM to update with the new expansion height.
    const id = requestAnimationFrame(() => {
      if (expanded !== null) {
        // Bring the bubble's top into view, with a little headroom.
        const bubble = el.parentElement;
        if (!bubble) return;
        const bubbleTop = bubble.getBoundingClientRect().top;
        const containerTop = scrollContainer.getBoundingClientRect().top;
        const offset = bubbleTop - containerTop - 12;
        scrollContainer.scrollBy({ top: offset, behavior: "smooth" });
      } else {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [expanded]);

  const link = (
    Icon: typeof Sparkles,
    label: string,
    open: boolean,
    onToggle: () => void,
  ) => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="inline-flex items-center gap-1 text-[11px] font-medium transition-colors hover:opacity-80"
      style={{
        color: open ? "var(--ds-accent)" : "var(--ds-text-secondary)",
      }}
    >
      <Icon
        className="size-3 shrink-0"
        strokeWidth={1.75}
        style={{ color: "var(--ds-accent)" }}
      />
      {label}
      <ChevronRight
        className="size-2.5 transition-transform"
        strokeWidth={2}
        style={{ transform: open ? "rotate(90deg)" : "rotate(0)" }}
      />
    </button>
  );

  return (
    <div ref={stripRef} onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center gap-4">
        {reasoning &&
          link(Sparkles, "Reasoning", openReasoning, () =>
            toggle("reasoning"),
          )}
        {tools && link(Database, "Tools used", openTools, () => toggle("tools"))}
      </div>

      {openReasoning && reasoning && (
        <div
          className="mt-2 flex flex-col"
          style={{ animation: "fade-in 200ms ease-out both" }}
        >
          {reasoning.map((s, i, arr) => (
            <div key={i} className="flex flex-col">
              <div className="flex items-start gap-2">
                <span
                  className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border"
                  style={{
                    backgroundColor: "var(--ds-accent-soft)",
                    borderColor: "var(--ds-accent-border)",
                    color: "var(--ds-accent-ink)",
                  }}
                >
                  <Check className="size-2" strokeWidth={2.5} />
                </span>
                <span
                  className="text-[11px] leading-[1.5]"
                  style={{ color: "var(--ds-text-secondary)" }}
                >
                  {s}
                </span>
              </div>
              {i < arr.length - 1 && (
                <span
                  className="ml-[7px] h-2 w-px"
                  style={{ backgroundColor: "var(--ds-accent-border)" }}
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>
      )}

      {openTools && tools && (
        <div
          className="mt-2 flex flex-col gap-2"
          style={{ animation: "fade-in 200ms ease-out both" }}
        >
          {tools.map((t) => (
            <div
              key={t.name}
              className="rounded-[8px] border px-3 py-2.5"
              style={{ borderColor: LINE }}
            >
              <p
                className="mb-1.5 text-[11px]"
                style={{ color: "var(--ds-text-secondary)" }}
              >
                Called{" "}
                <code
                  className="mx-0.5 inline-flex items-center rounded-[4px] px-1 py-px align-baseline font-mono text-[10px] tracking-tight"
                  style={{
                    backgroundColor: "var(--ds-accent-soft)",
                    color: "var(--ds-accent-ink)",
                  }}
                >
                  {t.name}
                </code>
              </p>
              <div className="flex flex-col gap-1.5">
                <div>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--ds-text-muted)" }}
                  >
                    Arguments
                  </span>
                  <pre
                    className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[10px] leading-[1.5]"
                    style={{
                      backgroundColor: "var(--ds-bg-paper)",
                      color: "var(--ds-accent-ink)",
                    }}
                  >
                    {t.args}
                  </pre>
                </div>
                <div>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--ds-text-muted)" }}
                  >
                    Result
                  </span>
                  <pre
                    className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[10px] leading-[1.5]"
                    style={{
                      backgroundColor: "var(--ds-bg-paper)",
                      color: "var(--ds-accent-ink)",
                    }}
                  >
                    {t.result}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        className="mt-1.5 mb-1.5 h-px"
        style={{ backgroundColor: LINE }}
      />
    </div>
  );
}

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

function CitationSource({
  n,
  source,
}: {
  n: number;
  source: { title: string; description: string; url: string };
}) {
  const chipRef = useRef<HTMLSpanElement>(null);
  const [transformX, setTransformX] = useState("-50%");

  const recalc = () => {
    const chip = chipRef.current;
    if (!chip) return;
    const card = chip.closest<HTMLElement>("[data-chat-card]");
    if (!card) return;
    const chipRect = chip.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const POPOVER_W = 320;
    const PAD = 8;
    const chipCenter = chipRect.left + chipRect.width / 2;
    let popoverLeft = chipCenter - POPOVER_W / 2;
    const minLeft = cardRect.left + PAD;
    const maxLeft = cardRect.right - POPOVER_W - PAD;
    if (popoverLeft < minLeft) popoverLeft = minLeft;
    if (popoverLeft > maxLeft) popoverLeft = maxLeft;
    const newCenter = popoverLeft + POPOVER_W / 2;
    const delta = newCenter - chipCenter;
    setTransformX(`calc(-50% + ${delta}px)`);
  };

  return (
    <span
      className="group/cite relative inline-block align-baseline"
      onMouseEnter={recalc}
      onFocus={recalc}
    >
      <span
        ref={chipRef}
        className="ml-0.5 inline-flex size-4 cursor-pointer items-center justify-center rounded-full align-middle text-[10px] font-semibold transition-colors group-hover/cite:!bg-[var(--ds-accent-soft)] group-hover/cite:!text-[var(--ds-accent-ink)]"
        style={{
          backgroundColor: "#E0DAD3",
          color: SECONDARY,
        }}
      >
        {n}
      </span>
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-20 w-[320px] pb-2 opacity-0 transition-opacity duration-150 group-hover/cite:pointer-events-auto group-hover/cite:opacity-100"
        style={{ transform: `translateX(${transformX})` }}
      >
        <span
          className="block rounded-[10px] border bg-white p-3"
          style={{
            borderColor: LINE,
            boxShadow:
              "0 4px 14px -3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <span
            className="block text-[12px] font-semibold leading-[1.35]"
            style={{ color: INK }}
          >
            {source.title}
          </span>
          <span
            className="mt-1 block text-[11px] leading-[1.45]"
            style={{ color: SECONDARY }}
          >
            {source.description}
          </span>
          <a
            href={`https://${source.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex max-w-full items-center gap-1 font-mono text-[11px] hover:underline"
            style={{ color: ACCENT_INK }}
          >
            <span className="truncate">{source.url}</span>
            <ExternalLink
              className="size-3 shrink-0"
              strokeWidth={2}
              aria-hidden
            />
          </a>
        </span>
      </span>
    </span>
  );
}

const aiSteps: AiStep[] = [
  {
    content: (
      <>
        Hey there — looking to{" "}
        <span className="font-semibold">learn more</span>?{" "}
        <span className="font-semibold">I can help</span>!
      </>
    ),
    options: [
      "I want to talk to sales",
      "I need support",
      "I want to become a partner",
    ],
  },
  {
    content: (
      <>
        Which of these options best describes how we can{" "}
        <span className="font-semibold">help</span>?
      </>
    ),
    options: [
      "I'm an Enterprise Business",
      "I'm looking for events payment",
      "I'm an Independent Business",
    ],
  },
  {
    content: (
      <>
        Thank you for your interest! Kindly provide your{" "}
        <span className="font-semibold">contact details</span>, and our team
        will connect with you as soon as possible.
      </>
    ),
  },
  {
    content: (
      <>
        Please type in your <span className="font-semibold">full name</span>.
      </>
    ),
    awaitsInput: true,
  },
  {
    content: (
      <>
        And your <span className="font-semibold">company name</span>?
      </>
    ),
    awaitsInput: true,
  },
  {
    content: (
      <>
        Got it — thanks for sharing those details. Based on businesses similar
        to yours, the <span className="font-semibold">Studio plan</span>{" "}
        tends to be the best fit. It&apos;s $49/month and includes unlimited
        AI conversations, advanced analytics, and dedicated support{" "}
        <CitationSource n={1} source={CITATION_SOURCES[0]} />. Going annual
        saves you <span className="font-semibold">20%</span> and unlocks the
        new audit log <CitationSource n={2} source={CITATION_SOURCES[1]} />,
        which gives you full visibility into every customer interaction.
      </>
    ),
    events: [
      { kind: "lookup", label: "Looking up your company" },
      { kind: "match", label: "Matching to plan tiers" },
      { kind: "search", label: "Comparing pricing options" },
    ],
  },
  {
    content: (
      <>
        Want me to set up a quick walkthrough with one of our specialists?
        They can show you exactly how it would{" "}
        <span className="font-semibold">work for your team</span>.
      </>
    ),
    options: [
      "Yes, schedule a call",
      "Send me more details",
      "I'll think about it",
    ],
  },
  {
    content: (
      <>
        Awesome — I checked our team&apos;s calendar and matched it to your
        timezone. Here are a few <span className="font-semibold">open
        slots</span> this week. Pick whichever works best.
      </>
    ),
    options: ["Tomorrow · 10:00 AM", "Tomorrow · 2:30 PM", "Friday · 11:00 AM"],
    events: [
      { kind: "verify", label: "Verifying your timezone" },
      { kind: "search", label: "Checking team calendar" },
      { kind: "view", label: "Filtering open slots" },
    ],
  },
  {
    content: (
      <>
        Perfect — you&apos;re booked! I&apos;ve added it to your{" "}
        <span className="font-semibold">Google Calendar</span> and created a{" "}
        <span className="font-semibold">Google Meet</span> link. A confirmation
        email is on its way, and your specialist will join you at the scheduled
        time.
      </>
    ),
    events: [
      { kind: "verify", label: "Locking the slot" },
      { kind: "create", label: "Creating calendar event" },
      { kind: "tool", label: "Generating Meet link" },
      { kind: "send", label: "Sending invites" },
    ],
    reasoning: [
      <>Locked in the slot you picked so no one else can book it</>,
      <>
        Called{" "}
        <code
          className="mx-0.5 inline-flex items-center rounded-[4px] px-1 py-px font-mono text-[10px] tracking-tight"
          style={{
            backgroundColor: "var(--ds-accent-soft)",
            color: "var(--ds-accent-ink)",
          }}
        >
          create_CalendarEvent
        </code>{" "}
        to add the meeting to your Google Calendar
      </>,
      <>
        Generated a Google Meet link with{" "}
        <code
          className="mx-0.5 inline-flex items-center rounded-[4px] px-1 py-px font-mono text-[10px] tracking-tight"
          style={{
            backgroundColor: "var(--ds-accent-soft)",
            color: "var(--ds-accent-ink)",
          }}
        >
          create_MeetLink
        </code>{" "}
        and attached it to the invite
      </>,
      <>Sent calendar invites to both you and the specialist</>,
    ],
    tools: [
      {
        name: "create_CalendarEvent",
        args: `{ "calendar": "google", "title": "Tars walkthrough", "start": "2026-05-23T10:00", "duration_min": 15, "attendees": ["you", "specialist@tars.com"] }`,
        result: `{ "event_id": "evt_8f3a2c", "status": "confirmed" }`,
      },
      {
        name: "create_MeetLink",
        args: `{ "event_id": "evt_8f3a2c" }`,
        result: `{ "url": "meet.google.com/abc-defg-hij" }`,
      },
    ],
  },
];

type Message =
  | {
      id: string;
      type: "ai";
      content: React.ReactNode;
      options?: string[];
      reasoning?: React.ReactNode[];
      tools?: ToolEntry[];
    }
  | { id: string; type: "user"; content: string }
  | { id: string; type: "voice"; duration: number };

function getNodeText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    return getNodeText(element.props.children);
  }
  return "";
}

function countWords(node: React.ReactNode): number {
  if (typeof node === "string") {
    return node.trim().split(/\s+/).filter(Boolean).length;
  }
  if (Array.isArray(node)) {
    return node.reduce<number>((sum, child) => sum + countWords(child), 0);
  }
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    return countWords(element.props.children);
  }
  return 0;
}

type WordCounter = { current: number };

function splitNodeIntoWords(
  node: React.ReactNode,
  counter: WordCounter,
  keyPrefix: string,
): React.ReactNode {
  if (node === null || node === undefined || typeof node === "boolean") {
    return node;
  }
  if (typeof node === "string") {
    const tokens = node.split(/(\s+)/);
    return tokens.map((tok, i) => {
      if (tok === "") return null;
      if (/^\s+$/.test(tok)) return tok;
      const idx = counter.current++;
      return (
        <span
          key={`${keyPrefix}-w-${idx}-${i}`}
          className="inline-block will-change-transform"
          style={{
            animation: `word-in 320ms cubic-bezier(0.2, 0.6, 0.2, 1) ${idx * WORD_STEP_MS}ms both`,
          }}
        >
          {tok}
        </span>
      );
    });
  }
  if (typeof node === "number") return node;
  if (Array.isArray(node)) {
    return node.map((child, i) => (
      <Fragment key={`${keyPrefix}-${i}`}>
        {splitNodeIntoWords(child, counter, `${keyPrefix}-${i}`)}
      </Fragment>
    ));
  }
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: React.ReactNode }>;
    if (element.props.children === undefined) {
      const idx = counter.current++;
      return (
        <span
          key={`${keyPrefix}-el-${idx}`}
          className="inline-block will-change-transform"
          style={{
            animation: `word-in 320ms cubic-bezier(0.2, 0.6, 0.2, 1) ${idx * WORD_STEP_MS}ms both`,
          }}
        >
          {element}
        </span>
      );
    }
    return React.cloneElement(
      element,
      undefined,
      splitNodeIntoWords(element.props.children, counter, `${keyPrefix}-el`),
    );
  }
  return node;
}

function Words({ children }: { children: React.ReactNode }) {
  const counter: WordCounter = { current: 0 };
  return <>{splitNodeIntoWords(children, counter, "w")}</>;
}

function TypingIndicator({ events }: { events?: ConversationEvent[] }) {
  const [eventIdx, setEventIdx] = useState(0);
  useEffect(() => {
    if (!events || events.length <= 1) return;
    setEventIdx(0);
    const id = window.setInterval(() => {
      setEventIdx((i) => (i + 1 < events.length ? i + 1 : i));
    }, EVENT_DURATION_MS);
    return () => window.clearInterval(id);
  }, [events]);

  const current =
    events && events.length > 0
      ? events[Math.min(eventIdx, events.length - 1)]
      : null;
  const Icon = current ? EVENT_ICONS[current.kind] : null;

  return (
    <div
      className="flex items-center gap-2 px-1"
      style={{ animation: "fade-in 200ms ease-out both" }}
    >
      {current && Icon ? (
        <Icon
          key={`icon-${eventIdx}`}
          className="size-3.5 shrink-0"
          strokeWidth={1.75}
          style={{
            color: "var(--ds-accent)",
            animation: "event-spin 2.4s linear infinite",
          }}
        />
      ) : (
        <Sparkles
          className="size-3.5 shrink-0"
          strokeWidth={1.75}
          style={{
            color: "var(--ds-accent)",
            animation: "event-spin 2.4s linear infinite",
          }}
          aria-hidden
        />
      )}
      <span
        key={`label-${eventIdx}`}
        className="text-[12px] font-medium text-[var(--ds-text-secondary)]"
        style={{
          animation: current ? "fade-in 200ms ease-out both" : undefined,
        }}
      >
        {current ? current.label : "Tars is thinking"}
      </span>
    </div>
  );
}

export default function V3Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(-1);
  const [isTyping, setIsTyping] = useState(true);
  const [pendingEvents, setPendingEvents] = useState<
    ConversationEvent[] | undefined
  >(undefined);
  const [value, setValue] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );
  const [reactions, setReactions] = useState<
    Record<string, "like" | "dislike" | null>
  >({});
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(
    null,
  );
  const [pressKey, setPressKey] = useState<Record<string, number>>({});
  const [view, setView] = useState<"chat" | "history">("chat");
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleRestart = () => {
    setMenuOpen(false);
    setMessages([]);
    setStep(-1);
    setIsTyping(true);
    setSelectedMessageId(null);
    setReactions({});
    setSpeakingMessageId(null);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setTimeout(() => {
      setIsTyping(false);
      setMessages([
        {
          id: `ai-0-${Date.now()}`,
          type: "ai",
          content: aiSteps[0].content,
          options: aiSteps[0].options,
          reasoning: aiSteps[0].reasoning,
          tools: aiSteps[0].tools,
        },
      ]);
      setStep(0);
    }, 700);
  };

  const handleDownloadTranscript = () => {
    setMenuOpen(false);
    const lines = messages.map((m) => {
      if (m.type === "user") return `You: ${m.content}`;
      if (m.type === "voice")
        return `You: [voice message · ${m.duration}s]`;
      return `Tars: ${getNodeText(m.content)}`;
    });
    const text = `Tars conversation — ${new Date().toLocaleString()}\n\n${lines.join("\n")}\n`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tars-transcript-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!playingId) {
      setPlayProgress(0);
      return;
    }
    const msg = messages.find((m) => m.id === playingId);
    if (!msg || msg.type !== "voice") return;
    const totalMs = msg.duration * 1000;
    const tickMs = 80;
    const id = window.setInterval(() => {
      setPlayProgress((p) => {
        const next = p + tickMs / totalMs;
        if (next >= 1) {
          setPlayingId(null);
          return 0;
        }
        return next;
      });
    }, tickMs);
    return () => window.clearInterval(id);
  }, [playingId, messages]);

  const handlePlayToggle = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayProgress(0);
      setPlayingId(id);
    }
  };
  const scrollRef = useRef<HTMLElement>(null);
  const hasInput = value.trim().length > 0;

  useEffect(() => {
    if (!isRecording) return;
    setRecordSeconds(0);
    const id = window.setInterval(() => setRecordSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [isRecording]);

  const handleStartRecording = () => setIsRecording(true);
  const handleCancelRecording = () => {
    setIsRecording(false);
    setRecordSeconds(0);
  };
  const handleStopAndSend = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `v-${Date.now()}`,
        type: "voice",
        duration: Math.max(1, recordSeconds),
      },
    ]);
    setIsRecording(false);
    setRecordSeconds(0);
  };

  const toggleBubble = (id: string) => {
    setSelectedMessageId((prev) => (prev === id ? null : id));
  };

  const handleCopy = (content: React.ReactNode) => {
    if (typeof navigator === "undefined") return;
    void navigator.clipboard?.writeText(getNodeText(content));
  };

  const handleSpeak = (id: string, content: React.ReactNode) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (speakingMessageId === id) {
      setSpeakingMessageId(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(getNodeText(content));
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingMessageId(id);
  };

  const handleReact = (id: string, reaction: "like" | "dislike") => {
    setReactions((prev) => ({
      ...prev,
      [id]: prev[id] === reaction ? null : reaction,
    }));
    const k = `${id}-${reaction}`;
    setPressKey((prev) => ({ ...prev, [k]: (prev[k] || 0) + 1 }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
      setMessages([
        {
          id: "ai-0",
          type: "ai",
          content: aiSteps[0].content,
          options: aiSteps[0].options,
          reasoning: aiSteps[0].reasoning,
          tools: aiSteps[0].tools,
        },
      ]);
      setStep(0);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    const last = messages[messages.length - 1];
    if (last?.type !== "ai") return;
    const streamMs = countWords(last.content) * WORD_STEP_MS + 1200;
    const interval = window.setInterval(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }, 160);
    const stop = window.setTimeout(
      () => window.clearInterval(interval),
      streamMs,
    );
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(stop);
    };
  }, [messages, isTyping]);

  useEffect(() => {
    if (step < 0 || step >= aiSteps.length - 1) return;
    if (aiSteps[step].options || aiSteps[step].awaitsInput) return;
    // Back-to-back AI messages: wait for the current message's word-by-word
    // animation to finish, then drop the next bubble directly — no typing
    // indicator between consecutive AI replies.
    const wordCount = countWords(aiSteps[step].content);
    const animEnd = Math.max(1, wordCount) * WORD_STEP_MS + 320;
    const breath = 350;
    const timer = setTimeout(() => {
      const nextStep = step + 1;
      const next = aiSteps[nextStep];
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${nextStep}`,
          type: "ai",
          content: next.content,
          options: next.options,
          reasoning: next.reasoning,
          tools: next.tools,
        },
      ]);
      setStep(nextStep);
    }, animEnd + breath);
    return () => clearTimeout(timer);
  }, [step]);

  const handleOptionClick = (chosen: string) => {
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 && m.type === "ai"
          ? { ...m, options: undefined }
          : m,
      ),
    );
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, type: "user", content: chosen },
    ]);

    const nextStep = step + 1;
    if (nextStep < aiSteps.length) {
      const next = aiSteps[nextStep];
      setPendingEvents(next.events);
      setIsTyping(true);
      const delay = next.events && next.events.length > 0
        ? next.events.length * EVENT_DURATION_MS + 250
        : 900;
      setTimeout(() => {
        setIsTyping(false);
        setPendingEvents(undefined);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${nextStep}`,
            type: "ai",
            content: next.content,
            options: next.options,
            reasoning: next.reasoning,
            tools: next.tools,
          },
        ]);
        setStep(nextStep);
      }, delay);
    }
  };

  const handleSend = () => {
    if (!hasInput) return;
    const text = value.trim();
    setValue("");
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, type: "user", content: text },
    ]);

    const current = aiSteps[step];
    if (!current?.awaitsInput) return;
    const nextStep = step + 1;
    if (nextStep >= aiSteps.length) return;
    const next = aiSteps[nextStep];

    setPendingEvents(next.events);
    setIsTyping(true);
    const delay = next.events && next.events.length > 0
      ? next.events.length * EVENT_DURATION_MS + 250
      : 900;
    setTimeout(() => {
      setIsTyping(false);
      setPendingEvents(undefined);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${nextStep}`,
          type: "ai",
          content: next.content,
          options: next.options,
          reasoning: next.reasoning,
          tools: next.tools,
        },
      ]);
      setStep(nextStep);
    }, delay);
  };

  return (
    <div
      className="relative min-h-screen bg-cover bg-top bg-no-repeat"
      style={{ backgroundImage: "url('/global-payments-bg.png')" }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes thumb-pop-up {
              0% { transform: translateY(0) scale(1); }
              45% { transform: translateY(-3px) scale(1.18); }
              100% { transform: translateY(0) scale(1); }
            }
            @keyframes thumb-pop-down {
              0% { transform: translateY(0) scale(1); }
              45% { transform: translateY(3px) scale(1.18); }
              100% { transform: translateY(0) scale(1); }
            }
            @keyframes rec-pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.4; transform: scale(0.85); }
            }
            @keyframes rec-bar {
              0%, 100% { transform: scaleY(0.3); }
              50% { transform: scaleY(1); }
            }
            @keyframes thinking-dot {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(0.7); opacity: 0.55; }
            }
            @keyframes thinking-cursor {
              0%, 49% { opacity: 1; }
              50%, 100% { opacity: 0; }
            }
            @keyframes skeleton-shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
            @keyframes event-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `,
        }}
      />
      <div
        data-chat-card
        className={`absolute top-24 right-6 flex h-[680px] flex-col overflow-hidden rounded-[20px] border border-[var(--ds-border-line-strong)] bg-[var(--ds-bg-canvas)] transition-[width] duration-300 ease-out ${
          expanded ? "w-[640px]" : "w-[400px]"
        }`}
        style={{
          boxShadow:
            "0 -3px 14px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.05), 0 14px 36px rgba(0,0,0,0.10), 0 36px 72px rgba(0,0,0,0.08)",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col bg-[var(--ds-bg-canvas)]"
          style={{
            transform:
              view === "chat" ? "translateX(0)" : "translateX(100%)",
            opacity: view === "chat" ? 1 : 0.4,
            transition:
              "transform 360ms cubic-bezier(0.32, 0.72, 0, 1), opacity 240ms ease-out",
            pointerEvents: view === "chat" ? "auto" : "none",
          }}
        >
        <header className="flex w-full items-center gap-1 border-b border-[var(--ds-border-line-soft)] px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <button
              onClick={() => setView("history")}
              className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)] active:bg-[var(--ds-bg-subtle)]"
              aria-label="View chat history"
            >
              <ChevronLeft className="size-5" strokeWidth={1.5} />
            </button>
            <img
              src="/global-payments-avatar.png"
              alt="Global Payments"
              className="ml-1 size-9 shrink-0 rounded-full object-cover"
            />
            <div className="ml-1 flex min-w-0 flex-col">
              <p className="truncate text-[14px] leading-5 font-semibold text-[#333]">
                Global Payments
              </p>
              <p className="truncate text-[10px] leading-4 font-medium text-[var(--ds-text-muted)]">
                Virtual Assistant
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className={`flex size-7 items-center justify-center rounded-[6px] transition-colors ${
                  menuOpen
                    ? "bg-[var(--ds-bg-subtle)] text-[var(--ds-text-ink)]"
                    : "text-[var(--ds-text-secondary)] hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
                }`}
                aria-label="More options"
                aria-expanded={menuOpen}
              >
                <MoreVertical className="size-4" strokeWidth={1.5} />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+6px)] z-20 flex flex-col overflow-hidden rounded-[10px] border bg-white p-1"
                  style={{
                    borderColor: "var(--ds-border-line)",
                    boxShadow:
                      "0 4px 12px -3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
                    animation: "fade-in 160ms ease-out both",
                  }}
                  role="menu"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      setExpanded((e) => !e);
                    }}
                    className="flex w-full items-center gap-2 whitespace-nowrap rounded-[6px] px-2 py-1.5 text-left text-[12px] text-[var(--ds-text-ink)] transition-colors hover:bg-[var(--ds-bg-paper)]"
                  >
                    {expanded ? (
                      <Minimize2
                        className="size-3.5 text-[var(--ds-text-secondary)]"
                        strokeWidth={1.75}
                      />
                    ) : (
                      <Maximize2
                        className="size-3.5 text-[var(--ds-text-secondary)]"
                        strokeWidth={1.75}
                      />
                    )}
                    {expanded ? "Collapse window" : "Expand window"}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleRestart}
                    className="flex w-full items-center gap-2 whitespace-nowrap rounded-[6px] px-2 py-1.5 text-left text-[12px] text-[var(--ds-text-ink)] transition-colors hover:bg-[var(--ds-bg-paper)]"
                  >
                    <RotateCcw
                      className="size-3.5 text-[var(--ds-text-secondary)]"
                      strokeWidth={1.75}
                    />
                    Restart
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleDownloadTranscript}
                    className="flex w-full items-center gap-2 whitespace-nowrap rounded-[6px] px-2 py-1.5 text-left text-[12px] text-[var(--ds-text-ink)] transition-colors hover:bg-[var(--ds-bg-paper)]"
                  >
                    <Download
                      className="size-3.5 text-[var(--ds-text-secondary)]"
                      strokeWidth={1.75}
                    />
                    Download transcript
                  </button>
                </div>
              )}
            </div>
            <button
              className="flex size-7 items-center justify-center rounded-[6px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)] active:bg-[var(--ds-bg-subtle)]"
              aria-label="Close"
            >
              <X className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <main
          ref={scrollRef}
          data-scroll-container
          className="scrollbar-subtle flex flex-1 flex-col gap-2 overflow-y-auto px-4 pt-3 pb-4"
        >
          {messages.map((m, idx) => {
            if (m.type === "user") {
              return (
                <div
                  key={m.id}
                  className="flex justify-end"
                  style={{
                    animation: "bubble-in 240ms cubic-bezier(0.2, 0.6, 0.2, 1) both",
                  }}
                >
                  <div
                    className="max-w-[78%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[6px] rounded-bl-[12px] border px-3 py-2 text-[14px] leading-[1.5] tracking-tight"
                    style={{
                      backgroundColor: USER_BUBBLE,
                      borderColor: USER_BUBBLE_BORDER,
                      color: USER_TEXT,
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              );
            }
            if (m.type === "voice") {
              const isPlaying = playingId === m.id;
              const progress = isPlaying ? playProgress : 0;
              const elapsed = Math.floor(progress * m.duration);
              const display = isPlaying ? elapsed : m.duration;
              const heights = [
                8, 14, 10, 18, 12, 16, 8, 13, 11, 17, 9, 15, 11, 18, 13, 10, 16, 8, 14, 11,
              ];
              const activeBars = Math.floor(progress * heights.length);
              return (
                <div
                  key={m.id}
                  className="flex justify-end"
                  style={{
                    animation: "bubble-in 240ms cubic-bezier(0.2, 0.6, 0.2, 1) both",
                  }}
                >
                  <div
                    className="flex max-w-[78%] items-center gap-2 rounded-tl-[12px] rounded-tr-[12px] rounded-br-[6px] rounded-bl-[12px] border px-2 py-2"
                    style={{
                      backgroundColor: USER_BUBBLE,
                      borderColor: USER_BUBBLE_BORDER,
                      color: USER_TEXT,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handlePlayToggle(m.id)}
                      className="flex size-5 shrink-0 items-center justify-center rounded-full text-[var(--ds-accent-ink)] transition-colors hover:bg-white/40"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? (
                        <Pause className="size-2.5" strokeWidth={2} fill="currentColor" />
                      ) : (
                        <Play
                          className="size-2.5 translate-x-[1px]"
                          strokeWidth={2}
                          fill="currentColor"
                        />
                      )}
                    </button>
                    <div className="flex items-center gap-[2px]">
                      {heights.map((h, i) => (
                        <span
                          key={i}
                          className="inline-block w-[2px] rounded-full transition-colors duration-150"
                          style={{
                            height: `${h}px`,
                            backgroundColor:
                              i < activeBars
                                ? "var(--ds-accent-ink)"
                                : "var(--ds-accent-border)",
                          }}
                        />
                      ))}
                    </div>
                    <span className="ml-1 shrink-0 font-mono text-[11px] tabular-nums">
                      0:{String(display).padStart(2, "0")}
                    </span>
                  </div>
                </div>
              );
            }
            const isSelected = selectedMessageId === m.id;
            const reaction = reactions[m.id];
            const showLabel = idx === 0 || messages[idx - 1].type !== "ai";
            return (
              <div key={m.id} className="flex flex-col gap-1">
                {showLabel && (
                  <p className="ml-1 text-[11px] font-medium tracking-wide text-[var(--ds-text-secondary)]">
                    Tars <span className="text-[var(--ds-text-faint)]">· just now</span>
                  </p>
                )}
                <div
                  className="flex justify-start"
                  style={{
                    animation: "bubble-in 240ms cubic-bezier(0.2, 0.6, 0.2, 1) both",
                  }}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleBubble(m.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleBubble(m.id);
                      }
                    }}
                    className="max-w-[88%] cursor-pointer rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-3 py-2 text-left text-[14px] leading-[1.5] tracking-tight transition-colors hover:bg-[var(--ds-bg-subtle)]"
                    style={{
                      backgroundColor: AI_BUBBLE,
                      borderColor: LINE,
                      color: INK,
                    }}
                  >
                    {(m.reasoning || m.tools) && (
                      <ReasoningToolsStrip
                        reasoning={m.reasoning}
                        tools={m.tools}
                      />
                    )}
                    <Words>{m.content}</Words>
                  </div>
                </div>
                {isSelected && (
                  <div
                    className="ml-1 flex items-center gap-0.5"
                    style={{ animation: "fade-in 180ms ease-out both" }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSpeak(m.id, m.content)}
                      className={`flex size-6 items-center justify-center rounded-[4px] transition-colors ${
                        speakingMessageId === m.id
                          ? "text-[var(--ds-accent-ink)]"
                          : "text-[var(--ds-text-secondary)] hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
                      }`}
                      aria-label={
                        speakingMessageId === m.id
                          ? "Stop reading"
                          : "Read aloud"
                      }
                    >
                      {speakingMessageId === m.id ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
                          <path
                            d="M14 10a3 3 0 0 1 0 4"
                            style={{
                              animation:
                                "arc-fade 1800ms ease-in-out infinite",
                            }}
                          />
                          <path
                            d="M16.5 7.5a6 6 0 0 1 0 9"
                            style={{
                              animation:
                                "arc-fade 1800ms ease-in-out 350ms infinite",
                            }}
                          />
                          <path
                            d="M19.364 5.636a9 9 0 0 1 0 12.728"
                            style={{
                              animation:
                                "arc-fade 1800ms ease-in-out 700ms infinite",
                            }}
                          />
                        </svg>
                      ) : (
                        <Volume2 className="size-3.5" strokeWidth={1.5} />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReact(m.id, "like")}
                      className={`flex size-6 items-center justify-center rounded-[4px] transition-colors ${
                        reaction === "like"
                          ? "text-[var(--ds-accent-ink)]"
                          : "text-[var(--ds-text-secondary)] hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
                      }`}
                      aria-label="Like"
                    >
                      <ThumbsUp
                        key={`up-${pressKey[`${m.id}-like`] || 0}`}
                        className="size-3"
                        strokeWidth={reaction === "like" ? 2 : 1.5}
                        fill={reaction === "like" ? "var(--ds-accent-soft)" : "none"}
                        style={
                          pressKey[`${m.id}-like`]
                            ? {
                                animation:
                                  "thumb-pop-up 320ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                              }
                            : undefined
                        }
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReact(m.id, "dislike")}
                      className={`flex size-6 items-center justify-center rounded-[4px] transition-colors ${
                        reaction === "dislike"
                          ? "text-[var(--ds-accent-ink)]"
                          : "text-[var(--ds-text-secondary)] hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
                      }`}
                      aria-label="Dislike"
                    >
                      <ThumbsDown
                        key={`down-${pressKey[`${m.id}-dislike`] || 0}`}
                        className="size-3"
                        strokeWidth={reaction === "dislike" ? 2 : 1.5}
                        fill={reaction === "dislike" ? "var(--ds-accent-soft)" : "none"}
                        style={
                          pressKey[`${m.id}-dislike`]
                            ? {
                                animation:
                                  "thumb-pop-down 320ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                              }
                            : undefined
                        }
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(m.content)}
                      className="flex size-6 items-center justify-center rounded-[4px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
                      aria-label="Copy"
                    >
                      <Copy className="size-3" strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                {m.options &&
                  (() => {
                    const optionStart =
                      countWords(m.content) * WORD_STEP_MS + 120;
                    return (
                      <div className="flex max-w-[88%] flex-col items-start gap-1.5">
                        {m.options.map((opt, i) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleOptionClick(opt)}
                            className="group/opt inline-flex items-center gap-2 rounded-full border border-[var(--ds-border-line)] bg-[var(--ds-bg-paper)] px-3.5 py-1.5 text-left text-[14px] leading-[1.5] tracking-tight whitespace-nowrap text-[var(--ds-text-ink)] transition-all duration-200 will-change-transform hover:border-[var(--ds-accent-border)] hover:bg-[var(--ds-accent-soft)]"
                            style={{
                              animation: `option-in 280ms cubic-bezier(0.2, 0.6, 0.2, 1) ${optionStart + i * 70}ms both`,
                            }}
                          >
                            {opt}
                            <ArrowRight
                              className="size-3.5 text-[var(--ds-accent-ink)] transition-transform duration-200 group-hover/opt:translate-x-0.5"
                              strokeWidth={2}
                            />
                          </button>
                        ))}
                      </div>
                    );
                  })()}
              </div>
            );
          })}
          {isTyping && <TypingIndicator events={pendingEvents} />}
        </main>

        <div className="flex w-full flex-col gap-1.5 px-4 pb-3">
          {hasInput && (
            <div
              className="flex items-center justify-center gap-1 px-1 text-[10px] leading-4 text-[var(--ds-text-muted)]"
              style={{ animation: "fade-in 180ms ease-out both" }}
            >
              Press
              <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded-[3px] border border-[var(--ds-border-hover)] bg-white px-1 font-sans text-[10px] leading-none text-[var(--ds-text-secondary)]">
                ↵
              </kbd>
              to send
            </div>
          )}
          {isRecording ? (
            <div
              className="flex h-11 w-full items-center gap-2 rounded-[12px] border border-[var(--ds-accent-border)] bg-white px-2"
              style={{ animation: "fade-in 180ms ease-out both" }}
            >
              <button
                type="button"
                onClick={handleCancelRecording}
                className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
                aria-label="Cancel recording"
              >
                <X className="size-4" strokeWidth={1.75} />
              </button>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="size-2 shrink-0 rounded-full bg-[var(--ds-danger)] animate-[rec-pulse_1.2s_ease-in-out_infinite]" />
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-[var(--ds-text-ink)]">
                  {String(Math.floor(recordSeconds / 60)).padStart(2, "0")}:
                  {String(recordSeconds % 60).padStart(2, "0")}
                </span>
                <div className="flex min-w-0 flex-1 items-center justify-center gap-[2px]">
                  {[6, 14, 9, 18, 11, 16, 7, 13, 10, 17, 8, 15, 12, 6, 14].map(
                    (h, i) => (
                      <span
                        key={i}
                        className="inline-block w-[2px] origin-center rounded-full bg-[var(--ds-accent-ink)]"
                        style={{
                          height: `${h}px`,
                          animation: `rec-bar 900ms ease-in-out ${i * 60}ms infinite`,
                        }}
                      />
                    ),
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleStopAndSend}
                className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-[var(--ds-accent)] text-white transition-colors hover:bg-[var(--ds-accent-hover)] active:bg-[var(--ds-accent-pressed)]"
                aria-label="Stop and send"
              >
                <ArrowUp className="size-4" strokeWidth={2} />
              </button>
            </div>
          ) : (
            <div className="flex h-11 w-full items-center gap-2 rounded-[12px] border border-[var(--ds-border-line)] bg-[var(--ds-bg-paper)] px-2 transition-all duration-200 hover:border-[var(--ds-border-hover)] focus-within:!border-[var(--ds-accent)] focus-within:!ring-4 focus-within:!ring-[var(--ds-accent)]/15">
              <button
                type="button"
                className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)] active:bg-[var(--ds-bg-subtle)]"
                aria-label="Add attachment"
              >
                <Plus className="size-4" strokeWidth={1.5} />
              </button>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask me anything..."
                className="h-full min-w-0 flex-1 bg-transparent text-[12px] leading-4 text-[#333] outline-none placeholder:text-[#555]"
              />
              {hasInput ? (
                <button
                  type="button"
                  onClick={handleSend}
                  className="flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-[var(--ds-accent)] text-white transition-colors hover:bg-[var(--ds-accent-hover)] active:bg-[var(--ds-accent-pressed)]"
                  aria-label="Send message"
                >
                  <ArrowUp className="size-4" strokeWidth={2} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)] active:bg-[var(--ds-bg-subtle)]"
                  aria-label="Voice input"
                >
                  <Mic className="size-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          )}
        </div>
        </div>

        <div
          className="absolute inset-0 flex flex-col bg-[var(--ds-bg-canvas)]"
          style={{
            transform:
              view === "history" ? "translateX(0)" : "translateX(-100%)",
            opacity: view === "history" ? 1 : 0.4,
            transition:
              "transform 360ms cubic-bezier(0.32, 0.72, 0, 1), opacity 240ms ease-out",
            pointerEvents: view === "history" ? "auto" : "none",
          }}
        >
          <HistoryView onBack={() => setView("chat")} />
        </div>
      </div>
    </div>
  );
}

const HISTORY_CHATS = [
  { id: "1", title: "Refund for Order #3081", preview: "You: thanks, all sorted", time: "Today", initial: "T", unread: false },
  { id: "2", title: "Upgrading to Studio plan", preview: "Tars: here are the differences…", time: "Yesterday", initial: "T", unread: true },
  { id: "3", title: "Custom domain setup", preview: "Priya: I've added the DNS…", time: "Mar 12", initial: "P", unread: false },
  { id: "4", title: "Welcome to Tars", preview: "Tars: Good morning. I'm…", time: "Mar 8", initial: "T", unread: false },
];

function HistoryView({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-[var(--ds-border-line-soft)] px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
            aria-label="Back to chat"
          >
            <ChevronLeft className="size-5" strokeWidth={1.5} />
          </button>
          <p className="text-[18px] leading-6 font-semibold text-[var(--ds-text-ink)]">
            History
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-full border border-[var(--ds-border-line)] bg-[var(--ds-bg-paper)] px-2.5 py-1 text-[11px] font-semibold text-[var(--ds-text-ink)] transition-colors hover:bg-[var(--ds-bg-subtle)]"
        >
          <Plus className="size-3" strokeWidth={2.25} />
          New
        </button>
      </header>
      <div className="scrollbar-subtle flex-1 overflow-y-auto">
        {HISTORY_CHATS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={onBack}
            className="flex w-full items-center gap-3 border-b border-[var(--ds-border-line-soft)] px-4 py-3 text-left transition-colors hover:bg-[var(--ds-bg-paper)]"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--ds-border-line)] bg-[#F4EFE5] text-[12px] font-semibold text-[var(--ds-text-label)]">
              {c.initial}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-[13px] font-medium text-[var(--ds-text-ink)]">
                  {c.title}
                </p>
                <p className="shrink-0 text-[10px] font-medium text-[var(--ds-text-muted)]">
                  {c.time}
                </p>
              </div>
              <p className="truncate text-[12px] text-[var(--ds-text-secondary)]">
                {c.preview}
              </p>
            </div>
            {c.unread && (
              <span className="size-2 shrink-0 rounded-full bg-[var(--ds-accent)]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
