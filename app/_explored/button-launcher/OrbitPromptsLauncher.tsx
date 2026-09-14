"use client";

import { CalendarDays, Sparkles, Tag } from "lucide-react";
import { useEffect, useState } from "react";

import type { LauncherProps } from "./Messenger";

/* Prompts in orbit, naming themselves as they pass.

   The starters are icons travelling a ring around the launcher. Each is
   anonymous while it moves — a small white pod with a glyph — and the one
   currently at the left of the ring says what it is, in a label beside it.
   So the corner shows one question at a time, in turn, without ever holding
   three labels open at once.

   The trade against v2's arc: that one shows everything and asks for the
   space to do it; this one shows a third of itself and costs almost nothing,
   at the price of making the visitor wait to see the rest. Worth having both
   in front of you.

   Three mechanisms, and they are deliberately separate:

     the ring turns    a CSS animation, composited, never touched by React
     the pods stay upright  a counter-rotation on each pod, same duration
     the label changes an interval that fires as each pod reaches the left

   The label could have been derived from the ring's real angle, read every
   frame. It isn't, because the rotation is linear and periodic: whichever pod
   is at the left is a function of elapsed time, so a timer at a third of the
   period knows it without measuring anything. Nothing here reads layout. */

const PODS = [
  { Icon: Sparkles },
  { Icon: CalendarDays },
  { Icon: Tag },
];

/* Slow. The label is the payload and it only changes three times a lap, so
   the lap has to be long enough for each name to be readable standing still —
   about four seconds a prompt. */
const ORBIT_MS = 12000;
/* Under a third of the four seconds a pod spends at the left, so the ring is
   unlabelled for most of every slot and each name reads as an arrival rather
   than a word changing.

   Worth knowing it is close to the floor: a three-word label needs roughly a
   second to be read at a glance, and 200ms of that is the fade. Much less and
   the name is gone before it has been taken in. */
const NAME_HOLD_MS = 1200;
/* About the length of the label's own fade. The name should finish arriving
   as the pod lands, not start then. */
const NAME_LEAD_MS = 240;
const POD = 34;
const RADIUS = 62;

export function OrbitPromptsLauncher({
  open,
  onClick,
  onStart,
  starters,
  children,
}: LauncherProps & { starters: string[]; children: React.ReactNode }) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(0);
  /* The label is an event, not a fixture.

     It used to sit there permanently and swap its text, which made it a
     caption the ring happened to feed — and a caption is furniture. Tying it
     to the arrival means the corner is quiet for part of every lap and then
     something appears, which is the thing that gets noticed.

     Held for most of the slot but not all of it: the gap before the next pod
     arrives is what makes the next one an arrival rather than a change of
     text. */
  const [naming, setNaming] = useState(true);

  /* Which pod is at the left, tracked by the clock rather than by geometry.

     The pods start with pod 0 already there — the first `rotate(-120deg)`
     below is what puts it on the left rather than at the top — so the label
     is correct from the first frame and the interval only has to advance it.

     Cleared and restarted whenever the ring stops, so the label never drifts
     out of step with a ring that was paused. */
  /* Show on arrival, hide before the next one. Keyed on `active` so it runs
     once per pod, and cleared on the way out so a pointer arriving mid-slot
     can't leave a stale timer to hide a label that hover is holding open. */
  useEffect(() => {
    if (open) return;
    setNaming(true);
    if (hover) return;
    const t = window.setTimeout(() => setNaming(false), NAME_HOLD_MS);
    return () => window.clearTimeout(t);
  }, [active, hover, open]);

  /* Started early by a lead, then on the beat.

     The pod and the label were on the same schedule and the label still
     looked late, because a fade takes time: the tick fires as the pod lands
     and the name is only fully there 260ms afterwards. Moving the whole
     schedule forward by roughly that fade means the label finishes arriving
     as the pod does.

     A timeout for the first hop and an interval after it, rather than an
     interval offset by a delay — the lead applies once, to the phase, not to
     every slot. */
  useEffect(() => {
    if (open || hover) return;
    const advance = () =>
      /* Backwards through the list, which is what the geometry actually does.

         Pod i sits at 180 + 120i and the ring turns clockwise, so a pod
         reaches the left when the ring has turned 360 − 120i — meaning pod 0
         is there first, then pod 2, then pod 1. Counting forwards named the
         wrong prompt for two thirds of every lap, which is the label and the
         icons disagreeing. */
      setActive((i) => (i + PODS.length - 1) % PODS.length);
    let interval = 0;
    const first = window.setTimeout(() => {
      advance();
      interval = window.setInterval(advance, ORBIT_MS / PODS.length);
    }, ORBIT_MS / PODS.length - NAME_LEAD_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [open, hover]);

  const quiet = open;

  return (
    <span
      className="relative flex size-14 items-center justify-center"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      {/* The ring the pods travel on. Dashed, and barely there: it exists to
          say the pods are on a path rather than drifting, which stops the
          three of them reading as unrelated objects that happen to be
          circling. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{
          opacity: quiet ? 0 : 1,
          transition: "opacity 300ms ease-out",
        }}
      >
        <svg
          className="shrink-0"
          width={RADIUS * 2 + POD}
          height={RADIUS * 2 + POD}
          viewBox={`0 0 ${RADIUS * 2 + POD} ${RADIUS * 2 + POD}`}
          fill="none"
        >
          <circle
            cx={RADIUS + POD / 2}
            cy={RADIUS + POD / 2}
            r={RADIUS}
            /* A deeper violet at a heavier weight, and the dashes closer
               together. Opacity alone had run out of room — at 0.6 of a pale
               lavender hairline the ring was still competing with a
               photograph, and the thing that makes a dotted line legible is
               the ink in each dash rather than how many of them there are. */
            /* Between the two attempts either side of this one: a pale
               hairline was lost against the photograph, and the deep 1.5px
               version read as a drawn boundary the pods were trapped inside.
               The middle keeps the darker ink — that is what made it findable
               — and gives back the weight and the density. */
            stroke="#7C3AED"
            strokeOpacity={hover ? 0.7 : 0.5}
            strokeWidth="1"
            strokeDasharray="3 7"
            strokeLinecap="round"
            style={{ transition: "stroke-opacity 300ms ease-out" }}
          />
        </svg>
      </span>

      {/* The turning frame. Everything inside inherits its rotation, which is
          why each pod has to undo it. */}
      <span
        className="pointer-events-none absolute inset-0"
        style={{
          animation: `orbit ${ORBIT_MS}ms linear infinite`,
          animationPlayState: hover || open ? "paused" : "running",
          opacity: quiet ? 0 : 1,
          transition: "opacity 300ms ease-out",
        }}
      >
        {PODS.map(({ Icon }, i) => (
          <span
            key={i}
            className="absolute top-1/2 left-1/2"
            /* Placed by rotating the pod's own frame and then pushing it out
               along that frame's x-axis, rather than by computing a sine and
               a cosine. Same point, but the arithmetic stays in the browser —
               and it means no coordinates to round, which is what the
               particle ring needed to survive hydration.

               -120° so pod 0 starts on the left, where the label is. */
            style={{
              /* Order matters, and getting it wrong is why one pod sat off
                 the ring.

                 A transform list composes left to right, so the rightmost
                 operation happens in the element's own frame and each one to
                 its left in the frame the previous produced. With the
                 centring written last it was applied *inside* the rotated
                 frame — so each pod was pulled half its width in a different
                 direction, and only the pod at 0° landed where it should.

                 Centred first, then rotated, then pushed out: the -50% acts
                 in screen space and the push happens along the rotated axis,
                 which is the point on the circle. */
              transform: `translate(-50%, -50%) rotate(${
                180 + i * 120
              }deg) translate(${RADIUS}px)`,
            }}
          >
            <span
              /* Undoing the frame's turn, so the glyph stays upright the whole
                 way round. Same duration and direction reversed — a pod that
                 rotates with the ring reads as a wheel, and a wheel is a
                 loading spinner. */
              className="pointer-events-auto flex items-center justify-center rounded-full bg-white"
              style={{
                width: POD,
                height: POD,
                boxShadow:
                  "0 6px 16px -6px rgba(15,17,26,0.24), 0 0 0 1px rgba(15,17,26,0.05)",
                animation: `orbit ${ORBIT_MS}ms linear infinite reverse`,
                animationPlayState: hover || open ? "paused" : "running",
                transform: `rotate(${-(180 + i * 120)}deg)`,
              }}
            >
              <Icon
                className="size-4 text-[#6D33AA]"
                strokeWidth={2}
                aria-hidden
              />
            </span>
          </span>
        ))}
      </span>

      {/* The name of whichever prompt is currently at the left.

          Parked rather than travelling: the label sits at a fixed point beside
          the ring and its text changes as each pod arrives. A label attached
          to a moving pod would be text sliding around a corner of the page,
          which is unreadable and slightly seasick; a fixed one is a caption
          the ring feeds.

          Right-aligned to the ring's left edge so it grows away from the
          viewport, and vertically centred on the pod it belongs to. */}
      <button
        type="button"
        tabIndex={quiet || !naming ? -1 : 0}
        onClick={() => onStart(starters[active] ?? starters[0])}
        className="absolute top-1/2 flex items-center rounded-full bg-white px-4 py-2.5 text-[13px] font-normal whitespace-nowrap text-[#3F2B57] transition-colors hover:bg-[#F4EEFC]"
        style={{
          /* Measured from the centre, not from the wrapper's edge.

             `right: N` puts the label's right edge N from the *edge* of the
             56px wrapper, but the ring is drawn around its centre — so the
             offset was landing 28px short and the label sat inside the path
             the pods travel. `calc(50% + …)` moves the reference to the
             centre, where the ring's own geometry is measured from.

             The distance itself is to the pods' outer edge rather than to the
             ring line: a pod is wider than the path it rides, so measuring to
             the line leaves the label touching whichever one is passing. */
          right: `calc(50% + ${RADIUS + POD / 2 + 8}px)`,
          boxShadow:
            "0 14px 32px -10px rgba(15,17,26,0.28), 0 4px 10px -4px rgba(15,17,26,0.16), 0 0 0 1px rgba(15,17,26,0.05)",
          /* Slides a little as it goes, toward the pod that is naming it —
             appearing in place reads as a tooltip, arriving from the ring
             reads as the pod having said it. */
          opacity: quiet || !naming ? 0 : 1,
          transform: `translateY(-50%) translateX(${quiet || !naming ? 6 : 0}px)`,
          pointerEvents: quiet || !naming ? "none" : "auto",
          transition: "opacity 200ms ease-out, transform 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Keyed on the active index so React swaps the element rather than
            editing its text — which is what lets the new name fade in as its
            own thing instead of the old one mutating in place. */}
        <span key={active} style={{ animation: "fade-in 300ms ease-out both" }}>
          {starters[active] ?? starters[0]}
        </span>
      </button>

      {/* The breath, behind the disc.

          A radial gradient rather than a box-shadow: a shadow is bound to the
          element's shape, and the button's shape is still an open question
          across this family — a rounded square would inherit a rounded-square
          halo. A gradient disc is a circle of light regardless of what it
          sits behind. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <span
          className="shrink-0 rounded-full"
          style={{
            /* Bigger, and blurred. The extra size is room for the tail to
               dissolve in rather than more glow; the blur is what removes the
               banding a wide, very low-alpha ramp shows on a flat
               background. */
            width: 104,
            height: 104,
            filter: "blur(6px)",
            /* Dark against the disc, pale at the edge.

               The old one was a single violet fading to nothing, which put its
               strongest value where the button covers it and left the visible
               band — the ring just outside the disc — as the weakest part.
               The shape of the ramp stays — strongest against the disc,
               thinning outward — but every stop comes down: the deep indigo
               core goes back to the brand purple and the alphas drop by about
               a third, so it reads as light rather than as a shadow the
               button is sitting in. */
            background:
              "radial-gradient(circle, rgba(109,51,170,0.3) 0%, rgba(139,92,246,0.2) 38%, rgba(167,139,250,0.1) 58%, rgba(167,139,250,0.04) 74%, rgba(167,139,250,0.015) 88%, rgba(167,139,250,0) 100%)",
            animation: open
              ? undefined
              : "launcher-breathe 4200ms ease-in-out infinite",
            opacity: open ? 0 : undefined,
            transition: "opacity 300ms ease-out",
          }}
        />
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
