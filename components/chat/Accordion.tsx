"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

/* Accordion — collapsible FAQ-style sections.

   One panel open at a time: that's what makes it an accordion rather than a
   list of disclosures, and in a 364px column it keeps the answer you're reading
   from being pushed off-screen by the ones above it.

   The open/close animates `grid-template-rows` from 0fr to 1fr rather than a
   fixed max-height — the row resolves to the content's real height, so long and
   short answers both ease properly instead of snapping at a guessed cap. */

const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const OPEN_MS = 300;

export type AccordionItem = {
  question: string;
  answer: string;
};

export type AccordionData = {
  title?: string;
  items: AccordionItem[];
  /** Index open on first render; omit to start fully collapsed. */
  defaultOpen?: number;
};

export function Accordion({ data }: { data: AccordionData }) {
  const [open, setOpen] = useState<number | null>(data.defaultOpen ?? null);

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
        {data.items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.question}
              style={{ borderTop: i === 0 ? undefined : `1px solid ${LINE}` }}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-[#FAF7F1]"
              >
                <span
                  className="min-w-0 flex-1 text-[12.5px] font-medium leading-snug"
                  style={{ color: INK }}
                >
                  {item.question}
                </span>
                <ChevronDown
                  className="mt-[1px] size-4 shrink-0"
                  strokeWidth={2}
                  style={{
                    color: MUTED,
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: `transform ${OPEN_MS}ms ${EASE}`,
                  }}
                  aria-hidden
                />
              </button>

              <div
                className="grid"
                style={{
                  gridTemplateRows: isOpen ? "1fr" : "0fr",
                  transition: `grid-template-rows ${OPEN_MS}ms ${EASE}`,
                }}
              >
                {/* the clipped child is what lets the row collapse to nothing */}
                <div className="overflow-hidden">
                  <p
                    className="px-3 pb-3 text-[11.5px] leading-relaxed"
                    style={{
                      color: MUTED,
                      opacity: isOpen ? 1 : 0,
                      transition: `opacity ${OPEN_MS}ms ${EASE}`,
                    }}
                  >
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
