"use client";

/* ── WHEN IT DOESN'T WORK — the messenger's failure states ────────────────
   Not twenty error screens. Five patterns, and a list of conditions that each
   land in one of them:

     1  Inline retry     the turn failed, nothing came back
     2  Degraded answer  the reply arrived but something in it didn't
     3  Banner           a condition affecting the panel, not one turn
     4  Composer notice  the input was rejected before it was sent
     5  Waiting          not an error, but the same family

   Every scenario here is wired. Retry actually retries and succeeds the
   second time, the composer notices fire on real input, and the slow state
   really does arrive after the threshold — a failure state you cannot press
   is a picture, and a picture is what let these ship broken in the first
   place. ─────────────────────────────────────────────────────────────── */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Copy,
  Loader2,
  Mic,
  Paperclip,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  WifiOff,
  X,
} from "lucide-react";

const ACCENT = "#632E9A";
const LIGHT = {
  canvas: "#FFFFFF",
  surface: "#FFFFFF",
  paper: "#F2F2F2",
  line: "#E9EAEA",
  ink: "#16181D",
  secondary: "#6B7280",
  muted: "#9CA3AF",
};
const DARK = {
  canvas: "#242427",
  surface: "#2C2C30",
  paper: "#36363B",
  line: "#45454B",
  ink: "#EFEFF1",
  secondary: "#B4B4B9",
  muted: "#8B8B92",
};

/* The reply everything is trying to produce, so a success and a failure are
   visibly the same turn with a different ending. */
const ASK = "What does card processing cost?";
const ANSWER =
  "Rates depend on your volume and how you take payments. For card-present at around £50k a month you'd be looking at 1.5% + 20p, settled next day.\n\nWant me to put you in touch with sales for an exact quote?";
const ANSWER_DEGRADED =
  "I couldn't pull live rates just now, so I can't give you a number I'd stand behind.\n\nWhat I can tell you is how pricing is structured: it varies by volume and by whether the card is present. Sales can quote you exactly — shall I connect you?";
const PARTIAL =
  "Rates depend on your volume and how you take payments. For card-present at around";

type StepState = "ok" | "failed";
type Step = {
  text: string;
  tool?: boolean;
  state: StepState;
  /* What came back instead, and what went in. A failed call is the one step
     whose input is worth keeping: it is how you tell a tool that is down from
     a tool that was asked the wrong question. */
  result?: string;
  args?: Record<string, string | number>;
};
const STEPS_OK: Step[] = [
  { text: "Searched the pricing guide", state: "ok" },
  { text: "check_rates", tool: true, state: "ok" },
  { text: "Read 3 sources", state: "ok" },
];
/* The failed run stops where it failed. Listing the steps that never ran
   would be inventing a record — the agent went to fetch a rate, could not,
   and answered without one. */
const STEPS_FAILED: Step[] = [
  { text: "Searched the pricing guide", state: "ok" },
  {
    text: "check_rates",
    tool: true,
    state: "failed",
    result: "Connection error",
    args: { product: "card_present", region: "UK", monthly_volume: 50000 },
  },
];

/* ── the catalogue ─────────────────────────────────────────────────────── */

type Pattern = "retry" | "degraded" | "banner" | "composer" | "waiting";
type Id =
  | "ok"
  | "loading"
  | "thinking"
  | "slow"
  | "toolFailed"
  | "noAnswer"
  | "cutOff"
  | "sendFailed"
  | "offline"
  | "reconnecting"
  | "rateLimited"
  | "expired"
  | "handoffFailed"
  | "aiFailed"
  | "tooLong"
  | "fileTooBig"
  | "micDenied";

const PATTERNS: { id: Pattern; n: number; label: string; blurb: string }[] = [
  {
    id: "waiting",
    n: 5,
    label: "Waiting",
    blurb: "Not an error, but the same family — and the state every other one interrupts.",
  },
  {
    id: "degraded",
    n: 2,
    label: "Degraded answer",
    blurb:
      "The reply arrived but something in it didn't. The most common real failure, and the one people forget to design.",
  },
  {
    id: "retry",
    n: 1,
    label: "Inline retry",
    blurb:
      "The turn failed and nothing came back. Sits where the reply would have been; their message stays put.",
  },
  {
    id: "banner",
    n: 3,
    label: "Banner",
    blurb:
      "A condition affecting the whole panel rather than one turn. Persists, and never blocks reading.",
  },
  {
    id: "composer",
    n: 4,
    label: "Composer notice",
    blurb:
      "The input was rejected before it was sent. Lives at the field, clears on the next keystroke, never a modal.",
  },
];

const SCENARIOS: {
  id: Id;
  label: string;
  pattern: Pattern;
  note: string;
  try?: string;
}[] = [
  { id: "ok", label: "Normal reply", pattern: "waiting", note: "The turn everything else is a variation of." },
  { id: "loading", label: "Opening the panel", pattern: "waiting", note: "History is being fetched. A skeleton of the shape that is coming, not a spinner in an empty box." },
  { id: "thinking", label: "Thinking", pattern: "waiting", note: "The row narrates this reply's own steps." },
  { id: "slow", label: "Taking too long", pattern: "waiting", note: "Past the threshold the line changes rather than a new element appearing — the wait got longer, nothing else happened.", try: "wait ~6s" },
  { id: "toolFailed", label: "A tool call failed", pattern: "degraded", note: "The answer renders. The trace carries the failure and the reply admits the gap in one clause, so nobody acts on a number that was never fetched.", try: "open the trace" },
  { id: "noAnswer", label: "No response at all", pattern: "retry", note: "Model errored, every tool failed, nothing to show. Their question stays in the transcript.", try: "press Retry" },
  { id: "cutOff", label: "Cut off mid-sentence", pattern: "retry", note: "The stream died halfway. The partial stays — it may be enough — with the retry under it rather than replacing it.", try: "press Retry" },
  { id: "sendFailed", label: "Their message didn't send", pattern: "retry", note: "The failure is on their own bubble, because that is the thing that failed. Never delete what they wrote.", try: "press Retry" },
  { id: "handoffFailed", label: "Handoff failed", pattern: "retry", note: "Nobody available. Offers the fallback beside the retry, since retrying may not be the right move at 2am.", try: "press Retry" },
  { id: "aiFailed", label: "AI response failed", pattern: "retry", note: "The tools ran and the trace stands \u2014 the model errored on the way to writing the answer. Distinct from a dead turn, because there is a record of the work and it should not be thrown away.", try: "press Retry" },
  { id: "offline", label: "Visitor is offline", pattern: "banner", note: "The conversation stays readable. The composer keeps accepting text and queues it." },
  { id: "reconnecting", label: "Reconnecting", pattern: "banner", note: "Transient, so it says what is happening rather than offering a button." },
  { id: "rateLimited", label: "Rate limited", pattern: "banner", note: "A wall with a clock on it. The way out is a person, so the banner carries one." },
  { id: "expired", label: "Session expired", pattern: "banner", note: "The old thread is still readable — it is history now, not a live conversation." },
  { id: "tooLong", label: "Message too long", pattern: "composer", note: "Counts down only once it matters. A counter present from the first keystroke is a limit nobody asked about.", try: "type past 240" },
  { id: "fileTooBig", label: "File rejected", pattern: "composer", note: "Real check — pick anything over 5 MB, or a non-image.", try: "attach a file" },
  { id: "micDenied", label: "Mic unavailable", pattern: "composer", note: "The control goes rather than sitting there disabled. A dead button is a worse answer than no button." },
];

/* ── panel pieces ──────────────────────────────────────────────────────── */

type N = typeof LIGHT;

function Bubble({ n, children }: { n: N; children: React.ReactNode }) {
  return (
    <div className="flex justify-end">
      <div
        className="w-fit max-w-[80%] rounded-[12px] rounded-br-[4px] px-3.5 py-2 text-[14px] leading-relaxed"
        style={{ background: n.paper, color: n.ink }}
      >
        {children}
      </div>
    </div>
  );
}

function AiText({ n, text }: { n: N; text: string }) {
  return (
    <div
      className="w-full whitespace-pre-line text-[14px] leading-relaxed"
      style={{ color: n.ink }}
    >
      {text}
    </div>
  );
}

function Toolbar({ n }: { n: N }) {
  return (
    <div className="mt-1 -ml-[5px] flex items-center gap-0.5">
      {[Volume2, ThumbsUp, ThumbsDown, Copy].map((I, i) => (
        <span
          key={i}
          className="flex size-6 items-center justify-center rounded-full"
          style={{ color: n.secondary }}
        >
          <I className={i === 0 ? "size-3.5" : "size-3"} strokeWidth={1.5} />
        </span>
      ))}
      <span className="ml-1.5 text-[12px] tabular-nums" style={{ color: n.muted }}>
        10:24 AM
      </span>
    </div>
  );
}

/* The trace, with one step able to have gone wrong. A failed step keeps its
   place in the order — what the agent tried is part of the record. */
function Trace({
  n,
  steps,
  secs,
  dark,
}: {
  n: N;
  steps: Step[];
  secs: number;
  dark: boolean;
}) {
  const [open, setOpen] = useState(steps.some((s) => s.state === "failed"));
  const failed = steps.some((s) => s.state === "failed");
  const ink = dark ? "#A78BFA" : ACCENT;
  return (
    <div className="mb-2 w-full">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-fit items-center gap-2 text-[13px]"
        style={{ color: open ? ink : n.secondary }}
      >
        {failed ? (
          <AlertTriangle className="size-3.5" strokeWidth={2.2} style={{ color: "#D97706" }} />
        ) : (
          <span
            className="grid size-3.5 place-items-center rounded-full text-white"
            style={{ background: ink }}
          >
            <Check className="size-2.5" strokeWidth={3.5} />
          </span>
        )}
        Thought for {secs}s
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>
      {open && (
        <ul className="mt-1.5 ml-1 flex flex-col gap-1">
          {steps.map((st) =>
            st.state === "failed" ? (
              <FailedCall key={st.text} n={n} step={st} />
            ) : (
              <li
                key={st.text}
                className="flex items-center gap-2 text-[13px]"
                style={{ color: n.secondary }}
              >
                <Check
                  className="size-3.5 shrink-0"
                  strokeWidth={2.5}
                  style={{ color: ink }}
                />
                <span className={st.tool ? "font-mono text-[12px]" : ""}>
                  {st.text}
                </span>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

/* The one step that went wrong, and the only one in the trace that opens.

   A ✓ step needs no detail: it did what it says. A failed call is the
   opposite — the sentence is the least useful part of it, and what was sent
   and what came back are the whole record. So the row names the tool and the
   disclosure carries the evidence, in the same Result / Arguments order an
   engineer would read a log in. */
function FailedCall({ n, step }: { n: N; step: Step }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-fit items-center gap-1.5 text-left text-[13px]"
        style={{ color: "#B45309" }}
      >
        <X className="size-3.5 shrink-0" strokeWidth={3} />
        Failed to call tool
        <span
          className="rounded px-1.5 py-0.5 font-mono text-[12px]"
          style={{ background: n.paper, color: n.ink }}
        >
          {step.text}
        </span>
        <ChevronDown
          className={`size-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>
      {open && (
        <div
          className="mt-1.5 flex w-full flex-col gap-2 rounded-lg p-2.5"
          style={{ background: n.paper }}
        >
          <div>
            <p
              className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: n.muted }}
            >
              Result
            </p>
            <p className="font-mono text-[12px] leading-relaxed" style={{ color: "#B45309" }}>
              {step.result}
            </p>
          </div>
          <div>
            <p
              className="mb-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: n.muted }}
            >
              Arguments
            </p>
            <dl className="flex flex-col gap-0.5 font-mono text-[12px] leading-relaxed">
              {Object.entries(step.args ?? {}).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <dt className="shrink-0" style={{ color: n.muted }}>
                    {k}
                  </dt>
                  <dd className="min-w-0 flex-1" style={{ color: n.ink }}>
                    {String(v)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </li>
  );
}

/* Pattern 1. One line of cause, one action, and their words untouched above
   it. The cause is what happened to them, not the status code. */
function RetryRow({
  n,
  text,
  onRetry,
  busy,
  alt,
}: {
  n: N;
  text: string;
  onRetry: () => void;
  busy: boolean;
  alt?: string;
}) {
  return (
    <div
      className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl px-3 py-2.5"
      style={{ background: n.paper }}
    >
      <span className="min-w-0 flex-1 text-[13px]" style={{ color: n.secondary }}>
        {text}
      </span>
      <button
        onClick={onRetry}
        disabled={busy}
        className="flex shrink-0 items-center gap-1.5 text-[13px] font-medium disabled:opacity-60"
        style={{ color: ACCENT }}
      >
        {busy ? (
          <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
        ) : (
          <RotateCcw className="size-3.5" strokeWidth={2} />
        )}
        Retry
      </button>
      {alt && (
        <button className="shrink-0 text-[13px] font-medium" style={{ color: n.secondary }}>
          {alt}
        </button>
      )}
    </div>
  );
}

/* Pattern 3. Under the header, above the conversation, and never over it. */
function Banner({
  n,
  tone,
  icon,
  children,
  action,
}: {
  n: N;
  tone: "neutral" | "warn";
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: string;
}) {
  const bg = tone === "warn" ? "#FEF3C7" : n.paper;
  const fg = tone === "warn" ? "#92400E" : n.secondary;
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 text-[12px]"
      style={{ background: bg, color: fg }}
    >
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex-1 leading-snug">{children}</span>
      {action && (
        <button className="shrink-0 font-semibold underline underline-offset-2">
          {action}
        </button>
      )}
    </div>
  );
}

function Skeleton({ n }: { n: N }) {
  return (
    <div className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className={i % 2 ? "flex justify-end" : ""}>
          <div className="flex w-[70%] flex-col gap-1.5">
            <div className="h-3.5 w-full rounded-full" style={{ background: n.paper }} />
            <div className="h-3.5 w-[80%] rounded-full" style={{ background: n.paper }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── the panel ─────────────────────────────────────────────────────────── */

const SLOW_AFTER_MS = 6000;
const MAX_CHARS = 240;
const SOFT_AT = 200;
const MAX_FILE = 5 * 1024 * 1024;

function Messenger({ id, dark }: { id: Id; dark: boolean }) {
  const n = dark ? DARK : LIGHT;
  const [draft, setDraft] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /* A retry that never succeeds is the same dead picture in a different
     costume, so the second attempt works. */
  const [recovered, setRecovered] = useState(false);
  const [slow, setSlow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* No reset on scenario change: the studio remounts the panel by key, so
     every scenario starts on a fresh component rather than on the last one's
     leftovers. */

  /* The slow state is a real threshold, reached by waiting. */
  useEffect(() => {
    if (id !== "slow") return;
    const t = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(t);
  }, [id]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const retry = useCallback(() => {
    setBusy(true);
    timer.current = setTimeout(() => {
      setBusy(false);
      setRecovered(true);
    }, 1400);
  }, []);

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setFileError(`${f.name} isn't an image.`);
      return;
    }
    if (f.size > MAX_FILE) {
      setFileError(`That file is ${(f.size / 1024 / 1024).toFixed(1)} MB. The limit is 5 MB.`);
      return;
    }
    setFileError(null);
  };

  const over = draft.length > MAX_CHARS;
  const nearing = draft.length >= SOFT_AT;
  const banner = (() => {
    switch (id) {
      case "offline":
        return (
          <Banner n={n} tone="warn" icon={<WifiOff className="size-3.5" strokeWidth={2} />}>
            You&rsquo;re offline. Anything you send will go when you&rsquo;re back.
          </Banner>
        );
      case "reconnecting":
        return (
          <Banner n={n} tone="neutral" icon={<Loader2 className="size-3.5 animate-spin" strokeWidth={2} />}>
            Reconnecting…
          </Banner>
        );
      case "rateLimited":
        return (
          <Banner n={n} tone="warn" icon={<AlertTriangle className="size-3.5" strokeWidth={2} />} action="Talk to a person">
            Too many messages just now. Try again in a minute.
          </Banner>
        );
      case "expired":
        return (
          <Banner n={n} tone="neutral" icon={<RotateCcw className="size-3.5" strokeWidth={2} />} action="Start a new one">
            This conversation has closed. You can still read it.
          </Banner>
        );
      default:
        return null;
    }
  })();

  const micGone = id === "micDenied";

  return (
    <div
      className="flex h-[620px] w-[390px] shrink-0 flex-col overflow-hidden rounded-[20px] shadow-[0_18px_50px_-12px_rgba(15,17,26,0.28)]"
      style={{ background: n.surface }}
    >
      {/* header */}
      <div
        className="flex shrink-0 items-center gap-2.5 px-4 py-3"
        style={{ borderBottom: `1px solid ${n.line}` }}
      >
        <span
          className="grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold text-white"
          style={{ background: ACCENT }}
        >
          T
        </span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[14px] font-semibold" style={{ color: n.ink }}>
            Tars
          </span>
          <span className="truncate text-[11px]" style={{ color: n.muted }}>
            Virtual Assistant
          </span>
        </span>
        <X className="ml-auto size-4 shrink-0" strokeWidth={2} style={{ color: n.secondary }} />
      </div>

      {banner}

      {/* transcript */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {id === "loading" ? (
          <Skeleton n={n} />
        ) : (
          <>
            <Bubble n={n}>{ASK}</Bubble>

            {id === "sendFailed" && !recovered && (
              <RetryRow
                n={n}
                text="Couldn't send that."
                onRetry={retry}
                busy={busy}
              />
            )}

            {(id === "thinking" || id === "slow") && (
              <div className="flex items-center gap-2 text-[14px] font-medium" style={{ color: n.ink }}>
                <Loader2 className="size-4 animate-spin" strokeWidth={2} style={{ color: ACCENT }} />
                {id === "slow" && slow
                  ? "Still working on it…"
                  : "Searched the pricing guide"}
              </div>
            )}

            {(id === "ok" ||
              ((id === "noAnswer" ||
                id === "cutOff" ||
                id === "sendFailed" ||
                id === "handoffFailed" ||
                id === "aiFailed") &&
                recovered)) && (
              <div className="flex flex-col items-start">
                <Trace n={n} steps={STEPS_OK} secs={4} dark={dark} />
                <AiText n={n} text={ANSWER} />
                <Toolbar n={n} />
              </div>
            )}

            {/* The work survives the failure. Everything the agent did is on
                the record and only the writing is missing, so the trace stays
                and the retry sits under it — throwing the trace away would
                make a turn that half-happened look like one that never
                started. */}
            {id === "aiFailed" && !recovered && (
              <div className="flex w-full flex-col items-start gap-2">
                <Trace n={n} steps={STEPS_OK} secs={4} dark={dark} />
                <RetryRow
                  n={n}
                  text="The answer didn't come back."
                  onRetry={retry}
                  busy={busy}
                />
              </div>
            )}

            {id === "toolFailed" && (
              <div className="flex flex-col items-start">
                <Trace n={n} steps={STEPS_FAILED} secs={4} dark={dark} />
                <AiText n={n} text={ANSWER_DEGRADED} />
                <Toolbar n={n} />
              </div>
            )}

            {id === "noAnswer" && !recovered && (
              <RetryRow n={n} text="That didn't go through." onRetry={retry} busy={busy} />
            )}

            {id === "cutOff" && !recovered && (
              <div className="flex w-full flex-col items-start gap-2">
                <AiText n={n} text={PARTIAL} />
                <RetryRow n={n} text="The answer stopped early." onRetry={retry} busy={busy} />
              </div>
            )}

            {id === "handoffFailed" && !recovered && (
              <RetryRow
                n={n}
                text="No one's available right now."
                onRetry={retry}
                busy={busy}
                alt="Leave a message"
              />
            )}
          </>
        )}
      </div>

      {/* composer */}
      <div className="shrink-0 px-4 pb-4 pt-1">
        {fileError && (
          <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[12px]" style={{ color: "#B45309" }}>
            <AlertTriangle className="size-3.5 shrink-0" strokeWidth={2} />
            {fileError}
          </p>
        )}
        {micGone && (
          <p className="mb-1.5 px-1 text-[12px]" style={{ color: n.muted }}>
            Voice isn&rsquo;t available in this browser.
          </p>
        )}
        <div
          className="flex items-center gap-2 rounded-full px-2 py-1.5"
          style={{
            border: `1px solid ${over ? "#DC2626" : n.line}`,
            background: n.canvas,
          }}
        >
          <label
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full"
            style={{ color: n.secondary }}
          >
            <Paperclip className="size-4" strokeWidth={1.8} />
            <input
              type="file"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
          </label>
          <input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setFileError(null);
            }}
            placeholder="Ask me anything…"
            className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
            style={{ color: n.ink }}
          />
          {/* the count arrives only when it starts to matter */}
          {nearing && (
            <span
              className="shrink-0 text-[11px] tabular-nums"
              style={{ color: over ? "#DC2626" : n.muted }}
            >
              {MAX_CHARS - draft.length}
            </span>
          )}
          {!micGone && (
            <span
              className="grid size-8 shrink-0 place-items-center rounded-full text-white"
              style={{ background: ACCENT }}
            >
              <Mic className="size-4" strokeWidth={1.8} />
            </span>
          )}
        </div>
        {over && (
          <p className="mt-1.5 px-1 text-[12px]" style={{ color: "#DC2626" }}>
            That&rsquo;s {draft.length - MAX_CHARS} characters over. Shorten it, or send it in two.
          </p>
        )}
      </div>
    </div>
  );
}

/* ── the studio ────────────────────────────────────────────────────────── */

export default function ErrorStates() {
  const [id, setId] = useState<Id>("toolFailed");
  const [dark, setDark] = useState(false);
  const current = SCENARIOS.find((s) => s.id === id)!;
  return (
    <main className="min-h-screen bg-[#F7F7F8] px-8 py-10">
      <header className="mb-8 max-w-[680px]">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: ACCENT }}>
          Messenger · study
        </p>
        <h1 className="mt-1 text-[24px] font-semibold text-[#1A1A1A]">
          When it doesn&rsquo;t work
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-[#666]">
          Seventeen conditions, five patterns. Everything here is wired: Retry
          retries and succeeds on the second attempt, the composer checks a
          real file, and the slow state arrives by waiting for it.
        </p>
      </header>

      <div className="flex flex-wrap items-start gap-8">
        {/* the list */}
        <div className="w-[320px] shrink-0">
          {PATTERNS.map((p) => (
            <section key={p.id} className="mb-5">
              <div className="mb-1 flex items-baseline gap-2">
                <span
                  className="grid size-4 shrink-0 place-items-center rounded text-[10px] font-bold text-white"
                  style={{ background: ACCENT }}
                >
                  {p.n}
                </span>
                <span className="text-[12px] font-semibold uppercase tracking-wider text-[#555]">
                  {p.label}
                </span>
              </div>
              <p className="mb-2 pl-6 text-[11px] leading-snug text-[#999]">{p.blurb}</p>
              <div className="flex flex-col gap-1">
                {SCENARIOS.filter((s) => s.pattern === p.id).map((s) => {
                  const on = s.id === id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setId(s.id)}
                      className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left text-[12px] transition-colors ${
                        on
                          ? "border-[#C4A9E8] bg-[#F8F4FF] font-semibold text-[#6D33AA]"
                          : "border-transparent text-[#555] hover:bg-white"
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">{s.label}</span>
                      {s.try && (
                        <span className="shrink-0 rounded bg-[#EFEAF9] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[#7C3AED]">
                          try it
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* the panel */}
        <div className="shrink-0">
          <div className="mb-3 flex items-center gap-2">
            {(["light", "dark"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setDark(m === "dark")}
                className={`rounded-lg border px-2.5 py-1 text-[12px] capitalize ${
                  dark === (m === "dark")
                    ? "border-[#C4A9E8] bg-[#F8F4FF] font-semibold text-[#6D33AA]"
                    : "border-[#E5E5E5] text-[#666]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <Messenger key={id + String(dark)} id={id} dark={dark} />
        </div>

        {/* what it is and why */}
        <div className="w-[300px] shrink-0">
          <h2 className="text-[15px] font-semibold text-[#222]">{current.label}</h2>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#A8A8A8]">
            Pattern {PATTERNS.find((p) => p.id === current.pattern)?.n} ·{" "}
            {PATTERNS.find((p) => p.id === current.pattern)?.label}
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#666]">{current.note}</p>
          {current.try && (
            <p className="mt-3 rounded-lg bg-white px-3 py-2 text-[12px] text-[#7C3AED] ring-1 ring-[#EFEAF9]">
              Try it: {current.try}
            </p>
          )}
          <div className="mt-6 border-t border-[#E8E8E8] pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A8A8A8]">
              Rules
            </p>
            <ul className="mt-2 flex flex-col gap-2 text-[12px] leading-snug text-[#777]">
              <li>
                <b className="text-[#555]">Never lose what they typed.</b> A failed
                send that also eats the sentence is two failures.
              </li>
              <li>
                <b className="text-[#555]">Say the consequence, not the code.</b> The
                only person helped by a 503 is reading logs.
              </li>
              <li>
                <b className="text-[#555]">A refusal is not an error.</b> Styling it
                as one teaches people the product is broken when it is working.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
