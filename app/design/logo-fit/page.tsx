"use client";

/* ── LOGO, ONCE IT IS UPLOADED — layout studies ───────────────────────────
   Today the upload is followed by three sliders: spacing, width, corner
   radius. Three numbers for one 36px square, and one of them — width — is not
   the tenant's decision at all: the header's avatar slot is fixed, and that
   is what keeps the title, subtitle and menu on one rhythm.

   Each study below answers the same question with less. They share one logo,
   so switching between them compares the controls rather than the picture,
   and each measures itself. ──────────────────────────────────────────── */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ChevronDown, ImagePlus, Loader2, RotateCcw, X } from "lucide-react";

const ACCENT = "#632E9A";
/* The header's own avatar. Not a setting — see the note above. */
const AVATAR_PX = 36;

type Shape = "circle" | "rounded" | "square";
const RADIUS: Record<Shape, number> = { circle: 999, rounded: 10, square: 3 };
const SHAPES: { v: Shape; label: string }[] = [
  { v: "circle", label: "Circle" },
  { v: "rounded", label: "Rounded" },
  { v: "square", label: "Square" },
];

/* ── two logos, because they are the two cases ─────────────────────────────
   A symbol on transparency arrives with no padding of its own and wants a
   circle. A full-bleed opaque tile arrives with its own crop and wants its
   corners left alone. Every real upload is one or the other. */
const SYMBOL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#1A0CD4"/><text x="32" y="45" font-family="Georgia,serif" font-size="40" fill="#fff" text-anchor="middle">g</text></svg>`,
  );
const TILE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#0F172A"/><rect x="8" y="26" width="48" height="5" rx="2.5" fill="#F8FAFC"/><rect x="8" y="36" width="30" height="5" rx="2.5" fill="#94A3B8"/></svg>`,
  );

/* ── shared chrome ─────────────────────────────────────────────────────── */

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 text-[12px] font-medium text-[#555]">{children}</p>;
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
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

function Measured({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setH(Math.round(e.contentRect.height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#B0B0B0]">
        Controls{" "}
        <span className="tabular-nums font-normal text-[#C8C8C8]">
          {h === null ? "—" : `${h}px`}
        </span>
      </div>
      <div ref={ref}>{children}</div>
    </div>
  );
}

/* The thing every study is aiming at: the agent's face in the messenger
   header, at the one size it is ever drawn. */
function Header({
  src,
  shape,
  pad,
  zoom = 1,
  offset = { x: 0, y: 0 },
  size = AVATAR_PX,
}: {
  src: string;
  shape: Shape;
  pad: number;
  zoom?: number;
  offset?: { x: number; y: number };
  size?: number;
}) {
  const inset = (size * pad) / 100;
  return (
    <span
      className="grid shrink-0 place-items-center overflow-hidden bg-white ring-1 ring-black/5"
      style={{ width: size, height: size, borderRadius: RADIUS[shape] }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="block object-cover"
        style={{
          width: size - inset * 2,
          height: size - inset * 2,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
        }}
      />
    </span>
  );
}

function HeaderRow(props: React.ComponentProps<typeof Header>) {
  return (
    <div className="mb-3 flex items-center gap-2.5 rounded-xl bg-[#FAFAFA] p-2.5">
      <Header {...props} />
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-[13px] font-semibold text-[#222]">
          Global Payments
        </span>
        <span className="truncate text-[11px] text-[#999]">Virtual Assistant</span>
      </span>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  unit: string;
}) {
  return (
    <div className="mb-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] text-[#555]">{label}</span>
        <span className="text-[12px] tabular-nums text-[#333]">
          {value}
          <span className="ml-0.5 text-[10px] text-[#A8A8A8]">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[#7C3AED]"
      />
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
      <p className="mb-3 mt-1 min-h-[68px] text-[12px] leading-snug text-[#777]">
        {note}
      </p>
      <div className="rounded-2xl border border-[#E8E8E8] bg-white px-6 py-4 shadow-sm">
        {children}
      </div>
    </div>
  );
}

/* ── reading the file, which is what makes B honest ───────────────────────
   The upload already answers both questions if you look at it: whether the
   corners are transparent says whether it is a symbol or a tile, and where
   the ink actually stops says how much padding it brought with it. */
type Read = { transparent: boolean; tight: number } | null;

function useAnalysis(src: string): Read {
  const [out, setOut] = useState<Read>(null);
  useEffect(() => {
    let live = true;
    /* Cleared asynchronously rather than during the effect body: a synchronous
       reset here is a second render before the first has been shown, and the
       compiler is right that it costs more than it buys. The decode is async
       anyway, so one frame of the previous reading is invisible. */
    const clear = setTimeout(() => live && setOut(null), 0);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const N = 48;
      const c = document.createElement("canvas");
      c.width = c.height = N;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx || !live) return;
      ctx.drawImage(img, 0, 0, N, N);
      let d: Uint8ClampedArray;
      try {
        d = ctx.getImageData(0, 0, N, N).data;
      } catch {
        return;
      }
      /* the four corners: opaque corners mean the image is its own tile */
      const alphaAt = (x: number, y: number) => d[(y * N + x) * 4 + 3];
      const corners = [
        alphaAt(1, 1),
        alphaAt(N - 2, 1),
        alphaAt(1, N - 2),
        alphaAt(N - 2, N - 2),
      ];
      const transparent = corners.every((a) => a < 24);
      /* how far in the ink starts, as a share of the box — a symbol drawn to
         its own edges reads 0 and needs the padding added for it */
      let minX = N,
        minY = N,
        maxX = 0,
        maxY = 0;
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          if (alphaAt(x, y) > 24) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }
      const margin = Math.min(minX, minY, N - 1 - maxX, N - 1 - maxY);
      if (live) setOut({ transparent, tight: Math.round((margin / N) * 100) });
    };
    img.src = src;
    return () => {
      live = false;
      clearTimeout(clear);
    };
  }, [src]);
  return out;
}

/* What the reading recommends. Kept next to the reading rather than inside a
   component, since two studies want the same answer. */
function suggest(r: Read): { shape: Shape; pad: number } {
  if (!r) return { shape: "circle", pad: 0 };
  if (!r.transparent) return { shape: "rounded", pad: 0 };
  /* a symbol that already carries its own air needs none added */
  return { shape: "circle", pad: r.tight >= 8 ? 0 : 8 };
}

/* ── 0 · what ships today ──────────────────────────────────────────────── */

function Today({ src }: { src: string }) {
  const [pad, setPad] = useState(0);
  const [width, setWidth] = useState(36);
  const [radius, setRadius] = useState(10);
  return (
    <Group title="Brand identity">
      <HeaderRow
        src={src}
        shape="square"
        pad={pad}
        size={width}
      />
      <div style={{ borderRadius: radius }} />
      <FieldLabel>Logo</FieldLabel>
      <Slider label="Logo spacing" value={pad} onChange={setPad} min={0} max={40} unit="%" />
      <Slider label="Logo width" value={width} onChange={setWidth} min={20} max={56} unit="px" />
      <Slider
        label="Logo corner radius"
        value={radius}
        onChange={setRadius}
        min={0}
        max={24}
        unit="px"
      />
    </Group>
  );
}

/* ── A · the shape is a shape ──────────────────────────────────────────── */

function ShapeCards({ src }: { src: string }) {
  const read = useAnalysis(src);
  const [shape, setShape] = useState<Shape>("circle");
  const [pad, setPad] = useState(0);
  /* full-bleed means there is a padding decision to make; a logo that came
     with its own air has already made it */
  const needsPad = !!read && read.transparent && read.tight < 8;
  return (
    <Group title="Brand identity">
      <HeaderRow src={src} shape={shape} pad={pad} />
      <FieldLabel>Shape</FieldLabel>
      <div className="flex gap-1.5">
        {SHAPES.map(({ v, label }) => {
          const on = shape === v;
          return (
            <button
              key={v}
              onClick={() => setShape(v)}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-2.5 transition-colors ${
                on
                  ? "border-[#C4A9E8] bg-[#F8F4FF]"
                  : "border-[#E5E5E5] hover:border-[#D5D5D5]"
              }`}
            >
              {/* their logo, in that shape — the question answered in the
                  control rather than described by it */}
              <Header src={src} shape={v} pad={pad} size={28} />
              <span
                className={`text-[10px] ${on ? "font-semibold text-[#6D33AA]" : "font-medium text-[#777]"}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {needsPad && (
        <div className="mt-3">
          <Slider
            label="Padding"
            value={pad}
            onChange={setPad}
            min={0}
            max={24}
            unit="%"
          />
          <p className="text-[11px] leading-snug text-[#A8A8A8]">
            This logo is drawn to its own edges, so it needs a little air.
          </p>
        </div>
      )}
    </Group>
  );
}

/* ── B · the file already answered ─────────────────────────────────────── */

function AutoFit({ src }: { src: string }) {
  const read = useAnalysis(src);
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [shape, setShape] = useState<Shape>("circle");
  const [pad, setPad] = useState(0);

  /* The suggestion wins until somebody disagrees with it. */
  const auto = suggest(read);
  const useShape = touched ? shape : auto.shape;
  const usePad = touched ? pad : auto.pad;
  const take = useCallback(() => {
    setShape(auto.shape);
    setPad(auto.pad);
    setTouched(true);
  }, [auto.shape, auto.pad]);

  return (
    <Group title="Brand identity">
      <HeaderRow src={src} shape={useShape} pad={usePad} />
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-[12px] text-[#777]">
          {read === null ? (
            <span className="inline-flex items-center gap-1.5 text-[#A8A8A8]">
              <Loader2 className="size-3 animate-spin" strokeWidth={2} />
              Reading the file…
            </span>
          ) : (
            <>
              <span className="font-medium text-[#555]">
                {SHAPES.find((s) => s.v === useShape)?.label}
              </span>
              {usePad > 0 ? ` · ${usePad}% padding` : " · no padding"}
              {!touched && (
                <span className="ml-1 text-[#A8A8A8]">· from your file</span>
              )}
            </>
          )}
        </span>
        <button
          onClick={() => setOpen(!open)}
          className="shrink-0 text-[11px] font-medium text-[#7C3AED]"
        >
          {open ? "Done" : "Adjust"}
        </button>
      </div>
      {open && (
        <div className="mt-2.5 rounded-xl bg-[#FAFAFA] p-2.5">
          <div className="flex gap-1.5">
            {SHAPES.map(({ v, label }) => {
              const on = useShape === v;
              return (
                <button
                  key={v}
                  onClick={() => {
                    setShape(v);
                    if (!touched) setPad(auto.pad);
                    setTouched(true);
                  }}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border bg-white py-1.5 text-[11px] transition-colors ${
                    on
                      ? "border-[#C4A9E8] font-semibold text-[#6D33AA]"
                      : "border-[#E5E5E5] font-medium text-[#777] hover:border-[#D5D5D5]"
                  }`}
                >
                  <Header src={src} shape={v} pad={usePad} size={16} />
                  {label}
                </button>
              );
            })}
          </div>
          <div className="mt-2.5">
            <Slider
              label="Padding"
              value={usePad}
              onChange={(v) => {
                if (!touched) take();
                setPad(v);
                setTouched(true);
              }}
              min={0}
              max={24}
              unit="%"
            />
          </div>
          {touched && (
            <button
              onClick={() => setTouched(false)}
              className="flex items-center gap-1.5 text-[11px] font-medium text-[#7C3AED]"
            >
              <RotateCcw className="size-3" strokeWidth={2} />
              Back to what the file suggested
            </button>
          )}
        </div>
      )}
    </Group>
  );
}

/* ── C · drag it into place ────────────────────────────────────────────── */

function DragFit({ src }: { src: string }) {
  const [shape, setShape] = useState<Shape>("circle");
  const [zoom, setZoom] = useState(100);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );

  /* The tile is 96 and the header is 36, so a pixel dragged here is a third of
     a pixel there — which is the point: the adjustment happens at a size you
     can actually see it at. */
  const TILE_PX = 96;
  const k = AVATAR_PX / TILE_PX;

  const onDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    /* clamped to the tile, so a logo can never be dragged out of its own
       frame and left as an empty disc */
    const lim = TILE_PX / 3;
    setOff({
      x: Math.max(-lim, Math.min(lim, d.ox + (e.clientX - d.x))),
      y: Math.max(-lim, Math.min(lim, d.oy + (e.clientY - d.y))),
    });
  };
  const onUp = () => {
    drag.current = null;
  };

  return (
    <Group title="Brand identity">
      <HeaderRow
        src={src}
        shape={shape}
        pad={0}
        zoom={zoom / 100}
        offset={{ x: off.x * k, y: off.y * k }}
      />
      <FieldLabel>Fit</FieldLabel>
      <div className="flex gap-3">
        <span
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="grid shrink-0 cursor-grab place-items-center overflow-hidden bg-white ring-1 ring-black/10 active:cursor-grabbing"
          style={{
            width: TILE_PX,
            height: TILE_PX,
            borderRadius: RADIUS[shape] === 999 ? 999 : RADIUS[shape] * 2,
            touchAction: "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            draggable={false}
            className="block select-none object-cover"
            style={{
              width: TILE_PX,
              height: TILE_PX,
              transform: `translate(${off.x}px, ${off.y}px) scale(${zoom / 100})`,
            }}
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex gap-1.5">
            {SHAPES.map(({ v, label }) => (
              <button
                key={v}
                onClick={() => setShape(v)}
                aria-label={label}
                title={label}
                className={`h-7 flex-1 rounded-lg border text-[10px] font-medium transition-colors ${
                  shape === v
                    ? "border-[#C4A9E8] bg-[#F8F4FF] text-[#6D33AA]"
                    : "border-[#E5E5E5] text-[#777] hover:border-[#D5D5D5]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-2.5">
            <Slider
              label="Zoom"
              value={zoom}
              onChange={setZoom}
              min={60}
              max={200}
              unit="%"
            />
          </div>
          <p className="text-[11px] leading-snug text-[#A8A8A8]">
            Drag the tile to move the logo inside its frame.
          </p>
        </div>
      </div>
    </Group>
  );
}

/* ── the studio ────────────────────────────────────────────────────────── */

export default function LogoFitStudies() {
  const [src, setSrc] = useState(SYMBOL);
  const read = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = () => setSrc(r.result as string);
    r.readAsDataURL(file);
  };
  return (
    <main className="min-h-screen bg-[#F7F7F8] px-8 py-10">
      <header className="mb-6 max-w-[680px]">
        <p
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: ACCENT }}
        >
          Design panel · study
        </p>
        <h1 className="mt-1 text-[24px] font-semibold text-[#1A1A1A]">
          After the logo is uploaded
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[#666]">
          Three sliders for one 36px square, and one of them — width — is not
          the tenant&rsquo;s decision: the header&rsquo;s avatar slot is fixed,
          and that is what keeps the title, subtitle and menu on one rhythm.
          Each study answers the same question with less.
        </p>
      </header>

      {/* one logo across all four, so the comparison is of the controls */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9A9A9A]">
          Logo
        </span>
        <button
          onClick={() => setSrc(SYMBOL)}
          className={`rounded-lg border px-2.5 py-1.5 text-[12px] ${
            src === SYMBOL
              ? "border-[#C4A9E8] bg-[#F8F4FF] font-semibold text-[#6D33AA]"
              : "border-[#E5E5E5] text-[#666] hover:border-[#D5D5D5]"
          }`}
        >
          Symbol on transparency
        </button>
        <button
          onClick={() => setSrc(TILE)}
          className={`rounded-lg border px-2.5 py-1.5 text-[12px] ${
            src === TILE
              ? "border-[#C4A9E8] bg-[#F8F4FF] font-semibold text-[#6D33AA]"
              : "border-[#E5E5E5] text-[#666] hover:border-[#D5D5D5]"
          }`}
        >
          Full-bleed tile
        </button>
        <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-[#DADADA] px-2.5 py-1.5 text-[12px] text-[#666] hover:border-[#C0C0C0]">
          <ImagePlus className="size-3.5" strokeWidth={1.8} />
          Upload your own
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => read(e.target.files?.[0])}
          />
        </label>
        {src !== SYMBOL && src !== TILE && (
          <button
            onClick={() => setSrc(SYMBOL)}
            aria-label="Clear"
            className="grid size-6 place-items-center rounded-full text-[#A8A8A8] hover:bg-black/5"
          >
            <X className="size-3.5" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6">
        <Panel
          name="0 · Today"
          note="Three sliders: spacing, width, corner radius. Two of them are the design system's decision rather than the tenant's, and none of them shows the answer."
        >
          <Measured>
            <Today src={src} />
          </Measured>
        </Panel>
        <Panel
          name="A · Shape, then air"
          note="Radius becomes three cards rendering their actual logo. Padding appears only for a logo drawn to its own edges. Width is gone."
        >
          <Measured>
            <ShapeCards src={src} />
          </Measured>
        </Panel>
        <Panel
          name="B · Read the file"
          note="The upload already answers both questions — transparent corners mean a symbol, and where the ink stops says how much air it brought. One line, and an Adjust nobody has to open."
        >
          <Measured>
            <AutoFit src={src} />
          </Measured>
        </Panel>
        <Panel
          name="C · Drag it into place"
          note="No numbers for position. A 96px tile you drag and zoom, with the shape beside it — the adjustment happens at a size you can see it at."
        >
          <Measured>
            <DragFit src={src} />
          </Measured>
        </Panel>
      </div>
    </main>
  );
}
