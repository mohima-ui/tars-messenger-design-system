"use client";

/* ─── Analytics — the pieces ──────────────────────────────────────────────
   Tiles, funnel, charts and table, built once and reused at all three scopes
   (fleet, customer, agent). The three screens differ in what they are counting,
   not in how a count is drawn — so a funnel that reads differently on the
   customer screen than on the fleet one would be a bug, not a design. */

import { useId, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CircleCheck,
  CircleSlash,
  Minus,
} from "lucide-react";

import { compact, full, pct, shortDate } from "./data";

/* One hue for magnitude, because every chart here is a single series: counts
   over time, or counts down a funnel. The two-colour pair is reserved for the
   A/B, the one place two things are genuinely being compared — blue and
   orange, which clear the colour-blind separation floors as a pair. */
export const SERIES = "#7C3AED";
export const SERIES_SOFT = "#EDE7FB";
export const AB = { composer: "#2a78d6", button: "#eb6834" };

/* Status is its own palette and never doubles as a series colour. Each one
   ships with an icon and a word — the colour is the third thing that says it,
   never the only one. */
const TONES = {
  good: { dot: "#0ca30c", bg: "#EDF7ED", ink: "#1B5E20", Icon: CircleCheck },
  warning: { dot: "#fab219", bg: "#FDF4E3", ink: "#6B4A05", Icon: AlertTriangle },
  critical: { dot: "#d03b3b", bg: "#FBEDED", ink: "#7F1D1D", Icon: AlertTriangle },
  idle: { dot: "#A1A1AA", bg: "#F4F4F6", ink: "#52525B", Icon: CircleSlash },
} as const;

export type Tone = keyof typeof TONES;

export function StatusChip({ tone, label }: { tone: Tone; label: string }) {
  const { bg, ink, Icon } = TONES[tone];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-[3px] text-[11.5px] font-medium"
      style={{ background: bg, color: ink }}
    >
      <Icon className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
      {label}
    </span>
  );
}

/* ── stat tile ──────────────────────────────────────────────────────────── */

/* The headline number, and what it was last period. A figure with no baseline
   is not a measurement — "7.0%" only becomes information beside the 6.4% it
   was, which is why the delta is part of the tile rather than a thing you go
   and look up. */
export function StatTile({
  label,
  value,
  delta,
  goodWhen = "up",
  note,
  muted,
}: {
  label: string;
  value: string;
  delta?: number;
  goodWhen?: "up" | "down";
  note?: string;
  muted?: boolean;
}) {
  const flat = delta === undefined || Math.abs(delta) < 0.005 || !isFinite(delta);
  const up = (delta ?? 0) > 0;
  const good = goodWhen === "up" ? up : !up;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="min-w-0 rounded-xl border border-[#EAEAEF] bg-white px-4 py-3.5">
      <div className="text-[11px] font-medium tracking-[0.06em] text-[#A1A1AA] uppercase">
        {label}
      </div>
      <div
        className={`mt-1.5 text-[26px] leading-none font-semibold tabular-nums ${
          muted ? "text-[#A1A1AA]" : "text-[#18181B]"
        }`}
      >
        {value}
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[11.5px]">
        {delta !== undefined && (
          <span
            className="inline-flex items-center gap-0.5 font-medium tabular-nums"
            style={{ color: flat ? "#71717A" : good ? "#1B5E20" : "#7F1D1D" }}
          >
            <Icon className="size-3.5" strokeWidth={2.2} aria-hidden />
            {flat ? "flat" : pct(Math.abs(delta), 1)}
          </span>
        )}
        <span className="truncate text-[#A1A1AA]">{note ?? "vs previous period"}</span>
      </div>
    </div>
  );
}

/* ── funnel ─────────────────────────────────────────────────────────────── */

export type Step = { label: string; value: number; hint: string };

/* Six bars, each a share of the first. The drop between two of them is the
   only thing anyone is here to see, so the step-to-step rate is printed in the
   gutter beside the bar rather than left to be worked out from two counts.

   Linear widths, not log: a funnel that flatters its own tail by rescaling it
   is the chart equivalent of a rounded-up number. If the last bar is a sliver,
   that is the finding. */
export function Funnel({
  steps,
  caption,
  /* What the first row converts from. The conversation half of the funnel
     starts from the last arrival step, which lives in the section above it —
     without this the first row would print "—" and the one number the two
     halves share would be missing. */
  baseline,
  /* Widths are a share of this rather than of the first step, so the arrival
     and conversation sections can be drawn to one scale when that comparison
     is meaningful, and to their own when it isn't. */
  scale,
}: {
  steps: Step[];
  caption?: string;
  baseline?: number;
  scale?: number;
}) {
  const top = scale || steps[0]?.value || 1;
  return (
    <div className="flex flex-col gap-2.5">
      {caption && (
        <div className="text-[10.5px] font-medium tracking-[0.08em] text-[#A1A1AA] uppercase">
          {caption}
        </div>
      )}
      {steps.map((s, i) => {
        const share = s.value / top;
        const prev = i === 0 ? (baseline ?? null) : steps[i - 1].value;
        const conv = prev ? s.value / (prev || 1) : null;
        return (
          <div key={s.label} className="group/step flex items-center gap-3">
            <div className="w-[104px] shrink-0 text-[12.5px] text-[#52525B]">{s.label}</div>
            <div className="relative h-7 min-w-0 flex-1 overflow-hidden rounded-[6px] bg-[#F5F4F8]">
              <div
                className="h-full rounded-[6px] transition-[width] duration-500"
                style={{
                  width: `${Math.max(share * 100, s.value > 0 ? 1.5 : 0)}%`,
                  /* One hue, stepping darker as the funnel narrows — the same
                     quantity getting scarcer, not six different things. */
                  background: `color-mix(in srgb, ${SERIES} ${52 + i * 9}%, white)`,
                }}
              />
              <span className="absolute inset-y-0 left-3 flex items-center text-[12px] font-medium text-[#18181B] tabular-nums mix-blend-normal">
                {full(s.value)}
              </span>
            </div>
            <div className="w-[92px] shrink-0 text-right text-[12px] tabular-nums text-[#71717A]">
              {conv === null ? "—" : pct(conv, 1)}
            </div>
            <div className="hidden w-[150px] shrink-0 text-[11.5px] text-[#A1A1AA] lg:block">
              {s.hint}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── trend ──────────────────────────────────────────────────────────────── */

/* null is a day the series does not cover — an arm of an A/B that started
   mid-window, an agent that went live on Tuesday. The line breaks there rather
   than being drawn to zero (which would read as a collapse) or being packed to
   the left (which would put Tuesday's number under Monday's tick). */
export type Series = {
  key: string;
  label: string;
  color: string;
  points: (number | null)[];
};

/* A line per series over the window, with a crosshair that reads the day under
   the pointer. Rates only, so every series on one chart shares one axis —
   plotting a 7% CTR against a 54% engagement rate would need two scales, and
   two scales on one chart is a picture that can be made to say anything. Two
   rates that far apart get two charts instead. */
export function Trend({
  dates,
  series,
  height = 168,
  format,
}: {
  dates: string[];
  series: Series[];
  height?: number;
  /* Rates unless told otherwise — the axis labels and the tooltip both read
     from this, so a chart of counts only has to say so once. */
  format?: (v: number) => string;
}) {
  const read = format ?? ((v: number) => pct(v, 1));
  const id = useId();
  const [at, setAt] = useState<number | null>(null);

  const W = 720;
  const H = height;
  const PAD = { t: 12, r: 10, b: 22, l: 40 };
  const inner = { w: W - PAD.l - PAD.r, h: H - PAD.t - PAD.b };

  const max =
    Math.max(
      ...series.flatMap((s) => s.points.filter((v): v is number => v !== null)),
      0.0001,
    ) * 1.15;
  const x = (i: number) => PAD.l + (dates.length === 1 ? inner.w / 2 : (i / (dates.length - 1)) * inner.w);
  const y = (v: number) => PAD.t + inner.h - (v / max) * inner.h;

  /* Three gridlines and nothing else. The grid is there to let someone read a
     height off the chart, not to draw a page of graph paper behind it. */
  const ticks = [0, max / 2, max];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={series.map((s) => s.label).join(" and ") + " over time"}
        onMouseLeave={() => setAt(null)}
        onMouseMove={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - box.left) / box.width) * W;
          const i = Math.round(((px - PAD.l) / inner.w) * (dates.length - 1));
          setAt(Math.max(0, Math.min(dates.length - 1, i)));
        }}
      >
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`${id}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>

        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y(t)}
              y2={y(t)}
              stroke="#EDEDF1"
              strokeWidth={1}
            />
            <text x={PAD.l - 8} y={y(t) + 4} textAnchor="end" fontSize={10} fill="#A1A1AA">
              {read(t)}
            </text>
          </g>
        ))}

        {series.map((s) => {
          /* One subpath per run of days the series covers, so a gap in the
             data is a gap in the line. */
          let pen = false;
          const line = s.points
            .map((v, i) => {
              if (v === null) {
                pen = false;
                return "";
              }
              const cmd = pen ? "L" : "M";
              pen = true;
              return `${cmd}${x(i)} ${y(v)}`;
            })
            .join(" ")
            .trim();
          const first = s.points.findIndex((v) => v !== null);
          const last = s.points.length - 1 - [...s.points].reverse().findIndex((v) => v !== null);
          const area = first < 0 ? "" : `${line} L${x(last)} ${y(0)} L${x(first)} ${y(0)} Z`;
          return (
            <g key={s.key}>
              {series.length === 1 && area && <path d={area} fill={`url(#${id}-${s.key})`} />}
              <path
                d={line}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}

        {at !== null && (
          <g>
            <line
              x1={x(at)}
              x2={x(at)}
              y1={PAD.t}
              y2={PAD.t + inner.h}
              stroke="#C9C9D2"
              strokeWidth={1}
            />
            {series.map((s) =>
              s.points[at] === null || s.points[at] === undefined ? null : (
                <circle
                  key={s.key}
                  cx={x(at)}
                  cy={y(s.points[at] as number)}
                  r={4.5}
                  fill={s.color}
                  stroke="white"
                  strokeWidth={2}
                />
              ),
            )}
          </g>
        )}

        {/* Ends of the window and the middle — a date under every point is a
            band of grey text, and nobody reads it. */}
        {[0, Math.floor(dates.length / 2), dates.length - 1].map((i) => (
          <text
            key={i}
            x={x(i)}
            y={H - 6}
            textAnchor={i === 0 ? "start" : i === dates.length - 1 ? "end" : "middle"}
            fontSize={10}
            fill="#A1A1AA"
          >
            {shortDate(dates[i])}
          </text>
        ))}
      </svg>

      {at !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 rounded-lg border border-[#EAEAEF] bg-white px-2.5 py-2 shadow-[0_8px_24px_-8px_rgba(15,17,26,0.25)]"
          style={{
            left: `${(x(at) / W) * 100}%`,
            transform: at > dates.length / 2 ? "translateX(-105%)" : "translateX(5%)",
          }}
        >
          <div className="text-[11px] font-medium text-[#71717A]">{shortDate(dates[at])}</div>
          {series.map((s) => (
            <div key={s.key} className="mt-1 flex items-center gap-1.5 text-[12px] whitespace-nowrap">
              <span className="size-2 rounded-full" style={{ background: s.color }} aria-hidden />
              <span className="text-[#52525B]">{s.label}</span>
              <span className="font-medium tabular-nums text-[#18181B]">
                {s.points[at] === null || s.points[at] === undefined
                  ? "—"
                  : read(s.points[at] as number)}
              </span>
            </div>
          ))}
        </div>
      )}

      {series.length > 1 && (
        <div className="mt-1 flex items-center gap-4 pl-10">
          {series.map((s) => (
            <span key={s.key} className="flex items-center gap-1.5 text-[11.5px] text-[#52525B]">
              <span className="size-2.5 rounded-full" style={{ background: s.color }} aria-hidden />
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* The same line at table scale — no axis, no labels, just the shape of the
   last N days so a row can be scanned rather than opened. */
export function Spark({ points, color = SERIES }: { points: number[]; color?: string }) {
  const W = 72;
  const H = 20;
  const max = Math.max(...points, 0.0001);
  const d = points
    .map((v, i) => `${i ? "L" : "M"}${(i / Math.max(1, points.length - 1)) * W} ${H - (v / max) * (H - 3) - 1.5}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden className="shrink-0">
      <path d={d} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── panel chrome ───────────────────────────────────────────────────────── */

export function Card({
  title,
  hint,
  right,
  children,
}: {
  title: string;
  hint?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#EAEAEF] bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[14px] font-semibold text-[#18181B]">{title}</h2>
          {hint && <p className="mt-0.5 text-[12px] text-[#A1A1AA]">{hint}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

/* Rates built on a handful of impressions are noise wearing a decimal point.
   The screen says which it is rather than printing the number and leaving
   someone to decide whether to believe it. */
export function NotEnough({ impressions, floor }: { impressions: number; floor: number }) {
  return (
    <div className="rounded-xl border border-dashed border-[#DFDFE6] bg-[#FBFBFC] px-4 py-6 text-center">
      <div className="text-[13px] font-medium text-[#52525B]">Not enough data yet</div>
      <p className="mx-auto mt-1 max-w-[420px] text-[12px] text-[#A1A1AA]">
        {full(impressions)} impressions in this window, against the {compact(floor)} this
        dashboard needs before a rate means anything. Rates are hidden rather than shown
        with a caveat.
      </p>
    </div>
  );
}
