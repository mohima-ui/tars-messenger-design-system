"use client";

import { Check, ChevronRight, Copy, Database, ExternalLink, Sparkles, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import { useState } from "react";

const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const AI_BG = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT_SOFT = "#E0E5FA";
const ACCENT_INK = "#0A06A0";
const ACCENT_BORDER = "#A5B0EE";
const ACCENT = "#3730C9";

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
          Tars <span className="text-[#A8A096]">· AI Agent · 2:14 PM</span>
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

type ToolEntry = { name: string; args: string; result: string };

function ReasoningToolsStrip({ reasoning, tools }: { reasoning: string[]; tools: ToolEntry[] }) {
  const [expanded, setExpanded] = useState<"reasoning" | "tools" | null>(null);
  const [openTools, setOpenTools] = useState<Set<string>>(new Set());
  const openReasoning = expanded === "reasoning";
  const openToolsPanel = expanded === "tools";
  const toggle = (w: "reasoning" | "tools") => setExpanded((p) => (p === w ? null : w));
  const toggleTool = (n: string) =>
    setOpenTools((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });

  const link = (Icon: typeof Sparkles, label: string, open: boolean, onToggle: () => void) => (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-1 text-[11px] font-medium transition-colors hover:opacity-80"
      style={{ color: open ? ACCENT : MUTED }}
    >
      <Icon className="size-3 shrink-0" strokeWidth={1.75} style={{ color: ACCENT }} />
      {label}
      <ChevronRight
        className="size-2.5 transition-transform"
        strokeWidth={2}
        style={{ transform: open ? "rotate(90deg)" : "rotate(0)" }}
      />
    </button>
  );

  return (
    <div>
      <div className="flex items-center gap-4">
        {link(Sparkles, "Reasoning", openReasoning, () => toggle("reasoning"))}
        {link(Database, "Tools used", openToolsPanel, () => toggle("tools"))}
      </div>

      {openReasoning && (
        <div className="mt-2 flex flex-col" style={{ animation: "fade-in 200ms ease-out both" }}>
          {reasoning.map((s, i, arr) => (
            <div key={i} className="flex flex-col">
              <div className="flex items-start gap-2">
                <span
                  className="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border"
                  style={{ backgroundColor: ACCENT_SOFT, borderColor: ACCENT_BORDER, color: ACCENT_INK }}
                >
                  <Check className="size-2" strokeWidth={2.5} />
                </span>
                <span className="text-[11px] leading-[1.5]" style={{ color: MUTED }}>{s}</span>
              </div>
              {i < arr.length - 1 && (
                <span className="ml-[7px] h-4 w-px" style={{ backgroundColor: ACCENT_BORDER }} aria-hidden />
              )}
            </div>
          ))}
        </div>
      )}

      {openToolsPanel && (
        <div className="mt-2 flex flex-col gap-1.5" style={{ animation: "fade-in 200ms ease-out both" }}>
          {tools.map((t) => {
            const isOpen = openTools.has(t.name);
            return (
              <div key={t.name} className="rounded-[8px] border" style={{ borderColor: CHROME }}>
                <button
                  type="button"
                  onClick={() => toggleTool(t.name)}
                  className={`flex w-full items-center justify-between gap-2 bg-white px-3 py-2 text-left ${isOpen ? "rounded-t-[8px]" : "rounded-[8px]"}`}
                >
                  <p className="text-[11px]" style={{ color: MUTED }}>
                    Called{" "}
                    <code
                      className="mx-0.5 inline-flex items-center rounded-[4px] px-1 py-px align-baseline font-mono text-[10px] tracking-tight"
                      style={{ backgroundColor: ACCENT_SOFT, color: ACCENT_INK }}
                    >
                      {t.name}
                    </code>
                  </p>
                  <ChevronRight
                    className="size-3 shrink-0 transition-transform"
                    strokeWidth={2}
                    style={{ color: MUTED, transform: isOpen ? "rotate(90deg)" : "rotate(0)" }}
                    aria-hidden
                  />
                </button>
                {isOpen && (
                  <div
                    className="flex flex-col gap-1.5 rounded-b-[8px] border-t bg-white px-3 py-2"
                    style={{ borderColor: CHROME, animation: "fade-in 180ms ease-out both" }}
                  >
                    <div>
                      <span className="text-[10px]" style={{ color: "#A8A096" }}>Arguments</span>
                      <pre className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[10px] leading-[1.5]" style={{ color: ACCENT_INK }}>{t.args}</pre>
                    </div>
                    <div>
                      <span className="text-[10px]" style={{ color: "#A8A096" }}>Result</span>
                      <pre className="mt-0.5 overflow-x-auto rounded-[4px] px-2 py-1 font-mono text-[10px] leading-[1.5]" style={{ color: ACCENT_INK }}>{t.result}</pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-1.5 mb-1.5 h-px" style={{ backgroundColor: LINE }} />
    </div>
  );
}

function ReasoningDemo() {
  return (
    <div className="flex flex-col gap-2">
      <Bubble withLabel>
        <ReasoningToolsStrip
          reasoning={[
            "Read the customer's question",
            "Checked the refund policy",
            "Drafted the response",
          ]}
          tools={[
            {
              name: "lookup_policy",
              args: '{ "topic": "refunds" }',
              result: '{ "window": "3–5 business days" }',
            },
            {
              name: "get_order",
              args: '{ "order_id": "#30815" }',
              result: '{ "status": "refunded", "amount": 49 }',
            },
            {
              name: "estimate_settlement",
              args: '{ "method": "card" }',
              result: '{ "extra_days": "1–2" }',
            },
          ]}
        />
        Refunds are processed within 3–5 business days.
      </Bubble>
      <p className="ml-1 text-[10px] text-[#979797]">
        Tap “Reasoning” or “Tools used” to expand the trace.
      </p>
    </div>
  );
}

const ANATOMY = [
  { label: "Identity label (optional)", token: "Tars • AI Agent · 11/16 medium muted" },
  { label: "Bubble container", token: "max-w-[90%] · rounded 12/12/12/4 · border-line" },
  { label: "Content", token: "14px regular ink · words stream in 38ms stagger" },
  { label: "Inline citation chip", token: "h-4 · rounded-[4px] · numeric label" },
  { label: "Action toolbar (on click)", token: "Sound · Like · Dislike · Copy" },
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
                <ReasoningDemo />
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
          <a href="/design-system/components/user-message" className="transition-colors hover:text-[#333333]">
            User Message →
          </a>
        </footer>
      </main>
    </div>
  );
}
