"use client";

import {
  ArrowDown,
  Calendar,
  Check,
  ChevronRight,
  Copy,
  Database,
  ExternalLink,
  Eye,
  Link as LinkIcon,
  Search,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Volume2,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatHistory } from "./ChatHistory";
import { MessageBubble, Words } from "./MessageBubble";
import { Composer } from "./Composer";
import { VoiceAgent } from "./VoiceAgent";

const WORD_STEP_MS = 38;

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

const EVENT_DURATION_MS = 2000;

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
          backgroundColor: "#E4E4E7",
          color: "#1a1a1a",
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
            borderColor: "var(--ds-border-line)",
            boxShadow:
              "0 4px 14px -3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <span
            className="block text-[12px] font-semibold leading-[1.35]"
            style={{ color: "var(--ds-text-ink)" }}
          >
            {source.title}
          </span>
          <span
            className="mt-1 block text-[11px] leading-[1.45]"
            style={{ color: "var(--ds-text-secondary)" }}
          >
            {source.description}
          </span>
          <a
            href={`https://${source.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex max-w-full items-center gap-1 font-mono text-[11px] hover:underline"
            style={{ color: "var(--ds-accent-ink)" }}
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

function ReasoningToolsStrip({
  reasoning,
  tools,
}: {
  reasoning?: React.ReactNode[];
  tools?: ToolEntry[];
}) {
  const [expanded, setExpanded] = useState<"reasoning" | "tools" | null>(null);
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  const stripRef = useRef<HTMLDivElement>(null);
  const interacted = useRef(false);
  const openReasoning = expanded === "reasoning";
  const openTools = expanded === "tools";
  const toggle = (which: "reasoning" | "tools") => {
    interacted.current = true;
    setExpanded((prev) => (prev === which ? null : which));
  };
  const toggleToolDetail = (name: string) => {
    setExpandedTools((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  useEffect(() => {
    if (!interacted.current) return;
    const el = stripRef.current;
    if (!el) return;
    const scrollContainer = el.closest<HTMLElement>("[data-scroll-container]");
    if (!scrollContainer) return;
    const id = requestAnimationFrame(() => {
      if (expanded !== null) {
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
          className="mt-2 flex flex-col gap-1.5"
          style={{ animation: "fade-in 200ms ease-out both" }}
        >
          {tools.map((t) => {
            const isOpen = expandedTools.has(t.name);
            return (
              <div
                key={t.name}
                className="rounded-[8px] border"
                style={{ borderColor: "#E4E4E7" }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleToolDetail(t.name);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-[#FAFAFA]"
                >
                  <p
                    className="text-[11px]"
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
                  <ChevronRight
                    className="size-3 shrink-0 transition-transform"
                    strokeWidth={2}
                    style={{
                      color: "var(--ds-text-muted)",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0)",
                    }}
                    aria-hidden
                  />
                </button>
                {isOpen && (
                  <div
                    className="flex flex-col gap-1.5 border-t px-3 py-2"
                    style={{
                      borderColor: "#E4E4E7",
                      animation: "fade-in 180ms ease-out both",
                    }}
                  >
                    <div>
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--ds-text-muted)" }}
                      >
                        Arguments
                      </span>
                      <pre
                        className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[10px] leading-[1.5]"
                        style={{ color: "var(--ds-accent-ink)" }}
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
                        style={{ color: "var(--ds-accent-ink)" }}
                      >
                        {t.result}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div
        className="mt-1.5 mb-1.5 h-px"
        style={{ backgroundColor: "var(--ds-border-line)" }}
      />
    </div>
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
        name: "verify_SlotAvailable",
        args: `{ "slot": "2026-05-23T10:00", "specialist": "specialist@tars.com" }`,
        result: `{ "available": true, "locked_until": "2026-05-23T10:05" }`,
      },
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
      {
        name: "send_CalendarInvite",
        args: `{ "event_id": "evt_8f3a2c", "to": ["you@tars.com", "specialist@tars.com"] }`,
        result: `{ "sent": 2, "delivered": 2 }`,
      },
      {
        name: "notify_Specialist",
        args: `{ "specialist": "specialist@tars.com", "channel": "slack", "message_template": "new_booking" }`,
        result: `{ "delivered": true, "channel_id": "C0184T9D2KH" }`,
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
      timestamp: number;
    }
  | { id: string; type: "user"; content: string };

function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

type View = "chat" | "history";

function TypingIndicator({ events }: { events?: ConversationEvent[] }) {
  const [eventIdx, setEventIdx] = useState(0);
  const indicatorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!events || events.length <= 1) return;
    setEventIdx(0);
    const id = window.setInterval(() => {
      setEventIdx((i) => (i + 1 < events.length ? i + 1 : i));
    }, EVENT_DURATION_MS);
    return () => window.clearInterval(id);
  }, [events]);

  useEffect(() => {
    const el = indicatorRef.current;
    if (!el) return;
    const container = el.closest<HTMLElement>("[data-scroll-container]");
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [eventIdx]);

  if (!events || events.length === 0) {
    return (
      <div
        ref={indicatorRef}
        className="flex items-center gap-2 px-1"
        style={{ animation: "fade-in 200ms ease-out both" }}
      >
        <span
          className="inline-flex size-3.5 shrink-0 items-center justify-center"
          style={{
            color: "var(--ds-accent)",
            animation: "event-spin 2.4s linear infinite",
          }}
          aria-hidden
        >
          <Sparkles className="size-3.5" strokeWidth={1.75} />
        </span>
        <span className="text-[12px] font-medium tracking-tight text-[var(--ds-text-secondary)]">
          AI is thinking
        </span>
      </div>
    );
  }

  return (
    <div
      ref={indicatorRef}
      className="flex flex-col gap-1.5 px-1"
      style={{ animation: "fade-in 200ms ease-out both" }}
    >
      {events.slice(0, eventIdx + 1).map((event, i) => {
        const isCurrent = i === eventIdx;
        return (
          <div
            key={i}
            className="flex items-center gap-2"
            style={{ animation: "fade-in 240ms ease-out both" }}
          >
            <span
              className="inline-flex size-3.5 shrink-0 items-center justify-center"
              style={
                isCurrent
                  ? {
                      color: "var(--ds-accent)",
                      animation: "event-spin 2.4s linear infinite",
                    }
                  : { color: "#0F7A38" }
              }
              aria-hidden
            >
              {isCurrent ? (
                <Sparkles className="size-3.5" strokeWidth={1.75} />
              ) : (
                <Check className="size-3.5" strokeWidth={2.5} />
              )}
            </span>
            <span
              className="text-[12px] font-medium tracking-tight"
              style={{
                color: isCurrent
                  ? "var(--ds-text-secondary)"
                  : "var(--ds-text-muted)",
              }}
            >
              {event.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function ChatWindow() {
  const [view, setView] = useState<View>("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState(-1);
  const [isTyping, setIsTyping] = useState(true);
  const [pendingEvents, setPendingEvents] = useState<
    ConversationEvent[] | undefined
  >(undefined);
  const [expanded, setExpanded] = useState(false);
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
  const [showScrollToLatest, setShowScrollToLatest] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [historyTab, setHistoryTab] = useState<"messages" | "voice">("messages");
  const scrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const distanceFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;
      setShowScrollToLatest(distanceFromBottom > 120);
    };
    el.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToLatest = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  const toggleBubble = (id: string) => {
    setSelectedMessageId((prev) => (prev === id ? null : id));
  };

  // Latest AI message is active by default — auto-select it when the
  // conversation grows so its inline actions are visible without a click.
  useEffect(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].type === "ai") {
        setSelectedMessageId(messages[i].id);
        return;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedMessageId) return;
    const container = scrollRef.current;
    if (!container) return;
    const id = requestAnimationFrame(() => {
      const bubble = container.querySelector<HTMLElement>(
        `[data-message-id="${selectedMessageId}"]`,
      );
      if (!bubble) return;
      const bubbleRect = bubble.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      if (
        bubbleRect.bottom > containerRect.bottom ||
        bubbleRect.top < containerRect.top
      ) {
        bubble.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
    return () => cancelAnimationFrame(id);
  }, [selectedMessageId]);

  const handleCopy = (content: React.ReactNode) => {
    if (typeof navigator === "undefined") return;
    void navigator.clipboard?.writeText(getNodeText(content));
  };

  const speakingWordElRef = useRef<HTMLElement | null>(null);
  const clearSpeakingHighlight = () => {
    if (speakingWordElRef.current) {
      speakingWordElRef.current.classList.remove("speaking-word");
      speakingWordElRef.current = null;
    }
  };

  const handleSpeak = (id: string, content: React.ReactNode) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    clearSpeakingHighlight();
    if (speakingMessageId === id) {
      setSpeakingMessageId(null);
      return;
    }
    const text = getNodeText(content);
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.onboundary = (event) => {
      if (event.name !== "word") return;
      const before = text.substring(0, event.charIndex);
      const wordIdx = before.trim()
        ? before.trim().split(/\s+/).length
        : 0;
      const bubble = document.querySelector(`[data-message-id="${id}"]`);
      if (!bubble) return;
      const wordEl = bubble.querySelector<HTMLElement>(
        `[data-text-word-idx="${wordIdx}"]`,
      );
      if (!wordEl) return;
      if (speakingWordElRef.current && speakingWordElRef.current !== wordEl) {
        speakingWordElRef.current.classList.remove("speaking-word");
      }
      wordEl.classList.add("speaking-word");
      speakingWordElRef.current = wordEl;
    };
    utterance.onend = () => {
      clearSpeakingHighlight();
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      clearSpeakingHighlight();
      setSpeakingMessageId(null);
    };
    window.speechSynthesis.speak(utterance);
    setSpeakingMessageId(id);
  };

  const handleReact = (id: string, kind: "like" | "dislike") => {
    setReactions((prev) => ({
      ...prev,
      [id]: prev[id] === kind ? null : kind,
    }));
    const k = `${id}-${kind}`;
    setPressKey((prev) => ({ ...prev, [k]: (prev[k] || 0) + 1 }));
  };

  const getNodeText = (node: React.ReactNode): string => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(getNodeText).join("");
    if (React.isValidElement(node)) {
      const el = node as React.ReactElement<{ children?: React.ReactNode }>;
      return getNodeText(el.props.children);
    }
    return "";
  };

  const handleRestart = () => {
    setMessages([]);
    setStep(-1);
    setIsTyping(true);
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
          timestamp: Date.now(),
        },
      ]);
      setStep(0);
    }, 700);
  };

  const handleDownload = () => {
    const lines = messages.map((m) => {
      if (m.type === "user") return `You: ${m.content}`;
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
          timestamp: Date.now(),
        },
      ]);
      setStep(0);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  // Track whether the user is "following" the conversation (near the bottom).
  // Updated on every manual scroll. We only auto-scroll when following — if
  // the user has scrolled up, leave their position alone.
  const followingRef = useRef(true);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const d = el.scrollHeight - el.scrollTop - el.clientHeight;
      followingRef.current = d < 80;
    };
    el.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => el.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (followingRef.current) {
        // Instant scroll (no smooth) so consecutive content-grow ticks don't
        // queue up animations that fight the user's scroll.
        el.scrollTop = el.scrollHeight;
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (followingRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (step < 0 || step >= aiSteps.length - 1) return;
    if (aiSteps[step].options || aiSteps[step].awaitsInput) return;
    // Wait for the current message's word-by-word animation to finish before
    // dropping the next bubble. No typing indicator between back-to-back AI
    // replies.
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
          timestamp: Date.now(),
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
      const delay =
        next.events && next.events.length > 0
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
            timestamp: Date.now(),
          },
        ]);
        setStep(nextStep);
      }, delay);
    }
  };

  const handleSend = (text: string) => {
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
    const delay =
      next.events && next.events.length > 0
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
          timestamp: Date.now(),
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
            .tooltip-host { position: relative; }
            .tooltip-host::after {
              content: attr(data-tooltip);
              position: absolute;
              bottom: calc(100% + 6px);
              left: 50%;
              transform: translateX(-50%) translateY(2px);
              z-index: 999;
              padding: 4px 8px;
              border-radius: 6px;
              background: #1a1a1a;
              color: #fff;
              font-size: 11px;
              font-weight: 500;
              line-height: 1.3;
              letter-spacing: -0.01em;
              white-space: nowrap;
              opacity: 0;
              pointer-events: none;
              transition: opacity 120ms ease-out, transform 120ms ease-out;
            }
            .tooltip-host:hover::after,
            .tooltip-host:focus-visible::after {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
              transition-delay: 200ms;
            }
            .tooltip-host.tooltip-left::after {
              left: 0;
              transform: translateX(0) translateY(2px);
            }
            .tooltip-host.tooltip-left:hover::after,
            .tooltip-host.tooltip-left:focus-visible::after {
              transform: translateX(0) translateY(0);
            }
            .tooltip-host.tooltip-below::after {
              bottom: auto;
              top: calc(100% + 6px);
              transform: translateX(-50%) translateY(-2px);
            }
            .tooltip-host.tooltip-below:hover::after,
            .tooltip-host.tooltip-below:focus-visible::after {
              transform: translateX(-50%) translateY(0);
            }
            .tooltip-host.tooltip-below.tooltip-left::after {
              bottom: auto;
              top: calc(100% + 6px);
              left: 0;
              transform: translateX(0) translateY(-2px);
            }
            .tooltip-host.tooltip-below.tooltip-left:hover::after,
            .tooltip-host.tooltip-below.tooltip-left:focus-visible::after {
              transform: translateX(0) translateY(0);
            }
            .speaking-word {
              background-color: #E4E4E7;
              border-radius: 3px;
            }
            @keyframes scroll-btn-in {
              from {
                opacity: 0;
                transform: translateX(-50%) translateY(8px) scale(0.9);
              }
              to {
                opacity: 1;
                transform: translateX(-50%) translateY(0) scale(1);
              }
            }
          `,
        }}
      />
      <div
        data-chat-card
        className={`absolute top-20 right-6 flex h-[700px] flex-col overflow-hidden rounded-[20px] bg-white transition-[width] duration-300 ease-out ${
          expanded ? "w-[640px]" : "w-[400px]"
        }`}
        style={{
          boxShadow: "8.322px 8.322px 80.6px 0px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col bg-white"
          style={{
            transform:
              view === "chat" ? "translateX(0)" : "translateX(100%)",
            opacity: view === "chat" ? 1 : 0.4,
            transition:
              "transform 360ms cubic-bezier(0.32, 0.72, 0, 1), opacity 240ms ease-out",
            pointerEvents: view === "chat" ? "auto" : "none",
          }}
        >
            <ChatHeader
              onBack={() => setView("history")}
              onRestart={handleRestart}
              onDownload={handleDownload}
              onToggleExpand={() => setExpanded((e) => !e)}
              expanded={expanded}
            />
            <main
              ref={scrollRef}
              data-scroll-container
              className="scrollbar-subtle flex-1 overflow-y-auto px-4 pt-3 pb-2"
            >
              <div className="flex w-full flex-col gap-2">
                {messages.map((m, idx) => {
                  if (m.type === "user") {
                    return (
                      <MessageBubble key={m.id} variant="user">
                        {m.content}
                      </MessageBubble>
                    );
                  }
                  const isSelected = selectedMessageId === m.id;
                  const reaction = reactions[m.id];
                  const showLabel =
                    idx === 0 || messages[idx - 1].type !== "ai";
                  return (
                    <div
                      key={m.id}
                      data-message-id={m.id}
                      className="flex flex-col gap-1"
                    >
                      {showLabel && (
                        <div
                          className={`grid transition-[grid-template-rows,margin] duration-200 ${
                            isSelected
                              ? "mb-0.5 grid-rows-[1fr]"
                              : "grid-rows-[0fr]"
                          }`}
                        >
                          <p className="ml-1 overflow-hidden text-[11px] font-medium tracking-wide text-[var(--ds-text-secondary)]">
                            AI Agent{" "}
                            <span className="text-[var(--ds-text-faint)]">
                              • {formatTimestamp(m.timestamp)}
                            </span>
                          </p>
                        </div>
                      )}
                      <div
                        className="flex justify-start"
                        style={{
                          animation:
                            "bubble-in 240ms cubic-bezier(0.2, 0.6, 0.2, 1) both",
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
                          className="max-w-[88%] cursor-pointer rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border border-[#E4E4E7] bg-[#FAFAFA] px-3 py-2 text-left text-[14px] leading-[1.5] tracking-tight text-[var(--ds-text-ink)]"
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
                          className="relative z-10 ml-1 flex items-center gap-0.5"
                          style={{ animation: "fade-in 180ms ease-out both" }}
                        >
                          <button
                            type="button"
                            onClick={() => handleSpeak(m.id, m.content)}
                            className={`tooltip-host tooltip-below tooltip-left flex size-6 items-center justify-center rounded-[4px] transition-colors ${
                              speakingMessageId === m.id
                                ? "text-[var(--ds-accent-ink)]"
                                : "text-[var(--ds-text-secondary)] hover:bg-[#F0F0F0] hover:text-[var(--ds-text-ink)]"
                            }`}
                            aria-label={
                              speakingMessageId === m.id
                                ? "Stop reading"
                                : "Read aloud"
                            }
                            data-tooltip={
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
                              <Volume2
                                className="size-3.5"
                                strokeWidth={1.5}
                              />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReact(m.id, "like")}
                            className={`tooltip-host tooltip-below flex size-6 items-center justify-center rounded-[4px] transition-colors ${
                              reaction === "like"
                                ? "text-[var(--ds-accent-ink)]"
                                : "text-[var(--ds-text-secondary)] hover:bg-[#F0F0F0] hover:text-[var(--ds-text-ink)]"
                            }`}
                            aria-label="Like"
                            data-tooltip="Good response"
                          >
                            <ThumbsUp
                              key={`up-${pressKey[`${m.id}-like`] || 0}`}
                              className="size-3"
                              strokeWidth={reaction === "like" ? 2 : 1.5}
                              fill={
                                reaction === "like"
                                  ? "var(--ds-accent-soft)"
                                  : "none"
                              }
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
                            className={`tooltip-host tooltip-below flex size-6 items-center justify-center rounded-[4px] transition-colors ${
                              reaction === "dislike"
                                ? "text-[var(--ds-accent-ink)]"
                                : "text-[var(--ds-text-secondary)] hover:bg-[#F0F0F0] hover:text-[var(--ds-text-ink)]"
                            }`}
                            aria-label="Dislike"
                            data-tooltip="Bad response"
                          >
                            <ThumbsDown
                              key={`down-${pressKey[`${m.id}-dislike`] || 0}`}
                              className="size-3"
                              strokeWidth={reaction === "dislike" ? 2 : 1.5}
                              fill={
                                reaction === "dislike"
                                  ? "var(--ds-accent-soft)"
                                  : "none"
                              }
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
                            className="tooltip-host tooltip-below flex size-6 items-center justify-center rounded-[4px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[#F0F0F0] hover:text-[var(--ds-text-ink)]"
                            aria-label="Copy"
                            data-tooltip="Copy"
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
                                  className="rounded-full border border-[#E4E4E7] bg-[#FAFAFA] px-3.5 py-1.5 text-[14px] leading-[1.5] font-normal tracking-tight text-[#1a1a1a] transition-all duration-200 will-change-transform hover:border-[#120bf4] hover:bg-white hover:text-[#120bf4] active:bg-[#F0F0F0]"
                                  style={{
                                    animation: `option-in 280ms cubic-bezier(0.2, 0.6, 0.2, 1) ${optionStart + i * 70}ms both`,
                                  }}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          );
                        })()}
                    </div>
                  );
                })}
                {isTyping && <TypingIndicator events={pendingEvents} />}
              </div>
            </main>
            {showVoice && (
              <VoiceAgent
                onCancel={() => { setShowVoice(false); setHistoryTab("voice"); setView("history"); }}
                onChat={() => { setShowVoice(false); setHistoryTab("messages"); setView("history"); }}
              />
            )}
            <div className="relative px-4 pb-4">
              {showScrollToLatest && (
                <button
                  type="button"
                  onClick={scrollToLatest}
                  className="tooltip-host absolute -top-10 left-1/2 z-30 flex size-8 origin-center -translate-x-1/2 items-center justify-center rounded-full border border-[#E4E4E7] bg-white text-[#120bf4] transition-all duration-200 ease-out hover:scale-110 active:scale-95"
                  style={{
                    boxShadow:
                      "0 4px 12px -2px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)",
                    animation:
                      "scroll-btn-in 220ms cubic-bezier(0.2, 0.6, 0.2, 1) both",
                  }}
                  aria-label="Scroll to latest message"
                  data-tooltip="Scroll to latest"
                >
                  <ArrowDown className="size-4" strokeWidth={2} />
                </button>
              )}
              <Composer onSend={handleSend} />
            </div>
        </div>

        <div
          className="absolute inset-0 flex flex-col bg-white"
          style={{
            transform:
              view === "history" ? "translateX(0)" : "translateX(-100%)",
            opacity: view === "history" ? 1 : 0.4,
            transition:
              "transform 360ms cubic-bezier(0.32, 0.72, 0, 1), opacity 240ms ease-out",
            pointerEvents: view === "history" ? "auto" : "none",
          }}
        >
          <ChatHistory
            onSelectChat={() => setView("chat")}
            onClose={() => setView("chat")}
            onVoice={() => { setView("chat"); setShowVoice(true); }}
            tab={historyTab}
            onTabChange={setHistoryTab}
          />
        </div>
      </div>
    </div>
  );
}
