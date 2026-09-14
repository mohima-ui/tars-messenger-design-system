"use client";

import { useEffect, useState } from "react";
import { LauncherChat } from "./LauncherChat";
import { PURPLE, INK } from "./ui";

/* Sonar Orb launcher (from /design-system/components/launcher-variants),
   lifted out of its BrowserFrame and re-themed for the marketing site:
   fixed to the viewport, brand purple accent, site-appropriate copy.

   Phases: idle → typing (typewriter greeting) → done (reply chips) → chat. */

/** Light purple hover fill for the reply chips — the DS accent-soft tint. */
const CHIP_HOVER = "#F0E7FA";

const SONAR_MSG =
  "Curious about AI Agents? I can show you what Tars would handle for your sales and support.";
const SONAR_OPTS = ["Schedule a demo", "Chat with us", "How do AI agents work"];
/** The one option that currently opens the chatbot. */
const CHAT_OPT = "Chat with us";


const TYPE_MS = 28;
/** Gap between reply chips — they land one at a time, not as a block. */
const CHIP_MS = 320;
/* Stack spacing: chips group tightly, message and orb sit further out. */
const GAP_CHIP = 6;
const GAP_BLOCK = 12;
/* Entrance feel for the bubble and chips: a long ease-out, no overshoot. */
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const EASE_MS = 520;
/** Short beat to let the page land, then the orb slides in from the corner. */
const ORB_DELAY_MS = 800;
const ORB_ENTER_MS = 700;

/* Chat window open/close — matches the main app (app/page.tsx): the panel is
   bottom-anchored and its HEIGHT animates, so it unfurls upward from the
   corner rather than sliding or scaling in. */
const CHAT_H = "min(712px, calc(100vh - 48px))";
const CHAT_RISE_MS = 520;
const CHAT_FALL_MS = 400;
const EASE_PANEL = "cubic-bezier(0.22, 1, 0.36, 1)";

/* Punches the centre out of the halo layers, leaving a ~3.5px ring around the
   44px avatar inside the 52px orb. */
const RING_MASK = "radial-gradient(circle at center, transparent 22.5px, #000 23.5px)";

/* Halo: a cool-to-warm ramp that stays inside the purple family — periwinkle
   leading edge easing through violet into brand purple. Subtle enough not to
   fight the page, but the hue shift is what gives it the AI read.
   Shine comes from three stacked layers: a blurred bloom underneath, the arc
   itself, and a narrow near-white specular streak on the leading edge. All
   share one duration so they stay locked together as they rotate. */
const RING_COOL = "#818CF8";
const RING_VIOLET = "#8B5CF6";
const RING_SPIN = "2.8s";
const RING_TRACK = `color-mix(in srgb, ${RING_VIOLET} 13%, transparent)`;
/* Violet carries the bulk of the arc. Blue is a short band near the leading
   edge and purple a short tail at the end, so neither dominates. The specular
   streaks land on 56deg — where the blue band ends — so the blue terminates in
   the glint rather than fading out into violet.

   The tail dissolves over ~100deg via alpha stops rather than cutting to
   transparent, which is what kept giving the purple a hard edge. Every stop
   fades into the next, so the whole thing reads as one soft comet. */
const RING_SWEEP = `conic-gradient(from 0deg, ${RING_COOL}00 14deg, ${RING_COOL} 56deg, ${RING_VIOLET} 96deg, ${PURPLE} 136deg, ${PURPLE}59 188deg, ${PURPLE}00 240deg)`;
const RING_SPECULAR_WIDE =
  "conic-gradient(from 0deg, transparent 18deg, rgba(255,255,255,0.5) 56deg, transparent 104deg)";
const RING_SPECULAR_HOT =
  "conic-gradient(from 0deg, transparent 40deg, rgba(255,255,255,0.95) 56deg, transparent 76deg)";

export function SonarOrb() {
  const [phase, setPhase] = useState<"hidden" | "idle" | "typing" | "done" | "chat">(
    "hidden",
  );
  const [typed, setTyped] = useState(0);
  const [chipsShown, setChipsShown] = useState(0);
  const [closing, setClosing] = useState(false);
  /** The chip text that opened the chat — becomes the first user bubble. */
  const [opener, setOpener] = useState(CHAT_OPT);

  /* Nothing on screen for a short beat; the orb slides in, and the greeting
     starts the moment it lands — no pause in between. */
  useEffect(() => {
    const t = setTimeout(() => setPhase("idle"), ORB_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "idle") return;
    const t = setTimeout(() => setPhase("typing"), ORB_ENTER_MS);
    return () => clearTimeout(t);
  }, [phase]);

  /* Both timers advance one step per tick and flip the phase on the last one —
     the transition happens in the timeout, never synchronously in the effect. */
  useEffect(() => {
    if (phase !== "typing" || typed >= SONAR_MSG.length) return;
    const t = setTimeout(() => {
      const next = typed + 1;
      setTyped(next);
      if (next >= SONAR_MSG.length) setPhase("done");
    }, TYPE_MS);
    return () => clearTimeout(t);
  }, [phase, typed]);

  useEffect(() => {
    if (phase !== "done" || chipsShown >= SONAR_OPTS.length) return;
    const t = setTimeout(() => setChipsShown((n) => n + 1), CHIP_MS);
    return () => clearTimeout(t);
  }, [phase, chipsShown]);

  /* Closing plays the fall animation first, then unmounts the window. */
  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => {
      setClosing(false);
      setPhase("done");
    }, CHAT_FALL_MS);
    return () => clearTimeout(t);
  }, [closing]);

  const openChat = (from: string = CHAT_OPT) => {
    setOpener(from);
    setClosing(false);
    setPhase("chat");
  };
  const closeChat = () => setClosing(true);

  if (phase === "hidden") return null;

  return (
    <>
      <style>{`
        @keyframes sonar-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes sonar-orb-in { from { opacity: 0; transform: translateX(140px) scale(0.75); } to { opacity: 1; transform: translateX(0) scale(1); } }
        /* Long ease-out with a blur dissolve — things settle in rather than
           snapping. No scale pop and no springy overshoot. */
        @keyframes sonar-bubble {
          from { opacity: 0; transform: translateY(12px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes sonar-chip {
          from { opacity: 0; transform: translateX(8px); filter: blur(4px); }
          to   { opacity: 1; transform: translateX(0);   filter: blur(0); }
        }
        /* Grows the row the chip occupies, so the stack expands smoothly. */
        @keyframes sonar-chip-slot {
          from { grid-template-rows: 0fr; }
          to   { grid-template-rows: 1fr; }
        }
        /* Bottom-anchored height growth — the window unfurls upward out of the
           corner. Target height comes from --chat-h on the element. */
        @keyframes chat-rise {
          from { opacity: 0; height: 220px; }
          to   { opacity: 1; height: var(--chat-h); }
        }
        @keyframes chat-fall {
          from { height: var(--chat-h); }
          to   { height: 0px; }
        }
        @keyframes sonar-cursor { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes sonar-word-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sonar-sparkle { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Chat: the design-system chatbot shell, opened from "Chat with us".
          The thread starts from whatever chip was tapped. */}
      {phase === "chat" && (
        <div className="fixed bottom-6 right-6 z-50">
          <LauncherChat
            opener={opener}
            onClose={closeChat}
            style={
              {
                height: CHAT_H,
                "--chat-h": CHAT_H,
                animation: closing
                  ? `chat-fall ${CHAT_FALL_MS}ms ${EASE_PANEL} both`
                  : `chat-rise ${CHAT_RISE_MS}ms ${EASE_PANEL} both`,
              } as React.CSSProperties
            }
          />
        </div>
      )}

      {/* Message and options float free above the orb — no card wrapping them,
          each element its own surface (FAB Greeting pattern). */}
      {/* No gap on the stack — spacing is set per element so the chip group
          can stay tight (6px) while the message and orb sit 12px away. */}
      {phase !== "chat" && (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {(phase === "typing" || phase === "done") && (
          <div
            className="max-w-[262px] rounded-2xl bg-white px-4 py-3.5 text-[13.5px] leading-snug"
            style={{
              color: INK,
              boxShadow: "0 4px 20px -4px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
              animation: `sonar-bubble ${EASE_MS}ms ${EASE} both`,
            }}
          >
            {SONAR_MSG.slice(0, typed)}
            {phase === "typing" && (
              <span style={{ animation: "sonar-cursor 1s step-end infinite" }}>|</span>
            )}
          </div>
        )}

        {phase === "done" && (
          <div className="flex flex-col items-end">
            {SONAR_OPTS.slice(0, chipsShown).map((opt, i) => (
              /* Each chip lives in a grid row that expands 0fr → 1fr, so the
                 stack grows into its new height instead of the message above
                 jumping up a whole row the moment a chip mounts. The gap sits
                 inside the clipped child so it expands with the row. */
              <div
                key={opt}
                className="grid"
                style={{ animation: `sonar-chip-slot ${EASE_MS}ms ${EASE} both` }}
              >
                {/* The gap lives inside the clipped row so it expands with it.
                    First chip carries the 12px from the message, the rest 6px
                    from each other. */}
                <div
                  className="overflow-hidden"
                  style={{ paddingTop: i === 0 ? GAP_BLOCK : GAP_CHIP }}
                >
                  <button
                    className="whitespace-nowrap rounded-full border bg-white px-4 py-2 text-[12.5px] font-medium transition-colors"
                    style={{
                      borderColor: PURPLE,
                      color: PURPLE,
                      boxShadow: "0 2px 10px -2px rgba(0,0,0,0.10)",
                      animation: `sonar-chip ${EASE_MS}ms ${EASE} both`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = CHIP_HOVER)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "white")}
                    /* Only "Chat with us" is wired up for now; the other two
                       are present but inert. */
                    onClick={opt === CHAT_OPT ? () => openChat(opt) : undefined}
                  >
                    {opt}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* orb — a complete ring track with a highlight sweeping around it, so
            the halo never reads as a cut-off arc. Both layers are masked to a
            true ring so they sit over any section background. */}
        <div
          className="relative flex size-[52px] shrink-0 items-center justify-center"
          style={{
            marginTop: GAP_BLOCK,
            animation: `sonar-orb-in ${ORB_ENTER_MS}ms cubic-bezier(0.22,1,0.36,1) both`,
          }}
        >
          {/* bloom — blurred copy of the arc, so the ring reads as lit */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: RING_SWEEP,
              filter: "blur(4px)",
              opacity: 0.75,
              animation: `sonar-spin ${RING_SPIN} linear infinite`,
              WebkitMaskImage: RING_MASK,
              maskImage: RING_MASK,
            }}
          />
          {/* full-circle track */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: RING_TRACK,
              WebkitMaskImage: RING_MASK,
              maskImage: RING_MASK,
            }}
          />
          {/* the arc */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: RING_SWEEP,
              animation: `sonar-spin ${RING_SPIN} linear infinite`,
              WebkitMaskImage: RING_MASK,
              maskImage: RING_MASK,
            }}
          />
          {/* specular — a soft sheen with a hot core riding the leading edge */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: RING_SPECULAR_WIDE,
              filter: "blur(1.5px)",
              animation: `sonar-spin ${RING_SPIN} linear infinite`,
              WebkitMaskImage: RING_MASK,
              maskImage: RING_MASK,
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: RING_SPECULAR_HOT,
              filter: "blur(0.5px) drop-shadow(0 0 5px rgba(255,255,255,0.9))",
              animation: `sonar-spin ${RING_SPIN} linear infinite`,
              WebkitMaskImage: RING_MASK,
              maskImage: RING_MASK,
            }}
          />
          <button
            aria-label="Open chat"
            className="relative z-10 size-11 overflow-hidden rounded-full"
            style={{ boxShadow: "0 3px 12px -3px rgba(0,0,0,0.22)" }}
            onClick={() => openChat()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/tars-logomark.png" alt="Tars" className="h-full w-full object-cover" />
          </button>
        </div>
      </div>
      )}
    </>
  );
}
