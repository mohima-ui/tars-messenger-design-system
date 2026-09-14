"use client";

import { useEffect, useRef, useState } from "react";

import { play, setVolume } from "cuelume";

import type { LauncherProps } from "./Messenger";

/* A capsule that opens into a prompt, and then types out the rest.

   Shut, it is a tall capsule barely wider than the disc inside it; it opens
   once, passing through a squircle and stretching into a wide pill, and from
   then on it stays open while questions are typed into it, held, and
   backspaced away. The chip is sized to whatever it currently holds, so it
   grows under the typing and retreats under the deleting.

   Two mechanics carry it, and both are about the fact that transform is a
   single property and CSS transitions do not know what a shape is:

   The morph is free. The radius is held at exactly half the closed width, so
   the same constant number draws a stadium when the box is tall, a squircle
   when it is square, and a pill when it is wide. Animating the radius
   alongside the box would mean keeping two curves in step to get one shape;
   holding it still means the box's own proportions do the morphing.

   The disc never moves. It is pinned to the right-hand end, and in the closed
   state that end is the middle, because the box is only a few pixels wider
   than the disc. So it appears to travel outward as the chip opens without a
   single translate involved — the thing it is pinned to is what moved. */

/* Closed is fractionally wider than the disc plus its inset, and taller than
   it is wide: a portrait capsule reads as something folded up, where a circle
   reads as a button that is finished. */
const DISC = 44;
/* Set so the disc plus its inset comes to a 64px chip. The disc stays 44 —
   growing it too would just be a bigger button, where the extra inset is what
   makes the open pill read as a field with something sitting in it. */
const PAD = 10;
const SHUT_W = DISC + PAD * 2;
const SHUT_H = 74;
const OPEN_H = DISC + PAD * 2;

/* Half the closed width. The one number that makes every stage of the morph
   correct — see above. */
const RADIUS = SHUT_W / 2;

/* It opens once and stays open; only the line inside changes.

   Folding shut between prompts was the reference's move and it is wrong for a
   launcher: the reference is a hero element that performs, where this sits in
   a corner for the length of a session. Opening and closing every four
   seconds is a corner that keeps flinching, and worse, the offer is
   unavailable for a third of the time — you go to press it and it is a
   capsule again.

   So the fold happens once, on arrival, and after that the chip is a fixed
   thing with a sentence being typed in and out of it. */
/* Pushed out of the shared corner inset, on the chip rather than in the
   Messenger, so the other three launchers keep their placement.

   The shared inset is set for a disc with an orbit reaching past it. This is a
   wide pill with nothing around it, so the same numbers leave it stranded well
   inside the corner. These land the pill 32px from the right edge and 32px
   from the bottom.

   The vertical carries an extra 5: the wrapper is SHUT_H tall so the closed
   capsule has somewhere to be, and the open pill is centred in it, leaving
   (SHUT_H - OPEN_H) / 2 of slack under the pill. Measuring 32 from the
   wrapper would put the pill at 37. */
const NUDGE_X = 72 - 32;
const NUDGE_Y = 56 - 32 + (SHUT_H - OPEN_H) / 2;

const INTRO_MS = 700;
const EXPAND_MS = 620;

/* Typing is uneven on purpose — a fixed interval per character is the tell
   that this is a loop and not a hand. TYPE_MS is the base and TYPE_JITTER the
   spread around it, applied per keystroke.

   Deleting is roughly twice as quick, which is how backspace actually
   behaves: you type at reading speed and erase at held-key speed. */
const TYPE_MS = 42;
const TYPE_JITTER = 34;
const DELETE_MS = 20;

/* Long enough to read the finished line twice over before it starts to go. */
const HOLD_MS = 2200;

/* A beat of empty chip between the deletion and the next line, so the two
   prompts read as separate rather than one mutating string. */
const GAP_MS = 320;

/* The typing cue.

   A real typewriter sample if one has been dropped in, and a synthesized key
   click if not — so the demo makes a sound either way and gains the better one
   without a code change. The sample is licensed stock (Epidemic Sound) and is
   not in the repo; SAMPLE_SRC is where it goes.

   Not one per character either way. At ~50ms a keystroke that is twenty
   sounds a second, which stops being texture and becomes a rattle. Every
   third keystroke reads as typing while leaving gaps for the ear, and spaces
   are skipped because the pause between words is part of what sells it. */
const SAMPLE_SRC = "/sounds/typewriter.mp3";
const SAMPLE_VOLUME = 0.3;
const KEYS_PER_CUE = 3;

/* Enough copies to overlap. One Audio element restarted mid-play truncates
   the previous hit, which on a percussive sample is audible as a clipped
   keystroke; four rotating copies cover the tail at any typing speed. */
const VOICES = 4;

/* The synthesized fallback: cuelume's `press` recipe.

   Three hand-built alternatives were tried here — a keyboard switch, a manual
   typewriter, an old buckling-spring board — each layering filtered noise,
   partials and a low body in Web Audio. All three sounded worse than this one
   line, which is the useful result: at this length and this volume, played
   every third character under a moving chip, there is not enough sound for the
   extra layers to be heard as anything but noise.

   So the graph is gone and the recipe is back. If the sample lands at
   SAMPLE_SRC it takes over anyway. */
const TYPE_CUE = "press";
const TYPE_VOLUME = 0.2;

/* Restored after each cue, since cuelume's volume is global and the panel's
   send/reply cues are set to this. */
const BASE_VOLUME = 0.5;

export function ChipCycleLauncher({
  open,
  onClick,
  onStart,
  starters,
}: LauncherProps & { starters: string[] }) {
  const [hover, setHover] = useState(false);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [typed, setTyped] = useState("");
  const keystrokes = useRef(0);
  const voices = useRef<HTMLAudioElement[]>([]);

  /* Built once and held, because constructing an Audio element per keystroke
     leaks elements and re-fetches on some browsers.

     If the file is not there the elements simply never become playable and
     every cue falls through to the recipe — no probing request, no error
     handling beyond the flag. */
  useEffect(() => {
    const pool = Array.from({ length: VOICES }, () => {
      const el = new Audio(SAMPLE_SRC);
      el.preload = "auto";
      el.volume = SAMPLE_VOLUME;
      return el;
    });
    voices.current = pool;
    return () => {
      pool.forEach((el) => {
        el.pause();
        el.src = "";
      });
      voices.current = [];
    };
  }, []);

  /* The one fold, shortly after arrival rather than immediately.

     Opening on the first frame means the chip is simply wide — nobody sees it
     unfold, so the gesture is spent for nothing. A beat of capsule first is
     what makes the opening legible as an opening. */
  useEffect(() => {
    const t = window.setTimeout(() => setExpanded(true), INTRO_MS);
    return () => window.clearTimeout(t);
  }, []);

  const current = starters[index] ?? starters[0];

  /* One self-rescheduling timeout walks the whole cycle: type up to the full
     line, hold, delete back to nothing, then hand over to the next prompt.

     A timeout chain rather than an interval because every phase runs at a
     different speed, and the jitter means even the typing has no fixed one —
     an interval would need tearing down and rebuilding on each keystroke
     anyway.

     Frozen while hovered or while the panel is open. Someone reading the chip
     is deciding whether to press it, and a line that rewrites itself under a
     pointer is a control that moved while being aimed at. */
  useEffect(() => {
    if (!expanded || hover || open) return;

    const done = typed.length === current.length;

    if (!done) {
      const t = window.setTimeout(() => {
        const next = current.slice(0, typed.length + 1);
        const char = next[next.length - 1];
        if (char !== " " && keystrokes.current++ % KEYS_PER_CUE === 0) {
          const voice = voices.current[keystrokes.current % VOICES];
          /* readyState says whether the sample actually loaded. HAVE_CURRENT_DATA
             or better means there is audio to play; anything less — missing
             file, still loading, blocked — takes the synthesized cue instead. */
          if (voice && voice.readyState >= 2) {
            voice.currentTime = 0;
            /* Rejects until the page has been interacted with. That is the
               correct outcome for a sound nobody asked for, so it is swallowed
               rather than handled. */
            void voice.play().catch(() => {});
          } else {
            setVolume(TYPE_VOLUME);
            play(TYPE_CUE);
            setVolume(BASE_VOLUME);
          }
        }
        setTyped(next);
      }, TYPE_MS + Math.random() * TYPE_JITTER);
      return () => window.clearTimeout(t);
    }

    /* Full line: hold it, then run the deletion to empty and advance. */
    let deleting = 0;
    const t = window.setTimeout(() => {
      const tick = () => {
        setTyped((prev) => {
          if (prev.length > 0) {
            deleting = window.setTimeout(tick, DELETE_MS);
            return prev.slice(0, -1);
          }
          deleting = window.setTimeout(
            () => setIndex((i) => (i + 1) % starters.length),
            GAP_MS,
          );
          return prev;
        });
      };
      tick();
    }, HOLD_MS);

    return () => {
      window.clearTimeout(t);
      window.clearTimeout(deleting);
    };
  }, [expanded, hover, open, typed, current, starters.length]);

  return (
    <span
      className="relative flex items-center justify-end"
      style={{
        height: SHUT_H,
        transform: `translate(${NUDGE_X}px, ${NUDGE_Y}px)`,
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <button
        type="button"
        aria-label={`Ask Tars: ${current}`}
        /* Pressing it asks the question it is showing. Putting a prompt in the
           launcher is only worth doing if reading it and asking it are one
           decision. */
        onClick={() => (expanded ? onStart(current) : onClick())}
        className="relative flex shrink-0 items-center overflow-hidden"
        style={{
          height: expanded ? OPEN_H : SHUT_H,
          /* max-content when open, so the box is exactly as long as the words
             inside it — a fixed open width would leave the shorter prompts
             trailing empty chip, which is the tell that this is a container
             rather than a sentence. */
          width: expanded ? "max-content" : SHUT_W,
          borderRadius: RADIUS,
          background: "#FFFFFF",
          boxShadow:
            hover && !open
              ? "0 18px 40px -12px rgba(76,29,149,0.34), 0 4px 10px -4px rgba(15,17,26,0.14), 0 0 0 1px rgba(109,51,170,0.12)"
              : "0 14px 34px -14px rgba(76,29,149,0.26), 0 3px 8px -4px rgba(15,17,26,0.12), 0 0 0 1px rgba(109,51,170,0.08)",
          opacity: open ? 0 : 1,
          pointerEvents: open ? "none" : "auto",
          /* Eased for the fold, instant once there is text in it. An eased
             width during typing would leave the box trailing 600ms behind the
             characters it is supposed to be growing around — the chip would
             be catching up to its own contents for the whole line. */
          transition: `width ${
            typed.length > 0 ? 0 : EXPAND_MS
          }ms cubic-bezier(0.22, 1, 0.32, 1), height ${EXPAND_MS}ms cubic-bezier(0.22, 1, 0.32, 1), box-shadow 300ms ease-out, opacity 240ms ease-out`,
        }}
      >
        {/* The line as it stands, plus the caret.

            Rendered from a string that grows and shrinks rather than a
            reveal over finished text: the chip is sized to its contents, so
            the box widening keystroke by keystroke is what sells this as
            typing. A mask over pre-laid-out text would type inside a box that
            was already the wrong width.

            pr is the disc's width plus its inset plus a gap, since the disc
            sits over this. */}
        <span
          className="flex shrink-0 items-center py-2 pl-5 text-[13.5px] font-normal whitespace-pre text-[#3F2B57]"
          style={{
            paddingRight: DISC + PAD + 14,
            opacity: expanded ? 1 : 0,
            transition: "opacity 200ms ease-out",
          }}
        >
          {typed}
          {/* Sits in the flow so it is pushed along by the text, and holds a
              little width of its own so the chip does not twitch by a pixel
              as it blinks. */}
          <span
            aria-hidden
            className="ml-[1px] inline-block h-[1.05em] w-[1.5px]"
            style={{
              backgroundColor: "#6D33AA",
              animation: "caret-blink 1s steps(1, end) infinite",
            }}
          />
        </span>

        {/* Pinned to the right-hand end, which is the middle when the chip is
            shut. It never moves; the end it is attached to does. */}
        <span
          className="absolute flex items-center justify-center rounded-full"
          style={{
            width: DISC,
            height: DISC,
            right: PAD,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "#6D33AA",
            boxShadow: "0 6px 16px -6px rgba(109,51,170,0.55)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </span>
      </button>
    </span>
  );
}
