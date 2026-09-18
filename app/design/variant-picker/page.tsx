"use client";

/* ── VARIANT — four palettes, laid out across ─────────────────────────────
   The stacked list gives each palette a 56px row: swatch, name, description,
   check. Four of those is 240px, and the description is the part doing the
   least work — nobody picks "Cool neutral grey" over "Warm sand" by reading.

   Across, the panel's 272px of usable width divided four ways is ~64px a
   card. That is the whole constraint: at 64px a card can hold a picture of
   the palette and a word, and nothing else. So the studies differ in what
   the picture is, and the description moves to one caption line under the
   row that speaks for whichever card is selected. ─────────────────────── */

import { useLayoutEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

const ACCENT = "#632E9A";

/* Light mode of each palette, read off NEUTRALS in app/design/page.tsx.
   Copied rather than imported because that lives in a route file — if the
   picker ships, both should read one exported source. */
type Variant = {
  id: string;
  name: string;
  note: string;
  canvas: string;
  paper: string;
  line: string;
  ink: string;
};

const VARIANTS: Variant[] = [
  {
    id: "light",
    name: "Neutral",
    note: "Clean monochrome",
    canvas: "#FFFFFF",
    paper: "#F2F2F2",
    line: "#E9EAEA",
    ink: "#16181D",
  },
  {
    id: "warm",
    name: "Beach",
    note: "Warm sand · default",
    canvas: "#FFFDFA",
    paper: "#F9F3EA",
    line: "#E0DAD3",
    ink: "#333333",
  },
  {
    id: "slate",
    name: "Slate",
    note: "Cool neutral grey",
    canvas: "#FCFCFD",
    paper: "#F1F2F4",
    line: "#DCDEE3",
    ink: "#2E3138",
  },
  {
    id: "midnight",
    name: "Midnight",
    note: "Deep blue-charcoal",
    canvas: "#FBFCFE",
    paper: "#EEF1F6",
    line: "#D7DCE5",
    ink: "#1F2430",
  },
];

/* ── shared chrome ─────────────────────────────────────────────────────── */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 text-[12px] font-medium text-[#555]">{children}</p>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[#F0F0F0] pb-3">
      <div className="flex items-center py-2.5">
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-[#9A9A9A]">
          {title}
        </span>
        <ChevronDown className="size-3.5 text-[#C0C0C0]" strokeWidth={2.5} />
      </div>
      <div className="pb-1">{children}</div>
    </section>
  );
}

function Measured({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setH(Math.round(e.contentRect.height)),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B0B0B0]">
          {label}
        </span>
        <span className="text-[10px] tabular-nums text-[#C8C8C8]">
          {h === null ? "—" : `${h}px`}
        </span>
      </div>
      <div ref={ref}>{children}</div>
    </div>
  );
}

function Panel({
  name,
  note,
  children,
}: {
  name: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-[320px] shrink-0">
      <h2 className="text-[15px] font-semibold text-[#222]">{name}</h2>
      <p className="mb-3 mt-1 min-h-[52px] text-[12px] leading-snug text-[#777]">
        {note}
      </p>
      {/* the real panel's gutters, so each row is measured at the width it
          will actually have */}
      <div className="rounded-2xl border border-[#E8E8E8] bg-white px-6 py-4 shadow-sm">
        {children}
      </div>
    </div>
  );
}

/* the caption that replaces four descriptions with one — it only ever needs
   to describe the palette you are on */
function Caption({ v }: { v: Variant }) {
  return (
    <p className="mt-2 text-[11px] leading-snug text-[#A8A8A8]">
      <span className="font-medium text-[#8A8A8A]">{v.name}</span> · {v.note}
    </p>
  );
}

/* a card's frame — selection is the same in every study, only the picture
   inside changes */
function Card({
  on,
  onClick,
  label,
  children,
}: {
  on: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`relative flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-1.5 transition-colors ${
        on
          ? "border-[#C4A9E8] bg-[#F8F4FF]"
          : "border-[#E5E5E5] hover:border-[#D5D5D5]"
      }`}
    >
      {children}
      <span
        className={`block w-full truncate text-center text-[10px] ${
          on ? "font-semibold text-[#6D33AA]" : "font-medium text-[#777]"
        }`}
      >
        {label}
      </span>
      {on && (
        <span
          className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full text-white shadow-sm"
          style={{ background: ACCENT }}
        >
          <Check className="size-2.5" strokeWidth={3.5} />
        </span>
      )}
    </button>
  );
}

/* ── 0 · the stacked list, for the height comparison ───────────────────── */

function Stacked() {
  const [sel, setSel] = useState("light");
  return (
    <Group title="Theme">
      <FieldLabel>Variant</FieldLabel>
      <div className="space-y-2">
        {VARIANTS.map((v) => {
          const on = sel === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setSel(v.id)}
              className={`flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors ${
                on
                  ? "border-[#C4A9E8] bg-[#F8F4FF]"
                  : "border-[#E5E5E5] hover:border-[#D5D5D5]"
              }`}
            >
              <Thread v={v} className="size-9 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-semibold text-[#333]">
                  {v.name}
                </span>
                <span className="block truncate text-[11px] text-[#999]">
                  {v.note}
                </span>
              </span>
              {on && (
                <span
                  className="grid size-4 shrink-0 place-items-center rounded-full text-white"
                  style={{ background: ACCENT }}
                >
                  <Check className="size-2.5" strokeWidth={3.5} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Group>
  );
}

/* ── the four pictures ─────────────────────────────────────────────────── */

/* A · a thread. Two bubbles on the palette's paper — the thing being themed,
   at the smallest size it still reads at. */
function Thread({ v, className = "" }: { v: Variant; className?: string }) {
  return (
    <span
      className={`flex flex-col justify-center gap-[3px] overflow-hidden rounded-[6px] p-1.5 ring-1 ring-black/5 ${className}`}
      /* paper is the ground rather than canvas: at 36px the four palettes are
         nearly identical in canvas and quite different in paper, so the tile
         is tinted by the value that actually distinguishes them */
      style={{ background: v.paper }}
    >
      {/* the agent's line, on the surface, with the palette's own hairline */}
      <span
        className="h-[5px] w-[72%] rounded-full"
        style={{ background: v.canvas, boxShadow: `inset 0 0 0 1px ${v.line}` }}
      />
      {/* the visitor's, in the tenant's accent */}
      <span
        className="h-[5px] w-[52%] self-end rounded-full"
        style={{ background: ACCENT }}
      />
      {/* and a mark in the palette's ink, the other value that separates them */}
      <span
        className="h-[3px] w-[38%] rounded-full opacity-70"
        style={{ background: v.ink }}
      />
    </span>
  );
}

/* B · the palette itself. Four bands in the order they stack in the UI —
   canvas behind paper behind line, with ink as the last, darkest band. */
function Bands({ v }: { v: Variant }) {
  return (
    <span className="flex h-9 w-full overflow-hidden rounded-[6px] ring-1 ring-black/5">
      {[v.canvas, v.paper, v.line, v.ink].map((c, i) => (
        <span key={i} className="h-full flex-1" style={{ background: c }} />
      ))}
    </span>
  );
}

/* C · one disc, split. Paper on one side, ink on the other — the contrast
   pair that actually distinguishes these four from each other. */
function Disc({ v }: { v: Variant }) {
  return (
    <span
      className="size-8 rounded-full ring-1 ring-black/10"
      /* a straight vertical split rather than a diagonal: on a disc this small
         a diagonal reads as a shape, and the two halves are meant to read as
         two colours */
      style={{ background: `linear-gradient(90deg, ${v.paper} 50%, ${v.ink} 50%)` }}
    />
  );
}

/* D · the card is the swatch. No inner tile: the palette's own canvas is the
   card's fill, and the name sits on it in the palette's own ink. */
function Fill({ v, on }: { v: Variant; on: boolean }) {
  return (
    <span
      className="flex h-[52px] w-full flex-col justify-end gap-[3px] rounded-[7px] p-1.5"
      style={{
        background: v.canvas,
        boxShadow: on ? `inset 0 0 0 1px ${v.line}` : `inset 0 0 0 1px ${v.line}`,
      }}
    >
      <span
        className="h-[5px] w-[65%] rounded-full"
        style={{ background: v.paper }}
      />
      <span
        className="h-[5px] w-[50%] self-end rounded-full"
        style={{ background: ACCENT, opacity: 0.85 }}
      />
      <span
        className="mt-0.5 block truncate text-[9px] font-semibold"
        style={{ color: v.ink }}
      >
        {v.name}
      </span>
    </span>
  );
}

/* ── the four studies ──────────────────────────────────────────────────── */

function Row({
  picture,
  labelled = true,
}: {
  picture: (v: Variant, on: boolean) => React.ReactNode;
  labelled?: boolean;
}) {
  const [sel, setSel] = useState("light");
  const current = VARIANTS.find((v) => v.id === sel)!;
  return (
    <Group title="Theme">
      <FieldLabel>Variant</FieldLabel>
      <div className="flex gap-1.5">
        {VARIANTS.map((v) =>
          labelled ? (
            <Card
              key={v.id}
              on={sel === v.id}
              onClick={() => setSel(v.id)}
              label={v.name}
            >
              {picture(v, sel === v.id)}
            </Card>
          ) : (
            <button
              key={v.id}
              onClick={() => setSel(v.id)}
              aria-pressed={sel === v.id}
              aria-label={v.name}
              className={`relative flex-1 rounded-xl border p-1 transition-colors ${
                sel === v.id
                  ? "border-[#C4A9E8] bg-[#F8F4FF]"
                  : "border-[#E5E5E5] hover:border-[#D5D5D5]"
              }`}
            >
              {picture(v, sel === v.id)}
              {sel === v.id && (
                <span
                  className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full text-white shadow-sm"
                  style={{ background: ACCENT }}
                >
                  <Check className="size-2.5" strokeWidth={3.5} />
                </span>
              )}
            </button>
          ),
        )}
      </div>
      <Caption v={current} />
    </Group>
  );
}

/* ── the studio ────────────────────────────────────────────────────────── */

export default function VariantStudies() {
  return (
    <main className="min-h-screen bg-[#F7F7F8] px-8 py-10">
      <header className="mb-8 max-w-[660px]">
        <p
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: ACCENT }}
        >
          Design panel · study
        </p>
        <h1 className="mt-1 text-[24px] font-semibold text-[#1A1A1A]">
          Variant, four across
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[#666]">
          Four cards in the panel’s 272px leaves each one about 64px wide —
          room for a picture of the palette and a word. The descriptions move
          to a single caption under the row, which only ever has to describe
          the one you are on.
        </p>
      </header>

      <div className="flex gap-6 overflow-x-auto pb-6">
        <Panel
          name="A · Thread thumbnail"
          note="Chosen. Each card shows a two-line thread on that palette — the thing being themed, not an abstraction of it."
        >
          <Measured label="Across">
            <Row picture={(v) => <Thread v={v} className="h-9 w-full" />} />
          </Measured>
        </Panel>

        <Panel
          name="0 · Stacked"
          note="Today. Four 56px rows, each carrying a description nobody reads to choose by."
        >
          <Measured label="Current">
            <Stacked />
          </Measured>
        </Panel>

        <Panel
          name="B · Palette bands"
          note="Canvas, paper, line, ink as four bands. Most literal — you are picking neutrals, so it shows the neutrals."
        >
          <Measured label="Across">
            <Row picture={(v) => <Bands v={v} />} />
          </Measured>
        </Panel>

        <Panel
          name="C · Split disc"
          note="Paper against ink in one disc — the contrast pair that actually tells these four apart. Lightest of the set."
        >
          <Measured label="Across">
            <Row picture={(v) => <Disc v={v} />} />
          </Measured>
        </Panel>

        <Panel
          name="D · Swatch is the card"
          note="No inner tile. The palette fills the card and the name sits on it, in that palette’s own ink."
        >
          <Measured label="Across">
            <Row
              labelled={false}
              picture={(v, on) => <Fill v={v} on={on} />}
            />
          </Measured>
        </Panel>
      </div>
    </main>
  );
}
