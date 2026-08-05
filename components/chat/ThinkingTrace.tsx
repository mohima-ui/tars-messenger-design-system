"use client";

import { Check, ChevronRight, Loader2, Sparkles, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

/* The live reasoning trace an AI message shows while it works: a shimmering
   "thinking" line, a checklist of reasoning steps that tick off one at a time,
   and the tool call that ran underneath.

   Extracted from the Indicators design-system page so the docs preview and the
   live thread run the identical component. The docs loop it forever; a real
   conversation plays it once and calls onDone. */

const LINE = "#E0DAD3";
const CHROME = "#E5E5E5";
const INK = "#333333";
const MUTED = "#6E6E6E";
const ACCENT_SOFT = "#F0E7FA";
const ACCENT_INK = "#4A1F77";
const ACCENT_BORDER = "#C5A8E0";

const THINKING_PHRASES = [
  "AI is thinking…",
  "Thinking some more…",
  "Almost done thinking…",
  "Still thinking…",
];

export type ReasoningStep = { title: string; body: string };
export type ToolCall = { name: string; ms: number };

const STEP_MS = 900;
const TOOL_MS = 800;
const SETTLE_MS = 700;
const LOOP_RESTART_MS = 2600;

/** How long a trace of n steps takes, rounded for the summary chip. */
export const traceSeconds = (n: number) =>
  Math.round((n * STEP_MS + TOOL_MS + SETTLE_MS) / 1000);

function useThinkingPhrase() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % THINKING_PHRASES.length), 2600);
    return () => clearInterval(t);
  }, []);
  return THINKING_PHRASES[i];
}

export function ThinkingTrace({
  steps,
  tool,
  accent = "var(--ds-accent)",
  /** Docs preview restarts forever; a conversation runs it once. */
  loop = false,
  onDone,
}: {
  steps: ReasoningStep[];
  tool: ToolCall;
  accent?: string;
  loop?: boolean;
  /** Receives how long the trace ran, for the collapsed "Thought for Ns" chip. */
  onDone?: (seconds: number) => void;
}) {
  const phrase = useThinkingPhrase();
  const [done, setDone] = useState(0);
  const [toolDone, setToolDone] = useState(false);

  /* Steps tick off, then the tool runs. Looping restarts; otherwise the
     finished trace hands back to the caller. */
  useEffect(() => {
    if (done < steps.length) {
      const t = setTimeout(() => setDone((d) => d + 1), STEP_MS);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setToolDone(true), TOOL_MS);
    const t2 = setTimeout(
      () => {
        if (loop) {
          setToolDone(false);
          setDone(0);
        } else {
          onDone?.(traceSeconds(steps.length));
        }
      },
      loop ? LOOP_RESTART_MS : TOOL_MS + SETTLE_MS,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [done, steps.length, loop, onDone]);

  return (
    <div className="rounded-[12px] border p-3" style={{ borderColor: LINE, backgroundColor: "#FBF8F3" }}>
      <div className="flex items-center gap-1.5">
        <Sparkles
          className="size-3.5 shrink-0 animate-[spin_2.4s_linear_infinite]"
          strokeWidth={1.75}
          style={{ color: accent }}
        />
        <span className="ai-shimmer text-[12px] font-medium">{phrase}</span>
      </div>

      <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
        Reasoning
      </p>

      <div className="mt-1.5 flex flex-col">
        {steps.map((r, i) => {
          if (i > done) return null;
          const completed = i < done;
          const connector = i < done && i < steps.length - 1;
          return (
            <div key={i} className="flex gap-2" style={{ animation: "fade-in 260ms ease-out both" }}>
              <div className="flex shrink-0 flex-col items-center">
                <span
                  className="flex size-4 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: completed ? ACCENT_SOFT : "transparent" }}
                >
                  {completed ? (
                    <Check className="size-2.5" strokeWidth={2.5} style={{ color: ACCENT_INK }} />
                  ) : (
                    <Loader2 className="size-3 animate-spin" strokeWidth={2} style={{ color: accent }} />
                  )}
                </span>
                {connector && (
                  <span
                    className="my-0.5 w-px flex-1"
                    style={{ backgroundColor: ACCENT_BORDER, minHeight: 12 }}
                  />
                )}
              </div>
              <div className="min-w-0 pb-2">
                <p
                  className="text-[12px] font-semibold leading-[1.5]"
                  style={{ color: completed ? INK : MUTED }}
                >
                  {r.title}
                </p>
                <p className="text-[12px] italic leading-[1.5]" style={{ color: "#A8A096" }}>
                  {r.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {done >= steps.length && (
        <div
          className="mt-2.5 flex items-center gap-2 rounded-[8px] border bg-white px-3 py-2"
          style={{ borderColor: CHROME, animation: "fade-in 220ms ease-out both" }}
        >
          <Wrench className="size-3.5 shrink-0" strokeWidth={1.75} style={{ color: accent }} />
          <span className="font-mono text-[11px]" style={{ color: INK }}>
            {tool.name}
          </span>
          <span className="ml-auto text-[11px]" style={{ color: MUTED }}>
            {toolDone ? `${tool.ms}ms · success` : "running…"}
          </span>
          <span
            className="size-1.5 rounded-full"
            style={{ backgroundColor: toolDone ? "#22A06B" : accent }}
          />
        </div>
      )}
    </div>
  );
}

/* Once the trace finishes it collapses to this: a chip above the answer that
   expands to show what the agent actually did. */
export function ThoughtSummary({
  steps,
  tool,
  seconds,
  accent = "var(--ds-accent)",
}: {
  steps: ReasoningStep[];
  tool: ToolCall;
  seconds: number;
  accent?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-1.5" style={{ animation: "fade-in 240ms ease-out both" }}>
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors hover:brightness-[0.98]"
        style={{
          borderColor: expanded ? ACCENT_BORDER : LINE,
          backgroundColor: expanded ? ACCENT_SOFT : "#F7F2EA",
          color: expanded ? ACCENT_INK : MUTED,
        }}
      >
        <Sparkles className="size-3 shrink-0" strokeWidth={1.75} style={{ color: accent }} />
        Thought for {seconds}s · 1 tool
        <ChevronRight
          className="size-3 transition-transform"
          strokeWidth={2}
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0)" }}
        />
      </button>

      {expanded && (
        <div
          className="rounded-[12px] border p-3"
          style={{ borderColor: LINE, backgroundColor: "#FBF8F3", animation: "fade-in 200ms ease-out both" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED }}>
            Reasoning
          </p>
          <div className="mt-1.5 flex flex-col">
            {steps.map((r, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex shrink-0 flex-col items-center">
                  <span
                    className="flex size-3.5 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: ACCENT_SOFT, color: ACCENT_INK }}
                  >
                    <Check className="size-2" strokeWidth={2.5} />
                  </span>
                  {i < steps.length - 1 && (
                    <span
                      className="my-0.5 w-px flex-1"
                      style={{ backgroundColor: ACCENT_BORDER, minHeight: 10 }}
                    />
                  )}
                </div>
                <span className="pb-1.5 text-[11px] leading-[1.5]" style={{ color: MUTED }}>
                  <span className="font-semibold" style={{ color: INK }}>
                    {r.title}.
                  </span>{" "}
                  {r.body}
                </span>
              </div>
            ))}
          </div>

          <div
            className="mt-2.5 flex items-center gap-2 rounded-[8px] border bg-white px-3 py-2"
            style={{ borderColor: CHROME }}
          >
            <Wrench className="size-3.5 shrink-0" strokeWidth={1.75} style={{ color: accent }} />
            <span className="font-mono text-[11px]" style={{ color: INK }}>
              {tool.name}
            </span>
            <span className="ml-auto text-[11px]" style={{ color: MUTED }}>
              {tool.ms}ms · success
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
