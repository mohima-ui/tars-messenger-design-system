"use client";

import { Copy, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import { useState } from "react";

const LINE = "#E0DAD3";
const AI_BG = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT_SOFT = "#E0E5FA";
const ACCENT_INK = "#0A06A0";
const ACCENT_BORDER = "#A5B0EE";

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
          Tars <span className="text-[#A8A096]">• AI Agent</span>
        </p>
      )}
      <div className="flex justify-start">
        <div
          className="max-w-[88%] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[12px] rounded-bl-[6px] border px-[14px] py-[10px] text-[12px] leading-[1.55]"
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

function Citation({
  n,
  source,
  open,
  onToggle,
}: {
  n: number;
  source: { title: string; url: string };
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={onToggle}
        className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-[4px] border px-1 text-[10px] font-semibold transition-colors"
        style={{
          backgroundColor: open ? ACCENT_SOFT : "#FFFFFF",
          borderColor: open ? ACCENT_BORDER : LINE,
          color: open ? ACCENT_INK : MUTED,
        }}
        aria-label={`Citation ${n}: ${source.title}`}
      >
        {n}
      </button>
      {open && (
        <span
          className="absolute top-full left-0 z-10 mt-1 inline-flex w-[220px] flex-col gap-0.5 rounded-[8px] border bg-white p-2.5 text-left"
          style={{
            borderColor: LINE,
            boxShadow:
              "0 4px 12px -3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <span
            className="font-mono text-[9px] font-semibold tracking-wider uppercase"
            style={{ color: MUTED }}
          >
            Source {n}
          </span>
          <span className="text-[12px] font-medium" style={{ color: INK }}>
            {source.title}
          </span>
          <span
            className="truncate font-mono text-[10px]"
            style={{ color: ACCENT_INK }}
          >
            {source.url}
          </span>
        </span>
      )}
    </span>
  );
}

function CitationDemo() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <Bubble>
        Refunds are processed within 3–5 business days
        <Citation
          n={1}
          source={{ title: "Refund policy — terms.pdf", url: "acme.co/legal" }}
          open={open === 1}
          onToggle={() => setOpen(open === 1 ? null : 1)}
        />{" "}
        and may take a further 1–2 days to appear on your statement
        <Citation
          n={2}
          source={{
            title: "Bank settlement timelines",
            url: "acme.co/help/timing",
          }}
          open={open === 2}
          onToggle={() => setOpen(open === 2 ? null : 2)}
        />
        .
      </Bubble>
      <p className="ml-1 text-[10px] text-[#979797]">
        Tap a citation chip to expand the source.
      </p>
    </div>
  );
}

const ANATOMY = [
  { label: "Identity label (optional)", token: "Tars • AI Agent · 11/16 medium muted" },
  { label: "Bubble container", token: "max-w-[88%] · rounded 12/12/12/6 · border-line" },
  { label: "Content", token: "12/18 regular ink · words stream in 38ms stagger" },
  { label: "Inline citation chip", token: "h-4 · rounded-[4px] · numeric label" },
  { label: "Action toolbar (on click)", token: "Sound · Like · Dislike · Copy" },
];

const SPECS = [
  { prop: "Background", value: "#F9F3EA", note: "n-50 · --bg-paper" },
  { prop: "Border", value: "1px #E0DAD3", note: "--border-line" },
  { prop: "Text", value: "#333333", note: "--text-ink" },
  { prop: "Font", value: "12 / 18 · 400", note: "Body S · Relaxed · Regular" },
  { prop: "Emphasis", value: "600", note: "Semibold for emphasized words" },
  { prop: "Padding", value: "px-[14px] py-[10px]", note: "Tighter horizontal" },
  { prop: "Max width", value: "88%", note: "Of the message column" },
  { prop: "Radius", value: "12 · 12 · 12 · 6 (bl)", note: "Sharp corner anchors to speaker" },
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
    <div className="min-h-screen bg-[#FFFDFA]">
      <header className="sticky top-0 z-10 border-b border-[#E0DAD3] bg-[#FFFDFA]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <div className="flex items-baseline gap-3">
            <a
              href="/design-system"
              className="text-[12px] text-[#6E6E6E] transition-colors hover:text-[#333333]"
            >
              ← Foundation
            </a>
            <span className="text-[#D9D5CC]">/</span>
            <span className="text-[12px] font-medium text-[#333333]">
              Components
            </span>
            <span className="text-[#D9D5CC]">/</span>
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
              className="grid grid-cols-1 gap-3 rounded-[14px] border bg-[#FAF6EE] p-6 lg:grid-cols-2"
              style={{ borderColor: LINE }}
            >
              <div className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: LINE }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">
                  Default
                </p>
                <Bubble>I hear you — give me one moment to look into that.</Bubble>
              </div>
              <div className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: LINE }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">
                  With label (first of group)
                </p>
                <Bubble withLabel>
                  Hey there — looking to learn more?
                </Bubble>
              </div>
              <div className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: LINE }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">
                  Selected (click → toolbar)
                </p>
                <Bubble withLabel withToolbar>
                  Refunds usually land in 3–5 business days.
                </Bubble>
              </div>
              <div className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: LINE }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">
                  With inline citations
                </p>
                <CitationDemo />
              </div>
            </div>
          </section>

          {/* Anatomy */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">
              Anatomy
            </p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: LINE }}>
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
            <div className="divide-y rounded-[12px] border bg-white px-4 py-2" style={{ borderColor: LINE }}>
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
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: LINE }}>
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
            <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: LINE }}>
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
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: LINE }}>
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
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: LINE }}>
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

        <footer className="mt-20 flex items-center justify-between border-t pt-8 pb-12 text-[12px] text-[#979797]" style={{ borderColor: LINE }}>
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
