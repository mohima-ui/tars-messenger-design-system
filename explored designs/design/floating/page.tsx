"use client";

/* ── Floating Messenger ───────────────────────────────────────────────────
   A messenger with the messenger taken away.

   The docked panel is a room the visitor has to go into: it covers a third of
   the page, it has a door, and reading the site means closing it. This mode
   keeps the conversation and drops the room — the turns sit directly on the
   customer's page, the page stays readable behind them, and the visitor can do
   both at once.

   What has to be solved once the panel is gone:

   · Legibility. A panel guarantees a background; bare text does not, and the
     page underneath is whatever the customer built. Each variation below is a
     different answer to that, from none at all to a frosted column.

   · An ending. A panel's scroll has a top edge to hit. A floating column has
     to stop somewhere, and a hard cut looks like a rendering fault — so the
     column is masked, and the oldest turn dissolves instead of being sliced.

   · A place to type. Everything else can be transparent; the field cannot.
     It is the one element that has to look like it takes input. */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ArrowUp, Mic, RotateCcw, Sparkles, X } from "lucide-react";

/* The customer's own colour. Everything tinted here is mixed from it, so a
   different tenant is a different value on this line and nothing else. */
const ACCENT = "#120BF4";
const INK = "#16181D";
const INK_MUTE = "#5B6070";

/* The composer launcher's own pill, to the pixel. This mode does not get to
   invent a field: on a site running the composer launcher the field is already
   there before the conversation starts, and the whole idea is that the messages
   arrive above the thing the visitor was already looking at. A second, similar
   field would be a different component wearing its clothes. */
const PILL = { height: 64, radius: 32, pad: 8, sendPx: 44 };
const PILL_RING =
  "inset 0 0 0 1px rgba(15,17,26,0.06), 0 1px 2px rgba(15,17,26,0.10), 0 6px 16px rgba(15,17,26,0.12), 0 16px 40px rgba(15,17,26,0.18), 0 32px 80px rgba(15,17,26,0.12)";
/* The button launcher's, likewise — the square shape and 18px radius it rests
   at by default. */
const BUTTON_PX = 56;

/* ── the conversation ─────────────────────────────────────────────────────
   The same ecommerce thread the rest of the system demos, cut to the length a
   floating column can hold — this mode is read over the page rather than in
   front of it, so it shows the last few turns rather than the whole history. */
type Turn = { from: "ai" | "user"; text: string; chips?: string[] };

const THREAD: Turn[] = [
  {
    from: "ai",
    text: "You're reading about online payments — tell me what you sell and where, and I can say what taking payments would involve for you.",
    chips: ["Ecommerce", "Retail", "Not sure yet"],
  },
  { from: "user", text: "Ecommerce, mostly outside the US" },
  {
    from: "ai",
    text: "Got it. Global Payments can integrate into your existing checkout, so customers can pay without you building the payment infrastructure.",
  },
  { from: "user", text: "We already have a store live" },
  {
    from: "ai",
    text: "Then it's a matter of fitting the right setup to what you have. What would you most like to improve?",
    chips: ["More payment options", "Improve checkout", "Accept international"],
  },
];

/* Reading pace, not a fixed beat. A long turn holds the screen longer than a
   short one because it takes longer to read — the same rule the messenger's
   own typewriter follows. */
const WORD_MS = 34;
const FLOOR_MS = 900;
const words = (t: string) => t.trim().split(/\s+/).length;
const dwell = (t: string) => Math.max(FLOOR_MS, words(t) * WORD_MS);

/* ── the three answers to "what is behind the text" ───────────────────── */
type Launcher = "composer" | "button";
const LAUNCHERS: { id: Launcher; label: string; note: string }[] = [
  {
    id: "composer",
    label: "Composer",
    note: "The field is already on the page, so floating mode is only the messages arriving above it. Nothing new appears.",
  },
  {
    id: "button",
    label: "Button",
    note: "No field at rest — the small target the customer chose stays a button while the agent talks. Answer one of its suggestions and the button becomes the field, because that is the moment typing is the useful thing.",
  },
];

type Skin = "bare" | "veil" | "frosted";
const SKINS: { id: Skin; label: string; note: string }[] = [
  {
    id: "bare",
    label: "Bare",
    note: "Nothing behind the column. The lightest possible presence on the page — and the one that depends entirely on the bubbles carrying their own contrast.",
  },
  {
    id: "veil",
    label: "Veil",
    note: "A wash of the page's own white behind the column, strongest at the field and gone by the top. Buys legibility over artwork without drawing an edge anywhere.",
  },
  {
    id: "frosted",
    label: "Frosted",
    note: "The column blurs what is behind it. Most legible over anything, and the closest of the three to still being a panel.",
  },
];

/* ── surfaces ──────────────────────────────────────────────────────────── */

/* The agent's turn. White and lifted rather than tinted: out here the bubble is
   not being told apart from another bubble, it is being told apart from a
   website — and a shadow is what says "this is on top of the page" in a way no
   fill can. */
const aiBubble: CSSProperties = {
  background: "#FFFFFF",
  color: INK,
  boxShadow:
    "0 1px 2px rgba(15,17,26,0.06), 0 8px 20px -8px rgba(15,17,26,0.18), inset 0 0 0 1px rgba(15,17,26,0.05)",
};

/* The visitor's, in the tenant's colour. Solid rather than tinted, because a
   10% wash of anything over an unknown page is not a colour, it is whatever is
   underneath it. */
const userBubble: CSSProperties = {
  background: ACCENT,
  color: "#FFFFFF",
  boxShadow: "0 6px 16px -8px rgba(15,17,26,0.30)",
};

export default function FloatingMessengerLab() {
  const [skin, setSkin] = useState<Skin>("bare");
  /* Which launcher the site is running. It is not a style choice here — it
     decides where the field comes from, which is the only thing this mode has
     to answer differently for the two of them. */
  const [mode, setMode] = useState<Launcher>("composer");
  /* Whether the visitor has said anything yet. On the button launcher this is
     what turns the button into a field: until they answer, the small target the
     customer chose is still the right thing on the page. */
  const [replied, setReplied] = useState(false);
  /* How much of the thread has arrived. The turns land one after another rather
     than all at once, which is the only way to see the thing this mode is
     actually about: what happens to a message as it leaves the top. */
  const [shown, setShown] = useState(1);
  const [closed, setClosed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const replay = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setShown(1);
    setReplied(false);
    setClosed(false);
  }, []);
  /* Switching launcher restarts it: the two differ in what happens before the
     visitor answers, and that is the half already played. */
  const pick = (m: Launcher) => {
    setMode(m);
    replay();
  };

  /* The button launcher waits. The agent says its piece and stops, because the
     next turn in the script is the visitor's and they have not spoken — on the
     composer they can answer whenever they like, so it runs on. */
  const waiting = mode === "button" && !replied;
  const field = mode === "composer" || replied;

  useEffect(() => {
    if (waiting || shown >= THREAD.length) return;
    timer.current = setTimeout(
      () => setShown((n) => n + 1),
      dwell(THREAD[shown - 1].text),
    );
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [shown, waiting]);

  const turns = useMemo(() => THREAD.slice(0, shown), [shown]);
  const skinNote = SKINS.find((s) => s.id === skin)?.note;

  return (
    <div className="relative min-h-screen bg-white">
      {/* ── the customer's page ──
          A real screenshot rather than a mock, and scrollable, because the
          claim this mode makes is that you can read the site while the
          conversation is open. That is only testable against a page that
          actually scrolls. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/gp-hero.png"
        alt=""
        className="block w-full select-none"
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/gp-hero.png"
        alt=""
        className="block w-full select-none opacity-90"
        draggable={false}
      />

      {/* ── the control strip ──
          A lens on the demo, not part of it. Fixed to the corner the messenger
          is not in, so nothing it says lands on top of the thing it is
          describing. */}
      <div className="fixed left-6 top-6 z-50 w-[280px] rounded-2xl bg-white/95 p-4 shadow-[0_12px_40px_-8px_rgba(15,17,26,0.25)] backdrop-blur">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8A8A]">
          Floating messenger
        </span>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {SKINS.map((o) => (
            <button
              key={o.id}
              onClick={() => setSkin(o.id)}
              className={`rounded-full px-3 py-1 text-[12px] transition-colors ${
                skin === o.id
                  ? "bg-[#F1EFFF] font-semibold text-[#3B21C9]"
                  : "font-medium text-[#666] hover:bg-[#F4F4F5] hover:text-[#333]"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-snug text-[#8A8A8A]">
          {skinNote}
        </p>
        <div className="mt-3 border-t border-[#F0F0F1] pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#8A8A8A]">
            Launcher
          </span>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {LAUNCHERS.map((o) => (
              <button
                key={o.id}
                onClick={() => pick(o.id)}
                className={`rounded-full px-3 py-1 text-[12px] transition-colors ${
                  mode === o.id
                    ? "bg-[#F1EFFF] font-semibold text-[#3B21C9]"
                    : "font-medium text-[#666] hover:bg-[#F4F4F5] hover:text-[#333]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-snug text-[#8A8A8A]">
            {LAUNCHERS.find((o) => o.id === mode)?.note}
          </p>
        </div>
        <button
          onClick={replay}
          className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-[#3B21C9] transition-opacity hover:opacity-70"
        >
          <RotateCcw className="size-3.5" strokeWidth={2} />
          Replay
        </button>
      </div>

      {!closed && (
        <div
          className="fixed bottom-6 right-6 z-40 flex w-[380px] max-w-[calc(100vw-32px)] flex-col justify-end"
          /* Tall enough to hold a few turns, short enough that the page is
             still the thing on screen. The column grows upward from the field,
             so this is a ceiling rather than a height. */
          style={{ maxHeight: "min(70vh, 560px)" }}
        >
          {/* ── what sits behind the words ──
              Behind the messages only, never behind the field — the field has
              its own surface and would be double-painted. */}
          {skin !== "bare" && (
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-x-[-14px] top-[-14px] rounded-[28px] ${
                skin === "frosted" ? "backdrop-blur-md" : ""
              }`}
              /* Stops above whatever is at the foot — the pill is 64 tall, the
                 button 56, and a backdrop that ran under either would be
                 painting behind a surface that is already opaque. */
              style={
                skin === "frosted"
                  ? {
                      bottom: (field ? PILL.height : BUTTON_PX) + 12,
                      background: "rgba(255,255,255,0.55)",
                      boxShadow: "inset 0 0 0 1px rgba(15,17,26,0.06)",
                      /* Faded at the top like the messages it sits behind, or
                         the blur would end on a hard line halfway up the
                         page — the one edge this mode exists to avoid. */
                      WebkitMaskImage:
                        "linear-gradient(to bottom, transparent 0, #000 96px)",
                      maskImage:
                        "linear-gradient(to bottom, transparent 0, #000 96px)",
                    }
                  : {
                      bottom: (field ? PILL.height : BUTTON_PX) + 12,
                      background:
                        "linear-gradient(to top, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.72) 45%, rgba(255,255,255,0) 100%)",
                    }
              }
            />
          )}

          {/* ── the conversation ──
              Justified to the end, so a short thread sits on the field and a
              long one grows up the page rather than down it. */}
          <div
            className="relative flex min-h-0 flex-col justify-end gap-2.5 overflow-hidden px-1 pb-3"
            style={{
              /* The whole point. A column with no panel has no top edge to
                 stop at, so the oldest turn is dissolved rather than cut —
                 anything else reads as a rendering fault, and a fade is also
                 what tells the visitor there is more above. */
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0, rgba(0,0,0,0.25) 34px, #000 108px)",
              maskImage:
                "linear-gradient(to bottom, transparent 0, rgba(0,0,0,0.25) 34px, #000 108px)",
            }}
          >
            {turns.map((t, i) => (
              <div
                key={i}
                className={`flex ${t.from === "ai" ? "justify-start" : "justify-end"}`}
                style={{
                  /* Rises into place. Every turn above it is pushed up by the
                     same amount at the same time, which is what makes the top
                     one leave — the movement is the layout, not an effect. */
                  animation:
                    "float-in 380ms cubic-bezier(0.16, 1, 0.3, 1) both",
                }}
              >
                <span
                  className={`w-fit max-w-[88%] whitespace-pre-wrap px-4 py-2.5 text-[14px] leading-relaxed ${
                    t.from === "ai"
                      ? "rounded-[18px] rounded-bl-[6px]"
                      : "rounded-[18px] rounded-br-[6px]"
                  }`}
                  style={t.from === "ai" ? aiBubble : userBubble}
                >
                  {t.text}
                </span>
              </div>
            ))}

            {/* The last turn's own options, under it rather than in a rail —
                out here there is no panel edge to pin a row to, and chips that
                float on their own line read as part of the message that asked
                the question. */}
            {turns.at(-1)?.chips && (
              <div className="flex flex-wrap gap-2 pt-0.5">
                {turns.at(-1)!.chips!.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => {
                      setReplied(true);
                      setShown((n) => Math.min(n + 1, THREAD.length));
                    }}
                    className="rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium transition-transform hover:scale-[1.03]"
                    style={{
                      color: ACCENT,
                      boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${ACCENT} 35%, transparent), 0 6px 16px -8px rgba(15,17,26,0.24)`,
                      animation: `float-in 380ms cubic-bezier(0.16, 1, 0.3, 1) ${
                        120 + i * 70
                      }ms both`,
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── the field, or the button that becomes it ──
              On the composer launcher this pill was already on the page before
              a word was said, so floating mode adds nothing here at all — the
              messages simply arrive above the thing the visitor was already
              looking at. It is the composer launcher's own geometry to the
              pixel rather than a field drawn to look like it, because a second
              similar field is a different component wearing its clothes.

              On the button launcher there is nothing to type into. The button
              stays a button while the agent is talking — that small target is
              what the customer chose, and nothing has happened yet to overrule
              it. The moment the visitor answers one of its suggestions they are
              in a conversation, and the button gives way to the field in the
              same corner. Earned, not assumed. */}
          {field ? (
            <div
              className="relative flex items-center bg-white"
              style={{
                height: PILL.height,
                borderRadius: PILL.radius,
                padding: PILL.pad,
                boxShadow: PILL_RING,
                animation: replied
                  ? "float-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both"
                  : undefined,
              }}
            >
              <input
                placeholder="Ask me anything…"
                className="min-w-0 flex-1 bg-transparent px-3 text-[14px] font-light tracking-[0.01em] outline-none placeholder:text-[#9CA3AF]"
                style={{ color: INK }}
              />
              <button
                aria-label="Voice"
                className="grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-black/5"
                style={{ color: INK_MUTE }}
              >
                <Mic className="size-[18px]" strokeWidth={1.75} />
              </button>
              <button
                aria-label="Send"
                className="flex shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-90"
                style={{
                  width: PILL.sendPx,
                  height: PILL.sendPx,
                  background: ACCENT,
                }}
              >
                <ArrowUp className="size-[18px]" strokeWidth={2.4} />
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                aria-label="Open chat"
                onClick={() => setReplied(true)}
                className="grid place-items-center text-white transition-transform hover:-translate-y-0.5"
                style={{
                  width: BUTTON_PX,
                  height: BUTTON_PX,
                  borderRadius: 18,
                  background: ACCENT,
                  boxShadow:
                    "0 10px 26px -10px rgba(15,17,26,0.45), 0 2px 5px rgba(15,17,26,0.12)",
                }}
              >
                <Sparkles className="size-6" strokeWidth={1.6} />
              </button>
            </div>
          )}

          {/* Closing is the only chrome this mode keeps. Without a header there
              is nowhere else to put it, and a conversation on someone's page
              that cannot be sent away is not less obtrusive than a panel — it
              is more. */}
          <button
            onClick={() => setClosed(true)}
            aria-label="Close"
            className="absolute -top-2 right-0 grid size-7 place-items-center rounded-full bg-white transition-transform hover:scale-105"
            style={{
              color: INK_MUTE,
              boxShadow:
                "0 1px 2px rgba(15,17,26,0.10), inset 0 0 0 1px rgba(15,17,26,0.07)",
            }}
          >
            <X className="size-3.5" strokeWidth={2.2} />
          </button>
        </div>
      )}

      {closed && (
        <button
          onClick={replay}
          className="fixed bottom-6 right-6 z-40 grid size-14 place-items-center rounded-full text-white shadow-[0_10px_30px_-10px_rgba(15,17,26,0.45)]"
          style={{ background: ACCENT }}
          aria-label="Open chat"
        >
          <ArrowUp className="size-5" strokeWidth={2.4} />
        </button>
      )}

      {/* Declared here rather than in globals.css: a keyframe named only from an
          inline style is one Tailwind cannot see referenced, and it strips what
          it cannot see. */}
      <style>{`
        @keyframes float-in {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
