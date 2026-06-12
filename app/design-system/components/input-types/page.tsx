"use client";

import { useState } from "react";
import { Star, MapPin, Search, Check, ChevronLeft, ChevronRight, Zap, Rocket } from "lucide-react";

const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const PAPER = "#F9F3EA";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT = "#632E9A";
const ACCENT_SOFT = "#F0E7FA";
const ACCENT_BORDER = "#C5A8E0";
const ACCENT_INK = "#4A1F77";

/* ── Buttons ── */
/* Quick-reply pill — suggestion chip; quiet by default, accent on hover. */
function Chip({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-full border px-3.5 py-1.5 text-[14px] whitespace-nowrap"
      style={{ backgroundColor: PAPER, borderColor: LINE, color: INK, transition: "background-color 150ms ease, border-color 150ms ease, color 150ms ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ACCENT_SOFT; e.currentTarget.style.borderColor = ACCENT_BORDER; e.currentTarget.style.color = ACCENT_INK; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = PAPER; e.currentTarget.style.borderColor = LINE; e.currentTarget.style.color = INK; }}
    >
      {label}
    </button>
  );
}

function ButtonsDemo() {
  return (
    <div className="flex w-full max-w-[340px] flex-col items-start gap-1.5">
      {["See a demo", "Compare plans", "What can it do?"].map((l) => (
        <Chip key={l} label={l} />
      ))}
    </div>
  );
}

/* ── Cards ── */
const CARDS = [
  { key: "starter", Icon: Zap, title: "Starter", desc: "1 agent · basic analytics", price: "$29/mo" },
  { key: "growth", Icon: Rocket, title: "Growth", desc: "5 agents · full analytics · API", price: "$79/mo" },
];

function CardsDemo() {
  const [selected, setSelected] = useState("growth");
  return (
    <div className="grid w-full max-w-[420px] grid-cols-2 gap-2.5">
      {CARDS.map(({ key, Icon, title, desc, price }) => {
        const on = selected === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => setSelected(key)}
            className="flex flex-col items-start gap-2 rounded-[12px] border p-3.5 text-left transition-all"
            style={{
              borderColor: on ? ACCENT_BORDER : LINE,
              backgroundColor: on ? ACCENT_SOFT : "#FFFFFF",
              boxShadow: on ? `inset 0 0 0 1px ${ACCENT_BORDER}` : undefined,
            }}
          >
            <span
              className="flex size-7 items-center justify-center rounded-full"
              style={{ backgroundColor: on ? "#FFFFFF" : PAPER, color: ACCENT }}
            >
              <Icon className="size-3.5" strokeWidth={2} />
            </span>
            <span className="text-[13px] font-semibold" style={{ color: on ? ACCENT_INK : INK }}>{title}</span>
            <span className="text-[11px] leading-snug" style={{ color: MUTED }}>{desc}</span>
            <span className="mt-0.5 text-[12px] font-semibold" style={{ color: INK }}>{price}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Calendar ── */
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const LEAD = 1; // June 2026 starts on a Monday
const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

function CalendarDemo() {
  const [selected, setSelected] = useState(9);
  return (
    <div className="w-full max-w-[280px] rounded-[12px] border bg-white p-3" style={{ borderColor: LINE }}>
      <div className="mb-2 flex items-center justify-between px-1">
        <button type="button" className="flex size-6 items-center justify-center rounded-[6px] transition-colors hover:bg-[#F9F3EA]" style={{ color: MUTED }}>
          <ChevronLeft className="size-4" strokeWidth={2} />
        </button>
        <span className="text-[13px] font-semibold" style={{ color: INK }}>June 2026</span>
        <button type="button" className="flex size-6 items-center justify-center rounded-[6px] transition-colors hover:bg-[#F9F3EA]" style={{ color: MUTED }}>
          <ChevronRight className="size-4" strokeWidth={2} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((d, i) => (
          <span key={i} className="flex h-7 items-center justify-center text-[10px] font-semibold" style={{ color: "#A8A096" }}>{d}</span>
        ))}
        {Array.from({ length: LEAD }).map((_, i) => <span key={`b${i}`} />)}
        {DAYS.map((d) => {
          const on = selected === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelected(d)}
              className="flex h-8 items-center justify-center rounded-full text-[12px] transition-colors"
              style={{
                backgroundColor: on ? ACCENT : "transparent",
                color: on ? "#FFFFFF" : INK,
                fontWeight: on ? 600 : 400,
              }}
              onMouseEnter={(e) => { if (!on) e.currentTarget.style.backgroundColor = PAPER; }}
              onMouseLeave={(e) => { if (!on) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Auto suggestion ── */
const SUGGESTIONS = ["San Francisco, CA", "San Francisco Bay Area", "San Fernando, CA", "Santa Fe, NM"];

function AutoSuggestDemo() {
  const query = "San F";
  return (
    <div className="w-full max-w-[320px]">
      <div className="flex items-center gap-2 rounded-[10px] border px-3 py-2.5" style={{ borderColor: ACCENT_BORDER, backgroundColor: "#FFFFFF" }}>
        <Search className="size-4 shrink-0" strokeWidth={2} style={{ color: MUTED }} />
        <span className="text-[14px]" style={{ color: INK }}>{query}</span>
        <span className="ml-0.5 inline-block h-[16px] w-px animate-pulse" style={{ backgroundColor: ACCENT }} />
      </div>
      <div className="mt-1.5 overflow-hidden rounded-[10px] border bg-white" style={{ borderColor: LINE }}>
        {SUGGESTIONS.map((s, i) => (
          <button
            key={s}
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors"
            style={{ color: INK, backgroundColor: i === 0 ? PAPER : "transparent" }}
          >
            <MapPin className="size-3.5 shrink-0" strokeWidth={2} style={{ color: MUTED }} />
            <span>
              <span className="font-semibold">{s.slice(0, query.length)}</span>
              {s.slice(query.length)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Star rating ── */
function StarRatingDemo() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const active = hover || rating;
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-[13px]" style={{ color: INK }}>How was your experience?</p>
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => {
          const filled = n <= active;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className="size-7"
                strokeWidth={1.75}
                style={{ color: filled ? ACCENT : LINE, fill: filled ? ACCENT : "transparent" }}
              />
            </button>
          );
        })}
      </div>
      <p className="text-[11px]" style={{ color: MUTED }}>{rating ? `You rated ${rating} / 5` : "Tap a star to rate"}</p>
    </div>
  );
}

/* ── Geo-location ── */
function GeoLocationDemo() {
  const [shared, setShared] = useState(false);
  return (
    <div className="flex flex-col items-start gap-2.5">
      {!shared ? (
        <button
          type="button"
          onClick={() => setShared(true)}
          className="inline-flex items-center gap-2 rounded-[10px] border px-3.5 py-2.5 text-[14px] font-medium transition-[filter] hover:brightness-[0.98]"
          style={{ borderColor: ACCENT_BORDER, backgroundColor: ACCENT_SOFT, color: ACCENT_INK }}
        >
          <MapPin className="size-4" strokeWidth={2} />
          Share my location
        </button>
      ) : (
        <div className="inline-flex items-center gap-2 rounded-[10px] border px-3.5 py-2.5 text-[13px]" style={{ borderColor: LINE, backgroundColor: "#FFFFFF", color: INK }}>
          <MapPin className="size-4 shrink-0" strokeWidth={2} style={{ color: ACCENT }} />
          <span>San Francisco, CA</span>
          <Check className="size-3.5" strokeWidth={2.5} style={{ color: "#16A34A" }} />
        </div>
      )}
      <p className="text-[11px]" style={{ color: MUTED }}>{shared ? "Location shared with the agent." : "Asks the browser for the user's location."}</p>
    </div>
  );
}

const SPECS = [
  { prop: "Radius (control)", value: "rounded-[10px]", note: "Buttons, inputs, geo" },
  { prop: "Radius (card / calendar)", value: "rounded-[12px]", note: "Selectable cards, date grid" },
  { prop: "Border (rest)", value: "1px #E0DAD3", note: "--border-line" },
  { prop: "Selected border", value: "1px #C5A8E0", note: "--accent-border" },
  { prop: "Selected fill", value: "#F0E7FA", note: "--accent-soft" },
  { prop: "Primary fill", value: "#632E9A", note: "--accent (filled buttons, selected day)" },
  { prop: "Selected text", value: "#4A1F77", note: "--accent-ink" },
  { prop: "Body text", value: "#333333", note: "--text-ink" },
  { prop: "Muted text", value: "#6E6E6E", note: "--text-secondary" },
];

const TYPES = [
  { name: "Buttons", desc: "Quick-reply chips for short, verb-led choices — quiet paper pills (14px) that lift to accent-soft fill + accent-ink text on hover. Stack vertically below the bubble." },
  { name: "Cards", desc: "Richer selectable options (icon, title, detail). Selected card lifts to accent-soft with an accent border." },
  { name: "Calendar", desc: "Inline month picker for scheduling. One selected day filled with accent; navigate by month." },
  { name: "Auto suggestion", desc: "Typeahead input with a results list below; the matched prefix is bolded, first row pre-highlighted." },
  { name: "Star rating", desc: "Five-star input for quick CSAT. Hover and selection fill with accent." },
  { name: "Geo-location", desc: "A single share button that resolves to a confirmed location chip once granted." },
];

const DOS = [
  "Use buttons for 2–4 short, mutually exclusive choices; cards when each option needs detail.",
  "Keep one accent-filled primary per group — everything else is outlined.",
  "Echo the chosen value back as a user bubble after selection.",
  "Pre-highlight the most likely auto-suggestion row.",
];

const DONTS = [
  "Don't mix more than one input type in a single prompt.",
  "Don't fill every button with accent — it removes the visual hierarchy.",
  "Don't ask for geo-location without explaining why it's needed.",
  "Don't leave a rating or calendar without a confirmation state.",
];

function Demo({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-1 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">{title}</p>
      <p className="mb-3 max-w-[560px] text-[13px] leading-relaxed text-[#555]">{desc}</p>
      <div className="flex justify-center rounded-[14px] border bg-white p-8" style={{ borderColor: CHROME }}>
        {children}
      </div>
    </section>
  );
}

export default function InputTypesPage() {
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
            <span className="text-[12px] font-semibold text-[#333333]">Input Types</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1080px] px-8 py-12">
        <div className="mb-12 max-w-[640px]">
          <p className="text-[11px] font-medium tracking-wider text-[#6E6E6E] uppercase">Component</p>
          <h1 className="mt-2 text-[32px] leading-tight font-semibold tracking-tight text-[#333333]">
            Input Types
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[#555]">
            Structured ways to collect a reply when free text is the slow path. Each type
            scaffolds the answer — a tap, a date, a rating — and shares the same beige
            surface, neutral borders, and single-accent selection treatment.
          </p>
        </div>

        <div className="flex flex-col gap-12">
          <Demo title="Buttons" desc="Quick-reply suggestion chips — quiet paper pills that lift to accent-soft fill + accent-ink text on hover.">
            <ButtonsDemo />
          </Demo>

          <Demo title="Cards" desc="Selectable option cards with an icon, title, and supporting detail. Click to select.">
            <CardsDemo />
          </Demo>

          <Demo title="Calendar" desc="Inline month picker for scheduling. Select a day; navigate by month.">
            <CalendarDemo />
          </Demo>

          <Demo title="Auto suggestion" desc="Typeahead input with a results list — the matched prefix is bolded.">
            <AutoSuggestDemo />
          </Demo>

          <Demo title="Star rating" desc="Five-star input for quick satisfaction capture. Hover and tap to set.">
            <StarRatingDemo />
          </Demo>

          <Demo title="Geo-location" desc="A single share button that resolves into a confirmed location chip. Click to share.">
            <GeoLocationDemo />
          </Demo>

          {/* Types overview */}
          <section>
            <p className="mb-3 text-[11px] font-semibold tracking-wider text-[#6E6E6E] uppercase">Types</p>
            <div className="divide-y rounded-[12px] border bg-white px-4 py-2" style={{ borderColor: CHROME }}>
              {TYPES.map((t) => (
                <div key={t.name} className="flex items-baseline gap-4 py-2.5">
                  <span className="w-36 shrink-0 text-[12px] font-semibold text-[#333333]">{t.name}</span>
                  <p className="text-[12px] leading-relaxed text-[#6E6E6E]">{t.desc}</p>
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
                  <span className="w-56 shrink-0 text-[12px] font-semibold text-[#333333]">{s.prop}</span>
                  <code className="w-48 shrink-0 font-mono text-[11px] text-[#333333]">{s.value}</code>
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
          <a href="/design-system/components/handoff" className="transition-colors hover:text-[#333333]">← Human Handoff</a>
          <a href="/design-system/components/composer" className="transition-colors hover:text-[#333333]">Message Composer →</a>
        </footer>
      </main>
    </div>
  );
}
