"use client";

import { useState } from "react";

const LINE = "#E0DAD3";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT_SOFT = "#E0E5FA";
const ACCENT_BORDER = "#A5B0EE";
const ACCENT_INK = "#0A06A0";
const SUCCESS_SOFT = "#E8F5EC";
const SUCCESS_INK = "#0F7A38";

const EMOJI_SCALE = [
  { value: 1, emoji: "😞", label: "Very poor" },
  { value: 2, emoji: "😐", label: "Poor" },
  { value: 3, emoji: "🙂", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "😍", label: "Excellent" },
];

function EmojiRating({ static_value }: { static_value?: number }) {
  const [value, setValue] = useState<number | null>(static_value ?? null);
  return (
    <div
      className="flex flex-col gap-3 rounded-[12px] border bg-white p-4"
      style={{ borderColor: LINE }}
    >
      {value === null ? (
        <>
          <p className="text-[12px] font-semibold text-[#333333]">
            How was your experience?
          </p>
          <div className="flex items-center justify-between gap-1">
            {EMOJI_SCALE.map((e) => (
              <button
                key={e.value}
                type="button"
                onClick={() => setValue(e.value)}
                className="group flex flex-col items-center gap-1 rounded-[8px] p-2 transition-colors hover:bg-[#F0EBE0]"
                aria-label={e.label}
              >
                <span className="text-[22px] grayscale transition-all duration-200 group-hover:grayscale-0 group-hover:scale-110">
                  {e.emoji}
                </span>
                <span className="text-[9px] font-medium text-[#979797] group-hover:text-[#333333]">
                  {e.label}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-start gap-3">
          <span className="text-[22px]">
            {EMOJI_SCALE.find((e) => e.value === value)?.emoji}
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="text-[12px] font-semibold text-[#333333]">
              Thanks for letting us know.
            </p>
            <p className="text-[11px] text-[#6E6E6E]">
              {EMOJI_SCALE.find((e) => e.value === value)?.label} — anything
              specific you&apos;d like to share?
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ThumbsRating({ static_value }: { static_value?: "up" | "down" }) {
  const [value, setValue] = useState<"up" | "down" | null>(static_value ?? null);
  return (
    <div
      className="flex flex-col gap-3 rounded-[12px] border bg-white p-4"
      style={{ borderColor: LINE }}
    >
      <p className="text-[12px] font-semibold text-[#333333]">
        Did that help?
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setValue("up")}
          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors ${
            value === "up"
              ? "border-[#A5B0EE] bg-[#E0E5FA] text-[#0A06A0]"
              : "border-[#E0DAD3] bg-white text-[#333333] hover:border-[#A5B0EE] hover:bg-[#E0E5FA]"
          }`}
        >
          👍 Yes
        </button>
        <button
          type="button"
          onClick={() => setValue("down")}
          className={`flex items-center gap-2 rounded-full border px-4 py-1.5 text-[12px] font-medium transition-colors ${
            value === "down"
              ? "border-[#A5B0EE] bg-[#E0E5FA] text-[#0A06A0]"
              : "border-[#E0DAD3] bg-white text-[#333333] hover:border-[#A5B0EE] hover:bg-[#E0E5FA]"
          }`}
        >
          👎 Not really
        </button>
      </div>
    </div>
  );
}

function NumericRating() {
  const [value, setValue] = useState<number | null>(null);
  return (
    <div
      className="flex flex-col gap-3 rounded-[12px] border bg-white p-4"
      style={{ borderColor: LINE }}
    >
      <p className="text-[12px] font-semibold text-[#333333]">
        Rate your conversation
      </p>
      <div className="flex items-center justify-between gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setValue(n)}
            className={`flex size-9 items-center justify-center rounded-full border text-[13px] font-semibold transition-colors ${
              value === n
                ? "border-[#A5B0EE] bg-[#E0E5FA] text-[#0A06A0]"
                : "border-[#E0DAD3] bg-white text-[#333333] hover:border-[#A5B0EE] hover:bg-[#E0E5FA]"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-[#979797]">
        <span>Not great</span>
        <span>Loved it</span>
      </div>
    </div>
  );
}

function Confirmed() {
  return (
    <div
      className="flex items-center gap-2.5 rounded-[12px] border p-3"
      style={{ borderColor: "#C2E8CF", backgroundColor: SUCCESS_SOFT }}
    >
      <span
        className="inline-flex size-5 items-center justify-center rounded-full text-[11px] font-bold text-white"
        style={{ backgroundColor: SUCCESS_INK }}
      >
        ✓
      </span>
      <p className="text-[12px] font-medium" style={{ color: SUCCESS_INK }}>
        Thanks — your feedback is in.
      </p>
    </div>
  );
}

const ANATOMY = [
  { label: "Prompt", token: "12 / 18 · 600 ink — leads with a single question" },
  { label: "Scale", token: "5-emoji · 5-number · or binary thumbs" },
  { label: "Selection state", token: "accent-soft fill · accent-border · accent-ink text" },
  { label: "Confirmation", token: "Success-soft card with check — replaces or sits below the rating" },
];

const SPECS = [
  { prop: "Card bg", value: "#FFFFFF", note: "--bg-surface" },
  { prop: "Card border", value: "1px #E0DAD3", note: "--border-line" },
  { prop: "Prompt", value: "12 / 18 · 600 ink", note: "Lead with the question" },
  { prop: "Emoji size", value: "22px", note: "Greyscale at rest, color on hover/select" },
  { prop: "Number button", value: "size-9 · rounded-full", note: "Same circle treatment as avatars" },
  { prop: "Thumb pill", value: "rounded-full · px-4 py-1.5", note: "Inherits Suggested Reply chip pattern" },
  { prop: "Active fill", value: "#E0E5FA", note: "--accent-soft" },
  { prop: "Active border", value: "1px #A5B0EE", note: "--accent-border" },
  { prop: "Active text", value: "#0A06A0", note: "--accent-ink" },
  { prop: "Confirmation", value: "Success soft + ink", note: "Semantic success palette" },
];

const STATES = [
  { name: "Rest", desc: "Prompt + all options visible. No selection." },
  { name: "Hover", desc: "Option lifts to --accent-soft fill, border --accent-border. Emoji un-greyscales and scales 1.1x." },
  { name: "Selected", desc: "Option pinned in accent-soft. Prompt swaps to a thank-you + optional follow-up question." },
  { name: "Confirmed", desc: "Success-soft chip with check replaces the rating once feedback is committed." },
];

const VARIANTS_DETAIL = [
  {
    name: "Emoji scale",
    when: "End of a multi-turn conversation. Capture nuance.",
    not: "Don't use for single-question replies — too heavy.",
  },
  {
    name: "Binary thumbs",
    when: "Right after a single AI answer. Lightweight check.",
    not: "Don't use as an end-of-session survey — too thin.",
  },
  {
    name: "Numeric 1–5",
    when: "When you want a clean number for the CRM. Familiar pattern.",
    not: "Avoid 1–10 — labels become noisy in narrow widget width.",
  },
];

const DOS = [
  "Ask once, at a natural ending — never mid-conversation.",
  "Confirm the rating with a soft success state, not a modal.",
  "Make the optional comment really optional — never block on it.",
];

const DONTS = [
  "Don't auto-trigger CSAT every session — it trains users to dismiss it.",
  "Don't grey-out the chosen option — keep it active and visible.",
  "Don't reuse the brand --accent solid here — accent-soft only.",
];

function StateRow({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="flex items-baseline gap-4 py-2.5">
      <span className="w-32 shrink-0 text-[12px] font-semibold text-[#333333]">{name}</span>
      <p className="text-[12px] leading-relaxed text-[#6E6E6E]">{desc}</p>
    </div>
  );
}

export default function CsatPage() {
  return (
    <div className="min-h-screen bg-[#FFFDFA]">
      <header className="sticky top-0 z-10 border-b border-[#E0DAD3] bg-[#FFFDFA]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between px-8 py-4">
          <div className="flex items-baseline gap-3">
            <a href="/design-system" className="text-[12px] text-[#6E6E6E] transition-colors hover:text-[#333333]">
              ← Foundation
            </a>
            <span className="text-[#D9D5CC]">/</span>
            <span className="text-[12px] font-medium text-[#333333]">Components</span>
            <span className="text-[#D9D5CC]">/</span>
            <span className="text-[12px] font-semibold text-[#333333]">CSAT</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">CSAT</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            Inline rating at the close of a conversation. Three formats — pick the lightest
            one that gets the signal you need. Always confirm gently and never block on a
            comment.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Variants */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Variants</p>
            <div className="grid grid-cols-1 gap-3 rounded-[14px] border bg-[#FAF6EE] p-6 lg:grid-cols-3" style={{ borderColor: LINE }}>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Emoji scale</p>
                <EmojiRating />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Binary thumbs</p>
                <ThumbsRating />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Numeric 1–5</p>
                <NumericRating />
              </div>
            </div>
          </section>

          {/* States */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Selected + confirmed</p>
            <div className="grid grid-cols-1 gap-3 rounded-[14px] border bg-[#FAF6EE] p-6 lg:grid-cols-2" style={{ borderColor: LINE }}>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Selected</p>
                <EmojiRating static_value={4} />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Confirmed</p>
                <Confirmed />
              </div>
            </div>
          </section>

          {/* Variant guidance */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">When to use which</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: LINE }}>
              <div className="grid grid-cols-3 gap-4 bg-[#F9F3EA] px-4 py-2.5">
                <span className="text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Variant</span>
                <span className="text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">When</span>
                <span className="text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Not when</span>
              </div>
              {VARIANTS_DETAIL.map((v) => (
                <div key={v.name} className="grid grid-cols-3 gap-4 px-4 py-3">
                  <span className="text-[12px] font-semibold text-[#333333]">{v.name}</span>
                  <span className="text-[12px] text-[#6E6E6E]">{v.when}</span>
                  <span className="text-[12px] text-[#6E6E6E]">{v.not}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Anatomy */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Anatomy</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: LINE }}>
              {ANATOMY.map((a, i) => (
                <div key={a.label} className="flex items-baseline gap-4 px-4 py-3">
                  <span className="w-6 font-mono text-[11px] text-[#979797]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="w-56 shrink-0 text-[12px] font-semibold text-[#333333]">{a.label}</span>
                  <span className="text-[11px] text-[#6E6E6E]">{a.token}</span>
                </div>
              ))}
            </div>
          </section>

          {/* States */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">States</p>
            <div className="divide-y rounded-[12px] border bg-white px-4 py-2" style={{ borderColor: LINE }}>
              {STATES.map((s) => (
                <StateRow key={s.name} name={s.name} desc={s.desc} />
              ))}
            </div>
          </section>

          {/* Specs */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Specs</p>
            <div className="flex flex-col divide-y overflow-hidden rounded-[12px] border bg-white" style={{ borderColor: LINE }}>
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
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: LINE }}>
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
              <div className="rounded-[12px] border bg-white p-4" style={{ borderColor: LINE }}>
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

        <footer className="mt-20 flex items-center justify-between border-t pt-8 pb-12 text-[12px] text-[#979797]" style={{ borderColor: LINE }}>
          <a href="/design-system/components/handoff" className="transition-colors hover:text-[#333333]">← Human Handoff</a>
          <a href="/design-system/components/error" className="transition-colors hover:text-[#333333]">Error →</a>
        </footer>
      </main>
    </div>
  );
}
