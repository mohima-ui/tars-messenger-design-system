"use client";

import { useEffect, useRef, useState } from "react";

import type { LauncherProps } from "./Messenger";

/* A small presence orbiting the launcher.

   The brief in one line: nothing about the button moves, and one dot goes
   round it. Everything below follows from taking that literally — the button
   never spins, never bounces, never scales on its own; the only things with
   motion are the dot and, on the way into the conversation, the ring it
   travels on.

   Three states, and they escalate rather than change:

     idle    a hairline ring and a dot, slow, barely there
     hover   the same ring brighter, the same dot faster, a glow under the
             button
     open    the ring expands outward and fades as the panel takes over

   No particles, no pulse, no second element arriving. Each state is the
   previous one turned up, which is what keeps it feeling like one object
   rather than a sequence of effects. */

/* The halo hugs the button rather than orbiting at a distance.

   r=36 around a 56px disc leaves 8px of gap — close enough that the ring
   reads as light coming off the button, which is what makes it a halo. At 40
   it was a separate circle drawn near a button, and the two never became one
   object. */
const RING = { box: 104, r: 36, c: 52 };

/* Slow enough that you never catch it going round — a lap you can time is a
   lap you start watching. */
/* Twelve particles, alternating large and small.

   Computed rather than written out: the positions are trigonometry, and a
   hand-typed list of twelve coordinate pairs is twelve chances to be a
   fraction of a degree out — which at this size shows up as one dot sitting
   slightly off the ring.

   Even count on purpose. Odd, the alternation cannot close: the last particle
   and the first would both be large, and the seam would be the one thing
   anyone notices about it. */
const PARTICLE_COUNT = 12;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
  /* Rounded, and not for tidiness — this is a hydration fix.

     Math.cos and Math.sin are allowed to differ in their last bit between
     implementations, and Node and V8-in-the-browser do: the server rendered
     cy="20.823085463760215" and the client computed 20.82308546376022, which
     React compares as strings and reports as a mismatched attribute. Three
     decimals is far below what a 104px viewBox can express and identical on
     both sides. */
  const round = (n: number) => Number(n.toFixed(3));
  return {
    x: round(RING.c + RING.r * Math.cos(angle)),
    y: round(RING.c + RING.r * Math.sin(angle)),
    big: i % 2 === 0,
  };
});

const ORBIT_MS = 4200;
/* Hover is a change of rate, not of speed class. 2× is enough to register as
   a response and not enough to read as the thing having started doing
   something.

   The rest of the hover moved with it. Tuned for restraint, the difference
   between the two states was a ring going from 16% to 45% opacity — a real
   change on a spec sheet and an invisible one on a page, because the thing
   changing is a single lavender pixel over a photograph. Restraint applies to
   the idle state, which nobody asked to see; the hover is an answer to
   something the visitor just did, and an answer has to be audible. */
const HOVER_RATE = 2;

/* The orbit's exit. Longer than the panel's own opening, so the ring is still
   on its way out as the window arrives rather than finishing first and
   leaving a gap. */
const EXIT_MS = 420;
const EXIT_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export function OrbitLauncher({
  open,
  onClick,
  onStart,
  starters,
  children,
}: LauncherProps & { starters: string[]; children: React.ReactNode }) {
  const ringRef = useRef<SVGGElement>(null);
  const orbit = useRef<Animation | null>(null);
  const [hover, setHover] = useState(false);

  /* Driven through the Web Animations API rather than a CSS animation, for
     one reason: playbackRate.

     Speeding a CSS animation up means changing animation-duration on
     something already running, and the engine resolves that by keeping the
     elapsed time and recomputing progress against the new duration — so the
     dot jumps to a different point on the ring at the exact moment the
     pointer arrives, which is the one moment anyone is looking at it.
     playbackRate changes the rate without touching the current position, so
     the dot simply gets quicker from wherever it is.

     Composited too: a transform animation on its own layer, so the loop runs
     off the main thread and holds 60fps while React is doing anything else. */
  useEffect(() => {
    const el = ringRef.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const anim = el.animate(
      [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }],
      { duration: ORBIT_MS, iterations: Infinity, easing: "linear" },
    );
    orbit.current = anim;
    return () => anim.cancel();
  }, []);

  /* Hover stops the orbit rather than quickening it.

     The orbit exists to be noticed; once it has been, its job is done, and
     leaving it running under three things you are being asked to read makes
     the reading harder. Stilling it is also the clearest possible signal that
     the launcher has registered you — nothing else in the corner changes
     state that completely.

     pause() rather than cancel(): the particles hold exactly where they are
     and resume from there when you leave, so moving the pointer on and off
     doesn't jerk the ring back to the top of its cycle. */
  useEffect(() => {
    const anim = orbit.current;
    if (!anim) return;
    if (hover && !open) anim.pause();
    else anim.play();
  }, [hover, open]);

  return (
    <span
      /* The scale is on the launcher as a whole — button, ring and dots
         together — so hover lifts one object rather than growing a button
         inside a ring that stayed put. 4% is the most it can take before the
         orbit visibly changes radius, which would read as the animation
         having a second state rather than the control responding. */
      className="relative flex size-14 items-center justify-center"
      style={{
        transform: hover && !open ? "scale(1.04)" : "scale(1)",
        transition: "transform 300ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      {/* The starters, above the launcher and only while it is being
          looked at.

          Inside the same hover container as the button, which is the only
          reason they are usable at all: they are revealed by hover and you
          have to travel across the gap to reach them, so if the gap were
          outside the hover area they would vanish on the way. The container
          is the button plus everything it opens.

          Stacked and right-aligned, growing upward. A row would run off the
          edge of the viewport from a corner this close to it; a column has
          the whole page to grow into.

          They stagger in from the bottom up — the one nearest the button
          first, which is the direction the eye is already travelling. */}
      {starters.length > 0 && (
        <span
          className="absolute right-0 bottom-full mb-3 flex flex-col items-end gap-2"
          style={{
            pointerEvents: hover && !open ? "auto" : "none",
          }}
        >
          {starters.map((s, i) => (
            <button
              key={s}
              type="button"
              tabIndex={hover && !open ? 0 : -1}
              onClick={() => onStart(s)}
              className="rounded-full bg-white px-3.5 py-2 text-[13px] font-normal whitespace-nowrap text-[#3F2B57] transition-colors hover:bg-[#F4EEFC]"
              style={{
                boxShadow:
                  "0 8px 20px -6px rgba(15,17,26,0.18), 0 0 0 1px rgba(15,17,26,0.06)",
                opacity: hover && !open ? 1 : 0,
                transform:
                  hover && !open ? "translateY(0) scale(1)" : "translateY(6px) scale(0.96)",
                /* The delay runs with the stack on the way in and against it
                   on the way out, so they arrive from the button outward and
                   leave from the outside back in — the same order in both
                   directions relative to where the pointer is. */
                transition: `opacity 200ms ease-out ${
                  hover ? (starters.length - 1 - i) * 45 : i * 30
                }ms, transform 260ms cubic-bezier(0.16, 1, 0.3, 1) ${
                  hover ? (starters.length - 1 - i) * 45 : i * 30
                }ms`,
              }}
            >
              {s}
            </button>
          ))}
        </span>
      )}

      {/* The glow under the button, on hover only.

          A blurred disc of the accent behind the disc itself rather than a
          box-shadow on it: a shadow is bound to the button's shape, so a
          rounded square would get a rounded-square halo, and the point of
          this family is that the button's shape is still an open question. */}
      {/* Centred by a full-size flex layer rather than by `absolute` alone.

          An absolutely positioned box with no inset falls back to its static
          position — where it would have sat in normal flow — which in a flex
          row is beside the button, not over it. Both overlays here are wider
          than the button, so that put the ring and the glow off to one side
          and the launcher looked like it had nothing on it at all. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
      <span
        /* shrink-0, because this is a flex item in a box narrower than it is.

           Flexbox shrinks items to fit by default, so a 76px glow inside a
           56px launcher was being squeezed to 56 — and the ring below it, at
           96, was crushed into an ellipse and clipped. Both are overlays that
           are supposed to be bigger than the button; none of that works
           unless they are allowed to overflow it. */
        className="shrink-0 rounded-full"
        style={{
          width: 108,
          height: 108,
          background:
            "radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(139,92,246,0) 70%)",
          opacity: open ? 0 : hover ? 1 : undefined,
          transition: "opacity 300ms ease-out",
          /* The attention pulse: breathe in, peak, breathe out, rest.

             On the glow rather than the button, which is the whole difference
             between this and every launcher that throbs — the control stays
             exactly where it is and the light around it swells. The rest at
             the end of each cycle is what keeps it from reading as a
             heartbeat; a loop with no pause in it is a machine running. */
          animation:
            open || hover ? undefined : "orbit-breathe 5200ms ease-in-out infinite",
        }}
      />
      </span>

      {/* The ring. Always mounted, so opening is a transition rather than an
          unmount — which is also what gives the click its motion: the orbit
          expands outward and fades as the panel takes over, instead of
          vanishing on the frame the button is pressed. */}
      <span
        aria-hidden
        /* No motion-reduce:hidden.

           Reduced motion means don't move things, not don't draw them —
           hiding the ring there deletes the only thing that says the launcher
           is an agent rather than a button. The rotation is what gets
           suppressed, in the effect below; the ring and its dot stay, still,
           and the hover states still work. */
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
      <svg
        className="shrink-0"
        width={RING.box}
        height={RING.box}
        viewBox={`0 0 ${RING.box} ${RING.box}`}
        fill="none"
        /* Gone on hover as well as on open, and by the same move.

           Pausing it left twelve dots parked around a button with three
           things to read next to it — still furniture, and furniture in the
           way. The orbit's whole job is to get you here; once you are, it
           should leave rather than hold its position.

           Same expand-and-fade in both cases, so whether the launcher was
           approached or pressed, the ring does one recognisable thing:
           opens outward and goes. */
        style={{
          transform: open || hover ? "scale(1.3)" : "scale(1)",
          opacity: open || hover ? 0 : 1,
          transition: `transform ${EXIT_MS}ms ${EXIT_EASE}, opacity ${EXIT_MS}ms ${EXIT_EASE}`,
        }}
      >
        <defs>
          {/* Two blurs, doing different jobs. The wide one turns a stroke into
              a band of light; the tight one gives each dot its own small
              glow. One filter for both would either smear the dots or leave
              the halo looking like a thick line. */}
          <filter id="orbit-halo" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4.5" />
          </filter>
          <filter id="orbit-dot-glow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="2" />
          </filter>

        </defs>

        {/* Nothing is drawn on the track itself — no halo band, no hairline.

            Both were describing a path the particles already describe by
            being on it, and a drawn circle behind moving dots reads as a
            border the dots happen to sit on rather than as an orbit. What is
            left is twelve particles and the light under the button. */}

        <g ref={ringRef} style={{ transformOrigin: `${RING.c}px ${RING.c}px` }}>
          {/* A second group inside the rotating one, so the ring can breathe
              while it turns.

              Nested rather than combined, and that is a constraint rather than
              a preference: transform is a single property, so a rotation and a
              scale declared on the same element are one value where the last
              one written wins. Two groups means two transforms that compose —
              the outer turns, the inner swells, and neither has to know about
              the other.

              The rotation is on the outer group specifically because it is the
              one driven by the Web Animations API: hovering changes its
              playbackRate, and the breath carries on at its own pace
              underneath. */}
          <g
            style={{
              transformOrigin: `${RING.c}px ${RING.c}px`,
              animation: "orbit-swell 2600ms linear infinite",
            }}
          >
          {/* A ring of particles rather than an arc with a head.

              The arc had a direction and therefore a front and a back, which
              meant the eye tracked one point going round. A ring of evenly
              spaced dots has no leading edge — nothing to follow — so it
              registers as a surface turning rather than as something
              travelling, which is the calmer read and the one that survives
              being in the corner of a page.

              Alternating big and small is what stops it becoming a dotted
              line. Twelve identical dots at this radius merge into a dashed
              circle; alternating sizes give the ring a rhythm, and the small
              ones read as the same particles further away. */}
          {PARTICLES.map(({ x, y, big }, i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              fill="#6D33AA"
              style={{
                r: big
                  ? hover && !open
                    ? "3.6px"
                    : "3px"
                  : hover && !open
                    ? "2.6px"
                    : "2.2px",
                /* Same colour and same strength for both sizes — the only
                   difference left is the size, which is what the alternation
                   was for. Fading the small ones made them read as further
                   away, which is a depth cue nobody asked for and which
                   fought the flat ring the halo already establishes. */
                opacity: hover && !open ? 1 : 0.85,
                transition: "r 300ms ease-out, opacity 300ms ease-out",
              }}
            />
          ))}
          </g>
        </g>
      </svg>
      </span>

      <button
        type="button"
        aria-label={open ? "Close the conversation" : "Ask Tars anything"}
        aria-expanded={open}
        onClick={onClick}
        /* The button itself is inert. No scale on hover, no spin, no bounce —
           the orbit is the response, and a button that also moves turns one
           gesture into two things happening. The only thing it does is deepen
           its own shadow, which reads as it lifting rather than as it
           reacting. */
        /* 44px inside a wrapper that is still 56.

           The ring is positioned against the wrapper, not the button, so
           shrinking the disc leaves the orbit exactly where it was — which is
           what was asked for, and also the reason the launcher is built with
           the two separated. A smaller button inside the same orbit reads as
           more space around it rather than as a smaller launcher. */
        className="relative flex size-12 items-center justify-center rounded-full"
        style={{
          /* Flat accent, the same #6D33AA the particles are.

             The gradient came off because it made the disc a second thing to
             look at: a multi-hue sweep behind a white glyph, ringed by dots in
             a single purple, and the eye read three colours where there is one
             brand. Flat, the button is a surface and the orbit around it is
             the only thing with any life in it — which is the whole argument
             of this variation. */
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
