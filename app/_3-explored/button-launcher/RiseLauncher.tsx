"use client";

import { useEffect, useRef, useState } from "react";

import { play, setVolume } from "cuelume";

import type { LauncherProps } from "./Messenger";

/* Starters that rise out of the launcher and fade away, one at a time.

   The other four in the family hold their prompts until something asks for
   them — a hover, a scroll, a fold. This one gives them away continuously and
   takes them back: a question leaves the button, drifts up past the corner,
   and is gone before the next one starts. Nothing accumulates and nothing has
   to be dismissed.

   What that buys is a launcher that reads at a glance and never occupies the
   page. What it costs is permanence: a question you were still reading will
   leave, and you cannot get it back except by waiting for the cycle. Two
   things make that survivable —

   They are slow. Long enough to read twice, which is the difference between a
   prompt and a ticker.

   They stop when looked at. The whole column freezes under the pointer, so
   the moment you decide to press one it is no longer a moving target. That is
   the only reason a drifting element is allowed to be a button at all. */

/* Three prompts in the air at a time, evenly spaced up the column.

   LIFE is the full travel. EMIT is the gap between departures, and the ratio
   between them is how many are visible at once: at a third of the travel, a
   prompt leaves as the one before it reaches a third of the way up and the
   one before that reaches two thirds. That reads as a column of questions
   moving rather than as one question at a time — denser than the original
   pairing, and the point at which it would become a ticker is around four. */
const LIFE_MS = 5200;
const EMIT_MS = 1600;

/* Derived, not typed: how many can legitimately be mid-flight is exactly the
   travel divided by the spacing, plus one for the handover frame. It was a
   fixed 3 when the spacing was 2.6s, which at 1.6s would have started
   deleting live prompts out from under the animation. */
const MAX_IN_FLIGHT = Math.ceil(LIFE_MS / EMIT_MS) + 1;

/* A cue on the first four departures — one full pass through the starters —
   and silence from then on.

   The count is what makes this bearable. A sound on every emission is a
   corner that chimes every 1.6 seconds for as long as the tab is open, which
   is the behaviour of an alarm, not a launcher. Four says "something is
   offering you things" and then stops making the point.

   `chime` is the softest arrival in the palette: a two-note ascending bell
   with a long shimmer tail, so it lands as a small event rather than an
   alert. Quiet on top of that, because this plays unasked-for — the visitor
   did not press anything to cause it.

   It stays silent for anyone who has not interacted with the page at all;
   cuelume checks navigator.userActivation and does nothing, which is the
   right outcome for a sound nobody asked for. */
const CUE = "chime";
const CUE_COUNT = 4;
const CUE_VOLUME = 0.18;

/* Restored after each cue, since cuelume's volume is global and the panel's
   own send/reply cues are set to this. */
const BASE_VOLUME = 0.5;

/* How far up they travel. Roughly five chip-heights — far enough to read as
   leaving rather than nudging, short enough that the last of the fade happens
   well inside the viewport rather than off the top of a laptop screen. */
const RISE_PX = 210;

/* The height at which it starts going. Pinned in pixels rather than left to a
   percentage of the animation, because the climb is eased — a percentage of
   the duration lands at a different height every time the curve is touched.

   The 50px between this and RISE_PX are what the fade is spent over, so a
   prompt keeps climbing while it goes rather than dissolving in place. Close
   the gap if you want it to stop and then vanish. */
const FADE_AT_PX = 160;

/* The first one waits, the rest do not.

   Emitting on the first frame means the opening prompt appears already in
   place at the bottom of its travel, which reads as a chip that was always
   there. A beat of empty corner first makes the same element read as
   something the launcher produced. */
const LEAD_MS = 900;

/* A squircle rather than a disc.

   Every floating launcher on the web is a circle, which makes a circle the
   one shape that says nothing. A rounded square keeps the same footprint and
   the same weight while reading as a tile — closer to an app icon than to a
   help bubble, which is the right association for something that opens a
   working surface rather than a support form.

   14 on a 54px button — around a quarter of the width, so it reads as a tile
   with softened corners rather than as a circle that fell short. */
const CORNER = 14;

/* Pushed out of the shared corner inset, on the launcher rather than in the
   Messenger, so the other four keep their placement. These land the button
   32px from the right edge and 32px from the bottom.

   Both carry the slack between the hit area and the button: the box is HIT
   wide with a BUTTON-wide control centred in it, so measuring 32 from the box
   would leave the visible button further out than asked. Derived, so
   resizing the button does not quietly move it. */
const HIT = 56;
const BUTTON = 54;
const SLACK = (HIT - BUTTON) / 2;
const NUDGE_X = 72 - 32 + SLACK;
const NUDGE_Y = 56 - 32 + SLACK;

export function RiseLauncher({
  open,
  onClick,
  onStart,
  starters,
  children,
}: LauncherProps & { starters: string[]; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);

  /* Each in-flight prompt carries its own id, because two consecutive cycles
     can hold the same text and React would otherwise reuse the element —
     which means inheriting the old one's animation position rather than
     starting from the button. */
  const [flight, setFlight] = useState<{ id: number; text: string }[]>([]);
  const seq = useRef(0);

  /* Emission. Paused while the panel is open and while the pointer is on the
     column: open, the prompts are being offered inside the panel instead, and
     hovered, freezing the departure is half of what makes them clickable.

     The lead only applies to the very first one — after a hover the cycle
     picks up at its normal spacing rather than pausing again. */
  useEffect(() => {
    if (open || hover || starters.length === 0) return;

    let loop = 0;
    const emit = () => {
      const id = seq.current++;
      if (id < CUE_COUNT) {
        setVolume(CUE_VOLUME);
        play(CUE);
        setVolume(BASE_VOLUME);
      }
      setFlight((prev) => [
        /* A hard cap on what can be in the air. The timers cannot normally
           exceed MAX_IN_FLIGHT, but a backgrounded tab fires its queued
           intervals in a burst on return, and without this the corner would
           come back to life holding a dozen chips at once. */
        ...prev.slice(-(MAX_IN_FLIGHT - 1)),
        { id, text: starters[id % starters.length] },
      ]);
    };

    const lead = window.setTimeout(
      () => {
        emit();
        loop = window.setInterval(emit, EMIT_MS);
      },
      seq.current === 0 ? LEAD_MS : EMIT_MS,
    );

    return () => {
      window.clearTimeout(lead);
      window.clearInterval(loop);
    };
  }, [open, hover, starters]);

  return (
    <span
      className="relative flex size-14 items-center justify-center"
      style={{
        /* Placement first, then the hover scale — the leftmost transform in
           the list is the outermost, so the scale happens about the button's
           own centre wherever the translate has put it. */
        transform: `translate(${NUDGE_X}px, ${NUDGE_Y}px) scale(${
          hover && !open ? 1.04 : 1
        })`,
        transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      {/* The column the prompts travel up.

          Anchored to the launcher's right edge so a long question grows
          leftward, away from the viewport edge — the one thing that keeps a
          corner launcher's chips on screen. Zero height and bottom-anchored to
          the button's middle, so every prompt starts from behind the disc
          rather than above it. */}
      <span
        className="pointer-events-none absolute right-0 bottom-1/2 w-max"
        style={{
          opacity: open ? 0 : 1,
          transition: "opacity 200ms ease-out",
        }}
      >
        {flight.map((f) => (
          /* Two nested elements per prompt, because two transforms are needed
             and transform is one property: the outer climbs, the inner sways
             sideways. On one element the sway would cancel the climb. */
          <span
            key={f.id}
            className="absolute right-0 bottom-0 w-max"
            /* Removed when its own travel finishes rather than on a timer.

               A paused animation never ends, so a prompt frozen under the
               pointer is also exempt from being cleaned up — which is what
               makes the freeze trustworthy. A timeout would delete the chip
               someone was in the middle of reaching for. */
            onAnimationEnd={(e) => {
              if (e.animationName !== "prompt-rise") return;
              setFlight((prev) => prev.filter((x) => x.id !== f.id));
            }}
            style={{
              animation: `prompt-rise ${LIFE_MS}ms cubic-bezier(0.33, 0.1, 0.4, 1) forwards`,
              animationPlayState: hover ? "paused" : "running",
              /* Set here rather than in the keyframe so the travel is a
                 constant one can reason about, not a number buried in CSS. */
              ["--rise" as string]: `${-RISE_PX}px`,
              ["--fade" as string]: `${-FADE_AT_PX}px`,
            }}
          >
            <span
              className="block w-max"
              style={{
                /* Out of phase with the climb, and slower, so the pair never
                   resolves into a single diagonal. */
                animation: `chip-float 3400ms ease-in-out infinite`,
                animationPlayState: hover ? "paused" : "running",
              }}
            >
              <button
                type="button"
                /* Only the frozen ones are reachable. A moving target in the
                   tab order is a control that cannot be used by anyone
                   navigating by keyboard. */
                tabIndex={hover ? 0 : -1}
                onClick={() => onStart(f.text)}
                className="pointer-events-auto inline-flex w-max items-center rounded-full px-4 text-[14px] font-medium whitespace-nowrap text-[var(--ink)]"
                style={{
                  /* Padding and line-height in the style rather than as
                     utilities, because the two have to be reasoned about
                     together: a button's height is padding plus the line box,
                     and Tailwind's leading-none makes that line box exactly
                     the font size only for this one font size. Fixing the
                     line height at 1 keeps 12 + 14 + 12 provable. */
                  paddingTop: 12,
                  paddingBottom: 12,
                  lineHeight: 1,
                  backgroundColor: "#FFFFFF",
                  boxShadow:
                    "0 14px 32px -10px rgba(15,17,26,0.28), 0 4px 10px -4px rgba(15,17,26,0.16), 0 0 0 1px rgba(15,17,26,0.05)",
                }}
              >
                {f.text}
              </button>
            </span>
          </span>
        ))}
      </span>

      <button
        type="button"
        aria-label={open ? "Close the conversation" : "Ask Tars anything"}
        aria-expanded={open}
        onClick={onClick}
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          width: BUTTON,
          height: BUTTON,
          borderRadius: CORNER,
          backgroundColor: "#6D33AA",
          boxShadow:
            hover && !open
              ? "0 14px 30px -8px rgba(109,51,170,0.5), 0 2px 6px -2px rgba(15,17,26,0.2)"
              : "0 10px 24px -6px rgba(109,51,170,0.38), 0 2px 6px -2px rgba(15,17,26,0.16)",
          transition: "box-shadow 300ms ease-out",
        }}
      >
        {children}
      </button>
    </span>
  );
}
