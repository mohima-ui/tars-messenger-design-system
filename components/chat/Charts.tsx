"use client";

import { useRef, useState } from "react";

/* Chart set for the thread — column, line, bar, donut and pie.

   Colour follows the data's job, not the chart type:
   • Magnitude and trend (column, line, bar) are ONE hue — single-series, so they
     also carry no legend; the title names what's plotted.
   • Part-to-whole (donut, pie) is categorical, using slots 1–3 of the validated
     default palette with the tail folded into a neutral "Other" — slot 4 puts
     yellow beside orange and fails the all-pairs gate.

   Palette validated with scripts/validate_palette.js --mode light: all checks
   pass, with one contrast WARN on aqua, so every segment carries a visible
   direct label (the documented relief). Light-only, matching the messenger — a
   dark theme needs these re-stepped and re-validated, not flipped. */

const SURFACE = "#FFFFFF";
const INK = "#333333";
const MUTED = "#6E6E6E";
const FAINT = "#A8A096";
const GRID = "#EBE3D4";

const SERIES = {
  blue: "#2a78d6",
  orange: "#eb6834",
  aqua: "#1baf7a",
  other: "#B6AFA3",
};
export const CHART_COLORS = SERIES;

/** Mark specs, fixed across every chart here. */
const MARK = {
  /** ≤24px — never fill the band; the leftover is air. */
  thickness: 20,
  /** Rounded at the data end, square at the baseline. */
  radius: 4,
  /** 2px of surface separates touching marks. */
  gap: 2,
  line: 2,
  marker: 4.5,
};

export type Segment = { label: string; value: number; color: string };
export type Point = { label: string; value: number };

export type ChartData = {
  column: { title: string; unit: string; points: Point[] };
  line: { title: string; unit: string; points: Point[]; suffix?: string };
  bar: { title: string; unit: string; points: Point[]; suffix?: string };
  donut: { title: string; total: string; unit: string; segments: Segment[] };
  pie: { title: string; segments: Segment[] };
};

/* ── shared ────────────────────────────────────────────────────────────── */

function Panel({
  title,
  unit,
  children,
}: {
  title: string;
  unit?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-[12px] border p-3"
      style={{ borderColor: GRID, backgroundColor: SURFACE }}
    >
      <p className="text-[12px] font-semibold" style={{ color: INK }}>
        {title}
      </p>
      {unit && (
        <p className="text-[10.5px]" style={{ color: FAINT }}>
          {unit}
        </p>
      )}
      <div className="mt-2">{children}</div>
    </section>
  );
}

type Tip = { x: number; y: number; label: string; value: number };

/** Per-mark tooltip — the hover layer the method expects on every chart. */
function Tooltip({ tip }: { tip: Tip | null }) {
  if (!tip) return null;
  return (
    <div
      className="pointer-events-none absolute z-10 whitespace-nowrap rounded-[8px] border px-2 py-1 text-[11px]"
      style={{
        left: tip.x,
        top: tip.y,
        transform: "translate(-50%, -130%)",
        borderColor: GRID,
        backgroundColor: SURFACE,
        boxShadow: "0 4px 12px -3px rgba(0,0,0,0.10)",
        color: INK,
      }}
    >
      <span style={{ color: MUTED }}>{tip.label}</span>{" "}
      <span className="font-semibold tabular-nums">{tip.value}%</span>
    </div>
  );
}

/** Tracks pointer position within a chart panel for the tooltip. */
function useTip() {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const track = (e: React.MouseEvent, label: string, value: number) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    setTip({ x: e.clientX - box.left, y: e.clientY - box.top, label, value });
  };
  return { ref, tip, track, clear: () => setTip(null) };
}

/** Legend rows double as the direct labels the contrast WARN requires. */
function Legend({
  segments,
  active,
  onActive,
}: {
  segments: Segment[];
  active: string | null;
  onActive: (s: string | null) => void;
}) {
  return (
    <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
      {segments.map((s) => (
        <li
          key={s.label}
          className="flex items-center gap-2"
          onMouseEnter={() => onActive(s.label)}
          onMouseLeave={() => onActive(null)}
          style={{ opacity: active && active !== s.label ? 0.5 : 1, transition: "opacity 150ms" }}
        >
          <span
            className="size-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: s.color }}
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate text-[11.5px]" style={{ color: MUTED }}>
            {s.label}
          </span>
          <span className="text-[11.5px] font-semibold tabular-nums" style={{ color: INK }}>
            {s.value}%
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ── donut ─────────────────────────────────────────────────────────────── */

const R = 52;
const STROKE = 18;
const CIRC = 2 * Math.PI * R;

function Donut({ data }: { data: ChartData["donut"] }) {
  const [active, setActive] = useState<string | null>(null);
  const { ref, tip, track, clear } = useTip();
  const total = data.segments.reduce((n, s) => n + s.value, 0);
  const hovered = data.segments.find((s) => s.label === active);

  type Arc = Segment & { len: number; offset: number; share: number };
  const arcs = data.segments.reduce<Arc[]>((acc, s) => {
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.share : 0;
    const share = (s.value / total) * CIRC;
    return [...acc, { ...s, len: Math.max(0, share - MARK.gap), offset, share }];
  }, []);

  return (
    <div ref={ref} className="relative flex items-center gap-3">
      <svg
        width={112}
        height={112}
        viewBox="0 0 124 124"
        className="shrink-0"
        role="img"
        aria-label={`${data.title}: ${data.segments.map((s) => `${s.label} ${s.value}%`).join(", ")}`}
      >
        <g transform="translate(62 62) rotate(-90)">
          {arcs.map((a) => (
            <circle
              key={a.label}
              r={R}
              fill="none"
              stroke={a.color}
              strokeWidth={STROKE}
              strokeDasharray={`${a.len} ${CIRC - a.len}`}
              strokeDashoffset={-a.offset}
              opacity={active && active !== a.label ? 0.35 : 1}
              style={{ transition: "opacity 150ms" }}
              onMouseEnter={() => setActive(a.label)}
              onMouseMove={(e) => track(e, a.label, a.value)}
              onMouseLeave={() => {
                setActive(null);
                clear();
              }}
            />
          ))}
        </g>
        {/* the hole carries the total at rest, and the hovered slice's share
            while pointing — so the number is where the eye already is */}
        <text x="62" y="58" textAnchor="middle" fontSize="19" fontWeight="600" fill={INK}>
          {hovered ? `${hovered.value}%` : data.total}
        </text>
        <text x="62" y="72" textAnchor="middle" fontSize="9" fill={FAINT}>
          {hovered ? hovered.label : data.unit}
        </text>
      </svg>
      <Legend segments={data.segments} active={active} onActive={setActive} />
      <Tooltip tip={tip} />
    </div>
  );
}

/* ── pie ───────────────────────────────────────────────────────────────── */

const PIE_R = 54;

function wedge(cx: number, cy: number, r: number, from: number, to: number) {
  const at = (a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x1, y1] = at(from);
  const [x2, y2] = at(to);
  const large = to - from > Math.PI ? 1 : 0;
  return `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
}

function Pie({ data }: { data: ChartData["pie"] }) {
  const [active, setActive] = useState<string | null>(null);
  const { ref, tip, track, clear } = useTip();
  const total = data.segments.reduce((n, s) => n + s.value, 0);
  /* Angular equivalent of the 2px surface gap at this radius. */
  const gapA = MARK.gap / PIE_R;

  type Slice = Segment & { from: number; to: number; end: number };
  const slices = data.segments.reduce<Slice[]>((acc, s) => {
    const start = acc.length ? acc[acc.length - 1].end : -Math.PI / 2;
    const end = start + (s.value / total) * Math.PI * 2;
    return [...acc, { ...s, from: start + gapA / 2, to: end - gapA / 2, end }];
  }, []);

  return (
    <div ref={ref} className="relative flex items-center gap-3">
      <svg
        width={112}
        height={112}
        viewBox="0 0 124 124"
        className="shrink-0"
        role="img"
        aria-label={`${data.title}: ${data.segments.map((s) => `${s.label} ${s.value}%`).join(", ")}`}
      >
        {slices.map((s) => (
          <path
            key={s.label}
            d={wedge(62, 62, PIE_R, s.from, s.to)}
            fill={s.color}
            opacity={active && active !== s.label ? 0.35 : 1}
            style={{ transition: "opacity 150ms" }}
            onMouseEnter={() => setActive(s.label)}
            onMouseMove={(e) => track(e, s.label, s.value)}
            onMouseLeave={() => {
              setActive(null);
              clear();
            }}
          />
        ))}
      </svg>
      <Legend segments={data.segments} active={active} onActive={setActive} />
      <Tooltip tip={tip} />
    </div>
  );
}

/* ── column ────────────────────────────────────────────────────────────── */

const COL_H = 96;

function capPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(MARK.radius, h);
  return `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
}

function Column({ data }: { data: ChartData["column"] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...data.points.map((p) => p.value));
  const peak = data.points.findIndex((p) => p.value === max);
  const band = 340 / data.points.length;

  return (
    <svg
      viewBox={`0 0 340 ${COL_H + 22}`}
      className="w-full"
      role="img"
      aria-label={`${data.title}: ${data.points.map((p) => `${p.label} ${p.value}`).join(", ")}`}
    >
      <line x1="0" y1={COL_H} x2="340" y2={COL_H} stroke={GRID} strokeWidth="1" />
      {data.points.map((p, i) => {
        const h = Math.round((p.value / max) * (COL_H - 18));
        const x = i * band + band / 2 - MARK.thickness / 2;
        const y = COL_H - h;
        const labelled = active === i || (active === null && i === peak);
        return (
          <g key={p.label} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
            {/* hit target wider than the mark */}
            <rect x={x - 8} y={0} width={MARK.thickness + 16} height={COL_H} fill="transparent" />
            <path
              d={capPath(x, y, MARK.thickness, h)}
              fill={SERIES.blue}
              opacity={active === null || active === i ? 1 : 0.4}
              style={{ transition: "opacity 150ms" }}
            />
            {/* label the peak, or whatever is hovered — never every column */}
            {labelled && (
              <text
                x={x + MARK.thickness / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill={INK}
              >
                {p.value.toLocaleString()}
              </text>
            )}
            <text
              x={x + MARK.thickness / 2}
              y={COL_H + 14}
              textAnchor="middle"
              fontSize="9.5"
              fill={FAINT}
            >
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── bar (horizontal) ──────────────────────────────────────────────────── */

const BAR_H = 14;
const BAR_GAP = 10;
const LABEL_W = 112;

function barPath(x: number, y: number, w: number, h: number) {
  const r = Math.min(MARK.radius, w);
  return `M${x},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} L${x},${y + h} Z`;
}

function Bar({ data }: { data: ChartData["bar"] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...data.points.map((p) => p.value));
  const track = 340 - LABEL_W - 32;
  const height = data.points.length * (BAR_H + BAR_GAP);

  return (
    <svg
      viewBox={`0 0 340 ${height}`}
      className="w-full"
      role="img"
      aria-label={`${data.title}: ${data.points.map((p) => `${p.label} ${p.value}`).join(", ")}`}
    >
      {data.points.map((p, i) => {
        const y = i * (BAR_H + BAR_GAP);
        const w = Math.max(MARK.radius, (p.value / max) * track);
        return (
          <g key={p.label} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
            <rect x={0} y={y - 4} width={340} height={BAR_H + 8} fill="transparent" />
            <text x={0} y={y + BAR_H - 3} fontSize="11" fill={MUTED}>
              {p.label}
            </text>
            <path
              d={barPath(LABEL_W, y, w, BAR_H)}
              fill={SERIES.blue}
              opacity={active === null || active === i ? 1 : 0.4}
              style={{ transition: "opacity 150ms" }}
            />
            <text x={LABEL_W + w + 6} y={y + BAR_H - 3} fontSize="10" fontWeight="600" fill={INK}>
              {p.value}
              {data.suffix}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── line ──────────────────────────────────────────────────────────────── */

const LINE_H = 92;

function Line({ data }: { data: ChartData["line"] }) {
  const [active, setActive] = useState<number | null>(null);
  const values = data.points.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = 340 / (data.points.length - 1);
  const at = (v: number) => LINE_H - 14 - ((v - min) / span) * (LINE_H - 34);

  const coords = data.points.map((p, i) => ({ ...p, x: i * step, y: at(p.value) }));
  const path = coords.map((c, i) => `${i ? "L" : "M"}${c.x},${c.y}`).join(" ");
  const area = `${path} L${coords[coords.length - 1].x},${LINE_H} L0,${LINE_H} Z`;
  const shown = active === null ? coords[coords.length - 1] : coords[active];

  return (
    <svg
      viewBox={`0 0 340 ${LINE_H + 20}`}
      className="w-full"
      role="img"
      aria-label={`${data.title}: ${data.points
        .map((p) => `${p.label} ${p.value}${data.suffix ?? ""}`)
        .join(", ")}`}
    >
      <line x1="0" y1={LINE_H} x2="340" y2={LINE_H} stroke={GRID} strokeWidth="1" />
      {/* area is a wash at ~10%, never a saturated block */}
      <path d={area} fill={SERIES.blue} opacity={0.1} />
      <path
        d={path}
        fill="none"
        stroke={SERIES.blue}
        strokeWidth={MARK.line}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {coords.map((c, i) => (
        <g key={c.label} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
          <rect x={c.x - step / 2} y={0} width={step} height={LINE_H} fill="transparent" />
          <text x={c.x} y={LINE_H + 14} textAnchor="middle" fontSize="9.5" fill={FAINT}>
            {c.label}
          </text>
        </g>
      ))}

      {/* end marker carries a 2px surface ring so it stays legible on the line */}
      <circle
        cx={shown.x}
        cy={shown.y}
        r={MARK.marker}
        fill={SERIES.blue}
        stroke={SURFACE}
        strokeWidth={MARK.gap}
      />
      <text
        x={Math.min(shown.x, 322)}
        y={shown.y - 11}
        textAnchor={shown.x > 300 ? "end" : "middle"}
        fontSize="10"
        fontWeight="600"
        fill={INK}
      >
        {shown.value}
        {data.suffix}
      </text>
    </svg>
  );
}

/* ── block ─────────────────────────────────────────────────────────────── */

export function Charts({ data }: { data: ChartData }) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <Panel title={data.column.title} unit={data.column.unit}>
        <Column data={data.column} />
      </Panel>
      <Panel title={data.line.title} unit={data.line.unit}>
        <Line data={data.line} />
      </Panel>
      <Panel title={data.bar.title} unit={data.bar.unit}>
        <Bar data={data.bar} />
      </Panel>
      <Panel title={data.donut.title}>
        <Donut data={data.donut} />
      </Panel>
      <Panel title={data.pie.title}>
        <Pie data={data.pie} />
      </Panel>
    </div>
  );
}
