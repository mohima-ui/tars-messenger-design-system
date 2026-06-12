"use client";

import { Check, ChevronRight, Copy, Database, ExternalLink, Loader2, Sparkles, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import { useEffect, useState } from "react";

const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const AI_BG = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT_SOFT = "#F0E7FA";
const ACCENT_INK = "#4A1F77";
const ACCENT_BORDER = "#C5A8E0";
const ACCENT = "#632E9A";

function Bubble({
  children,
  withLabel,
  withToolbar,
}: {
  children: React.ReactNode;
  withLabel?: boolean;
  withToolbar?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      {withLabel && (
        <p className="ml-1 text-[11px] font-medium tracking-wide text-[#6E6E6E]">
          AI Agent <span className="text-[#A8A096]">· 2:14 PM</span>
        </p>
      )}
      <div className="flex justify-start">
        <div
          className="max-w-[90%] rounded-[12px] rounded-bl-[4px] border px-3.5 py-2 text-[14px] leading-relaxed"
          style={{ backgroundColor: AI_BG, borderColor: LINE, color: INK }}
        >
          {children}
        </div>
      </div>
      {withToolbar && (
        <div className="ml-1 flex items-center gap-0.5">
          <button className="flex size-6 items-center justify-center rounded-[4px] text-[#6E6E6E] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333]">
            <Volume2 className="size-3.5" strokeWidth={1.5} />
          </button>
          <button className="flex size-6 items-center justify-center rounded-[4px] text-[#6E6E6E] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333]">
            <ThumbsUp className="size-3" strokeWidth={1.5} />
          </button>
          <button className="flex size-6 items-center justify-center rounded-[4px] text-[#6E6E6E] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333]">
            <ThumbsDown className="size-3" strokeWidth={1.5} />
          </button>
          <button className="flex size-6 items-center justify-center rounded-[4px] text-[#6E6E6E] transition-colors hover:bg-[#F0EBE0] hover:text-[#333333]">
            <Copy className="size-3" strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}

function Citation({ n, source }: { n: number; source: { title: string; description: string; url: string } }) {
  return (
    <span className="group/cite relative inline-block align-baseline">
      <button
        type="button"
        className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full border border-[#E0DAD3] bg-[#E0DAD3] text-[10px] font-semibold text-[#333333] transition-colors group-hover/cite:border-[#C5A8E0] group-hover/cite:bg-[#F0E7FA] group-hover/cite:text-[#4A1F77]"
        aria-label={`Citation ${n}: ${source.title}`}
      >
        {n}
      </button>
      {/* pt-2 is a transparent bridge so moving from the chip to the card keeps hover; pointer-events enabled on hover so the link is clickable */}
      <span className="pointer-events-none absolute top-full left-0 z-10 block w-max max-w-[260px] pt-2 opacity-0 transition-opacity duration-150 group-hover/cite:pointer-events-auto group-hover/cite:opacity-100">
        <span
          className="flex flex-col gap-0.5 rounded-[8px] border bg-white p-2.5 text-left"
          style={{
            borderColor: LINE,
            boxShadow: "0 4px 12px -3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <span className="font-mono text-[9px] font-semibold tracking-wider uppercase" style={{ color: MUTED }}>
            Source {n}
          </span>
          <span className="text-[12px] font-medium" style={{ color: INK }}>
            {source.title}
          </span>
          <span className="line-clamp-2 text-[11px] leading-[1.45]" style={{ color: MUTED }}>
            {source.description}
          </span>
          <a
            href={`https://${source.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-0.5 inline-flex max-w-full items-center gap-1 font-mono text-[10px] underline"
            style={{ color: "#4A1F77" }}
          >
            <span className="truncate">{source.url}</span>
            <ExternalLink className="size-3 shrink-0" strokeWidth={2} aria-hidden />
          </a>
        </span>
      </span>
    </span>
  );
}

function CitationDemo() {
  return (
    <div className="flex flex-col gap-2">
      <Bubble withLabel>
        Refunds are processed within 3–5 business days
        <Citation
          n={1}
          source={{
            title: "Refund policy — terms.pdf",
            description: "How refunds are issued and the standard 3–5 business day processing window.",
            url: "acme.co/legal",
          }}
        />{" "}
        and may take a further 1–2 days to appear on your statement
        <Citation
          n={2}
          source={{
            title: "Bank settlement timelines",
            description: "Why funds can take 1–2 extra days to post to your statement after processing.",
            url: "acme.co/help/timing",
          }}
        />
        .
      </Bubble>
      <p className="ml-1 text-[10px] text-[#979797]">
        Hover a citation chip to reveal the source.
      </p>
    </div>
  );
}

/* Reasoning streams live while the AI thinks, then collapses to a chip above the answer. */
const REASONING_STEPS = [
  {
    title: "Retrieving plan details",
    body: "Querying the knowledge base for “week 7 plan” to find the most relevant material.",
  },
  {
    title: "Extracting the tasks",
    body: "Pulled the Week 7 plan — pinpointing the specific tasks and milestones.",
  },
  {
    title: "Checking dependencies",
    body: "Cross-referencing prerequisites carried over from weeks 5–6.",
  },
  {
    title: "Drafting the summary",
    body: "Composing a concise answer around the key milestones.",
  },
];
const TOOL_CALL = {
  name: "knowledge_retrieval",
  ms: 64,
  args: '{ "query": "week 7 plan", "top_k": 5 }',
  result: '{ "documents": 12, "matched": "System Design — Week 7" }',
};

function ThinkingTrace() {
  const [phase, setPhase] = useState<"thinking" | "done">("thinking");
  const [done, setDone] = useState(0); // completed (checked) reasoning steps
  const [toolDone, setToolDone] = useState(false);
  const [expanded, setExpanded] = useState(false); // re-open after done
  const [openTool, setOpenTool] = useState(false);

  // check off reasoning steps one by one, then run the tool, then reveal the answer
  useEffect(() => {
    if (phase !== "thinking") return;
    if (done < REASONING_STEPS.length) {
      const t = setTimeout(() => setDone((d) => d + 1), 900);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setToolDone(true), 800);
    const t2 = setTimeout(() => setPhase("done"), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase, done]);

  const replay = () => {
    setExpanded(false);
    setOpenTool(false);
    setToolDone(false);
    setDone(0);
    setPhase("thinking");
  };

  const toolRow = (
    <div className="rounded-[8px] border" style={{ borderColor: CHROME }}>
      <button
        type="button"
        onClick={() => setOpenTool((o) => !o)}
        className={`flex w-full items-center gap-2 bg-white px-3 py-2 text-left ${openTool ? "rounded-t-[8px]" : "rounded-[8px]"}`}
      >
        <Database className="size-3.5 shrink-0" strokeWidth={1.75} style={{ color: ACCENT }} />
        <code className="font-mono text-[10px]" style={{ color: ACCENT_INK }}>{TOOL_CALL.name}</code>
        <span className="ml-auto text-[10px]" style={{ color: MUTED }}>{TOOL_CALL.ms}ms · success</span>
        <ChevronRight className="size-3 shrink-0 transition-transform" strokeWidth={2} style={{ color: MUTED, transform: openTool ? "rotate(90deg)" : "rotate(0)" }} aria-hidden />
      </button>
      {openTool && (
        <div className="flex flex-col gap-1.5 rounded-b-[8px] border-t bg-white px-3 py-2" style={{ borderColor: CHROME, animation: "fade-in 180ms ease-out both" }}>
          <div>
            <span className="text-[10px]" style={{ color: "#A8A096" }}>Input</span>
            <pre className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[10px] leading-[1.5]" style={{ color: ACCENT_INK }}>{TOOL_CALL.args}</pre>
          </div>
          <div>
            <span className="text-[10px]" style={{ color: "#A8A096" }}>Output</span>
            <pre className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[10px] leading-[1.5]" style={{ color: ACCENT_INK }}>{TOOL_CALL.result}</pre>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-1.5">
      <p className="ml-1 text-[11px] font-medium tracking-wide text-[#6E6E6E]">
        AI Agent <span className="text-[#A8A096]">· 2:14 PM</span>
      </p>

      {phase === "thinking" ? (
        /* ── live thinking panel (open while reasoning) ── */
        <div className="rounded-[12px] border p-3" style={{ borderColor: LINE, backgroundColor: "#FBF8F3" }}>
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 shrink-0 animate-[spin_2.4s_linear_infinite]" strokeWidth={1.75} style={{ color: ACCENT }} />
            <span className="text-[12px] font-medium" style={{ color: INK }}>AI is thinking</span>
          </div>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Reasoning</p>
          <div className="mt-1.5 flex flex-col">
            {REASONING_STEPS.map((r, i) => {
              if (i > done) return null; // not reached yet
              const completed = i < done; // checked off
              const connector = i < done && i < REASONING_STEPS.length - 1; // line to the next check
              return (
                <div key={i} className="flex gap-2" style={{ animation: "fade-in 260ms ease-out both" }}>
                  <div className="flex shrink-0 flex-col items-center">
                    <span
                      className="flex size-4 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: completed ? ACCENT_SOFT : "transparent" }}
                    >
                      {completed ? (
                        <Check className="size-2.5" strokeWidth={2.5} style={{ color: ACCENT_INK }} />
                      ) : (
                        <Loader2 className="size-3 animate-spin" strokeWidth={2} style={{ color: ACCENT }} />
                      )}
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
      ) : (
        /* ── collapsed: chip above the answer bubble ── */
        <div className="flex flex-col gap-1.5" style={{ animation: "fade-in 240ms ease-out both" }}>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors hover:brightness-[0.98]"
            style={{ borderColor: expanded ? ACCENT_BORDER : LINE, backgroundColor: expanded ? ACCENT_SOFT : "#F7F2EA", color: expanded ? ACCENT_INK : MUTED }}
          >
            <Sparkles className="size-3 shrink-0" strokeWidth={1.75} style={{ color: ACCENT }} />
            Thought for 5s · 1 tool
            <ChevronRight className="size-3 transition-transform" strokeWidth={2} style={{ transform: expanded ? "rotate(90deg)" : "rotate(0)" }} />
          </button>

          {expanded && (
            <div className="rounded-[12px] border p-3" style={{ borderColor: LINE, backgroundColor: "#FBF8F3", animation: "fade-in 200ms ease-out both" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Reasoning</p>
              <div className="mt-1.5 flex flex-col">
                {REASONING_STEPS.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="flex shrink-0 flex-col items-center">
                      <span className="flex size-3.5 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: ACCENT_SOFT, color: ACCENT_INK }}>
                        <Check className="size-2" strokeWidth={2.5} />
                      </span>
                      {i < REASONING_STEPS.length - 1 && <span className="my-0.5 w-px flex-1" style={{ backgroundColor: ACCENT_BORDER, minHeight: 10 }} />}
                    </div>
                    <span className="pb-1.5 text-[11px] leading-[1.5]" style={{ color: MUTED }}>
                      <span className="font-semibold" style={{ color: INK }}>{r.title}.</span> {r.body}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2.5">{toolRow}</div>
            </div>
          )}

          <div className="flex justify-start">
            <div className="max-w-[90%] rounded-[12px] rounded-bl-[4px] border px-3.5 py-2 text-[14px] leading-relaxed" style={{ backgroundColor: AI_BG, borderColor: LINE, color: INK }}>
              For Week 7, the focus is <span className="font-semibold">System Design Mastery</span> — here are the key tasks and milestones to work through.
            </div>
          </div>
        </div>
      )}

      <button type="button" onClick={replay} className="ml-1 w-fit text-[10px] text-[#979797] underline-offset-2 hover:underline">
        ↻ Replay
      </button>
    </div>
  );
}

const ANATOMY = [
  { label: "Identity label (optional)", token: "AI Agent · timestamp · 11/16 medium muted" },
  { label: "Bubble container", token: "max-w-[90%] · rounded 12/12/12/4 · border-line" },
  { label: "Content", token: "14px regular ink · words stream in 38ms stagger" },
  { label: "Inline citation chip", token: "h-4 · rounded-[4px] · numeric label" },
  { label: "Action toolbar (on click)", token: "Sound · Like · Dislike · Copy" },
  { label: "Reasoning trace", token: "Live panel while thinking → collapses to a chip ('Thought for Ns · N tools') above the bubble" },
];

const SPECS = [
  { prop: "Background", value: "#F9F3EA", note: "n-50 · --bg-paper" },
  { prop: "Border", value: "1px #E0DAD3", note: "--border-line" },
  { prop: "Text", value: "#333333", note: "--text-ink" },
  { prop: "Font", value: "14 · leading-relaxed · 400", note: "Body · 1.625 · Regular" },
  { prop: "Emphasis", value: "600", note: "Semibold for emphasized words" },
  { prop: "Padding", value: "px-3.5 py-2", note: "14px × 8px" },
  { prop: "Max width", value: "90%", note: "Of the message column" },
  { prop: "Radius", value: "12 · 12 · 12 · 4 (bl)", note: "Sharp corner anchors to speaker" },
  { prop: "Alignment", value: "justify-start", note: "Left-aligned" },
  { prop: "Animation", value: "word-by-word 38ms", note: "On first reveal only" },
];

const STATES = [
  { name: "Rest", desc: "Cursor-pointer. No visual change." },
  { name: "Hover", desc: "Subtle bg shift to --bg-subtle (#F0EBE0)." },
  {
    name: "Selected (click)",
    desc: "Identity label expands above; toolbar reveals below with fade-in (180ms).",
  },
  {
    name: "Streaming",
    desc: "Each word animates in with translateY(3px) → 0 + blur 1.5px → 0 over 320ms, staggered 38ms apart.",
  },
];

const DOS = [
  "Bold the words that carry meaning (semibold spans inline).",
  "Keep messages short — split into separate bubbles, not paragraphs.",
  "Use citations for any factual claim that needs grounding.",
];

const DONTS = [
  "Don't put options inside the bubble — they sit as separate chips below.",
  "Don't pad more than 14×10 — bubbles should feel compact.",
  "Don't use the accent color for AI text — that's reserved for the user side.",
];

function StateRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2.5">
      <span className="w-32 shrink-0 text-[12px] font-semibold text-[#333333]">
        {name}
      </span>
      <p className="text-[12px] leading-relaxed text-[#6E6E6E]">{desc}</p>
    </div>
  );
}

export default function AiMessagePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 border-b border-[#E5E5E5] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <div className="flex items-baseline gap-3">
            <a
              href="/design-system"
              className="text-[12px] text-[#6E6E6E] transition-colors hover:text-[#333333]"
            >
              ← Foundation
            </a>
            <span className="text-[#D4D4D4]">/</span>
            <span className="text-[12px] font-medium text-[#333333]">
              Components
            </span>
            <span className="text-[#D4D4D4]">/</span>
            <span className="text-[12px] font-semibold text-[#333333]">
              AI Message
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">
            Component
          </p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">
            AI Message
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            The agent speaks plainly. Citations are inline; sources expand on
            demand. Words stream in word-by-word, the bubble fades up, and the
            action toolbar reveals only when the user explicitly engages.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Preview matrix */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Previews
            </p>
            <div
              className="grid grid-cols-1 gap-3 rounded-[14px] border bg-white p-6 lg:grid-cols-2"
              style={{ borderColor: CHROME }}
            >
              <div className="flex flex-col gap-4 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">
                  Default · label + timestamp
                </p>
                <Bubble withLabel>
                  Hey there — looking to learn more?
                </Bubble>
              </div>
              <div className="flex flex-col gap-4 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">
                  Hover · action buttons below
                </p>
                <Bubble withLabel withToolbar>
                  Refunds usually land in 3–5 business days.
                </Bubble>
              </div>
              <div className="flex flex-col gap-4 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">
                  With citations
                </p>
                <CitationDemo />
              </div>
              <div className="flex flex-col gap-4 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">
                  With reasoning &amp; tools
                </p>
                <ThinkingTrace />
              </div>
            </div>
          </section>

          {/* Anatomy */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Anatomy
            </p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: CHROME }}>
              {ANATOMY.map((a, i) => (
                <div key={a.label} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-6 font-mono text-[11px] text-[#979797]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="w-56 shrink-0 text-[12px] font-semibold text-[#333333]">
                    {a.label}
                  </span>
                  <span className="text-[11px] text-[#6E6E6E]">{a.token}</span>
                </div>
              ))}
            </div>
          </section>

          {/* States */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              States
            </p>
            <div className="divide-y rounded-[12px] border bg-white px-4 py-2" style={{ borderColor: CHROME }}>
              {STATES.map((s) => (
                <StateRow key={s.name} name={s.name} desc={s.desc} />
              ))}
            </div>
          </section>

          {/* Specs */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Specs
            </p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: CHROME }}>
              {SPECS.map((s) => (
                <div key={s.prop} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-48 shrink-0 text-[12px] font-semibold text-[#333333]">
                    {s.prop}
                  </span>
                  <code className="w-56 shrink-0 font-mono text-[11px] text-[#333333]">
                    {s.value}
                  </code>
                  <span className="text-[11px] text-[#6E6E6E]">{s.note}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Citations spec */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Citations
            </p>
            <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: CHROME }}>
              <p className="text-[12px] leading-relaxed text-[#555]">
                Inline numeric chips (h-4, rounded-[4px], 10/font-semibold). At
                rest: white fill, --border-line stroke, --text-secondary
                number. On click: --accent-soft fill, --accent-border stroke,
                --accent-ink number, and a popover expands with source title +
                url. Only one citation can be open at a time.
              </p>
            </div>
          </section>

          {/* Do / Don't */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Guidance
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#E8F5EC] text-[11px] font-bold text-[#0F7A38]">
                    ✓
                  </span>
                  <p className="text-[12px] font-semibold text-[#333333]">Do</p>
                </div>
                <ul className="flex flex-col gap-2">
                  {DOS.map((t) => (
                    <li key={t} className="text-[12px] leading-relaxed text-[#555]">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#FEE2E2] text-[11px] font-bold text-[#991B1B]">
                    ✕
                  </span>
                  <p className="text-[12px] font-semibold text-[#333333]">Don&apos;t</p>
                </div>
                <ul className="flex flex-col gap-2">
                  {DONTS.map((t) => (
                    <li key={t} className="text-[12px] leading-relaxed text-[#555]">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-20 flex items-center justify-between border-t pt-8 pb-12 text-[12px] text-[#979797]" style={{ borderColor: CHROME }}>
          <a href="/design-system/components/header" className="transition-colors hover:text-[#333333]">
            ← Header
          </a>
          <a href="/design-system/components/indicators" className="transition-colors hover:text-[#333333]">
            Indicators →
          </a>
        </footer>
      </main>
    </div>
  );
}
