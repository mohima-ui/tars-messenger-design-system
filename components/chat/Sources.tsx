"use client";

import { ExternalLink } from "lucide-react";

/* Sources behind an answer — a stack of numbered discs followed by the label.
   Hovering a disc reveals the source card, matching the citation chips on the
   AI Message page. Shows the first three, then a +N disc. */

const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";

export type Source = {
  /** Site or system the answer drew on, e.g. "Help docs". */
  name: string;
  /** One line on what was used from it. */
  description?: string;
  /** Host + path, without the scheme. */
  url?: string;
};

const MAX_SHOWN = 3;

export function Sources({ sources }: { sources: Source[] }) {
  const shown = sources.slice(0, MAX_SHOWN);
  const extra = sources.length - shown.length;

  return (
    <div className="flex items-center gap-2">
      {/* negative margin overlaps the discs; the ring keeps each one legible */}
      <div className="flex -space-x-1.5">
        {shown.map((s, i) => (
          <span key={s.name} className="group/src relative">
            <button
              type="button"
              aria-label={`Source ${i + 1}: ${s.name}`}
              /* Same treatment as the citation chips: a beige disc with ink
                 numerals that tints to the accent on hover. */
              className="flex size-[18px] shrink-0 items-center justify-center rounded-full border border-transparent bg-[var(--ds-border-line)] text-[9px] font-semibold text-[var(--ds-text-ink)] ring-2 ring-[var(--ds-bg-paper)] transition-colors group-hover/src:border-[var(--ds-accent-border)] group-hover/src:bg-[var(--ds-accent-soft)] group-hover/src:text-[var(--ds-accent-ink)]"
            >
              {i + 1}
            </button>

            {/* pt-2 is a transparent bridge so moving from the disc onto the
                card keeps the hover alive */}
            <span className="pointer-events-none absolute bottom-full left-0 z-20 block w-max max-w-[240px] pb-2 opacity-0 transition-opacity duration-150 group-hover/src:pointer-events-auto group-hover/src:opacity-100">
              <span
                className="flex flex-col gap-1 rounded-[10px] border bg-white p-3 text-left"
                style={{
                  borderColor: LINE,
                  boxShadow: "0 4px 12px -3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <span
                  className="font-mono text-[9px] font-semibold uppercase tracking-wider"
                  style={{ color: MUTED }}
                >
                  Source {i + 1}
                </span>
                <span className="text-[13px] font-medium leading-snug" style={{ color: INK }}>
                  {s.name}
                </span>
                {s.description && (
                  <span className="line-clamp-2 text-[11.5px] leading-[1.5]" style={{ color: MUTED }}>
                    {s.description}
                  </span>
                )}
                {s.url && (
                  <a
                    href={`https://${s.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 inline-flex max-w-full items-center gap-1 font-mono text-[10px] underline"
                    style={{ color: "var(--ds-accent-ink)" }}
                  >
                    <span className="truncate">{s.url}</span>
                    <ExternalLink className="size-3 shrink-0" strokeWidth={2} aria-hidden />
                  </a>
                )}
              </span>
            </span>
          </span>
        ))}

        {extra > 0 && (
          <span
            className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--ds-border-line)] text-[9px] font-semibold text-[var(--ds-text-ink)] ring-2 ring-[var(--ds-bg-paper)]"
          >
            +{extra}
          </span>
        )}
      </div>

      <span className="text-[12px]" style={{ color: "var(--ds-text-secondary)" }}>
        Sources
      </span>
    </div>
  );
}
