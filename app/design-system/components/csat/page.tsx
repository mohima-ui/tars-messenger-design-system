"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";

const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT = "#632E9A";
const ACCENT_INK = "#4A1F77";

const EMOJI = [
  { value: 1, emoji: "😞", label: "Very poor" },
  { value: 2, emoji: "😐", label: "Poor" },
  { value: 3, emoji: "🙂", label: "Okay" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "😍", label: "Excellent" },
];

/* in-thread notices */
function ClosedBanner() {
  return (
    <div className="flex justify-center py-1">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: MUTED }}>
        <Check className="size-3.5" strokeWidth={2.75} style={{ color: "#16A34A" }} />
        This conversation has been closed
      </span>
    </div>
  );
}

function ReopenedBanner() {
  return (
    <div className="flex justify-center py-1">
      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: MUTED }}>
        <RotateCcw className="size-3.5" strokeWidth={2.5} style={{ color: ACCENT }} />
        Conversation resumed
      </span>
    </div>
  );
}

/* The CSAT bar — emoji rating → labelless feedback → confirmation.
   Slides in to replace the composer once the conversation is resolved. */
function CsatFlow({ start = "rate" }: { start?: "rate" | "feedback" | "confirmed" }) {
  const [step, setStep] = useState<"rate" | "feedback" | "confirmed">(start);
  const [value, setValue] = useState<number | null>(start === "rate" ? null : 4);
  const [hover, setHover] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const active = hover ?? value;
  const chosen = EMOJI.find((e) => e.value === value);

  const reset = () => { setStep("rate"); setValue(null); setComment(""); };

  const chatWithUs = (
    <p className="mt-2.5 border-t pt-2.5 text-center text-[12px]" style={{ borderColor: LINE, color: MUTED }}>
      Still have an issue?{" "}
      <button type="button" onClick={reset} className="font-semibold transition-colors hover:underline" style={{ color: ACCENT }}>Chat with us</button>
    </p>
  );

  return (
    <div className="rounded-[12px] border px-4 pb-2.5 pt-3" style={{ borderColor: LINE, backgroundColor: "#FEFCF8" }}>
      {step === "confirmed" ? (
        <>
          <div className="flex flex-col items-center gap-2 py-3">
            <span className="relative flex size-12 items-center justify-center rounded-full text-[28px]" style={{ backgroundColor: "#F0E7FA" }}>
              {chosen?.emoji}
              <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border-2" style={{ backgroundColor: "#16A34A", borderColor: "#FEFCF8" }}>
                <Check className="size-3 text-white" strokeWidth={3} />
              </span>
            </span>
            <div className="flex flex-col items-center gap-0.5">
              <p className="text-[13px] font-semibold" style={{ color: INK }}>Thanks for your feedback!</p>
              <p className="text-[11px]" style={{ color: MUTED }}>Your response helps us improve.</p>
            </div>
          </div>
          {chatWithUs}
        </>
      ) : (
        <>
          <p className="text-center text-[13px] font-semibold" style={{ color: INK }}>How was your conversation experience with us?</p>
          <div className="mt-2 flex items-start justify-center gap-1" onMouseLeave={() => setHover(null)}>
            {EMOJI.map((e) => (
              <button key={e.value} type="button" aria-label={e.label}
                onMouseEnter={() => setHover(e.value)}
                onClick={() => { setValue(e.value); setStep("feedback"); }}
                className="flex flex-col items-center gap-0.5">
                <span className="flex size-12 items-center justify-center rounded-full transition-colors" style={{ backgroundColor: active === e.value ? "#F0E7FA" : "transparent" }}>
                  <span className="text-[30px] transition-all duration-200" style={{ filter: active === e.value ? "none" : "grayscale(1)", transform: active === e.value ? "scale(1.1)" : "none" }}>{e.emoji}</span>
                </span>
                <span className="text-[10px] font-medium whitespace-nowrap transition-opacity" style={{ color: ACCENT_INK, opacity: active === e.value ? 1 : 0 }}>{e.label}</span>
              </button>
            ))}
          </div>

          {step === "rate" ? (
            chatWithUs
          ) : (
            <div className="mt-1 flex flex-col gap-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Let us know how we can improve…"
                className="w-full resize-none rounded-[10px] border bg-white px-3 py-2 text-[13px] leading-snug outline-none transition-colors placeholder:text-[#979797] focus:border-[#632E9A]"
                style={{ color: INK, borderColor: LINE, maxHeight: 110 }}
              />
              <button type="button" onClick={() => setStep("confirmed")}
                className="w-full rounded-full py-2.5 text-[13px] font-semibold text-white transition-[filter] hover:brightness-105" style={{ backgroundColor: ACCENT }}>
                Submit Feedback
              </button>
              <button type="button" onClick={() => setStep("confirmed")}
                className="text-center text-[12px] font-medium transition-colors hover:underline" style={{ color: MUTED }}>
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const ANATOMY = [
  { label: "Trigger", token: "Conversation resolved → composer is swapped for the CSAT bar" },
  { label: "Closed notice", token: "In-thread line · green check · 'This conversation has been closed'" },
  { label: "Prompt", token: "13 · 600 · centered — 'How was your conversation experience with us?'" },
  { label: "Emoji scale", token: "5 faces · size-12 · grayscale → color + 1.1x · per-emoji label on hover" },
  { label: "Feedback", token: "Labelless textarea (rows 3) appears once a face is picked" },
  { label: "Actions", token: "Submit Feedback (accent pill) + Cancel (text)" },
  { label: "Confirmation", token: "Chosen emoji + green check badge · 'Thanks for your feedback!'" },
  { label: "Chat with us", token: "'Still have an issue? Chat with us' → reopens composer + 'Conversation resumed'" },
];

const SPECS = [
  { prop: "Container", value: "border-t · px-4 · #FEFCF8", note: "Replaces the composer at the foot" },
  { prop: "Entrance", value: "csat-slide-up 380ms", note: "Slides up; chat scrolls to keep last message in view" },
  { prop: "Emoji", value: "size-12 · 30px glyph", note: "Greyscale at rest, color + 1.1x on hover/select" },
  { prop: "Active emoji bg", value: "#F0E7FA", note: "--accent-soft circle" },
  { prop: "Per-emoji label", value: "10 · 500 · #4A1F77", note: "Under its own emoji, opacity 0 → 1 on hover" },
  { prop: "Textarea", value: "rows 3 · rounded-[10px]", note: "No label; focus border --accent" },
  { prop: "Submit", value: "rounded-full · #632E9A", note: "Full-width accent pill" },
  { prop: "Cancel", value: "text · muted", note: "Both Submit & Cancel reach the confirmation" },
  { prop: "Confirmation badge", value: "size-5 · #16A34A check", note: "On the chosen emoji" },
  { prop: "Notices", value: "no fill · icon + text", note: "Green check (closed) · accent rotate (resumed)" },
];

const STATES = [
  { name: "Closed", desc: "An in-thread line marks the conversation closed; the CSAT bar slides up in place of the composer." },
  { name: "Rate", desc: "Prompt + 5 faces. Hovering a face un-greyscales it and reveals its label directly beneath it." },
  { name: "Feedback", desc: "Picking a face grows the frame: a labelless textarea slides in with Submit Feedback + Cancel; the chat scrolls up." },
  { name: "Confirmed", desc: "Submit or Cancel collapses to the chosen emoji with a green check and a thank-you." },
  { name: "Resumed", desc: "'Chat with us' restores the composer and drops a 'Conversation resumed' line into the thread." },
];

const DOS = [
  "Ask once, the moment the conversation is resolved — never mid-chat.",
  "Keep the comment optional — Submit and Cancel both close it out.",
  "Let the frame grow and scroll the thread so the last message stays visible.",
  "Offer a way back into the conversation ('Chat with us').",
];

const DONTS = [
  "Don't block on a written comment — the rating is the signal.",
  "Don't fill the closed/resumed notices — they're quiet in-thread lines.",
  "Don't trigger CSAT every session — it trains users to dismiss it.",
  "Don't show a modal — the rating lives inline, in place of the composer.",
];

export default function CsatPage() {
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
            <span className="text-[12px] font-semibold text-[#333333]">CSAT</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">CSAT</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            After the conversation is resolved, the composer is swapped for an emoji rating that
            slides up from the bottom. Pick a face and an optional comment box grows in. Quiet,
            inline, never a modal — and a way back into the chat if anything&apos;s unresolved.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Interactive */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Interactive</p>
            <div className="flex justify-center rounded-[14px] border bg-white p-8" style={{ borderColor: CHROME }}>
              <div className="w-full max-w-[380px]">
                <ClosedBanner />
                <div className="mt-1"><CsatFlow /></div>
              </div>
            </div>
            <p className="mt-2 text-[12px] text-[#979797]">Tap a face → the feedback box grows in. Submit or Cancel to confirm; &quot;Chat with us&quot; replays.</p>
          </section>

          {/* States */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">States</p>
            <div className="grid grid-cols-1 gap-3 rounded-[14px] border bg-white p-6 lg:grid-cols-3" style={{ borderColor: CHROME }}>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Rate</p>
                <CsatFlow start="rate" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Feedback</p>
                <CsatFlow start="feedback" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Confirmed</p>
                <CsatFlow start="confirmed" />
              </div>
            </div>
          </section>

          {/* Thread notices */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Thread notices</p>
            <div className="grid grid-cols-1 gap-3 rounded-[14px] border bg-white p-6 lg:grid-cols-2" style={{ borderColor: CHROME }}>
              <div className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Closed</p>
                <ClosedBanner />
              </div>
              <div className="flex flex-col gap-2 rounded-[10px] border bg-white p-4" style={{ borderColor: CHROME }}>
                <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Resumed</p>
                <ReopenedBanner />
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

          {/* States detail */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">State details</p>
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
          <a href="/design-system/components/composer" className="transition-colors hover:text-[#333333]">← Message Composer</a>
          <a href="/design-system/components/error" className="transition-colors hover:text-[#333333]">Error →</a>
        </footer>
      </main>
    </div>
  );
}
