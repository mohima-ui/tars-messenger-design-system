"use client";

/* Quick-reply chips — the Button Group input type. Short, verb-led choices
   that continue the conversation, stacked below the bubble per the Input Types
   guidance ("2–4 short, mutually exclusive choices; cards when each option
   needs detail").

   Outlined in the accent rather than filled: on a thread of paper-filled
   bubbles a filled chip reads as another message, so these stay transparent
   with an accent stroke and accent ink, taking the soft fill only on hover.
   Same accent role tokens as the user bubble, so the chip reads as its
   unfilled counterpart. */

const CHIP_MS = 60;

export function QuickReplies({
  options,
  onPick,
  /** Only these options respond. Others still look normal — they're inert to
      keep a demo on one path, not to signal they're unavailable. */
  enabled,
  /** Once an option has been taken the group stays put, greyed and inert. */
  spent = false,
  /** The option that was taken — keeps its hover fill so the choice reads. */
  chosen,
}: {
  options: string[];
  onPick: (option: string) => void;
  enabled?: string[];
  spent?: boolean;
  chosen?: string | null;
}) {
  const soft = "var(--ds-accent-soft)";
  const stroke = "var(--ds-accent-border)";
  const ink = "var(--ds-accent-ink)";

  return (
    <div className="flex flex-wrap items-start gap-2">
      {options.map((opt, i) => {
        const live = !spent && (!enabled || enabled.includes(opt));
        return (
          /* The entrance animation lives on the wrapper: `fade-in` ends at
             opacity 1 and, with fill-mode both, would otherwise override the
             disabled opacity set on the button. */
          <span
            key={opt}
            style={{
              animation: "fade-in 260ms cubic-bezier(0.2,0.6,0.2,1) both",
              animationDelay: `${i * CHIP_MS}ms`,
            }}
          >
            <button
              type="button"
              disabled={!live}
              onClick={live ? () => onPick(opt) : undefined}
              className="whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[14px] transition-colors disabled:cursor-not-allowed"
              style={{
                borderColor: stroke,
                color: ink,
                backgroundColor: opt === chosen ? soft : "transparent",
                opacity: spent ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (live) e.currentTarget.style.backgroundColor = soft;
              }}
              onMouseLeave={(e) => {
                if (live) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {opt}
            </button>
          </span>
        );
      })}
    </div>
  );
}
