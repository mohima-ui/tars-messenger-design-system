"use client";

import { Check } from "lucide-react";
import { useState } from "react";

/* Inline cards — the Cards input type from the Input Types page: product image,
   eyebrow, title, description, price. Used when each option needs detail rather
   than a one-line chip.

   Laid out as a horizontal rail: at 220px a card is wider than half the 364px
   thread column, so they scroll sideways instead of stacking into a wall.

   Rest / hover / selected match the documented states — line border at rest, an
   accent-border edge with an accent-soft ring on hover, and an accent edge with
   an inset stroke plus a check once picked. */

const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";

/** Hatched placeholder standing in for the product shot. */
const IMAGE_FILL = {
  borderColor: LINE,
  backgroundColor: "#F4EEE3",
  backgroundImage:
    "repeating-linear-gradient(135deg, rgba(140,131,120,0.16) 0px, rgba(140,131,120,0.16) 1.5px, transparent 1.5px, transparent 12px)",
};

const CARD_W = 220;

export type Plan = {
  name: string;
  description: string;
  price: string;
  /** Eyebrow above the name, e.g. "Most popular". */
  tag?: string;
  /** Product image; falls back to the hatched placeholder. */
  image?: string;
};

export function PlanCards({
  plans,
  onPick,
  /** Locks the group once a card has been taken. */
  spent = false,
  /** The card that was taken — keeps its selected state while spent. */
  chosen,
}: {
  plans: Plan[];
  onPick?: (plan: Plan) => void;
  spent?: boolean;
  chosen?: string | null;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  /* The parent owns the choice once it's been sent; before that the group
     tracks it locally so the card still responds on click. */
  const selected = chosen ?? picked;

  return (
    /* w-full + min-w-0 keep the rail inside the thread column — without them
       the flex parent sizes to the cards' combined width and the whole panel
       scrolls sideways instead of just this row. */
    <div className="flex w-full min-w-0 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {plans.map((p) => {
        const isSelected = selected === p.name;
        const isHovered = !spent && hovered === p.name && !isSelected;
        return (
          <button
            key={p.name}
            type="button"
            disabled={spent}
            onClick={
              spent
                ? undefined
                : () => {
                    setPicked(p.name);
                    onPick?.(p);
                  }
            }
            onMouseEnter={() => setHovered(p.name)}
            onMouseLeave={() => setHovered(null)}
            className="shrink-0 rounded-[12px] border bg-white p-2 text-left transition-all disabled:cursor-not-allowed"
            style={{
              width: CARD_W,
              opacity: spent ? 0.5 : 1,
              borderColor: isSelected
                ? "var(--ds-accent)"
                : isHovered
                  ? "var(--ds-accent-border)"
                  : LINE,
              boxShadow: isSelected
                ? "inset 0 0 0 1px var(--ds-accent)"
                : isHovered
                  ? "0 0 0 3px var(--ds-accent-soft)"
                  : undefined,
            }}
          >
            {/* product image */}
            <div
              className="relative flex h-[120px] w-full items-center justify-center overflow-hidden rounded-[8px] border"
              style={IMAGE_FILL}
            >
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" className="size-full object-cover" />
              ) : (
                <span
                  className="font-mono text-[9px] uppercase tracking-wider"
                  style={{ color: MUTED }}
                >
                  Product image
                </span>
              )}
              {isSelected && (
                <span
                  className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: "var(--ds-accent)" }}
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
            </div>

            {/* body */}
            <div className="px-1 pt-2.5">
              {p.tag && (
                <p
                  className="font-mono text-[9px] uppercase tracking-wider"
                  style={{ color: MUTED }}
                >
                  {p.tag}
                </p>
              )}
              <p
                className="mt-1 text-[14px] font-semibold"
                style={{ color: isSelected ? "var(--ds-accent-ink)" : INK }}
              >
                {p.name}
              </p>
              <p className="mt-1 text-[12px] leading-snug" style={{ color: MUTED }}>
                {p.description}
              </p>
              <p className="mt-2.5 text-[14px] font-semibold" style={{ color: INK }}>
                {p.price}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
