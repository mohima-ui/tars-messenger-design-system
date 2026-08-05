"use client";

import { useState, useRef, useEffect, useMemo, useCallback, type ReactNode } from "react";
import {
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  Database,
  Loader2,
  X,
  FileText,
  Square,
  Image as ImageIcon,
  PanelLeftClose,
  PanelLeft,
  MoreHorizontal,
  Mic,
  ArrowUp,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Volume2,
  MoreVertical,
  Download,
  Sparkles,
  ChevronLeft,
  MapPin,
  Star,
  Calendar,
} from "lucide-react";
import { Sources, type Source } from "@/components/chat/Sources";
/* aliased — this file already has its own PlanCards for the "Compare plans" flow */
import { PlanCards as PricingCards, type Plan } from "@/components/chat/PlanCards";
import { DataTable, type TableData } from "@/components/chat/DataTable";
import { StatusList, type StatusListData } from "@/components/chat/StatusList";
import { ImageGallery, type GalleryData } from "@/components/chat/ImageGallery";

/* ── word-by-word streaming (ported from the main app) ── */
const WORD_STEP_MS = 38;
function Words({ text }: { text: string }) {
  let idx = 0;
  return (
    <>
      {text.split(/(\s+)/).map((tok, i) => {
        if (tok === "") return null;
        if (/^\s+$/.test(tok)) return tok;
        const delay = idx++ * WORD_STEP_MS;
        return (
          <span
            key={i}
            className="inline-block will-change-transform"
            style={{ animation: `word-in 320ms cubic-bezier(0.2,0.6,0.2,1) ${delay}ms both` }}
          >
            {tok}
          </span>
        );
      })}
    </>
  );
}

/* ── "AI is thinking…" indicator (ported from the main app) ── */
const THINKING_PHRASES = ["AI is thinking…", "Thinking some more…", "Almost done thinking…", "Still thinking…"];
function useThinkingPhrase() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % THINKING_PHRASES.length), 2600);
    return () => clearInterval(t);
  }, []);
  return THINKING_PHRASES[i];
}
function AiThinking() {
  const phrase = useThinkingPhrase();
  return (
    <div className="flex items-center gap-2 px-1 text-[14px] font-medium text-[#333333]">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="ai-sparkle-web" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E1F5E" />
            <stop offset="100%" stopColor="#632E9A" />
          </linearGradient>
        </defs>
      </svg>
      <Sparkles
        className="size-4 shrink-0"
        strokeWidth={1.75}
        fill="none"
        stroke="url(#ai-sparkle-web)"
        style={{ animation: "event-spin 2.4s linear infinite" }}
      />
      <span className="ai-shimmer">{phrase}</span>
    </div>
  );
}

/* ── inline citation chip + hover source card (ported from the main app) ── */
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
  return (
    <span className="group/cite relative inline-block align-baseline">
      <span className="ml-0.5 inline-flex size-4 cursor-pointer items-center justify-center rounded-full border border-[#E0DAD3] bg-[#E0DAD3] align-middle text-[10px] font-semibold text-[#333333] transition-colors group-hover/cite:border-[#C5A8E0] group-hover/cite:bg-[#F0E7FA] group-hover/cite:text-[#4A1F77]">
        {n}
      </span>
      <span
        className="pointer-events-none absolute bottom-full left-1/2 z-20 w-[300px] -translate-x-1/2 pb-2 opacity-0 transition-opacity duration-150 group-hover/cite:pointer-events-auto group-hover/cite:opacity-100"
      >
        <span
          className="block rounded-[10px] border border-[#E0DAD3] bg-white p-3"
          style={{ boxShadow: "0 4px 14px -3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.04)" }}
        >
          <span className="block font-mono text-[9px] font-semibold tracking-wider uppercase text-[#6E6E6E]">Source {n}</span>
          <span className="mt-1 block text-[14px] font-semibold leading-[1.35] text-[#333333]">{source.title}</span>
          <span className="mt-1 block line-clamp-2 text-[12px] leading-[1.45] text-[#6E6E6E]">{source.description}</span>
          <a
            href={`https://${source.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex max-w-full items-center gap-1 font-mono text-[11px] text-[#4A1F77] underline"
          >
            <span className="truncate">{source.url}</span>
            <ExternalLink className="size-3 shrink-0" strokeWidth={2} aria-hidden />
          </a>
        </span>
      </span>
    </span>
  );
}

/* streamed answer — words animate in word-by-word, with inline citation chips */
type Part = { text: string } | { cite: number; after?: string };
function StreamParts({ parts }: { parts: Part[] }) {
  let idx = 0;
  const out: ReactNode[] = [];
  parts.forEach((part, pi) => {
    const next = parts[pi + 1];
    const nextIsCite = !!next && "cite" in next;
    if ("cite" in part) {
      const d = idx++ * WORD_STEP_MS;
      out.push(
        <span
          key={`c${pi}`}
          className="inline-block will-change-transform"
          style={{ animation: `word-in 320ms cubic-bezier(0.2,0.6,0.2,1) ${d}ms both` }}
        >
          <CitationSource n={part.cite} source={CITATION_SOURCES[part.cite - 1]} />
          {part.after}
        </span>
      );
      out.push(" ");
    } else {
      const words = part.text.split(" ");
      words.forEach((w, wi) => {
        const d = idx++ * WORD_STEP_MS;
        out.push(
          <span
            key={`${pi}-${wi}`}
            className="inline-block will-change-transform"
            style={{ animation: `word-in 320ms cubic-bezier(0.2,0.6,0.2,1) ${d}ms both` }}
          >
            {w}
          </span>
        );
        const isLast = wi === words.length - 1;
        if (!(isLast && nextIsCite)) out.push(" ");
      });
    }
  });
  return <>{out}</>;
}

/* "What is an AI agent?" answer */
const AI_AGENT_PARTS: Part[] = [
  { text: "An AI agent is software that understands a goal and takes actions to reach it — not just replying with text, but actually doing the work" },
  { cite: 1, after: "." },
  { text: "Unlike a scripted chatbot, it can reason, use your tools, and adapt. Ours can resolve support requests, pull live data, and hand off to a human when needed" },
  { cite: 2, after: "." },
];
const AgentAnswer = () => <StreamParts parts={AI_AGENT_PARTS} />;

/* "Compare plans" answer + plan cards */
const PLANS_INTRO_PARTS: Part[] = [
  { text: "Great — here's a quick look at our plans. Each one scales with your usage, so you only pay for what you actually need" },
  { cite: 3, after: "." },
  { text: "Most teams start on Growth for the full API access and priority support, then move up as volume grows. If you're still weighing an agent against a basic chatbot" },
  { cite: 1, after: "," },
  { text: "the short version is that agents take real actions and hand off cleanly to a human" },
  { cite: 2, after: "." },
  { text: "Take a look below and pick whichever fits best." },
];
const PlansIntro = () => <StreamParts parts={PLANS_INTRO_PARTS} />;

const PLANS = [
  { title: "Starter", value: "$29/mo", desc: "For small teams getting started — 1 agent, 2,000 conversations a month, and basic analytics.", highlight: false },
  { title: "Growth", value: "$79/mo", desc: "The full Tars stack — 5 agents, 15,000 conversations, full analytics, and API access.", highlight: true },
  { title: "Enterprise", value: "Custom", desc: "Everything unlimited — SSO, a dedicated SLA, and a dedicated customer success manager.", highlight: false },
];
function PlanCards({ selected, onSelect }: { selected: string | null; onSelect: (title: string) => void }) {
  return (
    <div className="scrollbar-subtle mt-3 flex w-full gap-2 overflow-x-auto px-0.5 pt-1 pb-1">
      {PLANS.map((plan) => {
        const on = selected === plan.title;
        return (
          <div
            key={plan.title}
            onClick={() => onSelect(plan.title)}
            className="flex w-[260px] shrink-0 cursor-pointer flex-col rounded-[12px] border bg-white p-2 transition-all"
            style={{
              borderColor: on ? "#632E9A" : "#E0DAD3",
              boxShadow: on ? "inset 0 0 0 1px #632E9A" : undefined,
            }}
            onMouseEnter={(e) => {
              if (!on) {
                e.currentTarget.style.borderColor = "#C5A8E0";
                e.currentTarget.style.boxShadow = "0 0 0 3px #F0E7FA";
              }
            }}
            onMouseLeave={(e) => {
              if (!on) {
                e.currentTarget.style.borderColor = "#E0DAD3";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {/* product image — placeholder */}
            <div
              className="relative flex h-[104px] w-full items-center justify-center rounded-[8px] border border-[#E0DAD3]"
              style={{
                backgroundColor: "#F4EEE3",
                backgroundImage:
                  "repeating-linear-gradient(135deg, rgba(140,131,120,0.16) 0px, rgba(140,131,120,0.16) 1.5px, transparent 1.5px, transparent 12px)",
              }}
            >
              <span className="font-mono text-[9px] tracking-wider uppercase text-[#6E6E6E]">Product image</span>
              {on && (
                <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-[#632E9A] text-white">
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
            </div>
            {/* body */}
            <div className="px-1 pt-2.5">
              <span className="block truncate text-[14px] font-semibold" style={{ color: on ? "#4A1F77" : "#333333" }}>{plan.title}</span>
              <p className="mt-1 text-[12px] leading-snug text-[#6E6E6E]">{plan.desc}</p>
              <div className="mt-2.5">
                <span className="text-[14px] font-semibold text-[#333333]">{plan.value}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── AI reasoning — collapsed chip that expands to steps + tool calls ── */
type Tool = { name: string; args: string; result: string; ms?: number };
const PLANS_REASONING = [
  { title: "Read your usage signals to gauge the right tier", body: "Checked your seat count and message volume to find the right fit." },
  { title: "Retrieved the current plan catalog and pricing", body: "Pulled the live plan tiers and prices straight from the catalog." },
  { title: "Compared Starter, Growth and Enterprise for your scale", body: "Weighed seat limits, message caps, analytics depth and per-seat cost against how your team would actually use it, then ranked the closest fit." },
];
/* Mirrors the launcher's opening trace, so the same question reasons the same
   way on both surfaces. */
const CHAT_REASONING = [
  { title: "Reading your question", body: "Working out what you're actually asking for." },
  { title: "Checking your context", body: "Cross-referencing anything relevant from earlier in this chat." },
  { title: "Tool calling", body: "Querying the knowledge base for the most relevant material." },
];
const CHAT_TOOLS: Tool[] = [
  { name: "button_group", args: '{ "intent": "get_started" }', result: '{ "options": 3 }', ms: 64 },
];

const CHAT_REPLY =
  "Happy to help. I'm the Tars agent — I can answer questions, look things up, and actually get things done for you.";
const CHAT_CHIPS = ["Schedule a demo", "See how it works", "Check Tars pricing and plans"];
/* only this branch is built out so far; the others render but stay inert */
const CHAT_LIVE_CHIPS = ["See how it works"];

const SEE_HOW_REPLY =
  "Think of a Tars agent as a teammate who already knows your business. You point it at what you already have — help docs, past tickets, product data — and it answers in your voice instead of reading from a script.\n\nIt doesn't just reply, though. It looks things up and acts: checking an order, booking a slot, raising a ticket. And when it needs something back, it asks with the right control — a form, a calendar, a set of options.\n\nThe whole conversation follows the customer across every channel, so nobody re-explains themselves — and when a person is genuinely needed, it hands over with the full history attached.";

const SEE_HOW_SOURCES: Source[] = [
  {
    name: "How Tars agents work",
    description: "Product overview — what an agent is trained on and what it can act on.",
    url: "hellotars.com/ai-agents",
  },
  {
    name: "Actions & integrations",
    description: "The systems an agent can read from and write to during a conversation.",
    url: "hellotars.com/platform/integrations",
  },
  {
    name: "Handoff to a human",
    description: "How context transfers when a conversation moves to your team.",
    url: "help.hellotars.com/handoff",
  },
  {
    name: "Channels & deployment",
    description: "Running one agent across web, WhatsApp, email and in-app.",
    url: "hellotars.com/platform/channels",
  },
];

const GALLERY_RE = /\b(image gallery|gallery|photos?|images?|screenshots?)\b/i;
const GALLERY_REPLY =
  "Here are the consultants taking appointments this week — tap one to see their full profile.";
const GALLERY: GalleryData = {
  title: "Available consultants",
  images: [
    { src: "/v1/doctors/dr-mehta.png", caption: "Dr Anil Mehta", detail: "General medicine" },
    { src: "/v1/doctors/dr-kaur.png", caption: "Dr Simran Kaur", detail: "Dermatology" },
    { src: "/v1/doctors/dr-paul.png", caption: "Dr Audrey Paul", detail: "Paediatrics" },
    { src: "/v1/doctors/dr-gilbert.png", caption: "Dr Erin Gilbert", detail: "Obstetrics" },
    { src: "/v1/doctors/dr-novak.png", caption: "Dr Luka Novak", detail: "Cardiology" },
  ],
};

const STATUS_RE = /\b(status list|status|where things stand)\b/i;
const STATUS_REPLY =
  "Here's a week in the life of a banking agent — support and sales work sitting side by side.";
const STATUS: StatusListData = {
  title: "Banking · last 7 days",
  groups: [
    {
      name: "In progress",
      tone: "active",
      items: [
        {
          title: "Loan enquiry — income and amount captured",
          meta: "Today",
          tags: ["Sales", "Qualified"],
        },
        {
          title: "Branch appointment booked in chat",
          meta: "Tomorrow",
          tags: ["Support", "Scheduled"],
        },
      ],
    },
    {
      name: "Escalated",
      tone: "urgent",
      items: [
        {
          title: "Suspected fraud passed to the fraud desk",
          meta: "2h ago",
          tags: ["Support", "Handoff"],
        },
      ],
    },
    {
      name: "Completed",
      tone: "done",
      items: [
        {
          title: "Card dispute raised and confirmed",
          meta: "Mon",
          tags: ["Support"],
          done: true,
        },
        {
          title: "412 balance & statement requests answered",
          meta: "This week",
          tags: ["Support", "Automated"],
          done: true,
        },
      ],
    },
  ],
};

const TABLE_RE = /\b(data table|table|comparison)\b/i;
const TABLE_REPLY = "Here's how the three agent types compare.";
const TABLE: TableData = {
  title: "Tars AI Agent Feature Comparison",
  columns: ["Feature", "Sales agent", "Support agent", "General AI agent"],
  rows: [
    ["24/7 availability", "Yes", "Yes", "Yes"],
    ["FAQ answering", "No", "Yes", "Yes"],
    ["Ticket creation", "No", "Yes", "Yes"],
    ["Lead qualification", "Yes", "No", "Yes"],
    ["Product recommendations", "Yes", "No", "Yes"],
  ],
};

const PRICING_RE = /\b(pricing|plans?|cost|how much)\b/i;
const PRICING_REPLY = "Here's how the plans compare — most teams start on Growth.";
const PRICING_PLANS: Plan[] = [
  {
    name: "Free",
    description: "Try an agent on your own docs — 1 agent, 100 conversations, no card needed.",
    price: "$0",
  },
  {
    name: "Starter",
    description:
      "For small teams getting started — 1 agent, 2,000 conversations a month, and basic analytics.",
    price: "$29/mo",
  },
  {
    name: "Growth",
    description:
      "The full Tars stack — 5 agents, 15,000 conversations, full analytics, and API access.",
    price: "$79/mo",
  },
  {
    name: "Scale",
    description: "For busy support desks — 15 agents, 50,000 conversations, and priority routing.",
    price: "$199/mo",
  },
  {
    name: "Business",
    description: "Multi-team setup — unlimited agents, 150,000 conversations, and audit logs.",
    price: "$399/mo",
  },
  {
    name: "Enterprise",
    description:
      "Everything unlimited — SSO, a dedicated SLA, and a dedicated customer success manager.",
    price: "Custom",
  },
  {
    name: "Education",
    description: "For schools and universities — Growth features at a reduced rate, verified.",
    price: "$19/mo",
  },
  {
    name: "Non-profit",
    description: "Registered charities get the Growth plan at cost, with onboarding included.",
    price: "$15/mo",
  },
];

const PLANS_TOOLS: Tool[] = [
  { name: "get_plans", args: '{ "catalog": "current" }', result: '{ "plans": 3, "currency": "USD" }', ms: 48 },
  { name: "knowledge_retrieval", args: '{ "query": "pricing & plans overview" }', result: '{ "documents": 8, "top": "tars.com/pricing" }', ms: 64 },
];
function ReasoningChip({ reasoning, tools }: { reasoning: { title: string; body: string }[]; tools: Tool[] }) {
  const [expanded, setExpanded] = useState(false);
  const [openTools, setOpenTools] = useState<Set<string>>(new Set());
  const toggleTool = (n: string) =>
    setOpenTools((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  return (
    <div className="ml-1 flex flex-col gap-1.5">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium transition-[filter] hover:brightness-[0.98]"
        style={{
          borderColor: expanded ? "#C5A8E0" : "#E0DAD3",
          backgroundColor: expanded ? "#F0E7FA" : "#F7F2EA",
          color: expanded ? "#4A1F77" : "#6E6E6E",
        }}
      >
        <Sparkles className="size-3 shrink-0" strokeWidth={1.75} style={{ color: "#632E9A" }} />
        Thought for {reasoning.length + 2}s · {tools.length} {tools.length === 1 ? "tool" : "tools"}
        <ChevronRight className="size-3 transition-transform" strokeWidth={2} style={{ transform: expanded ? "rotate(90deg)" : "rotate(0)" }} />
      </button>
      {expanded && (
        <div className="rounded-[12px] border border-[#E0DAD3] p-3" style={{ backgroundColor: "#FBF8F3", animation: "fade-in 200ms ease-out both" }}>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6E6E6E]">Reasoning</p>
          <div className="mt-1.5 flex flex-col">
            {reasoning.map((s, i, arr) => (
              <div key={i} className="flex gap-2">
                <div className="flex shrink-0 flex-col items-center">
                  <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: "#F0E7FA", color: "#4A1F77" }}>
                    <Check className="size-2" strokeWidth={2.5} />
                  </span>
                  {i < arr.length - 1 && <span className="my-0.5 w-px flex-1" style={{ backgroundColor: "#C5A8E0", minHeight: 10 }} />}
                </div>
                <span className="pb-1.5 text-[12px] leading-[1.5] text-[#6E6E6E]">
                  <span className="font-semibold text-[#333333]">{s.title}.</span> {s.body}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex flex-col gap-1.5">
            {tools.map((t) => {
              const isOpen = openTools.has(t.name);
              return (
                <div key={t.name} className="rounded-[8px] border border-[#E4E4E7]">
                  <button
                    onClick={() => toggleTool(t.name)}
                    className={`flex w-full items-center gap-2 bg-white px-3 py-2 text-left ${isOpen ? "rounded-t-[8px]" : "rounded-[8px]"}`}
                  >
                    <Database className="size-3.5 shrink-0" strokeWidth={1.75} style={{ color: "#632E9A" }} />
                    <code className="font-mono text-[12px] text-[#4A1F77]">{t.name}</code>
                    <span className="ml-auto text-[12px] text-[#6E6E6E]">success</span>
                    <ChevronRight className="size-3 shrink-0 text-[#6E6E6E] transition-transform" strokeWidth={2} style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0)" }} aria-hidden />
                  </button>
                  {isOpen && (
                    <div className="flex flex-col gap-1.5 rounded-b-[8px] border-t border-[#E4E4E7] bg-white px-3 py-2" style={{ animation: "fade-in 180ms ease-out both" }}>
                      <div>
                        <span className="text-[10px] text-[#A8A096]">Input</span>
                        <pre className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[12px] leading-[1.5] text-[#4A1F77]">{t.args}</pre>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#A8A096]">Output</span>
                        <pre className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[12px] leading-[1.5] text-[#4A1F77]">{t.result}</pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── live reasoning panel — checks off steps, runs tools, then calls onDone ── */
function ThinkingReasoning({ reasoning, tools, onDone, onAdvance }: { reasoning: { title: string; body: string }[]; tools: Tool[]; onDone: () => void; onAdvance?: () => void }) {
  const phrase = useThinkingPhrase();
  const total = reasoning.length;
  const [step, setStep] = useState(0);
  const [toolProg, setToolProg] = useState(0);
  const fired = useRef(false);
  // keep the latest reasoning step/tool in view as the panel grows
  useEffect(() => { onAdvance?.(); }, [step, toolProg, onAdvance]);
  useEffect(() => {
    if (step >= total) return;
    const t = setTimeout(() => setStep((s) => s + 1), 1000);
    return () => clearTimeout(t);
  }, [step, total]);
  const reasoningDone = step >= total;
  const maxProg = tools.length * 2;
  useEffect(() => {
    if (!reasoningDone) return;
    if (toolProg >= maxProg) {
      if (!fired.current) {
        fired.current = true;
        onDone();
      }
      return;
    }
    const running = toolProg % 2 === 0;
    const t = setTimeout(() => setToolProg((p) => p + 1), running ? 800 : 550);
    return () => clearTimeout(t);
  }, [reasoningDone, toolProg, maxProg, onDone]);
  const shownTools = Math.min(Math.floor(toolProg / 2), tools.length - 1);
  return (
    <div className="w-full rounded-[12px] border border-[#E0DAD3] p-3" style={{ backgroundColor: "#FBF8F3" }}>
      <div className="flex items-center gap-1.5">
        <Sparkles className="size-3.5 shrink-0 animate-[spin_2.4s_linear_infinite]" strokeWidth={1.75} style={{ color: "#632E9A" }} />
        <span className="ai-shimmer text-[12px] font-medium">{phrase}</span>
      </div>
      <p className="mt-3 text-[12px] font-semibold uppercase tracking-wider text-[#6E6E6E]">Reasoning</p>
      <div className="mt-1.5 flex flex-col">
        {reasoning.map((r, i) => {
          if (i > step) return null;
          const completed = i < step;
          const connector = i < step && i < total - 1;
          return (
            <div key={i} className="flex gap-2" style={{ animation: "fade-in 260ms ease-out both" }}>
              <div className="flex shrink-0 flex-col items-center">
                <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: completed ? "#F0E7FA" : "transparent" }}>
                  {completed ? (
                    <Check className="size-2" strokeWidth={2.5} style={{ color: "#4A1F77" }} />
                  ) : (
                    <Loader2 className="size-3 animate-spin" strokeWidth={2} style={{ color: "#632E9A" }} />
                  )}
                </span>
                {connector && <span className="my-0.5 w-px flex-1" style={{ backgroundColor: "#C5A8E0", minHeight: 10 }} />}
              </div>
              <div className="min-w-0 pb-1.5">
                <p className="text-[12px] font-semibold leading-[1.5]" style={{ color: completed ? "#333333" : "#6E6E6E" }}>{r.title}</p>
                <p className="text-[12px] italic leading-[1.5] text-[#A8A096]">{r.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      {reasoningDone && (
        <div className="mt-1 flex flex-col gap-1.5">
          {tools.map((tool, i) => {
            if (i > shownTools) return null;
            const success = toolProg > i * 2 + 1;
            return (
              <div key={i} className="flex items-center gap-2 rounded-[8px] border border-[#E4E4E7] bg-white px-3 py-2" style={{ animation: "fade-in 220ms ease-out both" }}>
                <Database className="size-3.5 shrink-0" strokeWidth={1.75} style={{ color: "#632E9A" }} />
                <code className="font-mono text-[12px] text-[#333333]">{tool.name}</code>
                <span className="ml-auto text-[12px] text-[#6E6E6E]">{success ? `${tool.ms ?? 64}ms · success` : "running…"}</span>
                <span className="size-1.5 rounded-full" style={{ backgroundColor: success ? "#22A06B" : "#632E9A" }} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── human handoff: connecting → joined, morphs in one dashed box ── */
function HandoffCard({ name, joined, timeLabel }: { name: string; joined: boolean; timeLabel: string }) {
  const EASE = "cubic-bezier(0.2,0.6,0.2,1)";
  return (
    <div className="flex w-full flex-col items-center gap-1.5 rounded-[12px] border border-dashed border-[#E0DAD3] px-4 py-3" style={{ animation: "fade-in 240ms ease-out both" }}>
      <div className="relative flex h-7 w-full items-center justify-center">
        {/* T — Tars, slides out & fades when the human joins */}
        <span
          className="absolute flex size-7 items-center justify-center rounded-full border border-[#E0DAD3] text-[11px] font-semibold text-[#333333]"
          style={{ left: "50%", transform: joined ? "translate(calc(-50% - 18px)) scale(0.6)" : "translate(calc(-50% - 9px))", opacity: joined ? 0 : 1, transition: `transform 520ms ${EASE}, opacity 360ms ease-out` }}
        >
          T
        </span>
        {/* P — human, glides from the stack to dead center */}
        <span className="absolute" style={{ left: "50%", transform: joined ? "translate(-50%)" : "translate(calc(-50% + 9px))", transition: `transform 520ms ${EASE}` }}>
          <span className="flex size-7 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ backgroundColor: "#632E9A", boxShadow: "0 0 0 2px #FFFFFF" }}>
            {name.charAt(0)}
          </span>
          <span className="absolute right-0 bottom-0 block size-1.5" aria-hidden>
            <span className="absolute -inset-0.5 rounded-full animate-ping" style={{ backgroundColor: "#16A34A", opacity: 0.8 }} />
            <span className="relative block size-1.5 rounded-full" style={{ backgroundColor: "#16A34A", boxShadow: "0 0 0 1.5px #FFFFFF" }} />
          </span>
        </span>
      </div>
      <div key={joined ? "joined" : "connecting"} className="flex flex-col items-center gap-0.5" style={{ animation: "fade-in 360ms ease-out both" }}>
        {joined ? (
          <>
            <p className="text-[12px] leading-tight text-[#333333]"><span className="font-semibold">{name}</span> joined</p>
            <p className="text-[10px] leading-tight text-[#6E6E6E]">Support specialist · {timeLabel}</p>
          </>
        ) : (
          <>
            <p className="text-[12px] leading-tight text-[#333333]">Connecting you with <span className="font-semibold">{name}</span></p>
            <p className="text-[10px] leading-tight text-[#6E6E6E]">You&apos;re #1 in queue · typically &lt;1 min</p>
          </>
        )}
      </div>
    </div>
  );
}

/* drives the handoff: connecting → joined → Priya typing → Priya message */
function HandoffFlow() {
  const [phase, setPhase] = useState<"connecting" | "joined" | "replied">("connecting");
  useEffect(() => {
    const t = setTimeout(() => setPhase("joined"), 2500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (phase !== "joined") return;
    const t = setTimeout(() => setPhase("replied"), 1800);
    return () => clearTimeout(t);
  }, [phase]);
  return (
    <div className="flex w-full flex-col items-start gap-3">
      <HandoffCard name="Priya" joined={phase !== "connecting"} timeLabel="10:24 AM" />
      {phase === "joined" && (
        <div className="flex flex-col gap-1">
          <div className="ml-1 flex items-center gap-1.5">
            <span className="flex size-4 items-center justify-center rounded-full bg-[#632E9A] text-[8px] font-semibold text-white">P</span>
            <p className="text-[11px] font-medium tracking-wide text-[#6E6E6E]">Priya <span className="text-[#A8A096]">is typing…</span></p>
          </div>
          <div className="flex w-fit items-center gap-1 rounded-[16px] rounded-bl-[4px] border border-[#E0DAD3] bg-[#F9F3EA] px-3.5 py-2.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="block size-1.5 rounded-full" style={{ backgroundColor: "#8A8378", animation: `typing-dot 1.2s ease-in-out ${i * 150}ms infinite` }} />
            ))}
          </div>
        </div>
      )}
      {phase === "replied" && (
        <div className="flex w-full flex-col gap-1">
          <div className="ml-1 flex items-center gap-1.5">
            <span className="flex size-4 items-center justify-center rounded-full bg-[#632E9A] text-[8px] font-semibold text-white">P</span>
            <p className="text-[11px] font-medium tracking-wide text-[#6E6E6E]">Priya <span className="text-[#A8A096]">· 10:24 AM</span></p>
          </div>
          <div className="w-fit max-w-full rounded-[16px] rounded-bl-[4px] border border-[#E0DAD3] bg-[#F9F3EA] p-3 text-[14px] leading-[1.7] tracking-[0.005em] text-[#333333]">
            Hi! I&apos;ve got everything Tars shared — let me check on that for you now.
          </div>
        </div>
      )}
    </div>
  );
}

/* ── date + time scheduler ── */
const SCHED_WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const SCHED_CELLS: { label: number; current: boolean }[] = [
  { label: 31, current: false },
  ...Array.from({ length: 30 }, (_, i) => ({ label: i + 1, current: true })),
  ...[1, 2, 3, 4].map((n) => ({ label: n, current: false })),
];
const SCHED_SLOTS = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "1:00 PM", "1:30 PM", "2:00 PM"];
const SCHED_AVAILABLE: Record<number, string[]> = Object.fromEntries(
  [15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29, 30].map((d) => [d, SCHED_SLOTS]),
);
const SCHED_WDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarPicker({ onSelect }: { onSelect: (text: string) => void }) {
  const [day, setDay] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const slots = day !== null ? SCHED_AVAILABLE[day] : null;
  return (
    <div className="w-[360px] max-w-full overflow-hidden rounded-[12px] border border-[#E0DAD3] bg-white">
      <div className="relative">
        <div className="border-r border-[#E0DAD3] p-3.5" style={{ width: "calc(100% - 150px)" }}>
          <div className="mb-3 flex items-center justify-between">
            <button type="button" className="flex size-6 items-center justify-center rounded-[6px] text-[#6E6E6E] transition-colors hover:bg-[#F9F3EA]"><ChevronLeft className="size-4" strokeWidth={2} /></button>
            <span className="text-[13px] font-semibold text-[#333333]">June 2026</span>
            <button type="button" className="flex size-6 items-center justify-center rounded-[6px] text-[#6E6E6E] transition-colors hover:bg-[#F9F3EA]"><ChevronRight className="size-4" strokeWidth={2} /></button>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {SCHED_WEEKDAYS.map((d, i) => (
              <span key={i} className="flex h-6 items-center justify-center text-[10px] font-medium text-[#A8A096]">{d}</span>
            ))}
            {SCHED_CELLS.map((cell, i) => {
              if (!cell.current) return <span key={`x${i}`} className="flex h-8 items-center justify-center text-[12px] text-[#D9D2C7]">{cell.label}</span>;
              const available = cell.label in SCHED_AVAILABLE;
              if (!available) return <span key={cell.label} className="flex h-8 items-center justify-center text-[12px] text-[#C4B9A8]">{cell.label}</span>;
              const selected = day === cell.label;
              return (
                <button
                  key={cell.label}
                  type="button"
                  onClick={() => { setDay(cell.label); setTime(null); }}
                  className="flex h-8 items-center justify-center rounded-[7px] text-[12px] font-medium transition-colors"
                  style={{ backgroundColor: selected ? "#632E9A" : "#F0EBE0", color: selected ? "#FFFFFF" : "#333333" }}
                >
                  {cell.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 flex w-[150px] flex-col p-3.5">
          {day === null ? (
            <>
              <span className="text-[13px] font-semibold text-[#333333]">Please select a date</span>
              <div className="flex flex-1 items-center justify-center py-8 text-center"><span className="text-[12px] text-[#6E6E6E]">No availability to show</span></div>
            </>
          ) : (
            <>
              <span className="text-[13px] font-semibold text-[#333333]">{SCHED_WDAY[day % 7]}, June {day}</span>
              <div className="scrollbar-subtle mt-2.5 flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto">
                {(slots ?? []).map((s) => {
                  const on = time === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { setTime(s); onSelect(`${SCHED_WDAY[day % 7]}, June ${day} at ${s}`); }}
                      className="rounded-[8px] border py-1.5 text-center text-[12px] font-medium transition-colors"
                      style={{ borderColor: on ? "#632E9A" : "#E0DAD3", backgroundColor: on ? "#632E9A" : "#FFFFFF", color: on ? "#FFFFFF" : "#333333" }}
                      onMouseEnter={(e) => { if (!on) { e.currentTarget.style.borderColor = "#C5A8E0"; e.currentTarget.style.backgroundColor = "#F0E7FA"; } }}
                      onMouseLeave={(e) => { if (!on) { e.currentTarget.style.borderColor = "#E0DAD3"; e.currentTarget.style.backgroundColor = "#FFFFFF"; } }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── star rating ── */
function StarRating({ onRate }: { onRate: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} stars`} onMouseEnter={() => setHover(n)} onClick={() => onRate(n)} className="transition-transform hover:scale-110">
            <Star className="size-7" strokeWidth={1.75} style={{ color: n <= hover ? "#632E9A" : "#E0DAD3", fill: n <= hover ? "#632E9A" : "transparent" }} />
          </button>
        ))}
      </div>
      <p className="ml-0.5 text-[11px] text-[#6E6E6E]">{hover ? `${hover}/5` : "Tap a star to rate"}</p>
    </div>
  );
}

/* ── geo-location share ── */
function GeoShare({ onShare }: { onShare: (loc: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onShare("San Francisco, CA")}
      className="inline-flex items-center gap-2 rounded-[10px] border border-[#E0DAD3] bg-[#F9F3EA] px-3.5 py-2.5 text-[14px] font-medium text-[#333333] transition-colors"
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F0E7FA"; e.currentTarget.style.borderColor = "#C5A8E0"; e.currentTarget.style.color = "#4A1F77"; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F9F3EA"; e.currentTarget.style.borderColor = "#E0DAD3"; e.currentTarget.style.color = "#333333"; }}
    >
      <MapPin className="size-4" strokeWidth={2} />
      Share my location
    </button>
  );
}

/* ── auto-suggestion (cities) ── */
const SUGGEST_PLACES = [
  { city: "San Francisco", region: "California, USA" },
  { city: "San Jose", region: "California, USA" },
  { city: "San Diego", region: "California, USA" },
  { city: "San Antonio", region: "Texas, USA" },
  { city: "Santa Fe", region: "New Mexico, USA" },
  { city: "Seattle", region: "Washington, USA" },
  { city: "Singapore", region: "Singapore" },
  { city: "Sydney", region: "New South Wales, Australia" },
];

/* ── CSAT — emoji rating bar (replaces the composer when resolved) ── */
const CSAT_EMOJIS = [
  { value: 1, emoji: "😞", label: "Very poor" },
  { value: 2, emoji: "😐", label: "Poor" },
  { value: 3, emoji: "🙂", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "😍", label: "Excellent" },
];
function CsatBar({ onChatAgain }: { onChatAgain: () => void }) {
  const [value, setValue] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const active = hover ?? value;
  const chosen = CSAT_EMOJIS.find((e) => e.value === value);
  const chatWithUs = (
    <p className="mt-2.5 border-t border-[#E0DAD3] pt-2.5 text-center text-[12px] text-[#6E6E6E]">
      Still have an issue? <button type="button" onClick={onChatAgain} className="font-semibold text-[#632E9A] transition-colors hover:underline">Chat with us</button>
    </p>
  );
  if (submitted) {
    return (
      <div style={{ animation: "csat-slide-up 380ms cubic-bezier(0.2,0.6,0.2,1) both" }}>
        <div className="flex flex-col items-center gap-2 py-3" style={{ animation: "fade-in 260ms ease-out both" }}>
          <span className="relative flex size-12 items-center justify-center rounded-full text-[28px]" style={{ backgroundColor: "#F0E7FA" }}>
            {chosen?.emoji}
            <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border-2" style={{ backgroundColor: "#16A34A", borderColor: "#FEFCF8" }}>
              <Check className="size-3 text-white" strokeWidth={3} />
            </span>
          </span>
          <div className="flex flex-col items-center gap-0.5">
            <p className="text-[13px] font-semibold text-[#333333]">Thanks for your feedback!</p>
            <p className="text-[11px] text-[#6E6E6E]">Your response helps us improve.</p>
          </div>
        </div>
        {chatWithUs}
      </div>
    );
  }
  return (
    <div style={{ animation: "csat-slide-up 380ms cubic-bezier(0.2,0.6,0.2,1) both" }}>
      <p className="text-center text-[13px] font-semibold text-[#333333]">How was your conversation experience with us?</p>
      <div className="mt-2 flex items-start justify-center gap-1" onMouseLeave={() => setHover(null)}>
        {CSAT_EMOJIS.map((e) => (
          <button key={e.value} type="button" aria-label={e.label} onMouseEnter={() => setHover(e.value)} onClick={() => setValue(e.value)} className="flex flex-col items-center gap-0.5">
            <span className="flex size-12 items-center justify-center rounded-full transition-colors" style={{ backgroundColor: active === e.value ? "#F0E7FA" : "transparent" }}>
              <span className="text-[30px] transition-all duration-200" style={{ filter: active === e.value ? "none" : "grayscale(1)", transform: active === e.value ? "scale(1.1)" : "none" }}>{e.emoji}</span>
            </span>
            <span className="whitespace-nowrap text-[10px] font-medium leading-tight transition-opacity" style={{ color: "#4A1F77", opacity: active === e.value ? 1 : 0 }}>{e.label}</span>
          </button>
        ))}
      </div>
      {value === null ? (
        chatWithUs
      ) : (
        <div className="mt-1 flex flex-col gap-2" style={{ animation: "fade-in 200ms ease-out both" }}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Let us know how we can improve…"
            autoFocus
            className="scrollbar-subtle w-full resize-none rounded-[10px] border border-[#E0DAD3] bg-white px-3 py-2 text-[13px] leading-snug text-[#333333] outline-none transition-colors placeholder:text-[#979797] focus:border-[#632E9A]"
            style={{ maxHeight: 110 }}
          />
          <button type="button" onClick={() => setSubmitted(true)} className="w-full rounded-full py-2.5 text-[13px] font-semibold text-white transition-[filter] hover:brightness-105" style={{ backgroundColor: "#632E9A" }}>Submit Feedback</button>
          <button type="button" onClick={() => setSubmitted(true)} className="text-center text-[12px] font-medium text-[#6E6E6E] transition-colors hover:underline">Cancel</button>
        </div>
      )}
    </div>
  );
}

/* ── conversation history (sidebar) ── */
const HISTORY = [
  { group: "Today", items: ["Studio plan pricing", "Reset my password"] },
  { group: "Yesterday", items: ["Export invoices to CSV", "Add a teammate", "API rate limits"] },
  { group: "Previous 7 days", items: ["Cancel subscription", "Webhook setup help"] },
];

type Msg =
  | { from: "ai"; text: string; chips?: string[]; liveChips?: string[]; /** the option taken — the group stays put, greyed, with this one still filled */ chipsSpent?: string; /** grounding shown under the message */ sources?: Source[]; /** plan cards under the message */ plans?: Plan[]; /** comparison table under the message */ table?: TableData; /** grouped status under the message */ status?: StatusListData; /** photo grid under the message */ gallery?: GalleryData; stream?: boolean; kind?: "agent" | "plans" | "chat" | "pricing" | "table" | "status" | "gallery" | "handoff" | "calendar" | "rating" | "geo" }
  | { from: "user"; text: string; icon?: "calendar" | "location"; stars?: number; check?: boolean };

// chips that lead to a scripted response — others are shown but disabled
const LIVE_CHIPS = new Set(["See how it works", "Chat with us", "How do AI agents work", "What is an AI agent?", "Compare plans", "Product demo", "Pick a time", "Pick a city", "Share location", "Rate us", "Talk to an agent", "Sounds good"]);

// composer demo data — voice transcript + waveform shape
const DEMO_TRANSCRIPT = "Can you tell me more about the Studio plan?";
const WAVEFORM_HEIGHTS = Array.from({ length: 60 }, (_, i) => {
  const seed = Math.sin(i * 0.45) * 0.35 + Math.sin(i * 1.7 + 1.2) * 0.45 + 0.55;
  return Math.max(0.18, Math.min(1, seed));
});

const GREETING: Extract<Msg, { from: "ai" }> = {
  from: "ai",
  text: "Curious about AI Agents? I can show you what Tars would handle for your sales and support.",
  chips: ["Schedule a demo", "Chat with us", "How do AI agents work"],
  /* per-message allowlist wins over LIVE_CHIPS, so live options are named here */
  liveChips: ["Chat with us", "How do AI agents work"],
};

export default function WebChat() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, setPending] = useState<"simple" | "plans" | "chat" | "pricing" | "table" | "status" | "gallery" | null>("simple");
  const [reactions, setReactions] = useState<Record<number, "like" | "dislike">>({});
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  /** The plan taken from the pricing cards — locks the group once chosen. */
  const [pricingPick, setPricingPick] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [closed, setClosed] = useState(false);

  // a widget produced a result → remove the widget, post the result as a user message, then an agent ack
  function pushResult(userMsg: Msg, ack: string) {
    setSuggestOpen(false);
    setMessages((m) => [
      ...m.filter((msg) => !(msg.from === "ai" && (msg.kind === "calendar" || msg.kind === "rating" || msg.kind === "geo"))),
      userMsg,
    ]);
    setPending("simple");
    setTimeout(() => {
      setPending(null);
      setMessages((m) => [...m, { from: "ai", text: ack, stream: true }]);
    }, 800);
  }
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const transcribeTimer = useRef<number | null>(null);

  const handleMicClick = () => {
    setDraft("");
    setRecording(true);
  };
  const handleStopRecording = () => {
    setRecording(false);
    setTranscribing(true);
    transcribeTimer.current = window.setTimeout(() => {
      setDraft(DEMO_TRANSCRIPT);
      setTranscribing(false);
    }, 1400);
  };
  const handleCancelRecording = () => {
    setRecording(false);
    setTranscribing(false);
    if (transcribeTimer.current) window.clearTimeout(transcribeTimer.current);
  };
  // composer reflows to multi-line as the text grows (like the main app)
  const composerMultiline = useMemo(() => {
    if (!draft) return false;
    const total = draft.split("\n").reduce((a, l) => a + Math.max(1, Math.ceil(l.length / 60)), 0);
    return total > 1;
  }, [draft]);

  function react(i: number, kind: "like" | "dislike") {
    setReactions((r) => ({ ...r, [i]: r[i] === kind ? (undefined as never) : kind }));
  }
  function copy(i: number, text: string) {
    navigator.clipboard?.writeText(text);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx((c) => (c === i ? null : c)), 1500);
  }

  // greeting plays in (thinking → word-by-word) on load and on New chat
  function startConversation() {
    setMessages([]);
    setReactions({});
    setCopiedIdx(null);
    setSpeakingIdx(null);
    setClosed(false);
    setSuggestOpen(false);
    setPending("simple");
    setTimeout(() => {
      setPending(null);
      setMessages([{ ...GREETING, stream: true }]);
    }, 1200);
  }
  useEffect(() => {
    const t = setTimeout(() => {
      setPending(null);
      setMessages([{ ...GREETING, stream: true }]);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  // close header menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);
  useEffect(() => {
    scrollToBottom();
    // re-scroll after late-rendering content (widgets, streamed text, CSAT)
    const t = setTimeout(scrollToBottom, 140);
    return () => clearTimeout(t);
  }, [messages, pending, closed, suggestOpen, scrollToBottom]);

  // auto-grow composer
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.max(36, Math.min(ta.scrollHeight, 140)) + "px";
  }, [draft]);

  function send(text: string) {
    const t = text.trim();
    if (!t && attachments.length === 0) return;
    const userText = t || "📎 Attachment";
    /* Options stay where they were offered — marking them spent greys the
       group and keeps the taken one filled, rather than making the choice
       vanish from the transcript. */
    setMessages((m) => [
      ...m.map((msg) =>
        msg.from === "ai" && msg.chips && !msg.chipsSpent
          ? { ...msg, chipsSpent: userText }
          : msg,
      ),
      { from: "user", text: userText },
    ]);
    setDraft("");
    setAttachments([]);
    // a photo grid — reason, then return the gallery
    if (GALLERY_RE.test(t)) {
      setPending("gallery");
      return;
    }
    // grouped status — reason, then return the list
    if (STATUS_RE.test(t)) {
      setPending("status");
      return;
    }
    // a comparison is a worked answer too — reason, then return the table
    if (TABLE_RE.test(t)) {
      setPending("table");
      return;
    }
    /* Pricing is a worked answer: it reasons, then returns cards rather than
       prose. Matched on intent, so "how much does it cost" lands here too. */
    if (PRICING_RE.test(t) && t !== "Compare plans") {
      setPending("pricing");
      return;
    }
    // "See how it works" — a plain answer, but grounded, so it carries sources
    if (t === "See how it works") {
      setPending("simple");
      setTimeout(() => {
        setPending(null);
        setMessages((m) => [
          ...m,
          { from: "ai", text: SEE_HOW_REPLY, sources: SEE_HOW_SOURCES, stream: true },
        ]);
      }, 1500);
      return;
    }
    // "Chat with us" reasons, then answers with its own options
    if (t === "Chat with us") {
      setPending("chat");
      return;
    }
    // "Compare plans" plays the live reasoning panel, which pushes the message when done
    if (t === "Compare plans") {
      setPending("plans");
      return;
    }
    // "Talk to an agent" → human handoff (connecting → joined → Priya replies)
    if (t === "Talk to an agent") {
      setMessages((m) => [...m, { from: "ai", kind: "handoff", text: "" }]);
      return;
    }
    // product demo → offer the input-type options
    if (t === "Product demo") {
      setPending("simple");
      setTimeout(() => {
        setPending(null);
        setMessages((m) => [...m, { from: "ai", text: "Sure — what would you like to do?", chips: ["Pick a time", "Pick a city", "Share location", "Rate us", "Talk to an agent"], stream: true }]);
      }, 900);
      return;
    }
    if (t === "Pick a time") { setMessages((m) => [...m, { from: "ai", kind: "calendar", text: "" }]); return; }
    if (t === "Share location") { setMessages((m) => [...m, { from: "ai", kind: "geo", text: "" }]); return; }
    if (t === "Rate us") { setMessages((m) => [...m, { from: "ai", kind: "rating", text: "" }]); return; }
    if (t === "Pick a city") { setSuggestOpen(true); return; }
    if (t === "Sounds good") { setClosed(true); return; }
    // picking a plan card → offer to email the setup link
    if (PLANS.some((p) => p.title === t)) {
      setPending("simple");
      setTimeout(() => {
        setPending(null);
        setMessages((m) => [
          ...m,
          {
            from: "ai",
            text: "Great pick! Want me to email you the setup link?",
            chips: ["Email me the link", "Talk to an agent"],
            liveChips: ["Talk to an agent"],
            stream: true,
          },
        ]);
      }, 1200);
      return;
    }
    // everything else: think, then stream the reply word-by-word
    setPending("simple");
    setTimeout(() => {
      setPending(null);
      if (t === "How do AI agents work" || t === "What is an AI agent?") {
        setMessages((m) => [
          ...m,
          {
            from: "ai",
            kind: "agent",
            text: "",
            chips: ["See a demo", "Compare plans", "What can it do?"],
          },
        ]);
      } else {
        setMessages((m) => [
          ...m,
          {
            from: "ai",
            text: "Got it — let me pull that up for you. Based on your account and the latest plan details, here's what I found.",
            chips: ["Sounds good", "Something else"],
            stream: true,
          },
        ]);
      }
    }, 1500);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FEFCF8] font-sans text-[var(--ds-text-ink)]">
      {/* ───────────────── Sidebar ───────────────── */}
      {sidebarOpen && (
        <aside className="flex w-[264px] shrink-0 flex-col border-r border-[var(--ds-border-line)] bg-[#FEFCF8]">
          {/* brand + collapse */}
          <div className="flex items-center justify-between px-3 py-3">
            <div className="flex items-center gap-2 pl-1">
              <span className="text-[15px] font-semibold tracking-tight">Conversations</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex size-8 items-center justify-center rounded-[8px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="size-[18px]" strokeWidth={1.75} />
            </button>
          </div>

          {/* new chat + search */}
          <div className="flex flex-col gap-1.5 px-3 pb-2">
            <button
              onClick={startConversation}
              className="flex items-center gap-2 rounded-[10px] border border-[var(--ds-border-line)] bg-[var(--ds-bg-paper)] px-3 py-2 text-[14px] font-medium text-[var(--ds-text-ink)] transition-colors hover:bg-[var(--ds-bg-subtle)]"
            >
              <Plus className="size-4" strokeWidth={2} />
              New chat
            </button>
            <button className="flex items-center gap-2 rounded-[10px] border border-[var(--ds-border-line)] px-3 py-2 text-[14px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]">
              <Search className="size-4" strokeWidth={1.75} />
              Search chats
            </button>
          </div>

          {/* history */}
          <div className="scrollbar-subtle flex-1 overflow-y-auto px-3 py-2">
            {HISTORY.map((g) => (
              <div key={g.group} className="mb-3">
                <p className="px-2 pb-1 text-[11px] font-medium tracking-wide text-[var(--ds-text-muted)] uppercase">
                  {g.group}
                </p>
                {g.items.map((title, i) => {
                  const active = g.group === "Today" && i === 0;
                  return (
                    <button
                      key={title}
                      className={`group flex w-full items-center justify-between gap-2 rounded-[8px] px-2 py-1.5 text-left text-[13px] transition-colors ${
                        active
                          ? "bg-[var(--ds-bg-paper)] text-[var(--ds-text-ink)]"
                          : "text-[var(--ds-text-secondary)] hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
                      }`}
                    >
                      <span className="truncate">{title}</span>
                      <MoreHorizontal className="size-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" strokeWidth={1.75} />
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* ───────────────── Main ───────────────── */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="relative flex h-16 shrink-0 items-center border-b border-[var(--ds-border-line)] px-4">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="absolute left-4 flex size-8 items-center justify-center rounded-[8px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
              aria-label="Open sidebar"
            >
              <PanelLeft className="size-[18px]" strokeWidth={1.75} />
            </button>
          )}
          <div className="mx-auto flex w-full max-w-[800px] items-center justify-between gap-3 px-6">
          <div className="flex items-center gap-2.5">
            <img src="/tars-logomark.png" alt="" className="size-9 rounded-[10px] object-cover" />
            <div className="flex flex-col leading-tight">
              <span className="text-[16px] font-semibold tracking-tight">TARS</span>
              <span className="mt-0.5 text-[12px] text-[var(--ds-text-secondary)]">Virtual Assistant</span>
            </div>
          </div>
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="More options"
              aria-expanded={menuOpen}
              className={`flex size-8 items-center justify-center rounded-[8px] transition-colors ${
                menuOpen
                  ? "bg-[var(--ds-bg-subtle)] text-[var(--ds-text-ink)]"
                  : "text-[var(--ds-text-secondary)] hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
              }`}
            >
              <MoreVertical className="size-[18px]" strokeWidth={1.75} />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+6px)] z-30 w-52 overflow-hidden rounded-[10px] border border-[var(--ds-border-line)] bg-[#FEFCF8] p-1 shadow-[var(--ds-shadow-md)]"
              >
                <button
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-2 text-left text-[13px] text-[var(--ds-text-ink)] transition-colors hover:bg-[var(--ds-bg-subtle)]"
                >
                  <Download className="size-4 text-[var(--ds-text-secondary)]" strokeWidth={1.75} />
                  Download transcript
                </button>
              </div>
            )}
          </div>
          </div>
        </header>

        {/* conversation */}
        <div ref={scrollRef} className="scrollbar-subtle flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-[800px] flex-col gap-3 px-6 py-8">
            {messages.map((m, i) =>
              m.from === "ai" && m.kind === "handoff" ? (
                <div key={i} className="w-full">
                  <HandoffFlow />
                </div>
              ) : m.from === "ai" && (m.kind === "calendar" || m.kind === "rating" || m.kind === "geo") ? (
                <div key={i} className="flex flex-col items-start">
                  <p className="mb-1 ml-1 text-[11px] font-medium tracking-wide text-[#6E6E6E]">
                    AI Agent <span className="text-[#A8A096]">• 10:24 AM</span>
                  </p>
                  <div className="ml-1">
                    {m.kind === "calendar" && (
                      <CalendarPicker onSelect={(text) => pushResult({ from: "user", text, icon: "calendar" }, `Booked! Your demo is set for ${text} — I've sent a calendar invite.`)} />
                    )}
                    {m.kind === "rating" && (
                      <StarRating onRate={(n) => pushResult({ from: "user", text: `${n}/5`, stars: n }, `Thank you for the ${n}/5 — we really appreciate the feedback!`)} />
                    )}
                    {m.kind === "geo" && (
                      <GeoShare onShare={(loc) => pushResult({ from: "user", text: loc, icon: "location", check: true }, `Got it — I'll show what's available near ${loc}.`)} />
                    )}
                  </div>
                </div>
              ) : m.from === "ai" ? (
                <div key={i} className="group flex flex-col items-start">
                  <p className="mb-1 ml-1 text-[11px] font-medium tracking-wide text-[#6E6E6E]">
                    AI Agent <span className="text-[#A8A096]">• 10:24 AM</span>
                  </p>
                  {(m.kind === "plans" || m.kind === "chat" || m.kind === "pricing" || m.kind === "table" || m.kind === "status" || m.kind === "gallery") && (
                    <div className="mb-1.5">
                      <ReasoningChip
                        reasoning={m.kind === "plans" ? PLANS_REASONING : CHAT_REASONING}
                        tools={m.kind === "plans" ? PLANS_TOOLS : CHAT_TOOLS}
                      />
                    </div>
                  )}
                  <div className="w-fit max-w-full rounded-[16px] rounded-bl-[4px] border border-[#E0DAD3] bg-[#F9F3EA] p-3 text-[14px] leading-[1.7] tracking-[0.005em] whitespace-pre-line text-[#333333]">
                    {m.kind === "plans" ? <PlansIntro /> : m.kind === "agent" ? <AgentAnswer /> : m.stream ? <Words text={m.text} /> : m.text}
                    {m.sources && (
                      <div className="mt-3 border-t border-[var(--ds-border-line-soft)] pt-2.5">
                        <Sources sources={m.sources} />
                      </div>
                    )}
                  </div>
                  {m.gallery && (
                    <div className="mt-2 w-full">
                      <ImageGallery data={m.gallery} />
                    </div>
                  )}
                  {m.status && (
                    <div className="mt-2 w-full">
                      <StatusList data={m.status} />
                    </div>
                  )}
                  {m.table && (
                    <div className="mt-2 w-full">
                      <DataTable data={m.table} />
                    </div>
                  )}
                  {m.plans && (
                    <div className="mt-2 w-full">
                      <PricingCards
                        plans={m.plans}
                        onPick={(p) => {
                          setPricingPick(p.name);
                          send(p.name);
                        }}
                        spent={!!pricingPick}
                        chosen={pricingPick}
                      />
                    </div>
                  )}
                  {m.kind === "plans" && (
                    <>
                      <PlanCards
                        selected={selectedPlan}
                        onSelect={(title) => {
                          setSelectedPlan(title);
                          send(title);
                        }}
                      />
                      <div className="mt-2 w-fit max-w-full rounded-[16px] rounded-bl-[4px] border border-[#E0DAD3] bg-[#F9F3EA] p-3 text-[14px] leading-[1.7] tracking-[0.005em] text-[#333333]">
                        What scale are you working at?
                      </div>
                    </>
                  )}
                  {m.chips && (
                    <div className="mt-3 flex flex-wrap gap-2 px-1">
                      {m.chips.map((c) => {
                        const spent = !!m.chipsSpent;
                        const chosen = m.chipsSpent === c;
                        return (
                          <button
                            key={c}
                            disabled={spent}
                            onClick={() => {
                              const live = m.liveChips
                                ? m.liveChips.includes(c)
                                : LIVE_CHIPS.has(c);
                              if (live) send(c);
                            }}
                            /* Outlined in the accent rather than filled: on a
                               thread of paper-filled bubbles a filled chip reads
                               as another message. Matches the launcher. */
                            className="rounded-full border border-[#C5A8E0] px-3.5 py-1.5 text-[14px] text-[#4A1F77] transition-colors disabled:cursor-not-allowed"
                            /* hover is set here, not via a `hover:` class — the
                               inline backgroundColor below would always win */
                            onMouseEnter={(e) => {
                              if (!spent) e.currentTarget.style.backgroundColor = "#F0E7FA";
                            }}
                            onMouseLeave={(e) => {
                              if (!spent) e.currentTarget.style.backgroundColor = "transparent";
                            }}
                            style={{
                              backgroundColor: chosen ? "#F0E7FA" : "transparent",
                              opacity: spent ? 0.5 : 1,
                            }}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {/* message toolbar — reveals on hover, like the main app */}
                  <div className="mt-2.5 flex items-center gap-2 px-1 text-[#6E6E6E] opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => setSpeakingIdx((s) => (s === i ? null : i))}
                      aria-label="Read aloud"
                      className="flex items-center justify-center rounded-[5px] p-1 transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
                      style={{ color: speakingIdx === i ? "#632E9A" : undefined, backgroundColor: speakingIdx === i ? "#F0EBE0" : undefined }}
                    >
                      <Volume2 className="size-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => react(i, "like")}
                      aria-label="Good response"
                      className="flex items-center justify-center rounded-[5px] p-1 transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
                      style={{ color: reactions[i] === "like" ? "#632E9A" : undefined }}
                    >
                      <ThumbsUp className="size-3.5" strokeWidth={reactions[i] === "like" ? 2 : 1.75} fill={reactions[i] === "like" ? "#F0E7FA" : "none"} />
                    </button>
                    <button
                      onClick={() => react(i, "dislike")}
                      aria-label="Bad response"
                      className="flex items-center justify-center rounded-[5px] p-1 transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
                      style={{ color: reactions[i] === "dislike" ? "#632E9A" : undefined }}
                    >
                      <ThumbsDown className="size-3.5" strokeWidth={reactions[i] === "dislike" ? 2 : 1.75} fill={reactions[i] === "dislike" ? "#F0E7FA" : "none"} />
                    </button>
                    <button
                      onClick={() => copy(i, m.text)}
                      aria-label={copiedIdx === i ? "Copied" : "Copy"}
                      className="flex items-center justify-center rounded-[5px] p-1 transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]"
                      style={{ color: copiedIdx === i ? "#632E9A" : undefined }}
                    >
                      {copiedIdx === i ? <Check className="size-3.5" strokeWidth={2.5} /> : <Copy className="size-3.5" strokeWidth={1.75} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex justify-end">
                  <div
                    className="flex w-fit max-w-[80%] items-center gap-1.5 rounded-[12px] rounded-br-[4px] px-4 py-2.5 text-[14px] leading-[1.7] tracking-[0.005em] text-[#4A1F77]"
                    style={{ backgroundColor: "#F0E7FA", boxShadow: "inset 0 0 0 1px #C5A8E0" }}
                  >
                    {m.stars ? (
                      <span className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className="size-3.5" strokeWidth={1.75} style={{ color: "#4A1F77", fill: n <= (m.stars ?? 0) ? "#4A1F77" : "transparent" }} />
                        ))}
                      </span>
                    ) : (
                      m.icon === "calendar" ? <Calendar className="size-3.5 shrink-0" strokeWidth={2} /> : m.icon === "location" ? <MapPin className="size-3.5 shrink-0" strokeWidth={2} /> : null
                    )}
                    <span>{m.text}</span>
                    {m.check && <Check className="size-3.5 shrink-0" strokeWidth={2.5} style={{ color: "#16A34A" }} />}
                  </div>
                </div>
              )
            )}
            {/* pending state — live reasoning panel for plans, simple indicator otherwise */}
            {pending === "plans" ? (
              <div className="flex w-full flex-col items-start">
                <p className="mb-1 ml-1 text-[11px] font-medium tracking-wide text-[#6E6E6E]">
                  AI Agent <span className="text-[#A8A096]">• 10:24 AM</span>
                </p>
                <ThinkingReasoning
                  reasoning={PLANS_REASONING}
                  tools={PLANS_TOOLS}
                  onAdvance={scrollToBottom}
                  onDone={() => {
                    setPending(null);
                    setMessages((m) => [...m, { from: "ai", kind: "plans", text: "" }]);
                  }}
                />
              </div>
            ) : pending === "gallery" ? (
              <div className="flex w-full flex-col items-start">
                <p className="mb-1 ml-1 text-[11px] font-medium tracking-wide text-[#6E6E6E]">
                  AI Agent <span className="text-[#A8A096]">• 10:24 AM</span>
                </p>
                <ThinkingReasoning
                  reasoning={CHAT_REASONING}
                  tools={CHAT_TOOLS}
                  onAdvance={scrollToBottom}
                  onDone={() => {
                    setPending(null);
                    setMessages((m) => [
                      ...m,
                      {
                        from: "ai",
                        kind: "gallery",
                        text: GALLERY_REPLY,
                        gallery: GALLERY,
                        stream: true,
                      },
                    ]);
                  }}
                />
              </div>
            ) : pending === "status" ? (
              <div className="flex w-full flex-col items-start">
                <p className="mb-1 ml-1 text-[11px] font-medium tracking-wide text-[#6E6E6E]">
                  AI Agent <span className="text-[#A8A096]">• 10:24 AM</span>
                </p>
                <ThinkingReasoning
                  reasoning={CHAT_REASONING}
                  tools={CHAT_TOOLS}
                  onAdvance={scrollToBottom}
                  onDone={() => {
                    setPending(null);
                    setMessages((m) => [
                      ...m,
                      {
                        from: "ai",
                        kind: "status",
                        text: STATUS_REPLY,
                        status: STATUS,
                        stream: true,
                      },
                    ]);
                  }}
                />
              </div>
            ) : pending === "table" ? (
              <div className="flex w-full flex-col items-start">
                <p className="mb-1 ml-1 text-[11px] font-medium tracking-wide text-[#6E6E6E]">
                  AI Agent <span className="text-[#A8A096]">• 10:24 AM</span>
                </p>
                <ThinkingReasoning
                  reasoning={CHAT_REASONING}
                  tools={CHAT_TOOLS}
                  onAdvance={scrollToBottom}
                  onDone={() => {
                    setPending(null);
                    setMessages((m) => [
                      ...m,
                      {
                        from: "ai",
                        kind: "table",
                        text: TABLE_REPLY,
                        table: TABLE,
                        stream: true,
                      },
                    ]);
                  }}
                />
              </div>
            ) : pending === "pricing" ? (
              <div className="flex w-full flex-col items-start">
                <p className="mb-1 ml-1 text-[11px] font-medium tracking-wide text-[#6E6E6E]">
                  AI Agent <span className="text-[#A8A096]">• 10:24 AM</span>
                </p>
                <ThinkingReasoning
                  reasoning={CHAT_REASONING}
                  tools={CHAT_TOOLS}
                  onAdvance={scrollToBottom}
                  onDone={() => {
                    setPending(null);
                    setMessages((m) => [
                      ...m,
                      {
                        from: "ai",
                        kind: "pricing",
                        text: PRICING_REPLY,
                        plans: PRICING_PLANS,
                        stream: true,
                      },
                    ]);
                  }}
                />
              </div>
            ) : pending === "chat" ? (
              <div className="flex w-full flex-col items-start">
                <p className="mb-1 ml-1 text-[11px] font-medium tracking-wide text-[#6E6E6E]">
                  AI Agent <span className="text-[#A8A096]">• 10:24 AM</span>
                </p>
                <ThinkingReasoning
                  reasoning={CHAT_REASONING}
                  tools={CHAT_TOOLS}
                  onAdvance={scrollToBottom}
                  onDone={() => {
                    setPending(null);
                    setMessages((m) => [
                      ...m,
                      {
                        from: "ai",
                        kind: "chat",
                        text: CHAT_REPLY,
                        chips: CHAT_CHIPS,
                        liveChips: CHAT_LIVE_CHIPS,
                        stream: true,
                      },
                    ]);
                  }}
                />
              </div>
            ) : pending === "simple" ? (
              <div className="flex flex-col items-start">
                <AiThinking />
              </div>
            ) : null}
            {closed && (
              <div className="flex justify-center py-1" style={{ animation: "fade-in 240ms ease-out both" }}>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6E6E6E]">
                  <Check className="size-3.5" strokeWidth={2.75} style={{ color: "#16A34A" }} />
                  This conversation has been closed
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CSAT replaces the composer once the conversation is closed */}
        {closed ? (
          <div className="shrink-0 px-6 pb-4">
            <div className="mx-auto max-w-[800px] border-t border-[var(--ds-border-line)] pt-3">
              <div className="mx-auto max-w-[460px]">
                <CsatBar onChatAgain={() => setClosed(false)} />
              </div>
            </div>
          </div>
        ) : (
        <div className="shrink-0">
          <div className="mx-auto flex w-full max-w-[762px] flex-col">
            {/* city suggestions — pops up above the composer */}
            {suggestOpen && (() => {
              const sq = draft.trim().toLowerCase();
              const sres = sq ? SUGGEST_PLACES.filter((p) => p.city.toLowerCase().includes(sq) || p.region.toLowerCase().includes(sq)) : SUGGEST_PLACES;
              return (
                <div className="mb-2 overflow-hidden rounded-[12px] border border-[#E0DAD3] bg-white" style={{ boxShadow: "0 4px 14px -3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.04)" }}>
                  <div className="scrollbar-subtle max-h-[200px] overflow-y-auto">
                    {sres.length > 0 ? (
                      sres.map((p, i) => (
                        <button
                          key={p.city}
                          type="button"
                          onClick={() => { setDraft(""); pushResult({ from: "user", text: `${p.city}, ${p.region}`, icon: "location" }, `Got it — I'll show options near ${p.city}.`); }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors"
                          style={{ borderTop: i === 0 ? "none" : "1px solid #E0DAD3" }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F0E7FA")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <MapPin className="size-4 shrink-0" strokeWidth={2} style={{ color: "#6E6E6E" }} />
                          <span className="min-w-0">
                            <span className="block truncate text-[13px] text-[#333333]">{p.city}</span>
                            <span className="block truncate text-[11px] text-[#6E6E6E]">{p.region}</span>
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center text-[12px] text-[#6E6E6E]">No matches</div>
                    )}
                  </div>
                </div>
              );
            })()}
            {/* press-enter hint */}
            {draft.trim() && (
              <div className="mb-1.5 flex items-center justify-center gap-1 px-1 text-[10px] leading-4 text-[#A8A096]">
                Press
                <kbd className="inline-flex h-4 min-w-4 items-center justify-center rounded-[3px] border border-[#C5A8E0] bg-white px-1 font-sans text-[10px] leading-none text-[var(--ds-text-muted)]">
                  ↵
                </kbd>
                to send
              </div>
            )}
            <div className="flex w-full flex-col gap-2 rounded-[16px] border border-[var(--ds-border-line)] bg-[var(--ds-bg-paper)] px-3 py-2 transition-all duration-200 hover:border-[var(--ds-border-hover)] focus-within:!border-[#632E9A] focus-within:!ring-4 focus-within:!ring-[#632E9A]/15">
              {/* staged files — tray above the input row */}
              {attachments.length > 0 && !recording && (
                <div className="flex flex-wrap gap-2 px-1 pt-1" style={{ animation: "fade-in 180ms ease-out both" }}>
                  {attachments.includes("image") && (
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-[8px] border border-[var(--ds-border-line)]">
                      <div className="flex size-full items-center justify-center bg-white">
                        <ImageIcon className="size-5 text-[var(--ds-text-secondary)]" strokeWidth={1.75} />
                      </div>
                      <button
                        aria-label="Remove image"
                        onClick={() => setAttachments((a) => a.filter((x) => x !== "image"))}
                        className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-black/55 text-white"
                      >
                        <X className="size-2.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                  {attachments.includes("pdf") && (
                    <div className="relative flex items-center gap-2 rounded-[8px] border border-[var(--ds-border-line)] bg-white py-2 pr-7 pl-2">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-[6px] bg-[#2563EB] text-white">
                        <FileText className="size-4" strokeWidth={1.75} />
                      </span>
                      <span className="flex flex-col">
                        <span className="max-w-[120px] truncate text-[12px] font-medium text-[#333333]">Q3-report.pdf</span>
                        <span className="text-[10px] text-[#6E6E6E]">240 KB</span>
                      </span>
                      <button
                        aria-label="Remove file"
                        onClick={() => setAttachments((a) => a.filter((x) => x !== "pdf"))}
                        className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full text-[#6E6E6E]"
                      >
                        <X className="size-3" strokeWidth={2} />
                      </button>
                    </div>
                  )}
                </div>
              )}
              {/* input row */}
              {/* single-line: everything on one centre line. multiline keeps
                  items-end so the controls stay level with the last line. */}
              <div className={`flex w-full ${composerMultiline ? "flex-wrap items-end gap-x-1.5 gap-y-1" : "items-center gap-2"}`}>
                {/* left — attach, becomes cancel (X) while recording */}
                <button
                  aria-label={recording ? "Cancel recording" : "Add attachment"}
                  onClick={recording ? handleCancelRecording : () => setAttachments((a) => (a.length ? [] : ["image", "pdf"]))}
                  disabled={transcribing}
                  className={`flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)] active:bg-[var(--ds-bg-subtle)] disabled:opacity-40 ${composerMultiline ? "order-2 mr-auto" : ""}`}
                >
                  {recording ? <X className="size-4" strokeWidth={2} /> : <Plus className="size-4" strokeWidth={1.5} />}
                </button>
                {/* middle — waveform while recording, otherwise the text field */}
                {recording ? (
                  <div className="flex min-w-0 flex-1 items-center justify-center gap-[3px] overflow-hidden px-1 py-[5px]" style={{ minHeight: 28 }} aria-hidden>
                    {WAVEFORM_HEIGHTS.map((h, i) => (
                      <span key={i} className="block w-0.5 origin-center rounded-full" style={{ height: `${Math.round(h * 18)}px`, backgroundColor: "#632E9A", animation: `wave-bar 1.6s ease-in-out ${i * 45}ms infinite` }} />
                    ))}
                  </div>
                ) : (
                  <textarea
                    ref={taRef}
                    value={draft}
                    disabled={transcribing}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(draft);
                      }
                    }}
                    rows={1}
                    placeholder={transcribing ? "Transcribing…" : "Ask me anything..."}
                    /* py-[7.5px] centres the 21px line inside the 36px floor —
                       textarea text is top-aligned, so without it the caret
                       sits high in the taller field */
                    className={`block min-w-0 resize-none bg-transparent text-[14px] leading-[1.5] text-[#333] outline-none placeholder:text-[#555] ${composerMultiline ? "order-1 w-full basis-full px-2 pt-3 pb-1.5" : "flex-1 py-[7.5px]"}`}
                    style={{ minHeight: 36, maxHeight: 140, overflowY: "auto", boxSizing: "border-box" }}
                  />
                )}
                {/* right — stop / spinner while busy, otherwise mic + send */}
                {recording ? (
                  <button
                    aria-label="Stop recording"
                    onClick={handleStopRecording}
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-[#632E9A] text-white transition-colors hover:bg-[#542584] active:scale-95 ${composerMultiline ? "order-3" : ""}`}
                  >
                    <Square className="size-3" strokeWidth={0} fill="currentColor" />
                  </button>
                ) : transcribing ? (
                  <button aria-label="Transcribing" disabled className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[var(--ds-text-secondary)] ${composerMultiline ? "order-3" : ""}`}>
                    <Loader2 className="size-4 animate-spin" strokeWidth={1.75} />
                  </button>
                ) : (
                  <>
                    <button
                      aria-label="Voice input"
                      onClick={handleMicClick}
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)] ${composerMultiline ? "order-3" : ""}`}
                    >
                      <Mic className="size-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => send(draft)}
                      disabled={!draft.trim() && attachments.length === 0}
                      aria-label="Send message"
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-[#632E9A] text-white transition-colors hover:bg-[#542584] active:bg-[#4A1F77] disabled:opacity-30 disabled:hover:bg-[#632E9A] ${composerMultiline ? "order-4" : ""}`}
                    >
                      <ArrowUp className="size-4" strokeWidth={2} />
                    </button>
                  </>
                )}
              </div>
            </div>
            {/* 12px above and below, matching the launcher's footer */}
            <p className="py-3 text-center text-[12px] leading-4 text-[var(--ds-text-secondary)]">
              powered by{" "}
              <span className="font-bold text-[var(--ds-text-ink)]">TARS</span>
            </p>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
