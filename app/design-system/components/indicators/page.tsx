"use client";

import { Sparkles, Check, Loader2, Database, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const AI_BG = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT = "#632E9A";
const ACCENT_SOFT = "#F0E7FA";
const ACCENT_INK = "#4A1F77";
const ACCENT_BORDER = "#C5A8E0";
const DANGER = "#C0392B";

/* 1 · Typing — the classic 3-dot pulse in an AI bubble */
function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="flex w-fit items-center gap-1 rounded-[12px] rounded-bl-[4px] border px-3.5 py-3" style={{ backgroundColor: AI_BG, borderColor: LINE }}>
        {[0, 1, 2].map((i) => (
          <span key={i} className="block size-1.5 rounded-full" style={{ backgroundColor: "#8A8378", animation: `typing-dot 1.2s ease-in-out ${i * 150}ms infinite` }} />
        ))}
      </div>
    </div>
  );
}

/* 2 · Thinking — spinning sparkle + label, before the AI starts reasoning */
function AiThinkingLine() {
  return (
    <div className="flex items-center gap-2 text-[12px] font-medium" style={{ color: INK }}>
      <Sparkles className="size-3.5 shrink-0 animate-[spin_2.4s_linear_infinite]" strokeWidth={1.75} style={{ color: ACCENT }} />
      AI is thinking
    </div>
  );
}

/* 3 · Reasoning & tools — the live trace from AI Message: thinks, runs a tool,
   then collapses into a "Thought" chip above the answer. */
const REASONING_STEPS = [
  { title: "Retrieving plan details", body: "Querying the knowledge base for “week 7 plan” to find the most relevant material." },
  { title: "Extracting the tasks", body: "Pulled the Week 7 plan — pinpointing the specific tasks and milestones." },
  { title: "Checking dependencies", body: "Cross-referencing prerequisites carried over from weeks 5–6." },
  { title: "Drafting the summary", body: "Composing a concise answer around the key milestones." },
];
const TOOL_CALL = {
  name: "knowledge_retrieval",
  ms: 64,
  args: '{ "query": "week 7 plan", "top_k": 5 }',
  result: '{ "documents": 12, "matched": "System Design — Week 7" }',
};

function ThinkingTrace() {
  const [done, setDone] = useState(0);
  const [toolDone, setToolDone] = useState(false);

  // loop forever: steps check off → tool runs → success → pause → restart
  useEffect(() => {
    if (done < REASONING_STEPS.length) {
      const t = setTimeout(() => setDone((d) => d + 1), 900);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setToolDone(true), 800);
    const t2 = setTimeout(() => { setToolDone(false); setDone(0); }, 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [done]);

  return (
    <div className="rounded-[12px] border p-3" style={{ borderColor: LINE, backgroundColor: "#FBF8F3" }}>
      <div className="flex items-center gap-1.5">
        <Sparkles className="size-3.5 shrink-0 animate-[spin_2.4s_linear_infinite]" strokeWidth={1.75} style={{ color: ACCENT }} />
        <span className="text-[12px] font-medium" style={{ color: INK }}>AI is thinking</span>
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Reasoning</p>
      <div className="mt-1.5 flex flex-col">
        {REASONING_STEPS.map((r, i) => {
          if (i > done) return null;
          const completed = i < done;
          const connector = i < done && i < REASONING_STEPS.length - 1;
          return (
            <div key={i} className="flex gap-2" style={{ animation: "fade-in 260ms ease-out both" }}>
              <div className="flex shrink-0 flex-col items-center">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: completed ? ACCENT_SOFT : "transparent" }}>
                  {completed ? <Check className="size-2.5" strokeWidth={2.5} style={{ color: ACCENT_INK }} /> : <Loader2 className="size-3 animate-spin" strokeWidth={2} style={{ color: ACCENT }} />}
                </span>
                {connector && <span className="my-0.5 w-px flex-1" style={{ backgroundColor: ACCENT_BORDER, minHeight: 12 }} />}
              </div>
              <div className="min-w-0 pb-2">
                <p className="text-[12px] font-semibold leading-[1.5]" style={{ color: completed ? INK : MUTED }}>{r.title}</p>
                <p className="text-[12px] italic leading-[1.5]" style={{ color: "#A8A096" }}>{r.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      {done >= REASONING_STEPS.length && (
        <div className="mt-2.5 flex items-center gap-2 rounded-[8px] border bg-white px-3 py-2" style={{ borderColor: CHROME, animation: "fade-in 220ms ease-out both" }}>
          <Database className="size-3.5 shrink-0" strokeWidth={1.75} style={{ color: ACCENT }} />
          <span className="font-mono text-[11px]" style={{ color: INK }}>{TOOL_CALL.name}</span>
          <span className="ml-auto text-[11px]" style={{ color: MUTED }}>{toolDone ? `${TOOL_CALL.ms}ms · success` : "running…"}</span>
          <span className="size-1.5 rounded-full" style={{ backgroundColor: toolDone ? "#22A06B" : ACCENT }} />
        </div>
      )}
    </div>
  );
}

/* 4 · Tool failed — a tool call errors, then auto-retries (not a dead end) */
function ToolFailed() {
  return (
    <div className="flex flex-col gap-2 rounded-[12px] border p-3" style={{ borderColor: LINE, backgroundColor: "#FBF8F3" }}>
      <div className="flex items-center gap-2 rounded-[8px] border bg-white px-3 py-2" style={{ borderColor: CHROME }}>
        <Database className="size-3.5 shrink-0" strokeWidth={1.75} style={{ color: ACCENT }} />
        <span className="font-mono text-[11px]" style={{ color: INK }}>{TOOL_CALL.name}</span>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium" style={{ color: DANGER }}>
          <AlertCircle className="size-3" strokeWidth={2} /> failed
        </span>
      </div>
      <div className="flex items-center gap-1.5 px-0.5 text-[11px]" style={{ color: MUTED }}>
        <Loader2 className="size-3 animate-spin" strokeWidth={2} style={{ color: ACCENT }} />
        Retrying… <span style={{ color: "#A8A096" }}>attempt 2 of 3</span>
      </div>
    </div>
  );
}

const ANATOMY = [
  { label: "Typing dots", token: "3 · size-1.5 · #8A8378 · staggered typing-dot pulse, in an AI bubble" },
  { label: "Thinking line", token: "Spinning Sparkles (accent) + 'AI is thinking' · 12 / 500" },
  { label: "Reasoning panel", token: "Warm panel · checklist (title + body) with timeline connectors · active step spins" },
  { label: "Tool row", token: "Database icon + tool name (mono) + 'running…' → 'Nms · success'" },
  { label: "Tool failed", token: "Row → danger 'failed' (AlertCircle) + a muted 'Retrying… attempt N' line" },
];

const SPECS = [
  { prop: "Typing bubble", value: "AI bubble · py-3", note: "Same shape as an AI message" },
  { prop: "Dot", value: "size-1.5 · #8A8378", note: "typing-dot 1.2s · 150ms stagger" },
  { prop: "Sparkle", value: "size-3.5 · #632E9A", note: "spin 2.4s linear (slow)" },
  { prop: "Panel fill", value: "#FBF8F3", note: "Warmer than the AI bubble" },
  { prop: "Checked step", value: "Check · #4A1F77 in #F0E7FA", note: "--accent-ink in --accent-soft" },
  { prop: "Running step", value: "Loader2 · #632E9A spin", note: "Current reasoning step" },
  { prop: "Connector", value: "1px #C5A8E0", note: "Timeline line between steps" },
];

const STATES = [
  { name: "Typing", desc: "Composing a direct reply — no reasoning shown. The lightest indicator." },
  { name: "Thinking", desc: "A brief 'AI is thinking' line before the reasoning panel opens." },
  { name: "Reasoning & tools", desc: "Steps check off one by one (title + body) while a named tool runs to success — a continuous pending state. (In the chat it collapses into a 'Thought' chip above the answer once done.)" },
  { name: "Tool failed", desc: "A tool call errors — the row turns danger ('failed') and the agent auto-retries, surfaced as 'Retrying… attempt N of M' rather than a dead end." },
];

const DOS = [
  "Use the lightest indicator that fits: typing < thinking < reasoning.",
  "Keep the reasoning panel honest — show real steps, not filler.",
  "Replace the indicator with the message the moment it's ready — never both.",
  "Collapse a finished reasoning trace into a quiet 'Thought' chip.",
];

const DONTS = [
  "Don't spin forever — if it stalls, surface an error, not an endless pulse.",
  "Don't show reasoning for a one-line reply — a typing pulse is enough.",
  "Don't use the accent for body copy — it's for the indicator chrome only.",
  "Don't stack multiple indicators at once.",
];

export default function IndicatorsPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-[#E5E5E5] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <div className="flex items-baseline gap-3">
            <a href="/design-system" className="text-[12px] text-[#6E6E6E] transition-colors hover:text-[#333333]">
              ← Foundation
            </a>
            <span className="text-[#D4D4D4]">/</span>
            <span className="text-[12px] font-medium text-[#333333]">Components</span>
            <span className="text-[#D4D4D4]">/</span>
            <span className="text-[12px] font-semibold text-[#333333]">Indicators</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">Indicators</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            The pending states an AI message passes through before its text appears. They ladder
            by how much work is happening behind the scenes — a typing pulse for a quick reply, a
            thinking line and a live reasoning checklist when the agent works through steps or
            calls a tool. Always the lightest one that&apos;s honest.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Variants */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Variants</p>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="flex flex-col gap-4 rounded-[10px] border bg-white p-5" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">1 · Typing</p>
                <TypingDots />
              </div>
              <div className="flex flex-col gap-4 rounded-[10px] border bg-white p-5" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">2 · Thinking</p>
                <AiThinkingLine />
              </div>
              <div className="flex flex-col gap-4 rounded-[10px] border bg-white p-5" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">3 · Reasoning &amp; tools</p>
                <ThinkingTrace />
              </div>
              <div className="flex flex-col gap-4 rounded-[10px] border bg-white p-5" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">4 · Tool failed</p>
                <ToolFailed />
              </div>
            </div>
          </section>

          {/* Anatomy */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Anatomy</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: CHROME }}>
              {ANATOMY.map((a, i) => (
                <div key={a.label} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-6 font-mono text-[11px] text-[#979797]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="w-44 shrink-0 text-[12px] font-semibold text-[#333333]">{a.label}</span>
                  <span className="text-[11px] text-[#6E6E6E]">{a.token}</span>
                </div>
              ))}
            </div>
          </section>

          {/* States */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">States</p>
            <div className="divide-y rounded-[12px] border bg-white px-4 py-2" style={{ borderColor: CHROME }}>
              {STATES.map((s) => (
                <div key={s.name} className="flex items-baseline gap-4 py-2.5">
                  <span className="w-32 shrink-0 text-[12px] font-semibold text-[#333333]">{s.name}</span>
                  <p className="text-[12px] leading-relaxed text-[#6E6E6E]">{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Specs */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Specs</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: CHROME }}>
              {SPECS.map((s) => (
                <div key={s.prop} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-44 shrink-0 text-[12px] font-semibold text-[#333333]">{s.prop}</span>
                  <code className="w-52 shrink-0 font-mono text-[11px] text-[#333333]">{s.value}</code>
                  <span className="text-[11px] text-[#6E6E6E]">{s.note}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Do / Don't */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Guidance</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#E8F5EC] text-[11px] font-bold text-[#0F7A38]">✓</span>
                  <p className="text-[12px] font-semibold text-[#333333]">Do</p>
                </div>
                <ul className="flex flex-col gap-2">
                  {DOS.map((t) => (
                    <li key={t} className="text-[12px] leading-relaxed text-[#555]">{t}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#FEE2E2] text-[11px] font-bold text-[#991B1B]">✕</span>
                  <p className="text-[12px] font-semibold text-[#333333]">Don&apos;t</p>
                </div>
                <ul className="flex flex-col gap-2">
                  {DONTS.map((t) => (
                    <li key={t} className="text-[12px] leading-relaxed text-[#555]">{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-20 flex items-center justify-between border-t pt-8 pb-12 text-[12px] text-[#979797]" style={{ borderColor: CHROME }}>
          <a href="/design-system/components/ai-message" className="transition-colors hover:text-[#333333]">← AI Message</a>
          <a href="/design-system/components/user-message" className="transition-colors hover:text-[#333333]">User Message →</a>
        </footer>
      </main>
    </div>
  );
}
