"use client";

import { Check } from "lucide-react";

/* Progress tracker — multi-step display of completed, current and pending
   steps.

   The reveal is derived from position, not hand-tuned: each step's connector
   draws and its mark pops at index × STEP_MS, so the sequence reads as the
   agent working down the list rather than the whole thing appearing at once.
   Add a step and the timing extends itself. */

const LINE = "#E0DAD3";
const INK = "#333333";
const MUTED = "#6E6E6E";
const DONE = "#16A34A";
const CURRENT = "var(--ds-accent)";

/** Per-step stagger; the connector draws, then the mark lands. */
const STEP_MS = 340;
const LINE_MS = 460;
const MARK_MS = 420;

export type StepState = "done" | "current" | "pending";

export type Step = {
  label: string;
  detail?: string;
  state: StepState;
};

export type ProgressData = {
  title?: string;
  steps: Step[];
};

/* Small marks — the copy carries the step; the disc just states which. */
const DOT = 14;

export function ProgressTracker({ data }: { data: ProgressData }) {
  return (
    <div className="w-full min-w-0">
      <style>{`
        @keyframes pt-line {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes pt-mark {
          from { opacity: 0; transform: scale(0.5); }
          60%  { opacity: 1; transform: scale(1.06); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pt-row {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* the current step keeps breathing after the reveal settles */
        @keyframes pt-pulse {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, ${CURRENT} 40%, transparent); }
          70%      { box-shadow: 0 0 0 6px color-mix(in srgb, ${CURRENT} 0%, transparent); }
        }
      `}</style>

      {data.title && (
        <p className="mb-2 text-[12px] font-semibold" style={{ color: INK }}>
          {data.title}
        </p>
      )}

      {/* No card around the steps — the indicator column already gives the
          block its structure, and a box inside a bubble is a box in a box. */}
      <div className="px-0.5">
        {data.steps.map((step, i) => {
          const last = i === data.steps.length - 1;
          const delay = i * STEP_MS;
          /* A connector is "travelled" only once the step below has started. */
          const travelled = data.steps[i + 1]?.state !== "pending";

          return (
            <div key={step.label} className="flex gap-2.5">
              {/* indicator column */}
              <div className="flex w-[14px] shrink-0 flex-col items-center">
                <span
                  className="relative flex shrink-0 items-center justify-center rounded-full"
                  style={{
                    width: DOT,
                    height: DOT,
                    backgroundColor:
                      step.state === "done"
                        ? DONE
                        : step.state === "current"
                          ? CURRENT
                          : "transparent",
                    border:
                      step.state === "pending" ? `1.5px solid ${LINE}` : "none",
                    animation: `pt-mark ${MARK_MS}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms both${
                      step.state === "current"
                        ? `, pt-pulse 2.6s ease-out ${delay + MARK_MS}ms infinite`
                        : ""
                    }`,
                  }}
                >
                  {step.state === "done" && (
                    <Check className="size-2 text-white" strokeWidth={3.5} aria-hidden />
                  )}
                  {step.state === "current" && (
                    <span className="size-[5px] rounded-full bg-white" aria-hidden />
                  )}
                </span>

                {!last && (
                  <span
                    className="my-1 w-[2px] flex-1 rounded-full"
                    style={{
                      minHeight: 18,
                      backgroundColor: travelled ? DONE : LINE,
                      transformOrigin: "top",
                      animation: `pt-line ${LINE_MS}ms ease-out ${delay + MARK_MS}ms both`,
                    }}
                    aria-hidden
                  />
                )}
              </div>

              {/* copy */}
              <div
                className={`min-w-0 flex-1 ${last ? "pb-0" : "pb-3"}`}
                style={{ animation: `pt-row ${MARK_MS}ms ease-out ${delay}ms both` }}
              >
                <p
                  className="text-[12.5px] leading-snug"
                  style={{
                    color: step.state === "pending" ? MUTED : INK,
                    fontWeight: step.state === "current" ? 600 : 500,
                  }}
                >
                  {step.label}
                </p>
                {step.detail && (
                  <p className="mt-0.5 text-[11.5px] leading-snug" style={{ color: "#A8A096" }}>
                    {step.detail}
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
