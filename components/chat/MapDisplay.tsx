"use client";

import { Navigation } from "lucide-react";
import { useState } from "react";

/* Map display — a static map with markers for geographic locations.

   The map itself is drawn rather than fetched: a tile provider means an API
   key, a network round-trip and a third-party request from inside a customer's
   page. For "here's roughly where these are", a stylised plate reads clearly at
   340×180 and costs nothing — swap in a real static-tile URL as `image` when a
   provider is configured.

   Markers and the list beneath share one hover state, so pointing at either
   highlights the other. */

const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";

const LAND = "#F4EFE4";
const ROAD = "#FFFFFF";
const ROAD_EDGE = "#E7DFD0";
const PARK = "#E2EFDF";
const WATER = "#DDE9F2";

export type MapMarker = {
  label: string;
  /** Percent across / down the plate, 0–100. */
  x: number;
  y: number;
  detail?: string;
  meta?: string;
  /** Search text for the maps link; falls back to the label. */
  query?: string;
};

const mapsUrl = (m: MapMarker) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(m.query ?? m.label)}`;

export type MapData = {
  title?: string;
  markers: MapMarker[];
  /** Static tile image; falls back to the drawn plate. */
  image?: string;
};

const W = 340;
const H = 180;

/** Stylised street plate — land, a park, water, then roads over the top. */
function Plate() {
  return (
    <>
      <rect width={W} height={H} fill={LAND} />
      <path d="M232 -10 L340 34 L340 -10 Z" fill={WATER} />
      <path d="M246 190 C280 150 300 150 340 132 L340 190 Z" fill={WATER} />
      <rect x="28" y="96" width="74" height="52" rx="10" fill={PARK} />

      {/* casings first, then the road fill — the pair reads as a drawn map */}
      <g stroke={ROAD_EDGE} strokeWidth="9" strokeLinecap="round" fill="none">
        <path d="M-8 62 H348" />
        <path d="M-8 128 H348" />
        <path d="M118 -8 V188" />
        <path d="M232 -8 V188" />
        <path d="M-8 18 L120 62" />
        <path d="M232 128 L348 168" />
      </g>
      <g stroke={ROAD} strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M-8 62 H348" />
        <path d="M-8 128 H348" />
        <path d="M118 -8 V188" />
        <path d="M232 -8 V188" />
        <path d="M-8 18 L120 62" />
        <path d="M232 128 L348 168" />
      </g>
      <g stroke={ROAD} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M60 -8 V62" />
        <path d="M172 62 V188" />
        <path d="M-8 96 H118" />
        <path d="M232 96 H348" />
      </g>
    </>
  );
}

export function MapDisplay({ data }: { data: MapData }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="w-full min-w-0">
      {data.title && (
        <p className="mb-2 text-[12px] font-semibold" style={{ color: INK }}>
          {data.title}
        </p>
      )}

      <div
        className="overflow-hidden rounded-[12px] border bg-white"
        style={{ borderColor: LINE }}
      >
        <div className="relative">
          {data.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.image} alt="" className="block h-[180px] w-full object-cover" />
          ) : (
            <svg viewBox={`0 0 ${W} ${H}`} className="block h-[180px] w-full" aria-hidden>
              <Plate />
            </svg>
          )}

          {/* markers sit in the same percentage space either way */}
          {data.markers.map((m, i) => {
            const on = active === m.label;
            return (
              <button
                key={m.label}
                type="button"
                onMouseEnter={() => setActive(m.label)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(m.label)}
                onBlur={() => setActive(null)}
                aria-label={m.label}
                className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center transition-transform duration-200"
                style={{
                  left: `${m.x}%`,
                  top: `${m.y}%`,
                  transform: `translate(-50%, -100%) scale(${on ? 1.12 : 1})`,
                }}
              >
                <span
                  className="flex size-[22px] items-center justify-center rounded-full text-[10px] font-semibold text-white shadow-sm ring-2 ring-white transition-colors"
                  style={{ backgroundColor: on ? "var(--ds-accent-ink)" : "var(--ds-accent)" }}
                >
                  {i + 1}
                </span>
                {/* the stem turns the disc into a pin without a second shape */}
                <span
                  className="-mt-[3px] size-2 rotate-45 ring-2 ring-white"
                  style={{ backgroundColor: on ? "var(--ds-accent-ink)" : "var(--ds-accent)" }}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>

        <ul style={{ borderTop: `1px solid ${LINE}` }}>
          {data.markers.map((m, i) => {
            const on = active === m.label;
            return (
              <li
                key={m.label}
                onMouseEnter={() => setActive(m.label)}
                onMouseLeave={() => setActive(null)}
                className="flex items-start gap-2.5 px-3 py-2.5 transition-colors"
                style={{
                  borderTop: i === 0 ? undefined : `1px solid ${LINE}`,
                  backgroundColor: on ? "#FAF7F1" : undefined,
                }}
              >
                {/* plain numeral in the list — the disc is the map's job, and
                    a second badge here just repeats it louder */}
                <span
                  className="mt-[1px] w-3 shrink-0 text-[12px] font-semibold tabular-nums"
                  style={{ color: on ? "var(--ds-accent-ink)" : MUTED }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium leading-snug" style={{ color: INK }}>
                    {m.label}
                  </p>
                  {m.detail && (
                    <p className="mt-0.5 text-[11.5px] leading-snug" style={{ color: MUTED }}>
                      {m.detail}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {m.meta && (
                    <span
                      className="inline-flex items-center gap-1 text-[11px]"
                      style={{ color: MUTED }}
                    >
                      <Navigation className="size-3" strokeWidth={2} aria-hidden />
                      {m.meta}
                    </span>
                  )}
                  <a
                    href={mapsUrl(m)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whitespace-nowrap text-[10.5px] font-medium underline decoration-1 underline-offset-2 hover:decoration-2"
                    style={{ color: "var(--ds-accent-ink)" }}
                  >
                    Open in Maps
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

    </div>
  );
}
