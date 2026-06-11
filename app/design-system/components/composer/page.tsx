"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Mic, ArrowUp, X, Square, Loader2, FileText, Image as ImageIcon } from "lucide-react";

const LINE = "#E0DAD3";
const BORDER_HOVER = "#D8CFC0";
const CHROME = "#E5E5E5";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT = "#632E9A";
const SEND = "#632E9A";

const WAVE = [0.4, 0.7, 0.5, 0.9, 0.6, 1, 0.55, 0.8, 0.45, 0.7, 0.95, 0.5, 0.75, 0.6, 0.9, 0.4, 0.65, 1, 0.5, 0.8, 0.45, 0.7, 0.6, 0.85, 0.5, 0.7];

/* shared shell — rounded paper box with focus ring */
function Box({ focused, children }: { focused?: boolean; children: React.ReactNode }) {
  return (
    <div
      className="flex w-full items-end gap-2 rounded-[12px] border px-3 py-2 transition-all duration-200"
      style={{
        borderColor: focused ? ACCENT : LINE,
        backgroundColor: PAPER,
        boxShadow: focused ? `0 0 0 4px rgba(99,46,154,0.15)` : undefined,
      }}
    >
      {children}
    </div>
  );
}

/* ── Live composer — exact reflow from the main app: past one line the field
   moves full-width on top (order-1) and the buttons drop below. ── */
function LiveComposer() {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  const has = text.trim().length > 0;

  const multiline = useMemo(() => {
    if (!text) return false;
    const total = text.split("\n").reduce((a, l) => a + Math.max(1, Math.ceil(l.length / 45)), 0);
    return total > 1;
  }, [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 140) + "px";
  }, [text]);

  return (
    <div className="w-full max-w-[380px]">
      <div
        className={`flex w-full rounded-[12px] border border-[var(--ds-border-line)] bg-[var(--ds-bg-paper)] transition-all duration-200 hover:border-[var(--ds-border-hover)] focus-within:!border-[#632E9A] focus-within:!ring-4 focus-within:!ring-[#632E9A]/15 ${
          multiline ? "flex-wrap items-end gap-x-1.5 gap-y-1 px-3 py-1.5" : "items-end gap-2 px-3 py-2"
        }`}
      >
        <button
          type="button"
          aria-label="Add attachment"
          className={`flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)] ${
            multiline ? "order-2 mr-auto" : ""
          }`}
        >
          <Plus className="size-4" strokeWidth={1.5} />
        </button>
        <textarea
          ref={ref}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              setText("");
            }
          }}
          placeholder="Ask me anything..."
          className={`block min-w-0 resize-none bg-transparent text-[14px] leading-[1.5] text-[#333] outline-none placeholder:text-[#555] ${
            multiline ? "order-1 w-full basis-full px-2 pt-3 pb-1.5" : "flex-1 py-[5px]"
          }`}
          style={{ maxHeight: "140px", overflowY: "auto", boxSizing: "border-box" }}
        />
        {has ? (
          <button
            type="button"
            aria-label="Send message"
            onClick={() => setText("")}
            className={`flex size-7 shrink-0 items-center justify-center rounded-[6px] bg-[#632E9A] text-white transition-colors hover:bg-[#542584] active:bg-[#4A1F77] ${
              multiline ? "order-3" : ""
            }`}
          >
            <ArrowUp className="size-4" strokeWidth={2} />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Voice input"
            className={`flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[var(--ds-text-secondary)] transition-colors hover:bg-[var(--ds-bg-subtle)] hover:text-[var(--ds-text-ink)] ${
              multiline ? "order-3" : ""
            }`}
          >
            <Mic className="size-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Static state snapshots ── */
function RestComposer() {
  return (
    <Box>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px]" style={{ color: MUTED }}><Plus className="size-4" strokeWidth={1.5} /></span>
      <span className="flex-1 py-[5px] text-[14px] leading-[1.5]" style={{ color: "#555" }}>Ask me anything...</span>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px]" style={{ color: MUTED }}><Mic className="size-4" strokeWidth={1.5} /></span>
    </Box>
  );
}

function TypingComposer() {
  return (
    <Box focused>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px]" style={{ color: MUTED }}><Plus className="size-4" strokeWidth={1.5} /></span>
      <span className="flex-1 py-[5px] text-[14px] leading-[1.5]" style={{ color: INK }}>What scale are you working at?</span>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-white" style={{ backgroundColor: SEND }}><ArrowUp className="size-4" strokeWidth={2} /></span>
    </Box>
  );
}

function RecordingComposer() {
  return (
    <Box>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px]" style={{ color: MUTED }}><X className="size-4" strokeWidth={2} /></span>
      <div className="flex min-w-0 flex-1 items-center justify-center gap-[3px] overflow-hidden px-1 py-[5px]" style={{ minHeight: 28 }} aria-hidden>
        {WAVE.map((h, i) => (
          <span key={i} className="block w-px origin-center rounded-full" style={{ height: `${Math.round(h * 18)}px`, backgroundColor: ACCENT, animation: `wave-bar 1.6s ease-in-out ${i * 45}ms infinite` }} />
        ))}
      </div>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-white" style={{ backgroundColor: SEND }}><Square className="size-3" strokeWidth={0} fill="currentColor" /></span>
    </Box>
  );
}

function TranscribingComposer() {
  return (
    <Box>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px]" style={{ color: MUTED, opacity: 0.4 }}><Plus className="size-4" strokeWidth={1.5} /></span>
      <span className="flex-1 py-[5px] text-[14px] leading-[1.5]" style={{ color: "#555" }}>Transcribing…</span>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px]" style={{ color: MUTED }}><Loader2 className="size-4 animate-spin" strokeWidth={1.75} /></span>
    </Box>
  );
}

function MultilineComposer() {
  return (
    <div className="flex w-full flex-wrap items-end gap-x-1.5 gap-y-1 rounded-[12px] border px-3 py-1.5" style={{ borderColor: ACCENT, backgroundColor: PAPER, boxShadow: `0 0 0 4px rgba(99,46,154,0.15)` }}>
      <p className="order-1 w-full basis-full px-2 pt-3 pb-1.5 text-[14px] leading-[1.5]" style={{ color: INK }}>
        Can you walk me through how the analytics dashboard handles multiple agents and shared workspaces?
      </p>
      <span className="order-2 mr-auto flex size-7 shrink-0 items-center justify-center rounded-[6px]" style={{ color: MUTED }}><Plus className="size-4" strokeWidth={1.5} /></span>
      <span className="order-3 flex size-7 shrink-0 items-center justify-center rounded-[6px] text-white" style={{ backgroundColor: SEND }}><ArrowUp className="size-4" strokeWidth={2} /></span>
    </div>
  );
}

/* ── Files staged — picked files held in the composer before send ── */
function AttachedComposer() {
  return (
    <div className="w-full">
      <div className="flex w-full flex-col gap-2 rounded-[12px] border px-3 py-2" style={{ borderColor: ACCENT, backgroundColor: PAPER, boxShadow: "0 0 0 4px rgba(99,46,154,0.15)" }}>
        {/* attachment tray */}
        <div className="flex flex-wrap gap-2 px-1 pt-1">
          {/* image thumbnail */}
          <div className="relative size-14 shrink-0 overflow-hidden rounded-[8px] border" style={{ borderColor: LINE }}>
            <div className="flex size-full items-center justify-center" style={{ backgroundColor: "#FFFFFF" }}>
              <ImageIcon className="size-5" strokeWidth={1.75} style={{ color: MUTED }} />
            </div>
            <button type="button" aria-label="Remove" className="absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full bg-black/55 text-white">
              <X className="size-2.5" strokeWidth={2.5} />
            </button>
          </div>
          {/* pdf chip */}
          <div className="relative flex items-center gap-2 rounded-[8px] border bg-white py-2 pr-7 pl-2" style={{ borderColor: LINE }}>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[6px]" style={{ backgroundColor: "#E8F0FE", color: "#2563EB" }}>
              <FileText className="size-4" strokeWidth={1.75} />
            </span>
            <span className="flex flex-col">
              <span className="max-w-[120px] truncate text-[12px] font-medium" style={{ color: INK }}>Q3-report.pdf</span>
              <span className="text-[10px]" style={{ color: MUTED }}>240 KB</span>
            </span>
            <button type="button" aria-label="Remove" className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full" style={{ color: MUTED }}>
              <X className="size-3" strokeWidth={2} />
            </button>
          </div>
        </div>
        {/* input row */}
        <div className="flex w-full items-end gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px]" style={{ color: MUTED }}><Plus className="size-4" strokeWidth={1.5} /></span>
          <span className="flex-1 py-[5px] text-[14px] leading-[1.5]" style={{ color: INK }}>Here are the files —</span>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-white" style={{ backgroundColor: SEND }}><ArrowUp className="size-4" strokeWidth={2} /></span>
        </div>
      </div>
    </div>
  );
}

const ANATOMY = [
  { label: "Container", token: "rounded-[12px] · 1px --border-line · --bg-paper · items-end" },
  { label: "Attach button", token: "size-7 · rounded-[6px] · Plus · muted, subtle bg on hover" },
  { label: "Text field", token: "textarea · 14/1.5 · auto-grows to max-h 140px · placeholder #555" },
  { label: "Send / Mic", token: "size-7 · Mic at rest → ArrowUp (accent fill) when text present" },
  { label: "Focus ring", token: "border --accent + 4px accent/15 ring on focus-within" },
];

const SPECS = [
  { prop: "Radius", value: "rounded-[12px]", note: "Container" },
  { prop: "Fill", value: "#F9F3EA", note: "--bg-paper" },
  { prop: "Border (rest)", value: "1px #E0DAD3", note: "--border-line" },
  { prop: "Border (hover)", value: "1px #D8CFC0", note: "--border-hover" },
  { prop: "Border (focus)", value: "1px #632E9A + ring", note: "4px rgba(99,46,154,0.15)" },
  { prop: "Padding", value: "px-3 py-2", note: "py-1.5 when multi-line" },
  { prop: "Icon button", value: "size-7 · rounded-[6px]", note: "28px hit target" },
  { prop: "Send fill", value: "#632E9A → #542584", note: "--accent, darkens on hover" },
  { prop: "Text", value: "14 / 1.5 · #333333", note: "Placeholder #555" },
  { prop: "Max height", value: "140px", note: "Then scrolls internally" },
];

const STATES = [
  { name: "Rest", desc: "Empty field, placeholder, attach + mic. Neutral border." },
  { name: "Focused / typing", desc: "Accent border + ring; the mic flips to an accent send button once there's text." },
  { name: "Multi-line", desc: "Past one line the field reflows full-width on top, attach + send drop below." },
  { name: "Recording", desc: "Attach becomes cancel (X), the field becomes a live waveform, send becomes a stop square." },
  { name: "Transcribing", desc: "Field shows 'Transcribing…', a spinner replaces the action; controls disabled." },
  { name: "Files staged", desc: "Picked files sit in a tray above the input row — image thumbnails and file chips, each removable — until the message is sent." },
];

const DOS = [
  "Keep the field on --bg-paper so it reads as input, distinct from message bubbles.",
  "Flip mic → send only when there's trimmed text.",
  "Let the field grow to a few lines, then scroll internally.",
  "Show a clear stop control while recording.",
];

const DONTS = [
  "Don't put a filled send button at rest — it implies an empty send.",
  "Don't hide the attach affordance behind a menu for a single action.",
  "Don't let the composer grow unbounded — cap and scroll.",
  "Don't drop the focus ring; it anchors keyboard users.",
];

function Demo({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
      <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">{title}</p>
      {children}
    </div>
  );
}

export default function ComposerPage() {
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
            <span className="text-[12px] font-semibold text-[#333333]">Message Composer</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">
            Message Composer
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            The input bar, docked at the foot of the conversation. A paper field with an
            attach affordance and a single right-side action that shifts with intent —
            voice at rest, send once you type, stop while recording. It grows with the
            message, then holds.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Interactive */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Interactive</p>
            <div className="flex justify-center rounded-[14px] border bg-white p-8" style={{ borderColor: CHROME }}>
              <LiveComposer />
            </div>
            <p className="mt-2 text-[12px] text-[#979797]">Type a long message — past one line the field moves full-width on top and the buttons drop below. The mic flips to the accent send once there&apos;s text.</p>
          </section>

          {/* States */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">States</p>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Demo title="Rest"><RestComposer /></Demo>
              <Demo title="Focused / typing"><TypingComposer /></Demo>
              <Demo title="Recording"><RecordingComposer /></Demo>
              <Demo title="Transcribing"><TranscribingComposer /></Demo>
              <Demo title="Multi-line"><MultilineComposer /></Demo>
              <Demo title="Files staged"><AttachedComposer /></Demo>
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

          {/* State details */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">State details</p>
            <div className="divide-y rounded-[12px] border bg-white px-4 py-2" style={{ borderColor: CHROME }}>
              {STATES.map((s) => (
                <div key={s.name} className="flex items-baseline gap-4 py-2.5">
                  <span className="w-40 shrink-0 text-[12px] font-semibold text-[#333333]">{s.name}</span>
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
                  <span className="w-48 shrink-0 text-[12px] font-semibold text-[#333333]">{s.prop}</span>
                  <code className="w-56 shrink-0 font-mono text-[11px] text-[#333333]">{s.value}</code>
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
          <a href="/design-system/components/input-types" className="transition-colors hover:text-[#333333]">← Input Types</a>
          <span>Next: CSAT →</span>
        </footer>
      </main>
    </div>
  );
}
