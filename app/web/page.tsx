"use client";

import { useState, useRef, useEffect, useMemo, type ReactNode } from "react";
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
  Settings,
  Sparkles,
} from "lucide-react";

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
    <div className="flex items-center gap-2 px-1 text-[12px] font-medium text-[#333333]">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="ai-sparkle-web" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2E1F5E" />
            <stop offset="100%" stopColor="#9B6CF0" />
          </linearGradient>
        </defs>
      </svg>
      <Sparkles
        className="size-3.5 shrink-0"
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
function ThinkingReasoning({ reasoning, tools, onDone }: { reasoning: { title: string; body: string }[]; tools: Tool[]; onDone: () => void }) {
  const phrase = useThinkingPhrase();
  const total = reasoning.length;
  const [step, setStep] = useState(0);
  const [toolProg, setToolProg] = useState(0);
  const fired = useRef(false);
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
          <div className="flex w-fit items-center gap-1 rounded-[12px] rounded-bl-[4px] border border-[#E0DAD3] bg-[#F9F3EA] px-3.5 py-2.5">
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
          <div className="w-fit max-w-[90%] rounded-[12px] rounded-bl-[4px] border border-[#E0DAD3] bg-[#F9F3EA] px-4 py-2.5 text-[14px] leading-[1.7] tracking-[0.005em] text-[#333333]">
            Hi! I&apos;ve got everything Tars shared — let me check on that for you now.
          </div>
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
  | { from: "ai"; text: string; chips?: string[]; liveChips?: string[]; stream?: boolean; kind?: "agent" | "plans" | "handoff" }
  | { from: "user"; text: string };

// chips that lead to a scripted response — others are shown but disabled
const LIVE_CHIPS = new Set(["What is an AI agent?", "Compare plans"]);

// composer demo data — voice transcript + waveform shape
const DEMO_TRANSCRIPT = "Can you tell me more about the Studio plan?";
const WAVEFORM_HEIGHTS = Array.from({ length: 26 }, (_, i) => {
  const seed = Math.sin(i * 0.45) * 0.35 + Math.sin(i * 1.7 + 1.2) * 0.45 + 0.55;
  return Math.max(0.18, Math.min(1, seed));
});

const GREETING: Extract<Msg, { from: "ai" }> = {
  from: "ai",
  text: "Hi there! I'm Tars, your AI agent. I can show you our product, compare plans, or explain how AI agents work. What can I help you with?",
  chips: ["Product demo", "Compare plans", "What is an AI agent?"],
  liveChips: ["What is an AI agent?"],
};

export default function WebChat() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, setPending] = useState<"simple" | "plans" | null>("simple");
  const [reactions, setReactions] = useState<Record<number, "like" | "dislike">>({});
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  // auto-grow composer
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }, [draft]);

  function send(text: string) {
    const t = text.trim();
    if (!t && attachments.length === 0) return;
    const userText = t || "📎 Attachment";
    // drop any pending option chips once the user responds, then add their message
    setMessages((m) => [
      ...m.map((msg) => (msg.from === "ai" ? { ...msg, chips: undefined } : msg)),
      { from: "user", text: userText },
    ]);
    setDraft("");
    setAttachments([]);
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
      if (t === "What is an AI agent?") {
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
              className="flex items-center gap-2 rounded-[10px] bg-[var(--ds-accent)] px-3 py-2 text-[14px] font-medium text-white transition-colors hover:bg-[var(--ds-accent-hover)]"
            >
              <Plus className="size-4" strokeWidth={2} />
              New chat
            </button>
            <button className="flex items-center gap-2 rounded-[10px] px-3 py-2 text-[14px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)]">
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
                          ? "bg-[var(--ds-accent-soft)] text-[var(--ds-accent-ink)]"
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

          {/* account */}
          <div className="border-t border-[var(--ds-border-line)] p-3">
            <button className="flex w-full items-center gap-2.5 rounded-[10px] px-2 py-1.5 transition-colors hover:bg-[var(--ds-bg-subtle)]">
              <span className="flex size-7 items-center justify-center rounded-full bg-[var(--ds-accent-soft)] text-[12px] font-semibold text-[var(--ds-accent-ink)]">
                M
              </span>
              <span className="flex-1 truncate text-left text-[13px] font-medium">Mohima</span>
              <Settings className="size-4 text-[var(--ds-text-muted)]" strokeWidth={1.75} />
            </button>
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
              ) : m.from === "ai" ? (
                <div key={i} className="group flex flex-col items-start">
                  <p className="mb-1 ml-1 text-[11px] font-medium tracking-wide text-[#6E6E6E]">
                    AI Agent <span className="text-[#A8A096]">• 10:24 AM</span>
                  </p>
                  {m.kind === "plans" && (
                    <div className="mb-1.5">
                      <ReasoningChip reasoning={PLANS_REASONING} tools={PLANS_TOOLS} />
                    </div>
                  )}
                  <div className="w-fit max-w-[90%] rounded-[12px] rounded-bl-[4px] border border-[#E0DAD3] bg-[#F9F3EA] px-4 py-2.5 text-[14px] leading-[1.7] tracking-[0.005em] whitespace-pre-line text-[#333333]">
                    {m.kind === "plans" ? <PlansIntro /> : m.kind === "agent" ? <AgentAnswer /> : m.stream ? <Words text={m.text} /> : m.text}
                  </div>
                  {m.kind === "plans" && (
                    <>
                      <PlanCards
                        selected={selectedPlan}
                        onSelect={(title) => {
                          setSelectedPlan(title);
                          send(title);
                        }}
                      />
                      <div className="mt-2 w-fit max-w-[90%] rounded-[12px] rounded-bl-[4px] border border-[#E0DAD3] bg-[#F9F3EA] px-4 py-2.5 text-[14px] leading-[1.7] tracking-[0.005em] text-[#333333]">
                        What scale are you working at?
                      </div>
                    </>
                  )}
                  {m.chips && (
                    <div className="mt-3 flex flex-wrap gap-2 px-1">
                      {m.chips.map((c) => (
                        <button
                          key={c}
                          onClick={() => {
                            const live = m.liveChips ? m.liveChips.includes(c) : LIVE_CHIPS.has(c);
                            if (live) send(c);
                          }}
                          className="rounded-full border border-[#E0DAD3] bg-[#F9F3EA] px-3.5 py-1.5 text-[14px] text-[#333333] transition-colors hover:border-[#C5A8E0] hover:bg-[#F0E7FA] hover:text-[#4A1F77]"
                        >
                          {c}
                        </button>
                      ))}
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
                    className="w-fit max-w-[80%] rounded-[12px] rounded-br-[4px] px-4 py-2.5 text-[14px] leading-[1.7] tracking-[0.005em] text-[#4A1F77]"
                    style={{ backgroundColor: "#F0E7FA", boxShadow: "inset 0 0 0 1px #C5A8E0" }}
                  >
                    {m.text}
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
                  onDone={() => {
                    setPending(null);
                    setMessages((m) => [...m, { from: "ai", kind: "plans", text: "" }]);
                  }}
                />
              </div>
            ) : pending === "simple" ? (
              <div className="flex flex-col items-start">
                <AiThinking />
              </div>
            ) : null}
          </div>
        </div>

        {/* composer — matches the website widget */}
        <div className="shrink-0 px-6 pb-1.5">
          <div className="mx-auto flex max-w-[800px] flex-col">
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
            <div className="flex w-full flex-col gap-2 rounded-[12px] border border-[var(--ds-border-line)] bg-[var(--ds-bg-paper)] px-3 py-2 transition-all duration-200 hover:border-[var(--ds-border-hover)] focus-within:!border-[#632E9A] focus-within:!ring-4 focus-within:!ring-[#632E9A]/15">
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
              <div className={`flex w-full ${composerMultiline ? "flex-wrap items-end gap-x-1.5 gap-y-1" : "items-end gap-2"}`}>
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
                      <span key={i} className="block w-px origin-center rounded-full" style={{ height: `${Math.round(h * 18)}px`, backgroundColor: "#632E9A", animation: `wave-bar 1.6s ease-in-out ${i * 45}ms infinite` }} />
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
                    className={`block min-w-0 resize-none bg-transparent text-[14px] leading-[1.5] text-[#333] outline-none placeholder:text-[#555] ${composerMultiline ? "order-1 w-full basis-full px-2 pt-3 pb-1.5" : "flex-1 py-[5px]"}`}
                    style={{ maxHeight: 140, overflowY: "auto", boxSizing: "border-box" }}
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
            <p className="mt-1.5 text-center text-[11px] text-[var(--ds-text-muted)]">
              TARS can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
