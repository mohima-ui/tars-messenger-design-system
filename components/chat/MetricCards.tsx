"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useId } from "react";

/* Metric cards — a KPI row of stat tiles, plus one hero figure.

   Follows the stat-tile contract: label (sentence case, no trailing colon),
   value (semibold, pre-compacted), delta (signed, against a named period), and
   a sparkline.

   Three details worth keeping:
   • Delta colour is direction × whether up is good — a rising handle time is
     not a win, so `goodWhenUp: false` flips it. The arrow and sign carry the
     meaning too; colour is never the only channel.
   • The sparkline takes the delta's tone and fills to a soft gradient, so the
     shape and the number tell the same story rather than two.
   • Big numbers use proportional figures, not `tabular-nums` — tabular gives
     every digit a zero's width, which reads loose at display sizes. */

const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";
const FAINT = "#A8A096";
const GOOD = "#16A34A";
const BAD = "#C0392B";

export type Metric = {
  label: string;
  value: string;
  /** Signed change, e.g. "+12%". Omit for no delta row. */
  delta?: string;
  /** Names the comparison period, e.g. "vs last month". */
  period?: string;
  /** Set false where a fall is the win, to flip the delta colour. Left unset
      by default, so colour tracks direction: up green, down red. */
  goodWhenUp?: boolean;
  /** Points drawn as the area sparkline. */
  trend?: number[];
};

export type MetricData = {
  title?: string;
  /** Rendered large above the row — the one number the answer leads with. */
  hero?: Metric;
  metrics: Metric[];
};

/** Direction × whether up is good; null when flat. */
function toneOf(metric: Metric) {
  const d = metric.delta?.trim();
  if (!d) return null;
  if (d === "—" || d.startsWith("0")) return null;
  const up = d.startsWith("+");
  return up === (metric.goodWhenUp ?? true) ? GOOD : BAD;
}

function Delta({ metric }: { metric: Metric }) {
  if (!metric.delta) return null;
  const d = metric.delta.trim();
  const flat = d === "—" || d.startsWith("0");
  const up = d.startsWith("+");
  const tone = toneOf(metric);
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className="inline-flex items-center gap-0.5 text-[11.5px] font-semibold"
      style={{ color: tone ?? MUTED }}
    >
      <Icon className="size-3" strokeWidth={2.5} aria-hidden />
      {metric.delta}
    </span>
  );
}

/* Catmull-Rom through the points, converted to cubic béziers: a plain polyline
   kinks at every reading, which reads as noise rather than a trend. Tension is
   low so the curve stays honest — it eases the corners without inventing peaks
   between samples. */
const TENSION = 0.18;

function smooth(p: Array<{ x: number; y: number }>) {
  if (p.length < 3) return p.map((c, i) => `${i ? "L" : "M"}${c.x},${c.y}`).join(" ");
  let d = `M${p[0].x},${p[0].y}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) * TENSION;
    const c1y = p1.y + (p2.y - p0.y) * TENSION;
    const c2x = p2.x - (p3.x - p1.x) * TENSION;
    const c2y = p2.y - (p3.y - p1.y) * TENSION;
    d += ` C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }
  return d;
}

/** Area sparkline that bleeds to the card's edges. */
function Spark({ points, tone, height }: { points: number[]; tone: string; height: number }) {
  const id = useId();
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const step = 100 / (points.length - 1);
  const top = 3;
  const at = (v: number) => top + (1 - (v - min) / span) * (24 - top);

  const coords = points.map((p, i) => ({ x: i * step, y: at(p) }));
  const line = smooth(coords);
  const area = `${line} L100,26 L0,26 Z`;

  return (
    <svg
      viewBox="0 0 100 26"
      preserveAspectRatio="none"
      className="block w-full"
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.22" />
          <stop offset="100%" stopColor={tone} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={tone}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Card({ metric, hero = false }: { metric: Metric; hero?: boolean }) {
  const tone = toneOf(metric) ?? "var(--ds-accent)";

  return (
    <div
      className="flex flex-col overflow-hidden rounded-[12px] border bg-white"
      style={{ borderColor: LINE }}
    >
      <div className={hero ? "px-3 pb-2 pt-3" : "px-3 pb-2 pt-2.5"}>
        <p className="truncate text-[11.5px]" style={{ color: MUTED }}>
          {metric.label}
        </p>

        {/* value and delta share a line — the comparison belongs beside the
            number it qualifies, not stacked under it */}
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span
            className={`font-semibold leading-none tracking-tight ${hero ? "text-[32px]" : "text-[22px]"}`}
            style={{ color: INK }}
          >
            {metric.value}
          </span>
          <Delta metric={metric} />
          {metric.period && (
            <span className="text-[10.5px]" style={{ color: FAINT }}>
              {metric.period}
            </span>
          )}
        </div>
      </div>

      {metric.trend && (
        <div className="mt-auto">
          <Spark points={metric.trend} tone={tone} height={hero ? 46 : 34} />
        </div>
      )}
    </div>
  );
}

export function MetricCards({ data }: { data: MetricData }) {
  return (
    <div className="w-full min-w-0">
      {data.title && (
        <p className="mb-2 text-[12px] font-semibold" style={{ color: INK }}>
          {data.title}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {data.hero && <Card metric={data.hero} hero />}
        <div className="grid grid-cols-2 gap-2">
          {data.metrics.map((m) => (
            <Card key={m.label} metric={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
