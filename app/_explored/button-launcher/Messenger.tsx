"use client";

import { ChevronDown, Paperclip, ArrowUp, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  AccentSparkle,
  FOLLOW_UPS,
  FOLLOW_UP_FALLBACK,
  REPLIES,
  REPLY_FALLBACK,
  REASONING_STEPS,
  RichText,
  STARTERS,
  STREAM_MS_PER_WORD,
  formatTime,
  thinkFor,
} from "@/components/launcher/GlassComposer";

/* The button-based launcher.

   The other family merges the launcher and the composer into one surface: the
   thing you type into is the thing that opens. This one separates them again —
   a button that does nothing but open, and a window that carries its own
   composer inside it. That is the pattern every messenger on the web uses, and
   the reason to build it here is to have the two arguments side by side rather
   than described.

   The split is deliberate: everything below the button is fixed across the
   variations, so the only thing being compared is the button. A variation set
   where the panel also changes tells you which one you like and nothing about
   why.

   The conversation itself — the answers, the follow-ups, the thinking time, the
   word-by-word reveal — is imported from the composer family rather than
   rewritten. Two demos disagreeing about what Tars says would be two products.

   Deliberately not built on GlassComposer. That component's composer *is* its
   launcher; the two are the same element, animating between states. Making it
   render a separate button as well would mean a mode where half of it is
   inert, which is a worse thing to maintain than a second, smaller component
   that shares the parts that matter. */

const PANEL_W = 400;
const PANEL_H = 620;
/* Distance from the corner, and the gap between the panel and the button it
   opens from. The inset is the same on both axes so the button reads as
   sitting in the corner rather than on one edge of it. */
/* Two insets, not one.

   They were a single number on the reasoning that equal margins read as "in
   the corner" rather than "on an edge". True of a bare button; not true of
   this one, where the orbit reaches 20px past the disc on every side and the
   real clearance is always the inset less 20.

   So the horizontal gets the room and the vertical stays close to where it
   was: the launcher moves in off the right edge without climbing up the page,
   which is where a floating control belongs — near the bottom of the content,
   clear of the side. */
const INSET_X = 72;
const INSET_Y = 56;
const GAP = 16;

/* The panel arrives from the button, so it scales out of it rather than
   sliding: the origin is the corner nearest the launcher, which is what makes
   the two read as one object unfolding instead of a window appearing above an
   unrelated control. */
const OPEN_MS = 280;
const OPEN_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

type Message = {
  id: number;
  from: "user" | "agent";
  text: string;
  at: number;
  prompts?: string[];
  pending?: boolean;
  thoughtMs?: number;
};

export type LauncherProps = {
  open: boolean;
  onClick: () => void;
  /* Sends a message and opens the panel in one go, so a launcher can offer
     shortcuts of its own. The panel has to open with it — a starter that
     posted a question into a window you can't see would be a message sent
     into nowhere. */
  onStart: (text: string) => void;
};

export function Messenger({
  launcher,
}: {
  /* The button, passed in rather than selected by a prop.

     A `variant="circle" | "pill" | …` string would put all five designs in
     this file behind a switch, and every future one after them. As a render
     prop, each variation owns its own button, this owns the messenger, and
     neither has to know what the other looks like. */
  launcher: (props: LauncherProps) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [streaming, setStreaming] = useState<{ id: number; words: number } | null>(
    null,
  );

  const nextId = useRef(0);
  const replyTimer = useRef<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  /* Follow the foot of the transcript, and stop following the moment you
     scroll away from it — otherwise re-reading an earlier answer while the
     next one streams drags you back down on every word. */
  const pinned = useRef(true);
  useEffect(() => {
    const el = threadRef.current;
    if (!el || !pinned.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, streaming, thinking]);

  /* One word per tick, driven off state rather than a timer of its own: the
     effect re-runs on every advance, finds nothing left to add, and stops
     itself. */
  useEffect(() => {
    if (!streaming) return;
    const m = messages.find((x) => x.id === streaming.id);
    if (!m) return setStreaming(null);
    if (streaming.words >= m.text.split(" ").length) return setStreaming(null);
    const t = window.setTimeout(
      () => setStreaming((s) => s && { ...s, words: s.words + 1 }),
      STREAM_MS_PER_WORD,
    );
    return () => window.clearTimeout(t);
  }, [streaming, messages]);

  /* Walk the narration while the agent works, and stop on the last line — a
     list that cycles says the work is going in circles. */
  useEffect(() => {
    if (!thinking) return setStepIdx(0);
    const t = window.setInterval(
      () => setStepIdx((i) => Math.min(i + 1, REASONING_STEPS.length - 1)),
      900,
    );
    return () => window.clearInterval(t);
  }, [thinking]);

  useEffect(() => () => window.clearTimeout(replyTimer.current), []);

  const send = (text: string) => {
    const body = text.trim();
    if (!body) return;
    setValue("");
    const at = Date.now();
    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, from: "user", text: body, at },
    ]);
    setThinking(true);

    /* Scaled to the answer rather than fixed: a one-word reply arriving after
       the same pause as a long one is the tell that nothing is being
       considered. */
    const answer = REPLIES[body] ?? REPLY_FALLBACK;
    const wait = thinkFor(answer);
    window.clearTimeout(replyTimer.current);
    replyTimer.current = window.setTimeout(() => {
      const id = nextId.current++;
      setThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          id,
          from: "agent",
          text: answer,
          at: Date.now(),
          prompts: FOLLOW_UPS[body] ?? FOLLOW_UP_FALLBACK,
          thoughtMs: wait,
        },
      ]);
      setStreaming({ id, words: 0 });
    }, wait);
  };

  const latest = messages[messages.length - 1];
  const followUps =
    latest?.from === "agent" && !thinking && streaming?.id !== latest.id
      ? latest.prompts
      : undefined;

  const restart = () => {
    window.clearTimeout(replyTimer.current);
    setMessages([]);
    setThinking(false);
    setStreaming(null);
    setValue("");
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50"
      style={
        {
          "--ink": "#0F111A",
          "--ink-soft": "rgba(15,17,26,0.86)",
          "--ink-mute": "rgba(15,17,26,0.58)",
          "--ink-faint": "rgba(15,17,26,0.40)",
          "--fill": "rgba(15,17,26,0.055)",
          "--fill-hover": "rgba(15,17,26,0.10)",
          "--line": "rgba(15,17,26,0.08)",
        } as React.CSSProperties
      }
    >
      {/* The panel is mounted whether or not it is open, so opening and
          closing are one transition on one element running in two directions
          — an interrupted close reverses from wherever it had got to instead
          of restarting. */}
      <div
        className="pointer-events-auto absolute flex flex-col overflow-hidden rounded-[20px] bg-white"
        style={{
          right: INSET_X,
          bottom: INSET_Y + 56 + GAP,
          width: PANEL_W,
          height: PANEL_H,
          maxWidth: `calc(100vw - ${INSET_X * 2}px)`,
          maxHeight: `calc(100dvh - ${INSET_Y * 2 + 56 + GAP}px)`,
          boxShadow:
            "0 24px 60px -12px rgba(15,17,26,0.24), 0 4px 12px -4px rgba(15,17,26,0.10), 0 0 0 1px rgba(15,17,26,0.06)",
          /* Out of the corner nearest the button, not out of its own middle:
             the panel should look like it came from the thing that was
             pressed. */
          transformOrigin: "bottom right",
          transform: open ? "scale(1)" : "scale(0.92)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: `transform ${OPEN_MS}ms ${OPEN_EASE}, opacity ${
            open ? OPEN_MS * 0.6 : OPEN_MS * 0.5
          }ms ease-out`,
        }}
        aria-hidden={!open}
      >
        <header className="flex h-14 shrink-0 items-center gap-2.5 px-4">
          <AccentSparkle size={26} paused />
          <span className="text-[15px] font-medium text-[var(--ink-soft)]">
            Tars AI Agent
          </span>
          <span className="-mr-1 ml-auto flex items-center gap-1">
            <button
              type="button"
              aria-label="Restart conversation"
              onClick={restart}
              className="flex size-8 items-center justify-center rounded-full text-[var(--ink-mute)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
            >
              <RotateCcw className="size-4" strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Close the conversation"
              onClick={() => setOpen(false)}
              className="flex size-8 items-center justify-center rounded-full text-[var(--ink-mute)] transition-colors hover:bg-[var(--fill)] hover:text-[var(--ink)]"
            >
              <ChevronDown className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
          </span>
        </header>

        <div
          ref={threadRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
          }}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-1 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {/* The opener, and the only thing in the panel that isn't a turn.

              A button launcher opens onto an empty room, where the merged
              surface opens onto whatever you just typed. Something has to be
              here, and a greeting plus three things to say is more use than a
              greeting alone. */}
          {messages.length === 0 && !thinking && (
            <div className="flex flex-col items-start gap-3 pt-2">
              <AccentSparkle size={40} />
              <p className="text-[15px] leading-snug font-medium text-[var(--ink)]">
                Ask me anything about Tars.
              </p>
              <p className="-mt-1 text-[13px] leading-relaxed font-light text-[var(--ink-mute)]">
                I can explain the product, book a demo, or hand you to someone
                if it gets complicated.
              </p>
              <div className="mt-1 flex flex-col items-start gap-1.5">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full px-3 py-1.5 text-[13px] font-normal text-[#6D33AA] transition-colors"
                    style={{
                      backgroundColor:
                        "color-mix(in srgb, #6D33AA 12%, transparent)",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) =>
            m.from === "user" ? (
              /* One speaker bubbled and the other set plainly on the pane:
                 who said what, without a label on either. */
              <div
                key={m.id}
                className="max-w-[85%] self-end rounded-[16px] px-4 py-2.5 text-[14px] font-light text-[var(--ink)]"
                style={{ backgroundColor: "var(--fill)" }}
              >
                {m.text}
              </div>
            ) : (
              <div key={m.id} className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <AccentSparkle size={24} paused={streaming?.id !== m.id} />
                  <span className="text-[12px] font-medium text-[var(--ink-mute)]">
                    Thought for {Math.round((m.thoughtMs ?? 0) / 1000)}s
                  </span>
                </div>
                <div className="text-[14px] leading-[1.55] font-light text-[var(--ink-soft)]">
                  <RichText
                    text={
                      streaming?.id === m.id
                        ? m.text.split(" ").slice(0, streaming.words).join(" ")
                        : m.text
                    }
                  />
                </div>
                {streaming?.id !== m.id && (
                  <span className="text-[11px] tabular-nums text-[var(--ink-faint)]">
                    {formatTime(m.at)}
                  </span>
                )}
              </div>
            ),
          )}

          {thinking && (
            <div className="flex items-center gap-2">
              <AccentSparkle size={24} />
              <span className="text-[14px] font-medium text-[var(--ink-mute)]">
                {REASONING_STEPS[stepIdx]}…
              </span>
            </div>
          )}
        </div>

        {/* Follow-ups above the field rather than under the answer: they are
            something to say next, so they belong with the thing you say it
            with. */}
        <div
          className="grid px-4 transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: followUps?.length ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="flex flex-wrap gap-1.5 pt-px pb-2">
              {followUps?.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => send(f)}
                  className="rounded-full px-3 py-1.5 text-[13px] font-normal text-[#6D33AA] transition-colors"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, #6D33AA 12%, transparent)",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(value);
          }}
          className="mx-4 mb-3 flex items-center gap-1 rounded-full p-1.5"
          style={{ boxShadow: "inset 0 0 0 1px var(--line)" }}
        >
          <button
            type="button"
            aria-label="Attach a file"
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-[var(--ink-mute)] transition-colors hover:bg-[var(--fill)]"
          >
            <Paperclip className="size-[18px]" strokeWidth={1.5} aria-hidden />
          </button>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask AI anything…"
            aria-label="Ask Tars anything"
            className="min-w-0 flex-1 bg-transparent px-1 text-[14px] font-light text-[var(--ink)] outline-none placeholder:text-[var(--ink-mute)]"
          />
          {/* Filled once there is something to send. Ghosting it while empty
              would read as broken; filling it on text marks the moment it
              starts doing something. */}
          <button
            type="submit"
            aria-label="Send"
            className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
            style={{
              backgroundColor: value.trim() ? "#6D33AA" : "var(--fill)",
              color: value.trim() ? "#FFFFFF" : "var(--ink)",
            }}
          >
            <ArrowUp className="size-5" strokeWidth={1.75} aria-hidden />
          </button>
        </form>

        <p className="px-4 pb-3 text-center text-[11px] text-[var(--ink-faint)]">
          AI can make mistakes. Check important information.
        </p>
      </div>

      {/* The launcher, wherever the variation puts its contents. Position and
          hit area are fixed here so the five are photographed from the same
          spot; only what sits inside is theirs. */}
      <div
        className="pointer-events-auto absolute"
        style={{ right: INSET_X, bottom: INSET_Y }}
      >
        {launcher({
          open,
          onClick: () => setOpen((v) => !v),
          onStart: (text) => {
            setOpen(true);
            send(text);
          },
        })}
      </div>
    </div>
  );
}
