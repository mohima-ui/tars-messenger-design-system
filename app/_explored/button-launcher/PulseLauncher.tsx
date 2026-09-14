"use client";

import { play, setVolume } from "cuelume";
import { CalendarDays, Sparkles, Tag } from "lucide-react";
import { useEffect, useState } from "react";

import type { LauncherProps } from "./Messenger";

/* Rings leaving the launcher, one after another.

   Where v1 puts a small presence in orbit — something travelling *around* the
   button — this pushes light *away* from it. The difference matters more than
   it sounds: an orbit is a companion and a pulse is a signal, so this is the
   louder of the two by nature, and the tuning below is mostly about keeping
   that from becoming a nag.

   Four rings on one cycle, evenly spaced. One ring repeating is a blink, and
   a blink has a rhythm you start counting; four overlapping means there is
   always a ring somewhere in its travel and no moment where the corner is
   empty, which is what turns a repeating event into a continuous state.

   Each ring is a filled disc rather than an outline. The reference is soft
   concentric bands, not wire circles — a translucent fill with a fainter
   border gives the layering, because two overlapping fills are visibly
   denser where they cross and two overlapping outlines are just two lines. */

/* Long, because this is the loud device of the family. At 2s it read as a
   notification demanding something; at 4 it reads as breathing. */
/* bloom — "a warm, slow-swelling pad from two gently detuned sines". The
   softest recipe in the palette: it has almost no attack, so it arrives as
   the room brightening rather than as something being announced. A chime or a
   tick would be a notification; this is closer to a door opening.

   Half volume on top of that. The cue lands unasked-for, on a scroll the
   visitor made for their own reasons, so it has to be quieter than anything
   they chose to trigger. */
const OFFER_CUE = "bloom";
const OFFER_VOLUME = 0.5;

const PULSE_MS = 4000;
const RINGS = 4;
/* Wide enough for the largest ring to finish inside it — a ring clipped by
   its own canvas stops being a ring at the exact moment it is furthest out. */

/* Where each starter sits, as a point on an arc around the launcher.

   A stack is a menu; an arc is a fan opening out of the button. The angles
   sweep from just above horizontal round to nearly vertical, so the chips
   climb as they go — the one nearest the button is beside it and the far one
   is above it, which is the shape a hand makes when it deals cards.

   Measured in the CSS convention: 180° is due left, 270° is straight up, and
   y grows downward, so a negative sine is upward travel. Rounded because the
   server and the browser can disagree on the last bit of a cosine, and React
   compares the rendered numbers as strings. */
/* One icon per starter, by position rather than by matching the text.

   The copy is a prop and will be rewritten; a lookup keyed on the words would
   silently drop back to a default the first time someone edits one. Position
   is the stable thing: whatever the first question is, it is the one about
   the product. */
const CHIP_ICONS = [Sparkles, CalendarDays, Tag];

/* Where each starter sits, as an offset from the launcher's centre.

   Polar coordinates were the natural way to write an arc and the wrong way to
   tune one: nudging a chip "down and to the right" is two coupled changes to
   an angle and a radius, and every adjustment moved the neighbours' spacing
   as a side effect. Written as offsets, each chip is two numbers that mean
   what they say.

   The curve is still a curve — the three points are further apart
   horizontally as they descend, which is what stops the fan reading as a
   staircase. Negative y is upward.

   The top chip's x is positive, which puts it slightly to the *right* of the
   launcher's centre. That is what closes the arc: with all three offsets
   negative the fan only ever leaned away from the button, where crossing the
   centre line at the top makes the curve wrap over it. */
const ARC = [
  { x: 24, y: -112 },
  { x: -55, y: -57 },
  { x: -72, y: 2 },
];

/* Only as many chips as there are places on the arc.

   The offsets above are hand-tuned points, not a formula, so there is no
   fourth one to compute — and the starters list is shared with the other
   launchers, where a fourth prompt costs nothing. Reading past the end of
   ARC threw the moment the arc opened, which is a crash caused by editing
   copy in a different file.

   Slicing rather than extending: a fourth chip on this arc would either sit
   past the top of the fan or squeeze the spacing of the three that are
   tuned, and the fan is the variant. */
const ARC_MAX = ARC.length;

export function PulseLauncher({
  open,
  onClick,
  onStart,
  starters,
  children,
}: LauncherProps & { starters: string[]; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);

  /* Nothing but the pulse until the visitor scrolls.

     On arrival the page is the thing being read and the launcher has not
     earned any of it — a shelf of questions over a hero someone landed on two
     seconds ago is an interruption. So the corner does one thing: pulse.

     The first scroll is the signal. It means the page has been engaged with
     rather than glanced at, and it is the closest thing to a cue that someone
     is looking for something. That is when the arc opens.

     Once out it stays out. Retracting on a timer was tried the other way
     round — offered first, withdrawn later — and the withdrawal is the wrong
     shape: the questions become available at the moment the visitor is most
     likely to want them, so taking them away again is the one move with no
     argument behind it.

     `{ once: true }` on the listener rather than a flag we check: the browser
     removes it after the first call, so this costs nothing for the rest of
     the session. */
  const [offered, setOffered] = useState(false);
  useEffect(() => {
    const open = () => setOffered(true);
    window.addEventListener("scroll", open, { once: true, passive: true });
    return () => window.removeEventListener("scroll", open);
  }, []);

  /* The cue rides the arc opening, once.

     Deferred by a frame for the same reason the messenger's own cues are:
     building the audio graph is work, and doing it in the same tick as the
     state change puts it ahead of the paint that starts the animation.

     Worth knowing it may not sound at all. Browsers refuse audio until the
     page has been interacted with, and scrolling does not count as
     interaction — so on a page where the visitor has scrolled but never
     clicked, cuelume checks navigator.userActivation and quietly does
     nothing. That is the correct behaviour rather than a bug to work around:
     the alternative is a site that makes a noise at someone who has not
     touched it. */
  useEffect(() => {
    if (!offered) return;
    setVolume(OFFER_VOLUME);
    const id = requestAnimationFrame(() => play(OFFER_CUE));
    return () => cancelAnimationFrame(id);
  }, [offered]);

  /* Open closes them for good: by then the question has been asked in a
     window that offers the same three itself. */
  const showStarters = (hover || offered) && !open;

  /* The rings go on hover for the same reason they go on open: they exist to
     bring you here, and once you have arrived they are three things moving
     underneath something you are being asked to read. */
  /* The rings carry on while the shelf is out. They were stopped on the
     reasoning that motion under text makes the text harder to read — true of
     motion *behind* it, but these travel outward from a button below the
     chips and never cross them. Stopping them meant the launcher's one
     signal switched off at the exact moment it had something to say. */
  const quiet = hover || open;

  return (
    <span
      className="relative flex size-14 items-center justify-center"
      style={{
        transform: hover && !open ? "scale(1.04)" : "scale(1)",
        transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      {/* The starter shelf: inside the hover container, so the gap between
          button and chips is crossable without them disappearing on the way.

          Anchored to the launcher's centre rather than laid out above it —
          every chip starts at the same point and travels to its own place on
          the arc, which is what makes the group expand out of the button
          instead of appearing over it. */}
      {starters.length > 0 && (
        <span
          className="pointer-events-none absolute inset-0"
          style={{ pointerEvents: showStarters ? "auto" : "none" }}
        >
          {starters.slice(0, ARC_MAX).map((s, i) => (
            /* Two nested elements per chip, because two transforms are
               needed and transform is one property: the outer carries the
               entrance and the idle float, the inner carries the hover slide.
               On one element the hover would cancel the float mid-drift. */
            <span
              key={s}
              /* Right-aligned to the launcher's centre and pushed out along
                 the arc: the chip's right edge lands on the arc point and the
                 label runs leftward from there, so a long one grows away from
                 the viewport edge rather than into it — which is the only
                 thing that keeps a corner launcher's chips on screen. */
              className="absolute top-1/2 right-1/2 w-max"
              style={{
                opacity: showStarters ? 1 : 0,
                transform: showStarters
                  ? `translate(${ARC[i].x}px, ${ARC[i].y}px) scale(1)`
                  : "translate(0px, 0px) scale(0.6)",
                /* Overshooting curve on the way in — the chips arrive with a
                   little more travel than they need and settle back, which is
                   what separates a thing being offered from a thing being
                   displayed. Plain ease-out on the way back, since leaving
                   quietly is the point of leaving. */
                transition: showStarters
                  ? `opacity 240ms ease-out ${(starters.length - 1 - i) * 70}ms, transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1) ${(starters.length - 1 - i) * 70}ms`
                  : `opacity 180ms ease-out ${i * 40}ms, transform 220ms ease-out ${i * 40}ms`,
              }}
            >
              <span
                className="block w-max"
                style={{
                  /* Out of phase on purpose: three different periods mean the
                     group never resolves into a single wave. */
                  animation: showStarters
                    ? `chip-float ${2900 + i * 480}ms ease-in-out ${i * 220}ms infinite`
                    : undefined,
                }}
              >
                <button
                  type="button"
                  tabIndex={showStarters ? 0 : -1}
                  onClick={() => onStart(s)}
                  /* inline-flex, not flex.

                     A flex child fills the line it is on, so each chip was as
                     wide as the widest of the three and the short ones carried
                     a tail of empty white — which on an arc reads as the
                     shapes being misaligned rather than as padding. inline-flex
                     shrinks each one to its own label, so the arc is drawn by
                     three differently sized pills, which is what makes it look
                     placed rather than laid out. */
                  /* No gap, and equal padding both sides.

                     The trailing space was two things, neither of them
                     padding. The flex `gap` applied between the label and the
                     arrow's wrapper even while that wrapper was zero-wide, so
                     every chip carried 6px of gap to an element that wasn't
                     there. And the right padding was 12 against the left's 16,
                     shorter on the assumption the arrow would fill it.

                     Both are gone: spacing now lives inside the things being
                     spaced — a margin on the icon, and padding inside the
                     arrow's collapsing column, which collapses with it. */
                  className="group/chip inline-flex w-auto items-center rounded-full bg-white px-4 py-2.5 text-[13px] font-normal whitespace-nowrap text-[#3F2B57] transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-x-1 hover:bg-[#F4EEFC]"
                  /* A deeper, softer drop now that the chips move.

                     A shadow is what tells you how far above the page
                     something is, so a floating chip with a tight one reads as
                     stuck to the surface and sliding. Two layers: a wide soft
                     cast for the height, and a tight one just under the pill
                     to keep its edge from dissolving into the cast. */
                  style={{
                    boxShadow:
                      "0 14px 32px -10px rgba(15,17,26,0.28), 0 4px 10px -4px rgba(15,17,26,0.16), 0 0 0 1px rgba(15,17,26,0.05)",
                  }}
                >
                  {(() => {
                    const Icon = CHIP_ICONS[i % CHIP_ICONS.length];
                    return (
                      <Icon
                        className="mr-1.5 size-3.5 shrink-0 text-[#6D33AA]"
                        strokeWidth={2}
                        aria-hidden
                      />
                    );
                  })()}
                  {s}
                  {/* The arrow is the interactive part: it has no width until
                      the pointer arrives, so the chip grows into it rather
                      than reserving a gap that looks like a mistake until you
                      hover. */}
                  <span
                    aria-hidden
                    /* minmax(0, …) rather than a bare fr.

                       A grid track sized 0fr still floors at its item's
                       automatic minimum size, which is the content — so the
                       "collapsed" column was rendering at the arrow's full
                       20px and every chip carried it as trailing space.
                       minmax(0, 0fr) is what actually permits zero. */
                    className="grid overflow-hidden transition-[grid-template-columns,opacity] duration-200 ease-out [grid-template-columns:minmax(0,0fr)] group-hover/chip:opacity-100 group-hover/chip:[grid-template-columns:minmax(0,1fr)]"
                    style={{ opacity: 0 }}
                  >
                    <svg
                      className="ml-1.5 min-w-0"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6D33AA"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </button>
              </span>
            </span>
          ))}
        </span>
      )}

      {/* The rings, in a layer of their own so they can travel past the
          button's box. Centred by a full-size flex layer rather than by
          `absolute` alone — an absolutely positioned box with no inset falls
          back to its static position, which for something wider than its
          parent is beside the button rather than over it. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          opacity: quiet ? 0 : 1,
          transition: "opacity 320ms ease-out",
        }}
      >
        {Array.from({ length: RINGS }, (_, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              width: 56,
              height: 56,
              backgroundColor: "rgba(139,92,246,0.28)",
              border: "1px solid rgba(124,58,237,0.55)",
              /* Evenly spaced starts. The delay is negative so every ring is
                 already mid-flight on the first frame — without it the
                 launcher spends the first four seconds emitting its rings one
                 at a time, and the loop only looks right after it has been on
                 screen longer than anyone waits. */
              animation: `pulse-out ${PULSE_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1) ${
                (-PULSE_MS / RINGS) * i
              }ms infinite`,
            }}
          />
        ))}
      </span>

      <button
        type="button"
        aria-label={open ? "Close the conversation" : "Ask Tars anything"}
        aria-expanded={open}
        onClick={onClick}
        className="relative flex size-12 items-center justify-center rounded-full"
        style={{
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
