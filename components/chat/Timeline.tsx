"use client";

/* Timeline — chronological events with timestamps and descriptions.

   Distinct from the progress tracker, which it resembles: a tracker shows a
   process with a known end and a current step, so it needs done / current /
   pending states. A timeline is a record of what already happened — every entry
   is past, so the marks are uniform and the timestamps do the work.

   Newest last, so it reads top-down like the conversation it sits in. */

const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";
const FAINT = "#A8A096";

/* Marks are green by default — a timeline is a record of things that happened,
   so every entry is a completed event. The other tones stay available for a
   history that needs to single one out. */
const TONES = {
  good: "#16A34A",
  neutral: "#C4BDB1",
  accent: "var(--ds-accent)",
  warn: "#D97706",
} as const;

/** Reveal is derived from position: entry i lands at i × STEP_MS. */
const STEP_MS = 260;
const DOT_MS = 380;
const LINE_MS = 420;

export type TimelineTone = keyof typeof TONES;

export type TimelineEvent = {
  time: string;
  title: string;
  detail?: string;
  /** Who or what did it — agent, customer, system. */
  actor?: string;
  tone?: TimelineTone;
};

export type TimelineData = {
  title?: string;
  events: TimelineEvent[];
};

const DOT = 9;

export function Timeline({ data }: { data: TimelineData }) {
  return (
    <div className="w-full min-w-0">
      <style>{`
        @keyframes tl-dot {
          from { opacity: 0; transform: scale(0.4); }
          60%  { opacity: 1; transform: scale(1.08); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes tl-line {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes tl-row {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {data.title && (
        <p className="mb-2 text-[12px] font-semibold" style={{ color: INK }}>
          {data.title}
        </p>
      )}

      <div className="px-0.5">
        {data.events.map((e, i) => {
          const last = i === data.events.length - 1;
          const tone = TONES[e.tone ?? "good"];
          const delay = i * STEP_MS;
          return (
            <div key={`${e.time}-${e.title}`} className="flex gap-2.5">
              {/* rail */}
              <div className="flex shrink-0 flex-col items-center" style={{ width: DOT }}>
                <span
                  className="mt-[5px] shrink-0 rounded-full"
                  style={{
                    width: DOT,
                    height: DOT,
                    backgroundColor: tone,
                    animation: `tl-dot ${DOT_MS}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
                  }}
                  aria-hidden
                />
                {!last && (
                  <span
                    className="my-1 w-px flex-1 rounded-full"
                    style={{
                      minHeight: 14,
                      backgroundColor: LINE,
                      transformOrigin: "top",
                      animation: `tl-line ${LINE_MS}ms ease-out ${delay + DOT_MS * 0.5}ms both`,
                    }}
                    aria-hidden
                  />
                )}
              </div>

              {/* entry */}
              <div
                className={`min-w-0 flex-1 ${last ? "pb-0" : "pb-3.5"}`}
                style={{ animation: `tl-row ${DOT_MS}ms ease-out ${delay}ms both` }}
              >
                <div className="flex flex-wrap items-baseline gap-x-1.5">
                  <span
                    className="text-[10.5px] font-medium tabular-nums"
                    style={{ color: FAINT }}
                  >
                    {e.time}
                  </span>
                  {e.actor && (
                    <span className="text-[10.5px]" style={{ color: FAINT }}>
                      · {e.actor}
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-[12.5px] font-medium leading-snug" style={{ color: INK }}>
                  {e.title}
                </p>
                {e.detail && (
                  <p className="mt-0.5 text-[11.5px] leading-snug" style={{ color: MUTED }}>
                    {e.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
